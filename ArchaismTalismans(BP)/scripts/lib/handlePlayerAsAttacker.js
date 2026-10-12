import { damageEquipment } from "./armorDamage";
import { system } from '@minecraft/server';

const randomChance = percent => Math.ceil(Math.random() * 100) <= percent;
const hasFamily = (entity, family) => entity.matches({ families: [family] });
const addValueIfTag = (tags, map) => {
    let total = 0;
    for (const [tag, value] of Object.entries(map)) { if (tags.has(tag)) total += value }
    return total;
};
const getEquipmentIds = entity => {
    const equip = entity.getComponent("equippable");
    return {
        head: equip?.getEquipment("Head")?.typeId,
        chest: equip?.getEquipment("Chest")?.typeId,
        legs: equip?.getEquipment("Legs")?.typeId,
        feet: equip?.getEquipment("Feet")?.typeId,
        mainhand: equip?.getEquipment("Mainhand")?.typeId
    };
};

export function handlePlayerAsAttacker(e) {
    const { hurtEntity, damageSource, damage } = e;
    const attacker = damageSource.damagingEntity;
    if (attacker?.typeId !== 'minecraft:player') return;
    if (attacker.hasTag('arena:cursed_active')) return;

    const health = hurtEntity.getComponent('minecraft:health').currentValue;
    const vampiric = attacker.getComponent('minecraft:health').currentValue;
    const equipment = getEquipmentIds(attacker);
    const ignoredItems = [ 'minecraft:wind_charge', 'minecraft:egg', 'minecraft:brown_egg', 'minecraft:blue_egg', 'minecraft:snowball' ];
    if (ignoredItems.includes(equipment.mainhand)) return;
    const guardians = [
        "minecraft:elder_guardian",
        "minecraft:guardian"
    ];
    const isBoss = hurtEntity.hasComponent('minecraft:boss');
    const bosses = [ 
        "minecraft:ender_dragon",
        "minecraft:wither",
        "minecraft:warden",
        "minecraft:elder_guardian",
        "minecraft:piglin_brute",
        "minecraft:ravager"
    ];
    const { x, y, z } = hurtEntity.location;
    const dim = hurtEntity.dimension;
    let undeadSmite = 0;
    let criticDamage = 0;
    let otherDamage = 0;
    let armorDamage = 0;
    let flatDamage = 0;
    let areaDamage = 0;
    let ThunderDamage = 0;
    const families = {
        undead: hasFamily(hurtEntity, "undead"),
        player: hasFamily(hurtEntity, "player"),
        monster: hasFamily(hurtEntity, "monster"),
        illager: hasFamily(hurtEntity, "illager")
    };

    const tags = new Set(attacker.getTags());

        const activeEffects = {
            'arena:handwarmer_gauntletleft': [
                { effect: 'slowness', level: 1, condition: damageSource.cause != 'projectile', effectTime: 120 }
            ],
            'arena:natural_butterfly_mask_face': [
                { effect: 'wither', level: 4, condition: 1, effectTime: 120 }
            ],
            'arena:amethyst_earring_jelewer_earring': [ { effect: 'slowness', level: 1, condition: 1, effectTime: 120 } ],
            'arena:crimsom_earring_jelewer_earring': [ { effect: 'poison', level: 1, condition: 1, effectTime: 120 } ],
            'arena:crimsom_amethyst_earring_jelewer_earring': [ { effect: 'weakness', level: 1, condition: 1, effectTime: 120 } ],
            'arena:amethyst_earring_jelewer_earringdown': [ { effect: 'slowness', level: 1, condition: 1, effectTime: 120 } ],
            'arena:crimsom_earring_jelewer_earringdown': [ { effect: 'poison', level: 1, condition: 1, effectTime: 120 } ],
            'arena:crimsom_amethyst_earring_jelewer_earringdown': [ { effect: 'weakness', level: 1, condition: 1, effectTime: 120 } ],
            'arena:iron_end_necklace_jelewer_necklace': [
                { effect: 'levitation', level: 1, condition: 1, effectTime: 60 }
            ],
            'arena:iron_desert_necklace_jelewer_necklace': [
                { effect: 'weakness', level: 2, condition: 1, effectTime: 180 }
            ],
            'arena:iron_poison_necklace_jelewer_necklace': [
                { effect: 'poison', level: 2, condition: 1, effectTime: 180 }
            ],
            'arena:iron_snow_necklace_jelewer_necklace': [
                { effect: 'slowness', level: 2, condition: 1, effectTime: 180 }
            ],
            'arena:golden_end_necklace_jelewer_necklace': [
                { effect: 'levitation', level: 2, condition: 1, effectTime: 120 }
            ],
            'arena:golden_desert_necklace_jelewer_necklace': [
                { effect: 'weakness', level: 3, condition: 1, effectTime: 240 }
            ],
            'arena:golden_poison_necklace_jelewer_necklace': [
                { effect: 'poison', level: 3, condition: 1, effectTime: 240 }
            ],
            'arena:golden_snow_necklace_jelewer_necklace': [
                { effect: 'slowness', level: 3, condition: 1, effectTime: 240 }
            ],
            'arena:prismarine_end_necklace_jelewer_necklace': [
                { effect: 'levitation', level: 3, condition: 1, effectTime: 140 }
            ],
            'arena:prismarine_desert_necklace_jelewer_necklace': [
                { effect: 'weakness', level: 4, condition: 1, effectTime: 300 }
            ],
            'arena:prismarine_poison_necklace_jelewer_necklace': [
                { effect: 'poison', level: 4, condition: 1, effectTime: 300 }
            ],
            'arena:prismarine_snow_necklace_jelewer_necklace': [
                { effect: 'slowness', level: 4, condition: 1, effectTime: 300 }
            ],
            'arena:netherite_end_necklace_jelewer_necklace': [
                { effect: 'levitation', level: 4, condition: 1, effectTime: 160 }
            ],
            'arena:netherite_desert_necklace_jelewer_necklace': [
                { effect: 'weakness', level: 5, condition: 1, effectTime: 360 }
            ],
            'arena:netherite_poison_necklace_jelewer_necklace': [
                { effect: 'poison', level: 5, condition: 1, effectTime: 360 }
            ],
            'arena:netherite_snow_necklace_jelewer_necklace': [
                { effect: 'slowness', level: 5, condition: 1, effectTime: 360 }
            ],
            'arena:fallen_end_necklace_necklace': [
                { effect: 'levitation', level: 4, condition: 1, effectTime: 180 }
            ],
            'arena:fallen_desert_necklace_necklace': [
                { effect: 'weakness', level: 6, condition: 1, effectTime: 360 }
            ],
            'arena:fallen_poison_necklace_necklace': [
                { effect: 'poison', level: 6, condition: 1, effectTime: 360 }
            ],
            'arena:fallen_snow_necklace_necklace': [
                { effect: 'slowness', level: 6, condition: 1, effectTime: 360 }
            ],
            'arena:iron_hemlock_necklace_necklace': [
                { effect: 'wither', level: 1, condition: 1, effectTime: 180 }
            ],
            'arena:golden_hemlock_necklace_necklace': [
                { effect: 'wither', level: 2, condition: 1, effectTime: 240 }
            ],
            'arena:prismarine_hemlock_necklace_necklace': [
                { effect: 'wither', level: 3, condition: 1, effectTime: 300 }
            ],
            'arena:netherite_hemlock_necklace_necklace': [
                { effect: 'wither', level: 4, condition: 1, effectTime: 360 }
            ],
            'arena:fallen_hemlock_necklace_necklace': [
                { effect: 'wither', level: 5, condition: 1, effectTime: 360 }
            ],
            'arena:pure_marble_end_necklace_necklace': [
                { effect: 'levitation', level: 4, condition: 1, effectTime: 200 }
            ],
            'arena:pure_marble_desert_necklace_necklace': [
                { effect: 'weakness', level: 7, condition: 1, effectTime: 360 }
            ],
            'arena:pure_marble_poison_necklace_necklace': [
                { effect: 'poison', level: 7, condition: 1, effectTime: 360 }
            ],
            'arena:pure_marble_snow_necklace_necklace': [
                { effect: 'slowness', level: 7, condition: 1, effectTime: 360 }
            ],
            'arena:pure_marble_hemlock_necklace_necklace': [
                { effect: 'wither', level: 6, condition: 1, effectTime: 360 }
            ],
            'arena:end_wither_ring_witherring': [ { effect: 'levitation', level: 2, condition: 1, effectTime: 120 } ],
            'arena:desert_wither_ring_witherring': [ { effect: 'weakness', level: 3, condition: 1, effectTime: 240 } ],
            'arena:poision_wither_ring_witherring': [ { effect: 'poison', level: 3, condition: 1, effectTime: 240 } ],
            'arena:snow_wither_ring_witherring': [ { effect: 'slowness', level: 3, condition: 1, effectTime: 240 } ],
            'arena:hemlock_wither_ring_witherring': [ { effect: 'wither', level: 2, condition: 1, effectTime: 240 } ],
            'arena:end_wither_ring_witherringdown': [ { effect: 'levitation', level: 2, condition: 1, effectTime: 120 } ],
            'arena:desert_wither_ring_witherringdown': [ { effect: 'weakness', level: 3, condition: 1, effectTime: 240 } ],
            'arena:poision_wither_ring_witherringdown': [ { effect: 'poison', level: 3, condition: 1, effectTime: 240 } ],
            'arena:snow_wither_ring_witherringdown': [ { effect: 'slowness', level: 3, condition: 1, effectTime: 240 } ],
            'arena:hemlock_wither_ring_witherringdown': [ { effect: 'wither', level: 2, condition: 1, effectTime: 240 } ],
            'arena:wither_mask_face': [
                { effect: 'wither', level: 2, condition: damageSource.cause == 'projectile', effectTime: 150 }
            ],
            'arena:archaic_chained_soul_archaiccharm': [
                { effect: 'wither', level: 1, condition: attacker.getComponent('minecraft:health').currentValue <= 6, effectTime: 120 }
            ], 
            'arena:archaic_soul_hand_archaiccharm': [
                { effect: 'wither', level: 1, condition: attacker.getComponent('minecraft:health').currentValue <= 5, effectTime: 120 },
                { effect: 'poison', level: 1, condition: attacker.getComponent('minecraft:health').currentValue <= 5, effectTime: 120 }
            ], 
            'arena:conscious_star_archaiccharm': [
                { effect: 'wither', level: 1, condition: 1, effectTime: 180 },
                { effect: 'poison', level: 1, condition: 1, effectTime: 180 }
            ], 
            'arena:archaic_dimensions_table_archaiccharm': [
                { effect: 'levitation', level: 2, condition: 1, effectTime: 120 },
                { effect: 'weakness', level: 3, condition: 1, effectTime: 240 },
                { effect: 'slowness', level: 3, condition: 1, effectTime: 240 },
                { effect: 'levitation', level: attacker.dimension.id === "minecraft:the_end", condition: 1, effectTime: 180 },
                { effect: 'weakness', level: attacker.dimension.id === "minecraft:nether", condition: 1, effectTime: 240 },
                { effect: 'slowness', level: attacker.dimension.id === "minecraft:overworld", condition: 1, effectTime: 240 }
            ],
            'ip:wither_pet_amulet': [
                { effect: 'poison', level: 1, condition: damageSource.cause != 'projectile', effectTime: 120 }
            ],
            'mnra_cata:floret_ring_ring': [
                { effect: 'poison', level: 2, condition: damageSource.cause != 'projectile', effectTime: 200 }
            ],
            'eu:rune_of_blindness_amulet': [
                { effect: 'blindness', level: 1, condition: 1, effectTime: 60 }
            ],
            'eu:rune_of_cold_amulet': [
                { effect: 'slowness', level: 1, condition: 1, effectTime: 60 }
            ],
            'eu:rune_of_curses_amulet': [
                { effect: 'weakness', level: 1, condition: 1, effectTime: 60 }
            ],
            'eu:rune_of_sickness_amulet': [
                { effect: 'poison', level: 1, condition: 1, effectTime: 60 }
            ],
            'eu:sacred_rune_amulet': [
                { effect: 'levitation', level: 1, condition: 1, effectTime: 60 }
            ],
            'eu:wither_necklace_necklace': [
                { effect: 'wither', level: 1, condition: 1, effectTime: 100 }
            ],
            'eu:queen_bee_stinger_talisman': [
                { effect: 'poison', level: 1, condition: 1, effectTime: 100 }
            ],
            'eu:ice_ring_ring': [
                { effect: 'slowness', level: 2, condition: 1, effectTime: 100 }
            ],
            'twm:ice_gauntlet_gauntlet': [
                { effect: 'slowness', level: 1, condition: damageSource.cause != 'projectile', effectTime: 120 }
            ],
            'twm:venom_gauntlet_gauntlet': [
                { effect: 'poison', level: 1, condition: damageSource.cause != 'projectile', effectTime: 120 }
            ],
            'twm:ice_claw_gauntlet': [
                { effect: 'slowness', level: 1, condition: damageSource.cause != 'projectile', effectTime: 120 }
            ],
            'twm:venom_claw_gauntlet': [
                { effect: 'poison', level: 1, condition: damageSource.cause != 'projectile', effectTime: 120 }
            ],
            'twm:ice_gauntlet_gauntletleft': [
                { effect: 'slowness', level: 1, condition: damageSource.cause != 'projectile', effectTime: 120 }
            ],
            'twm:venom_gauntlet_gauntletleft': [
                { effect: 'poison', level: 1, condition: damageSource.cause != 'projectile', effectTime: 120 }
            ],
            'twm:ice_claw_gauntletleft': [
                { effect: 'slowness', level: 1, condition: damageSource.cause != 'projectile', effectTime: 120 }
            ],
            'twm:venom_claw_gauntletleft': [
                { effect: 'poison', level: 1, condition: damageSource.cause != 'projectile', effectTime: 120 }
            ],
            'twm:frost_quiver_body': [
                { effect: 'slowness', level: 1, condition: damageSource.cause == 'projectile', effectTime: 120 }
            ],
            'twm:venom_quiver_body': [
                { effect: 'poison', level: 1, condition: damageSource.cause == 'projectile', effectTime: 120 }
            ],
            'g:rusty_copper_amulet_amulet': [
                { effect: 'poison', level: 1, condition: damageSource.cause == 'projectile', effectTime: 120 }
            ],
            'g:moon_amulet_amulet': [
                { effect: 'levitation', level: 2, condition: 1, effectTime: 120 }
            ], 
            'g:eclipse_amulet_amulet': [
                { effect: 'wither', level: 1, condition: 1, effectTime: 120 },
                { effect: 'weakness', level: 2, condition: 1, effectTime: 120 },
                { effect: 'slowness', level: 2, condition: 1, effectTime: 120 }
            ],
            'g:eye_amulet_amulet': [
                { effect: 'invisibility', level: 1, condition: 1, effectTime: 120 },
                { effect: 'weakness', level: 4, condition: 1, effectTime: 120 },
                { effect: 'slowness', level: 4, condition: 1, effectTime: 120 }
            ]
        };
        const armorPieces = [ equipment.head, equipment.chest, equipment.legs, equipment.feet ];
        const tagsH = hurtEntity.getTags();
        const isFallenPlayer = hurtEntity.typeId === "minecraft:player" && ( tagsH.some(tag => tag.startsWith("arena:cursed_")) || tagsH.some(tag => tag.startsWith("arena:fallen_"))
         || getEquipmentIds(hurtEntity).some(id => id?.startsWith("arena:fallen_marble_")) || getEquipmentIds(hurtEntity).some(id => id?.startsWith("minecraft:netherite_"))
         || getEquipmentIds(hurtEntity).some(id => id?.startsWith("arena:ichor_")) || getEquipmentIds(hurtEntity).some(id => id?.startsWith("arena:ethereal_ichor_"))
         || getEquipmentIds(hurtEntity).some(id => id?.startsWith("arena:impious_marble_")));
        const isEvilTag = hurtEntity.typeId === "minecraft:player" && 
        ( tagsH.includes('arena:deep_knight_helmet') || tagsH.includes('arena:deformed_mask') || tagsH.includes('arena:necromancer_mask') || tagsH.includes('arena:malingnant_orb') || 
          tagsH.includes('arena:malingnant_orb') || tagsH.includes('arena:archaic_cursed_skull') || tagsH.includes('arena:nighthood') || tagsH.includes('arena:vexed_souls_lantern') || 
          tagsH.includes('arena:crown_of_calamity') || tagsH.includes('arena:extreme_had') || tagsH.includes('arena:depart_paladins_fate') || tagsH.includes('arena:arcane_hood'));
        const isLifeStealTag = hurtEntity.typeId === "minecraft:player" && 
        ( tagsH.some(tag => tag.startsWith("twm:blood")) || tagsH.includes('arena:extreme_had_head') || tagsH.includes('arena:blood_scythe_charm') || tagsH.includes('arena:contracted_heart_charm') || 
          tagsH.includes('arena:archaic_dimensions_horn_archaiccharm') || tagsH.some(tag => tag.startsWith("arena:iron_vampiric_")) || tagsH.some(tag => tag.startsWith("arena:golden_vampiric_")) || 
          tagsH.some(tag => tag.startsWith("arena:prismarine_vampiric_")) || tagsH.some(tag => tag.startsWith("arena:netherite_vampiric_")));

        for (const piece of armorPieces) {
          if (!piece) continue;
          if (piece.startsWith("arena:marble_") && families.undead) {
            undeadSmite += 0.125;
          }
          if (piece.startsWith("arena:pure_marble_")) {
            if (families.undead || families.monster || isFallenPlayer) { undeadSmite += 0.25 }
            if (isEvilTag || isLifeStealTag) { undeadSmite += 0.15 }
          }
          if (piece.startsWith("arena:artemis_") && damageSource.cause == 'projectile') {
            otherDamage += 0.075;
            if (families.monster) { undeadSmite += 0.025 }
            if (families.player) { otherDamage += 0.05 }
          }
          if (piece.startsWith("arena:ganma_hemlock_")) {
            otherDamage -= 0.06;
            criticDamage -= 0.06;
          }
          if (piece.startsWith("arena:stigma_hemlock_")) {
            otherDamage -= 0.12;
            criticDamage -= 0.12;
          }
          if (piece.startsWith("arena:alpha_hemlock_")) {
            otherDamage -= 0.18;
            criticDamage -= 0.18;
          }
          if (piece.startsWith("arena:fallen_marble_") && families.player) {
            otherDamage += 0.1;
          }
          if (piece.startsWith("arena:impious_marble_") && families.player) {
            otherDamage += 0.2;
          }
          if (piece.startsWith("arena:ethereal_ichor_") && families.player) {
            otherDamage += 0.05;
          }
          if (piece.startsWith("arena:poseidon_")) {
            if (equipment.mainhand === 'minecraft:trident') { otherDamage += 0.05 }
            if (damageSource.cause == 'projectile') { otherDamage += 0.125 }
          }
          if (piece.startsWith("arena:zeus_")) {
            ThunderDamage += 2;
          }
          if (piece.startsWith("arena:paladin_")) {
            undeadSmite += 0.05;
            if (families.monster) {
                flatDamage += 1;
            }
          }
        }

        if (ThunderDamage > 0) {thunderbolt(attacker, hurtEntity, ThunderDamage, ThunderDamage, 6);}

        if (families.player && equipment.chest == 'arena:fallen_marble_chestplate') {
            armorDamage += 2;
            dim.spawnParticle("arena:apollo_hit_emitter", { x, y, z });
        }
        if (families.player && equipment.chest == 'arena:impious_marble_chestplate') {
            armorDamage += 3;
            dim.spawnParticle("arena:apollo_hit_emitter", { x, y, z });
            dim.spawnParticle("arena:apollo_hit_emitter", { x, y, z });
        }
        if (tags.has('twm:strong_echo_ring_witherring') || tags.has('twm:strong_echo_ring_witherringdown')) { attacker.playSound("shriek.sculk_shrieker", { location: attacker.location, volume: 0.3, pitch: 0.6 })}
        if (tags.has('twm:strong_breeze_ring_witherring') || tags.has('twm:strong_breeze_ring_witherringdown')) { dim.spawnEntity('wind_charge_projectile', hurtEntity.location) }
        if (tags.has('g:valiant_amulet_amulet') && families.illager) { otherDamage += 0.5 }
        if (equipment.mainhand === 'arena:bamboo_bo') { hurtEntity.addEffect('nausea', 160, { amplifier: 1, showParticles: true })}
        if (tags.has('arena:deformed_mask_face') && families.player) {
            otherDamage += 0.15;
            armorDamage += 3;
        }
        if (tags.has('arena:archaic_marble_wings_archaiccharm') && families.undead && equipment.chest == 'minecraft:elytra') { undeadSmite += 0.5 }
        if (tags.has('arena:archaic_hemlock_wings_archaiccharm') && families.undead && equipment.chest == 'minecraft:elytra') { undeadSmite += 0.65 }
        if (tags.has('arena:sacret_sword_charm') && families.undead && damageSource.cause != 'projectile') {
            undeadSmite += 0.25;
            hurtEntity.setOnFire(4); 
        }
        if (tags.has('arena:angelic_mask_face') && families.undead) {
            undeadSmite += 0.4;
            hurtEntity.setOnFire(4); 
        }
        if (tags.has('arena:fallen_wings_archaiccharm') && families.player && equipment.chest == 'minecraft:elytra') { otherDamage += 0.5 }
        if (tags.has('arena:fallen_angel_mask_face') && families.player) {
            otherDamage += 0.4;
            hurtEntity.setOnFire(4); 
        }
        if (tags.has('arena:cursed_sword_charm') && families.player && damageSource.cause != 'projectile') {
            otherDamage += 0.25;
            hurtEntity.setOnFire(4); 
        }
        if (tags.has('arena:blazing_earring_earring') && (hurtEntity.matches({ families: [ "blaze" ]}) || hurtEntity.matches({ families: [ "magmacube" ]}))) {
            otherDamage += 0.25;
        }
        if (tags.has('arena:blazing_earring_earringdown') && (hurtEntity.matches({ families: [ "blaze" ]}) || hurtEntity.matches({ families: [ "magmacube" ]}))) {
            otherDamage += 0.25;
        }
        if (tags.has('arena:archaic_warden_claws_archaiccharm') && families.monster && damageSource.cause != 'projectile') {
            otherDamage += 0.35; 
            dim.spawnParticle("minecraft:sonic_explosion", { x, y: y + 1, z });
            attacker.playSound("shriek.sculk_shrieker", { location: attacker.location, volume: 0.3, pitch: 0.6 });
        }
        if (tags.has('arena:archaic_incript_paper_archaiccharm') && randomChance(25)) { attacker.addEffect('absorption', 200, { amplifier: 0, showParticles: false })}
        if (tags.has('arena:conscious_star_archaiccharm') && randomChance(20)) { attacker.addEffect('absorption', 400, { amplifier: 0, showParticles: false })}
        if (tags.has('skull_kill') && randomChance(20)) {
            criticDamage += 1;
            attacker.removeTag('skull_kill');
        } 
        if (tags.has('arena:poseidon_mask_face') && (hurtEntity.matches({ families: [ "guardian" ]}) || hurtEntity.matches({ families: [ "guardian" ]}))) {
            otherDamage += 0.6; 
            dim.spawnParticle("minecraft:ice_evaporation_emitter", { x, y: y + 1, z });
        }
        if (tags.has('arena:archaic_good_and_evil_flower_archaiccharm') && (bosses.includes(hurtEntity?.typeId) || isBoss)) {
            otherDamage += 0.8; 
            dim.spawnParticle("minecraft:ice_evaporation_emitter", { x, y: y + 1, z });
        }
        let soulDamage = 0
        if (tags.has('arena:heart_of_judgment_heartycharm')) { soulDamage += 0.1 }
        if (tags.has('arena:archaic_soul_hand_archaiccharm')) { soulDamage += 0.15}
        if (soulDamage > 0) {
            hurtEntity.applyDamage(health * soulDamage, { cause: 'void', damagingEntity: attacker });
            dim.spawnParticle("arena:soul_hit_emitter", { x, y, z });
        }
        if (tags.has('arena:conscious_charge')) { dim.spawnParticle("arena:soul_hit_emitter", { x, y, z }) }

        for (const [tag, multiplier] of Object.entries(UNDEADSMITE_bonus)) { if (tags.has(tag) && families.undead) { undeadSmite += multiplier } }
        for (const [tag, multiplier] of Object.entries(SLAYER_bonus)) { if (tags.has(tag) && families.player) { otherDamage += multiplier } }
        for (const [tag, multiplier] of Object.entries(DAMAGE_BONUS_TAGS)) { if (tags.has(tag)) { otherDamage += multiplier } }
        for (const [tag, multiplier] of Object.entries(CursedBreaaker_bonus)) { if (tags.has(tag) && (families.player && hurtEntity.hasTag('arena:cursed_active'))) { 
            otherDamage += multiplier;
            dim.spawnParticle("arena:arid_hit", { x, y, z });
        } }
        for (const [tag] of Object.entries(SculkBonus)) { 
            if (tags.has(tag)) {
                let sculKills = attacker.getDynamicProperty('arena_sculkilling')
                otherDamage += sculKills *  0.01 
            } 
        }
        if (tags.has('arena:archaic_reckless_archer_archaiccharm') && damageSource.cause == 'projectile') {
            let reckless_hits = attacker.getDynamicProperty('reckless_hits') || 0;
            if (reckless_hits < 75) {
                reckless_hits++;
                attacker.setDynamicProperty('reckless_hits', reckless_hits);
                attacker.playSound("conduit.attack", attacker.location);
                const { x, y, z } = attacker.location;
                if (reckless_hits <= 25) { 
                    attacker.playSound("conduit.activate", attacker.location);
                    attacker.dimension.spawnParticle("arena:divine_bow_first", { x, y, z }) 
                }
                if (reckless_hits <= 50) { 
                    attacker.playSound("conduit.activate", attacker.location);
                    attacker.dimension.spawnParticle("arena:divine_bow_second", { x, y, z }) 
                }
                if (reckless_hits <= 75) { 
                    attacker.playSound("conduit.activate", attacker.location);
                    attacker.dimension.spawnParticle("arena:divine_bow_third", { x, y, z }) 
                }
            }
            undeadSmite += reckless_hits *  0.01 
        } 

        const displayParts = [];
        for (const [tag, config] of Object.entries(hitCounters)) {
            if (!tags.has(tag)) continue;
            const { prop, limit } = config;
            const current = attacker.getDynamicProperty(prop) || 0;
            const newCount = current + 1;
            attacker.setDynamicProperty(prop, newCount);

            if (newCount > limit) continue;
            let text = `§c${newCount}`;
            if (newCount === limit) {
                text = `§6!! ${newCount}`;
                attacker.playSound("particle.soul_escape", { volume: 10, pitch: 0.9 });
            }
            displayParts.push(text);
        }
        if (displayParts.length > 0) {
            attacker.onScreenDisplay.setActionBar( displayParts.join("§7, ") );
        }
        if (tags.has('arena:dream_tatters_of_the_king_body')) {
            let kills = attacker.getDynamicProperty('tatters_king')
            if (kills >= 3) {
                criticDamage += 0.5;
                attacker.setDynamicProperty('tatters_king', 0)
            }
        }
        if (tags.has('arena:demon_mask_face') && tags.has('mask9_ready')) {
            criticDamage += 2;
            hurtEntity.setOnFire(10);
            attacker.removeTag('mask9_ready')
            attacker.setDynamicProperty('demon_mask_hits', 0)
        }
        if (tags.has('arena:demon_mask_face') && attacker.getDynamicProperty('demon_mask_hits') >= 10 ) {
            attacker.addTag('mask9_ready')
        }
        if (tags.has('arena:nefrite_edged_sword_talisman')) {
            let hits = attacker.getDynamicProperty('edged_hits')
            if (hits > 6) {
                flatDamage += 5;
                attacker.setDynamicProperty('edged_hits', 0)
            }
        }
        if (tags.has("arena:complexion_afinity_bracelet_charm")) {
            let hits = attacker.getDynamicProperty('complexion_hits')
            if (hits > 6) {
                hurtEntity.applyDamage(3, { cause: "void", damagingEntity: attacker });
                dim.spawnParticle("arena:apollo_hit_emitter", { x, y, z });
                attacker.setDynamicProperty('complexion_hits', 0);
            }
        }

        if (tags.has('arena:doble_edged_charm')) {
            let hits = attacker.getDynamicProperty('doble_edged_hits')
            if (hits > 8) {
                criticDamage += 0.4;
                hurtEntity.setOnFire(2);
                attacker.setDynamicProperty('doble_edged_hits', 0)
            }
        }
        if (tags.has('arena:cherry_sword_charm')) {
            let hits = attacker.getDynamicProperty('cherry_sword_hits')
            if (hits > 8) {
                criticDamage += 0.5;
                attacker.setDynamicProperty('cherry_sword_hits', 0)
                const nearbyEntities = attacker.dimension.getEntities({ location: attacker.location, maxDistance: 4,
                excludeTypes: ["minecraft:item", "minecraft:xp_orb"], excludeFamilies: [ "inanimate", "monster" ]});
                for (const entity of nearbyEntities) {
                    const isTamed = entity.hasComponent('minecraft:is_tamed');
                    if (isTamed) { entity.addEffect("regeneration", 180, { amplifier: 0, showParticles: true }) }
                }
            }
        }
        if (tags.has('arena:archaic_triple_edged_sword_archaiccharm')) {
            let hits = attacker.getDynamicProperty('triple_edged_hits')
            if (hits > 9) {
                criticDamage += 1;
                hurtEntity.setOnFire(4);
                attacker.setDynamicProperty('triple_edged_hits', 0)
            }
        }
        if (tags.has('arena:conscious_star_archaiccharm')) {
            let hits = attacker.getDynamicProperty('conscious_hits')
            if (hits > 10) {
                attacker.playSound("shriek.sculk_shrieker", { location: attacker.location, volume: 0.3, pitch: 0.6 });
                criticDamage += 1.5;
                areaDamage += 0.25;
                attacker.setDynamicProperty('conscious_hits', 0)
            }
        }
        if (tags.has('arena:repeating_ring_ring') && equipment.mainhand == 'minecraft:bow' && damageSource.cause == 'projectile') { otherDamage += 0.25 }
        let totalKnockback = 0;
        if (tags.has('arena:mask_charged')) {
            otherDamage += 0.15;
            totalKnockback += 0.18;
        }
        if (tags.has('arena:apollo_bracer_gauntlet')  && damageSource.cause == 'projectile') { totalKnockback += 0.18 }
        if (tags.has('arena:apollo_bracer_gauntletleft')  && damageSource.cause == 'projectile') { totalKnockback += 0.18 }

        for (const [tag, multiplier] of Object.entries(knockback_bonus)) {
            if (tags.has(tag)) { totalKnockback += multiplier; }
        }
        if (totalKnockback > 0) {
            system.runTimeout(() => {
                const { x1, y1, z1 } = attacker.location;
                const dir = attacker.getViewDirection();
                const px = x1 + dir.x1 * 1;
                const py = y1 + 1;
                const pz = z1 + dir.z1 * 1;
                hurtEntity.applyKnockback(dir.x, dir.z, 1 + totalKnockback, 0.3);
                dim.spawnParticle("minecraft:ice_evaporation_emitter", { x, y: y + 1, z });
            }, 4);
        }
        if (armorDamage > 0) {damageEquipment(hurtEntity, armorDamage)}
        if (tags.has('arena:archaic_cursed_book_archaiccharm')) {
            let Player_XP = attacker.level
            otherDamage += Math.min(Player_XP * 0.005, 0.5);
            if (Player_XP > 29) { dim.spawnParticle("arena:learned_particles", { x, y: y + 1, z }) }
        }
        if (tags.has('arena:diamond_necklace_necklace') && damageSource.cause != 'projectile') { areaDamage += 0.25 }
        if (tags.has('arena:melunch_doll_doll') && damageSource.cause != 'projectile') { areaDamage += 0.1 } 
        if (tags.has('arena:apolo_quiver_body')  && damageSource.cause == 'projectile') { areaDamage += 0.5 }
        let nearby  = dim.getEntities({ location: hurtEntity.location, maxDistance: 2.8, excludeTypes: ["minecraft:item", "minecraft:xp_orb"] })
        if (tags.has('arena:apollo_replies_belt_body')  && damageSource.cause == 'projectile') {
            dim.spawnParticle("arena:apollo_hit_emitter", { x, y, z });
            areaDamage += 1
            nearby.forEach(ent => {
                if (ent === (attacker || hurtEntity)) return;
                ent.addEffect('wither', 60, { amplifier: 1, showParticles: true });
            });
        }
        criticDamage += applyMeleeEffects(tags, hurtEntity, damage, attacker, damageSource);
        flatDamage += applyProjectileEffects(tags, attacker, hurtEntity, damage, damageSource);
        criticDamage = Math.min(criticDamage, 3);
        let finalDamage = (criticDamage + undeadSmite + otherDamage);

        if (areaDamage > 0) {
            if(damageSource.cause == 'entityAttack' && !tags.has('arena:conscious_star_archaiccharm')) {
                attacker.playSound("sweep_attack", { location: attacker.location, volume: 0.5, pitch: 1.2 });
                const { x, y, z } = attacker.location;
                const dir = attacker.getViewDirection();
                const dim = attacker.dimension;
                dim.spawnParticle("arena:area_damage", { x: x + dir.x, y: y + 1, z: z + dir.z });
            }
            if(damageSource.cause == 'projectile') { dim.spawnParticle("minecraft:wind_explosion_emitter", { x, y: y + 1, z }) }
            if(tags.has('arena:conscious_star_archaiccharm')) { dim.spawnParticle("minecraft:wind_explosion_emitter", { x, y: y + 1, z }) }
            nearby.forEach(ent =>{
                if (ent === (attacker || hurtEntity)) return;
                ent.applyDamage((((damage + flatDamage) * (1 + finalDamage)) * areaDamage))
                if(tags.has('arena:conscious_star_archaiccharm')) { dim.spawnParticle("minecraft:sonic_explosion", { x, y: y + 1, z }) }
            })
        }
        if ((finalDamage || flatDamage) > 0) {
            hurtEntity.applyDamage(((damage + flatDamage) * (1 + finalDamage)));
            if (criticDamage > 0) {
                attacker.playSound("critical_attack", { location: attacker.location, volume: 1.2 });
                dim.spawnParticle("arena:critical_hit_emitter", { x, y, z });
            }
            if (undeadSmite > 0) {
                dim.spawnParticle("arena:smite_hit_emitter", { x, y, z });
            }
        }
        if (tags.has('arena:hellish_core_charm')) { system.runTimeout(() => { hurtEntity.applyDamage(((damage + flatDamage) * (1 + finalDamage)) * 0.5) }, 10) }
        if ((tags.has('arena:piercing_earring_earring') || tags.has('arena:piercing_earring_earringdown')) && damageSource.cause == 'projectile') {
            const nearbyEntities = attacker.dimension.getEntities({ location: attacker.location, maxDistance: 5,
            excludeTypes: ["minecraft:item", "minecraft:xp_orb"], excludeFamilies: [ "inanimate" ]});
            for (const entity of nearbyEntities) {
                if (entity === (attacker || hurtEntity)) return;
                entity.applyDamage(((damage + flatDamage) * (1 + finalDamage)));
                break;
            }
        }
    applyVampiricHealing(tags, attacker, damage, vampiric, hurtEntity);
    giveEffect(attacker, activeEffects, hurtEntity);
}

