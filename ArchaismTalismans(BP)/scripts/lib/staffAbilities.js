import { world, system } from "@minecraft/server";
import { Vector } from "../Vector3";
import { eventPlayer } from "./eventPlayer";

function rotate(dir, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: dir.x * cos - dir.z * sin,
        z: dir.x * sin + dir.z * cos
    };
}
function summonFang(dim, loc) {
    const start = Vector.add(loc, { x: 0, y: 1, z: 0 });
    const direction = { x: 0, y: -1, z: 0 };

    const hit = dim.getBlockFromRay(start, direction, { includePassableBlocks: true });
    if (!hit || !hit.block) return;
    const spawnLoc = Vector.add( hit.block.location, hit.faceLocation);

    spawnLoc.x = Math.floor(spawnLoc.x) + 0.5;
    spawnLoc.z = Math.floor(spawnLoc.z) + 0.5;
    dim.runCommand(`summon minecraft:evocation_fang ${spawnLoc.x} ${spawnLoc.y} ${spawnLoc.z}`);
}
function summonSkeleton(player, loc) {
    const { summonMeleeBonus, summonRangedBonus, summonLifeBonus } = getEffectBonus(player);
    const dim = player.dimension;
    const start = Vector.add(loc, { x: 0, y: 1, z: 0 });
    const direction = { x: 0, y: -1, z: 0 };

    const hit = dim.getBlockFromRay(start, direction, { includePassableBlocks: true });
    if (!hit || !hit.block) return;

    const entityId = getSkeletonByContext(player);
    const skeleton = dim.spawnEntity(entityId, loc);
    const tameable = skeleton.getComponent("minecraft:tameable");
    if (tameable) { tameable.tame(player); }
    skeleton.addTag(`owner:${player.id}`);
    skeleton.addEffect("slowness", 30, { amplifier: 10, showParticles: false });
    applySummonBonuses( skeleton, summonMeleeBonus, summonRangedBonus, summonLifeBonus );
}

function getSkeletonByContext(player) {
    const dim = player.dimension.id;
    if (dim === "minecraft:nether") {
        return "arena:skeleton_piglin";
    }
    if (dim === "minecraft:the_end") {
        return "arena:stray";
    }
    if (dim === "minecraft:overworld") {
        const time = world.getTimeOfDay();
        if (time >= 12000) {
            return "arena:skeleton";
        }
        return "arena:parched";
    }
    return "arena:skeleton";
}
function getEntitiesInAura(player) {
    return player.dimension.getEntities({location: player.location, maxDistance: 7, minDistance: 1,
        excludeTypes: ["minecraft:item", "minecraft:xp_orb"], excludeFamilies: [ "inanimate" ]
    });
}

