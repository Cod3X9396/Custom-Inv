import {
   world
} from "@minecraft/server"
/**
* Authors:
* angelosoyt
*/



world.afterEvents.worldInitialize.subscribe(() => {
   world.gameRules.sendCommandFeedback = false;
   world.gameRules.commandBlockOutput = false;
   world.gameRules.showBorderEffect = false;
   world.gameRules.showTags = false;
   function addObjectiveIfNotExists(objectiveName, displayName) {
      const existingObjectives = world.scoreboard.getObjectives();
      const objectiveExists = existingObjectives.some(obj => obj.id === objectiveName);
      if (!objectiveExists) {
         world.scoreboard.addObjective(objectiveName, displayName);
      }
   }
   addObjectiveIfNotExists("cooldownsMS", "Cooldown");
   addObjectiveIfNotExists("cooldownsMA", "Cooldown");
   addObjectiveIfNotExists("cooldownsMSP", "Cooldown");
});


world.afterEvents.playerSpawn.subscribe((event) => {
   const player = event.player;
   if (player.type === "player") {
       const scoreboard = world.scoreboard;
       const objective = scoreboard.getObjective("cooldownsMA");
       const currentScore = objective.getScore(player) || 0;
       objective.setScore(player, currentScore + 1);
   }
});


world.afterEvents.playerSpawn.subscribe((event) => {
   const player = event.player;
   if (player.type === "player") {
       const scoreboard = world.scoreboard;
       const objective = scoreboard.getObjective("cooldownsMS");
       const currentScore = objective.getScore(player) || 0;
       objective.setScore(player, currentScore + 1);
   }
});

world.afterEvents.playerSpawn.subscribe((event) => {
   const player = event.player;
   if (player.type === "player") {
       const scoreboard = world.scoreboard;
       const objective = scoreboard.getObjective("cooldownsMSP");
       const currentScore = objective.getScore(player) || 0;
       objective.setScore(player, currentScore + 1);
   }
});





function getOrCreateObjective(objectiveId) {
   return world.scoreboard.getObjective(objectiveId) || null;
}


function getScore(player, objectiveId) {
   try {
      const objective = getOrCreateObjective(objectiveId);
      return objective ? objective.getScore(player) : 0;
   } catch (error) {
      console.error(`Error al obtener el score: ${error}`);
      return 0;
   }
}
function setScore(player, objective, value) {
   let score = world.scoreboard.getObjective(objective);
   score.setScore(player, value);
}




export { getScore, setScore };