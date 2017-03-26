module.exports = {
    name: 'miner',
    createCreep: function (spawn, energy) {
        spawn.createCustomCreep(energy, this.name, [CARRY, WORK, MOVE], [WORK, WORK, CARRY]);
    },
    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.carry.energy < creep.carryCapacity / 4) {
            this.harvestEnergy(creep)
        }
        else {
            let needers = creep.pos.findInRange(FIND_CREEPS, 1,
                {filter: (c) => c != creep && c.carry.energy < c.carryCapacity});
            //console.log(needers.type);
            if (needers != undefined) {
                creep.transfer(needers[0], RESOURCE_ENERGY)
            }
            else if (creep.carry.energy < creep.carry.capacity) {
                this.harvestEnergy(creep)
            }
        }
    },
    harvestEnergy: function(creep) {
        let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
    }
};
