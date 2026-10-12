import { system, world, BlockComponentTypes } from "@minecraft/server";
import { Vector } from "./Vector3";

const CHANCE_MULTIPLIER = 1.0;

const Dimensions = [
    world.getDimension("minecraft:overworld"),
    world.getDimension("minecraft:nether"),
    world.getDimension("minecraft:the_end")
];

const ScanPattern = [
    { x: -1, y: 0, z: 0 }, { x: 1, y: 0, z: 0 },
    { x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: -1 },
    { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: -1 },
    { x: 1, y: 0, z: 1 }, { x: -1, y: 0, z: 1 }, { x: -1, y: 0, z: -1 }
];

let loot_spawned = {
    "minecraft:overworld": [],
    "minecraft:the_end": [],
    "minecraft:nether": []
}

let killed_with_extra_loot = {
    "minecraft:overworld": [],
    "minecraft:the_end": [],
    "minecraft:nether": []
}

const Humanoids = new Set([
    "minecraft:drowned",
    "minecraft:husk",
    "minecraft:skeleton",
    "minecraft:stray",
    "minecraft:parched",
    "minecraft:bogged",
    "minecraft:wither_skeleton",
    "minecraft:zombie_pigman",
    "minecraft:zombie"
]);

let player_glide_travel = {}, looked_enderman = {}, flee_creeper = {}, jumping = {}, sneaking = {},
    can_double_jump = {}, player_sleep_state = {}, shoes_duration = {}, fin_duration = {},
    last_sleep_time = {}, fall_record = {}, player_ground_path = {}, player_max_height = {},
    boat_y_rotation_offset = {};

world.afterEvents.entityDie.subscribe(s => {
    const player = s.damageSource.damagingEntity;
    if (!player || player.typeId !== "minecraft:player") return;

    if (player.hasTag("arena:extravagant_quiver_body") && s.deadEntity.typeId !== "minecraft:player" && damageSource.cause == 'projectile') {
        killed_with_extra_loot[player.dimension.id].push(s.deadEntity.location);
    }

    if (player.hasTag("arena:wither_mask_face") && Math.random() < 0.6 * CHANCE_MULTIPLIER && player.getComponent('minecraft:health').currentValue <= 10 ) {
    if (!Humanoids.has(s.deadEntity.typeId)) return;
        const entity = s.deadEntity.dimension.spawnEntity("arena:wither_skeleton", s.deadEntity.location);

        player.playSound("mob.wither.ambient", player.location);
        entity.applyImpulse(s.deadEntity.getVelocity());
        entity.getComponent("minecraft:tameable").tame(player);
    }

    let summonMutiplier = 0;
    const headItem = player.getComponent('equippable')?.getEquipment('Head');
    const chestItem = player.getComponent('equippable')?.getEquipment('Chest');
    const legstItem = player.getComponent('equippable')?.getEquipment('Legs');
    const feettItem = player.getComponent('equippable')?.getEquipment('Feet');
    const armorPieces = [ headItem?.typeId, chestItem?.typeId, legstItem?.typeId, feettItem?.typeId ];

    for (const piece of armorPieces) {
        if (!piece) continue;
        if (piece.startsWith("arena:hades_")) {
            summonMutiplier += 0.05; 
        }
    }
    if (player.hasTag("arena:necromancer_mask_face")) {
        summonMutiplier += 0.4;
    } 
    if (summonMutiplier > 0 && Math.random() < summonMutiplier * CHANCE_MULTIPLIER ) { 
    const necromancer_skeletons = {
        "minecraft:drowned": "arena:bogged",
        "minecraft:husk": "arena:parched",
        "minecraft:parched": "arena:parched",
        "minecraft:skeleton": "arena:skeleton",
        "minecraft:stray": "arena:stray",
        "minecraft:bogged": "arena:bogged",
        "minecraft:wither_skeleton": "arena:wither_skeleton",
        "minecraft:zombie": "arena:skeleton",
        "minecraft:villager": "arena:skeleton_illager",
        "minecraft:zombie_villager": "arena:skeleton_illager",
        "minecraft:pillager": "arena:skeleton_illager",
        "minecraft:vindicator": "arena:skeleton_illager",
        "minecraft:evocation_illager": "arena:skeleton_illager",
        "minecraft:wandering_trader": "arena:skeleton_illager",
        "minecraft:witch": "arena:skeleton_illager",
        "minecraft:zombie_pigman": "arena:skeleton_piglin",
        "minecraft:piglin": "arena:skeleton_piglin",
        "minecraft:piglin_brute": "arena:skeleton_piglin",
        "minecraft:player": "arena:skeleton"
    };
    
    const type = necromancer_skeletons[s.deadEntity.typeId];
    if (type) {
        player.playSound("mob.evocation_illager.cast_spell", player.location);
        const entity = s.deadEntity.dimension.spawnEntity(type, s.deadEntity.location);
        entity.applyImpulse(s.deadEntity.getVelocity());
        entity.getComponent("minecraft:tameable").tame(player);
        }
    }
});


