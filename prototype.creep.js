module.exports = function() {
    // create a new function for StructureSpawn
    Creep.prototype.gatherEnergy =
        function() {
            // find closest source
            let miner = this.pos.findClosestByPath(_.filter(creepsByRole.miner, (c) => c.carry.energy > 8));
            if (miner != null) {
                //console.log('going to miner');
                return this.moveTo(miner);
            }
            let source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            // try to harvest energy, if the source is not in range
            let result = this.harvest(source);
            if (result == ERR_NOT_IN_RANGE) {
                // move towards the source
                return this.moveTo(source);
            }
            return result;
        };
    Object.defineProperty(Creep.prototype, 'role', {get: function() {
        //console.log(this);
        return this.memory.role;
    }});
    Creep.prototype.run = function () {
        ROLE_MODULES[this.role].run(this);
    };
    Object.defineProperty(Creep.prototype, 'energyDefecit', {get: function() {
        return this.carryCapacity - this.carry.energy;
    }});
}
