import { world, system } from '@minecraft/server'

const duration = 7;
const damage = 1;
function bleed(attacker, hitEntity) {
    let currentHealth = hitEntity.getComponent('minecraft:health')?.currentValue ?? 0;
    const intervalId = system.runInterval(() => {
        if (!hitEntity?.isValid() || !hitEntity.getComponent('minecraft:health')) {
            system.clearRun(intervalId);
            return;
        }
        const count = hitEntity.getDynamicProperty('twm:bleedingCont') ?? 0;
        if (count >= duration) {
            system.clearRun(intervalId);
            return;
        }
        if (currentHealth <= 0) {
            hitEntity.kill();
            system.clearRun(intervalId);
            return;
        }

        hitEntity.applyDamage(damage, { cause: "magic" });
        hitEntity.dimension.spawnParticle("arena:bleeding", hitEntity.location);
        hitEntity.setDynamicProperty('twm:bleedingCont', count + 1);
        currentHealth -= damage;
    }, 20);
}

const bleedingChances = [
    { tag: 'arena:blood_scythe_charm', chance: 10 },
    { tag: 'arena:lotte_axolotle_doll_doll', chance: 5 },
    { tag: 'arena:iron_bleeding_earring_earring', chance: 4 },
    { tag: 'arena:golden_bleeding_earring_earring', chance: 8 },
    { tag: 'arena:prismarine_bleeding_earring_earring', chance: 12 },
    { tag: 'arena:netherite_bleeding_earring_earring', chance: 16 },
    { tag: 'arena:fallen_bleeding_earring_earring', chance: 20 },
    { tag: 'arena:iron_bleeding_earring_earringdown', chance: 4 },
    { tag: 'arena:golden_bleeding_earring_earringdown', chance: 8 },
    { tag: 'arena:prismarine_bleeding_earring_earringdown', chance: 12 },
    { tag: 'arena:netherite_bleeding_earring_earringdown', chance: 16 },
    { tag: 'arena:fallen_bleeding_earring_earringdown', chance: 20 },
    { tag: 'arena:pure_marble_bleeding_earring_earring', chance: 24 },
    { tag: 'arena:pure_marble_bleeding_earring_earringdown', chance: 24 },
    { tag: 'arena:w_amulet', chance: 20 }
];

world.afterEvents.entityHitEntity.subscribe(e => {
    const { damagingEntity, hitEntity } = e;
    const id = hitEntity.typeId;
    if (damagingEntity?.typeId !== 'minecraft:player') return;
    const ignoredEntities = [ "arena:ignited_explosion", "arena:dummy_platform", "twm:trinket_manager"];
    if (ignoredEntities.some(type => id.includes(type))) return;
    if (!damagingEntity || !hitEntity) return;
    if (hitEntity.hasTag('arena:blazing_ring_ring')) return;
    let bleedingCount = hitEntity.getDynamicProperty('twm:bleedingCont') ?? 0;
    let totalChance = 0;
    let applied = false;

    if ( damagingEntity.getComponent('equippable')?.getEquipment('Mainhand')?.typeId === 'arena:blood_scythe_weapon') { totalChance += 25 }
    if ( damagingEntity.getComponent('equippable')?.getEquipment('Head')?.typeId === 'arena:ichor_helmet') { totalChance += 6 }
    if ( damagingEntity.getComponent('equippable')?.getEquipment('Chest')?.typeId === 'arena:ichor_chestplate') { totalChance += 6 }
    if ( damagingEntity.getComponent('equippable')?.getEquipment('Legs')?.typeId === 'arena:ichor_leggings') { totalChance += 6 }
    if ( damagingEntity.getComponent('equippable')?.getEquipment('Feet')?.typeId === 'arena:ichor_boots') { totalChance += 6 }
    if ( damagingEntity.getComponent('equippable')?.getEquipment('Head')?.typeId === 'arena:ethereal_ichor_helmet') { totalChance += 6 }
    if ( damagingEntity.getComponent('equippable')?.getEquipment('Chest')?.typeId === 'arena:ethereal_ichor_chestplate') { totalChance += 6 }
    if ( damagingEntity.getComponent('equippable')?.getEquipment('Legs')?.typeId === 'arena:ethereal_ichor_leggings') { totalChance += 6 }
    if ( damagingEntity.getComponent('equippable')?.getEquipment('Feet')?.typeId === 'arena:ethereal_ichor_boots') { totalChance += 6 }
    if (!applied) {
        for (const { tag, chance } of bleedingChances) {
            if (damagingEntity.hasTag(tag)) { totalChance += chance }
        }
        if (Math.random() * 100 < totalChance) {
            applied = true;
        }
    }
    if (!applied) return;
    if (bleedingCount === 0 || bleedingCount >= duration) {
        hitEntity.setDynamicProperty('twm:bleedingCont', 0);
        bleed(damagingEntity, hitEntity);
    } else {
        hitEntity.setDynamicProperty('twm:bleedingCont', bleedingCount + 1);
    }
});