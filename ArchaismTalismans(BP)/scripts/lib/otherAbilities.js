import { world, system } from "@minecraft/server";

world.afterEvents.entityDie.subscribe((e) => {
    const { deadEntity, damageSource } = e;
    if (deadEntity?.typeId !== 'minecraft:player') return;

    if (deadEntity.typeId == 'minecraft:player') {
        const { x, y, z } = deadEntity.location
        const deathLocation = { x: x, y: y, z: z, dimension: deadEntity.dimension.id }
        deadEntity.setDynamicProperty('arena:death_location', JSON.stringify(deathLocation))
    }
});
export function dead_teleport(player) {
    const origin = player.location;
    const dim = player.dimension;
    player.playAnimation( "animation.arena_staff.aura", { stopExpression: "query.any_animation_finished" });

    system.runTimeout(() => {
        const raw = player.getDynamicProperty('arena:death_location');
        if (raw) {
            let deathPoint;
            try {
                deathPoint = JSON.parse(raw);
                } catch (e) { 
                    player.playSound("note.bass");
                return;
            }
            player.teleport(
                { x: deathPoint.x, y: deathPoint.y, z: deathPoint.z },
                { dimension: world.getDimension(deathPoint.dimension) }
            );
            player.setDynamicProperty('arena:death_location', undefined);
        }
        system.runTimeout(() => {
            const origin2 = player.location;
            player.playSound("mob.endermen.portal");
            dim.spawnParticle("arena:apollo_hit_emitter", origin2 );
            dim.spawnParticle("arena:hemlock_steady", origin2 );
        }, 20);
    }, 16);
}