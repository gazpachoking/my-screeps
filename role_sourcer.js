class Sourcer extends Role {
    static get name () {
        return 'sourcer';
    }

    static creepFor(source) {
        let workPartsNeeded = Math.ceil(source.energyCapacity / 600);
        let newCreep = this.creepBuilder(source.room.energyCapacityAvailable, 'WM');
        newCreep.addParts('W', workPartsNeeded - 1);
        newCreep.addParts('C', 7); // consider max?
        return newCreep
    }

    static *creepsNeeded (room) {
        let sources = room.find(FIND_SOURCES);
        let sourcers = room.creepsByRole().sourcer;

        for (let source of sources) {
            let assigned = _.filter(sourcers, c => c.memory.routing.targetId == source.id);
            if (assigned.length > 1) {
                continue;
            }
            if (assigned.length == 1) {
                if (!(assigned[0].memory.timeToTarget && assigned[0].memory.timeToTarget >= assigned[0].ticksToLive)) {
                    continue;
                }
            }
            yield this.creepBuilder(room.energyCapacityAvailable, 'WCM')
                .addParts('WC', 4).addParts('C', 2)
                .addRouting(room.name, source.id)
                .setPriority(3);
        }
    }

    handle () {
        this.pickupDroppedEnergy();
        let sources = this.creep.pos.findInRange(FIND_SOURCES_ACTIVE, 1);
        if (sources.length > 0) {
            this.creep.harvest(sources[0]);
        }
        if (this.creep.carry.energy > 0) {
            let needers = this.creep.pos.findInRange(FIND_MY_CREEPS, 1,
                {filter: (c) => c.memory.role != this.name && c.energyDeficit >= 1});
            if (needers.length > 0) {
                let needer = _.max(needers, 'energyDeficit');
                this.creep.transfer(needer, RESOURCE_ENERGY);
            }
        }
        this.handleRouting();
    }
}

module.exports = Sourcer;
