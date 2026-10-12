import { world, system, ItemStack } from "@minecraft/server"


const lores = {
    "arena:marble_mask": ["§r§8Inmunity to "],
    //Plush
    "arena:doll_had": ["", "§r§7Hydra Team"],
    "arena:vulkan_hat": ["", "§r§7Hydra Team"],
    "arena:alpha_hat": ["", "§r§7Hydra Team"],
    "arena:alaniz_hat": ["", "§r§7Hydra Team"],
    "arena:angeloso_hat": ["", "§r§7Hydra Team"],
    "arena:system_hat": ["", "§r§7Hydra Team"],
    "arena:laniraxia_hat": ["", "§r§7Hydra Team"],
    "arena:melunch_hat": ["", "§r§7Hydra Team"],
    //dolls
    "arena:harena_doll": ["", "§r§7Hydra Team"],
    "arena:vulak_doll": ["", "§r§7Hydra Team"],
    "arena:aplpha_doll": ["", "§r§7Hydra Team"],
    "arena:alaniz_doll": ["", "§r§7Hydra Team"],
    "arena:angeloso_doll": ["", "§r§7Hydra Team"],
    "arena:systemtv_doll": ["", "§r§7Hydra Team"],
    "arena:laniraxia_doll": ["", "§r§7Hydra Team"],
    "arena:melunch_doll": ["", "§r§7Hydra Team"],
    //armor
    "arena:marble_helmet_h": ["", "§r§7Armor Set Bonus:", "§r§8 Causes more damage to undeads (+50 )", "§r§8 Heals pets and nearby players "],
    "arena:marble_chestplate": ["§r§9+Flying", "", "§r§7Armor Set Bonus:", "§r§8 Causes more damage to undeads (+50 )", "§r§8 Heals pets and nearby players "],
    "arena:marble_leggings": ["", "§r§7Armor Set Bonus:", "§r§8 Causes more damage to undeads (+50 )", "§r§8 Heals pets and nearby players "],
    "arena:marble_boots": ["", "§r§7Armor Set Bonus:", "§r§8 Causes more damage to undeads (+50 )", "§r§8 Heals pets and nearby players "],

    "arena:pure_marble_helmet": ["", "§r§7Armor Set Bonus:", "§r§8 Causes more damage to undeads (+100 )", "§r§8 Heals pets and nearby players ", "§r§8 Divine punishment. (+50  to evil players)"],
    "arena:pure_marble_chestplate": ["§r§9+Flying", "", "§r§7Armor Set Bonus:", "§r§8 Causes more damage to undeads (+100 )", "§r§8 Heals pets and nearby players ", "§r§8 Divine punishment. (+50  to evil players)"],
    "arena:pure_marble_leggings": ["", "§r§7Armor Set Bonus:", "§r§8 Causes more damage to undeads (+100 )", "§r§8 Heals pets and nearby players ", "§r§8 Divine punishment. (+50  to evil players)"],
    "arena:pure_marble_boots": ["", "§r§7Armor Set Bonus:", "§r§8 Causes more damage to undeads (+100 )", "§r§8 Heals pets and nearby players ", "§r§8 Divine punishment. (+50  to evil players)"],

    "arena:fallen_marble_helmet": ["", "§r§7Armor Set Bonus:", "§r§8 Causes more damage to players (+40 )", "§r§8 +8 chance cause critic "],
    "arena:fallen_marble_chestplate": ["§r§9+Flying", "", "§r§7Armor Set Bonus:", "§r§8 Causes more damage to players (+40 )", "§r§8 +8 chance cause critic "],
    "arena:fallen_marble_leggings": ["", "§r§7Armor Set Bonus:", "§r§8 Causes more damage to players (+40 )", "§r§8 +8 chance cause critic "],
    "arena:fallen_marble_boots": ["", "§r§7Armor Set Bonus:", "§r§8 Causes more damage to players (+40 )", "§r§8 +8 chance cause critic "],

    "arena:impious_marble_helmet": ["", "§r§7Armor Set Bonus:", "§r§8 Causes more damage to players (+80 )", "§r§8 +10 chance cause critic ", "§r§8 +Attacks wear down the durability of the victims armor. "],
    "arena:impious_marble_chestplate": ["", "§r§7Armor Set Bonus:", "§r§8 Causes more damage to players (+80 )", "§r§8 +10 chance cause critic ", "§r§8 +Attacks wear down the durability of the victims armor. "],
    "arena:impious_marble_leggings": ["", "§r§7Armor Set Bonus:", "§r§8 Causes more damage to players (+80 )", "§r§8 +10 chance cause critic ", "§r§8 +Attacks wear down the durability of the victims armor. "],
    "arena:impious_marble_boots": ["", "§r§7Armor Set Bonus:", "§r§8 Causes more damage to players (+80 )", "§r§8 +10 chance cause critic ", "§r§8 +Attacks wear down the durability of the victims armor. "],

    "arena:paladin_helmet": ["", "§r§7Armor Set Bonus:", "§r§8 +Causes more damage to monsters (+4 )", "§r§8 +20 "],
    "arena:paladin_chestplate": ["", "§r§7Armor Set Bonus:", "§r§8 +Causes more damage to monsters (+4 )", "§r§8 +20 "],
    "arena:paladin_leggings": ["", "§r§7Armor Set Bonus:", "§r§8 +Causes more damage to monsters (+4 )", "§r§8 +20 "],
    "arena:paladin_boots": ["", "§r§7Armor Set Bonus:", "§r§8 +Causes more damage to monsters (+4 )", "§r§8 +20 "],

    "arena:ganma_hemlock_helmet": ["", "§r§7Armor Set Bonus:", "§r§8 Thorns account for 60 of the damage, + I", "§r§8 -25 critical damage"],
    "arena:ganma_hemlock_chestplate": ["", "§r§7Armor Set Bonus:", "§r§8 Thorns account for 60 of the damage, + I", "§r§8 -25 critical damage"],
    "arena:ganma_hemlock_leggings": ["", "§r§7Armor Set Bonus:", "§r§8 Thorns account for 60 of the damage, + I", "§r§8 -25 critical damage"],
    "arena:ganma_hemlock_boots": ["", "§r§7Armor Set Bonus:", "§r§8 Thorns account for 60 of the damage, + I", "§r§8 -25 critical damage"],

    "arena:stigma_hemlock_helmet": ["", "§r§7Armor Set Bonus:", "§r§8 Thorns account for 120 of the damage, + I", "§r§8 -50 critical damage", "§r§8 Transforms the damage received into XP"],
    "arena:stigma_hemlock_chestplate": ["§r§9+Flying", "", "§r§7Armor Set Bonus:", "§r§8 Thorns account for 120 of the damage, + I", "§r§8 -50 critical damage", "§r§8 Transforms the damage received into XP"],
    "arena:stigma_hemlock_leggings": ["", "§r§7Armor Set Bonus:", "§r§8 Thorns account for 120 of the damage, + I", "§r§8 -50 critical damage", "§r§8 Transforms the damage received into XP"],
    "arena:stigma_hemlock_boots": ["", "§r§7Armor Set Bonus:", "§r§8 Thorns account for 120 of the damage, + I", "§r§8 -50 critical damage", "§r§8 Transforms the damage received into XP"],

    "arena:alpha_hemlock_helmet": ["", "§r§7Armor Set Bonus:", "§r§8 Thorns account for 180 of the damage, + II", "§r§8 -75 critical damage", "§r§8 Transforms the damage received into XP", "§r§8 You explode when you're close to death"],
    "arena:alpha_hemlock_chestplate": ["§r§9+Flying", "", "§r§7Armor Set Bonus:", "§r§8 Thorns account for 180 of the damage, + II", "§r§8 -75 critical damage", "§r§8 Transforms the damage received into XP", "§r§8 You explode when you're close to death"],
    "arena:alpha_hemlock_leggings": ["", "§r§7Armor Set Bonus:", "§r§8 Thorns account for 180 of the damage, + II", "§r§8 -75 critical damage", "§r§8 Transforms the damage received into XP", "§r§8 You explode when you're close to death"],
    "arena:alpha_hemlock_boots": ["", "§r§7Armor Set Bonus:", "§r§8 Thorns account for 180 of the damage, + II", "§r§8 -75 critical damage", "§r§8 Transforms the damage received into XP", "§r§8 You explode when you're close to death"],

    "arena:apollo_chestplate": ["", "§r§7Armor Set Bonus:", "§r§8 +7  (Arrow damage)", "§r§8 + arrows"],
    "arena:apollo_leggings": ["", "§r§7Armor Set Bonus:", "§r§8 +7  (Arrow damage)", "§r§8 + arrows"],
    "arena:apollo_boots": ["", "§r§7Armor Set Bonus:", "§r§8 +7  (Arrow damage)", "§r§8 + arrows"],

    "arena:netherite_apollo_chestplate": ["", "§r§7Armor Set Bonus:", "§r§8 +9  (Arrow damage)"],
    "arena:netherite_apollo_leggings": ["", "§r§7Armor Set Bonus:", "§r§8 +9  (Arrow damage)"],
    "arena:netherite_apollo_boots": ["", "§r§7Armor Set Bonus:", "§r§8 +9  (Arrow damage)"],

    "arena:nebulous_apollo_chestplate": ["", "§r§7Armor Set Bonus:", "§r§8 +14  (Arrow damage)", "§r§8 +3 chance cause critic  (From projectiles, arrows)", "§r§8 +15 multiplier critic  (From projectiles, arrows)"],
    "arena:nebulous_apollo_leggings": ["", "§r§7Armor Set Bonus:", "§r§8 +14  (Arrow damage)", "§r§8 +3 chance cause critic  (From projectiles, arrows)", "§r§8 +15 multiplier critic  (From projectiles, arrows)"],
    "arena:nebulous_apollo_boots": ["", "§r§7Armor Set Bonus:", "§r§8 +14  (Arrow damage)", "§r§8 +3 chance cause critic  (From projectiles, arrows)", "§r§8 +15 multiplier critic  (From projectiles, arrows)"],

    "arena:hades_helmet": ["", "§r§7Armor Set Bonus:", "§r§8 +Summoner (Summon skeleton after kill, 20)", "", "§r§7Spell Bonus:", "§r§8 Increase max summons(+1)"],
    "arena:hades_chestplate": ["", "§r§7Armor Set Bonus:", "§r§8 +Summoner (Summon skeleton after kill, 20)", "", "§r§7Spell Bonus:", "§r§8 Increase max summons(+1)"],
    "arena:hades_leggings": ["", "§r§7Armor Set Bonus:", "§r§8 +Summoner (Summon skeleton after kill, 20)", "", "§r§7Spell Bonus:", "§r§8 Increase max summons(+1)"],
    "arena:hades_boots": ["", "§r§7Armor Set Bonus:", "§r§8 +Summoner (Summon skeleton after kill, 20)", "", "§r§7Spell Bonus:", "§r§8 Increase max summons(+1)"],

    "arena:artemis_helmet": ["", "§r§7Armor Set Bonus:", "§r§8 +30  (Arrow damage)", "§r§8 +Causes more damage to players (+20 )", "§r§8 Causes more damage to monsters (+10 )"],
    "arena:artemis_chestplate": ["", "§r§7Armor Set Bonus:", "§r§8 +30  (Arrow damage)", "§r§8 +Causes more damage to players (+20 )", "§r§8 Causes more damage to monsters (+10 )"],
    "arena:artemis_leggings": ["", "§r§7Armor Set Bonus:", "§r§8 +30  (Arrow damage)", "§r§8 +Causes more damage to players (+20 )", "§r§8 Causes more damage to monsters (+10 )"],
    "arena:artemis_boots": ["", "§r§7Armor Set Bonus:", "§r§8 +30  (Arrow damage)", "§r§8 +Causes more damage to players (+20 )", "§r§8 Causes more damage to monsters (+10 )"],
    
    "arena:ichor_helmet": ["", "§r§7Armor Set Bonus:", "§r§8 12 lifesteal:", "§r§8 24 change inflict bleeding "],
    "arena:ichor_chestplate": ["", "§r§7Armor Set Bonus:", "§r§8 12 lifesteal:", "§r§8 24 change inflict bleeding "],
    "arena:ichor_leggings": ["", "§r§7Armor Set Bonus:", "§r§8 12 lifesteal:", "§r§8 24 change inflict bleeding "],
    "arena:ichor_boots": ["", "§r§7Armor Set Bonus:", "§r§8 12 lifesteal:", "§r§8 24 change inflict bleeding "],

    "arena:ethereal_ichor_helmet": ["", "§r§7Armor Set Bonus:", "§r§8 20 lifesteal:", "§r§8 24 change inflict bleeding ", "§r§8 Causes more damage to players (+20 )"],
    "arena:ethereal_ichor_chestplate": ["", "§r§7Armor Set Bonus:", "§r§8 20 lifesteal:", "§r§8 24 change inflict bleeding ", "§r§8 Causes more damage to players (+20 )"],
    "arena:ethereal_ichor_leggings": ["", "§r§7Armor Set Bonus:", "§r§8 20 lifesteal:", "§r§8 24 change inflict bleeding ", "§r§8 Causes more damage to players (+20 )"],
    "arena:ethereal_ichor_boots": ["", "§r§7Armor Set Bonus:", "§r§8 20 lifesteal:", "§r§8 24 change inflict bleeding ", "§r§8 Causes more damage to players (+20 )"],
    
    "arena:poseidon_helmet": ["", "§r§7Armor Set Bonus:", "§r§8 +50  (thrown damage)", "§r§8 +20  (trident)"],
    "arena:poseidon_chestplate": ["", "§r§7Armor Set Bonus:", "§r§8 +50  (thrown damage)", "§r§8 +20  (trident)"],
    "arena:poseidon_leggings": ["", "§r§7Armor Set Bonus:", "§r§8 +50  (thrown damage)", "§r§8 +20  (trident)"],
    "arena:poseidon_boots": ["", "§r§7Armor Set Bonus:", "§r§8 +50  (thrown damage)", "§r§8 +20  (trident)"],
    
    "arena:zeus_helmet": ["", "§r§7Armor Set Bonus:", "§r§8 +It chains together electric beams when attacking an enemy."],
    "arena:zeus_chestplate": ["", "§r§7Armor Set Bonus:", "§r§8 +It chains together electric beams when attacking an enemy."],
    "arena:zeus_leggings": ["", "§r§7Armor Set Bonus:", "§r§8 +It chains together electric beams when attacking an enemy."],
    "arena:zeus_boots": ["", "§r§7Armor Set Bonus:", "§r§8 +It chains together electric beams when attacking an enemy."],
    
    "arena:artemisa_chestplate": ["", "§r§7Armor Set Bonus:", "§r§8 +5  (Arrow damage)"],
    "arena:artemisa_leggings": ["", "§r§7Armor Set Bonus:", "§r§8 +5  (Arrow damage)"],

    "arena:witch_hat": ["", "§r§7Spell Bonus:", "§r§8 Increase summons health +6 ", "§r§8 Increase max summons(+1)"],
    "arena:mage_chestplate": ["", "§r§7Spell Bonus:", "§r§8 Increase summons health +6 ", "§r§8 Increase max summons(+1)"],
    "arena:mage_leggings": ["", "§r§7Spell Bonus:", "§r§8 Increase summons health +6 ", "§r§8 Increase max summons(+1)"],

    "arena:aureola_helmet": ["", "§r§7Available spells:", "§r§8 Heal & damage in area, 30s cooldown"],
    "arena:blood_hat": ["", "§r§7Armor set Bonus:", "§r§8 +6 lifesteal"],
    "arena:extreme_chestplate": ["", "§r§7Armor set Bonus:", "§r§8 +6 lifesteal"],

    "arena:arena_chestplate": ["", "§r§7Spell Bonus:", "§r§8 Increase ranged summons reload-speed +1 "],
    //weapons
    "arena:wooden_saber": ["", "§r§7Weapon bonus:", "§r§8 +10 chance cause critic "],
    "arena:stone_saber": ["", "§r§7Weapon bonus:", "§r§8 +10 chance cause critic "],
    "arena:copper_saber": ["", "§r§7Weapon bonus:", "§r§8 +10 chance cause critic "],
    "arena:golden_saber": ["", "§r§7Weapon bonus:", "§r§8 +10 chance cause critic "],
    "arena:iron_saber": ["", "§r§7Weapon bonus:", "§r§8 +10 chance cause critic "],
    "arena:diamond_saber": ["", "§r§7Weapon bonus:", "§r§8 +10 chance cause critic "],
    "arena:netherite_saber": ["", "§r§7Weapon bonus:", "§r§8 +10 chance cause critic "],
    "arena:cursed_axe": ["", "§r§7Inflict cursed :", "§r§8 25 chance, 3s duration"],
    "arena:blood_scythe_weapon": ["", "§r§7On hurt mob:", "§r§8 10  lifesteal:", "§r§8 25change inflict bleeding ", "", "§r§7Scythe charm bonus:", "§r§8 +5 lifesteal"],
    "arena:witch_staff": ["", "§r§7On Interact:", "§r§8 Use your avalible spells", "§r§8 Sneak + interact to change spell"],
    "arena:marble_staff": ["", "§r§7On Interact:", "§r§8 Use your avalible spells", "§r§8 Sneak + interact to change spell", "", "§r§7Spell Bonus:", "§r§8 Increase summons health +2 "],
    "arena:hemlock_staff": ["", "§r§7On Interact:", "§r§8 Use your avalible spells", "§r§8 Sneak + interact to change spell", "", "§r§7Spell Bonus:", "§r§8 Decrease cooldown 10"],
    "arena:bamboo_bo": ["", "§r§7On Hurt Mob:", "§r§8 Inflict nausea"],
    "arena:marble_sword": ["", "§r§7On Interact:", "§r§8 +Push entities away with wind"],
    "arena:marble_axe": ["", "§r§7On Interact:", "§r§8 +Push entities away with wind"],
    "arena:marble_spear": ["", "§r§7On Interact:", "§r§8 +Push entities away with wind"],
    "arena:pure_marble_spear": ["", "§r§7On Interact:", "§r§8 +It approaches the entities to deliver a powerful blow."],
    //zweihander
    "arena:runic_twohanded_sword": ["", "§r§7On Interact:", "§r§8 Charge and inflict 20 Sweep damage", "§r§8 10s cooldown"],
    "arena:runic_zweihander": ["", "§r§7On Interact:", "§r§8 Charge and inflict 12 Sweep damage", "§r§8 10s cooldown"],
    "arena:incandecent_zweihander": ["", "§r§7On Interact:", "§r§8 Charge and inflict 10 Sweep damage", "§r§8 10s cooldown", "§r§8 Cause "],
    "arena:frozen_zweihander": ["", "§r§7On Interact:", "§r§8 Charge and inflict 12 Sweep damage", "§r§8 10s cooldown", "§r§8 Inflict  II"],
    "arena:electric_zweihander": ["", "§r§7On Interact:", "§r§8 Charge and inflict 17 Sweep damage", "§r§8 10s cooldown", "§r§8 Calls lightning bolts, 5 chance"],
    "arena:ender_zweihander": ["", "§r§7On Interact:", "§r§8 Charge and inflict 12 Sweep damage", "§r§8 10s cooldown", "§r§8 Inflict 8s  II"],
    "arena:venemous_zweihander": ["", "§r§7On Interact:", "§r§8 Charge and inflict 8 Sweep damage", "§r§8 10s cooldown", "§r§8 Inflict  II"],
    "arena:desertic_zweihander": ["", "§r§7On Interact:", "§r§8 Charge and inflict 12 Sweep damage", "§r§8 10s cooldown", "§r§8 Inflict  II"],
    "arena:hemlock_zweihander": ["", "§r§7On Interact:", "§r§8 Charge and inflict 8 Sweep damage", "§r§8 10s cooldown", "§r§8 Inflict  II"],
};

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const playerInv = player.getComponent("inventory").container;
        const items = Array.from({ length: playerInv.size }).map((_, i) => playerInv.getItem(i));
        items.forEach((item, slot) => {
            if (item?.typeId in lores) {
                if (item.getLore() == "") {
                    const lore = lores[item.typeId].map(line => typeof line === 'function' ? line(player) : line);
                    item.setLore(lore);
                    playerInv.setItem(slot, item);
                }
            }
        })
    }
}, 1);