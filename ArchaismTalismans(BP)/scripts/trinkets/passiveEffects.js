import { world } from '@minecraft/server'
function capSaysItsBuggy(dimension, location) {
    try { return dimension.getBlock(location) } catch { return 'air' }
}
export function getPassiveEffects(player) {
    const feetBlock = capSaysItsBuggy(player.dimension, player.location);
    const headBlock = feetBlock?.above(1);
    const belowBlock = feetBlock?.below(1);

    const mainhand = player.getComponent('minecraft:equippable').getEquipment('Mainhand');
    const headItem = player.getComponent('equippable')?.getEquipment('Head');
    const chestItem = player.getComponent('equippable')?.getEquipment('Chest');
    const legsItem = player.getComponent('equippable')?.getEquipment('Legs');
    const feetItem = player.getComponent('equippable')?.getEquipment('Feet');
    const id = mainhand?.typeId;
    const amount = mainhand?.amount;
    return {   
        'twm:night_vision_goggles_head': [ { effect: 'night_vision', level: 1, effectTime: 330, condition: 1 } ],
        'twm:night_vision_mask_face': [ { effect: 'night_vision', level: 1, effectTime: 330, condition: 1 } ],
        'twm:obsidian_skull_charm': [ { effect: 'fire_resistance', level: 1, effectTime: 330, condition: !headBlock?.typeId?.includes('lava') && !feetBlock?.typeId?.includes('lava') } ],
        'twm:abyssal_diver_helmet_head': [ { effect: 'water_breathing', level: 1, effectTime: 330, condition: 1 } ],
        'twm:abyssal_orb_charm': [ { effect: 'conduit_power', level: 1, effectTime: 330, condition: 1 } ],
        'twm:abyssal_essence_archaiccharm': [
            { effect: 'conduit_power', level: 1, effectTime: 330, condition: 1 },
            { effect: 'strength', level: 2, effectTime: 330, condition: headBlock.typeId?.includes('water') && feetBlock?.typeId?.includes('water') },
            { effect: 'mining_fatigue', level: 2, effectTime: 330, condition: 1 }
        ],
        'twm:tideforged_carapace_body': [ { effect: 'resistance', level: 1, effectTime: 330, condition: headBlock.typeId?.includes('water') && feetBlock?.typeId?.includes('water') } ],
        'twm:runner_ring_ring': [
            { effect: 'speed', level: 1, effectTime: 330, condition: 1 },
            { effect: 'weakness', level: 1, effectTime: 330, condition: 1 }
        ],
        'twm:healer_ring_ring': [
            { effect: 'regeneration', level: 1, effectTime: 330, condition: 1 },
            { effect: 'mining_fatigue', level: 1, effectTime: 330, condition: 1 }
        ],
        'twm:miner_ring_ring': [ { effect: 'haste', level: 1, effectTime: 330, condition: 1 } ],
        'twm:heavy_runner_ring_witherring': [
            { effect: 'speed', level: 1, effectTime: 330, condition: 1 },
            { effect: 'weakness', level: 1, effectTime: 330, condition: 1 }
        ],
        'twm:heavy_healer_ring_witherring': [
            { effect: 'regeneration', level: 1, effectTime: 330, condition: 1 },
            { effect: 'mining_fatigue', level: 2, effectTime: 330, condition: 1 }
        ],
        'twm:heavy_miner_ring_witherring': [ { effect: 'haste', level: 2, effectTime: 330, condition: 1 } ],
        'twm:heavy_warrior_ring_witherring': [ { effect: 'strength', level: 1, effectTime: 330, condition: 1 } ],
        'twm:heavy_runner_ring_witherringdown': [
            { effect: 'speed', level: 1, effectTime: 330, condition: 1 },
            { effect: 'weakness', level: 1, effectTime: 330, condition: 1 }
        ],
        'twm:heavy_healer_ring_witherringdown': [
            { effect: 'regeneration', level: 1, effectTime: 330, condition: 1 },
            { effect: 'mining_fatigue', level: 2, effectTime: 330, condition: 1 }
        ],
        'twm:heavy_miner_ring_witherringdown': [ { effect: 'haste', level: 2, effectTime: 330, condition: 1 } ],
        'twm:heavy_warrior_ring_witherringdown': [ { effect: 'strength', level: 1, effectTime: 330, condition: 1 } ],
        'twm:sacred_heart_heartycharm': [
            { effect: 'regeneration', level: 1, effectTime: 330, condition: 1 },
            { effect: 'mining_fatigue', level: 3, effectTime: 330, condition: 1 },
            { effect: 'weakness', level: 3, effectTime: 330, condition: 1 }
        ],
        'twm:wither_heart_heartycharm': [ { effect: 'regeneration', level: 1, effectTime: 330, condition: 1 } ],
        'twm:rush_of_fear_necklace': [ { effect: 'weakness', level: 4, effectTime: 330, condition: 1 } ],
        'twm:rabbit_rush_necklace': [ { effect: 'weakness', level: 1, effectTime: 330, condition: 1 } ],
        'twm:bloodbound_amulet_amulet': [ { effect: 'weakness', level: 2, effectTime: 330, condition: 1 } ],
        'twm:blood_pendant_necklace': [ { effect: 'weakness', level: 2, effectTime: 330, condition: 1 } ],
        'twm:bloodtide_chalice_charm': [ { effect: 'weakness', level: 1, effectTime: 330, condition: 1 } ],
        'twm:idle_bloom_body': [ { effect: 'regeneration', level: 1, effectTime: 330, condition: player.getVelocity().x == 0 && player.getVelocity().y == 0 && player.getVelocity().z == 0 } ],
        'twm:dragon_heart_heartycharm': [
            { effect: 'regeneration', level: 1, effectTime: 330, condition: 1 },
            { effect: 'mining_fatigue', level: 5, effectTime: 330, condition: 1 }
        ],
        'twm:strong_brute_ring_witherring': [ { effect: 'strength', level: 1, effectTime: 330, condition: 1 } ],
        'twm:strong_fortress_ring_witherring': [ { effect: 'fire_resistance', level: 1, effectTime: 330, condition: 1 } ],
        'twm:strong_jade_ring_witherring': [
            { effect: 'regeneration', level: 1, effectTime: 330, condition: 1 },
            { effect: 'mining_fatigue', level: 2, effectTime: 330, condition: 1 }
        ],
        'twm:strong_trader_ring_witherring': [ { effect: 'village_hero', level: 1, effectTime: 330, condition: 1 } ],
        'twm:strong_brute_ring_witherringdown': [ { effect: 'strength', level: 1, effectTime: 330, condition: 1 } ],
        'twm:strong_fortress_ring_witherringdown': [ { effect: 'fire_resistance', level: 1, effectTime: 330, condition: 1 } ],
        'twm:strong_jade_ring_witherringdown': [
            { effect: 'regeneration', level: 1, effectTime: 330, condition: 1 },
            { effect: 'mining_fatigue', level: 2, effectTime: 330, condition: 1 }
        ],
        'twm:strong_trader_ring_witherringdown': [ { effect: 'village_hero', level: 1, effectTime: 330, condition: 1 } ],
        'twm:abyssal_sun_amulet_amulet': [ { effect: 'regeneration', level: 1, effectTime: 330, condition: headBlock.typeId?.includes('lava') && feetBlock?.typeId?.includes('lava') } ],
        'bloodemblem_active': [ { effect: 'strength', level: 1, effectTime: 330, condition: 1 } ],
        ////////////////////////////////////////////// Archaism Talisman 
        'arena:piece_of_time_charm': [ { effect: 'regeneration', level: 1, effectTime: 60, condition: feetBlock?.typeId?.includes('soul_sand') } ],
        'arena:extreme_had_head': [ { effect: 'weakness', level: 1, effectTime: 330, condition: 1 } ],
        'arena:ethereal_sight_mask_face': [ { effect: 'strength', level: 1, effectTime: 330, condition: player.dimension.id == 'minecraft:the_end' } ],
        'arena:blaze_skull_mask_face': [
            { effect: 'strength', level: 2, effectTime: 330, condition: player.dimension.id == 'minecraft:nether' },

            { effect: 'weakness', level: 2, effectTime: 330, condition: player.dimension.id == 'minecraft:overworld' },

            { effect: 'fire_resistance', level: 1, effectTime: 330, condition: 1 },
        ],
        'arena:poseidon_mask_face': [ { effect: 'strength', level: 2, effectTime: 60, condition: headBlock.typeId?.includes('water') && feetBlock?.typeId?.includes('water') } ],
        'arena:natural_butterfly_mask_face': [ { effect: 'blindness', level: 1, effectTime: 330, condition: 1 } ],
        'arena:unnatural_mask_face': [
            { effect: 'haste', level: 3, effectTime: 330, condition: 1 },
            { effect: 'hunger', level: 2, effectTime: 330, condition: 1 }
        ],
        'arena:demon_mask_face': [
            { effect: 'haste', level: 1, effectTime: 330, condition: 1 },
            { effect: 'haste', level: 2, effectTime: 330, condition: player.hasTag('mask9_ready') },
            { effect: 'speed', level: 1, effectTime: 330, condition: player.hasTag('mask9_ready') }
        ],
        'arena:cat_mask_face': [
            { effect: 'weakness', level: 2, effectTime: 330, condition: !player.hasTag('light_off') },
            { effect: 'mining_fatigue', level: 1, effectTime: 330, condition: !player.hasTag('light_off') },
            { effect: 'jump_boost', level: 2, effectTime: 330, condition: !player.isSneaking },
            { effect: 'jump_boost', level: 5, effectTime: 60, condition: player.isSneaking },
            { effect: 'speed', level: 1, effectTime: 330, condition: 1 },
            { effect: 'night_vision', level: 1, effectTime: 360, condition: player.hasTag('light_off') },
            { effect: 'invisibility', level: 1, effectTime: 60, condition: player.hasTag('light_off') && player.isSneaking }
        ],
        'arena:wither_mask_face': [
            { effect: 'weakness', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue >= 8 },
            { effect: 'weakness', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue >= 10 },
            { effect: 'weakness', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue >= 21 },
            { effect: 'weakness', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue >= 30 },
            { effect: 'weakness', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue >= 40 },
            { effect: 'resistance', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 10 },
            { effect: 'fire_resistance', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 10 },
            { effect: 'speed', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 10 },
            { effect: 'speed', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 6 }
        ],
        'arena:feared_end_hat_face': [
            { effect: 'weakness', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 5 },
            { effect: 'weakness', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 10 },
            { effect: 'speed', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 14 },
            { effect: 'speed', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 8 }
        ],
        'arena:apollo_replies_belt_body': [
            { effect: 'weakness', level: 1, effectTime: 330, condition: 1 }
        ],
        'arena:tool_belt_body': [
            { effect: 'weakness', level: 3, effectTime: 330, condition: 1 },
            { effect: 'haste', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:belt_breaker') >= 19 },
            { effect: 'haste', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:belt_breaker') >= 63 },
            { effect: 'haste', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:belt_breaker') >= 127 },
            { effect: 'haste', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:belt_breaker') >= 191 },
            { effect: 'haste', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:belt_breaker') >= 255 }
        ],
        'arena:angelic_mask_face': [
            { effect: 'speed', level: 2, effectTime: 330, condition: 1 },
            { effect: 'blindness', level: 1, effectTime: 330, condition: world.getTimeOfDay() >= 13000 },
            { effect: 'mining_fatigue', level: 1, effectTime: 330, condition: world.getTimeOfDay() >= 13000 },
            { effect: 'hunger', level: 2, effectTime: 330, condition: world.getTimeOfDay() >= 13000 }
        ],
        'arena:fallen_angel_mask_face': [
            { effect: 'blindness', level: 1, effectTime: 330, condition: world.getTimeOfDay() <= 13000 },
            { effect: 'mining_fatigue', level: 1, effectTime: 330, condition: world.getTimeOfDay() <= 13000 },
            { effect: 'hunger', level: 2, effectTime: 330, condition: world.getTimeOfDay() <= 13000 }
        ],
        'arena:sighthood_body': [
            { effect: 'weakness', level: 3, effectTime: 330, condition: world.getTimeOfDay() >= 13000 },
            { effect: 'slowness', level: 2, effectTime: 330, condition: world.getTimeOfDay() >= 13000 },
            { effect: 'weakness', level: 3, effectTime: 330, condition: player.dimension.id == 'minecraft:nether' },
            { effect: 'slowness', level: 2, effectTime: 330, condition: player.dimension.id == 'minecraft:the_end' }
        ],
        'arena:nighthood_body': [
            { effect: 'weakness', level: 3, effectTime: 330, condition: world.getTimeOfDay() <= 13000 },
            { effect: 'slowness', level: 2, effectTime: 330, condition: world.getTimeOfDay() <= 13000 }
        ],
        'arena:piglin_bracelet_charm': [
            { effect: 'strength', level: 1, effectTime: 60, condition: chestItem?.typeId == 'arena:piglin_bracelet_chestplate' && mainhand?.typeId == 'minecraft:golden_axe' },
            { effect: 'resistance', level: 1, effectTime: 330, condition: chestItem?.typeId == 'arena:piglin_bracelet_chestplate' }
        ],
        'arena:harmony_talisman_talisman': [ { effect: 'weakness', level: 2, effectTime: 330, condition: 1 } ],
        'arena:sync_sculk_talisman_talisman': [ { effect: 'regeneration', level: 1, effectTime: 330, condition: player.getVelocity().x == 0 && player.getVelocity().y == 0 && player.getVelocity().z == 0 } ],
        'arena:archaic_soul_hand_archaiccharm': [ { effect: 'fire_resistance', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 10 } ],
        'arena:archaic_ruler_of_prismas_archaiccharm': [
            { effect: 'weakness', level: 2, effectTime: 330, condition: headBlock.typeId?.includes('air') && feetBlock?.typeId?.includes('air') },
            { effect: 'mining_fatigue', level: 1, effectTime: 330, condition: headBlock.typeId?.includes('air') && feetBlock?.typeId?.includes('air') },
            { effect: 'conduit_power', level: 4, effectTime: 330, condition: 1 }
        ],
        'arena:conscious_star_archaiccharm': [ { effect: 'fire_resistance', level: 1, effectTime: 330, condition: 1 } ],
        'arena:conscious_charge': [
            { effect: 'strength', level: 2, effectTime: 330, condition: 1 },
            { effect: 'speed', level: 2, effectTime: 330, condition: 1 }
        ],
        'arena:jump_copper_wither_ring_witherring': [ { effect: 'jump_boost', level: 2, effectTime: 330, condition: 1 } ],
        'arena:jump_iron_wither_ring_witherring': [ { effect: 'jump_boost', level: 3, effectTime: 330, condition: 1 } ],
        'arena:jump_golden_wither_ring_witherring': [ { effect: 'jump_boost', level: 4, effectTime: 330, condition: 1 } ],
        'arena:jump_prismarine_wither_ring_witherring': [ { effect: 'jump_boost', level: 5, effectTime: 330, condition: 1 } ],
        'arena:jump_marble_wither_ring_witherring': [ { effect: 'jump_boost', level: 6, effectTime: 330, condition: 1 } ],
        'arena:jump_copper_wither_ring_witherringdown': [ { effect: 'jump_boost', level: 2, effectTime: 330, condition: 1 } ],
        'arena:jump_iron_wither_ring_witherringdown': [ { effect: 'jump_boost', level: 3, effectTime: 330, condition: 1 } ],
        'arena:jump_golden_wither_ring_witherringdown': [ { effect: 'jump_boost', level: 4, effectTime: 330, condition: 1 } ],
        'arena:jump_prismarine_wither_ring_witherringdown': [ { effect: 'jump_boost', level: 5, effectTime: 330, condition: 1 } ],
        'arena:jump_marble_wither_ring_witherringdown': [ { effect: 'jump_boost', level: 6, effectTime: 330, condition: 1 } ],
        'arena:poision_wither_ring_witherring': [ { effect: 'jump_boost', level: 4, effectTime: 330, condition: 1 } ],
        'arena:poision_wither_ring_witherringdown': [ { effect: 'jump_boost', level: 4, effectTime: 330, condition: 1 } ],
        'arena:cat_eye_talisman': [ { effect: 'night_vision', level: 1, effectTime: 330, condition: 1 } ],
        'arena:murders_skull_talisman': [ { effect: 'fire_resistance', level: 1, effectTime: 330, condition: 1 } ],
        'arena:obsidian_knight_helmet_talisman': [ { effect: 'fire_resistance', level: 1, effectTime: 330, condition: 1 } ],
        'arena:obsidian_pendant_necklace': [ { effect: 'speed', level: 2, effectTime: 60, condition: feetBlock?.typeId?.includes('lava') } ],
        'arena:rabbit_feet_pendant_talisman': [ { effect: 'jump_boost', level: 3, effectTime: 330, condition: 1 } ],
        'arena:shadow_of_nobody_talisman': [ { effect: 'invisibility', level: 1, effectTime: 330, condition: 1 } ],
        'arena:sacret_pendant_talisman': [ { effect: 'haste', level: 2, effectTime: 330, condition: 1 } ],
        'arena:angelic_aurea_talisman': [ { effect: 'speed', level: 2, effectTime: 330, condition: 1 } ],
        'arena:marble_emerald_pendant_talisman': [ { effect: 'village_hero', level: 1, effectTime: 330, condition: 1 } ],
        'arena:marble_feather_talisman': [ { effect: 'slow_falling', level: 1, effectTime: 330, condition: 1 } ],
        'arena:spectral_talisman_talisman': [
            { effect: 'invisibility', level: 1, effectTime: 60, condition: player.hasTag('light_off') },
            { effect: 'slow_falling', level: 1, effectTime: 60, condition: player.hasTag('light_off') && player.isFalling }
        ],
        'arena:jesus_doll_doll': [
            { effect: 'speed', level: 1, effectTime: 330, condition: 1 },
            { effect: 'haste', level: 1, effectTime: 330, condition: 1 },
            { effect: 'hunger', level: 3, effectTime: 330, condition: 1 }
        ],
        'arena:masked_doll_doll': [
            { effect: 'weakness', level: 1, effectTime: 330, condition: 1 },
            { effect: 'haste', level: 1, effectTime: 330, condition: 1 }
        ],
        'arena:vulak_doll_doll': [ { effect: 'slowness', level: 2, effectTime: 330, condition: feetBlock?.typeId?.includes('water') } ],
        'arena:aplpha_doll_doll': [
            { effect: 'regeneration', level: 1, effectTime: 330, condition: player.isSneaking },
            { effect: 'mining_fatigue', level: 1, effectTime: 330, condition: 1 }
        ],
        'arena:fire_doll_doll': [ { effect: 'strength', level: 1, effectTime: 330, condition: 1 } ],
        'arena:harena_doll_doll': [ { effect: 'hunger', level: 1, effectTime: 330, condition: 1 } ],
        'arena:illuminated_doll_doll': [ { effect: 'blindness', level: 1, effectTime: 330, condition: 1 } ],
        'arena:nocturnal_hood_talisman': [ { effect: 'blindness', level: 1, effectTime: 330, condition: world.getTimeOfDay() <= 13000 } ],
        'arena:sacronkaiden_doll_doll': [ { effect: 'poison', level: 1, effectTime: 330, condition: feetBlock?.typeId?.includes('water') } ],
        'arena:alaniz_doll_doll': [ { effect: 'resistance', level: 1, effectTime: 330, condition: player.isSneaking } ],
        'arena:gold_doll_doll': [ { effect: 'strength', level: 1, effectTime: 330, condition: player.getComponent('equippable').getEquipment('Head')?.typeId == 'minecraft:golden_helmet' } ],
        'arena:jrice_doll_doll': [
            { effect: 'hunger', level: 4, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 20 },
            { effect: 'invisibility', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 10 },
            { effect: 'regeneration', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 5 }
        ],
        'arena:agustin_doll_doll': [ { effect: 'weakness', level: 1, effectTime: 330, condition: 1 } ],
        'arena:cap_zweihander_doll': [
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.level >= 15 },
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.level >= 30 },
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.level >= 45 },
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.level >= 60 }
        ],
        'arena:nights_devouring_mask_face': [
            { effect: 'speed', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:nights_without_sleep') >= 1 && world.getTimeOfDay() >= 13000 },
            { effect: 'speed', level: 2, effectTime: 330, condition: player.getDynamicProperty('arena:nights_without_sleep') >= 3 },
            { effect: 'strength', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:nights_without_sleep') >= 2 },
            { effect: 'strength', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:nights_without_sleep') >= 5 },
            { effect: 'regeneration', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:nights_without_sleep') >= 4 && world.getTimeOfDay() >= 13000  },
            { effect: 'slowness', level: 1, effectTime: 330, condition: world.getTimeOfDay() <= 13000 },
            { effect: 'hunger', level: 1, effectTime: 330, condition: world.getTimeOfDay() <= 13000 },
            { effect: 'weakness', level: 3, effectTime: 330, condition: world.getTimeOfDay() <= 13000  }
        ],
        'arena:dream_tatters_of_the_king_body': [
            { effect: 'speed', level: 2, effectTime: 330, condition: player.getDynamicProperty('tatters_king') >= 3 },
            { effect: 'instant_damage', level: 10, effectTime: 20, condition: player.isSleeping },
        ],
        'arena:sweet_dreams_pendant_necklace': [ { effect: 'poison', level: 3, effectTime: 300, condition: player.isSleeping } ],
        'arena:tears_unshed_charm': [ { effect: 'regeneration', level: 1, effectTime: 100, condition: player.getVelocity().x == 0 && player.getVelocity().y == 0 && player.getVelocity().z == 0 && player.isSneaking } ],
        'arena:deformed_mask_face': [
            { effect: 'resistance', level: 1, effectTime: 60, condition: player.getVelocity().x == 0 && player.getVelocity().y == 0 && player.getVelocity().z == 0 },
            { effect: 'resistance', level: 1, effectTime: 60, condition: player.isSneaking }
        ],
        'arena:archaic_marble_bracelets_archaiccharm': [
            { effect: 'strength', level: 3, effectTime: 60, condition: mainhand?.typeId == 'minecraft:golden_axe' }
        ],
        'arena:archaic_marble_wings_archaiccharm': [
            { effect: 'weakness', level: 3, effectTime: 330, condition: 1 },
            { effect: 'speed', level: 2, effectTime: 330, condition: chestItem?.typeId == 'minecraft:elytra' }
        ],
        'arena:fallen_wings_archaiccharm': [ { effect: 'speed', level: 2, effectTime: 330, condition: chestItem?.typeId == 'minecraft:elytra' } ],
        'arena:archaic_hemlock_wings_archaiccharm': [
            { effect: 'weakness', level: 3, effectTime: 330, condition: 1 },
            { effect: 'speed', level: 2, effectTime: 330, condition: chestItem?.typeId == 'minecraft:elytra' }
        ],
        'arena:deer_crown_head': [ { effect: 'weakness', level: 2, effectTime: 330, condition: 1 } ],
        'arena:archaic_arnold_archaiccharm': [
            { effect: 'hunger', level: 2, effectTime: 330, condition: 1 },
            { effect: 'jump_boost', level: 3, effectTime: 330, condition: 1 }
        ],
        'arena:archaic_cursed_book_archaiccharm': [
            { effect: 'regeneration', level: 1, effectTime: 330, condition: player.level >= 12 },
            { effect: 'regeneration', level: 1, effectTime: 330, condition: player.level >= 24 },
            { effect: 'regeneration', level: 1, effectTime: 330, condition: player.level >= 36 },
            { effect: 'mining_fatigue', level: 2, effectTime: 330, condition: 1 }
        ],
        'arena:archaic_cursed_skull_archaiccharm': [ { effect: 'strength', level: 2, effectTime: 330, condition: 1 } ],
        'arena:prismatic_heart_relic_charm': [ { effect: 'conduit_power', level: 2, effectTime: 330, condition: 1 } ],
        'arena:marble_hand_charm': [ { effect: 'haste', level: 2, effectTime: 330, condition: 1 } ],
        'arena:fallen_hand_charm': [ { effect: 'haste', level: 2, effectTime: 330, condition: 1 } ],
        'arena:villager_heart_talisman': [ { effect: 'regeneration', level: 1, effectTime: 120, condition: 1 } ],
        'arena:archaic_chained_soul_archaiccharm': [
            { effect: 'speed', level: 2, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 6 },
            { effect: 'resistance', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 6 },
            { effect: 'strength', level: 2, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 6 }
        ],
        'arena:archaic_good_and_evil_flower_archaiccharm': [
            { effect: 'weakness', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 15 },
            { effect: 'slowness', level: 2, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 10 },
            { effect: 'weakness', level: 2, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 5 },
            { effect: 'regeneration', level: 1, effectTime: 40, condition: player.getComponent('minecraft:health').currentValue >= 20 },
            { effect: 'strength', level: 2, effectTime: 330, condition: 1 }
        ],
        'arena:archaic_triple_edged_sword_archaiccharm': [ { effect: 'speed', level: 2, effectTime: 330, condition: player.getDynamicProperty('triple_edged_hits') >= 9 } ],
        'arena:pandoras_bracelet_charm': [
            { effect: 'weakness', level: 1, effectTime: 330, condition: 1 },
            { effect: 'weakness', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 10 }
        ],
        'arena:infernal_heart_heartycharm': [ { effect: 'fire_resistance', level: 1, effectTime: 330, condition: 1 } ],
        'arena:mask_charged': [ { effect: 'strength', level: 2, effectTime: 330, condition: 1 } ],
        'arena:cherry_blossom_charm': [
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 6 },
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 13 },
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 20 },
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 27 },
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 34 }
        ],
        'arena:iron_blossom_ring_ring': [
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 41 },
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 48 }
        ],
        'arena:golden_blossom_ring_ring': [
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 41 },
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 48 },
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 55 }
        ],
        'arena:prismarine_blossom_ring_ring': [
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 41 },
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 48 },
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 55 },
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 62 }
        ],
        'arena:netherite_blossom_ring_ring': [
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 41 },
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 48 },
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 55 },
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 62 },
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 69 }
        ],
        'arena:marble_blossom_ring_ring': [
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 41 },
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 48 },
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 55 },
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 62 },
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 69 },
            { effect: 'health_boost', level: 1, effectTime: 330, condition: player.getDynamicProperty('arena:cherry_blossom_charm') >= 75 }
        ],
        'arena:ifrits_mantle_body': [
            { effect: 'weakness', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue >= 21 },
            { effect: 'weakness', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue >= 31 },
            { effect: 'weakness', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue >= 41 },
            { effect: 'weakness', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue >= 51 },
            { effect: 'weakness', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue >= 61 },
            { effect: 'weakness', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue >= 71 },
            { effect: 'strength', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 9 },
            { effect: 'strength', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 19 }
        ],
        ////// 
        'archaic_scroll': [
            { effect: 'regeneration', level: 1, effectTime: 330, condition: headItem?.typeId == 'arena:marble_helmet_h' && chestItem?.typeId == 'arena:marble_chestplate' 
            && legsItem?.typeId == 'arena:marble_leggings' && feetItem?.typeId == 'arena:marble_boots' },
            { effect: 'regeneration', level: 1, effectTime: 330, condition: headItem?.typeId == 'arena:pure_marble_helmet' && chestItem?.typeId == 'arena:pure_marble_chestplate' 
            && legsItem?.typeId == 'arena:pure_marble_leggings' && feetItem?.typeId == 'arena:pure_marble_boots' },
            { effect: 'resistance', level: 1, effectTime: 330, condition: headItem?.typeId == 'arena:ganma_hemlock_helmet' && chestItem?.typeId == 'arena:ganma_hemlock_chestplate' 
            && legsItem?.typeId == 'arena:ganma_hemlock_leggings' && feetItem?.typeId == 'arena:ganma_hemlock_boots' },
            { effect: 'resistance', level: 1, effectTime: 330, condition: headItem?.typeId == 'arena:stigma_hemlock_helmet' && chestItem?.typeId == 'arena:stigma_hemlock_chestplate' 
            && legsItem?.typeId == 'arena:stigma_hemlock_leggings' && feetItem?.typeId == 'arena:stigma_hemlock_boots' },
            { effect: 'resistance', level: 2, effectTime: 330, condition: headItem?.typeId == 'arena:alpha_hemlock_helmet' && chestItem?.typeId == 'arena:alpha_hemlock_chestplate' 
            && legsItem?.typeId == 'arena:alpha_hemlock_leggings' && feetItem?.typeId == 'arena:alpha_hemlock_boots' }
        ],
        ////// 
        'g:netherite_amulet_amulet': [ { effect: 'fire_resistance', level: 1, effectTime: 330, condition: 1 } ],
        'g:light_amulet_amulet': [
            { effect: 'speed', level: 2, effectTime: 330, condition: 1 },
            { effect: 'night_vision', level: 1, effectTime: 330, condition: 1 }
        ],
        'g:crucifix_amulet_amulet': [
            { effect: 'speed', level: 2, effectTime: 330, condition: player.getComponent('equippable').getEquipment('Offhand')?.typeId == 'minecraft:totem_of_undying' },
            { effect: 'night_vision', level: 1, effectTime: 330, condition: player.getComponent('equippable').getEquipment('Offhand')?.typeId == 'minecraft:totem_of_undying' }
        ],
        'g:bloodlust_amulet_amulet': [
            { effect: 'strength', level: 2, effectTime: 330, condition: 1 },
            { effect: 'blindness', level: 1, effectTime: 330, condition: 1 }
        ],
        'g:soul_amulet_amulet': [
            { effect: 'haste', level: 2, effectTime: 330, condition: 1 },
            { effect: 'slowness', level: 1, effectTime: 330, condition: 1 },
            { effect: 'invisibility', level: 1, effectTime: 330, condition: 1 }
        ],
        'g:fire_amulet_amulet': [
            { effect: 'fire_resistance', level: 1, effectTime: 330, condition: 1 },
            { effect: 'regeneration', level: 1, effectTime: 330, condition: feetBlock?.typeId.includes('fire') }
        ],
        'g:beserker_amulet_amulet': [
            { effect: 'speed', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 15 },
            { effect: 'strength', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 12 },
            { effect: 'speed', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 9 },
            { effect: 'resistance', level: 2, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 6 },
            { effect: 'strength', level: 1, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 3 }
        ],
        'g:eye_amulet_amulet': [ { effect: 'weakness', level: 2, effectTime: 330, condition: 1 } ],
        'g:firework_amulet_charm': [
            { effect: 'speed', level: 2, effectTime: 330, condition: chestItem?.typeId == 'minecraft:elytra' },
            { effect: 'levitation', level: 2, effectTime: 100, condition: player.isSneaking }
        ],
        'g:arcane_amulet_charm': [
            { effect: 'regeneration', level: 1, effectTime: 330, condition: 1 }
        ],
        'g:momentum_amulet_amulet': [
            { effect: 'haste', level: 1, effectTime: 330, condition: player.getDynamicProperty('g:momentum_amulet_amulet') >= 15 },
            { effect: 'haste', level: 1, effectTime: 330, condition: player.getDynamicProperty('g:momentum_amulet_amulet') >= 63 }
        ],
        'g:multi_mask_face': [
            { effect: 'jump_boost', level: 3, effectTime: 60, condition: player.isSneaking },
            { effect: 'speed', level: 2, effectTime: 60, condition: player.isSneaking }
        ],
        'g:shameful_amulet_amulet': [
            { effect: 'strength', level: 2, effectTime: 330, condition: player.dimension.id == 'minecraft:nether' },
            { effect: 'poison', level: 1, effectTime: 330, condition: player.dimension.id == 'minecraft:overworld' },
            { effect: 'weakness', level: 1, effectTime: 330, condition: player.dimension.id == 'minecraft:the_end' }
        ],
        'g:slime_amulet_amulet': [
            { effect: 'jump_boost', level: 2, effectTime: 330, condition: 1 },
            { effect: 'slow_falling', level: 2, effectTime: 330, condition: 1 }
        ],
        'g:greed_amulet_amulet': [
            { effect: 'village_hero', level: 1, effectTime: 330, condition: mainhand?.typeId == 'minecraft:emerald_block' && mainhand?.amount > 16 },
            { effect: 'village_hero', level: 1, effectTime: 330, condition: mainhand?.typeId == 'minecraft:emerald_block' && mainhand?.amount > 32 },
            { effect: 'village_hero', level: 1, effectTime: 330, condition: mainhand?.typeId == 'minecraft:emerald_block' && mainhand?.amount > 48 },
            { effect: 'village_hero', level: 1, effectTime: 330, condition: mainhand?.typeId == 'minecraft:emerald_block' && mainhand?.amount > 64 }
        ],
        ///////////
        'mnra_cata:stellar_necklace_necklace': [
            { effect: 'regeneration', level: 2, effectTime: 50, condition: player.getComponent('minecraft:health').currentValue <= 10 }
        ],
        'mnra_cata:verdant_necklace_necklace': [
            { effect: 'resistance', level: 2, effectTime: 330, condition: 1 },
            { effect: 'slowness', level: 2, effectTime: 330, condition: 1 }
        ],
        'mnra_cata:solar_necklace_necklace': [
            { effect: 'fire_resistance', level: 1, effectTime: 330, condition: player.dimension.id == 'minecraft:nether' }
        ],
        'mnra_cata:sun_necklace_necklace': [
            { effect: 'resistance', level: 1, effectTime: 330, condition: player.dimension.id == 'minecraft:nether' },
            { effect: 'health_boost', level: 2, effectTime: 330, condition: player.dimension.id == 'minecraft:nether' },
            { effect: 'health_boost', level: 2, effectTime: 330, condition: world.getTimeOfDay() <= 13000 }
        ],
        'mnra_cata:calibrated_stellar_core_charm': [
            { effect: 'regeneration', level: 2, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue <= 10 },
            { effect: 'weakness', level: 2, effectTime: 330, condition: player.getComponent('minecraft:health').currentValue >= 10 }
        ],
        ///////////
        'amarite:amarite_mirror_haste_archaiccharm': [ { effect: 'haste', level: 1, effectTime: 330, condition: 1 } ],
        'amarite:amarite_mirror_speed_archaiccharm': [ { effect: 'speed', level: 1, effectTime: 330, condition: 1 } ],
        'amarite:amarite_mirror_jump_boost_archaiccharm': [ { effect: 'jump_boost', level: 1, effectTime: 330, condition: 1 } ],
        'amarite:amarite_mirror_strength_archaiccharm': [ { effect: 'strength', level: 1, effectTime: 330, condition: 1 } ],
        'amarite:amarite_mirror_regeneration_archaiccharm': [ { effect: 'regeneration', level: 1, effectTime: 330, condition: 1 } ],
        'amarite:amarite_mirror_resistance_archaiccharm': [ { effect: 'resistance', level: 1, effectTime: 330, condition: 1 } ],
        'amarite:amarite_mirror_conduit_archaiccharm': [ { effect: 'conduit_power', level: 1, effectTime: 330, condition: 1 } ],
        ///////////
        'eu:aquatic_necklace_necklace': [ { effect: 'water_breathing', level: 1, effectTime: 330, condition: 1 } ],
        'eu:heart_necklace_necklace': [ { effect: 'regeneration', level: 1, effectTime: 330, condition: 1 } ],
        'eu:invisibility_necklace_necklace': [ { effect: 'invisibility', level: 1, effectTime: 330, condition: 1 } ],
        'eu:leap_necklace_necklace': [ { effect: 'jump_boost', level: 2, effectTime: 330, condition: 1 } ],
        'eu:lunar_necklace_necklace': [ { effect: 'night_vision', level: 1, effectTime: 330, condition: 1 } ],
        'eu:night_goggles_face': [ { effect: 'night_vision', level: 1, effectTime: 330, condition: 1 } ],
        'eu:pick_necklace_necklace': [ { effect: 'haste', level: 1, effectTime: 330, condition: 1 } ],
        'eu:sea_necklace_necklace': [ { effect: 'conduit_power', level: 1, effectTime: 330, condition: 1 } ],
        'eu:toughness_necklace_necklace': [ { effect: 'resistance', level: 1, effectTime: 330, condition: 1 } ],
        'eu:emerald_coin_talisman': [ { effect: 'village_hero', level: 1, effectTime: 330, condition: 1 } ],

        'eu:haste_magic_ring_ring': [ { effect: 'haste', level: 1, effectTime: 330, condition: 1 } ],
        'eu:speed_magic_ring_ring': [ { effect: 'speed', level: 1, effectTime: 330, condition: 1 } ],
        'eu:regeneration_magic_ring_ring': [ { effect: 'regeneration', level: 1, effectTime: 330, condition: 1 } ],
        'eu:resistance_magic_ring_ring': [ { effect: 'resistance', level: 1, effectTime: 330, condition: 1 } ],
        'eu:strength_magic_ring_ring': [ { effect: 'strength', level: 1, effectTime: 330, condition: 1 } ],
        'eu:jump_boost_magic_ring_ring': [ { effect: 'jump_boost', level: 1, effectTime: 330, condition: 1 } ],

        'eu:heart_of_the_sea_amulet_amulet': [ { effect: 'conduit_power', level: 1, effectTime: 330, condition: 1 } ],
        'eu:water_ring_ring': [ { effect: 'water_breathing', level: 1, effectTime: 330, condition: 1 } ],
        'eu:haste_ring_ring': [ { effect: 'haste', level: 1, effectTime: 330, condition: 1 } ],
        'eu:band_of_regeneration_ring': [ { effect: 'regeneration', level: 1, effectTime: 330, condition: 1 } ],
        'eu:boots_of_swiftness_feet': [ { effect: 'speed', level: 2, effectTime: 330, condition: 1 } ],
        'eu:invisibility_cloak_body': [ { effect: 'invisibility', level: 1, effectTime: 330, condition: 1 } ],
        'eu:discount_ticket_charm': [ { effect: 'village_hero', level: 1, effectTime: 330, condition: 1 } ],
        'eu:night_cloak_body': [ { effect: 'night_vision', level: 1, effectTime: 330, condition: 1 } ],
        'eu:giant_leaf_talisman': [ { effect: 'slow_falling', level: 1, effectTime: 330, condition: 1 } ],
        'eu:turtle_shell_talisman': [ { effect: 'resistance', level: 1, effectTime: 330, condition: 1 } ],
        //////////
        'ip:chicken_pet_amulet': [
            { effect: 'slow_falling', level: 1, effectTime: 330, condition: 1 },
            { effect: 'speed', level: 1, effectTime: 330, condition: 1 }
        ],
        'ip:slime_pet_amulet': [ { effect: 'jump_boost', level: 6, effectTime: 330, condition: 1 } ],
        'ip:blaze_pet_amulet': [ { effect: 'fire_resistance', level: 1, effectTime: 330, condition: 1 } ],
        'ip:axolotl_pet_amulet': [ { effect: 'regeneration', level: 4, effectTime: 80, condition: player.getComponent('minecraft:health').currentValue <= 5 } ],
        'ip:glow_squid_pet_amulet': [ { effect: 'night_vision', level: 1, effectTime: 330, condition: player.isSneaking } ],
        'ip:nightmare_pet_amulet': [ { effect: 'darkness', level: 1, effectTime: 330, condition: 1 } ],
        'ip:nautilus_pet_amulet': [ { effect: 'water_breathing', level: 1, effectTime: 330, condition: 1 } ]
    };
}