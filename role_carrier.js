class Carrier extends Role {
    static get name () {
        return 'carrier';
    }

    static *creepsNeeded (room) {
        let sources = room.find(FIND_SOURCES);
        let carriers = room.creepsByRole().carrier;

        for (let source of sources) {
            let carrier = _.find(carriers, c => c.memory.routing.targetId == source.id);
            if (carrier !== undefined) {
                if (!(carrier.memory.timeToTarget && carrier.memory.timeToTarget >= carrier.ticksToLive)) {
                    continue;
                }
            }
            yield this.creepBuilder(room.energyCapacityAvailable, 'WCM')
                .addParts('MCC', 4)
                .addRouting(room.name, source.id)
                .setPriority(2);
        }
    }

    handle () {
        this.toggleGathering();
        this.pickupDroppedEnergy();
        // Go to target source for gathering
        if (this.creep.memory.gathering) {
            this.handleRouting();
            return;
        }
        let needers = this.creep.pos.findInRange(FIND_MY_CREEPS, 1,
            {filter: (c) => c.memory.role != this.name && c.memory.role != 'sourcer' && c.energyDeficit >= 1});
        let structures = this.creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {filter: s => s.energy < s.energyCapacity});
        if (structures) {
            needers = needers.concat(structures);
        }
        if (needers.length > 0) {
            this.creep.transfer(needers[0], RESOURCE_ENERGY);
        }
        if (this.creep.transfer(this.creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(this.creep.room.storage);
        }
    }
}

module.exports = Carrier;
