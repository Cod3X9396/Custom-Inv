import { world, system } from "@minecraft/server";
import { Vector } from "./Vector3";
import { ElytraModel } from "./elytra";

const Dimensions = [
    world.getDimension("minecraft:overworld"),
    world.getDimension("minecraft:nether"),
    world.getDimension("minecraft:the_end")
];

let elytra_velocity_buffer ={};
let player_jump_state_buffer = {};
let air_start_duration = {};
let is_gliding = {};
let start_glide_tick = {};
let player_hit_elytra = {};
let gliding_tick_modulo = {};

let player_elytra_use_rocket = {};
let player_elytra_model = {};
let gliding_data = {}

let elytra_trigger_data = {
	tags: new Set([]),
	chestplate: new Set([])
}

let registered_player_using_elytra = [];

system.afterEvents.scriptEventReceive.subscribe(s=>{
    if(s.id == "arena:register_tag"){
        if(!elytra_trigger_data.tags.has(s.message)) elytra_trigger_data.tags.add(s.message);
    }else if(s.id == "arena:register_chestplate"){
        if(!elytra_trigger_data.chestplate.add(s.message)) elytra_trigger_data.chestplate.add(s.message);
    }else if(s.id == "arena:remove_tag"){
        elytra_trigger_data.tags.delete(s.message);
    }else if(s.id == "arena:remove_chestplate"){
        elytra_trigger_data.chestplate.delete(s.message);
    }
}, { namespaces: [ "ena" ]});

let is_alive = [];

world.getPlayers().forEach(player => is_alive.push(player.id));

world.afterEvents.playerSpawn.subscribe(s =>{
	is_alive.push(s.player.id);
})

world.afterEvents.entityDie.subscribe(s =>{
	is_alive.pop(s.deadEntity.id);
}, { entityTypes: [ "minecraft:player" ]})

