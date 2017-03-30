module.exports = {
    name: 'sourcer',
    creepStats: {
        prefix: [MOVE, WORK, CARRY],
        repeat: [WORK, CARRY],
    },
    createCreep (spawn, energy) {
        return spawn.createCustomCreep(energy, this.name, [CARRY, WORK, MOVE], [WORK, CARRY]);
    },
    run (creep) {
        if (!this.doRouting(creep)) {
            // Always harvest the source
            let source = Game.getObjectById(creep.memory.routing.targetId);
            creep.harvest(source);
            // Always pickup dropped energy in range
            let droppedEnergy = creep.pos.findInRange(FIND_DROPPED_ENERGY, 1);
            if(droppedEnergy) {
                creep.pickup(droppedEnergy[0]);
            }
            if (creep.carry.energy > 0) {
                let needers = creep.pos.findInRange(FIND_MY_CREEPS, 1,
                    {filter: (c) => c.role != this.name && c.energyDeficit >= 1});
                if (needers && needers.length > 0) {
                    let needer = _.max(needers, 'energyDeficit');
                    creep.transfer(needer, RESOURCE_ENERGY);
                }
            }

        }
    },
    doRouting (creep) {
        if (!creep.memory.routing) {
            console.log('No routing for creep!');
            return true;
        }
        // TODO: multiple room routing
        let targetId = creep.memory.routing.targetId;
        let targetSource = Game.getObjectById(targetId);
        let standPos = creep.room.memory.positions.creep[targetId];
        //todo multiroom
        if (creep.pos.x == standPos.x && creep.pos.y == standPos.y) {
            return false;
        }
        creep.moveTo(standPos.x, standPos.y);
        return true;
    }
};

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

    run () {
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

Role.register(Sourcer);
