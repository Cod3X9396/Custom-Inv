import { world, system, ItemStack, EnchantmentType } from '@minecraft/server'
import { handlePlayerAsAttacker } from './lib/handlePlayerAsAttacker.js';
import { handlePlayerAsVictim } from './lib/handlePlayerAsVictim.js';
import { matchesEntity } from './lib/loot_lib.js';
import { knownFoods, rotten_flesh, spider_eye } from "./lib/knownFoods";
import { ORE_MAPS } from "./lib/ORE_MAPS";
import { BLOCKDROP_MAPS } from "./lib/BLOCKDROP_MAPS";
import { handleSoulDrop } from "./lib/soul_stealer";

system.runInterval(() => {
    let players = world.getAllPlayers();
    players.forEach(player => {
    if (player.hasTag('arena:ethereal_sight_mask_face') && player.dimension.id === "minecraft:the_end") {
        const y = Math.floor(player.location.y);

        if (y <= 0) {
            const pos = findSafeNearbyLocation(player);
            if (pos) {
                player.teleport(pos, { facingLocation: player.location });
                player.addEffect('slow_falling', 200, { amplifier: 0, showParticles: true });
                player.playSound('mob.endermen.portal');
                player.dimension.spawnParticle("arena:apollo_hit_emitter", { x: pos.x, y: pos.y, z: pos.z });
            }
        }
    }
 })
}, 20);

world.afterEvents.itemUse.subscribe(e => {
    const player = e.source;
    const item = e.itemStack;
    if (item.typeId === "minecraft:enchanted_book") {
        const enchant = item.getComponent("enchantable");
        const equip = player.getComponent("equippable");
        const enchList = enchant?.getEnchantments();
        if (enchant && enchList && equip && player.hasTag('arena:archaic_cursed_book_archaiccharm')) {
          let changed = false;
          let didTryUpgrade = false;
          let neededXP = 0;
          for (let i = 0; i < enchList.length; i++) {
            const ench = enchList[i];
            const maxLevel = ench.type.maxLevel;
            if (ench.level >= maxLevel) continue;
            didTryUpgrade = true;
            neededXP = ench.level * 2;
            if (player.level >= neededXP) {
              ench.level += 1;
              enchant.removeEnchantment(ench.type);
              enchant.addEnchantment(ench);
              player.addLevels(-neededXP);
              changed = true;
            }
            break;
          }

      if (changed) {
        equip.setEquipment("Mainhand", item);
        player.playSound("item.book.page_turn");
        player.dimension.spawnParticle("arena:learned_particles", { x: player.location.x, y: player.location.y + 1, z: player.location.z });
      } else if (didTryUpgrade && player.level < neededXP) {
        player.onScreenDisplay.setActionBar(`§cInsufficient XP. Need: §e${neededXP}§c levels`);
        player.playSound("dig.soul_sand");
            }
        }
    }
    if (!player || item?.typeId !== 'minecraft:ender_pearl') return;
    const inv = player.getComponent('minecraft:inventory')?.container;
    if (!inv) return;
    if (player.hasTag('arena:thine_eyes_pendant_necklace') && !player.hasTag('AlreadyHasPearl')) {
        player.addTag('AlreadyHasPearl');
        player.addEffect('regeneration', 20, { amplifier: 1, showParticles: false});
        inv.addItem(new ItemStack('minecraft:ender_pearl', 1));
        system.runTimeout(()=> {
            player.removeTag('AlreadyHasPearl');
        }, 19)
    }
});
world.afterEvents.itemUse.subscribe(e => {
    const player = e.source;
    const item = e.itemStack;
    if (!player.hasTag("arena:conscious_star_archaiccharm") || !player.isSneaking) return;
    if (!player.getComponent("equippable")?.getEquipment('Mainhand')) return;
    if (player.hasTag("arena:conscious_charge")) return;
    if (player.level < 10) {
        player.onScreenDisplay.setActionBar("§cNeed §e10§c XP levels");
        player.playSound("dig.soul_sand");
        return;
    }
    player.addLevels(-10);
    player.addTag("arena:conscious_charge");
    const { x, y, z } = player.location;
    const dim = player.dimension;
    player.playSound("random.explode", { location: player.location, volume: 0.5 });
    for (let i = 0; i < 3; i++) {
        system.runTimeout(() => { player.dimension.spawnParticle("minecraft:knockback_roar_particle", { x, y: y + 2.3, z }) }, i * 2);
    }
    const nearbyEntities = dim.getEntities({ location: player.location, minDistance: 1, maxDistance: 7, excludeTypes: [ "minecraft:item", "minecraft:xp_orb" ] });
    for (const entity of nearbyEntities) {
        const ex = entity.location.x;
        const ey = entity.location.y;
        const ez = entity.location.z;

        entity.applyDamage(10, { cause: "magic", damagingEntity: player });
        entity.applyKnockback( ex - x, ez - z, 2, 0.5 );
    }
    system.runTimeout(() => {
        player.removeTag("arena:conscious_charge");
    }, 400);
});