system.runInterval(()=>{
    Dimensions.forEach(dimension=>{
        dimension.getEntities({type: "arena:elytra_render"}).forEach(entity =>{
            if(!entity.hasComponent("minecraft:riding")){
				entity.remove();
			}
        })
    })
	for(let playerData of world.getPlayers()){
		if(!is_alive.includes(playerData.id)) continue;
		let equippable = playerData.getComponent("minecraft:equippable");
		let body = equippable.getEquipment("Chest");
		let has_elytra = false;
		let has_body_elytra = (body != undefined) ? body.typeId == "minecraft:elytra" : false;
		let broken_elytra = false;

		if(body != undefined){
			has_elytra = body.hasTag("arena:fly") || elytra_trigger_data.chestplate.has(body.typeId);
			let durability = body.getComponent("minecraft:durability");
			if(durability && durability.damage >= durability.maxDurability) broken_elytra = true;
		}
		if(!has_elytra){
		    has_elytra = playerData.hasTag("minecraft:elytra_body");
		    if(has_elytra){
		        // Ya no usamos NoveltyManager, intentamos detectar si lleva un item con esa tag
		        let equippable = playerData.getComponent("minecraft:equippable");
		        let chest = equippable?.getEquipment("Chest");
		        if(chest){
		            let durability = chest.getComponent("minecraft:durability");
		            if(durability && durability.damage >= durability.maxDurability) broken_elytra = true;
		        }
		    }
		}else{
			has_body_elytra = true;
		}

		if(!has_elytra){
			has_elytra = playerData.getTags().some(tag => elytra_trigger_data.tags.has(tag));
		}

		if(has_elytra){
			if(!registered_player_using_elytra.includes(playerData.id)) registered_player_using_elytra.push(playerData.id);
		}else{
			if(registered_player_using_elytra.includes(playerData.id)) registered_player_using_elytra.pop(playerData.id);
		}

		if(is_gliding[playerData.id] && playerData.getGameMode() != "creative" && (has_body_elytra || (!has_body_elytra && playerData.hasTag("minecraft:elytra_body")))){
			if(system.currentTick % 20 == gliding_tick_modulo[playerData.id]){
				let back = equippable.getEquipment("Chest");
				let flight_item = back.clone();
				let durability = flight_item.getComponent("minecraft:durability");
				if(durability.damage < durability.maxDurability){
					let enchantment = flight_item.getComponent("minecraft:enchantable");
					let unbreaking = enchantment ? enchantment.getEnchantment("unbreaking") : {level: 0};
					if(unbreaking){
						if(Math.random() < durability.getDamageChance(unbreaking.level) / 100) durability.damage += 1;
					}else{
						durability.damage += 1;
					}
					has_body_elytra ? equippable.setEquipment("Chest", flight_item) : back.setItem(flight_item);
				}
			}
		}
		if(is_gliding[playerData.id] && !has_elytra){
			delete is_gliding[playerData.id];
		}
		let press_jump = false;
		if(player_jump_state_buffer[playerData.id] != playerData.isJumping){
			player_jump_state_buffer[playerData.id] = playerData.isJumping;
			if(player_jump_state_buffer[playerData.id]) press_jump = true;
		}

		if(playerData.isOnGround){
			if(air_start_duration[playerData.id] != undefined) delete air_start_duration[playerData.id];
			if(is_gliding[playerData.id]){
				delete is_gliding[playerData.id];
				// playerData.applyDamage(Math.floor(player_hit_elytra[playerData.id]), { cause: "flyIntoWall" });
				player_hit_elytra[playerData.id] = 0;
			}
		}else{
			if(air_start_duration[playerData.id] == undefined) air_start_duration[playerData.id] = system.currentTick;
		}
		if(playerData.isFlying || broken_elytra) delete is_gliding[playerData.id];

		if(playerData.isInWater){
			if(is_gliding[playerData.id]){
				delete is_gliding[playerData.id];
			}
		}

		if(player_elytra_model[playerData.id]){
			if(!player_elytra_model[playerData.id].isValid()){
				delete player_elytra_model[playerData.id];
			}else{
				if(playerData.isSneaking){
					player_elytra_model[playerData.id].setProperty("arena:sneaking", true);
				}else{
					player_elytra_model[playerData.id].setProperty("arena:sneaking", false);
				}
				if(is_gliding[playerData.id]){
					player_elytra_model[playerData.id].setProperty("arena:gliding", true);
				}else{
					player_elytra_model[playerData.id].setProperty("arena:gliding", false);
				}
				if(playerData.isSleeping){
					player_elytra_model[playerData.id].setProperty("arena:sleeping", true);
				}else{
					player_elytra_model[playerData.id].setProperty("arena:sleeping", false);
				}
				if(playerData.isSwimming){
					player_elytra_model[playerData.id].setProperty("arena:swimming", true);
				}else{
					player_elytra_model[playerData.id].setProperty("arena:swimming", false);
				}
				player_elytra_model[playerData.id].setProperty("arena:y_rot", Math.min(1.0, Math.max(-1.0, playerData.getVelocity().y)));
			}
		}

		if(registered_player_using_elytra.includes(playerData.id)){
			if(body == undefined || body.typeId != "minecraft:elytra"){
				if(system.currentTick > air_start_duration[playerData.id] && press_jump && !playerData.isFlying && !playerData.isInWater){
					if(is_gliding[playerData.id]){
						if(playerData.getGameMode() != "creative") is_gliding[playerData.id] = false;
					}else{
						if(!broken_elytra){
							is_gliding[playerData.id] = true;
							player_hit_elytra[playerData.id] = 0;
							gliding_data[playerData.id] = new ElytraModel(Vector.multiply(playerData.getVelocity(), 0.25), playerData);
							start_glide_tick[playerData.id] = 0.0;
							elytra_velocity_buffer[playerData.id] = { x: 0, y: 0, z: 0 };
							gliding_tick_modulo[playerData.id] = system.currentTick % 20;
						}
					}
				}
				if(!has_body_elytra && playerData.hasTag("minecraft:elytra_body")){
					if(player_elytra_model[playerData.id] == undefined){
						let rideable = playerData.getComponent("minecraft:rideable");
						let has_elytra = false;
						let riders = rideable.getRiders();
						if(playerData.getDynamicProperty("has_temporary_elytra")){
							if(Vector.getLength(playerData.getVelocity()) > 0.01){
								playerData.setDynamicProperty("has_temporary_elytra");
							}
							has_elytra = true;
						}
		
						if(!has_elytra) for(let ride of riders){
							if(ride.typeId == "arena:elytra_render"){
								player_elytra_model[playerData.id] = ride;
								has_elytra = true;
								break;
							}
						}
						if(!has_elytra){
							if(riders.length == 0 || riders.length < 2){
								let entity = playerData.dimension.spawnEntity("arena:elytra_render", playerData.location);
								rideable.addRider(entity);
								player_elytra_model[playerData.id] = entity;
								// console.warn("spawn")
							}
						}
					}
				}else{
					if(player_elytra_model[playerData.id]){
						player_elytra_model[playerData.id].remove();
						delete player_elytra_model[playerData.id];
					}
				}
			}else{
				if(player_elytra_model[playerData.id]){
					player_elytra_model[playerData.id].remove();
					delete player_elytra_model[playerData.id];
				}
				if(is_gliding[playerData.id]){
					delete is_gliding[playerData.id];
				}
			}
		}else{
			if(player_elytra_model[playerData.id]){
				player_elytra_model[playerData.id].remove();
				delete player_elytra_model[playerData.id];
			}
			if(is_gliding[playerData.id]){
				delete is_gliding[playerData.id];
			}
		}

		if(is_gliding[playerData.id]){
			if(!player_elytra_use_rocket[playerData.id]){
				if(playerData.isJumping && playerData.getGameMode() == "creative") gliding_data[playerData.id].velY += 0.1;
				let momentum = start_glide_tick[playerData.id];
				let rotation = playerData.getRotation();
				let velocity = playerData.getVelocity();
				
				let d = Vector.normalize(velocity).subtract(Vector.normalize({x: gliding_data[playerData.id].velX, y: gliding_data[playerData.id].velY, z: gliding_data[playerData.id].velZ})).length();

				let momentum_modifier = Math.abs(Vector.toRotation(velocity).y - rotation.y)/720;
				gliding_data[playerData.id].tick(playerData.getGameMode() == "creative", rotation.y / 180 * Math.PI, rotation.x / 180 * Math.PI);
				playerData.applyKnockback(gliding_data[playerData.id].velX + velocity.x * 0.1, gliding_data[playerData.id].velZ + velocity.z * 0.1, 1, gliding_data[playerData.id].velY* 0.709 + velocity.y * 0.07);

				
				gliding_data[playerData.id].velX += velocity.x * 0.005;
				gliding_data[playerData.id].velZ += velocity.z * 0.00127;	
				gliding_data[playerData.id].velY += velocity.y * 0.005;	

				// velocity = Vector.normalize(velocity);
				// gliding_data[playerData.id].velX += velocity.x * 0.0125;
				// gliding_data[playerData.id].velZ += velocity.z * 0.0125;	
				// gliding_data[playerData.id].velY += velocity.y * 0.00125;	

				// if(velocity.y > 0.0){
				// 	player_hit_elytra[playerData.id] = 0;
				// }else{
				// 	velocity = Vector.normalize(velocity);
				// 	player_hit_elytra[playerData.id] = player_hit_elytra[playerData.id] * 0.75 + Math.max(Math.pow(velocity.y*1.15, 2)*25, 0.0)*0.25;
				// }

				// playerData.addEffect("slow_falling", 1, { showParticles: false});
				if(velocity.y >= -0.25)playerData.addEffect("slow_falling", 1, { showParticles: false});
				// console.warn(d)
				// gliding_data[playerData.id].velX /= 1.0 + d;
				// gliding_data[playerData.id].velY /= 1.0 + d;
				// gliding_data[playerData.id].velZ /= 1.0 + d;

				if(start_glide_tick[playerData.id] < 1.0) start_glide_tick[playerData.id] = Math.min(start_glide_tick[playerData.id] + 0.05, 1.0);
				// start_glide_tick[playerData.id] /= momentum_modifier;
				// console.warn(momentum_modifier)
				// console.warn(player_hit_elytra[playerData.id])
			}
			playerData.playAnimation("animation.elytra.move", {
				controller: "elytra_move",
				blendOutTime: 0.1,
				nextState: "",
				stopExpression: "true"
			});
			if(player_elytra_model[playerData.id]) player_elytra_model[playerData.id].playAnimation("animation.elytra.move.model", {
				controller: "elytra_move",
				blendOutTime: 0.1,
				nextState: "",
				stopExpression: "true"
			});
		}else{
			if(gliding_data[playerData.id] != undefined){
				delete gliding_data[playerData.id];
				playerData.playAnimation("animation.elytra.move", {
					controller: "elytra_move",
					blendOutTime: 0.5
				})
			}
		}
		// console.warn(playerData.getVelocity().y)
	};
});

