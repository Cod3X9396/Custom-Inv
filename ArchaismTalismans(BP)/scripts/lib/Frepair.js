export function repair(player) {
    let equippable = player.getComponent('equippable')
    let equipmentSet = ['Mainhand']
    if (player.hasTag('twm:mender_pendant_necklace') || player.hasTag('arena:tool_belt_body')) equipmentSet.push('Head', 'Chest', 'Legs', 'Feet', 'Offhand')
    for (let equipment of equipmentSet) {
        const item = equippable.getEquipment(equipment)
        if (item != undefined) {
            const durability = item.getComponent('minecraft:durability')
            if (item.hasComponent('minecraft:durability') && durability.damage != 0) {
                durability.damage = Math.max(durability.damage - 1)
                equippable.setEquipment(equipment, item)
            }
        }
    }
}