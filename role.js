let CreepBuilder = require('creep_builder');
let roleFiles = ['harvester', 'sourcer', 'upgrader', 'carrier', 'builder'];

global.ROLE_CLASS = {};

class Role {
    /**
     * Returns instantiated subclass of Role for a specific creep.
     * @param {creep} creep
     * @return {Role}
     */
    static forCreep(creep) {
        let roleClass = ROLE_CLASS[creep.memory.role];
        if (!roleClass) {
            roleClass = Role;
        }
        return new roleClass(creep);
    }

    static getAll () {
        return _.values(ROLE_CLASS);
    }

    static creepBuilder (energyAvailable, minParts) {
        return new CreepBuilder(energyAvailable, minParts, {role: this.name, gathering: true});
    }

    /**
     *
     * @param {Room} room
     */
    static *creepsNeeded (room) {
        return false;
    }

    /**
     * @param {Creep} creep
     */
    constructor(creep) {
        this.creep = creep;
        this.name = creep.memory.role;
    }

    get routing() {
        return this.creep.memory.routing;
    }

    handleRouting() {
        if (!this.routing) {
            console.log('No routing for creep!');
            return true;
        }
        if (this.routing.targetId) {
            return this.handleTargetRouting();
        }
        return this.handleRoomRouting();
    }

    handleRoomRouting() {
        if (this.creep.room.name === this.routing.targetRoom) {
            return false;
        }
        let exit = this.creep.room.findExitTo(this.routing.targetRoom);
        this.creep.moveTo(exit);
        return true;
    }

    handleTargetRouting() {
        if (this.handleRoomRouting()) {
            return true;
        }
        // Move to target location
        let targetPos = this.creep.room.memory.positions.creep[this.routing.targetId];
        this.creep.moveTo(targetPos.x, targetPos.y);
        if (this.creep.pos.isNearTo(targetPos.x, targetPos.y)) {
            if (this.creep.memory.timeToTarget === undefined) {
                this.creep.memory.timeToTarget = Game.time - this.creep.memory.born;
            }
            return false;
        }
        return true;
    }

    pickupDroppedEnergy() {
        let droppedEnergy = this.creep.pos.findInRange(FIND_DROPPED_ENERGY, 1);
        if(droppedEnergy) {
            this.creep.pickup(droppedEnergy[0]);
        }
    }

    toggleGathering () {
        let carrying = _.sum(this.creep.carry);
        if (carrying > this.creep.carryCapacity * 0.97) {
            this.creep.memory.gathering = false;
        }
        if (carrying < this.creep.carryCapacity * 0.03) {
            this.creep.memory.gathering = true;
        }
    }

    gatherEnergy () {
        let source;
        if (this.creep.room.storage && this.creep.room.storage.store[RESOURCE_ENERGY] > 0) {
            source = this.creep.room.storage;
        }
        else {
            let sources = _.filter(this.creep.room.find(FIND_MY_CREEPS), (c) => c.memory.role == 'sourcer' && c.carry.energy > 10);
            source = this.creep.pos.findClosestByPath(sources);
        }
        if (source) {
            if (this.creep.withdraw(source, RESOURCE_ENERGY) < 0) {
                this.creep.moveTo(source);
            }
            return true;
        }
        return false;
    }

    repairRoads () {
        let roads = this.creep.pos.findInRange(FIND_STRUCTURES, 1, {filter:
            s => s.structureType == STRUCTURE_ROAD && s.hits <= (s.hitsMax - REPAIR_POWER)});
        //console.log(roads);
        if (roads.length > 0) {
            this.creep.repair(_.min(roads, r => r.hits));
        }
    }

    /**
     * Main entry into role, called for every creep with that role every tick.
     * Must be overridden by Role subclasses.
     */
    handle () {
        console.log(this.creep.memory.role + ' is not valid role for ' + this.creep.name);
    }
}

global.Role = Role;
// Load all our role files
for (let r of roleFiles) {
    let roleClass = require('role_' + r);
    global.ROLE_CLASS[roleClass.name] = roleClass;
}