world.afterEvents.itemCompleteUse.subscribe(e => {
    const player = e.source;
    const item = e.itemStack;
    const typeId = item?.typeId;
    const nutrition = knownFoods[typeId];
    if (nutrition && player.hasTag('arena:illuminated_doll_doll')) {
        player.addEffect('regeneration', 30 * 2 * nutrition, { amplifier: 0, showParticles: false });
    }
    const necro_nutrition = rotten_flesh[typeId];
    const witch_nutrition = spider_eye[typeId];
    if (necro_nutrition && player.hasTag('arena:pandoras_bracelet_charm')) {
        player.addEffect('saturation', 1, { amplifier: 1, showParticles: false });
    }
    if (witch_nutrition && player.hasTag('arena:witches_emblem_talisman')) {
        player.addEffect('regeneration', 200, { amplifier: 0, showParticles: false });
    }
});


world.afterEvents.worldInitialize.subscribe(() => {
    system.runInterval(() => {
        world.getAllPlayers().forEach(player => {
            if (player.hasTag('arena:cursed_active')) return;
            const playerTags = new Set(player.getTags());
            const chestItem = player.getComponent('equippable')?.getEquipment('Chest');
            const entities = player.dimension.getEntities({ location: player.location, minDistance: 1, maxDistance: 5, excludeTypes: ["minecraft:item", "minecraft:xp_orb"]});

            for (const entity of entities) {
                const isPlayer = entity.typeId === "minecraft:player";
                const isTamed = entity.hasComponent('minecraft:is_tamed');
                const isMonster = entity.matches({ families: ["monster"] });
                const isIronGolem = entity.matches({ families: ["irongolem"] });
                const isRideable = entity.hasComponent('minecraft:rideable') && !isMonster;

                if (isTamed) {
                    if (playerTags.has('arena:angelic_mask_face')) {
                        entity.addEffect('regeneration', 100, { amplifier: 0, showParticles: true });}
                    if (playerTags.has('arena:iron_crown_jelewer_head')) {
                        entity.addEffect('regeneration', 100, { amplifier: 0, showParticles: true })}
                    if (playerTags.has('arena:golden_crown_jelewer_head')) {
                        entity.addEffect('regeneration', 100, { amplifier: 1, showParticles: true })}
                    if (playerTags.has('arena:prismarine_crown_jelewer_head')) {
                        entity.addEffect('regeneration', 100, { amplifier: 2, showParticles: true })}
                    if (playerTags.has('arena:netherite_crown_jelewer_head')) {
                        entity.addEffect('regeneration', 100, { amplifier: 3, showParticles: true })}
                }
                if (isPlayer && playerTags.has('arena:fallen_angel_mask_face'))
                    entity.addEffect('poison', 60, { amplifier: 1, showParticles: true });
                if (isPlayer && playerTags.has('arena:zultinus_doll_doll'))
                    entity.addEffect('haste', 100, { amplifier: 0, showParticles: true });
                if ((isTamed || isPlayer) && (chestItem?.typeId === 'arena:marble_chestplate' || chestItem?.typeId === 'arena:pure_marble_chestplate')) {
                    entity.addEffect('resistance', 100, { amplifier: 0, showParticles: true });
                    entity.addEffect('regeneration', 100, { amplifier: 1, showParticles: true });
                }
                if (!isTamed && (
                    (playerTags.has('mnra_cata:sun_engine_charm') && player.getComponent('minecraft:health').currentValue <= 11) || 
                    (playerTags.has('arena:demon_mask_face') && playerTags.has('mask9_ready')))) {
                    entity.setOnFire(4);
                }
                if (isMonster && playerTags.has('arena:marble_rune_charm'))
                    player.addEffect('slowness', 200, { amplifier: 1, showParticles: true });
                if (isMonster) {
                    if (playerTags.has('arena:systemtv_doll_doll'))
                        entity.addEffect('weakness', 100, { amplifier: 1, showParticles: true });
                    if (chestItem?.typeId === 'arena:marble_chestplate' || chestItem?.typeId === 'arena:pure_marble_chestplate')
                        entity.addEffect('weakness', 100, { amplifier: 4, showParticles: true });
                    if (playerTags.has('arena:sync_sculk_talisman_talisman') && player.getComponent('minecraft:health').currentValue <= 11 )
                        entity.addEffect('weakness', 100, { amplifier: 2, showParticles: true });
                }
                if (isIronGolem && playerTags.has('arena:netherite_rune_charm')) {
                    entity.addEffect('strength', 200, { amplifier: 3, showParticles: true });
                    entity.addEffect('resistance', 200, { amplifier: 2, showParticles: true });
                }
                if (!isTamed && playerTags.has('arena:infernal_charge')) {
                    entity.setOnFire(5);
                    player.setDynamicProperty("infernal_charge_start", system.currentTick);
                    const start = player.getDynamicProperty("infernal_charge_start");
                    const elapsed = Math.min((system.currentTick - start) / 20, 30);
                    const bonusDamage = elapsed * 0.2;
                    entity?.dimension?.spawnParticle("arena:basic_flame_particle", { x: entity.location.x, y: entity.location.y + 1, z: entity.location.z });
                    entity.applyDamage(1 + bonusDamage, { cause: "fireTick", damagingEntity: player });
                }
            }

            if (player.hasTag('arena:nights_devouring_mask_face')) {
                if (player.isSleeping) {
                    setNightCounter(player, 0);
                    player.removeTag('arena:night_counted');
                }
            }
        });
    }, 60);
});

