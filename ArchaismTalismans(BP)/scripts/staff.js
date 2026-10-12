import { world, system } from "@minecraft/server";
import {
     selfHeal, positiveAura, negativeAura, dash, summonSkeletons, summonSVexes, circleFangs, lineFangs, windKnockback, fireBall, 
     evasionForward, spawn_teleport, lifeSteal_aura, evocationFangs, instantHealth_aura, supersonic, thunderbolt, summonCalamitySkeletons,
     selfResist, summonArcaneVexes, maskCharge, fire_aot, summonAngelicVexes
} from './lib/staffAbilities';
import { dead_teleport } from './lib/otherAbilities';
import { damageEquipment } from "./lib/damageEquipment";

const Staffs = new Set([
    "arena:witch_staff",
    "arena:marble_staff",
    "arena:hemlock_staff"
]);
const MODE_PROP = "arena:witch_staff_mode";
let cooldown_ticks = 20

function cdKey(abilityId) {
    return `arena:staff_${abilityId}`;
}
function tryUseAbility(player, abilityId, executeFn) {
    if (onCooldown(player, abilityId)) {
        const remaining = getRemainingCooldown(player, abilityId);
        player.onScreenDisplay.setActionBar(
            `Cooldown: §b${Math.ceil(remaining / 20)}§rs`
        );
        return false;
    }
    executeFn();
    return true;
}

function now() {
    return system.currentTick;
}

function onCooldown(player, abilityId) {
    const end = player.getDynamicProperty(cdKey(abilityId)) ?? 0;
    return end > now();
}

function getRemainingCooldown(player, abilityId) {
    const end = player.getDynamicProperty(cdKey(abilityId)) ?? 0;
    return Math.max(0, end - now());
}
function getCooldownTicks(player, baseTicks) {
    let multiplier = 1;
    if (player.hasTag("arena:spell_engine_amulet")) { multiplier -= 0.1 }
    if (player.getComponent('equippable').getEquipment('Mainhand')?.typeId == 'arena:hemlock_staff') { multiplier -= 0.1 }
    if (player.hasTag("arena:rotten_brain_amulet")) { multiplier -= 0.2 }
    if (player.hasTag("arena:mind_electric_amulet")) { multiplier -= 0.25 }
    if (player.hasTag("arena:spirit_ring_ring")) { multiplier -= 0.1 }
    if (player.hasTag("arena:overflowing_core_charm")) { multiplier += 0.3 }
    return Math.floor(baseTicks * multiplier);
}
function setCooldown(player, abilityId, ticks) {
    player.setDynamicProperty(cdKey(abilityId), now() + ticks);
}

