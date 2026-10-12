import { world, ItemStack } from '@minecraft/server'

const arLootTable = [
    { type: 'minecraft:ender_dragon', drops: [
        { item: 'arena:dragon_scale', amount: 9, prob: 100 }]
    },
    { family: ['warden'], drops: [
            { item: 'arena:warden_heart', amount: 1, prob: 100 }
        ]
    },
    { family: ['piglin_brute'], drops: [
            { item: 'arena:piglin_bracelet', amount: 1, prob: 5 }
        ]
    },
    { family: ['villager'], drops: [
        { item: 'arena:villager_heart', amount: 1, prob: 2 }]
    },
    { family: ['wandering_trader'], drops: [
            { item: 'arena:villager_heart', amount: 1, prob: 2 }
        ]
    },
    { family: ['cavespider'], drops: [
            { item: 'arena:poisonous_shard', amount: 1, prob: 3 }
        ]
    },
    { family: ['wither'], drops: [
            { item: 'arena:wither_fragment', amount: 1, prob: 4 }
        ]
    },
    { family: ['husk'], drops: [
            { item: 'arena:arid_shard', amount: 1, prob: 3 }
        ]
    },
    { family: ['parched'], drops: [
        { item: 'arena:arid_shard', amount: 1, prob: 3 }]
    },
    { family: ['camel_husk'], drops: [
        { item: 'arena:arid_shard', amount: 1, prob: 8 }]
    },
    { family: ['illager'], drops: [
        { item: 'arena:discount_card', amount: 1, prob: 2 }]
    },
    { family: ['witch'], drops: [
        { item: 'arena:poisonous_shard', amount: 1, prob: 15 }]
    },
    { family: ['slime'], drops: [
        { item: 'arena:poisonous_shard', amount: 1, prob: 2 }]
    },
    { family: ['bogged'], drops: [
        { item: 'arena:poisonous_shard', amount: 1, prob: 3 }]
    },
    { family: ['blaze'], drops: [
            { item: 'arena:flammable_shard', amount: 1, prob: 3 }
        ]
    },
    { family: ['magmacube'], drops: [{ item: 'arena:flammable_shard', amount: 1, prob: 3 }]
    },
    { family: ['shulker'], drops: [
            { item: 'arena:levitation_shard', amount: 1, prob: 5 }
        ]
    },
    { family: ['enderman'], drops: [
            { item: 'arena:levitation_shard', amount: 1, prob: 3 }
        ]
    },
    { family: ['polarbear'], drops: [
        { item: 'arena:cold_shard', amount: 1, prob: 8 }]
    },
    { family: ['stray'], drops: [
            { item: 'arena:cold_shard', amount: 1, prob: 3 }
        ]
    },
    { family: ['guardian_elder'], drops: [
            { item: 'arena:electric_shard', amount: 3, prob: 100 }
        ]
    },
    { family: ['guardian'], drops: [{ item: 'arena:electric_shard', amount: 1, prob: 5 }]
    },
    { family: ['drowned'], drops: [
            { item: 'arena:electric_shard', amount: 1, prob: 2 }
        ]
    },
    { family: ['irongolem'], drops: [
        { item: 'arena:iron_golem_heart', amount: 1, prob: 2 }]
    }
];

world.afterEvents.entityDie.subscribe(event => {
    const { deadEntity, damageSource } = event;
    const player = damageSource.damagingEntity;
    if (deadEntity.hasComponent('minecraft:is_tamed')) return;

    for (const entry of arLootTable) {
        const matchType = entry.type ? deadEntity.typeId === entry.type : false;
        const matchFamily = entry.family ? deadEntity.matches({ families: entry.family }) : false;

        if (matchType || matchFamily) {
            for (const drop of entry.drops) {
                if (Math.random() * 100 <= drop.prob) {
                    try {
                        deadEntity.dimension.spawnItem(new ItemStack(drop.item, drop.amount), deadEntity.location);
                    } catch {
                        player.dimension.spawnItem(new ItemStack(drop.item, drop.amount), player.location);
                    }
                }
            }
            break;
        }
    }
});