let PARTS_LOOKUP = {
      M: MOVE,
      C: CARRY,
      A: ATTACK,
      W: WORK,
      R: RANGED_ATTACK,
      T: TOUGH,
      H: HEAL,
      K: CLAIM,
};

/**
 *
 * @param {string} partString
 * @return
 */
function partLookup(partString) {
    let parts = _.map(partString, (p) => PARTS_LOOKUP[p]);
    let cost = _.sum(parts, (p) => BODYPART_COST[p]);
    return {cost: cost, parts: parts};
}

class CreepBuilder {
    /**
     *
     * @param {number} energyAvailable
     * @param {string} minParts
     * @param {object} memory
     */
    constructor (energyAvailable, minParts, memory) {
        this.energyAvailable = energyAvailable;
        this.cost = 0;
        this.bodyParts = [];
        this.memory = {routing: {}, level: 0, gathering: true};
        this.addMemory(memory);
        if (minParts) {
            this.addParts(minParts, 1);
        }
        this.priority = 0;
    }

    get energyLeft () {
        return this.energyAvailable - this.cost;
    }

    get valid () {
        return this.bodyParts.length > 0 && this.energyLeft >= 0;
    }

    /**
     *
     * @param {string} parts String representing parts to add.
     * @param {number} maxRepeat How many times this parts list can repeat given energy available.
     */
    addParts (parts, maxRepeat=1) {
        let partsInfo = partLookup(parts);
        for (let i of _.range(maxRepeat)) {
            if (partsInfo.cost <= this.energyLeft) {
                this.cost += partsInfo.cost;
                this.bodyParts.push(...partsInfo.parts);
                this.memory.level++;
            }
        }
        return this;
    }

    addMemory (mem) {
        _.merge(this.memory, mem);
        return this;
    }

    addRouting (targetRoom, targetId) {
        this.addMemory({routing: {targetRoom: targetRoom, targetId: targetId}});
        return this;
    }

    setPriority (val) {
        this.priority = val;
        return this;
    }

    get spawnTime () {
        return this.bodyParts.length * 3;
    }
}

module.exports = CreepBuilder;