world.afterEvents.entityHurt.subscribe(s => {
    const { hurtEntity, damageSource } = s;
    const attacker = damageSource?.damagingEntity;

    if (attacker && attacker.typeId === "minecraft:player") {
        if (attacker.hasTag("arena:harmony_talisman_talisman") && Math.random() < 0.1 ) {
            const dim = hurtEntity.dimension;
            const ownerTag = `arena:endermite_owner_${attacker.id}`;
            let endermiteCount = 0;

            for (const entity of dim.getEntities({ type: "arena:endermite" })) {
                if (entity.hasTag(ownerTag)) {
                    endermiteCount++;
                }
            }

            if (endermiteCount < 3) {
                const endermite = dim.spawnEntity("arena:endermite", hurtEntity.location);

                attacker.playSound("mob.evocation_illager.cast_spell", attacker.location);
                endermite.addTag(ownerTag);
                endermite.getComponent("minecraft:tameable")?.tame(attacker);
                endermite.triggerEvent("minecraft:add_damage_timer");
            }
        }
    }
    if (hurtEntity?.typeId === "minecraft:player") {
        const victim = hurtEntity;
        const MAX_VEX = 3;

        if (victim.hasTag("arena:vexed_souls_lantern_talisman") && Math.random() < 0.35 ) {
            const dim = victim.dimension;
            const ownerTag = `arena:vex_owner_${victim.id}`;
            let vexCount = 0;

            for (const entity of dim.getEntities({ type: "arena:vex" })) {
                if (entity.hasTag(ownerTag)) {
                    vexCount++;
                }
            }

            if (vexCount < MAX_VEX) {
                const vex = dim.spawnEntity("arena:vex", victim.location);

                victim.addEffect('weakness', 300, { amplifier: 1, showParticles: true });
                victim.playSound("mob.evocation_illager.cast_spell", victim.location);
                vex.addTag(ownerTag);
                vex.getComponent("minecraft:tameable")?.tame(victim);
                vex.triggerEvent("minecraft:add_damage_timer");
            }
        }
    }
});

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        if (!player.isValid()) continue;
        const id = player.id;

        if (jumping[id] === undefined) {
            jumping[id] = player.isJumping;
            sneaking[id] = player.isSneaking;
            player_sleep_state[id] = player.isSleeping;
            can_double_jump[id] = 0;
            shoes_duration[id] = 0;
            fin_duration[id] = 0;
            last_sleep_time[id] = 0;
        }

        let is_wake_up = false, is_riding = player.hasComponent("minecraft:riding");

        if (!player.isSprinting && shoes_duration[id] > 0) shoes_duration[id]--;
        if (!player.isSwimming || !player.isInWater) fin_duration[id] = 1;
        if (player.isSleeping) last_sleep_time[id] = world.getAbsoluteTime();
        if (!is_riding && boat_y_rotation_offset[player] !== undefined) delete boat_y_rotation_offset[id];

        if (jumping[id] !== player.isJumping) jumping[id] = player.isJumping;
        if (sneaking[id] !== player.isSneaking) sneaking[id] = player.isSneaking;
        if (player_sleep_state[id] !== player.isSleeping) {
            player_sleep_state[id] = player.isSleeping;
            if (!player_sleep_state[id]) is_wake_up = true;
        }

        for (const tag of player.getTags()) {
            if (!tag.startsWith("arena:")) continue;

            if (tag === "arena:archaic_warden_claws_archaiccharm" && is_wake_up) {
                if (world.getAbsoluteTime() - last_sleep_time[id] > 200) {
                    const health = player.getComponent("minecraft:health");
                    health.setCurrentValue(health.effectiveMax);
                }
            }
        }
    }
});

world.afterEvents.dataDrivenEntityTrigger.subscribe(s => {
    if (!s.entity.isValid()) return;
    if (s.entity.matches({ families: ["creeper"] }) && flee_creeper[s.entity.id] && s.eventId === "minecraft:start_exploding") {
        if (system.currentTick < flee_creeper[s.entity.id]) s.entity.triggerEvent("minecraft:stop_exploding");
    }
});

system.runInterval(()=>{
    Dimensions.forEach(dimension=>{
        killed_with_extra_loot[dimension.id].forEach(kill_location =>{
            for(let loot of loot_spawned[dimension.id]){
                if(Math.random() < 0.25*CHANCE_MULTIPLIER && Vector.distance(kill_location, loot.location) < 1.25){
                    dimension.spawnItem(loot.getComponent("minecraft:item").itemStack, loot.location);
                }
            }
        });
        killed_with_extra_loot[dimension.id] = [];
        loot_spawned[dimension.id] = [];
    })
});

world.afterEvents.entitySpawn.subscribe(s =>{
    if(s.entity.typeId == "minecraft:item" && s.cause == "Spawned" && s.entity.isValid()) loot_spawned[s.entity.dimension.id].push(s.entity);
})