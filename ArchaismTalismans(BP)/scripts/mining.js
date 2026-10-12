import { world, system } from '@minecraft/server';
import { repair } from "./lib/Frepair";

const RESET_DELAY = 240;
const resetTimers = new Map();

world.afterEvents.playerBreakBlock.subscribe(e => {
    const { player } = e;
    if (!player.hasTag('arena:tool_belt_body')) return;

    let count = player.getDynamicProperty('arena:belt_breaker') ?? 0;
    count++;

    player.setDynamicProperty('arena:belt_breaker', count);
    if (count >= 63) { repair(player) }
    const oldTimeout = resetTimers.get(player.id);
    if (oldTimeout) {
        system.clearRun(oldTimeout);
    }
    const timeoutId = system.runTimeout(() => {
        player.setDynamicProperty('arena:belt_breaker', 0);
        resetTimers.delete(player.id);
    }, RESET_DELAY);
    resetTimers.set(player.id, timeoutId);
});
