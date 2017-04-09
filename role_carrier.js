class Carrier extends Role {
    static get name () {
        return 'carrier';
    }

    get icon () {
        return '🚚';
    }

    static *creepsNeeded (room) {
        if (!room.storage) {
            return;
        }
        let sources = room.find(FIND_SOURCES);
        let carriers = room.creepsByRole().carrier;

        for (let source of sources) {
            let assigned = _.filter(carriers, c => c.memory.routing.targetId == source.id);
            if (assigned.length > 1) {
                continue;
            }
            if (assigned.length == 1) {
                if (!(assigned[0].memory.timeToTarget && assigned[0].memory.timeToTarget >= assigned[0].ticksToLive)) {
                    continue;
                }
            }
            yield this.creepBuilder(room.energyCapacityAvailable, 'CWM')
                .addParts('MCC', 3)
                .addRouting(room.name, source.id)
                .setPriority(2);
        }
    }

    handle () {
        this.toggleGathering();
        this.pickupDroppedEnergy();
        if (this.creep.carry.energy > 0) {
            this.repairRoads();
            let needers = this.creep.pos.findInRange(FIND_MY_CREEPS, 1,
                {filter: (c) => c.memory.role != this.name && c.memory.role != 'sourcer' && c.energyDeficit >= 1});
            let structures = this.creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter: s => s.energy < s.energyCapacity});
            if (structures) {
                needers = needers.concat(structures);
            }
            if (needers.length > 0) {
                this.creep.transfer(_.max(needers, 'energyDeficit'), RESOURCE_ENERGY);
            }
            if (needers.length > 1) {
                // Don't move if there are multiple things here to supply
                return;
            }
        }
        // Go to target source for gathering
        if (this.creep.memory.gathering) {
            // Make sure they don't move into the sourcer's position
            if (!this.handleRouting()) {
                this.creep.cancelOrder('move');
            }
            return;
        }
        if (this.creep.transfer(this.creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(this.creep.room.storage);
        }
    }
}

module.exports = Carrier;
