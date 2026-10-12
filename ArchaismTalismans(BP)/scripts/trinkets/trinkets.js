import { world, system, ItemStack } from '@minecraft/server'
import { tagImmunities } from "../lib/tagImmunities";
import { negativeEffects } from "../lib/negativeEffects";
import { eventPlayer } from "../lib/eventPlayer";
import { repair } from "../lib/Frepair";
import { archaismTalismans } from "./archaism";
import { doriosTrinkets } from "./dorios";
import { amuletsVanilla } from "./vanilla";
import { cataclysmical } from "./cataclysmical";
import { Euforia } from "./Euforia";
import { getPassiveEffects } from "./passiveEffects";
import { getOrnateStats } from "./ornate_stats";

const invPets = [
    { identifier: 'ip:chicken_pet', slot: 'amulet' },
    { identifier: 'ip:slime_pet', slot: 'amulet', fallingD: -0.5 },
    { identifier: 'ip:blaze_pet', slot: 'amulet', attack: 1 },
    { identifier: 'ip:axolotl_pet', slot: 'amulet' },
    { identifier: 'ip:breeze_pet', slot: 'amulet' },
    { identifier: 'ip:squid_pet', slot: 'amulet', waterSpeed: 0.01 },
    { identifier: 'ip:glow_squid_pet', slot: 'amulet' },
    { identifier: 'ip:nightmare_pet', slot: 'amulet', attack: 2 },
    { identifier: 'ip:camel_pet', slot: 'amulet' },
    { identifier: 'ip:wither_pet', slot: 'amulet' },
    { identifier: 'ip:nautilus_pet', slot: 'amulet' }
]
const trinkets = doriosTrinkets.concat(archaismTalismans, amuletsVanilla, Euforia, cataclysmical, invPets)

world.afterEvents.worldInitialize.subscribe(() => {
    system.runInterval(() => {
        let start = Date.now()
        let players = world.getAllPlayers()
        players.forEach(player => {
        giveEffect(player, getPassiveEffects(player), player);
            if (player.hasTag('twm:repair_talis_necklace') || player.hasTag('twm:mender_pendant_necklace')) {
                repair(player)
            }
        });
        // world.sendMessage(`${Date.now() - start}`)
    }, 50)
})
world.beforeEvents.effectAdd.subscribe(e => {
    const { effectType, entity } = e;
    if (entity.typeId != 'minecraft:player') return;
    for (const [tag, immuneEffects] of Object.entries(tagImmunities)) {
        if (entity?.hasTag(tag) && immuneEffects.some(effect => effectType.includes(effect))) {
            e.duration = -1;
        }
    }
})
system.runInterval(() => {
  for (const player of world.getPlayers()) {
    const currentEffects = player.getEffects();
    if (!currentEffects || currentEffects.length === 0) continue;

    for (const effect of currentEffects) {
      const effectId = effect.typeId;

      for (const [tag, immuneEffects] of Object.entries(tagImmunities)) {
        if (!player.hasTag(tag)) continue;
        if (!immuneEffects.includes(effectId)) continue;
        try {
          player.removeEffect(effectId);
        } catch (error) {
          console.warn(`[Inmunidad] Error al quitar efecto ${effectId} de ${player.name}:`, error);
        }
      }
    }
  }
}, 10);

world.afterEvents.entityHurt.subscribe(e => {
    const { hurtEntity, damageSource, damage } = e

    if (hurtEntity?.typeId == 'minecraft:player') {

        if (hurtEntity.hasTag('twm:rush_of_fear_necklace') && !hurtEntity.hasTag('rush_of_fear_on')) {
            hurtEntity.addTag('rush_of_fear_on')
            abilities(hurtEntity)
            system.runTimeout(() => {
                hurtEntity.removeTag('rush_of_fear_on')
                abilities(hurtEntity)
            }, 40)
        }
    }
})

