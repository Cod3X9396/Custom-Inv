export const BLOCKDROP_MAPS = [
    { anyTags: [ "arena:unnatural_mask_face" ],
        drops: {
            "minecraft:coal_ore": { item: "minecraft:coal" },
            "minecraft:deepslate_coal_ore": { item: "minecraft:coal" },
            "minecraft:copper_ore": { item: "minecraft:raw_copper" },
            "minecraft:deepslate_copper_ore": { item: "minecraft:raw_copper" },
            "minecraft:iron_ore": { item: "minecraft:raw_iron" },
            "minecraft:deepslate_iron_ore": { item: "minecraft:raw_iron" },
            "minecraft:gold_ore": { item: "minecraft:raw_gold" },
            "minecraft:deepslate_gold_ore": { item: "minecraft:raw_gold" },
            "minecraft:lapis_ore": { item: "minecraft:lapis_lazuli", min: 1, max: 3 },
            "minecraft:deepslate_lapis_ore": { item: "minecraft:lapis_lazuli", min: 1, max: 3 },
            "minecraft:redstone_ore": { item: "minecraft:redstone", min: 1, max: 3 },
            "minecraft:lit_redstone_ore": { item: "minecraft:redstone", min: 1, max: 3 },
            "minecraft:deepslate_redstone_ore": { item: "minecraft:redstone", min: 1, max: 3 },
            "minecraft:lit_deepslate_redstone_ore": { item: "minecraft:redstone", min: 1, max: 3 },
            "minecraft:diamond_ore": { item: "minecraft:diamond" },
            "minecraft:deepslate_diamond_ore": { item: "minecraft:diamond" },
            "minecraft:emerald_ore": { item: "minecraft:emerald" },
            "minecraft:deepslate_emerald_ore": { item: "minecraft:emerald" },
            "minecraft:nether_gold_ore": { item: "minecraft:gold_nugget", min: 1, max: 6 },
            "minecraft:quartz_ore": { item: "minecraft:quartz" }
        }
    },
    { anyTags: [ "arena:natural_butterfly_mask_face" ],
        drops: {
            "minecraft:potatoes": { item: "minecraft:potato", min: 1, max: 2 },
            "minecraft:carrots": { item: "minecraft:carrot", min: 1, max: 2 },
            "minecraft:beetroot": { item: "minecraft:beetroot", min: 1, max: 3 },
            "minecraft:wheat": { item: "minecraft:wheat" },
            "minecraft:melon_block": { item: "minecraft:melon_slice", min: 1, max: 2 }
        }
    },
    { anyTags: ["arena:spawner_breaker_gauntlet", "arena:spawner_breaker_gauntletleft"],
        drops: {
            "minecraft:mob_spawner": {
                item: "arena:spawner_fragment",
                min: 1,
                max: 8
            }
        }
    }
];
