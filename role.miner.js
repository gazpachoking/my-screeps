module.exports = {
    name: 'miner',
    createCreep: function (spawn, energy) {
        return spawn.createCustomCreep(energy, this.name, [CARRY, WORK, MOVE], [WORK, CARRY]);
    },
    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.carry.energy > 25) {
            let needers = creep.pos.findInRange(FIND_CREEPS, 1,
                {filter: (c) => c.role != this.name && c.energyDefecit >= 10});
            if (needers && needers.length > 0) {
                for (let needer of needers) {
                    creep.transfer(needer, RESOURCE_ENERGY);
                }
            }
        }
        if (creep.carry.energy < creep.carryCapacity) {
            this.harvestEnergy(creep)
        }
    },
    harvestEnergy: function(creep) {
        let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
    }
};
