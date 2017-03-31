class Harvester extends Role {
    static get name () {
        return 'harvester';
    }

    static *creepsNeeded (room) {
        let numCreeps = room.creepsByRole();
        if (numCreeps.harvester < 2) {
            let energyAllowance = numCreeps.harvester == 0 ? room.energyAvailable : room.energyCapacityAvailable;
            let newCreep = this.creepBuilder(energyAllowance, 'MWC').addRouting(room.name).setPriority(2);
            if (numCreeps.sourcer > 0) {
                newCreep.addParts('MC', 5);
            } else {
                newCreep.addParts('MWC', 4);
            }
            yield newCreep;
        }
    }

    handle () {
        // Get to our target room first
        if (this.handleRouting()) {
            return;
        }
        this.toggleGathering();
        this.pickupDroppedEnergy();
        // Harvester's primary job is to make sure we can spawn creeps
        let roomNeedsEnergy = this.creep.room.energyAvailable < this.creep.room.energyCapacityAvailable;
        if (roomNeedsEnergy && this.creep.carry.energy > 0) {
            let structures = this.creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
                filter: (s) => (s.structureType == STRUCTURE_SPAWN
                             || s.structureType == STRUCTURE_EXTENSION)
                             && s.energy < s.energyCapacity
            });
            if (structures) {
                this.creep.transfer(structures[0], RESOURCE_ENERGY);
            }
        }
        if (this.creep.memory.gathering) {
            let source = this.creep.pos.findClosestByPath(FIND_MY_CREEPS,
                {filter: c => c.memory.role == 'sourcer' && c.carry.energy > 20});
            if (source) {
                this.creep.moveTo(source);
                return;
            }
            source = this.creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            if (source) {
                if (this.creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(source);
                }
                return;
            }
            let storage = this.creep.room.storage;
            if (roomNeedsEnergy && storage && storage.store[RESOURCE_ENERGY] > 0) {
                if (this.creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(storage);
                }
                return;
            }
        }
        else {
            let structure = this.creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_SPAWN
                             || s.structureType == STRUCTURE_EXTENSION)
                             && s.energy < s.energyCapacity
            });
            if (!structure) {
                structure = this.creep.room.storage;
            }
            if (this.creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(structure);
            }
        }
    }
}

module.exports = Harvester;
