module.exports = {
    name: 'miner',
    createCreep: function (spawn, energy) {
        return spawn.createCustomCreep(energy, this.name, [CARRY, WORK, MOVE], [WORK, CARRY]);
    },
    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.carry.energy > 25) {
            let needers = creep.pos.findInRange(FIND_CREEPS, 1,
                {filter: (c) => c.role != this.name && c.energyDefecit >= 1});
            if (needers && needers.length > 0) {
                needer = _.min(needers)
                needer = _.max(needers, 'energyDefecit');
                //for (let needer of needers) {
                    creep.transfer(needer, RESOURCE_ENERGY);
                //}
            }
        }
        if (creep.carry.energy < creep.carryCapacity) {
            this.harvestEnergy(creep)
        }
    },
    harvestEnergy: function(creep) {
        if (!creep.memory.target) {

            let sources = creep.room.find(FIND_SOURCES);
            let otherMiners = _.get(creepsByRole, 'miner', []);
            for (c of otherMiners) {
                if (c.memory.target) {
                    let i = sources.indexOf(c.memory.target);
                    if (i != -1) {
                        sources.splice(i, 1);
                    }
                }
            }
            let target = creep.pos.findClosestByPath(sources);
            if (target) {
                creep.memory.target = target.id;
            }
            else {
                return;
            }
        }
        let target = Game.getObjectById(creep.memory.target);
        if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }
};
