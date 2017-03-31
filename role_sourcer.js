class Sourcer extends Role {
    static get name () {
        return 'sourcer';
    }

    static *creepsNeeded (room) {
        let sources = room.find(FIND_SOURCES);

        for (let source of sources) {
            let sourcers = room.find(FIND_MY_CREEPS, {filter:
                (c) => c.memory.role == 'sourcer' && c.memory.routing.targetId == source.id});
            if (sourcers.length == 0) {
                yield this.creepBuilder(room.energyCapacityAvailable, 'WCM')
                    .addParts('WC', 4).addParts('C', 2)
                    .addRouting(room.name, source.id)
                    .setPriority(1);
            }
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
