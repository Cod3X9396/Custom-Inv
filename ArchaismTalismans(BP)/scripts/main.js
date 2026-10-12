import './trinkets/trinkets.js'
import './trinkets/trinketsInv.js'
import './trinkets/main.js'
import './ar_loots.js'
import './loots.js'
import './masks.js'
import './armor.js'
import './bleeding.js'
import './cursed.js'
import './elytra_manager.js'
import './death_mark.js'
import './insomnia.js'
import './sculk_sensor.js'
import './mining.js'
import './staff.js'
import './lib/otherAbilities.js'
import './zweihander.js'
import './marble_spear.js'
import './Lore.js'
import { EquipmentSlot, world, ItemStack } from '@minecraft/server';
import { DamageItem } from "./gametests/damage_item";
import { afterEvents, Vector } from "./gametests/extras";

const specialItems = {
    HamlethArena: [ "arena:fox_mask", "arena:arena_chestplate" ],
    OverHau1edArena: [ "arena:fox_mask", "arena:arena_chestplate" ],
    PaladinPlays524: [ "arena:blood_scythe", "arena:paladin_doll" ],
    LotteAxolotl: [ "arena:poseidon_mask", "arena:lotte_axolotle_doll" ],
    StrawberryCat00: [ "arena:cat_mask", "arena:gentrix_doll" ],
    CryingOberon: [ "arena:ifrits_mantle" ],
    JuanAndres55485: [ "arena:heart_of_judgment" ],
    MRcobranight: [ "arena:spectral_talisman" ]
};
world.afterEvents.playerSpawn.subscribe((ev) => {
    const {player, initialSpawn} = ev;
    if(player.hasTag("archaic_scroll")) return;
    player.addTag("archaic_scroll");
    let trinketscroll = new ItemStack("twm:scroll", 1);
    trinketscroll.keepOnDeath = true;
    let inventory = player.getComponent("minecraft:inventory").container;
    inventory.addItem(trinketscroll);
    const items = specialItems[player.nameTag];
    if (items) { for (const id of items) { inventory.addItem(new ItemStack(id, 1)) }}
    player.addTag("archaic_scroll");
})


afterEvents.itemUseOn.subscribe(({ source }) => DamageItem(source, source.equippable.getEquipmentSlot(EquipmentSlot.Mainhand)));
afterEvents.playerBreakBlock.subscribe(({ player }) => DamageItem(player, player.equippable.getEquipmentSlot(EquipmentSlot.Mainhand)));