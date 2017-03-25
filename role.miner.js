module.exports = {
    name: 'miner',
    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.carry.energy < creep.carryCapacity / 4) {
            this.harvestEnergy(creep)
        }
        else {
            let needers = creep.pos.findInRange(FIND_CREEPS, 1, {filter: (c) => c.carry.energy < c.carryCapacity});
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