world.afterEvents.playerJoin.subscribe(s =>{
	player_jump_state_buffer[s.playerId] = false;
})

world.getPlayers().forEach(playerData => {
	player_jump_state_buffer[playerData.id] = false;
});

world.beforeEvents.playerLeave.subscribe(s =>{
	if(player_elytra_model[s.player.id]){
		try{
			player_elytra_model[s.player.id].remove();
			delete player_elytra_model[s.player.id];
		}catch(err){
			s.player.setDynamicProperty("has_temporary_elytra", true);
			// console.warn("added entity to temporary");
		}
	}
})

world.afterEvents.itemUse.subscribe(s =>{
	if(s.itemStack.typeId == "minecraft:firework_rocket" && is_gliding[s.source.id]){
		s.source.dimension.playSound("firework.launch", s.source.location);

		if(s.source.getGameMode() != "creative"){
			let equippable = s.source.getComponent("minecraft:equippable");
			let mainhand = equippable.getEquipmentSlot("Mainhand");
			if(s.itemStack.amount > 1){
				mainhand.amount -= 1;
			}else{
				mainhand.setItem();
			}
		}

		let run_id = system.runInterval(()=>{
			try{
				if(!is_gliding[s.source.id] || s.source.isOnGround || s.source.isInWater){
					system.clearRun(run_id);
					return;
				}

				// let direction = Vector.multiply(s.source.getViewDirection(), 2);

				// gliding_data[s.source.id].velX = direction.x;
				// gliding_data[s.source.id].velZ = direction.z;	
				// gliding_data[s.source.id].velY = direction.y;	
				
				let direction = Vector.divide(s.source.getViewDirection(), 10);

				gliding_data[s.source.id].velX += direction.x;
				gliding_data[s.source.id].velZ += direction.z;	
				gliding_data[s.source.id].velY += direction.y;	

				// gliding_data[s.source.id].velocity = direction;

				// s.source.applyKnockback(direction.x, direction.z, 1, direction.y*0.667);
				// player_elytra_use_rocket[s.source.id] = true;
				if(system.currentTick % 2 == 0) s.source.dimension.spawnParticle("arena:feather", s.source.location);
			}catch(error){
				system.clearRun(run_id);
			}
		});

		system.runTimeout(()=>{
			player_elytra_use_rocket[s.source.id] = false;
			system.clearRun(run_id);
		}, 25);
	}
})