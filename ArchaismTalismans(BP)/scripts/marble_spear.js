import { world, system } from "@minecraft/server";
import { damageEquipment } from "./lib/damageEquipment";

const CD_PROP = "arena:marble_spear_cd";

function calculateDirectionVector(player) {
    const yaw = player.getRotation().y * (Math.PI / 180);
    return { x: -Math.sin(yaw), z: Math.cos(yaw) };
}
function getPositionInFront(player, distance) {
    const { x, y, z } = player.location;
    const direction = calculateDirectionVector(player);
    return { x: x + direction.x * distance, y: y, z: z + direction.z * distance };
}
function now() { return system.currentTick }
function onCooldown(player) { return (player.getDynamicProperty(CD_PROP) ?? 0) > now() }

function setCooldown(player, ticks) { player.setDynamicProperty(CD_PROP, now() + ticks) }
function getRemainingCooldown(player) {
    const end = player.getDynamicProperty(CD_PROP) ?? 0;
    return Math.max(0, end - system.currentTick);
}
const ZWEIHANDERS = {
  "arena:pure_marble_spear": { sweepDamage: 15 }
};
world.afterEvents.itemUse.subscribe(e => {
    const player = e.source;
    const item = e.itemStack;
    const weaponConfig = ZWEIHANDERS[item.typeId];
    if (!weaponConfig) return;
    if (onCooldown(player)) {
        const remaining = Math.ceil(getRemainingCooldown(player) / 20);
        player.onScreenDisplay.setActionBar(`Cooldown: §c${remaining}s`);
        return;
    }
    player.playAnimation("animation.arena_marble.wind", { stopExpression: "query.any_animation_finished"});
    player.addEffect('weakness', 40, { amplifier: 10, showParticles: false });
    system.runTimeout(() => {
        player.playSound("fire.fire", { location: player.location, volume: 0.8, pitch: 0.6 });
        const enchantable = item.getComponent("enchantable");
        const unbreaking = enchantable?.getEnchantment("unbreaking")?.level ?? 0;
        damageEquipment(player, (6 - unbreaking));
        const knockback = enchantable?.getEnchantment("knockback")?.level ?? 0;
        for (let i = 1; i <= 5; i++) {
            const position = getPositionInFront(player, i);
            const particlePos = { x: position.x, y: position.y + 1.2, z: position.z };
            player.dimension.spawnParticle('minecraft:breeze_wind_explosion_emitter', particlePos);

            const entities = player.dimension.getEntities({ location: position, maxDistance: 9, excludeTypes: ["minecraft:player", "minecraft:item", "minecraft:xp_orb"] });
            entities.forEach(entity => {
                const { x, z } = calculateDirectionVector(player);
                entity.applyKnockback(x, z, (-2.2 - (knockback * 0.3)), 0.3 );
                entity.addEffect('slowness', 100, { amplifier: 2, showParticles: false });
            });
        }
        player.playAnimation("animation.arena_spear.attack", { stopExpression: "query.any_animation_finished"});
        system.runTimeout(() => {
            const enchantable = item.getComponent("enchantable");''
            const sharpness = enchantable?.getEnchantment("sharpness")?.level ?? 0;
            const sweepDamage = weaponConfig.sweepDamage + (sharpness * 1.2);

            player.playSound("sweep_attack", { location: player.location, volume: 0.8, pitch: 1.25 });
            const { x, y, z } = player.location;
            const dir = player.getViewDirection();
            const dim = player.dimension;
            const px = x + dir.x * 1;
            const py = y + 1;
            const pz = z + dir.z * 1;
            dim.spawnParticle("arena:spear_hit", { x: px, y: py, z: pz });

            const entities = dim.getEntities({ location: player.location, maxDistance: 5, excludeTypes: ["minecraft:item", "minecraft:xp_orb"]});

            entities.forEach(entity => {
                if (entity === player) return;
                const { x, y, z } = entity.location;
                const dimE = entity.dimension;
                entity.applyDamage(sweepDamage, { cause: "entityAttack", damagingEntity: player });
                entity.applyKnockback(dir.x, dir.z, (2.2 + (knockback * 0.3)), 0.6);
            });
        }, 12);
    }, 16);
    setCooldown(player, 20 * 10);
});