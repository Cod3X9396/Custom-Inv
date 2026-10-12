export function matchesEntity(deadEntity, rule) {
    if (rule.typeId) {
        if (!rule.typeId.includes(deadEntity.typeId)) {
            return false;
        }
    }
    if (rule.family) {
        if (!deadEntity.matches({ families: rule.family })) {
            return false;
        }
    }
    if (rule.isBaby !== undefined) {
        const isBaby = deadEntity.hasComponent("minecraft:is_baby");
        if (rule.isBaby !== isBaby) {
            return false;
        }
    }
    return true;
}