const MODES = [
    { id: 0, icon: "§c", name: " III", abilityId: "self_heal", 
        cooldown: cooldown_ticks * 30, execute: player => selfHeal(player), 
        requires: { tags: ["arena:witch_mask_face"] } },
    { id: 1, icon: "§c", name: "Aura of  II", abilityId: "regen_aura", 
        cooldown: cooldown_ticks * 35, execute: player => positiveAura(player, "regeneration", 20 * 15, 1), 
        requires: { tags: ["arena:witch_mask_face"] } },
    { id: 2, icon: "§b", name: "Aura of  II", abilityId: "slowness_aura", 
        cooldown: cooldown_ticks * 45, execute: player => negativeAura(player, "slowness", 20 * 25, 1), 
        requires: { tags: ["arena:witch_mask_face"] } },
    { id: 3, icon: "§b", name: "Aura of  II", abilityId: "weakness_aura", 
        cooldown: cooldown_ticks * 45, execute: player => negativeAura(player, "weakness", 20 * 25, 1), 
        requires: { tags: ["arena:witch_mask_face"] } },
    { id: 4, icon: "§a", name: "Aura of  II", abilityId: "poison_aura", 
        cooldown: cooldown_ticks * 45, execute: player => negativeAura(player, "poison", 20 * 20, 1), 
        requires: { tags: ["arena:witch_mask_face"] } },
    { id: 5, icon: "§g", name: "Dash ", abilityId: "dash", 
        cooldown: cooldown_ticks * 3, execute: player => dash(player), 
        requires: { tags: ["arena:witch_mask_face"] } },
    { id: 6, icon: "§7", name: "Aura of  II", abilityId: "wither_aura", 
        cooldown: cooldown_ticks * 45, execute: player => negativeAura(player, "wither", 20 * 15, 1), 
        requires: { tags: ["arena:witch_mask_face"] } },
    { id: 7, icon: "§f", name: "Summon    ", abilityId: "summon_skeletons", 
        cooldown: cooldown_ticks * 60, execute: player => summonSkeletons(player), 
        requires: { tags: ["arena:bewitched_pendant_necklace"] } },

    { id: 8, icon: "§f", name: "Summon   ", abilityId: "summon_vexes", 
        cooldown: cooldown_ticks * 120, execute: player => summonSVexes(player), 
        requires: { tags: ["arena:evoker_mask_face"] } },
    { id: 9, icon: "§f", name: "Circle of fangs", abilityId: "fang_aura", 
        cooldown: cooldown_ticks * 15, execute: player => circleFangs(player), 
        requires: { tags: ["arena:evoker_mask_face"] } },
    { id: 10, icon: "§f", name: "Line of fangs", abilityId: "fang_line", 
        cooldown: cooldown_ticks * 17, execute: player => lineFangs(player), 
        requires: { tags: ["arena:evoker_mask_face"] } },
    { id: 11, icon: "§f", name: "Wind knockback", abilityId: "wind_knockback", 
        cooldown: cooldown_ticks * 20, execute: player => windKnockback(player), 
        requires: { tags: ["arena:evoker_mask_face"] } },
    { id: 12, icon: "§c", name: "Fireball", abilityId: "fireball", 
        cooldown: cooldown_ticks * 20, execute: player => fireBall(player), 
        requires: { tags: ["arena:evoker_mask_face"] } },

    { id: 13, icon: "§u", name: "Teleport ", abilityId: "teleport", 
        cooldown: cooldown_ticks * 15, execute: player => evasionForward(player, 25, 1), 
        requires: { tags: ["arena:spell_teleport_book"] } },
    { id: 14, icon: "§u", name: "Teleport last dead", abilityId: "dead_teleport", 
        cooldown: cooldown_ticks * 60, execute: player => dead_teleport(player), 
        requires: { tags: ["arena:spell_dead_teleport_book"] } },
    { id: 15, icon: "§u", name: "Teleport to spawn point", abilityId: "spawn_teleport", 
        cooldown: cooldown_ticks * 60, execute: player => spawn_teleport(player), 
        requires: { tags: ["arena:spell_dead_teleport_book"] } },
    { id: 16, icon: "§m", name: "Damage & lifesteal", abilityId: "lifesteal", 
        cooldown: cooldown_ticks * 80, execute: player => lifeSteal_aura(player), 
        requires: { tags: ["arena:spell_area_lifesteal_book"] } },
    { id: 17, icon: "§a", name: "Evocate fangs(area)", abilityId: "evocation", 
        cooldown: cooldown_ticks * 15, execute: player => evocationFangs(player), 
        requires: { tags: ["arena:spell_evocation_book"] } },
    { id: 18, icon: "§g", name: "Sacred aura", abilityId: "instanthealth", 
        cooldown: cooldown_ticks * 30, execute: player => instantHealth_aura(player), 
        requires: { hat: "arena:aureola_helmet" } },
    { id: 19, icon: "§g", name: "Thunder Bolt", abilityId: "thunderbolt", 
        cooldown: cooldown_ticks * 20, execute: player => thunderbolt(player, 1), 
        requires: { tags: ["arena:spell_lightning_bolt_book"] } },
    { id: 20, icon: "§g", name: "Thunder Bolt Chain", abilityId: "thunderboltChain", 
        cooldown: cooldown_ticks * 40, execute: player => thunderbolt(player, 3), 
        requires: { tags: ["arena:spell_light_bolt_book"] } },
    { id: 21, icon: "§g", name: "Supersonic", abilityId: "supersonic", 
        cooldown: cooldown_ticks * 30, execute: player => supersonic(player), 
        requires: { tags: ["arena:spell_supersonic_book"] } },

    { id: 22, icon: "§f", name: "Summon  ", abilityId: "summon_knight", 
        cooldown: cooldown_ticks * 120, execute: player => summonCalamitySkeletons(player), 
        requires: { tags: ["arena:crown_of_calamity_head"] } },
    { id: 23, icon: "§f", name: "Summon  ", abilityId: "summon_angels", 
        cooldown: cooldown_ticks * 80, execute: player => summonAngelicVexes(player), 
        requires: { tags: ["arena:crown_of_expertise_head"] } },

    { id: 24, icon: "§f", name: "Summon  ", abilityId: "summon_arcane", 
        cooldown: cooldown_ticks * 120, execute: player => summonArcaneVexes(player), 
        requires: { tags: ["arena:arcane_hood_face"] } },
    { id: 25, icon: "§f", name: "+ III 10s", abilityId: "self_resist", 
        cooldown: cooldown_ticks * 60, execute: player => selfResist(player), 
        requires: { tags: ["arena:arcane_hood_face"] } },

    { id: 26, icon: "§f", name: "Gigantism", abilityId: "gigantism", 
        cooldown: cooldown_ticks * 120, execute: player => maskCharge(player), 
        requires: { tags: ["arena:fallen_marble_mask_face"] } },
    { id: 27, icon: "§f", name: "Fire AoE", abilityId: "fire_aot", 
        cooldown: cooldown_ticks * 80, execute: player => fire_aot(player), 
        requires: { tags: ["arena:infernal_heart_heartycharm"] } }
];

