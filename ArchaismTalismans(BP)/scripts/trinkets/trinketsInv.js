import { world, system, ItemStack } from '@minecraft/server'
import { trinkets, abilities, showPlayerStats } from 'trinkets/trinkets.js'

const slots = [
    { slot: 'head', index: 0 },
    { slot: 'body', index: 1 },
    { slot: 'feet', index: 2 },
    { slot: 'necklace', index: 3 },
    { slot: 'ring', index: 4 },
    { slot: 'charm', index: 5 },
    { slot: 'gauntlet', index: 7 },
    { slot: 'talisman', index: 6 },
    { slot: 'heartycharm', index: 8 },
    { slot: 'doll', index: 9 },
    { slot: 'witherring', index: 10 },
    { slot: 'archaiccharm', index: 11 },
    { slot: 'book', index: 12 },
    { slot: 'amulet', index: 13 },
    { slot: 'earring', index: 14 },
    { slot: 'gauntletleft', index: 15 },
    { slot: 'witherringdown', index: 16 },
    { slot: 'earringdown', index: 17 },
    { slot: 'face', index: 18 }
]
/**
 * @param {Player} player
 * @param {boolean} give - true = /give al inventario, false = dropear en el mundo 
*/
function clearAllTrinkets(player, give = true) {
    const inv = player.getComponent("inventory")?.container;
    if (!inv) return;
    const tags = player.getTags();
    const trinketTags = tags.filter(tag => trinkets.some(t => (t.slots ?? [t.slot]).some(s => tag === `${t.identifier}_${s}`)));
    if (trinketTags.length === 0) return;
    const itemsToReturn = [];
    for (const tag of trinketTags) {
        const trinketId = tag.substring(0, tag.lastIndexOf("_"));
        itemsToReturn.push(new ItemStack(trinketId));
        player.removeTag(tag);
    }
    system.runTimeout(() => {
        for (const item of itemsToReturn) {
            if (give && inv.emptySlotsCount > 0) {
                inv.addItem(item);
            } else {
                player.dimension.spawnItem(item, player.location);
            }
        }
    }, 1);
    system.runTimeout(() => {
        abilities(player);
    }, 2);
}
function loadEntityInv(player, entity) {
    const entityInv = entity.getComponent('inventory')?.container;
    if (!entityInv) return;
    const playerTags = player.getTags();
    slots.forEach(slot => {
        const validTag = playerTags.find(tag => {
            if (!tag.endsWith(`_${slot.slot}`)) return false;
            const id = tag.slice(0, tag.length - (slot.slot.length + 1));
            return trinkets.some(t => t.identifier === id && (t.slots ?? [t.slot]).includes(slot.slot));
        });

        if (!validTag) return;
        if (entityInv.getItem(slot.index)) return;
        const id = validTag.slice(0, validTag.length - (slot.slot.length + 1));
        const item = new ItemStack(id);
        entityInv.setItem(slot.index, item);
    });
}
function getInvEntity(player) {
    const entities = player.dimension.getEntities({tags: [player.id]});
    return entities[0];
}
function summonInvEntity(player) {
    let entity = player.dimension.spawnEntity('twm:trinket_manager', player.location)
    entity.addTag(`${player.id}`)
    entity.getComponent('minecraft:tameable').tame(player)
    entity.nameTag = "dorios trinkets"
    return entity;
}
function useMultiSlotTrinket(player, trinket) {
    const inv = player.getComponent("inventory")?.container;
    if (!inv) return false;
    const validSlots = trinket.slots;
    const tags = player.getTags();
    const equippedTags = tags.filter(tag => validSlots.some(s => tag.endsWith(`_${s}`)));
    const usedSlots = equippedTags.map(t => t.split("_").pop());
    let targetSlot = validSlots.find(s => !usedSlots.includes(s));
    let swappedTag = null;
    const sameTrinket = equippedTags.find(tag => tag.startsWith(`${trinket.identifier}_`));
    if (sameTrinket) {
        swappedTag = sameTrinket;
        targetSlot = sameTrinket.split("_").pop();
    }
    else if (!targetSlot && equippedTags.length > 0) {
        swappedTag = equippedTags[0];
        targetSlot = swappedTag.split("_").pop();
    }

    if (!targetSlot) return false;
    const newTag = `${trinket.identifier}_${targetSlot}`;
    if (equippedTags.includes(newTag)) return false;
    if (swappedTag) {
        const oldId = swappedTag.split("_").slice(0, -1).join("_");
        const oldItem = new ItemStack(oldId);
        inv.emptySlotsCount
            ? inv.addItem(oldItem)
            : player.dimension.spawnItem(oldItem, player.location);
        player.removeTag(swappedTag);
    }
    player.addTag(newTag);
    return true;
}
function trinketToTag(trinket) {
    let id = trinket.identifier
    let slot = trinket.slot
    if (!trinket) return;
    let tag = id + "_" + slot
    return tag;
}
function trinketUse(player, trinket) {
    const inv = player.getComponent('inventory')?.container;
    if (!inv) return;
    if (inv.emptySlotsCount === 0) { player.playSound("note.bass");
        return;
    }
    if (player.isSneaking) return;
    let replaced = false;
    if (Array.isArray(trinket.slots)) {
        replaced = useMultiSlotTrinket(player, trinket);
        if (!replaced) return;
    }
    else {
        const slotInfo = slots.find(s => s.slot === trinket.slot);
        if (!slotInfo) return;
        const currentTag = player.getTags().find(tag => tag.endsWith(`_${trinket.slot}`) && trinkets.some(t => tag === `${t.identifier}_${t.slot}`));
        const newTag = trinketToTag(trinket);
        if (currentTag === newTag) return;

        if (currentTag) {
            const oldId = currentTag.slice(0, currentTag.length - (`_${trinket.slot}`.length));
            const oldItem = new ItemStack(oldId);
            inv.emptySlotsCount ? inv.addItem(oldItem) : player.dimension.spawnItem(oldItem, player.location);

            player.removeTag(currentTag);
            replaced = true;
        }
        player.addTag(newTag);
    }
    const equip = player.getComponent("equippable");
    const mainhand = equip?.getEquipment("Mainhand");

    if (mainhand?.typeId === trinket.identifier) {
        if (mainhand.amount > 1) {
            mainhand.amount--;
            equip.setEquipment("Mainhand", mainhand);
        } else {
            equip.setEquipment("Mainhand");
        }
    }

    player.playSound(replaced ? "armor.equip_chain" : "armor.equip_leather");
    abilities(player);
    showPlayerStats(player);
}
function getTrinketTag(player, slot) {
    return player.getTags().find(tag => {
        if (!tag.endsWith(`_${slot}`)) return false;
        const id = tag.slice(0, -(slot.length + 1));
        return trinkets.some(t => t.identifier === id && (t.slots ?? [t.slot]).includes(slot));
    });
}
function trinketCheck(player, slot, slotIndex) {
    const trinketInv = player.dimension.getEntities({ tags: [player.id] })[0];
    if (!trinketInv) return;

    const entityInv = trinketInv.getComponent("inventory")?.container;
    const playerInv = player.getComponent("inventory")?.container;
    if (!entityInv || !playerInv) return;

    const invSlot = entityInv.getSlot(slotIndex);
    const entityItem = invSlot.getItem();
    if (!entityItem) {
        const tag = getTrinketTag(player, slot);
        if (!tag) return;
        player.removeTag(tag);
        abilities(player);
        showPlayerStats(player);
        return;
    }

    const trinket = trinkets.find(t => t.identifier === entityItem.typeId);
    const item = entityItem.clone();

    if (!trinket) {
        entityInv.setItem(slotIndex);
        playerInv.emptySlotsCount? playerInv.addItem(item) : player.dimension.spawnItem(item, player.location);
        return;
    }
    const validSlots = trinket.slots ?? [trinket.slot];
    const isValidSlot = validSlots.includes(slot);
    if (!isValidSlot) {
        const targetSlot = slots.find(s => validSlots.includes(s.slot) && !entityInv.getItem(s.index));
        if (targetSlot) {
            entityInv.moveItem(slotIndex, targetSlot.index, entityInv);
            return;
        }
        entityInv.setItem(slotIndex);
        playerInv.emptySlotsCount ? playerInv.addItem(item) : player.dimension.spawnItem(item, player.location);
        return;
    }
    if (isValidSlot) {
        const currentTag = getTrinketTag(player, slot);
        const newTag = `${trinket.identifier}_${slot}`;

        if (currentTag !== newTag) {
            if (currentTag) player.removeTag(currentTag);
            player.addTag(newTag);
            player.onScreenDisplay.setActionBar(`§fSlot: ${slot}`);
            player.playSound("armor.equip_iron");
            abilities(player);
            showPlayerStats(player);
        }
        return;
    }
}

