Room.prototype.init = function () {
    this.memory.positions = {
        creep: [],
        structure: {}
    };
    // Find source mining spots
    let sources = this.find(FIND_SOURCES);
    for (let source of sources) {
        let sourcerPos = source.findValidAdjacentPos();
        if (sourcerPos != ERR_NOT_FOUND) {
            this.memory.positions.creep.push(sourcerPos);
        }
        else {
            console.log('Failed to find position adjacent to source.');
        }
    }
};

Room.prototype.run = function () {
    // run the creeps in the room
    for (let creep of this.find(FIND_MY_CREEPS)) {
        creep.run();
    }
    // check for hostiles and handle them
    let hostiles = this.find(FIND_HOSTILE_CREEPS);
    if (hostiles) {
        let towers = this.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_TOWER
        });
        for (let tower of towers) {
            let target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (target != undefined) {
                tower.attack(target);
            }
        }
    }
    // do spawning
    for (let spawn of this.find(FIND_MY_SPAWNS)){
        spawn.doSpawn();
    }

};