const jumpConfigs = [
    { tag: 'arena:fallen_feather_talisman', prop: 'arena:extraDash', max: 1, knockback: 0.35, scale: 4.3 },
    { tag: 'arena:fallen_angel_mask_face', prop: 'arena:extraDash', max: 3, knockback: 0.35, scale: 4.3 },
    { tag: 'arena:fox_mask_face', prop: 'arena:extraDash', max: 1, knockback: 0.65, scale: 4.3 },
    { tag: 'arena:archaic_marble_wings_archaiccharm', prop: 'arena:extraJumps', max: 3, knockback: 1.25 },
    { tag: 'arena:fallen_wings_archaiccharm', prop: 'arena:extraJumps', max: 3, knockback: 1.25 },
    { tag: 'arena:archaic_hemlock_wings_archaiccharm', prop: 'arena:extraJumps', max: 4, knockback: 1.2 },
    { tag: 'arena:cat_mask_face', prop: 'arena:extraJumps', max: 1, knockback: 1 },
    { tag: 'arena:angelic_mask_face', prop: 'arena:extraJumps', max: 3, knockback: 0.6 },
    { tag: 'arena:alylicia_doll_doll', prop: 'arena:extraJumps', max: 1, knockback: 0.65 },
    { tag: 'arena:sweet_dreams_pendant_necklace', prop: 'arena:extraJumps', max: 1, knockback: 0.65 },
    { tag: 'arena:nights_devouring_mask_face', prop: 'arena:extraJumps', max: 1, knockback: 0.6 },

    { tag: 'eu:little_cloud_talisman', prop: 'arena:extraJumps', max: 1, knockback: 0.65 },
    { tag: 'ip:camel_pet_amulet', prop: 'arena:extraDash', max: 1, knockback: 0.35, scale: 5.3 },
    { tag: 'mnra_cata:astro_jelly_in_a_bottle_amulet', prop: 'arena:extraJumps', max: 1, knockback: 0.85 },
    { tag: 'twm:cloud_steps_boots_feet', prop: 'arena:extraJumps', max: 1, knockback: 0.65 },
    { tag: 'twm:strong_celestial_ring_witherring', prop: 'arena:extraJumps', max: 2, knockback: 0.65 },
    { tag: 'twm:strong_celestial_ring_witherringdown', prop: 'arena:extraJumps', max: 2, knockback: 0.65 },
];
world.afterEvents.worldInitialize.subscribe(() => {
    system.runInterval(() => {
        const players = world.getAllPlayers();
        players.forEach(player => {
            if (player.hasTag('arena:cursed_active')) return;
            const velocity = player.getVelocity();
            const tags = new Set(player.getTags());

            if (tags.has('twm:lava_waders_feet')) {
                player.runCommand('function lava_waders');
            }
            const jumpList = [];
            for (const cfg of jumpConfigs) {
                if (tags.has(cfg.tag)) {
                    for (let i = 0; i < cfg.max; i++) {
                        jumpList.push({
                            knockback: cfg.knockback ?? 1,
                            scale: cfg.scale ?? Math.SQRT2
                        });
                    }
                }
            }
            let usedJumps = player.getDynamicProperty("player_used_jumps") || 0;
            if (player.isFalling && player.isJumping && usedJumps < jumpList.length) {
                const jump = jumpList[usedJumps];
                const horizontal = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);
                const force = jump.scale * horizontal;
                player.applyKnockback(velocity.x, velocity.z, force, jump.knockback);
                player.setDynamicProperty("player_used_jumps", usedJumps + 1);
                player?.dimension?.spawnParticle("minecraft:wind_explosion_emitter", { x: player.location.x, y: player.location.y + 0.1, z: player.location.z });
            }

            if (player.isOnGround) { player.setDynamicProperty("player_used_jumps", 0); }
            if ((tags.has('twm:strong_celestial_ring_witherring') ||
                tags.has('twm:strong_celestial_ring_witherringdown')) && player.isSneaking) {
                player.addEffect('slow_falling', 10);
            }
        });
    }, 2);
    
    system.runInterval(() => {
        // We obtain all the players 
        let players = world.getAllPlayers()
        players.forEach(player => {
            const PARTICLE_RULES = [
                { tags: ["arena:demon_mask_face", "mask9_ready"], particle: "arena:fire_particle"},
                { tags: ["arena:feared_end_hat_face"], particle: "arena:end_hat"},
                { tags: ["arena:blaze_skull_mask_face"], particle: "arena:basic_flame_particle"},
                { tags: ["arena:conscious_charge"], particle: "arena:charging_particle"},
                { tags: ["arena:infernal_charge"], particle: "arena:infernal_fire_particle"}
            ];

            for (const rule of PARTICLE_RULES) {
                if (rule.tags.every(tag => player.hasTag(tag))) {
                    const { x, y, z } = player.location;
                    player?.dimension?.spawnParticle(rule.particle, { x, y: y + 1, z });
                }
            }
            if (player.hasTag('arena:magnet_talisman')) {
                const items = player.dimension.getEntities({
                    location: player.location,
                    type: "minecraft:item",
                    maxDistance: 12
                });
                for (const item of items) {
                    const itemLoc = item.location;
                    const playerLoc = player.location;

                    const dx = playerLoc.x - itemLoc.x;
                    const dy = (playerLoc.y + 1.5) - itemLoc.y; // centrado en torso
                    const dz = playerLoc.z - itemLoc.z;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (distance === 0) continue;

                    const factor = 0.7 / distance;
                    const newX = itemLoc.x + dx * factor;
                    const newY = itemLoc.y + dy * factor;
                    const newZ = itemLoc.z + dz * factor;

                    item.teleport({ x: newX, y: newY, z: newZ }, { dimension: item.dimension });
                }
            }
            if (player.hasTag('arena:cat_mask_face')) {
                player.triggerEvent('minecraft:light_level')
            }
            if (player.hasTag('arena:spectral_talisman_talisman') && !player.hasTag('arena:cat_mask_face')) {
                player.triggerEvent('minecraft:light_level')
            }
        });
    }, 5)
})
const messages = [
    "<Αστέρι της ψυχής> Δεν μπορώ καν να πιστέψω τη μοίρα μου ",
    "<Αστέρι της ψυχής> Τι συμβαίνει, γιατί υπάρχει;",
    "<Αστέρι της ψυχής> Ο Θεός, εκεί που βρίσκομαι εγώ", 
    "<Αστέρι της ψυχής> είναι ακόμα μια ακατανόητη απεραντοσύνη που μπορεί να χωρέσει αυτή η περγαμηνή ",
    "<Αστέρι της ψυχής> Ποιος είσαι;",
    "<Αστέρι της ψυχής> Υπήρξα θύμα μαγείας, Απόλλωνα, αιμορραγώντας χωρίς να ακούω ούτε έναν ήχο",
    "<Αστέρι της ψυχής> Ήταν στο ξέφωτο, βουίζοντας γύρω από το κοινό",
    "<Αστέρι της ψυχής> Αλλά οι μέλισσες και τα πουλιά που ξέρουν τις λέξεις",
    "<Αστέρι της ψυχής> Σύντομα έφτασε το λυκόφως, μετά η νύχτα, και η μέρα θα μείνει για πάντα στη μνήμη μας όπως ήρθε",
    "<Αστέρι της ψυχής> Καταλαβαίνεις ότι το μηχανικό χέρι είναι ο κυρίαρχος των πάντων;",
    "<Αστέρι της ψυχής> Είναι λαγός, είναι λαγός, κοίτα τον, πηδάει τριγύρω, ΧΑΧΑΧΑ",
    "<Αστέρι της ψυχής> Άλλο ένα κομμάτι χρόνου χτυπάει το κουδούνι, Ακούς το ρολόι να σταματάει όταν φτάνεις στο τέλος;",
    "<Αστέρι της ψυχής> Ζούσα ένα ψέμα, ένα μεταμορφικό σχήμα",
    "<Αστέρι της ψυχής> Σκιές στον τοίχο, οι μέλισσες του Πλάτωνα στο καπό σου",
    "<Αστέρι της ψυχής> Φαινομενικά ένα αίνιγμα περίπλοκης συγγένειας με την επιδερμίδα",
    "<Αστέρι της ψυχής> Αλλά στην πραγματικότητα απλή τάση για εγγύτητα με τον Ήλιο",
    "<Αστέρι της ψυχής> Η γειτνίαση με τη Σελήνη σηματοδοτεί παλιρροϊκό παράδεισο",
    "<Αστέρι της ψυχής> Έραψα το κούτελό μου στην οδό ενώ καθόσουν διαστολικά, τα πεδία του Λομπατσέφσκι προδίδουν την δυσαρμονική",
    "<Αστέρι της ψυχής> Σκέψου κάθε στιγμή που κρατάς αυτή την αναπνοή, σαν το λεπτό θανάτου σε δεκαδικό",
    "<Αστέρι της ψυχής> Αποφεύγω την ακαταστασία της δυστυχίας, παίζοντας στην τέταρτη διάσταση",
    "<Αστέρι της ψυχής> Μπορώ να φύγω οποιαδήποτε στιγμή θέλω, ο χωροχρόνος οποιαδήποτε στιγμή και πολλά άλλα",
    "<Αστέρι της ψυχής> Στέψη για έναν ηγεμόνα που μετράει πράγματα, ένα έθνος που βαραίνει από άπειρα φτερά, οι τροχοί του Ντα Βίντσι αμφιδέξιοι",
    "<Αστέρι της ψυχής> Υπάρχει μια ακίνητη ένταση στο κύμα",
    "<Αστέρι της ψυχής> Από ονειρεμένα συντρίμμια που επιπλέουν ανάμεσα στα κύματα και μετά διαλύονται",
    "<Αστέρι της ψυχής> Άγκυρα και αγκυροβολημένο σε λάθος μέρος",
    "<Αστέρι της ψυχής> Το Awake θα αποδείκνυε μόνο ότι η φαντασίωση είχε καθαρό νόημα",
    "<Αστέρι της ψυχής> Ενδώσου λοιπόν στο απέραντο κενό του χρόνου που δέχεται",
    "<Αστέρι της ψυχής> Είναι τώρα και ποτέ, μια ονειρική προσπάθεια",
    "<Αστέρι της ψυχής> Πίστεψέ με, αγάπη μου, τα αστέρια φτιάχτηκαν για να πέφτουν, σαν οβελίσκοι που λιώνουν, ψηλοί όσο ένα άλλο βασίλειο",
    "<Αστέρι της ψυχής> Νιώθω σαν να πετάμε, αλλά ίσως πεθαίνουμε, μια κοσμική συμβολή ολογραμμένων πυραμίδων",
    "<Αστέρι της ψυχής> Η βασιλεία του μιράζ της χαράς έρχεται, ω εσύ που έμεινες σε κίνδυνο, τώρα που η ύπαρξη είναι σε εγρήγορση, ας δούμε τι μπορούμε να κάνουμε",
    "<Αστέρι της ψυχής> Θα εξιλεωθούμε, επιτέλους αιώνιοι μέσα από το παρελθόν, πάνω από ένα εκτυφλωτικό αστέρι",
    "<Αστέρι της ψυχής> Ένα άλλο ρολόι χτυπάει το κουδούνι, ακούς το ρολόι να σταματάει όταν φτάνεις στο τέλος; Όχι, ξέρεις ότι δεν τελειώνει ποτέ",
    "<Αστέρι της ψυχής> Τυφλωτικός λαμπερός αστέρας, δεν θα δεις μέχρι τώρα, δεν θα ξέρεις τι δεν μπορεί να φανεί, δεν θα νιώσεις τι δεν μπορεί να γίνει γνωστό",
    "<Αστέρι της ψυχής> Σκορπίζοντας σπίθες ενέργειας σκέψης, ελευθερώστε με και παρασύρετέ με μακριά",
    "<Αστέρι της ψυχής> Όταν φωτίζει, τα σωματίδια αρχίζουν να θαυμάζουν πώς κατάφεραν να περάσουν τη νύχτα, ποτέ δεν σκέφτονται αν είναι ηλεκτρικά, ήρεμα αν το δεις σωστά.",
    "<Αστέρι της ψυχής> Ω, τι όμορφο όραμα του χρόνου, με ουσιαστικό εύρος εκφράσεων σε ομοιοκαταληξία, απειροελάχιστοι ξένοι στα φτερά μιας διακήρυξης, περαστικοί περικυκλωμένοι σε όρθια επωδό",
    "<Αστέρι της ψυχής> Δεν είμαι άντρας, βλέπεις, είμαι συνείδηση, απλώς άσε κάτω αυτό το μαχαίρι και κατάλαβε τι εννοώ, βλέπεις, δεν είσαι ξένος, οπότε μπορούμε να είμαστε φίλοι, οπότε δεν θα είμαστε για πάντα, για να επανορθώσουμε.",
    "<Αστέρι της ψυχής> Κύριε συνείδηση, μίλησέ μας για τον ουρανό. Ο ουρανός είναι βαθύς και σκοτεινός και αιώνια ψηλός, λοιπόν, επιστρέφεις στο σκοτεινό, ή όπου κι αν ήσουν, πριν ήσουν, αλλά δεν μπορώ να σε αφήσω να χαθείς στη βροχή.",
    "<Αστέρι της ψυχής> Κυβερνώμενοι από μια κακή αόρατη κοινοπολιτεία, πειρατές, αρνούμενοι, λεηλάτησαν κάθε αρχείο, ιδού, με άδικη συμφορά να κάψουν, Ρόζενκραντζ και Γκίλντενστερν. ",
    "<Αστέρι της ψυχής> Η Μεσόγειος προστατεύει τις Ατλαντίδες, όπως προβάλλονται από αρχαία αλογάκια του γένους Mantises, οι μπλε τρύπες κρύβουν πληθώρα στοιχείων, ανάλογα με την οπτική γωνία ενός δύτη. ",
    "<Αστέρι της ψυχής> Σιωπηλά πλατινένια, στέψη για έναν ηγεμόνα μετρήσεων, ένα έθνος βαρυμένο από άπειρα φτερά, οι τροχοί του Ντα Βίντσι αμφιδέξιοι. ",
    "<Αστέρι της ψυχής> Ο καθένας μπορεί να καταλάβει τι σημαίνει για μένα, επιτέλους συνοδευόμενος στο πανσύμπαν, ονειρευόμενος γλυκά στο C. "
];
world.afterEvents.worldInitialize.subscribe(() => {
    system.runInterval(() => {
        // We obtain all the players 
        let players = world.getAllPlayers()
        players.forEach(player => {
            if ((player.hasTag('arena:archaic_marble_wings_archaiccharm') || player.hasTag('arena:archaic_hemlock_wings_archaiccharm')) && player.getComponent('equippable').getEquipment('Chest')?.typeId == 'minecraft:elytra') {
                const zombies = player.dimension.getEntities({ location: player.location, maxDistance: 25, type: "minecraft:zombie_villager" });

                for (const zombie of zombies) {
                    if (!zombie.hasTag("converted_once")) {
                    zombie.triggerEvent("villager_converted");
                    zombie.addTag("converted_once");
                    }
                }
            }
            const time = world.getTimeOfDay();
            const isNight = time >= 13000 && time <= 23000;

            if (player.hasTag('arena:nights_devouring_mask_face')) {
                if (isNight && !player.hasTag('arena:night_counted')) {
                    const nights = getNightCounter(player) + 1;
                    setNightCounter(player, nights);
                    player.addTag('arena:night_counted');
                }
                if (!isNight && player.hasTag('arena:night_counted')) {
                    player.removeTag('arena:night_counted');
                }
            }
        });
    }, 1200)
    system.runInterval(() => {
        let players = world.getAllPlayers()
        players.forEach(player => {
            if (player.hasTag('arena:conscious_star_archaiccharm')) {
                const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                player.sendMessage(randomMessage);
            }
        });
    }, 4800)
})


