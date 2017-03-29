module.exports = {
    name: 'harvester',
    createCreep: function (spawn, energy) {
        return spawn.createCustomCreep(energy, this.name, [MOVE, WORK, CARRY], [CARRY, MOVE]);
    },
    // a function to run the logic for this role
    run: function(creep) {
        // if creep is harvesting energy but is full
        if (creep.carry.energy > 0) {
            let fillable = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
                // the second argument for findClosestByPath is an object which takes
                // a property called filter which can be a function
                // we use the arrow operator to define it
                filter: (s) => (s.structureType == STRUCTURE_SPAWN
                             || s.structureType == STRUCTURE_EXTENSION
                             || s.structureType == STRUCTURE_TOWER)
                             && s.energy < s.energyCapacity
            });
            if (fillable.length == 0) {
                fillable = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
                    filter: (s) => s.structureType == STRUCTURE_STORAGE && s.energy < s.energyCapacity
                });
            }
            if (fillable.length == 0) {
                fillable = creep.pos.findInRange(FIND_MY_CREEPS, 1, {
                    // the second argument for findClosestByPath is an object which takes
                    // a property called filter which can be a function
                    // we use the arrow operator to define it
                    filter: (c) => (c.memory.role != 'sourcer' &&
                                    c.memory.role != 'harvester')
                                 && c.energyDeficit > 0
                });
            }
            if (fillable.length > 0) {
                creep.transfer(fillable[0], RESOURCE_ENERGY);
            }
        }
        if (creep.carry.energy == creep.carryCapacity) {
            // switch state
            creep.memory.working = true;
        }
        // if creep is bringing energy to a structure but has no energy left
        if (creep.carry.energy == 0) {
            // switch state
            creep.memory.working = false;
        }
        // if creep is supposed to transfer energy to a structure
        if (creep.memory.working) {
            // find closest spawn, extension or tower which is not full
            var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                // the second argument for findClosestByPath is an object which takes
                // a property called filter which can be a function
                // we use the arrow operator to define it
                filter: (s) => (s.structureType == STRUCTURE_SPAWN
                             || s.structureType == STRUCTURE_EXTENSION
                             || s.structureType == STRUCTURE_TOWER)
                             && s.energy < s.energyCapacity
            });

            // if we found one
            if (!structure && creep.room.storage) {
                // TODO: check storage capacity?
                structure = creep.room.storage;
            }
            if (structure != undefined) {
                // try to transfer energy, if it is not in range
                if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(structure);
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            creep.gatherEnergy();
        }
    }
};
