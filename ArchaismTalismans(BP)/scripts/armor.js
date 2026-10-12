import { world, EntityItemComponent, GameMode, ItemEnchantableComponent, EquipmentSlot, Entity, ItemStack, EntityEquippableComponent, system } from "@minecraft/server";
import { getScore, setScore } from "./lib/main"
const woodBlocks = ["minecraft:oak_log", "minecraft:spruce_log", "minecraft:birch_log", "minecraft:jungle_log", "minecraft:acacia_log", "minecraft:dark_oak_log", "minecraft:mangrove_log", "minecraft:cherry_log", "minecraft:warped_stem", "minecraft:crimson_stem",];
world.beforeEvents.itemUseOn.subscribe((event) => {
	const player = event.source;
	const block = event.block;
	if (!block) return;
	const blockId = block.type.id;
	const inventory = player.getComponent("inventory").container;
	const equippedItem = inventory.getItem(player.selectedSlotIndex);
	if (equippedItem && equippedItem.typeId.includes("axe") && !equippedItem.typeId.includes("pickaxe")) {
		if (woodBlocks.includes(blockId)) {
			system.run(ts => {
				player.playSound("hit.wood")
			}), 1
		}
	}
});
export class MinecraftEffectTypes {
	static Absorption = "absorption"
	static BadOmen = "bad_omen"
	static Blindness = "blindness"
	static ConduitPower = "conduit_power"
	static Darkness = "darkness"
	static Empty = "empty"
	static FatalPoison = "fatal_poison"
	static FireResistance = "fire_resistance"
	static Haste = "haste"
	static HealthBoost = "health_boost"
	static Hunger = "hunger"
	static InstantDamage = "instant_damage"
	static InstantHealth = "instant_health"
	static Invisibility = "invisibility"
	static JumpBoost = "jump_boost"
	static Levitation = "levitation"
	static MiningFatigue = "mining_fatigue"
	static Nausea = "nausea"
	static NightVision = "night_vision"
	static Poison = "poison"
	static Regeneration = "regeneration"
	static Resistance = "resistance"
	static Saturation = "saturation"
	static SlowFalling = "slow_falling"
	static Slowness = "slowness"
	static Speed = "speed"
	static Strength = "strength"
	static VillageHero = "village_hero"
	static WaterBreathing = "water_breathing"
	static Weakness = "weakness"
	static Wither = "wither"
	static WindCharged = "wind_charged"
	static Oozing = "oozing"
	static Infested = "infested"
	static Weaving = "weaving"
}

const config = {
	armorSets: [{
		name: "Marble Armor",
		items: [{ id: "arena:marble_helmet_h", slot: EquipmentSlot.Head }, 
		{ id: "arena:marble_chestplate", slot: EquipmentSlot.Chest }, 
		{ id: "arena:marble_leggings", slot: EquipmentSlot.Legs }, 
		{ id: "arena:marble_boots", slot: EquipmentSlot.Feet }],
		effects: [{
			type: MinecraftEffectTypes.Regeneration,
			amplifier: 0,
			duration: 100000
		}]
	}],
	punch: {
		radius: 5,
		circle: {
			knockback: 7.5,
			probability: 0.1
		}
	}
};

function hasFullArmorSet(player, armorSet) {
	const equipComponent = player.getComponent(EntityEquippableComponent.componentId);
	return armorSet.items.every(item => {
		const equipment = equipComponent.getEquipment(item.slot);
		return equipment && equipment.typeId === item.id;
	});
}

world.afterEvents.entityHurt.subscribe(({ damageSource, hurtEntity }) => {
	const damagingEntity = damageSource?.damagingEntity;
	if (!damagingEntity || !(damagingEntity instanceof Entity)) return;
	if (hurtEntity?.typeId === "minecraft:player") {
		const player = hurtEntity;
		const equippedArmorSet = config.armorSets.find(armorSet => hasFullArmorSet(player, armorSet));
		if (equippedArmorSet) {
			equippedArmorSet.effects.forEach(effect => {
				player.addEffect(effect.type, effect.duration, {
					amplifier: effect.amplifier,
					showParticles: false
				});
			});
		}
	}
    if (hurtEntity?.typeId === "minecraft:player") {
        const player = hurtEntity;
        const equippedArmorSet = config.armorSets.find(armorSet => hasFullArmorSet(player, armorSet));

        if (equippedArmorSet && Math.random() < config.punch.circle.probability) {
            const { x, z } = calculateDirectionVector(damagingEntity);
            damagingEntity.applyKnockback(x, z, config.punch.circle.knockback, 0.5);
        }
    }
});

const previousStates = {};
system.runInterval(() => {
	world.getPlayers().forEach(player => {
		const playerId = player.id;
		const currentStates = {};
		config.armorSets.forEach(armorSet => {
			const isEquipped = hasFullArmorSet(player, armorSet);
			currentStates[armorSet.name] = isEquipped;
			const wasEquipped = previousStates[playerId]?.[armorSet.name] || false;
			if (isEquipped && !wasEquipped) {
				const effect = armorSet.effects[0];
				if (effect) {
					player.addEffect(effect.type, effect.duration, {
						amplifier: effect.amplifier,
						showParticles: false
					});
				}
			} else if (!isEquipped && wasEquipped) {
				const effect = armorSet.effects[0];
				if (effect) {
					player.removeEffect(effect.type);
				}
			}
		});

		previousStates[playerId] = currentStates;
	});
}, 20);

