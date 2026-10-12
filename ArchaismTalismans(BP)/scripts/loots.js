import { world, ItemStack } from "@minecraft/server";
import { Vector } from "./trinkets/Vector3";

const DropData = [
    { family: ["mob"], chance: 0.9, loot: "minecraft:gold_nugget" },
    { family: ["mob"], chance: 0.5, loot: "minecraft:gold_nugget" },
    { family: ["monster"], chance: 0.5, loot: "minecraft:gold_nugget" },
    { family: ["mob"], chance: 0.25, loot: "minecraft:gold_nugget" },
    { family: ["monster"], chance: 0.25, loot: "minecraft:gold_nugget" },
    { family: ["mob"], chance: 0.1, loot: "minecraft:gold_nugget" },
    { family: ["monster"], chance: 0.1, loot: "minecraft:gold_ingot" }
];

world.afterEvents.entityDie.subscribe(event => {
    const { deadEntity, damageSource } = event;
    const attacker = damageSource?.damagingEntity;
    if (!attacker || attacker.typeId !== "minecraft:player" || deadEntity.typeId === "minecraft:player") return;

    if (!attacker.hasTag("arena:midas_finger_talisman") && !attacker.hasTag("arena:coin_ring_ring") && 
        !attacker.hasTag("arena:greedy_ring_ring")) return;
    if (Math.random() >= 0.5) return;

    for (const data of DropData) {
        if (Math.random() > data.chance) continue;
        if (data.family) {
            if (!deadEntity.matches({ families: data.family })) continue;
        }
        const pos = Vector.add(deadEntity.location, { x: Math.random() - 0.5, y: 0, z: Math.random() - 0.5 });
        deadEntity.dimension.spawnItem(new ItemStack(data.loot, 1), pos);
    }
});