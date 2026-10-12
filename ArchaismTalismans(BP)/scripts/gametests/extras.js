import { EquipmentSlot } from "@minecraft/server";
import { system, world, Entity, Player } from "@minecraft/server";
export const Overworld = world.getDimension('overworld');
export const afterEvents = world.afterEvents;
export const beforeEvents = world.beforeEvents;
export function sleep(ticks) {
    return new Promise((resolve) => system.runTimeout(resolve, ticks));
}
export function repeat(times, callback) {
    for (let i = 0; i < times; i++) {
        callback();
    }
}
export function setHealth(entity, reset) {
    const level = entity.getDynamicProperty('level') ?? 0;
    if (level < 5)
        return entity.removeEffect('health_boost');
    if (reset)
        entity.removeEffect('health_boost');
    entity.addEffect('health_boost', 20 * 60 * 9999.5, {
        showParticles: false,
        amplifier: Math.min(Math.floor(level / 5) - 1, 255)
    });
    const health = entity.health;
    health?.setCurrentValue(health.effectiveMax);
}
export function getWorldSpawn() {
    const spawn = world.getDefaultSpawnLocation();
    const ray = Overworld.getBlockFromRay({ ...spawn, y: 320 }, Vector.down, {
        includeLiquidBlocks: true,
        maxDistance: 400
    });
    if (!ray)
        return spawn;
    let { block: { x, y, z } } = ray;
    x += .5;
    y += 1;
    z += .5;
    return { x, y, z };
}
export function cloneItemStackInfo(item, next) {
    next.nameTag = item.nameTag;
    next.amount = item.amount;
    next.keepOnDeath = item.keepOnDeath;
    next.lockMode = item.lockMode;
    next.setCanDestroy(item.getCanDestroy());
    next.setLore(item.getLore());
    const durability1 = item.getComponent('durability');
    const durability2 = next.getComponent('durability');
    durability2.damage = durability1.damage;
    const ench1 = item.getComponent('enchantable');
    if (ench1) {
        const ench2 = next.getComponent('enchantable');
        ench2?.addEnchantments(ench1.getEnchantments());
    }
    return next;
}
export class Vector {
    x;
    y;
    z;
    static up = { x: 0, y: 1, z: 0 };
    static down = { x: 0, y: -1, z: 0 };
    static forward = { x: 0, y: 0, z: 1 };
    static back = { x: 0, y: 0, z: -1 };
    static left = { x: -1, y: 0, z: 0 };
    static right = { x: 1, y: 0, z: 0 };
    static zero = { x: 0, y: 0, z: 0 };
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    static floor(vector) {
        return {
            x: Math.floor(vector.x),
            y: Math.floor(vector.y),
            z: Math.floor(vector.z)
        };
    }
    static equals(vectorA, vectorB) {
        return JSON.stringify(Vector.floor(vectorA)) === JSON.stringify(Vector.floor(vectorB));
    }
    static length(vector) {
        return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    }
    static multiply(vectorA, value) {
        return {
            x: vectorA.x * (typeof value === 'number' ? value : value.x ?? 1),
            y: vectorA.y * (typeof value === 'number' ? value : value.y ?? 1),
            z: vectorA.z * (typeof value === 'number' ? value : value.z ?? 1)
        };
    }
    static add(vectorA, vectorB) {
        return {
            x: vectorA.x + (vectorB.x ?? 0),
            y: vectorA.y + (vectorB.y ?? 0),
            z: vectorA.z + (vectorB.z ?? 0)
        };
    }
    static subtract(vectorA, vectorB) {
        return {
            x: vectorA.x - (vectorB.x ?? 0),
            y: vectorA.y - (vectorB.y ?? 0),
            z: vectorA.z - (vectorB.z ?? 0)
        };
    }
    static distance(vectorA, vectorB) {
        return Math.sqrt(Math.pow(vectorA.x - vectorB.x, 2)
            + Math.pow(vectorA.y - vectorB.y, 2)
            + Math.pow(vectorA.z - vectorB.z, 2));
    }
    static normalize(vector) {
        const len = Vector.length(vector);
        return new Vector(vector.x / len, vector.y / len, vector.z / len);
    }
}
// @ts-ignore
Entity.prototype.isPlayer = function () {
    return this.typeId === "minecraft:player";
};
Object.defineProperties(Entity.prototype, {
    health: {
        get: function () {
            return this.getComponent('health');
        }
    },
    inventory: {
        get: function () {
            const inventory = this.getComponent('inventory');
            if (inventory)
                return inventory;
            throw new Error('MC error: Please do /reload');
        }
    },
    equippable: {
        get: function () {
            const equippable = this.getComponent('equippable');
            if (equippable || !this.isPlayer())
                return equippable;
            throw new Error('MC error: Please do /reload');
        }
    }
});
Player.prototype.getMainhand = function () {
    return this.equippable.getEquipment(EquipmentSlot.Mainhand);
};
