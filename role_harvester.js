class Harvester extends Role {
    static get name () {
        return 'harvester';
    }

    static *creepsNeeded (room) {
        let numCreeps = room.creepsByRole();
        if (numCreeps.harvester.length <= 1) {
            let energyAllowance = numCreeps.harvester.length == 0 ? room.energyAvailable : room.energyCapacityAvailable;
            let newCreep = this.creepBuilder(energyAllowance, 'MWC').addRouting(room.name).setPriority(5);
            if (numCreeps.sourcer.length > 0) {
                newCreep.addParts('MC', 4);
            } else {
                newCreep.addParts('MWC', 4);
            }
            // If we are down to one harvester, spawn a new one before he dies
            if (numCreeps.harvester.length == 1) {
                let bufferTime = newCreep.spawnTime;
                //let currentSpawnTime = _.min(room.spawns, (s) => room.spawns[s].spawning ? room.spawns[s].spawning.remainingTime : 0);
                //console.log(bufferTime + ' ' + currentSpawnTime);
                //bufferTime += currentSpawnTime;
                if (numCreeps.harvester[0].ticksToLive > bufferTime) {
                    return;
                }
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
        if (this.creep.carry.energy > 0) {
            this.repairRoads();
        }
        if (this.creep.memory.gathering) {
            if (!this.gatherEnergy()) {
                let source = this.creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                if (source) {
                    if (this.creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        this.creep.moveTo(source);
                    }
                }
            }
        }
        else {
            let structure = this.creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_SPAWN
                             || s.structureType == STRUCTURE_EXTENSION)
                             && s.energy < s.energyCapacity
            });
            if (!structure) {
                structure = this.creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_TOWER && s.energy < s.energyCapacity
                });
            }
            if (this.creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(structure);
            }
        }
    }
}

module.exports = Harvester;
