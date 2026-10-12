import { world, system } from "@minecraft/server";

const INSOMNIA_TAG = "arena:insomnia_active";
const INSOMNIA_PROP = "arena:insomnia_time";

function applyInsomnia(entity, duration, finalDamage) {
    if (!entity?.isValid() || !entity.getComponent('minecraft:health')) {
        return;
    }
    if (entity.hasTag(INSOMNIA_TAG)) return;
    entity.addTag(INSOMNIA_TAG);
    entity.setDynamicProperty(INSOMNIA_PROP, duration);

    const interval = system.runInterval(() => { if (!entity.isValid()) { cleanup(entity, interval); return; }
        let timeLeft = entity.getDynamicProperty(INSOMNIA_PROP);
        if (typeof timeLeft !== "number") timeLeft = 0;
        if (timeLeft <= 0) { 
            entity.applyDamage(finalDamage, { cause: "magic" }); 
            entity.dimension.spawnParticle("arena:critical_hit_emitter", {x: entity.location.x, y: entity.location.y, z: entity.location.z});
            cleanup(entity, interval); 
            return; 
        }
        entity.dimension.spawnParticle("arena:insomnia", { x: entity.location.x, y: entity.location.y + 0.1, z: entity.location.z });
        entity.setDynamicProperty(INSOMNIA_PROP, timeLeft - 1);
    }, 20);
}

function cleanup(entity, interval) {
    try { entity.removeTag(INSOMNIA_TAG); entity.setDynamicProperty(INSOMNIA_PROP, undefined); } catch {}
    system.clearRun(interval);
}

const insomniaChances = [
    { tag: "arena:drak_doll_doll", chance: 100, duration: 3, finalDamage: 2 },
    { tag: "arena:nocturnal_hood_talisman", chance: 100, duration: 6, finalDamage: 4 },
    { tag: "arena:tears_unshed_charm", chance: 40, duration: 10, finalDamage: 6 },
    { tag: "arena:nights_devouring_mask_face", chance: 50, duration: 5, finalDamage: 10 },

    { tag: "arena:iron_insomnia_earring_earring", chance: 5, duration: 15, finalDamage: 4 },
    { tag: "arena:golden_insomnia_earring_earring", chance: 10, duration: 12, finalDamage: 6 },
    { tag: "arena:prismarine_insomnia_earring_earring", chance: 15, duration: 9, finalDamage: 8 },
    { tag: "arena:netherite_insomnia_earring_earring", chance: 20, duration: 6, finalDamage: 10 },
    { tag: "arena:fallen_insomnia_earring_earring", chance: 25, duration: 5, finalDamage: 12 },
    { tag: "arena:iron_insomnia_earring_earringdown", chance: 5, duration: 15, finalDamage: 4 },
    { tag: "arena:golden_insomnia_earring_earringdown", chance: 10, duration: 12, finalDamage: 6 },
    { tag: "arena:prismarine_insomnia_earring_earringdown", chance: 15, duration: 9, finalDamage: 8 },
    { tag: "arena:netherite_insomnia_earring_earringdown", chance: 20, duration: 6, finalDamage: 10 },
    { tag: "arena:fallen_insomnia_earring_earringdown", chance: 25, duration: 5, finalDamage: 12 },
    { tag: "arena:pure_marble_insomnia_earring_earring", chance: 30, duration: 5, finalDamage: 14 },
    { tag: "arena:pure_marble_insomnia_earring_earringdown", chance: 30, duration: 5, finalDamage: 14 }
];

world.afterEvents.entityHurt.subscribe(e => {
    const { damageSource, hurtEntity } = e;
    const id = hurtEntity.typeId;
    if (damageSource.damagingEntity?.typeId !== 'minecraft:player') return;
    const ignoredEntities = [ "arena:ignited_explosion", "arena:dummy_platform", "twm:trinket_manager"];
    if (ignoredEntities.some(type => id.includes(type))) return;
    if (!hurtEntity || !damageSource.damagingEntity) return;
    const attacker = damageSource.damagingEntity;
    if (!attacker) return;
    const time = world.getTimeOfDay();
    if (time < 13000 || time > 23000) return;
    if (hurtEntity.hasTag(INSOMNIA_TAG)) return;

    let totalDuration = 0;
    let finalDamage = 0;

    for (const entry of insomniaChances) {
        if (attacker.hasTag(entry.tag) && Math.random() * 100 < entry.chance
        ) {
            totalDuration += entry.duration;
            finalDamage += entry.finalDamage;
        }
    }
    if (totalDuration <= 0) return;
    hurtEntity.addEffect('weakness', totalDuration * 20, { amplifier: 2, showParticles: true });
    applyInsomnia(hurtEntity, totalDuration, finalDamage);
});