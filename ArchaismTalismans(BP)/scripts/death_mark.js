import { world, system } from "@minecraft/server";

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        if (!player.hasTag("arena:archaic_arnold_archaiccharm")) continue;
        const health = player.getComponent("minecraft:health");
        if (!health || health.currentValue <= 0) continue;
        const CurrentHealth = health.currentValue;

        if (CurrentHealth >= 20) {
            player.applyDamage(2, { cause: 'void' });
        } else {
            player.applyDamage(1, { cause: 'void' });    
        }
        player.playSound("mob.wither.ambient", { volume: 0.2, pitch: 0.4 });
        player.dimension.spawnParticle("arena:death_mark", { x: player.location.x, y: player.location.y +0.1, z: player.location.z});
    }
}, 60);