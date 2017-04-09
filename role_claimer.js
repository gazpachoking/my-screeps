const TARGET = 'E88N74'
class Harvester extends Role {
    static get name () {
        return 'claimer';
    }

    static *creepsNeeded (room) {
        return;
        if (Game.time < 18466785 || _.get(Game, 'rooms.E88N74.controller.owner.username') == 'Gazp') {
            return
        }
        let claimers = _.filter(Game.creeps, c => c.memory.routing.targetRoom == TARGET);
        if (claimers.length < 1) {
            yield this.creepBuilder(room.energyCapacityAvailable, 'KM').addRouting(TARGET).addParts('WWCMM', 2);
        }
    }

    handle () {
        // Get to our target room first
        if (this.handleRouting()) {
            return;
        }
        this.toggleGathering();
        this.pickupDroppedEnergy();
        if (this.creep.room.controller.owner.username != 'Gazp') {
            if (this.creep.claimController(this.creep.room.controller) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(this.creep.room.controller);
            }
        }
        else {
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
                if (this.creep.upgradeController(this.creep.room.controller) == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(this.creep.room.controller)
                }
            }
        }

    }
}

module.exports = Harvester;
