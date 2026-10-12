export function damageEquipment(player, amount = 1) {
    if (!player || !player.isValid()) return;
    const equippable = player.getComponent("equippable");
    if (!equippable) return;
    const equipmentSet = [ "Mainhand" ];
    
    for (const slot of equipmentSet) {
        const item = equippable.getEquipment(slot);
        if (!item) continue;
        const durability = item.getComponent("minecraft:durability");
        if (!durability) continue;
        const max = durability.maxDurability;
        durability.damage = Math.min(durability.damage + amount, max - 1);
        equippable.setEquipment(slot, item);
    }
}