function useCurrentMode(player) {
    const modes = getAvailableModes(player);
    if (modes.length === 0) return;

    let index = player.getDynamicProperty(MODE_PROP) ?? 0;
    if (index >= modes.length) index = 0;

    const mode = modes[index];
    const used = tryUseAbility(player, mode.abilityId, () => mode.execute(player));

    if (!used) return;
    const finalCooldown = getCooldownTicks(player, mode.cooldown);
    setCooldown(player, mode.abilityId, finalCooldown);
    damageEquipment(player, 3); 
}

function canUseMode(player, mode) {
    const req = mode.requires;
    if (!req) return true;
    if (req.tags) {
        for (const tag of req.tags) {
            if (!player.hasTag(tag)) return false;
        }
    }
    if (req.anyTags) {
        let ok = false;
        for (const tag of req.anyTags) {
            if (player.hasTag(tag)) {
                ok = true;
                break;
            }
        }
        if (!ok) return false;
    }
    if (req.hat) {
        const equippable = player.getComponent("equippable");
        const hasHat = equippable?.getEquipment("Head")?.typeId === req.hat;
        if (!hasHat) return false;
    }
    return true;
}

function getAvailableModes(player) {
    return MODES.filter(mode => canUseMode(player, mode));
}

function nextMode(player) {
    const modes = getAvailableModes(player);
    if (modes.length === 0) return;

    let current = player.getDynamicProperty(MODE_PROP) ?? 0;
    current = (current + 1) % modes.length;

    player.setDynamicProperty(MODE_PROP, current);

    const mode = modes[current];
    player.onScreenDisplay.setActionBar(`${mode.icon} §f${mode.name}`);
    player.playSound("mob.evocation_illager.prepare_wololo", player.location);
}

world.afterEvents.itemUse.subscribe(e => {
    const { source, itemStack } = e;
    if (!Staffs.has(itemStack.typeId)) return;
    if (source.isSneaking) {
        nextMode(source);
        return;
    }
    useCurrentMode(source);
});