world.afterEvents.itemUse.subscribe(e => { 
    const { itemStack, source } = e;
    const trinket = trinkets.find(trnkt => itemStack.typeId === trnkt.identifier);
    if (trinket) {
        trinketUse(source, trinket);
    }
    if (itemStack.typeId === "arena:scroll") {
        getInvEntity(source)?.remove();
        clearAllTrinkets(source, false);
        source.removeTag('twm:trinketChecked');
    }
});
world.afterEvents.entityDie.subscribe(e => {
    const entity = e.deadEntity;
    if (entity.typeId !== "minecraft:player") return;
    if (entity.hasTag('DropTrinketsInv')) {
        getInvEntity(entity)?.remove();
        system.runTimeout(() => {
            clearAllTrinkets(entity, false);
        }, 2);
    }
});
const lastTrinketPos = new Map();
const lastHeldItemType = new Map();
world.afterEvents.playerLeave.subscribe(e => {
    lastTrinketPos.delete(e.playerId);
    lastHeldItemType.delete(e.playerId);
    let trinketInv = getInvEntity(player);
    trinketInv?.remove();
});
system.runInterval(() => {
    for (const player of world.getPlayers()) {
    const equip = player.getComponent("equippable");
    const inventory = player.getComponent("inventory")?.container;
    if (!equip || !inventory) continue;

    const mainHand = equip.getEquipment("Mainhand");
    const currentType = mainHand?.typeId ?? null;
    const previousType = lastHeldItemType.get(player.id);

    if (previousType && previousType !== currentType && (previousType === "twm:trinket_manager" || previousType === "twm:scroll")) {
      for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (item && item.typeId === previousType) {
          item.lockMode = "none";
          item.keepOnDeath = true;
          inventory.setItem(i, item);
        }
      }
    }
    let trinketInv = getInvEntity(player);
    if (isInvalid(player) && (currentType === "twm:trinket_manager" || currentType === "twm:scroll")) {
        trinketCheckOnDelete(player, trinketInv);
        continue;
    }
    lastHeldItemType.set(player.id, currentType);
    const slot = player.selectedSlotIndex;
    const isUsingUI = currentType === "twm:trinket_manager" || currentType === "twm:scroll";
    const wasUsingUI = previousType === "twm:trinket_manager" || previousType === "twm:scroll";
    if (!mainHand || !isUsingUI) {
        if (wasUsingUI) {
            trinketCheckOnDelete(player, trinketInv);
        } else {
            trinketInv?.remove();
        }
        continue;
    }
    system.runTimeout(() => {
      const current = equip.getEquipment("Mainhand");
      if (current?.typeId === currentType) {
        current.lockMode = "slot";
        current.keepOnDeath = true;
        inventory.setItem(slot, current);
      } else {
        for (let i = 0; i < inventory.size; i++) {
          const item = inventory.getItem(i);
          if (item?.typeId === currentType) {
            item.lockMode = "none";
            item.keepOnDeath = true;
            inventory.setItem(i, item);
          }
        }
      }
    }, 1);
    if (!trinketInv) {
      summonInvEntity(player);
      continue;
    }
    if (!trinketInv.getTags().includes("twm:invLoaded")) {
      loadEntityInv(player, trinketInv);
      trinketInv.addTag("twm:invLoaded");
    }
    const head = player.getHeadLocation();
    const view = player.getViewDirection();
    const newPos = { x: head.x + view.x * 0.5, y: head.y + view.y * 0.5, z: head.z + view.z * 0.5 };
    const key = player.id;
    const lastPos = lastTrinketPos.get(key);
    const distance = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);

    if (!lastPos || distance(newPos, lastPos) > 0.4) {
      trinketInv.teleport(newPos, { dimension: player.dimension });
      lastTrinketPos.set(key, newPos);
    }

    if (!player.hasTag("twm:trinketChecked")) {
      for (const slot of slots) trinketCheck(player, slot.slot, slot.index);
      player.addTag("twm:trinketChecked");
      system.runTimeout(() => player.removeTag("twm:trinketChecked"), 1);
    }
  }
}, 5);
function capSaysItsBuggy(dimension, location) {
    try { return dimension.getBlock(location) } catch { return undefined }
}
function isInvalid(player) {
    const { x, y, z } = player.location;
    const fx = Math.floor(x);
    const fy = Math.floor(y);
    const fz = Math.floor(z);
    const blockHead = capSaysItsBuggy(player.dimension, { x: fx, y: fy + 1, z: fz });
    const blockFeet = capSaysItsBuggy(player.dimension, { x: fx, y: fy, z: fz });
    const blockBelow = capSaysItsBuggy(player.dimension, { x: fx, y: fy - 1, z: fz });
    const blockBeloww = capSaysItsBuggy(player.dimension, { x: fx, y: fy - 2, z: fz });
    if (blockFeet?.typeId?.includes('portal') || blockHead?.typeId?.includes('portal')) { return true }
    if (blockFeet?.typeId?.includes('end_portal') || blockBelow?.typeId?.includes('end_portal')) { return true }
    const MIN_Y = -64;
    const MAX_Y = 320;
    if (y < MIN_Y || y > MAX_Y) { return true }
    if (blockBeloww.typeId?.includes('air') && blockBelow.typeId?.includes('air') || player.isFalling) { return true }
    return false;
}
function trinketCheckOnDelete(player, entity) {
    if (entity) {
        if (player.hasTag("arena:alreadyremoved")) return;
        player.addTag("arena:alreadyremoved");
        const entityInv = entity.getComponent("inventory")?.container;
        if (!entityInv) {
            player.removeTag("arena:alreadyremoved");
            return;
        }
        if (!entity.getTags().includes("twm:invLoaded")) {
            loadEntityInv(player, entity);
            entity.addTag("twm:invLoaded");
        }
        let changed = false;
        for (const slot of slots) {
            const item = entityInv.getItem(slot.index);
            if (!item) {
                const tag = player.getTags().find(t => t.endsWith(`_${slot.slot}`));
                if (tag) { 
                    player.removeTag(tag);
                    changed = true;
                }
            }
        }
        if (changed) {
            abilities(player);
            showPlayerStats(player);
        }
    }
    if (entity) {
        system.runTimeout(() => {
            entity?.remove();
            player.removeTag("arena:alreadyremoved");
        }, 1);
    }
}