function applyProjectileEffects(tags, attacker, hurtEntity, damage, damageSource) {
    if (damageSource.cause !== 'projectile') return 0;
    const { x, y, z } = hurtEntity.location;
    const dim = hurtEntity.dimension;
    let totalMultiplier = 0;

    const equipment = getEquipmentIds(attacker);
    const armorPieces = [ equipment.chest, equipment.legs, equipment.feet ];
    for (const piece of armorPieces) {
        if (!piece) continue;
        if (piece.startsWith("arena:apollo_")) { totalMultiplier += 2 }
        if (piece.startsWith("arena:netherite_apollo_")) { totalMultiplier += 3 }
        if (piece.startsWith("arena:nebulous_apollo_")) { totalMultiplier += 4 }
    }
    if (equipment.chest == 'arena:netherite_apollo_chestplate' || equipment.chest == 'arena:nebulous_apollo_chestplate') { 
        dim.spawnParticle("arena:smite_hit_emitter", { x, y, z });
    }
    if (equipment.chest == 'arena:apollo_chestplate') {
        dim.spawnParticle("arena:smite_hit_emitter", { x, y, z });
        hurtEntity.setOnFire(2);
        totalMultiplier += 1;
    }

    for (const [tag, multiplier] of Object.entries(ARROW_DAMAGE_BONUS)) {
        if (tags.has(tag)) { totalMultiplier += multiplier; }
    }
    if (totalMultiplier > 0) { dim.spawnParticle("arena:bow_hit_emitter", { x, y, z })}
    for (let i = 5; i <= 20; i += 5) {
        if (totalMultiplier > i) { dim.spawnParticle("arena:bow_hit_emitter", { x, y, z })}
    }

    if (tags.has('arena:deer_skull_talisman')) {
        dim.spawnParticle("arena:fire_hit_particle", { x, y: y + 1, z });
        hurtEntity.setOnFire(4);
    }
    if (tags.has('twm:molten_quiver_body')) {
        dim.spawnParticle("arena:fire_hit_particle", { x, y: y + 1, z });
        hurtEntity.setOnFire(3);
    }
    if (tags.has('arena:artemisa_arrowhead_charm')) {
        dim.spawnEntity("arena:ignited_explosion", { x, y: y + 1, z });
    }
    if (tags.has('arena:feared_end_hat_face')) {
        hurtEntity.applyDamage(2, { cause: 'void', damagingEntity: attacker });
        dim.spawnParticle("arena:apollo_hit_emitter", { x, y, z });
    }
    if (tags.has('twm:frost_quiver_body')) {
        dim.spawnParticle("arena:freeze_hit", { x, y, z });
    }
  return totalMultiplier;
}

