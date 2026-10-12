const ornateItems = {
    "arena:ornate_curio_talisman": { ornateCount: 2 },
    "arena:ornate_band_ring": {},
    "arena:ornate_pendant_necklace": {},
    "arena:ornate_ring_ring": {},
    "arena:ornate_belt_body": {},
    "arena:ornate_helmet_head": {},
    "arena:ornate_earring_earring": {},
    "arena:ornate_earring_earringdown": {},
    "arena:ornate_guantlet_gauntlet": {},
    "arena:ornate_guantlet_gauntletleft": {}
};

export function getOrnateStats(player) {
    const tags = player.getTags();
    let ornateStacks = 0;
    let ornateReduction = 0;
    const stats = { health: 0, attack: 0, speed: 0, meleeD: 0, projectileD: 0 };
    const equippedOrnates = [];

    for (const tag of tags) {
        if (tag === "arena:ornate_core_charm") { ornateReduction += 3 }
        if (!ornateItems[tag]) continue;
        equippedOrnates.push(tag);
        ornateStacks += ornateItems[tag].ornateCount || 1;
    }
    for (const item of equippedOrnates) {
        switch (item) {

            case "arena:ornate_band_ring":
                stats.meleeD -= Math.min(0.05 * ornateStacks, 0.2);
            break;

            case "arena:ornate_ring_ring":
                stats.speed += Math.min(0.01 * ornateStacks, 0.03);
            break;

            case "arena:ornate_belt_body":
                stats.meleeD -= Math.min(0.05 * ornateStacks, 0.3);
                stats.attack -= Math.max(0, ornateStacks - ornateReduction);
            break;

            case "arena:ornate_helmet_head":
                stats.attack += Math.min(1 * ornateStacks, 7);
                stats.meleeD += 0.05 * Math.max(0, ornateStacks - ornateReduction);
            break;

            case "arena:ornate_earring_earring":
                stats.health += 4 * ornateStacks;
                stats.projectileD += 0.05 * Math.max(0, ornateStacks - ornateReduction);
            break;

            case "arena:ornate_earring_earringdown":
                stats.health += 4 * ornateStacks;
                stats.projectileD += 0.05 * Math.max(0, ornateStacks - ornateReduction);
            break;

            case "arena:ornate_guantlet_gauntlet":
                stats.attack += Math.min(1 * ornateStacks, 4);
                stats.health -= 4 * Math.min(20, Math.max(0, ornateStacks - ornateReduction));
            break;

            case "arena:ornate_guantlet_gauntletleft":
                stats.attack += Math.min(1 * ornateStacks, 4);
                stats.health -= 4 * Math.min(20, Math.max(0, ornateStacks - ornateReduction));
            break;
        }
    }
    return stats;
}