export function selfHeal(player) {
    player.playAnimation("animation.arena_staff.selfheal", {stopExpression: "query.any_animation_finished" });

    system.runTimeout(() => {
        player.playSound("mob.evocation_illager.cast_spell", player.location);
        player.dimension.spawnParticle("arena:self_heal", { x: player.location.x, y: player.location.y -0.7, z: player.location.z });
        player.addEffect("instant_health", 1, { amplifier: 1 });
    }, 7);
}
export function selfResist(player) { 
    player.playAnimation("animation.arena_staff.selfheal", {stopExpression: "query.any_animation_finished" });

    system.runTimeout(() => {
        const { durationMultiplier } = getEffectBonus(player);
        player.playSound("mob.evocation_illager.cast_spell", player.location);
        player.dimension.spawnParticle("arena:self_heal", { x: player.location.x, y: player.location.y -0.7, z: player.location.z });
        player.addEffect("resistance", (200 * durationMultiplier), { amplifier: 2 });
    }, 7);
}
function getEffectBonus(player) {
    let durationMultiplier = 1
    let amplifierBonus = 0
    let summonBonus = 0
    let summonLifeBonus = 0
    let summonMeleeBonus = 0
    let summonRangedBonus = 0

    if (player.hasTag("arena:haunted_ring_ring")) { summonRangedBonus += 1 }
    if (player.hasTag("arena:hauled_ring_ring")) { summonMeleeBonus += 1 }
    if (player.hasTag("arena:divine_orb_charm")) { summonLifeBonus += 4 }
    if (player.hasTag("arena:malingnant_orb_charm")) { summonRangedBonus += 1;
        summonMeleeBonus += 1;
    }

    if (player.getComponent('equippable').getEquipment('Chest')?.typeId == 'arena:hades_chestplate') { summonBonus += 1 } 
    if (player.getComponent('equippable').getEquipment('Chest')?.typeId == 'arena:arena_chestplate') { summonRangedBonus += 1 } 

    if (player.getComponent('equippable').getEquipment('Head')?.typeId == 'arena:witch_hat') { summonLifeBonus += 2 } 
    if (player.getComponent('equippable').getEquipment('Chest')?.typeId == 'arena:mage_chestplate') { summonLifeBonus += 2; 
        summonBonus += 1 ;
    } 
    if (player.getComponent('equippable').getEquipment('Legs')?.typeId == 'arena:mage_leggings') { summonLifeBonus += 2 } 
    if (player.getComponent('equippable').getEquipment('Mainhand')?.typeId == 'arena:marble_staff') { summonLifeBonus += 2 }

    if (player.hasTag("arena:spell_duration_engine_amulet")) { durationMultiplier += 0.2 }
    if (player.hasTag("arena:spell_strength_engine_amulet")) { amplifierBonus += 2 }
    if (player.hasTag("arena:summoner_wand_amulet")) { summonBonus += 1 }
    if (player.hasTag("arena:marble_summoner_wand_amulet")) { summonBonus += 2 }
    if (player.hasTag("arena:hemlock_summoner_wand_amulet")) { summonBonus += 3 }
    if (player.hasTag("arena:overflowing_core_charm")) { summonRangedBonus += 1 
        summonMeleeBonus += 1;
        summonLifeBonus += 4;
    }
    if (player.hasTag("arena:infused_earring_earring")) { amplifierBonus += 2 }
    if (player.hasTag("arena:infused_earring_earringdown")) { amplifierBonus += 2 }
    if (player.hasTag("arena:sealing_talis_talisman")) { summonBonus += 2 }
    return { durationMultiplier, amplifierBonus, summonBonus, summonLifeBonus, summonMeleeBonus, summonRangedBonus };
}
const RANGED_SUMMONS = new Set([ "arena:skeleton", "arena:parched", "arena:skeleton_piglin", "arena:stray", "arena:bogged" ]);
function applySummonBonuses( summon, meleeBonus, rangedBonus, lifeBonus ) {
    const events = [];
    if (meleeBonus >= 1) { events.push(`arena:attack+${Math.min(meleeBonus, 10)}`) }
    if (lifeBonus >= 2) { events.push(`arena:health+${Math.min(lifeBonus, 40)}`) }
    if ( rangedBonus >= 1 && RANGED_SUMMONS.has(summon.typeId) ) { events.push(`arena:ranged+${Math.min(rangedBonus, 10)}`) }

    events.forEach(ev => summon.triggerEvent(ev));
}
export function positiveAura(player, effect, duration, amplifier) {
    player.playAnimation("animation.arena_staff.aura", {stopExpression: "query.any_animation_finished" });
        player.dimension.spawnParticle("arena:staff_ritual", { x: player.location.x, y: player.location.y, z: player.location.z });

    system.runTimeout(() => {
        const { durationMultiplier, amplifierBonus } = getEffectBonus(player);
        const finalDuration = Math.floor(duration * durationMultiplier);
        const finalAmplifier = amplifier + amplifierBonus;
        const entities = getEntitiesInAura(player);
        player.playSound("mob.evocation_illager.cast_spell", player.location);
        player.dimension.spawnParticle("arena:positive_aura_effect", { x: player.location.x, y: player.location.y + 0.1, z: player.location.z });
        for (const entity of entities) {
            const isPlayer = entity.typeId === "minecraft:player";
            const isTamed = entity.hasComponent("minecraft:is_tamed");
            const isIronGolem = entity.matches({ families: ["irongolem"] });
                if (isPlayer || isTamed || isIronGolem) {
                    entity.addEffect(effect, finalDuration , { finalAmplifier, showParticles: true});
            }
        }
    }, 16);
}
export function supersonic(player) {
    const originLoc = player.location;
    player.playAnimation("animation.arena_staff.fireball", { stopExpression: "query.any_animation_finished" });
    player.dimension.playSound("mob.warden.sonic_charge", originLoc, { pitch: 2.5, volume: 1.5 });

    system.runTimeout(() => {
        const { x, y, z } = player.location;
        const loc = player.location;
        const dir = player.getViewDirection();
        const { durationMultiplier, amplifierBonus } = getEffectBonus(player);
        const finalDuration = Math.floor(60 * durationMultiplier);
        const finalAmplifier = 1 + amplifierBonus;

        player.dimension.spawnParticle("arena:super_sonic_outside", loc);
        player.dimension.playSound("random.explode", loc, { pitch: 2.3, volume: 1.5 });
        player.dimension.playSound("mob.warden.sonic_boom", loc, { pitch: 1, volume: 1.5 });
        player.dimension.spawnParticle("arena:super_sonic_inside", loc);
        const targets = player.dimension.getEntities({ location: loc, maxDistance: 5.5, minDistance: 1,
        excludeTypes: ["minecraft:item", "minecraft:xp_orb"], excludeFamilies: [ "inanimate" ] });
        for (const target of targets) {
            if (target === player) continue;
            target.addEffect("slowness", finalDuration, { amplifier: finalAmplifier, showParticles: true });
            target.addEffect("weakness", finalDuration, { amplifier: finalAmplifier, showParticles: true });
            target.applyDamage(14, { cause: "magic" });
            const dx = target.location.x - x;
            const dz = target.location.z - z;
            const dist = Math.hypot(dx, dz) || 1;
            const nx = dx / dist;
            const nz = dz / dist;
            const strength = Math.max(1, (4 + amplifierBonus) - dist);
            target.applyKnockback(nx, nz, strength, 0.45);
        }
    }, 10);
}
function thunderboltChain(damager, origin, target, prevTargets, damage, range, pitch) {
    if (damage < 1) return;
    const dim = damager.dimension;
    const originLoc = origin.location;
    const targetLoc = target.location;
    const xDif = targetLoc.x - originLoc.x;
    const yDif = targetLoc.y - originLoc.y;
    const zDif = targetLoc.z - originLoc.z;
    const distanceBetween = Math.hypot(xDif, yDif, zDif);
    for (let i = 1; i < distanceBetween; i++) {
        system.runTimeout(() => {
            const progress = i / distanceBetween;
            dim.spawnParticle("arena:discharge_hit", { x: originLoc.x + xDif * progress, y: originLoc.y + 1 + yDif * progress, z: originLoc.z + zDif * progress });
            dim.spawnParticle("arena:discharge_electricity", { x: originLoc.x + xDif * progress, y: originLoc.y + 1 + yDif * progress, z: originLoc.z + zDif * progress });
        }, i / 2);
    }
    system.runTimeout(() => {
        target.applyDamage(damage, { cause: "magic" });
        dim.playSound("item.trident.thunder", targetLoc, { pitch: pitch, volume: 1 });
        dim.spawnParticle("arena:discharge_big_electricity", targetLoc);
        const newTargets = [...prevTargets, target];
        const chainTargets = dim.getEntities({ location: targetLoc, maxDistance: range, minDistance: 1,
        excludeTypes: ["minecraft:item", "minecraft:xp_orb"], excludeFamilies: [ "inanimate" ] });
        for (const next of chainTargets) {
            if (newTargets.includes(next)) continue;
            thunderboltChain( damager, target, next, newTargets, damage * 0.85, Math.min(range * 1.15, 16), pitch * 0.95 );
            return;
        }
    }, 1 + distanceBetween / 2);
}
export function thunderbolt(player, level) {
    player.playAnimation("animation.arena_staff.aura", { stopExpression: "query.any_animation_finished"  });
    player.dimension.spawnParticle("arena:staff_ritual", { x: player.location.x, y: player.location.y, z: player.location.z });

    system.runTimeout(() => {
        const dim = player.dimension;
        const loc = player.location;
        const { amplifierBonus } = getEffectBonus(player);
        const finalDamage = (level * 3) + 4 + (amplifierBonus * 2);
        const finalRange = 7 + amplifierBonus * 0.5;
        dim.playSound("item.trident.thunder", loc);
        dim.spawnParticle("arena:discharge_big_electricity", loc);
        const targets = dim.getEntities({ location: loc, maxDistance: finalRange, minDistance: 1,
        excludeTypes: ["minecraft:item", "minecraft:xp_orb"], excludeFamilies: [ "inanimate" ] });
        for (const target of targets) {
            if (target === player) continue;
            thunderboltChain( player, player, target, [player], finalDamage, finalRange, 1 );
            return;
        }
    }, 16);
}
export function negativeAura(player, effect, duration, amplifier) {
    player.playAnimation("animation.arena_staff.aura", {stopExpression: "query.any_animation_finished" });
    player.dimension.spawnParticle("arena:staff_ritual", { x: player.location.x, y: player.location.y, z: player.location.z });

        system.runTimeout(() => {
        const { durationMultiplier, amplifierBonus } = getEffectBonus(player);
        const finalDuration = Math.floor(duration * durationMultiplier);
        const finalAmplifier = amplifier + amplifierBonus;
        const entities = getEntitiesInAura(player);
        player.playSound("mob.evocation_illager.cast_spell", player.location);
        player.dimension.spawnParticle("arena:negative_aura_effect", { x: player.location.x, y: player.location.y + 0.1, z: player.location.z });
        for (const entity of entities) {
            const isMonster = entity.matches({ families: ["monster"] });
            if (!isMonster) continue;
            entity.addEffect(effect, finalDuration, { finalAmplifier, showParticles: true });
        }
    }, 16);
}
export function dash(player) {
    const { amplifierBonus } = getEffectBonus(player);
    const finalAmplifier = 2.6 + (amplifierBonus * 0.25);
    const dir = player.getViewDirection();
    player.playSound("mob.evocation_illager.cast_spell", player.location);
    player.playAnimation("animation.arena_staff.dash", {stopExpression: "query.any_animation_finished" });
    player.dimension.spawnParticle("minecraft:wind_explosion_emitter", { x: player.location.x, y: player.location.y + 0.1, z: player.location.z });
    player.applyKnockback(dir.x, dir.z, finalAmplifier, 0.5);
}
function relocateSummons(player) {
    const entities = player.dimension.getEntities({ location: player.location, minDistance: 20, families: ["summon"], tags: [`owner:${player.id}`] });
    const { x, y, z } = player.location;
    const dir = player.getViewDirection();
    const radius = 2.5;
    let i = 0;
    const count = entities.length;
    if (entities.length > 0) { player.playSound("mob.endermen.portal", player.location) }
    for (const entity of entities) {
        const angle = (Math.PI * 2 / Math.max(count, 1)) * i++;
        const rotated = rotate(dir, angle);
        entity.teleport({ x: x + rotated.x * radius, y: y + 1.2, z: z + rotated.z * radius });
        entity.dimension.spawnParticle("arena:apollo_hit_emitter", entity.location);
    }
}
function getActiveSummons(player) {
    return player.dimension.getEntities({families: ["summon"], tags: [`owner:${player.id}`]}).length;
}
function getAvailableSummonSlots(player, BASE_MAX_SUMMONS) {
    const { summonBonus } = getEffectBonus(player);
    const maxAllowed = BASE_MAX_SUMMONS + summonBonus;
    relocateSummons(player);
    const current = getActiveSummons(player);
    return Math.max(0, maxAllowed - current);
}
export function summonSkeletons(player) { 
    const available = getAvailableSummonSlots(player, 4);
    if (available <= 0) return;
    player.playAnimation("animation.arena_staff.casting", { stopExpression: "query.any_animation_finished" });
    player.dimension.spawnParticle("arena:staff_evoke", { x: player.location.x, y: player.location.y, z: player.location.z });

    system.runTimeout(() => {
        const { summonBonus } = getEffectBonus(player);
        const intended = 4 + summonBonus;
        const finalCount = Math.min(intended, available);
        player.playSound("mob.evocation_illager.cast_spell", player.location);
        player.dimension.spawnParticle( "arena:staff_casting", {x: player.location.x, y: player.location.y + 0.1, z: player.location.z});

        const { x, y, z } = player.location;
        const dir = player.getViewDirection();

        const dim = player.dimension;
        const radius = 2.5;
        const skeletonCount = finalCount;
        for (let i = 0; i < skeletonCount; i++) {
            const angle = (Math.PI * 2 / skeletonCount) * i;
            const rotated = rotate(dir, angle);
            const pos = { x: x + rotated.x * radius, y: y + 1.2, z: z + rotated.z * radius };
            summonSkeleton(player, pos)
        }
    }, 15);
}
export function summonCalamitySkeletons(player) {  
    const available = getAvailableSummonSlots(player, 2);
    if (available <= 0) return;
    player.playAnimation("animation.arena_staff.casting", { stopExpression: "query.any_animation_finished" });
    player.dimension.spawnParticle("arena:staff_evoke", { x: player.location.x, y: player.location.y, z: player.location.z });
    system.runTimeout(() => {
        const { summonBonus, summonMeleeBonus, summonRangedBonus, summonLifeBonus } = getEffectBonus(player);
        const intended = 2 + summonBonus;
        const finalCount = Math.min(intended, available);
        player.playSound("mob.evocation_illager.cast_spell", player.location);
        player.dimension.spawnParticle( "arena:staff_casting", {x: player.location.x, y: player.location.y + 0.1, z: player.location.z});
        const { x, y, z } = player.location;
        const dir = player.getViewDirection();
        const dim = player.dimension;
        const radius = 2.5;
        const vexCount = finalCount;
        for (let i = 0; i < vexCount; i++) {
            const angle = (Math.PI * 2 / vexCount) * i;
            const rotated = rotate(dir, angle);
            const pos = { x: x + rotated.x * radius, y: y + 1.2, z: z + rotated.z * radius };
            const vex = player.dimension.spawnEntity("arena:calamity_wither_skeleton", pos);
            const tameable = vex.getComponent("minecraft:tameable");
            if (tameable) { tameable.tame(player); }
            vex.addTag(`owner:${player.id}`);
            applySummonBonuses( vex, summonMeleeBonus, summonRangedBonus, summonLifeBonus );
        }
    }, 15);
}
export function summonSVexes(player) { 
    const available = getAvailableSummonSlots(player, 3);
    if (available <= 0) return;
    player.playAnimation("animation.arena_staff.casting", { stopExpression: "query.any_animation_finished" });
    player.dimension.spawnParticle("arena:staff_evoke", { x: player.location.x, y: player.location.y, z: player.location.z });
    system.runTimeout(() => {
        const { summonBonus, summonMeleeBonus, summonRangedBonus, summonLifeBonus } = getEffectBonus(player);
        const intended = 3 + summonBonus;
        const finalCount = Math.min(intended, available);
        player.playSound("mob.evocation_illager.cast_spell", player.location);
        player.dimension.spawnParticle( "arena:staff_casting", {x: player.location.x, y: player.location.y + 0.1, z: player.location.z});
        const { x, y, z } = player.location;
        const dir = player.getViewDirection();
        const dim = player.dimension;
        const radius = 2.5;
        const vexCount = finalCount;
        for (let i = 0; i < vexCount; i++) {
            const angle = (Math.PI * 2 / vexCount) * i;
            const rotated = rotate(dir, angle);
            const pos = { x: x + rotated.x * radius, y: y + 1.2, z: z + rotated.z * radius };
            const vex = player.dimension.spawnEntity("arena:vex", pos);
            const tameable = vex.getComponent("minecraft:tameable");
            if (tameable) { tameable.tame(player); }
            vex.addTag(`owner:${player.id}`);
            applySummonBonuses( vex, summonMeleeBonus, summonRangedBonus, summonLifeBonus );
        }
    }, 15);
}
export function summonArcaneVexes(player) {  
    const available = getAvailableSummonSlots(player, 2);
    if (available <= 0) return;
    player.playAnimation("animation.arena_staff.casting", { stopExpression: "query.any_animation_finished" });
    player.dimension.spawnParticle("arena:staff_evoke", { x: player.location.x, y: player.location.y, z: player.location.z });
    system.runTimeout(() => {
        const { summonBonus, summonMeleeBonus, summonRangedBonus, summonLifeBonus } = getEffectBonus(player);
        const intended = 2 + summonBonus;
        const finalCount = Math.min(intended, available);
        player.playSound("mob.evocation_illager.cast_spell", player.location);
        player.dimension.spawnParticle( "arena:staff_casting", {x: player.location.x, y: player.location.y + 0.1, z: player.location.z});
        const { x, y, z } = player.location;
        const dir = player.getViewDirection();
        const dim = player.dimension;
        const radius = 2.5;
        const vexCount = finalCount;
        for (let i = 0; i < vexCount; i++) {
            const angle = (Math.PI * 2 / vexCount) * i;
            const rotated = rotate(dir, angle);
            const pos = { x: x + rotated.x * radius, y: y + 1.2, z: z + rotated.z * radius };
            const vex = player.dimension.spawnEntity("arena:arcane_vex", pos);
            const tameable = vex.getComponent("minecraft:tameable");
            if (tameable) { tameable.tame(player); }
            vex.addTag(`owner:${player.id}`);
            applySummonBonuses( vex, summonMeleeBonus, summonRangedBonus, summonLifeBonus );
        }
    }, 15);
}
export function summonAngelicVexes(player) {  
    const available = getAvailableSummonSlots(player, 2);
    if (available <= 0) return;
    player.playAnimation("animation.arena_staff.casting", { stopExpression: "query.any_animation_finished" });
    player.dimension.spawnParticle("arena:staff_evoke", { x: player.location.x, y: player.location.y, z: player.location.z });
    system.runTimeout(() => {
        const { summonBonus, summonMeleeBonus, summonRangedBonus, summonLifeBonus } = getEffectBonus(player);
        const intended = 2 + summonBonus;
        const finalCount = Math.min(intended, available);
        player.playSound("mob.evocation_illager.cast_spell", player.location);
        player.dimension.spawnParticle( "arena:staff_casting", {x: player.location.x, y: player.location.y + 0.1, z: player.location.z});
        const { x, y, z } = player.location;
        const dir = player.getViewDirection();
        const dim = player.dimension;
        const radius = 2.5;
        const vexCount = finalCount;
        for (let i = 0; i < vexCount; i++) {
            const angle = (Math.PI * 2 / vexCount) * i;
            const rotated = rotate(dir, angle);
            const pos = { x: x + rotated.x * radius, y: y + 1.2, z: z + rotated.z * radius };
            const vex = player.dimension.spawnEntity("arena:angelic_vex", pos);
            const tameable = vex.getComponent("minecraft:tameable");
            if (tameable) { tameable.tame(player); }
            vex.addTag(`owner:${player.id}`);
            applySummonBonuses( vex, summonMeleeBonus, summonRangedBonus, summonLifeBonus );
        }
    }, 15);
}
export function circleFangs(player) {
    player.playAnimation("animation.arena_staff.casting", { stopExpression: "query.any_animation_finished" });
    system.runTimeout(() => {
        player.playSound("mob.evocation_illager.cast_spell", player.location);
        const { x, y, z } = player.location;
        const dir = player.getViewDirection();
        const dim = player.dimension;
        const radius = 2;
        const fangCount = 8;
        for (let i = 0; i < fangCount; i++) {
            const angle = (Math.PI * 2 / fangCount) * i;
            const rotated = rotate(dir, angle);
            const pos = { x: x + rotated.x * radius, y: y - 0.1, z: z + rotated.z * radius };
            summonFang(dim, pos)
        }
    }, 15);
}
export function lineFangs(player) {
    player.playAnimation("animation.arena_staff.casting", { stopExpression: "query.any_animation_finished" });

    system.runTimeout(() => {
        player.playSound("mob.evocation_illager.cast_spell", player.location);
        const { x, y, z } = player.location;
        const dir = player.getViewDirection();
        const dim = player.dimension;
        const fangCount = 9;
        const spacing = 1.1;
        const startOffset = 1;

        for (let i = 0; i < fangCount; i++) {
            system.runTimeout(() => {
                const dist = startOffset + i * spacing;
                const pos = { x: x + dir.x * dist, y: y - 0.1, z: z + dir.z * dist };
                summonFang(dim, pos)
            }, i * 2);
        }
    }, 15);
}
export function windKnockback(player) {
    player.playAnimation( "animation.arena_staff.wind_knockback", { stopExpression: "query.any_animation_finished" });

    system.runTimeout(() => {
        player.playSound("mob.evocation_illager.cast_spell", player.location);
        const { x, y, z } = player.location;
        const dim = player.dimension;
        dim.spawnParticle("minecraft:knockback_roar_particle", { x, y: y + 1, z });
        dim.spawnParticle("minecraft:breeze_wind_explosion_emitter", { x, y: y + 1.2, z });

        const entities = dim.getEntities({ location: player.location, maxDistance: 4, minDistance: 1, excludeTypes: ["minecraft:item", "minecraft:xp_orb"]});
        for (const entity of entities) {
            if (entity === player) continue;
            const dx = entity.location.x - x;
            const dz = entity.location.z - z;
            const dist = Math.hypot(dx, dz) || 1;
            const nx = dx / dist;
            const nz = dz / dist;
            const strength = Math.max(1, 5 - dist);

            entity.applyKnockback(nx, nz, strength, 0.6);
        }
    }, 16);
}
export function fireBall(player) {
    player.playAnimation( "animation.arena_staff.fireball", { stopExpression: "query.any_animation_finished" });

    system.runTimeout(() => {
        player.playSound("mob.evocation_illager.cast_spell", player.location);
        const entity = player.dimension.spawnEntity("hydra:fire_ball", player.getHeadLocation());
        const projectile = entity.getComponent('projectile');
        projectile.owner = player;
        projectile.shoot({x: player.getViewDirection().x*2, y: player.getViewDirection().y*2, z: player.getViewDirection().z*2});
        player.dimension.spawnParticle("arena:death_mark", player.location)
    }, 10);
}
export function evasionForward(entity, maxDistance = 25, step = 1) {
    entity.playAnimation( "animation.arena_staff.fireball", { stopExpression: "query.any_animation_finished" });

    if (!entity || !entity.isValid()) return;
    system.runTimeout(() => {
        const dim = entity.dimension;
        const origin = entity.location;
        const rotation = entity.getRotation();
        const dir = entity.getViewDirection();

        for (let d = maxDistance; d >= step; d -= step) {
            const x = Math.floor(origin.x + dir.x * d);
            const z = Math.floor(origin.z + dir.z * d);
            let y = Math.floor(origin.y);

            const targetBlock = dim.getBlock({ x, y, z });
            const blockBelow = dim.getBlock({ x, y: y - 1, z });

            if ( targetBlock?.typeId === "minecraft:air" && blockBelow && blockBelow.typeId !== "minecraft:air") {
                const newPos = { x: x + 0.5, y, z: z + 0.5 };

                entity.teleport(newPos, { rotation, dimension: dim });
                system.runTimeout(() => {
                    const origin2 = entity.location;
                    entity.playSound("mob.endermen.portal", entity.location);
                    dim.spawnParticle("arena:apollo_hit_emitter", origin2 );
                }, 10);
                return;
            }
        }
    }, 10);
}
export function spawn_teleport(player) {
    const origin = player.location;
    const dim = player.dimension;
    let spawnPoint = player.getSpawnPoint()
    if (!spawnPoint) {
        player.playSound("note.bass");
        return;
    }
    player.playAnimation( "animation.arena_staff.aura", { stopExpression: "query.any_animation_finished" });
    system.runTimeout(() => {
        player.teleport(spawnPoint, { dimension: spawnPoint.dimension });
        system.runTimeout(() => {
            const origin2 = player.location;
            player.playSound("mob.endermen.portal", player.location);
            dim.spawnParticle("arena:apollo_hit_emitter", origin2 );
            dim.spawnParticle("arena:hemlock_steady", origin2 );
        }, 20);
    }, 16);
}
export function lifeSteal_aura(player) {
    player.playAnimation("animation.arena_staff.aura", {stopExpression: "query.any_animation_finished" });
    player.dimension.spawnParticle("arena:staff_ritual", { x: player.location.x, y: player.location.y, z: player.location.z });

        system.runTimeout(() => {
        const healthComp = player.getComponent('minecraft:health');
        const currentHealth = healthComp.currentValue;
        let lifeSteal = 0;
        const entities = getEntitiesInAura(player);
        player.playSound("mob.evocation_illager.cast_spell", player.location);
        player.dimension.spawnParticle("arena:negative_aura_effect", { x: player.location.x, y: player.location.y + 0.1, z: player.location.z });
        for (const entity of entities) {
            const { x, y, z } = entity.location;
            const dim = entity.dimension;
            const isTamed = entity.hasComponent('minecraft:is_tamed');
            if (isTamed) continue;
            entity.applyDamage(2, { cause: "magic" });
            dim.spawnParticle("arena:bleeding", { x, y: y + 1, z });
            lifeSteal += 1;
        }
        if (lifeSteal > 0) {
            healthComp.setCurrentValue(currentHealth + lifeSteal);
        }
    }, 16);
}
export function instantHealth_aura(player) {
    player.playAnimation("animation.arena_staff.aura", {stopExpression: "query.any_animation_finished" });
    player.dimension.spawnParticle("arena:staff_ritual", { x: player.location.x, y: player.location.y, z: player.location.z });

        system.runTimeout(() => {
        const entities = getEntitiesInAura(player);
        player.playSound("mob.evocation_illager.cast_spell", player.location);
        player.dimension.spawnParticle("arena:negative_aura_effect", { x: player.location.x, y: player.location.y + 0.1, z: player.location.z });
        for (const entity of entities) {
            const { x, y, z } = entity.location;
            const dim = entity.dimension;
            const isUndead = entity.matches({ families: ["undead"] });
            entity.addEffect('regeneration', 60, { amplifier: 2, showParticles: true });
            if (isUndead) {
                entity.applyDamage(6, { cause: "magic" });
                dim.spawnParticle("arena:bleeding", { x, y: y + 1, z });
            }
        }
    }, 16);
}
export function evocationFangs(player) {
    player.playAnimation("animation.arena_staff.casting", {stopExpression: "query.any_animation_finished" });

        system.runTimeout(() => {
        const entities = getEntitiesInAura(player);
        player.playSound("mob.evocation_illager.cast_spell", player.location);
        player.dimension.spawnParticle("arena:negative_aura_effect", { x: player.location.x, y: player.location.y + 0.1, z: player.location.z });
        for (const entity of entities) {
            const isTamed = entity.hasComponent('minecraft:is_tamed');
            if (isTamed) continue;
            const pos = { x: entity.location.x, y: entity.location.y - 0.1, z: entity.location.z };
            summonFang(player.dimension, pos)
        }
    }, 15);
}
export function maskCharge(player) {
    player.playAnimation("animation.arena_staff.selfheal", { stopExpression: "query.any_animation_finished" });

    system.runTimeout(() => {
        player.playSound("mob.evocation_illager.cast_spell", player.location);
        player.dimension.spawnParticle("minecraft:knockback_roar_particle", { x: player.location.x, y: player.location.y + 1, z: player.location.z });
        player.addTag( "arena:mask_charged");
        player.triggerEvent("minecraft:event_mask_charged");
        system.runTimeout(() => {
            if (!player.isValid()) return;
            if (!player.hasTag( "arena:mask_charged")) return;
            player.removeTag( "arena:mask_charged");

            let restored = false;
            for (const [tag, events] of Object.entries(eventPlayer)) {
                if (!player.hasTag(tag)) continue;
                if (events.on) { events.on.forEach(ev => player.triggerEvent(ev)); restored = true }
                break;
            }
            player.dimension.spawnParticle("minecraft:knockback_roar_particle", { x: player.location.x, y: player.location.y + 1, z: player.location.z });
        player.playSound("conduit.deactivate", player.location);
            if (!restored) { player.triggerEvent("minecraft:event_mask0") }
        }, 20 * 60);
    }, 7);
}
export function fire_aot(player) {
    player.playAnimation("animation.arena_staff.selfheal", { stopExpression: "query.any_animation_finished" });

    system.runTimeout(() => {
        player.playSound("mob.evocation_illager.cast_spell", player.location);
        player.dimension.spawnParticle("minecraft:knockback_roar_particle", { x: player.location.x, y: player.location.y + 1, z: player.location.z });
        player.addTag( "arena:infernal_charge");
        system.runTimeout(() => {
            if (!player.isValid()) return;
            if (!player.hasTag( "arena:infernal_charge")) return;
            player.removeTag( "arena:infernal_charge");
        }, 20 * 30);
    }, 7);
}