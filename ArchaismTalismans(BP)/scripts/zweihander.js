import { world, system } from "@minecraft/server";
import { damageEquipment } from "./lib/damageEquipment";

const CD_PROP = "arena:runic_zweihander_cd";

function now() {
    return system.currentTick;
}

function onCooldown(player) {
    return (player.getDynamicProperty(CD_PROP) ?? 0) > now();
}

function setCooldown(player, ticks) {
    player.setDynamicProperty(CD_PROP, now() + ticks);
}
function getRemainingCooldown(player) {
    const end = player.getDynamicProperty(CD_PROP) ?? 0;
    return Math.max(0, end - system.currentTick);
}

const ZWEIHANDERS = {
  "arena:runic_zweihander": { sweepDamage: 12 },
  "arena:runic_twohanded_sword": { sweepDamage: 20 },
  "arena:incandecent_zweihander": { sweepDamage: 10, fireDuration: 4, particleType: { id: "arena:fire_hit_particle", yP: 1 } },
  "arena:desertic_zweihander": { sweepDamage: 12, potionEffect: { id: "weakness", duration: 180, amplifier: 2 } },
  "arena:frozen_zweihander": { sweepDamage: 12, potionEffect: { id: "slowness", duration: 180, amplifier: 2 }, particleType: { id: "arena:freeze_hit", yP: 0 } },
  "arena:electric_zweihander": { sweepDamage: 17, lightningChance: 5 },
  "arena:hemlock_zweihander": { sweepDamage: 8, potionEffect: { id: "wither", duration: 220, amplifier: 2 } },
  "arena:venemous_zweihander": { sweepDamage: 8, potionEffect: { id: "poison", duration: 200, amplifier: 2 } },
  "arena:ender_zweihander": { sweepDamage: 12, potionEffect: { id: "levitation", duration: 80, amplifier: 2 } }
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
    player.playAnimation("animation.arena_zweihander.attack", { stopExpression: "query.any_animation_finished"});
    player.addEffect('weakness', 20, { amplifier: 10, showParticles: false });
    system.runTimeout(() => {
        const enchantable = item.getComponent("enchantable");
        const unbreaking = enchantable?.getEnchantment("unbreaking")?.level ?? 0;
        damageEquipment(player, (6 - unbreaking));
        const knockback = enchantable?.getEnchantment("knockback")?.level ?? 0;
        const sharpness = enchantable?.getEnchantment("sharpness")?.level ?? 0;
        const fire_aspect = enchantable?.getEnchantment("fire_aspect")?.level ?? 0;
        const sweepDamage = weaponConfig.sweepDamage + (sharpness * 1.2);

        player.playSound("sweep_attack", { location: player.location, volume: 0.8, pitch: 0.6 });
        const { x, y, z } = player.location;
        const dir = player.getViewDirection();
        const dim = player.dimension;
        const px = x + dir.x * 1;
        const py = y + 1;
        const pz = z + dir.z * 1;
        dim.spawnParticle("arena:zweihander_hit", { x: px, y: py, z: pz });

        const entities = dim.getEntities({ location: player.location, maxDistance: 3.5, excludeTypes: ["minecraft:item", "minecraft:xp_orb"]});

        entities.forEach(entity => {
            if (entity === player) return;
            const { x, y, z } = entity.location;
            const dimE = entity.dimension;
            entity.applyDamage(sweepDamage, { cause: "entityAttack", damagingEntity: player });
            entity.applyKnockback(dir.x, dir.z, (2.2 + (knockback * 0.3)), 0.6);
            if (weaponConfig.fireDuration) {
                entity.setOnFire(weaponConfig.fireDuration + (fire_aspect * 2));
            }
            if (weaponConfig.potionEffect) {
                const effect = weaponConfig.potionEffect;
                entity.addEffect( effect.id, effect.duration, {amplifier: effect.amplifier ?? 0, showParticles: true });
            }
            if (weaponConfig.particleType) {
                const particle = weaponConfig.particleType;
                dimE.spawnParticle(particle.id, { x, y: y + (particle.yP ?? 0), z });
            }
            if (weaponConfig.lightningChance) {
                const Chance = weaponConfig.lightningChance;
                if (Chance >= Math.ceil(Math.random() * 100)){
                    dimE.spawnEntity("minecraft:lightning_bolt", { x, y: y + 1, z });
                }
            }
        });
    }, 12);
    setCooldown(player, 20 * 10);
});