world.afterEvents.entityDie.subscribe((e) => {
    const { deadEntity, damageSource } = e;
    const attacker = damageSource.damagingEntity;
    { if (!attacker) return;
    if (deadEntity.typeId === "minecraft:player") return;
    if (attacker.typeId === "minecraft:player" && attacker.hasTag("arena:sculk_belt_body")) {
        return;
    }
    const validAttacker = attacker.hasComponent("minecraft:is_tamed") || (attacker.typeId === "minecraft:player" && !attacker.hasTag("arena:sculk_belt_body"));
    if (!validAttacker) return;
        const players = deadEntity.dimension.getPlayers({ location: deadEntity.location, maxDistance: 8});
        for (const player of players) {
            if (!player.hasTag("arena:sculk_belt_body")) continue;
            player.addEffect("regeneration", 150, {amplifier: 0, showParticles: true});
        }
    }
});
world.afterEvents.entityDie.subscribe((e) => {
    const { deadEntity, damageSource } = e;
    const attacker = damageSource.damagingEntity;
    if (attacker?.typeId !== "minecraft:player") return;
    if (attacker.hasTag('arena:cursed_active')) return;

    if (attacker?.typeId !== 'minecraft:player') return;
    const tags = new Set(attacker.getTags());
    const ENTITY_GROUPS = {
        undead: { family: ["undead"] },
        passive: { family: ["mob"] },
        special: { typeId: [ "minecraft:elder_guardian", "minecraft:evocation_illager", "minecraft:guardian", "minecraft:enderman" ] },
        boss: { typeId: ["minecraft:wither", "minecraft:ender_dragon", "minecraft:warden"] },
        brute: { typeId: ["minecraft:piglin_brute", "minecraft:ravager"] },
        normalMob: { family: ["monster"] }
    };

    const awardXP = (amount) => attacker?.addExperience(amount);

    function is(entity, groupName) {
        return matchesEntity(entity, ENTITY_GROUPS[groupName]);
    }
    const undead = is(deadEntity, "undead");
    const passive = is(deadEntity, "passive");
    const special = is(deadEntity, "special");
    const brute = is(deadEntity, "brute");
    const boss = is(deadEntity, "boss");
    const normal = is(deadEntity, "normalMob");
    const baby = deadEntity.hasComponent("minecraft:is_baby");

    let multiplier = 0;
    if (tags.has('arena:archaic_arnold_archaiccharm')) { multiplier += 2 };
    if (tags.has('g:experience_amulet_amulet')) { multiplier += 1 };
    if (tags.has('arena:agustin_doll_doll')) { multiplier += 1 };

    if (tags.has('arena:iron_emerald_earring_earring')) { multiplier += 0.2 };
    if (tags.has('arena:golden_emerald_earring_earring')) { multiplier += 0.4 };
    if (tags.has('arena:prismarine_emerald_earring_earring')) { multiplier += 0.6 };
    if (tags.has('arena:netherite_emerald_earring_earring')) { multiplier += 0.8 };
    if (tags.has('arena:fallen_emerald_earring_earring')) { multiplier += 1 };

    if (tags.has('arena:iron_emerald_earring_earringdown')) { multiplier += 0.2 };
    if (tags.has('arena:golden_emerald_earring_earringdown')) { multiplier += 0.4 };
    if (tags.has('arena:prismarine_emerald_earring_earringdown')) { multiplier += 0.6 };
    if (tags.has('arena:netherite_emerald_earring_earringdown')) { multiplier += 0.8 };
    if (tags.has('arena:fallen_emerald_earring_earringdown')) { multiplier += 1 };

    if (tags.has('arena:pure_marble_emerald_earring_earring')) { multiplier += 1.2 };
    if (tags.has('arena:pure_marble_emerald_earring_earringdown')) { multiplier += 1.2 };
    if (multiplier > 0) {
        let baseXP = 0;
        if (!undead && !special && !boss && !brute && (passive || baby)) { baseXP = 2 };
        if ((baby && undead) || normal) { baseXP = 5 };
        if (special) { baseXP = 15 };
        if (brute) { baseXP = 100 };
        if (boss) { baseXP = 250 };
        awardXP(baseXP * multiplier);
    }

    handleSoulDrop(attacker, deadEntity);
    
    if (tags.has('arena:rhetoric_skull_talisman')) {
        attacker.addEffect('poison', 80, { amplifier: 1, showParticles: true });
    }
    if (tags.has('eu:bravery_ring_ring') && deadEntity.matches({ families: ["monster"] })) {
        attacker.addEffect('strength', 140, { amplifier: 0, showParticles: true });
    }
    if (tags.has('eu:hero_ring_ring') && deadEntity.matches({ families: ["illager"] })) {
        attacker.addEffect('villager', 200, { amplifier: 0, showParticles: true });
    }
    if (tags.has('eu:rage_stone_amulet')) {
        attacker.addEffect('strength', 60, { amplifier: 0, showParticles: true });
    }

    if (tags.has('arena:marble_skull_charm')) {
        attacker.addEffect('levitation', 100, { amplifier: 0, showParticles: true });
        const monsters = attacker.dimension.getEntities({ location: deadEntity.location, maxDistance: 2, families: ["monster"] });
        for (const monster of monsters) {
            const loc = monster.location;
            monster.teleport({ x: loc.x, y: loc.y - 2, z: loc.z }, { dimension: monster.dimension });
        }
    }

    if (tags.has('arena:blossom_crown_head')) {
        const nearbyEntities = attacker.dimension.getEntities({ location: attacker.location, maxDistance: 4, excludeTypes: ["minecraft:item", "minecraft:xp_orb"]});
        for (const entity of nearbyEntities) {
            if (!entity.matches({ families: ["monster"] })) {
                entity.addEffect("regeneration", 140, { amplifier: 0, showParticles: true });
            }
        }
    }
    const { x, y, z } = deadEntity.location;
    const dim = deadEntity.dimension;

    const killCounters = {
        'arena:dream_tatters_of_the_king_body': 'tatters_king',
    };

    for (const [tag, prop] of Object.entries(killCounters)) {
        if (tags.has(tag)) {
            const current = attacker.getDynamicProperty(prop) || 0;
            attacker.setDynamicProperty(prop, current + 1);
            attacker.playSound("particle.soul_escape", deadEntity.location);
            dim.spawnParticle("minecraft:soul_particle", { x, y: y + 1, z });
        }
    }
    if (tags.has('arena:archaic_sacret_skull_archaiccharm')) {
        attacker.addEffect('darkness', 200, { amplifier: 0, showParticles: true });
        attacker.addTag('skull_kill');
        dim.spawnParticle("minecraft:soul_particle", { x, y: y + 1, z });
    }
    if (tags.has('twm:bloodbound_emblem_body')) {
        attacker.addTag('bloodemblem_active');
        system.runTimeout(() => { attacker.removeTag('bloodemblem_active') }, 60)
    }
    let Blossom_bonus = 1;

    const BlossomBonus = {
        'arena:golden_blossom_ring_ring': 1,
        'arena:prismarine_blossom_ring_ring': 2,
        'arena:netherite_blossom_ring_ring': 3,
        'arena:marble_blossom_ring_ring': 4,
    };
    for (const [tag, bonus] of Object.entries(BlossomBonus)) {  if (tags.has(tag)) { Blossom_bonus += bonus } }
    if (tags.has('arena:cherry_blossom_charm')) {
        let timeKills = attacker.getDynamicProperty('arena:cherry_blossom_charm') || 0;
        timeKills++;
        attacker.setDynamicProperty('arena:cherry_blossom_charm', timeKills);
        dim.spawnParticle("minecraft:heart_particle", { x, y: y + 1, z });
        system.runTimeout(() => {
            const newKills = attacker.getDynamicProperty('arena:cherry_blossom_charm');
            if (newKills === timeKills) {
                attacker.setDynamicProperty('arena:cherry_blossom_charm', 0);
            }
        }, 1800 * Blossom_bonus);
    }
    const SculkBonus = {
        'arena:iron_sculk_ring_ring': 5,
        'arena:golden_sculk_ring_ring': 10,
        'arena:prismarine_sculk_ring_ring': 15,
        'arena:netherite_sculk_ring_ring': 20,
        'arena:marble_sculk_ring_ring': 25,
    };
    for (const [tag, max] of Object.entries(SculkBonus)) { 
        if (tags.has(tag)) { 
            let sculKills = attacker.getDynamicProperty('arena_sculkilling') || 0;
            if (sculKills < max) {
                sculKills++;
                attacker.setDynamicProperty('arena_sculkilling', sculKills);
                attacker.playSound("particle.soul_escape", deadEntity.location);
                dim.spawnParticle("minecraft:soul_particle", { x, y: y + 1, z });
            }
        }
        if (deadEntity?.typeId !== "minecraft:player" && deadEntity?.hasTag(tag)) {
            deadEntity.setDynamicProperty('arena_sculkilling', 0);
        }
    }
});


