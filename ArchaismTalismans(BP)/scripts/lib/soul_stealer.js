import { ItemStack } from "@minecraft/server";
const MOB_DROP_MAP = { 
    "minecraft:zombie":       { item: "arena:zombie_soul",       chance: 0.1 },
    "minecraft:skeleton":     { item: "arena:skeleton_soul",     chance: 0.1 },
    "minecraft:blaze":        { item: "arena:blaze_soul",        chance: 0.05 },
    "minecraft:spider":       { item: "arena:spider_soul",       chance: 0.1 },
    "minecraft:cave_spider":  { item: "arena:cave_spider_soul",  chance: 0.1 },
    "minecraft:magma":        { item: "arena:magma_soul",        chance: 0.05 }
};
const REQUIRED_TAGS = ["arena:soul_taker_head"];
export function handleSoulDrop(attacker, deadEntity) {

    if (!attacker || !attacker.hasTag) return;    const hasRequired = REQUIRED_TAGS.some(tag => attacker.hasTag(tag));
    if (!hasRequired) return;
    const data = MOB_DROP_MAP[deadEntity.typeId];
    if (!data) return;
    if (Math.random() > data.chance) return;
    deadEntity.dimension.spawnParticle("arena:cursed", { x: deadEntity.location.x, y: deadEntity.location.y + 1, z: deadEntity.location.z });

    const drop = new ItemStack(data.item, 1);
    deadEntity.dimension.spawnItem(drop, deadEntity.location);
}