function applyVampiricHealing(tags, attacker, damage, currentHealth, hurtEntity) {
    const { x, y, z } = hurtEntity.location;
    const dim = hurtEntity.dimension;
    const component = attacker.getComponent('minecraft:health');
    if (!component) return;
    let lifeSteal = 0;
    const equipment = getEquipmentIds(attacker);
    lifeSteal += addValueIfTag(tags, LIFE_STEAL_TAGS);

    if (equipment.mainhand === 'arena:blood_scythe_weapon') { lifeSteal += 0.10 }
    if (equipment.head === 'arena:ichor_helmet') { lifeSteal += 0.03 }
    if (equipment.chest === 'arena:ichor_chestplate') { lifeSteal += 0.03 }
    if (equipment.legs === 'arena:ichor_leggings') { lifeSteal += 0.03 }
    if (equipment.feet === 'arena:ichor_boots') { lifeSteal += 0.03 }
    if (equipment.head === 'arena:ethereal_ichor_helmet') { lifeSteal += 0.05 }
    if (equipment.chest === 'arena:ethereal_ichor_chestplate') { lifeSteal += 0.05 }
    if (equipment.legs === 'arena:ethereal_ichor_leggings') { lifeSteal += 0.05 }
    if (equipment.feet === 'arena:ethereal_ichor_boots') { lifeSteal += 0.05 }
    if (tags.has('arena:archaic_dimensions_horn_archaiccharm')) { 
        lifeSteal += 0.04 
        if (attacker.dimension.id === "minecraft:nether") { lifeSteal += 0.04 }
    }
    if (tags.has('arena:extreme_had_head') && equipment.head === 'arena:blood_hat') { lifeSteal += 0.03 }
    if (tags.has('arena:blood_scythe_charm') && equipment.mainhand === 'arena:blood_scythe_weapon') { lifeSteal += 0.03 }

    if (equipment.head === 'arena:blood_hat') { lifeSteal += 0.03; }
    if (equipment.chest === 'arena:extreme_chestplate') { lifeSteal += 0.03; }

    lifeSteal = Math.min(lifeSteal, 1);
    if (lifeSteal > 0) {
        component.setCurrentValue(currentHealth + damage * lifeSteal);
        dim.spawnParticle("arena:bleeding", { x, y: y + 1, z });
    }
}
function thunderboltChain(damager, origin, target, prevTargets, damage, range, chains, pitch) {
    if (chains <= 0 || damage < 1) return;
    const dim = damager.dimension;
    const originLoc = origin.location;
    const targetLoc = target.location;
    const xDif = targetLoc.x - originLoc.x;
    const yDif = targetLoc.y - originLoc.y;
    const zDif = targetLoc.z - originLoc.z;
    const distanceBetween = Math.hypot(xDif, yDif, zDif);
    for (let i = 1; i < distanceBetween; i++) {
        system.runTimeout(() => {
            const progress = i / distanceBetween;
            dim.spawnParticle("arena:discharge_hit", { x: originLoc.x + xDif * progress, y: originLoc.y + 1 + yDif * progress, z: originLoc.z + zDif * progress });
            dim.spawnParticle("arena:discharge_electricity", { x: originLoc.x + xDif * progress, y: originLoc.y + 1 + yDif * progress, z: originLoc.z + zDif * progress });
        }, i / 2);
    }
    system.runTimeout(() => {
        target.applyDamage(damage, { cause: "magic", damagingEntity: damager  });
        dim.playSound("item.trident.thunder", targetLoc, { pitch: pitch, volume: 1 });
        dim.spawnParticle("arena:discharge_big_electricity", targetLoc);
        const newTargets = [...prevTargets, target];
        const chainTargets = dim.getEntities({ location: targetLoc, maxDistance: range, minDistance: 1,
        excludeTypes: ["minecraft:item", "minecraft:xp_orb"], excludeFamilies: [ "inanimate" ] });
        for (const next of chainTargets) {
            if (newTargets.includes(next)) continue;
            thunderboltChain( damager, target, next, newTargets, damage * 0.85, Math.min(range * 1.15, 16), chains - 1, pitch * 0.95 );
            return;
        }
    }, 1 + distanceBetween / 2);
}

