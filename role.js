let CreepBuilder = require('creep_builder');

class Role {
    static register(subclass) {
        ROLES[subclass.name] = subclass;
    }

    static creepBuilder (energyAvailable, minParts) {
        return new CreepBuilder(energyAvailable, minParts, {role: this.name, gathering: true});
    }

    /**
     *
     * @param {Room} room
     */
    static creepNeeded (room) {
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
        if (this.creep.pos.x == targetPos.x && this.creep.pos.y == targetPos.y) {
            return false;
        }
        this.creep.moveTo(targetPos.x, targetPos.y);
        return true;
    }

    pickupDroppedEnergy() {
        let droppedEnergy = this.creep.pos.findInRange(FIND_DROPPED_ENERGY, 1);
        if(droppedEnergy) {
            this.creep.pickup(droppedEnergy[0]);
        }
    }

    toggleGathering () {
        if (this.creep.carry.energy > this.creep.carryCapacity * 0.99) {
            this.creep.memory.gathering = false;
        }
        if (this.creep.carry.energy == 0) {
            this.creep.memory.gathering = true;
        }
    }

    gatherEnergy () {
        let droppedEnergy = this.creep.pos.findInRange(FIND_DROPPED_ENERGY, 1);
        if (droppedEnergy) {
            this.creep.pickup(droppedEnergy[0]);
        }
        // look for sourcers
        let sources = _.filter(this.creep.room.find(FIND_MY_CREEPS), (c) => c.role == 'sourcer' && c.carry.energy > 10);
        let source = this.pos.findClosestByPath(sources);
        //console.log(source);
        if (source == null && this.creep.carry.energy > 10) {
            this.memory.working = true;
            return;
        }
        //console.log(this.name + source);
        // try to harvest energy, if the source is not in range
        let result = this.harvest(source);
        if (result < 0) {
            // move towards the source
            return this.moveTo(source);
        }
        return result;
    }
}

// Load all our role files
global.Role = Role;
let roleFiles = ['builder', 'harvester', 'miner', 'repairer', 'sourcer', 'upgrader', 'wallRepairer'];
global.ROLES = [];
global.ROLE_CLASS = {};
for (let r of roleFiles) {
    let rollClass = require('role.' + r);
    ROLE_CLASS[rollClass.name] = rollClass;
    ROLES.push(rollClass.name);
}
