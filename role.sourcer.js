module.exports = {
    name: 'sourcer',
    creepStats: {
        prefix: [MOVE, WORK, CARRY],
        repeat: [WORK, CARRY],
    },
    createCreep: function (spawn, energy) {
        return spawn.createCustomCreep(energy, this.name, [CARRY, WORK, MOVE], [WORK, CARRY]);
    },
    run: function(creep) {
        if (!this.doRouting(creep)) {
            // Always harvest the source
            let source = Game.getObjectById(creep.memory.routing.targetId);
            creep.harvest(source);
            // Always pickup dropped energy in range
            let droppedEnergy = creep.pos.findInRange(FIND_DROPPED_ENERGY, 1);
            if(droppedEnergy) {
                creep.pickup(droppedEnergy[0]);
            }
            if (creep.carry.energy > 0) {
                let needers = creep.pos.findInRange(FIND_CREEPS, 1,
                    {filter: (c) => c.role != this.name && c.energyDeficit >= 1});
                if (needers && needers.length > 0) {
                    let needer = _.max(needers, 'energyDeficit');
                    creep.transfer(needer, RESOURCE_ENERGY);
                }
            }

        }
    },
    doRouting: function(creep) {
        if (!creep.memory.routing) {
            console.log('No routing for creep!');
            return true;
        }
        // TODO: multiple room routing
        let targetId = creep.memory.routing.targetId;
        let targetSource = Game.getObjectById(targetId);
        let standPos = creep.room.memory.positions.creep[targetId];
        //todo multiroom
        if (creep.pos.x == standPos.x && creep.pos.y == standPos.y) {
            return false;
        }
        creep.moveTo(standPos.x, standPos.y);
        return true;
    }
};