function thunderbolt(attacker, hurtEntity, damage = 6, chains = 3, range = 6) {
    const dim = attacker.dimension;
    const loc = hurtEntity.location;
    dim.playSound("item.trident.thunder", loc);
    dim.spawnParticle("arena:discharge_big_electricity", loc);
    const targets = dim.getEntities({ location: loc, maxDistance: range, minDistance: 1, excludeTypes: ["minecraft:item", "minecraft:xp_orb"], excludeFamilies: [ "inanimate" ] });
    for (const target of targets) {
        if (target === attacker) continue;
        thunderboltChain( attacker, attacker, target, [attacker], damage, range, chains, 1 );
        return;
    }
}
function giveEffect(player, tags, entity) {
    let effects = {};
    let effectTimes = {};
    for (const [tag, effectList] of Object.entries(tags)) {
        if (!player.hasTag(tag)) continue;
        effectList.forEach(({ effect, condition, level, effectTime }) => {
            if (condition) {
                effects[effect] = (effects[effect] || 0) + level;
                effectTimes[effect] = Math.max(effectTimes[effect] || 0, effectTime);
            }
        });
    }
    const conflictingEffects = [
        { effect1: 'poison', effect2: 'regeneration' },
        { effect1: 'weakness', effect2: 'strength' },
        { effect1: 'mining_fatigue', effect2: 'haste' },
        { effect1: 'slowness', effect2: 'speed' }
    ];
    conflictingEffects.forEach(({ effect1, effect2 }) => {
        const level1 = effects[effect1] || 0;
        const level2 = effects[effect2] || 0;
        if (level1 > 0 && level2 > 0) {
            if (level1 === level2) {
                delete effects[effect1];
                delete effects[effect2];
                delete effectTimes[effect1];
                delete effectTimes[effect2];
            } else {
                const strongerEffect = level1 > level2 ? effect1 : effect2;
                const weakerEffect = level1 > level2 ? effect2 : effect1;
                effects[strongerEffect] = Math.abs(level1 - level2);
                delete effects[weakerEffect];
                delete effectTimes[weakerEffect];
            }
        }
    });
    for (const [effectName, level] of Object.entries(effects)) {
        const time = effectTimes[effectName] || 0;
        entity.addEffect(effectName, time, { amplifier: level - 1, showParticles: true });
    }
}

