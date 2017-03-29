module.exports = function() {
    // create a new function for StructureSpawn
    Creep.prototype.gatherEnergy =
        function() {
            let droppedEnergy = this.pos.findInRange(FIND_DROPPED_ENERGY, 1);
            if (droppedEnergy) {
                this.pickup(droppedEnergy[0]);
            }
            // find closest source
            let minEnergy = this.role=='harvester'?30:0;
            let sources = _.filter(this.room.find(FIND_MY_CREEPS), (c) => c.role == 'sourcer' && c.carry.energy > minEnergy);
            //console.log(this.name + sources.length)
            if (sources.length == 0) {
                sources = this.room.find(FIND_SOURCES_ACTIVE);
            }
            let source = this.pos.findClosestByPath(sources);
            //console.log(source);
            if (source == null && this.carry.energy > 5) {
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
    Object.defineProperty(Creep.prototype, 'energyDeficit', {get: function() {
        return this.carryCapacity - this.carry.energy;
    }});
};
