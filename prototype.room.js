Room.prototype.init = function () {
    this.memory.positions = {
        creep: {},
        structure: {}
    };
    this.memory.spawnQueue = [];
    // Find source mining spots
    let sources = this.find(FIND_SOURCES);
    for (let source of sources) {
        let sourcerPos = source.findValidAdjacentPos();
        if (sourcerPos != ERR_NOT_FOUND) {
            this.memory.positions.creep[source.id] = sourcerPos;
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

Room.prototype.genCreepMem = function(role, targetId, targetRoom, level, base) {
    return {
        role: role,
        routing: {
            targetRoom: targetRoom || this.name,
            targetId: targetId,
        },
        level: level,
        base: base,
        working: false,
    };
};

Room.prototype.inQueue = function (creepMemory) {
    this.memory.spawnQueue = this.memory.spawnQueue || [];
    for (let item of this.memory.queue) {
        if (!item.routing) {
            continue;
        }
        let creepTarget = {
            targetId: item.routing.targetId,
            targetRoom: item.routing.targetRoom
        };
        let found = _.eq(creepMemory.routing, creepTarget) && creepMemory.role === item.role;
        if (found) {
            return true;
        }
    }
    return false;
};

Room.prototype.spawnCreep = function (role, targetId, targetRoom, level, base) {
    let newCreep = this.genCreepMem(role, targetId, targetRoom, level, base);
    if (this.inQueue(newCreep)) {
        return false;
    }
    this.memory.spawnQueue.push(newCreep);
    return true;
};

Room.prototype.checkCreepsNeeded = function () {
    // spawn creep for each source
    let sources = this.find(FIND_SOURCES);

    let source;

    let isSourcer = function(object) {
        if (object.memory.role !== 'sourcer') {
            return false;
        }
        if (object.memory.routing && object.memory.routing.targetId !== source.id) {
          return false;
        }
        if (object.memory.routing && object.memory.routing.targetRoom !== source.pos.roomName) {
          return false;
        }
        return true;
    };

    for (source of sources) {
        let sourcers = this.find(FIND_MY_CREEPS, {filter: isSourcer});
        if (sourcers.length === 0) {
            this.spawnCreep('sourcer', source.id, this.name);
        }
    }

};
