module.exports = function() {
    // create a new function for StructureSpawn
    Creep.prototype.gatherEnergy =
        function() {
            // find closest source
            let source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
            // try to harvest energy, if the source is not in range
            let result = this.harvest(source);
            if (result == ERR_NOT_IN_RANGE) {
                // move towards the source
                return this.moveTo(source);
            }
            return result;
        };
};