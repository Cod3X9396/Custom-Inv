import { system } from '@minecraft/server'
export function handlePlayerAsVictim(e) {
    const { hurtEntity, damageSource, damage } = e;

    if (hurtEntity?.typeId !== 'minecraft:player') return;
    // hurtEntity.sendMessage(`<Hamleth Log> ${damageSource.cause}`)
    const attacker = damageSource.damagingEntity;
    if (hurtEntity.hasTag('arena:cursed_active')) return;

    const tags = new Set(hurtEntity.getTags());
    const healthComp = hurtEntity.getComponent('minecraft:health');
    const health = healthComp.currentValue;
    const headItem = hurtEntity.getComponent('equippable')?.getEquipment('Head');
    const chestItem = hurtEntity.getComponent('equippable')?.getEquipment('Chest');
    const legstItem = hurtEntity.getComponent('equippable')?.getEquipment('Legs');
    const feettItem = hurtEntity.getComponent('equippable')?.getEquipment('Feet');
    const offHandItem = hurtEntity.getComponent('equippable')?.getEquipment('Offhand');
    const { x, y, z } = hurtEntity.location;
    const dim = hurtEntity.dimension;
    let spikesMultiplier = 0;
    let spikesFlat = 0;
    let evasionChance = 0;
    let damageXP = 0;
    let armorSetonfire = 0;

    if (tags.has('arena:blaze_skull_mask_face')) { attacker?.setOnFire(5) }
    if (tags.has('twm:voodoo_doll')) {
        healthComp.setCurrentValue(health + damage * 0.1);
        spikesMultiplier += 0.1
    }

    if (chestItem?.typeId === 'arena:alpha_hemlock_chestplate' && !hurtEntity.hasTag('hemlockHit') && hurtEntity.getComponent('minecraft:health').currentValue <= 3) {
        hurtEntity.addEffect('resistance', 40, { amplifier: 4, showParticles: false });
        hurtEntity.addTag('hemlockHit')
        hurtEntity.triggerEvent(`minecraft:knockback2`);
        hurtEntity.playAnimation("animation.arena_hemlock.take_damage", {stopExpression: "query.any_animation_finished" });
        hurtEntity.dimension.spawnParticle("arena:hemlock_particle", { x, y, z });
        hurtEntity.dimension.spawnParticle("arena:hemlock_steady", { x, y, z });
        system.runTimeout(() => {
            for (let i = 0; i < 3; i++) { system.runTimeout(() => { hurtEntity.dimension.spawnParticle("minecraft:knockback_roar_particle", { x, y: y + 2.3, z })}, i * 2) }
            const nearbyEntities = hurtEntity.dimension.getEntities({ location: hurtEntity.location, minDistance: 1, maxDistance: 7, excludeTypes: ["minecraft:item", "minecraft:xp_orb"] });
            system.runTimeout(() => { hurtEntity.triggerEvent(`minecraft:knockback0`)}, 10);
            for (const entity of nearbyEntities) {
                const { x, y, z } = entity.location;
                entity?.applyDamage(20, { cause: "magic", damagingEntity: hurtEntity });
                entity.dimension.spawnParticle("arena:bleeding", { x, y: y + 1, z });
                if (entity.typeId === "minecraft:player") { entity.playSound("random.explode", entity.location) }
            }
        }, 30);
    }
    if (hurtEntity.hasTag('hemlockHit') && hurtEntity.getComponent('minecraft:health').currentValue >= 10) {
        hurtEntity.removeTag("hemlockHit");
    }
    const armorPieces = [ headItem?.typeId, chestItem?.typeId, legstItem?.typeId, feettItem?.typeId ];

    for (const piece of armorPieces) {
      if (!piece) continue;
      if (piece.startsWith("arena:marble_") && attacker?.matches({ families: ["monster"] })) { spikesMultiplier += 0.15 }
      if (piece.startsWith("arena:ganma_hemlock_")) { spikesMultiplier += 0.15 }
      if (piece.startsWith("arena:stigma_hemlock_")) {
        damageXP += 0.5;
        armorSetonfire += 1;
        spikesMultiplier += 0.3;
      }
      if (piece.startsWith("arena:alpha_hemlock_")) {
        damageXP += 0.75;
        armorSetonfire += 1;
        spikesMultiplier += 0.5;
      }
      if (piece.startsWith("arena:fallen_marble_")) { evasionChance -= 3 }
    }
    if (tags.has('arena:archaic_incript_paper_archaiccharm')) { damageXP += 0.25 }
    if (damageXP > 0) { hurtEntity?.addExperience(Math.floor(damage * damageXP))}
    if (armorSetonfire > 0) { attacker?.setOnFire(armorSetonfire)}

    if (tags.has('arena:archaic_blessed_shield_archaiccharm') && Math.ceil(Math.random() * 100) <= 15 && offHandItem?.typeId == 'minecraft:shield') { spikesFlat += 10 }
    if (tags.has('arena:archaic_hemlock_shield_archaiccharm') && Math.ceil(Math.random() * 100) <= 15 && offHandItem?.typeId == 'minecraft:shield') { spikesFlat += 12 }
    if (tags.has('arena:cursed_shield_archaiccharm') && Math.ceil(Math.random() * 100) <= 15 && attacker?.matches({ families: [ "player" ]}) && offHandItem?.typeId == 'minecraft:shield') {
        spikesFlat += 15
        attacker?.addEffect('slowness', 100, { amplifier: 1, showParticles: true });
    }
    if (tags.has('arena:archaic_sacret_heart_archaiccharm')) {
        healthComp.setCurrentValue(health + damage * 0.25);
        spikesMultiplier += 0.5
    }
    if (tags.has('g:bedrock_amulet_amulet') && Math.ceil(Math.random() * 100) <= 20) {
        spikesMultiplier += 0.8
    }
    const spikesDamageMap = {
        'arena:iron_spikes_earring_earring': 0.05,
        'arena:golden_spikes_earring_earring': 0.1,
        'arena:prismarine_spikes_earring_earring': 0.15,
        'arena:netherite_spikes_earring_earring': 0.2,
        'arena:fallen_spikes_earring_earring': 0.25,
        'arena:pure_marble_spikes_earring_earring': 0.3,
        'arena:iron_spikes_earring_earringdown': 0.05,
        'arena:golden_spikes_earring_earringdown': 0.1,
        'arena:prismarine_spikes_earring_earringdown': 0.15,
        'arena:netherite_spikes_earring_earringdown': 0.2,
        'arena:fallen_spikes_earring_earringdown': 0.25,
        'arena:pure_marble_spikes_earring_earringdown': 0.3,
        'arena:thorn_pendant_necklace': 0.25,
        'arena:extracted_heart_talisman': 0.25,
    };

    if (tags.has('arena:sacronkaiden_doll_doll')) { spikesFlat += 3 }
    for (const [tag, multiplier] of Object.entries(spikesDamageMap)) {
        if (tags.has(tag)) { spikesMultiplier += multiplier; }
    }
    if ((damageSource.cause == 'entityAttack' || damageSource.cause == 'projectile') && (spikesMultiplier > 0 || spikesFlat > 0)) { attacker?.applyDamage((damage * spikesMultiplier) + spikesFlat, { cause: "entityAttack", damagingEntity: hurtEntity }); }

    if (tags.has('new:ambar_totem_charm')) { hurtEntity.addEffect('health_boost', 330, { amplifier: 1, showParticles: false }) }
    if (tags.has('arena:sighthood_body') && attacker?.matches({ families: [ "undead" ]})) { attacker?.setOnFire(4) }
    if (tags.has('arena:nighthood_body') && attacker?.matches({ families: [ "player" ]})) { attacker?.setOnFire(4) }

    const entities = hurtEntity.dimension.getEntities({ location: hurtEntity.location, minDistance: 1, maxDistance: 5, excludeTypes: ["minecraft:item", "minecraft:xp_orb"], excludeFamilies: [ "inanimate", "villager" ] });
    if (attacker && tags.has('arena:end_of_the_time_charm')) {
        for (const entity of entities) {
            const { x, y, z } = entity.location;
            entity.addEffect('slowness', 80, { amplifier: 1, showParticles: true });
        }
    }
    if (attacker && tags.has('arena:sculk_belt_body')) {
        for (const entity of entities) {
            const isPlayer = entity.typeId === "minecraft:player";
            const isTamed = entity.hasComponent('minecraft:is_tamed');
            const isMonster = entity.matches({ families: ["monster"] });
            if (isTamed || isPlayer) { entity.addEffect('resistance', 150, { amplifier: 0, showParticles: true }) }
            if (isPlayer) {
                entity.addExperience(-20);
                entity.playSound("dig.soul_sand");
                hurtEntity.addExperience(-20);
                hurtEntity.playSound("dig.soul_sand");
            }
            if (isMonster) {
                entity.addEffect('slowness', 200, { amplifier: 0, showParticles: true });
                entity.addEffect('weakness', 200, { amplifier: 0, showParticles: true });
            }
        }
    }
    if (attacker && tags.has("arena:shrink_impressions_bracelet_charm")) {
        let shrinkHits2 = hurtEntity.getDynamicProperty('arena:shrinkHits') ?? 0;
        shrinkHits2++;
        hurtEntity.setDynamicProperty('arena:shrinkHits', shrinkHits2);
        if (hurtEntity.getDynamicProperty('arena:shrinkHits') >= 6) {
            hurtEntity.addEffect("resistance", 80, { amplifier: 1, showParticles: false });
            hurtEntity.setDynamicProperty('arena:shrinkHits', 0);
        }
    }
    const EvasionChanceMap = {
        'arena:deformed_cross_talisman': 15,
        'twm:strong_ender_ring_witherring': 10,
        'twm:strong_ender_ring_witherringdown': 10,
    };
    for (const [tag, chance] of Object.entries(EvasionChanceMap)) {
        if (tags.has(tag)) { evasionChance += chance; }
    }
    if (evasionChance > 0 && Math.ceil(Math.random() * 100) <= evasionChance) { 
        evasion(hurtEntity);
        healthComp.setCurrentValue(health + damage);
    }

    const damagecauses = ['fire', 'lava', 'fireTick', 'fall'];
    if ((tags.has('arena:chorus_totem_talisman') || tags.has('arena:ethereal_sight_mask_face') || tags.has('arena:feared_end_hat_face')) && !damagecauses.includes(damageSource.cause)) {
        evasion(hurtEntity);
    }
    if (tags.has('eu:ender_ring_ring') && damage <= 15) {
        evasion(hurtEntity);
    }
    if (tags.has('arena:ethereal_sight_mask_face') || tags.has('arena:feared_end_hat_face')) {
        evasiveFire(hurtEntity, damageSource);
    }

    const damagecauseprojectile = ['projectile'];
    if (tags.has('arena:ethereal_sight_mask_face') && damagecauseprojectile.includes(damageSource.cause)) {
        healthComp.setCurrentValue(health + damage);
    }
    if (tags.has('arena:wither_mask_face') && damagecauseprojectile.includes(damageSource.cause) && hurtEntity.getComponent('minecraft:health').currentValue <= 10 ? -1 : 0) {
        healthComp.setCurrentValue(health + damage);
    }
    const activeEffects = {
        'arena:amethyst_earring_jelewer_earring': [ { effect: 'slowness', level: 1, condition: 1, effectTime: 120 } ],
        'arena:crimsom_earring_jelewer_earring': [ { effect: 'poison', level: 1, condition: 1, effectTime: 120 } ],
        'arena:crimsom_amethyst_earring_jelewer_earring': [ { effect: 'weakness', level: 1, condition: 1, effectTime: 120 } ],
        'arena:amethyst_earring_jelewer_earringdown': [ { effect: 'slowness', level: 1, condition: 1, effectTime: 120 } ],
        'arena:crimsom_earring_jelewer_earringdown': [ { effect: 'poison', level: 1, condition: 1, effectTime: 120 } ],
        'arena:crimsom_amethyst_earring_jelewer_earringdown': [ { effect: 'weakness', level: 1, condition: 1, effectTime: 120 } ],
        'arena:unnatural_mask_face': [ { effect: 'wither', level: 4, condition: 1, effectTime: 120 } ]
    };

    giveEffect(hurtEntity, activeEffects, attacker);
}
function giveEffect(player, tags, entity) {
    let effects = {};
    let effectTimes = {};

    for (const [tag, effectList] of Object.entries(tags)) {
        if (!player.hasTag(tag)) continue;

        effectList.forEach(({ effect, condition, level, effectTime }) => {
            if (condition) {
                effects[effect] = (effects[effect] || 0) + level;
                effectTimes[effect] = Math.max(effectTimes[effect] || 0, effectTime);
            }
        });
    }
    const conflictingEffects = [
        { effect1: 'poison', effect2: 'regeneration' },
        { effect1: 'weakness', effect2: 'strength' },
        { effect1: 'mining_fatigue', effect2: 'haste' },
        { effect1: 'slowness', effect2: 'speed' }
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
                const strongerEffect = level1 > level2 ? effect1 : effect2;
                const weakerEffect = level1 > level2 ? effect2 : effect1;
                effects[strongerEffect] = Math.abs(level1 - level2);
                delete effects[weakerEffect];
                delete effectTimes[weakerEffect];
            }
        }
    });

    // Aplica los efectos al jugador con los tiempos correctos
    for (const [effectName, level] of Object.entries(effects)) {
        const time = effectTimes[effectName] || 0; // Tiempo correspondiente
        entity.addEffect(effectName, time, { amplifier: level - 1, showParticles: false }); // Amplificador comienza en 0
    }
}
function evasiveFire(entity, damageSource) {
    if (!entity?.isValid()) return;
    if (!['fire', 'lava', 'fireTick'].includes(damageSource?.cause)) return;

    const origin = entity.location;
    const rotation = entity.getRotation();
    const dim = entity.dimension;
    const maxAttempts = 4;
    const radius = 20;

    let closestWater = null;
    let minDistance = Infinity;

    for (let i = 0; i < maxAttempts; i++) {
        const offsetX = (Math.random() - 0.5) * radius * 2;
        const offsetZ = (Math.random() - 0.5) * radius * 2;

        const x = Math.floor(origin.x + offsetX);
        const z = Math.floor(origin.z + offsetZ);

        for (let y = Math.floor(origin.y + 4); y > origin.y - 4; y--) {
            const block = dim.getBlock({ x, y, z });
            const above = dim.getBlock({ x, y: y + 1, z });

            if (block?.typeId === "minecraft:water" && above?.typeId === "minecraft:air") {
                const distance = Math.hypot(origin.x - x, origin.y - y, origin.z - z);
                if (distance < minDistance) {closestWater = { x: x + 0.5, y, z: z + 0.5 };
                    minDistance = distance;
                }
            }
        }
    }

    if (closestWater) {
        entity.teleport(closestWater, { rotation });
        dim.spawnParticle("arena:apollo_hit_emitter", origin);
        entity.playSound("mob.endermen.portal", entity.location);
    }
}
function evasion(entity) {
    if (!entity || !entity.isValid()) return;

    const origin = entity.location;
    const rotation = entity.getRotation();
    const maxAttempts = 8;
    const radius = 4;

    for (let i = 0; i < maxAttempts; i++) {
        const offsetX = (Math.random() - 0.5) * radius * 3;
        const offsetZ = (Math.random() - 0.5) * radius * 3;
        const x = Math.floor(origin.x + offsetX);
        const z = Math.floor(origin.z + offsetZ);
        let y = Math.floor(origin.y);

        const targetBlock = entity.dimension.getBlock({ x, y, z });
        const blockBelow = entity.dimension.getBlock({ x, y: y - 1, z });

        if (targetBlock?.typeId === "minecraft:air" && blockBelow?.typeId !== "minecraft:air") {
            const newPos = { x: x + 0.5, y, z: z + 0.5 };

            entity.teleport(newPos, {rotation: rotation, dimension: entity.dimension});
            entity.dimension.spawnParticle("arena:apollo_hit_emitter", origin);
            entity.playSound("mob.endermen.portal", entity.location);

            return;
        }
    }
}