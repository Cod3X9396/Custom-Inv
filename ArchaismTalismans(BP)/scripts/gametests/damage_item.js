import { GameMode } from "@minecraft/server";
export function DamageItem(player, slot, damage = 1) {
    const item = slot.getItem();
    if (!item?.typeId.match(/arena:/) || player.getGameMode() === GameMode.creative)
        return;
    const durability = item.getComponent('durability');
    if (!durability)
        return;
    const enchantable = item.getComponent('enchantable');
    const unbreaking = enchantable?.getEnchantment('unbreaking')?.level ?? 0;
    if (Math.random() * 100 <= (100 / (unbreaking + 1)))
        durability.damage += damage;
    slot.setItem(durability.damage < durability.maxDurability ? item : player.playSound('random.break'));
}