function giveEffect(player, passiveEffects) {
    const tags = player.getTags();
    const effects = {};
    const effectTimes = {};

    for (const [tag, effectList] of Object.entries(passiveEffects)) {
        if (!player.hasTag(tag)) continue;
        for (const { effect, level, effectTime, condition } of effectList) {
            if (!condition) continue;
            let immune = false;
            for (const activeTag of tags) {
                const immuneEffects = tagImmunities[activeTag];
                if (immuneEffects && immuneEffects.includes(effect)) {
                    immune = true;
                    break;
                }
            }
            if (immune) continue;
            effects[effect] = (effects[effect] || 0) + level;
            effectTimes[effect] = Math.min(effectTimes[effect] ?? Infinity, effectTime);
        }
    }
    const conflictingEffects = [
        { effect1: 'poison', effect2: 'regeneration' },
        { effect1: 'weakness', effect2: 'strength' },
        { effect1: 'mining_fatigue', effect2: 'haste' },
        { effect1: 'slowness', effect2: 'speed' },
        { effect1: 'water_breathing', effect2: 'fire_resistance' },
        { effect1: 'hunger', effect2: 'resistance' },
        { effect1: 'blindness', effect2: 'night_vision' }
    ];
    conflictingEffects.forEach(({ effect1, effect2 }) => {
        const level1 = effects[effect1] || 0;
        const level2 = effects[effect2] || 0;
        if (level1 > 0 && level2 > 0) {
            if (level1 === level2) {
                delete effects[effect1];
                delete effects[effect2];
                delete effectTimes[effect1];
                delete effectTimes[effect2];
            } else {
                const stronger = level1 > level2 ? effect1 : effect2;
                const weaker = level1 > level2 ? effect2 : effect1;
                effects[stronger] = Math.abs(level1 - level2);
                delete effects[weaker];
                delete effectTimes[weaker];
            }
        }
    });
    if (effects['resistance'] !== undefined) {effects['resistance'] = Math.min(effects['resistance'], 4)}
    if (effects['regeneration'] !== undefined) {effects['regeneration'] = Math.min(effects['regeneration'], 4)}
    for (const [ef, lvl] of Object.entries(effects)) {
        const time = effectTimes[ef] || 20;
        try {
            player.addEffect(ef, time, { amplifier: lvl - 1, showParticles: false });
        } catch (e) {
            console.warn(`[giveEffect] ${ef} no aplicado a ${player.name}:`, e);
        }
    }
}
function getInitialStats(player) {
    return {
        health: 20,
        attack: 1,
        speed: 0.1 + (player.hasTag('rush_of_fear_on') ? 0.1 : 0),
        waterSpeed: 0.02,
        lavaSpeed: 0.01,
        knockback: 0,

        explosionD: 1,
        fallingD: 1,
        fireD: 1,
        magicD: 1,
        lightningD: 1,

        meleeD: 1,
        projectileD: 1,
        defense: 1,
    };
}
const minValues = {
    health: 2,
    speed: 0.05,
    attack: -10,
    waterSpeed: 0.002,
    lavaSpeed: 0.002,
    knockback: 0,

    explosionD: 0,
    fallingD: 0,
    fireD: 0,
    magicD: 0,
    lightningD: 0,

    meleeD: 0.5,
    projectileD: 0.5,
    defense: 0.5,
};
function updateDefenseTags(player, stats) {
    const tags = player.getTags();
    for (const [stat, baseValue] of Object.entries(defenseStats)) {
        const prefix = `trinkets:${stat}`;
        for (const tag of tags) { if (tag.startsWith(prefix)) { player.removeTag(tag) } }
        const value = stats[stat];
        if (value !== baseValue) { player.addTag(`${prefix}${value}`) }
    }
}
const defenseStats = {
    explosionD: 1,
    fallingD: 1,
    fireD: 1,
    magicD: 1,
    lightningD: 1,
    meleeD: 1,
    projectileD: 1,
    defense: 1
};
function formatStatDisplay(statName, value, minValue = undefined) {
    const round = (v) => Math.round(v * 100) / 100;

    const asPercent = (v, forceColor, isMinimum) => {
        const rounded = Math.round(v);
        if (isMinimum) return `§8${rounded}'/.`;
        if (forceColor) return `§l§u+§r§u${rounded}'/.`;
        return rounded > 0 ? `§l§a+§r§a${rounded}'/.` : rounded < 0 ? `§c${rounded}'/.` : `§7±0'/.`;
    };

    const isMin = minValue !== undefined && value === minValue;

    switch (statName) {
        case 'health': {
            const hearts = round(value / 2);
            const color = isMin ? '§8' : '§c';
            return `${color}${hearts}`;
        }

        case 'attack': {
            const color = isMin ? '§8' : value < 0 ? '§c' : '§b';
            return `${color}${round(value)}`;
        }

        case 'speed': {
            const percent = Math.round(((value - 0.1) / 0.01) * 10);
            return `${asPercent(percent, false, isMin)}`;
        }

        case 'waterSpeed': {
            const base = 20;
            const actual = Math.round(value * 1000);
            const delta = actual - base;
            const percent = delta * 5;
            return `${asPercent(percent, false, isMin)}`;
        }

        case 'lavaSpeed': {
            const base = 10;
            const actual = Math.round(value * 1000);
            const delta = actual - base;
            const percent = delta * 10;
            return `${asPercent(percent, false, isMin)}`;
        }

        case 'knockback': {
            const color = '§g';
            return `${color}${round(value)}`;
        }
        case 'defense': {
            const percent = Math.round(((1 - value) / 0.05) * 5);
            const isCapped = percent === 50;
            return `${asPercent(percent, isCapped, false)}`;
        }

        case 'meleeD': {
            const percent = Math.round(((1 - value) / 0.05) * 5);
            const isCapped = percent === 50;
            return `${asPercent(percent, isCapped, false)}`;
        }
        case 'projectileD': {
            const percent = Math.round(((1 - value) / 0.05) * 5);
            const isCapped = percent === 50;
            return `${asPercent(percent, isCapped, false)}`;
        }
        case 'magicD': {
            const percent = Math.round(((1 - value) / 0.05) * 5);
            const isCapped = percent === 0;
            return `${asPercent(percent, isCapped, false)}`;
        }
        case 'fallingD': {
            const percent = Math.round(((1 - value) / 0.05) * 5);
            const isCapped = percent === 0;
            return `${asPercent(percent, isCapped, false)}`;
        }
        case 'fireD': {
            const percent = Math.round(((1 - value) / 0.05) * 5);
            const isCapped = percent === 0;
            return `${asPercent(percent, isCapped, false)}`;
        }
        case 'explosionD': {
            const percent = Math.round(((1 - value) / 0.05) * 5);
            const isCapped = percent === 0;
            return `${asPercent(percent, isCapped, false)}`;
        }
        case 'lightningD': {
            const percent = Math.round(((1 - value) / 0.05) * 5);
            const isCapped = percent === 0;
            return `${asPercent(percent, isCapped, false)}`;
        }

        default:
            return `§f${round(value)} ${statName}`;
    }
}
function getPlayerStats(player) {
    const tags = player.getTags();
    const initialValues = getInitialStats(player);
    const baseStats = { ...initialValues };

    for (const tag of tags) {
        const idx = tag.lastIndexOf('_');
        if (idx === -1) continue;
        const identifier = tag.slice(0, idx);
        const trinket = trinkets.find(t => t.identifier === identifier);
        if (!trinket) continue;
        for (const key of Object.keys(baseStats)) {
            if (typeof trinket[key] === "number") { 
                baseStats[key] += trinket[key]
            baseStats[key] = Math.round(baseStats[key] * 1000) / 1000;
            }
        }
    }
    const ornateStats = getOrnateStats(player);
    for (const key of Object.keys(ornateStats)) {
        if (typeof ornateStats[key] === "number") {
            if (baseStats[key] === undefined) { baseStats[key] = 0 }
            baseStats[key] += ornateStats[key];
            baseStats[key] = Math.round(baseStats[key] * 1000) / 1000;
        }
    }
    for (const key in baseStats) { baseStats[key] = Math.max(baseStats[key], minValues[key]) }
    return baseStats;
}
function showPlayerStats(player) {
    const stats = getPlayerStats(player);
    const currentStats = JSON.stringify(stats);
    const lastStats = player.getDynamicProperty("last_stats");
    if (lastStats === currentStats) return;
    player.setDynamicProperty("last_stats", currentStats);

    const initialValues = getInitialStats(player);

    const visual = [];
    for (const [key, val] of Object.entries(stats)) {
        const baseVal = initialValues[key];
        const minVal = minValues[key];
        if (Math.abs(val - baseVal) >= 0.0001) { visual.push(formatStatDisplay(key, val, minVal)) }
    }
    const line = visual.join('§7 & ');
    const escaped = line.replace(/"/g, '\\"');

    player.onScreenDisplay.setActionBar(`${escaped}`);
}
const resetProperties = {
    'arena:doble_edged_charm': 'doble_edged_hits',
    'arena:archaic_triple_edged_sword_archaiccharm': 'triple_edged_hits',
    'arena:nefrite_edged_sword_talisman': 'edged_hits',
    'arena:complexion_afinity_bracelet_charm': 'complexion_hits',
    'arena:dream_tatters_of_the_king_body': 'tatters_king',
    'arena:cherry_sword_charm': 'cherry_sword_hits',
    'arena:conscious_star _archaiccharm': 'conscious_hits',
    'arena:archaic_reckless_archer_archaiccharm': 'reckless_hits',

    'arena:flesh_fnuckles_gauntlet': 'knuckles_reflect',
    'arena:flesh_fnuckles_gauntletleft': 'knuckles_reflect',
    'arena:hero_shield_charm': 'heroshield',

    'arena:iron_sculk_ring_ring': 'arena_sculkilling',
    'arena:golden_sculk_ring_ring': 'arena_sculkilling',
    'arena:prismarine_sculk_ring_ring': 'arena_sculkilling',
    'arena:netherite_sculk_ring_ring': 'arena_sculkilling',
    'arena:fallen_sculk_ring_ring': 'arena_sculkilling'
};
function abilities(source) {
    const tags = source.getTags();
    if (tags.length === 0) return;
    const currentTags = new Set(source.getTags());
    let previousTags = [];
    try { const raw = source.getDynamicProperty("last_tags");
        if (typeof raw === "string") { previousTags = JSON.parse(raw)};
    } catch (e) { previousTags = [] };        
    let event = undefined;
        for (const [tag, events] of Object.entries(eventPlayer)) {
            const hadTag = previousTags.includes(tag);
            const hasTag = currentTags.has(tag);
            if (hasTag) {
                event = events.on;
            } else if (hadTag && events.off?.length) {
                events.off.forEach(ev => source.triggerEvent(ev));
            }
        }

    if (event) { event.forEach(ev => source.triggerEvent(ev)) }
    const defenseKeys = new Set([ "explosionD", "fallingD", "fireD", "magicD", "lightningD", "meleeD", "projectileD", "defense" ]);
    const stats = getPlayerStats(source);
    let delay = 0;
    for (const [key, value] of Object.entries(stats)) {
        if (defenseKeys.has(key)) continue;
        delay++;
        const safeValue = value.toString();
        system.runTimeout(() => { source.triggerEvent(`minecraft:${key}${safeValue}`) }, delay);
    }
    updateDefenseTags(source, stats);
    source.setDynamicProperty("last_tags", JSON.stringify([...currentTags]));
    if (source.hasTag('twm:blood_pact_archaiccharm')) { source.removeEffect('regeneration') }
    for (const [tag, property] of Object.entries(resetProperties)) {
        if (!source.hasTag(tag)) { source.setDynamicProperty(property, 0) }
    }
    if (!source.hasTag('arena:conscious_star_archaiccharm')) { source.removeTag('arena:conscious_charge') }
    if (!source.hasTag('arena:demon_mask_face')) {
        source.setDynamicProperty('demon_mask_hits', 0);
        source.removeTag('mask9_ready');
    }
    if (!source.hasTag('arena:nights_devouring_mask_face')) {
        source.setDynamicProperty('arena:nights_without_sleep', 0);
        source.removeTag('arena:night_counted');
    }
}

export { trinkets, abilities, showPlayerStats };