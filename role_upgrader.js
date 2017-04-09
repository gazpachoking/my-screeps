class Upgrader extends Role {
    static get name () {
        return 'upgrader';
    }

    get icon () {
        return '🏰';
    }

    static *creepsNeeded(room) {
        if (room.creepsByRole()[this.name].length < 4) {
            yield this.creepBuilder(room.energyCapacityAvailable, 'MWC').addParts('MWC', 7);
        }
    }

    // a function to run the logic for this role
    handle () {
        this.toggleGathering();
        this.pickupDroppedEnergy();
        if (this.creep.carry.energy > 0) {
            this.repairRoads();
            let controller = this.creep.pos.findInRange(this.creep.room.controller, 3);
            if (controller) {
                this.creep.upgradeController(controller);
            }
        }
        if (this.creep.memory.gathering) {
            this.gatherEnergy();
        }
        else {
            if(this.creep.upgradeController(this.creep.room.controller)==ERR_NOT_IN_RANGE) {
                this.creep.moveTo(this.creep.room.controller);
            }
        }
    }
}

module.exports = Upgrader;