export const Weapons = [{
	id: "arena:marble_sword",
	name: "Marble Sword",
    animation: "animation.arena_marble.wind",
    animationDelay: 14,
	particle: "minecraft:wind_explosion_emitter",
	sound: "fire.fire",
	range: 8,
	damage: 0,
	applyEffects: false,
	effects: [{
		type: "minecraft:slowness",
		duration: 100,
		amplifier: 1
	}],
	strikes: 1,
	knockback: 3,
	cooldown: "cooldownsMS",
	cooldownSeconds: 8,
	isAreaEffect: false,
	areaRadius: 5
}, {
	id: "arena:marble_axe",
	name: "Marble Axe",
    animation: "animation.arena_marble.wind",
    animationDelay: 14,
	particle: "minecraft:breeze_wind_explosion_emitter",
	sound: "fire.fire",
	range: 3,
	damage: 0,
	applyEffects: false,
	effects: [{
		type: "minecraft:slowness",
		duration: 100,
		amplifier: 1
	}],
	strikes: 1,
	knockback: 5,
	cooldown: "cooldownsMA",
	cooldownSeconds: 20,
	isAreaEffect: true,
	areaRadius: 3
}, {
	id: "arena:marble_spear",
	name: "Marble Spear",
    animation: "animation.arena_marble.wind",
    animationDelay: 14,
	particle: "minecraft:breeze_wind_explosion_emitter",
	sound: "fire.fire",
	range: 3,
	damage: 0,
	applyEffects: true,
	effects: [{
		type: "minecraft:slowness",
		duration: 100,
		amplifier: 1
	}],
	strikes: 2,
	knockback: 6,
	cooldown: "cooldownsMA",
	cooldownSeconds: 25,
	isAreaEffect: true,
	areaRadius: 8
}];

const TICKS_PER_SECOND = 20;

function calculateDirectionVector(player) {
	const yaw = player.getRotation().y * (Math.PI / 180);
	return { x: -Math.sin(yaw), z: Math.cos(yaw) };
}

function getCooldown(player, item) {
	try {
		const score = getScore(player, item.cooldown);
		return typeof score === "number" ? score : 0;
	} catch (error) {
		return 0;
	}
}

function isCooldownActive(player, item) {
	return getCooldown(player, item) > 0;
}

function formatCooldownTime(cooldown) {
	return Math.ceil(cooldown / TICKS_PER_SECOND);
}

function playCooldownMessage(player, remainingCooldown, itemName) {
	player.playSound("note.bass");
	player.sendMessage(`§c${remainingCooldown}s§r: §3${itemName}§r§7`);
}
function executeWeaponSkill(player, item) {
    const { particle, sound, range, damage, applyEffects, effects, knockback, isAreaEffect, areaRadius, strikes } = item;

    const dimension = player.dimension;
    player.playSound(sound, { volume: 2 });

    for (let strike = 0; strike < strikes; strike++) {
        for (let i = 1; i <= range; i++) {
            const position = getPositionInFront(player, i);
            const particlePos = { x: position.x, y: position.y + 1.2, z: position.z };
            dimension.spawnParticle(particle, particlePos);

            const entities = dimension.getEntities({ location: position, maxDistance: isAreaEffect ? areaRadius : 1, excludeTypes: ["minecraft:player"] });

            for (const entity of entities) {
                entity.applyDamage(damage);
                if (knockback > 0) {
                    const { x, z } = calculateDirectionVector(player);
                    entity.applyKnockback(x, z, knockback, 0.5);
                }

                if (applyEffects) {
                    for (const effect of effects) {
                        entity.addEffect(effect.type, effect.duration, {
                            amplifier: effect.amplifier,
                            showParticles: false
                        });
                    }
                }
            }
        }
    }
}

function executeSkill(player, item, skillFunction) {
	if (isCooldownActive(player, item)) {
		playCooldownMessage(player, formatCooldownTime(getCooldown(player, item)), item.name);
		return;
	}
	skillFunction();
	setCooldown(player, item, secondsToTicks(item.cooldownSeconds));
}

function secondsToTicks(seconds) {
	return seconds * TICKS_PER_SECOND;
}

function setCooldown(player, item, cooldownTicks) {
	setScore(player, item.cooldown, cooldownTicks) ?? 0;
}

function getPositionInFront(player, distance) {
	const { x, y, z } = player.location;
	const direction = calculateDirectionVector(player);
	return { x: x + direction.x * distance, y: y, z: z + direction.z * distance };
}

world.afterEvents.itemUse.subscribe(({ source: player, itemStack }) => {
	const usedItem = Weapons.find(item => item.id === itemStack.typeId);
	if (!usedItem) return;
	if (isCooldownActive(player, usedItem)) {
		const remainingCooldown = formatCooldownTime(getCooldown(player, usedItem));
		playCooldownMessage(player, remainingCooldown, usedItem.name);
		return;
	} else {
		executeSkill(player, usedItem, () => {
		    player.playAnimation(usedItem.animation, {
		        stopExpression: "query.any_animation_finished"
		    });
		    system.runTimeout(() => {
		        executeWeaponSkill(player, usedItem);
		    }, usedItem.animationDelay);
		});
	}
});

system.runInterval(() => {
	Weapons.forEach(item => {
		world.getPlayers().forEach(player => {
			if (!player?.scoreboardIdentity) return;
			const currentCooldown = getScore(player, item.cooldown);
			if (currentCooldown > 0) {
				setScore(player, item.cooldown, Math.max(currentCooldown - 20, 0));
			}
		});
	});
}, 20);
