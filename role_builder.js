class Builder extends Role {
    static get name () {
        return 'builder'
    }

    static *creepsNeeded (room) {
        let constructionInRoom = _.sum(room.find(FIND_CONSTRUCTION_SITES), s => s.progressTotal - s.progress);
        if (constructionInRoom == 0) {
            return;
        }
        let newCreep = this.creepBuilder(room.energyCapacityAvailable, 'WCM').addParts('WCM', 7);
        let workParts = _.filter(newCreep.bodyParts, p => p == WORK).length;
        //console.log(workParts);
        // Totally arbitrary guess, probably needs scaled based on worker power
        let numBuilders = Math.ceil((constructionInRoom / 2500) / workParts);
        if (room.creepsByRole()[this.name].length < numBuilders) {
            yield this.creepBuilder(room.energyCapacityAvailable, 'WCM').addParts('WCM', 7);
        }
    }

    handle () {
        this.toggleGathering();
        if (this.creep.carry.energy > 0) {
            this.repairRoads();
            let constructionSites = this.creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 3);
            if (constructionSites.length > 0) {
                this.creep.build(constructionSites[0]);
            }
        }
        if (this.creep.memory.gathering) {
            this.gatherEnergy();
        }
        else {
            let site = this.creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if (site) {
                if (this.creep.build(site) == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(site);
                }
            }
            else {
                // If builders run out of work before they die, turn them into upgraders.
                let controller = this.creep.room.controller;
                if (this.creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(controller);
                }
            }
        }
    }
}

module.exports = Builder;
