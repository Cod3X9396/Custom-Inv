import { system, world } from "@minecraft/server";

const timers = new Map();
const souls = new Map();

function soulSensorTick(player) {
    if (!player.hasTag("arena:deep_knight_helmet_face")) return;
    if (!player.isSneaking) { timers.delete(player.id); return; }
    if (!timers.has(player.id)) { timers.set(player.id, 0); }

    const time = timers.get(player.id);
    const { dimension, location } = player;
    if (time > 2) {
        if (time < 4) {
            dimension.playSound("power.on.sculk_sensor", location);
            player.addEffect("darkness", 20 * 4);
        }
        const targets = dimension.getEntities({ location, maxDistance: 8, excludeFamilies: ["inanimate"], excludeTypes: [ "minecraft:item", "minecraft:ender_crystal", ],});
        for (const target of targets) {
            if (target.id === player.id) continue;
            if (souls.has(target.id)) continue;
            const soul = dimension.spawnEntity( "arena:dummy_soul", target.location );
            souls.set(target.id, soul);
        }
    }
    timers.set(player.id, time + 1);
}

system.runInterval(() => {
    for (const player of world.getPlayers()) { soulSensorTick(player) }
}, 20);