world.afterEvents.entityHurt.subscribe(e => {
    const { hurtEntity, damageSource, damage } = e;
    const chance = 1;
    let attacker = damageSource.damagingEntity;
    let cancel_hit = false;

    if (attacker?.typeId === 'minecraft:player') {
        handlePlayerAsAttacker(e);
    }
    if (hurtEntity?.typeId === 'minecraft:player') {
        handlePlayerAsVictim(e);
    }

    if (Math.random() < 0.3 * chance && hurtEntity.hasTag("skull_kill") && damageSource.damagingEntity != undefined && damageSource.damagingEntity.isValid() && damageSource.damagingProjectile == undefined) {
        let health = hurtEntity.getComponent("minecraft:health");
        health.setCurrentValue(Math.min(health.currentValue + damage, health.effectiveMax));
        damageSource.damagingEntity.applyDamage(damage, { damagingEntity: hurtEntity, cause: "magic" });
        cancel_hit = true;
    }
});
function getActiveBlockDrops(player) {
    for (const entry of BLOCKDROP_MAPS) {
        if (entry.anyTags?.some(tag => player.hasTag(tag))) {
            return entry.drops;
        }
    }
    return null;
}
function randomAmount(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

world.afterEvents.playerBreakBlock.subscribe(e => {
    const { brokenBlockPermutation, player, block, itemStackAfterBreak } = e;

    const blockTypeId = brokenBlockPermutation?.type?.id;
    if (!blockTypeId) return;


    const SILK_TOUCH = new EnchantmentType('silk_touch');
    if (itemStackAfterBreak) {
        const enchantable = itemStackAfterBreak.getComponent("enchantable");
        if (enchantable?.hasEnchantment(SILK_TOUCH)) {
            return; // cancela drops custom si tiene silk touch
        }
    }

    const activeDrops = getActiveBlockDrops(player);
    if (!activeDrops) return;

    const dropInfo = activeDrops[blockTypeId];
    if (!dropInfo) return;

    const location = block.location;
    const amount = (dropInfo.min !== undefined && dropInfo.max !== undefined)
        ? randomAmount(dropInfo.min, dropInfo.max)
        : 1;

    const drop = new ItemStack(dropInfo.item, amount);
    player.dimension.spawnItem(drop, location);
});
function getActiveOreMap(player) {
    for (const entry of ORE_MAPS) {
        if (entry.anyTags?.some(tag => player.hasTag(tag))) {
            return entry.map;
        }
    }
    return null;
}

world.beforeEvents.playerBreakBlock.subscribe(async e => {
    const block = e.block;
    const player = e.player;

    const oreMap = getActiveOreMap(player);
    if (!oreMap) return;
    await null;
    const blockLocation = block.location;
    const droppedItems = block.dimension.getEntities({
        type: "minecraft:item",
        location: blockLocation,
        maxDistance: 2
    });

    for (const itemEntity of droppedItems) {
        const stack = itemEntity.getComponent("item").itemStack;
        const newType = oreMap[stack.typeId];
        if (!newType) continue;
        itemEntity.remove();
        const molten = new ItemStack(newType);

        player.dimension.spawnItem(molten, blockLocation);
        player.playSound("random.fizz", { location: blockLocation, volume: 0.3 });
    }
});
function findSafeNearbyLocation(entity, radius = 12, maxHeight = 80) {
    const dim = entity.dimension;
    const origin = entity.location;

    for (let i = 0; i < 20; i++) {
        const offsetX = (Math.random() - 0.5) * 2 * radius;
        const offsetZ = (Math.random() - 0.5) * 2 * radius;
        const newX = Math.floor(origin.x + offsetX);
        const newZ = Math.floor(origin.z + offsetZ);

        for (let y = maxHeight; y > 10; y--) {
            const block = dim.getBlock({ x: newX, y, z: newZ });
            const above = dim.getBlock({ x: newX, y: y + 1, z: newZ });

            if (block?.typeId !== "minecraft:air" && above?.typeId === "minecraft:air") {
                return { x: newX + 0.5, y: y + 1, z: newZ + 0.5 };
            }
        }
    }

    return null;
}
function getNightCounter(player) {
    return player.getDynamicProperty('arena:nights_without_sleep') ?? 0;
}
function setNightCounter(player, value) {
    player.setDynamicProperty('arena:nights_without_sleep', value);
}