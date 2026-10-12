import { world, system } from "@minecraft/server";

const CURSED_TAG = "arena:cursed_active";

function Cursed(entity, totalDuration) {
    if (entity.hasTag(CURSED_TAG)) return;
    entity.addTag(CURSED_TAG);
    entity.setDynamicProperty("arena:cursedTimeLeft", totalDuration);

    const id = system.runInterval(() => {
        if (!entity?.isValid()) {
            entity.removeTag(CURSED_TAG);
            system.clearRun(id);
            return;
        }
        let timeLeft = entity.getDynamicProperty("arena:cursedTimeLeft");
        if (timeLeft <= 0) {
            entity.removeTag(CURSED_TAG);
            system.clearRun(id);
            return;
        }
        entity.dimension.spawnParticle("arena:cursed", { x: entity.location.x, y: entity.location.y + 1.3, z: entity.location.z});
        entity.setDynamicProperty("arena:cursedTimeLeft", timeLeft - 1);
    }, 20);
}
const cursedChances = [
    { tag: "arena:cursed_pendant_necklace", chance: 20, duration: 4 },
    { tag: "arena:depart_paladins_fate_head", chance: 75, duration: 5 },
    { tag: "arena:w_amulet", chance: 100, duration: 60 }
];

world.afterEvents.entityHitEntity.subscribe(e => {
    const { damagingEntity, hitEntity } = e;
    const id = hitEntity.typeId;
    if (damagingEntity.typeId !== "minecraft:player") return;
    const ignoredEntities = [ "arena:ignited_explosion", "arena:dummy_platform", "twm:trinket_manager"];
    if (ignoredEntities.some(type => id.includes(type))) return;
    if (!damagingEntity || !hitEntity) return;
    if (hitEntity.hasTag(CURSED_TAG)) return;
    let totalDuration = 0;

    const weapon = damagingEntity.getComponent("equippable")?.getEquipment("Mainhand");

    if (weapon?.typeId === "arena:cursed_axe" && Math.random() * 100 < 25 ) { totalDuration += 3 }
    for (const { tag, chance, duration } of cursedChances) {
        if ( damagingEntity.hasTag(tag) && Math.random() * 100 < chance ) {
            totalDuration += duration;
        }
    }
    if (totalDuration <= 0) return;
    Cursed(hitEntity, totalDuration);
});