module.exports = function() {
    // create a new function for StructureSpawn
    Creep.prototype.gatherEnergy =
        function() {
            // find closest source
            let minEnergy = this.role=='harvester'?30:0;
            let sources = _.filter(creepsByRole.miner, (c) => c.carry.energy > minEnergy);
            //console.log(this.name + sources.length)
            if (sources.length == 0) {
                sources = this.room.find(FIND_SOURCES_ACTIVE);
            }
            let source = this.pos.findClosestByPath(sources);
            if (source == null && this.carry.energy > 5) {
                this.memory.working = true;
            }
            //console.log(this.name + source);
            // try to harvest energy, if the source is not in range
            let result = this.harvest(source);
            if (result < 0) {
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
        if (this.spawning) {
            return;
        }

        ROLE_MODULES[this.role].run(this);
    };
    Object.defineProperty(Creep.prototype, 'energyDefecit', {get: function() {
        return this.carryCapacity - this.carry.energy;
    }});
};
