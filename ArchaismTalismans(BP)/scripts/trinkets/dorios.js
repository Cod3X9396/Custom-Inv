export const doriosTrinkets = [
    // Hearty Charm
    { identifier: "twm:rotten_heart", slot: 'heartycharm', health: 2 }, // Zombie 5%
    { identifier: "twm:candy_heart", slot: 'heartycharm', health: 4 }, // Witch 5%
    { identifier: `twm:soul_heart`, slot: 'heartycharm', health: 8, fallingD: 0.85 }, // Ancient City 10%
    { identifier: "twm:immaculate_heart", slot: 'heartycharm', health: 10, attack: 1, projectileD: 0.15, speed: -0.01 }, // Desert Pyramid 5%
    { identifier: `twm:black_heart`, slot: 'heartycharm', health: 6 }, // Enderman 5%
    { identifier: `twm:eternal_heart`, slot: 'heartycharm', health: 8, meleeD: 0.25, projectileD: 0.25 }, // Ancient City 1%
    { identifier: "twm:sacred_heart", slot: 'heartycharm', health: 20 }, // Desert Pyramid 2%
    { identifier: `twm:warden_heart`, slot: 'heartycharm', health: 16, fallingD: -0.25, speed: -0.03 }, // Crafted
    { identifier: `twm:wither_heart`, slot: 'heartycharm', health: 16, speed: -0.03 }, // Wither 5%, 
    { identifier: `twm:dragon_heart`, slot: 'heartycharm', health: 20, attack: 2 }, // Dragon 10%
    { identifier: `twm:bloodstained_heart`, slot: 'heartycharm', health: 8, attack: -2, speed: -0.01 }, // Bastion 10%
    { identifier: `twm:tideforged_heart`, slot: 'heartycharm', health: 4 }, // Ocean Create 25%

    // Feet
    { identifier: `twm:cloud_steps_boots`, slot: 'feet', speed: 0.03, health: -14 }, // Phantom 5%
    { identifier: "twm:lava_waders", slot: 'feet', lavaSpeed: 0.008 }, // Strider 5%

    // Charm
    { identifier: `twm:dead_abyssal_orb`, slot: 'charm', waterSpeed: 0.002 }, // Buried Treasure & Underwater Ruin 25%
    { identifier: `twm:abyssal_clam_shell`, slot: 'talisman', waterSpeed: 0.004, fallingD: 0.35 }, // Underwater Ruin 10%
    { identifier: `twm:abyssal_orb`, slot: 'charm', waterSpeed: 0.006, fallingD: 0.65 }, // Crafted
    { identifier: `twm:abyssal_essence`, slot: 'archaiccharm', waterSpeed: 0.008, meleeD: 0.15, projectileD: 0.15, fallingD: 0.2 }, // Underwater Ruin 2%
    { identifier: `twm:abyssal_diver_helmet`, slot: 'head', waterSpeed: 0.002 }, //Shipwreck Treasure 20%

    { identifier: "twm:obsidian_skull", slot: 'charm' }, // Crafted
    { identifier: "twm:purity_blossom", slot: 'charm' }, // Witch 5% 
    { identifier: "twm:bloodtide_chalice", slot: 'charm' }, // Bastion 10%
    { identifier: "twm:tideforged_stars", slot: 'charm', waterSpeed: 0.004, fallingD: 0.15 }, // Ocean Create 20%

    //Gauntlet
    { identifier: "twm:fire_gauntlet", slots: ['gauntlet', 'gauntletleft'] }, // Netherfortress 20%
    { identifier: `twm:ice_gauntlet`, slots: ['gauntlet', 'gauntletleft'] }, // Igloo 25%
    { identifier: `twm:venom_gauntlet`, slots: ['gauntlet', 'gauntletleft'] }, // Jungle Temple 50%
    { identifier: `twm:fire_claw`, slots: ['gauntlet', 'gauntletleft'], attack: 2, meleeD: 0.1, projectileD: 0.15 }, // Netherfortress 5%
    { identifier: `twm:venom_claw`, slots: ['gauntlet', 'gauntletleft'], attack: 2, meleeD: 0.1, projectileD: 0.15 },// Jungle Temple 20%
    { identifier: `twm:ice_claw`, slots: ['gauntlet', 'gauntletleft'], attack: 2, meleeD: 0.1, projectileD: 0.15 },// Igloo 10%
    { identifier: `twm:tideforged_knuckles`, slots: ['gauntlet', 'gauntletleft'], attack: 1, meleeD: -0.05, fallingD: 0.15 }, // Ocean Create 30%

    // Head
    { identifier: "twm:night_vision_mask", slot: 'head' }, // Stronghold 10%
    { identifier: "twm:night_vision_goggles", slot: 'head' }, // Crafted
    { identifier: `twm:broken_paladin_helmet`, slot: 'head', attack: 1 }, // Ruined Portal 10%
    { identifier: `twm:restored_paladin_helmet`, slot: 'head', attack: 3, speed: -0.02 }, // End City 5%

    // Necklace
    { identifier: "twm:rush_of_fear", slot: 'necklace', health: 4 }, // Desert Pyramid 15%
    { identifier: `twm:repair_talis`, slot: 'necklace' }, // Blacksmith 20%
    { identifier: `twm:mender_pendant`, slot: 'necklace' }, // Desert Pyramid 10%
    { identifier: `twm:blood_pendant`, slot: 'necklace', health: 4 }, // Ruined Portal 10%
    { identifier: `twm:rabbit_rush`, slot: 'necklace', speed: 0.02 }, // Rabits 25%
    { identifier: 'twm:tideforged_pendant', slot: 'necklace', waterSpeed: 0.004, fallingD: 0.25 }, // Ocean Create 40%
    { identifier: 'twm:blazed_heart_necklace', slot: 'necklace', health: 4, lavaSpeed: 0.002 }, // Blazed Crate 20%

    // Ring
    { identifier: `twm:guardian_ring`, slot: 'ring', meleeD: -0.25, projectileD: -0.25, speed: -0.03, fallingD: 0.6 }, // Crafted
    { identifier: `twm:runner_ring`, slot: 'ring' }, // Crafted
    { identifier: `twm:healer_ring`, slot: 'ring' }, // Crafted
    { identifier: `twm:miner_ring`, slot: 'ring', speed: -0.01 }, // Crafted
    { identifier: `twm:warrior_ring`, slot: 'ring', attack: 2, meleeD: 0.1, projectileD: 0.1 }, // Vindicators 5%
    { identifier: `twm:tideforged_ring`, slot: 'ring', waterSpeed: 0.002, fallingD: 0.05 },  // Ocean Create 35%

    // Wither Ring
    { identifier: `twm:heavy_guardian_ring`, slots: ['witherring', 'witherringdown'], meleeD: -0.35, projectileD: -0.35, speed: -0.03, fallingD: 0.75}, // Desert Pyramid 5%
    { identifier: `twm:heavy_runner_ring`, slots: ['witherring', 'witherringdown'] }, // Desert Pyramid 5%
    { identifier: `twm:heavy_healer_ring`, slots: ['witherring', 'witherringdown'] }, // Desert Pyramid 5%
    { identifier: `twm:heavy_miner_ring`, slots: ['witherring', 'witherringdown'], attack: -3 }, // Desert Pyramid 5%
    { identifier: `twm:heavy_warrior_ring`, slots: ['witherring', 'witherringdown'], health: -6 }, // Desert Pyramid 5%
    { identifier: `twm:strong_abyssal_ring`, slots: ['witherring', 'witherringdown'], waterSpeed: 0.004, meleeD: -0.1, fallingD: 0.45 },  // Ocean Create 10%
    { identifier: `twm:strong_ancient_ring`, slots: ['witherring', 'witherringdown'], attack: 2, health: 4, speed: 0.01, meleeD: 0.2, projectileD: 0.2 },  // Desert Pyramid 5%
    { identifier: `twm:strong_breeze_ring`, slots: ['witherring', 'witherringdown'], attack: 3, health: -8, projectileD: 0.1 }, // Stronghold 10%
    { identifier: `twm:strong_brute_ring`, slots: ['witherring', 'witherringdown'], attack: 4, health: -26 }, // Brutes 10%
    { identifier: `twm:strong_celestial_ring`, slots: ['witherring', 'witherringdown'] }, // End City 20%
    { identifier: `twm:strong_echo_ring`, slots: ['witherring', 'witherringdown'] }, // Ancient City 15%
    { identifier: `twm:strong_ender_ring`, slots: ['witherring', 'witherringdown'] }, // End City 30%
    { identifier: `twm:strong_fortress_ring`, slots: ['witherring', 'witherringdown'], attack: 2, meleeD: -0.1, health: -12, speed: -0.02 }, // Nether fortress 15%
    { identifier: `twm:strong_jade_ring`, slots: ['witherring', 'witherringdown'], health: 10, attack: -2 }, // Jungle 50%
    { identifier: `twm:strong_shulker_ring`, slots: ['witherring', 'witherringdown'], attack: 1, meleeD: 0.05, projectileD: 0.05 }, // Shulker 10%
    { identifier: `twm:strong_trader_ring`, slots: ['witherring', 'witherringdown'] }, // Desert Pyramid 25%
    { identifier: `twm:strong_inferno_ring`, slots: ['witherring', 'witherringdown'], attack: 4, health: -20 }, // Bastion 20%
    { identifier: `twm:strong_blood_ring`, slots: ['witherring', 'witherringdown'], attack: 2, magicD: 0.15 }, // Bastion 20%


    // Body
    { identifier: "twm:molten_quiver", slot: 'body' }, // Nether Skeletons 5%
    { identifier: `twm:frost_quiver`, slot: 'body' }, // Strays 10%
    { identifier: `twm:venom_quiver`, slot: 'body' }, // Jungle Temple 30%
    { identifier: `twm:idle_bloom`, slot: 'body' }, // Jungle Temple 10%
    { identifier: `twm:tideforged_carapace`, slot: 'body' },  // Ocean Create 20%
    { identifier: `twm:bloodbound_emblem`, slot: 'body' },  // Bastion 20%

    // Archaic Charm
    { identifier: `twm:blood_pact`, slot: 'archaiccharm', health: -20 }, // Bastion Treasure 10%

    // Talisman
    { identifier: `twm:holy_cross`, slot: 'talisman' }, // Desert Pyramid 10%
    { identifier: `twm:bloodgem`, slot: 'talisman' },  // Bastion 20%
    { identifier: `twm:tideforged_eye`, slot: 'talisman' },  // Ocean Create 30%

    // Amulet
    { identifier: `twm:bloodbound_amulet`, slot: 'amulet', health: 6, lavaSpeed: 0.002 }, // Bastion Treasure 20%
    { identifier: `twm:blazing_amulet`, slot: 'amulet' }, // Blazed Crate 40%
    { identifier: `twm:abyssal_sun_amulet`, slot: 'amulet', lavaSpeed: 0.006 }, // End city 20%

    // Doll
    { identifier: `twm:voodoo`, slot: 'doll' } // Bastion Treasure 20%
]