const SculkBonus = {
    'arena:iron_sculk_ring_ring': 0,
    'arena:golden_sculk_ring_ring': 0,
    'arena:prismarine_sculk_ring_ring': 0,
    'arena:netherite_sculk_ring_ring': 0,
    'arena:fallen_sculk_ring_ring': 0,
};
const hitCounters = {
    'arena:complexion_afinity_bracelet_charm': { prop: 'complexion_hits', limit: 6 },
    'arena:nefrite_edged_sword_talisman': { prop: 'edged_hits', limit: 6 },
    'arena:doble_edged_charm': { prop: 'doble_edged_hits', limit: 8 },
    'arena:archaic_triple_edged_sword_archaiccharm': { prop: 'triple_edged_hits', limit: 9 },
    'arena:demon_mask_face': { prop: 'demon_mask_hits', limit: 10 },
    'arena:cherry_sword_charm': { prop: 'cherry_sword_hits', limit: 8 },
    'arena:conscious_star_archaiccharm': { prop: 'conscious_hits', limit: 10 }
};
const knockback_bonus = {
    'arena:archaic_dimensions_horn_archaiccharm': 0.26,
    'arena:marble_mask_face': 0.18,
    'arena:fallen_marble_mask_face': 0.18,
    'g:knockback_amulet_amulet': 0.26,
};
const DAMAGE_BONUS_TAGS = {
    'twm:strong_echo_ring_witherring': 0.25,
    'twm:strong_echo_ring_witherringdown': 0.25,
    'twm:destroyer_emblem_amulet': 0.2,
    'twm:putrid_scent_talisman': 0.05,
    'arena:conscious_charge': 0.5
};
const UNDEADSMITE_bonus = {
    'twm:holy_cross_talisman': 0.5,

    'arena:divine_orb_charm': 0.35,

    'arena:iron_paladin_earring_earring': 0.03,
    'arena:golden_paladin_earring_earring': 0.06,
    'arena:prismarine_paladin_earring_earring': 0.09,
    'arena:netherite_paladin_earring_earring': 0.12,
    'arena:fallen_paladin_earring_earring': 0.15,
    'arena:pure_marble_paladin_earring_earring': 0.18,

    'arena:iron_paladin_earring_earringdown': 0.03,
    'arena:golden_paladin_earring_earringdown': 0.06,
    'arena:prismarine_paladin_earring_earringdown': 0.09,
    'arena:netherite_paladin_earring_earringdown': 0.12,
    'arena:fallen_paladin_earring_earringdown': 0.15,
    'arena:pure_marble_paladin_earring_earringdown': 0.18,
};
const SLAYER_bonus = {
    'arena:malingnant_orb_charm': 0.03,

    'arena:iron_slayer_earring_earring': 0.03,
    'arena:golden_slayer_earring_earring': 0.06,
    'arena:prismarine_slayer_earring_earring': 0.09,
    'arena:netherite_slayer_earring_earring': 0.12,
    'arena:fallen_slayer_earring_earring': 0.15,
    'arena:pure_marble_slayer_earring_earring': 0.18,

    'arena:iron_slayer_earring_earringdown': 0.03,
    'arena:golden_slayer_earring_earringdown': 0.06,
    'arena:prismarine_slayer_earring_earringdown': 0.09,
    'arena:netherite_slayer_earring_earringdown': 0.12,
    'arena:fallen_slayer_earring_earringdown': 0.15,
    'arena:pure_marble_slayer_earring_earringdown': 0.18,
};
const CursedBreaaker_bonus = {
    'arena:iron_cursebreaker_earring_earring': 0.05,
    'arena:golden_cursebreaker_earring_earring': 0.1,
    'arena:prismarine_cursebreaker_earring_earring': 0.15,
    'arena:netherite_cursebreaker_earring_earring': 0.2,
    'arena:fallen_cursebreaker_earring_earring': 0.25,
    'arena:pure_marble_cursebreaker_earring_earring': 0.3,
    'arena:iron_cursebreaker_earring_earringdown': 0.05,
    'arena:golden_cursebreaker_earring_earringdown': 0.1,
    'arena:prismarine_cursebreaker_earring_earringdown': 0.15,
    'arena:netherite_cursebreaker_earring_earringdown': 0.2,
    'arena:fallen_cursebreaker_earring_earringdown': 0.25,
    'arena:pure_marble_cursebreaker_earring_earringdown': 0.3,
};
const ARROW_DAMAGE_BONUS = {
    'arena:artemisa_deer_antler_talisman': 2,
    'arena:deer_crown_head': 5,
    'arena:robin_hat_head': 6,
    'arena:iron_arrows_earring_earring': 1,
    'arena:golden_arrows_earring_earring': 2,
    'arena:prismarine_arrows_earring_earring': 3,
    'arena:netherite_arrows_earring_earring': 4,
    'arena:fallen_arrows_earring_earring': 5,
    'arena:pure_marble_arrows_earring_earring': 6,
    'arena:iron_arrows_earring_earringdown': 1,
    'arena:golden_arrows_earring_earringdown': 2,
    'arena:prismarine_arrows_earring_earringdown': 3,
    'arena:netherite_arrows_earring_earringdown': 4,
    'arena:fallen_arrows_earring_earringdown': 5,
    'arena:pure_marble_arrows_earring_earringdown': 6,
    'arena:laniraxia_doll_doll': 2,
    'arena:apollo_bracer_gauntlet': 1,
    'arena:apollo_bracer_gauntletleft': 1,

    'g:arrow_amulet_amulet': 4,
};
const LIFE_STEAL_TAGS = {
    'twm:blood_pact_archaiccharm': 0.12,
    'twm:bloodbound_amulet_amulet': 0.06,
    'twm:blood_pendant_necklace': 0.02,
    'twm:bloodgem_talisman': 0.04,
    'twm:bloodtide_chalice_charm': 0.1,
    'eu:vampiric_rune_amulet': 0.05,

    'arena:infernal_charge': 0.1,
    'arena:contracted_heart_charm': 0.15,
    'arena:iron_vampiric_earring_earring': 0.02,
    'arena:golden_vampiric_earring_earring': 0.04,
    'arena:prismarine_vampiric_earring_earring': 0.06,
    'arena:netherite_vampiric_earring_earring': 0.08,
    'arena:fallen_vampiric_earring_earring': 0.1,
    'arena:pure_marble_vampiric_earring_earring': 0.12,
    'arena:iron_vampiric_earring_earringdown': 0.02,
    'arena:golden_vampiric_earring_earringdown': 0.04,
    'arena:prismarine_vampiric_earring_earringdown': 0.06,
    'arena:netherite_vampiric_earring_earringdown': 0.08,
    'arena:fallen_vampiric_earring_earringdown': 0.1,
    'arena:pure_marble_vampiric_earring_earringdown': 0.12,
    'arena:blood_scythe_charm': 0.05,
    'arena:extreme_had_head': 0.05,
};
const ornateCriticBonus = {
    'arena:ornate_curio_talisman': 2,
    'arena:ornate_band_ring': 2,
    'arena:ornate_ring_ring': 2,
    'arena:ornate_belt_body': 2,
    'arena:ornate_helmet_head': 2,
    'arena:ornate_earring_earring': 2,
    'arena:ornate_earring_earringdown': 2,
    'arena:ornate_guantlet_gauntlet': 2,
    'arena:ornate_guantlet_gauntletleft': 2,
};
const meleeEffects = {
  fireSet: [
    { tag: 'arena:blaze_skull_mask_face', fire: 10 },
    { tag: 'arena:iron_fire_necklace_jelewer_necklace', fire: 3 },
    { tag: 'arena:golden_fire_necklace_jelewer_necklace', fire: 4 },
    { tag: 'arena:prismarine_fire_necklace_jelewer_necklace', fire: 5 },
    { tag: 'arena:netherite_fire_necklace_jelewer_necklace', fire: 6 },
    { tag: 'arena:fallen_fire_necklace_necklace', fire: 7 },
    { tag: 'arena:pure_marble_fire_necklace_necklace', fire: 8 },

    { tag: 'arena:fire_wither_ring_witherring', fire: 4 },
    { tag: 'arena:fire_wither_ring_witherringdown', fire: 4 },

    { tag: 'twm:fire_gauntlet_gauntlet', fire: 3 },
    { tag: 'twm:fire_claw_gauntlet', fire: 3 },
    { tag: 'twm:fire_gauntlet_gauntletleft', fire: 3 },
    { tag: 'twm:fire_claw_gauntletleft', fire: 3 },
    { tag: 'twm:strong_inferno_ring_witherring', fire: 3 },
    { tag: 'twm:strong_inferno_ring_witherringdown', fire: 3 },
    { tag: 'twm:blazing_amulet_amulet', fire: 3 },
    { tag: 'mnra_cata:solar_ring_ring', fire: 5 },
    { tag: 'eu:rune_of_pyro_amulet', fire: 3 },
    { tag: 'eu:fire_ring_ring', fire: 3 },
  ],
  chanceDamages: [
    { tag: 'arena:archaic_light_cepter_archaiccharm', chance: 5, },
    { tag: 'arena:archaic_dimensions_table_archaiccharm', chance: 10, },

    { tag: 'arena:end_wither_ring_witherring', chance: 4, },
    { tag: 'arena:light_wither_ring_witherring', chance: 8, },
    { tag: 'arena:snow_wither_ring_witherring', chance: 4, },
    { tag: 'arena:desert_wither_ring_witherring', chance: 4, },
    { tag: 'arena:end_wither_ring_witherringdown', chance: 4, },
    { tag: 'arena:light_wither_ring_witherringdown', chance: 8, },
    { tag: 'arena:snow_wither_ring_witherringdown', chance: 4, },
    { tag: 'arena:desert_wither_ring_witherringdown', chance: 4, },

    { tag: 'arena:iron_diamond_earring_earringdown', chance: 1, },
    { tag: 'arena:golden_diamond_earring_earringdown', chance: 2, },
    { tag: 'arena:prismarine_diamond_earring_earringdown', chance: 3, },
    { tag: 'arena:netherite_diamond_earring_earringdown', chance: 4, },
    { tag: 'arena:fallen_diamond_earring_earringdown', chance: 5, },
    { tag: 'arena:pure_marble_diamond_earring_earringdown', chance: 6, },

    { tag: 'arena:iron_diamond_earring_earring', chance: 1, },
    { tag: 'arena:golden_diamond_earring_earring', chance: 2, },
    { tag: 'arena:prismarine_diamond_earring_earring', chance: 3, },
    { tag: 'arena:netherite_diamond_earring_earring', chance: 4, },
    { tag: 'arena:fallen_diamond_earring_earring', chance: 5, },
    { tag: 'arena:pure_marble_diamond_earring_earring', chance: 6, },

    { tag: 'arena:iron_fire_necklace_jelewer_necklace', chance: 1, },
    { tag: 'arena:iron_end_necklace_jelewer_necklace', chance: 2, },
    { tag: 'arena:iron_light_necklace_jelewer_necklace', chance: 3, },
    { tag: 'arena:iron_snow_necklace_jelewer_necklace', chance: 2, },
    { tag: 'arena:iron_desert_necklace_jelewer_necklace', chance: 2, },

    { tag: 'arena:golden_fire_necklace_jelewer_necklace', chance: 2, },
    { tag: 'arena:golden_end_necklace_jelewer_necklace', chance: 4, },
    { tag: 'arena:golden_light_necklace_jelewer_necklace', chance: 6, },
    { tag: 'arena:golden_snow_necklace_jelewer_necklace', chance: 4, },
    { tag: 'arena:golden_desert_necklace_jelewer_necklace', chance: 4, },

    { tag: 'arena:prismarine_fire_necklace_jelewer_necklace', chance: 3, },
    { tag: 'arena:prismarine_end_necklace_jelewer_necklace', chance: 6, },
    { tag: 'arena:prismarine_light_necklace_jelewer_necklace', chance: 9, },
    { tag: 'arena:prismarine_snow_necklace_jelewer_necklace', chance: 6, },
    { tag: 'arena:prismarine_desert_necklace_jelewer_necklace', chance: 6, },

    { tag: 'arena:netherite_fire_necklace_jelewer_necklace', chance: 4, },
    { tag: 'arena:netherite_end_necklace_jelewer_necklace', chance: 8, },
    { tag: 'arena:netherite_light_necklace_jelewer_necklace', chance: 12, },
    { tag: 'arena:netherite_snow_necklace_jelewer_necklace', chance: 8, },
    { tag: 'arena:netherite_desert_necklace_jelewer_necklace', chance: 8, },

    { tag: 'arena:fallen_fire_necklace_necklace', chance: 5, },
    { tag: 'arena:fallen_end_necklace_necklace', chance: 10, },
    { tag: 'arena:fallen_light_necklace_necklace', chance: 15, },
    { tag: 'arena:fallen_snow_necklace_necklace', chance: 10, },
    { tag: 'arena:fallen_desert_necklace_necklace', chance: 10, },

    { tag: 'arena:pure_marble_fire_necklace_necklace', chance: 6, },
    { tag: 'arena:pure_marble_end_necklace_necklace', chance: 12, },
    { tag: 'arena:pure_marble_light_necklace_necklace', chance: 18, },
    { tag: 'arena:pure_marble_snow_necklace_necklace', chance: 12, },
    { tag: 'arena:pure_marble_desert_necklace_necklace', chance: 12, }
  ],
  lightning: [
    { tag: 'arena:iron_light_necklace_jelewer_necklace', chance: 3 },
    { tag: 'arena:golden_light_necklace_jelewer_necklace', chance: 6 },
    { tag: 'arena:prismarine_light_necklace_jelewer_necklace', chance: 9 },
    { tag: 'arena:netherite_light_necklace_jelewer_necklace', chance: 12 },
    { tag: 'arena:fallen_light_necklace_necklace', chance: 15 },
    { tag: 'arena:pure_marble_light_necklace_necklace', chance: 18 },
    { tag: 'arena:archaic_light_cepter_archaiccharm', chance: 35 },
    { tag: 'arena:conscious_star_archaiccharm', chance: 30 },

    { tag: 'arena:light_wither_ring_witherring', chance: 6 },
    { tag: 'arena:light_wither_ring_witherringdown', chance: 6 }
  ],
  explosion: [
    { tag: 'arena:iron_explosive_earring_earring', chance: 3 },
    { tag: 'arena:golden_explosive_earring_earring', chance: 6 },
    { tag: 'arena:prismarine_explosive_earring_earring', chance: 9 },
    { tag: 'arena:netherite_explosive_earring_earring', chance: 12 },
    { tag: 'arena:fallen_explosive_earring_earring', chance: 15 },
    { tag: 'arena:pure_marble_explosive_earring_earring', chance: 18 },
    { tag: 'arena:iron_explosive_earring_earringdown', chance: 3 },
    { tag: 'arena:golden_explosive_earring_earringdown', chance: 6 },
    { tag: 'arena:prismarine_explosive_earring_earringdown', chance: 9 },
    { tag: 'arena:netherite_explosive_earring_earringdown', chance: 12 },
    { tag: 'arena:fallen_explosive_earring_earringdown', chance: 15 },
    { tag: 'arena:pure_marble_explosive_earring_earringdown', chance: 18 },

    { tag: 'arena:archaic_dimensions_horn_archaiccharm', chance: 9 }
  ],
  penetration: [
    { tag: 'arena:iron_penetration_earring_earring', multiplier: 1 },
    { tag: 'arena:golden_penetration_earring_earring', multiplier: 2 },
    { tag: 'arena:prismarine_penetration_earring_earring', multiplier: 3 },
    { tag: 'arena:netherite_penetration_earring_earring', multiplier: 4 },
    { tag: 'arena:fallen_penetration_earring_earring', multiplier: 5 },
    { tag: 'arena:pure_marble_penetration_earring_earring', multiplier: 6 },
    { tag: 'arena:iron_penetration_earring_earringdown', multiplier: 1 },
    { tag: 'arena:golden_penetration_earring_earringdown', multiplier: 2 },
    { tag: 'arena:prismarine_penetration_earring_earringdown', multiplier: 3 },
    { tag: 'arena:netherite_penetration_earring_earringdown', multiplier: 4 },
    { tag: 'arena:fallen_penetration_earring_earringdown', multiplier: 5 },
    { tag: 'arena:pure_marble_penetration_earring_earringdown', multiplier: 6 },

    { tag: 'arena:archaic_dimensions_horn_archaiccharm', multiplier: 2 }
  ],
  freeze: [
    { tag: 'arena:amethyst_earring_jelewer_earring' },
    { tag: 'arena:amethyst_earring_jelewer_earringdown' },
    { tag: 'arena:iron_snow_necklace_jelewer_necklace' },
    { tag: 'arena:golden_snow_necklace_jelewer_necklace' },
    { tag: 'arena:prismarine_snow_necklace_jelewer_necklace' },
    { tag: 'arena:netherite_snow_necklace_jelewer_necklace' },
    { tag: 'arena:fallen_snow_necklace_necklace' },
    { tag: 'arena:pure_marble_snow_necklace_necklace' },
    { tag: 'eu:rune_of_cold_amulet' },
    { tag: 'eu:ice_ring_ring' },

    { tag: 'arena:snow_wither_ring_witherring' },
    { tag: 'arena:snow_wither_ring_witherringdown' }
  ],
  arid: [
    { tag: 'arena:iron_desert_necklace_jelewer_necklace' },
    { tag: 'arena:golden_desert_necklace_jelewer_necklace' },
    { tag: 'arena:prismarine_desert_necklace_jelewer_necklace' },
    { tag: 'arena:netherite_desert_necklace_jelewer_necklace' },
    { tag: 'arena:fallen_desert_necklace_necklace' },
    { tag: 'arena:pure_marble_desert_necklace_necklace' },
    { tag: 'eu:rune_of_curses_amulet' },

    { tag: 'arena:crimsom_amethyst_earring_jelewer_earring' },
    { tag: 'arena:crimsom_amethyst_earring_jelewer_earringdown' },
    { tag: 'arena:desert_wither_ring_witherring' },
    { tag: 'arena:desert_wither_ring_witherringdown' }
  ],
  freeze_melee: [
    { tag: 'twm:ice_gauntlet_gauntlet' },
    { tag: 'twm:ice_claw_gauntlet' },
    { tag: 'twm:ice_gauntlet_gauntletleft' },
    { tag: 'twm:ice_claw_gauntletleft' }
  ],
  critic_multiplier: [
    { tag: 'arena:archaic_light_cepter_archaiccharm', multiplier: 1 },
    { tag: 'arena:conscious_star_archaiccharm', multiplier: 0.5 },

    { tag: 'arena:iron_hemlock_earring_earring', multiplier: 0.03 },
    { tag: 'arena:golden_hemlock_earring_earring', multiplier: 0.06 },
    { tag: 'arena:prismarine_hemlock_earring_earring', multiplier: 0.09 },
    { tag: 'arena:netherite_hemlock_earring_earring', multiplier: 0.12 },
    { tag: 'arena:fallen_hemlock_earring_earring', multiplier: 0.15 },
    { tag: 'arena:pure_marble_hemlock_earring_earring', multiplier: 0.18 },
    { tag: 'arena:iron_hemlock_earring_earringdown', multiplier: 0.03 },
    { tag: 'arena:golden_hemlock_earring_earringdown', multiplier: 0.06 },
    { tag: 'arena:prismarine_hemlock_earring_earringdown', multiplier: 0.09 },
    { tag: 'arena:netherite_hemlock_earring_earringdown', multiplier: 0.12 },
    { tag: 'arena:fallen_hemlock_earring_earringdown', multiplier: 0.15 },
    { tag: 'arena:pure_marble_hemlock_earring_earringdown', multiplier: 0.18 },

    { tag: 'arena:damage_copper_wither_ring_witherring', multiplier: 0.04 },
    { tag: 'arena:damage_copper_wither_ring_witherringdown', multiplier: 0.04 },
    { tag: 'arena:damage_iron_wither_ring_witherring', multiplier: 0.08 },
    { tag: 'arena:damage_iron_wither_ring_witherringdown', multiplier: 0.08 },
    { tag: 'arena:damage_golden_wither_ring_witherring', multiplier: 0.12 },
    { tag: 'arena:damage_golden_wither_ring_witherringdown', multiplier: 0.12 },
    { tag: 'arena:damage_prismarine_wither_ring_witherring', multiplier: 0.18 },
    { tag: 'arena:damage_prismarine_wither_ring_witherringdown', multiplier: 0.18 },
    { tag: 'arena:damage_marble_wither_ring_witherring', multiplier: 0.2 },
    { tag: 'arena:damage_marble_wither_ring_witherringdown', multiplier: 0.2 },

    { tag: 'arena:fire_wither_ring_witherring', multiplier: 0.14 },
    { tag: 'arena:fire_wither_ring_witherringdown', multiplier: 0.14 }
  ]
};
function applyMeleeEffects(tags, hurtEntity, damage, attacker, damageSource) {
  const { x, y, z } = hurtEntity.location;
  const dim = hurtEntity.dimension;
  let critBonus = 0;
  let criticChance = 0;
  let lightningChance = 0;
  let piercingMultiplier = 0;
  const equipment = getEquipmentIds(attacker);
  const armorPieces = [ equipment.head, equipment.chest, equipment.legs, equipment.feet ];
  for (const piece of armorPieces) {
    if (!piece) continue;
    if (piece.startsWith("arena:fallen_marble_")) {
      criticChance += 2;
    }
    if (piece.startsWith("arena:impious_marble_ ")) {
      criticChance += 2.5;
    }
    if (piece.startsWith("arena:nebulous_apollo_") && damageSource.cause == 'projectile') {
      criticChance += 1;
      critBonus += 0.05
    }
  }
  if (tags.has('arena:ornate_pendant_necklace')) {
    criticChance += 2;
    for (const [tag, multiplier] of Object.entries(ornateCriticBonus)) {
        if (tags.has(tag)) { criticChance += multiplier; }
    }
  }
  const sabers = [ 'arena:wooden_saber', 'arena:stone_saber', 'arena:copper_saber', 'arena:golden_saber', 'arena:iron_saber', 'arena:diamond_saber', 'arena:|1+' ];
  if (sabers.includes(equipment.mainhand)) { criticChance += 10 }

  if (criticChance > 0 &&  randomChance(criticChance)) {
    for (const { tag, multiplier } of meleeEffects.critic_multiplier) {
      if (tags.has(tag)) critBonus += multiplier;
    }
    critBonus += 0.5
  }
  for (const { tag } of meleeEffects.freeze) {
    if (tags.has(tag)) { dim.spawnParticle("arena:freeze_hit", { x, y, z }) }
  }
  for (const { tag } of meleeEffects.arid) {
    if (tags.has(tag)) { dim.spawnParticle("arena:arid_hit", { x, y, z }) }
  }
  for (const { tag, chance } of meleeEffects.lightning) {
    if (tags.has(tag)) lightningChance += chance;
  }
  if (lightningChance > 0 && randomChance(lightningChance)) {dim.spawnEntity("minecraft:lightning_bolt", { x, y: y + 1, z })}

  if (damageSource.cause === 'projectile') return critBonus;
  for (const { tag, fire } of meleeEffects.fireSet) {
    if (tags.has(tag)) {
      hurtEntity.setOnFire(fire);
      dim.spawnParticle("arena:fire_hit_particle", { x, y: y + 1, z });
    }
  }
  for (const { tag, chance } of meleeEffects.explosion) {
    if (tags.has(tag) && randomChance(chance)) {
      dim.spawnEntity("arena:ignited_explosion", { x, y: y + 1, z });
      dim.spawnParticle("minecraft:knockback_roar_particle", { x, y: y + 1, z });
    }
  }
  for (const { tag, multiplier } of meleeEffects.penetration) {
    if (tags.has(tag)) piercingMultiplier += multiplier;
  }
  if (tags.has('arena:archaic_dimensions_horn_archaiccharm') && attacker.dimension.id == "minecraft:the_end") { piercingMultiplier += 1 }
  if (piercingMultiplier > 0) {
    hurtEntity.applyDamage(piercingMultiplier, { cause: 'void', damagingEntity: attacker });
    dim.spawnParticle("arena:apollo_hit_emitter", { x, y, z });
  }
  for (const { tag } of meleeEffects.freeze_melee) {
    if (tags.has(tag)) { dim.spawnParticle("arena:freeze_hit", { x, y, z }) }
  }

  return critBonus;
}