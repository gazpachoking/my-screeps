Room.prototype.init = function () {
    this.memory.position = {
        creep: {},
        structure: {}
    };
    this.memory.spawnQueue = [];
    // Find source mining spots
    let sources = this.find(FIND_SOURCES);
    for (let source of sources) {
        let sourcerPos = source.pos.findValidAdjacentPos();
        if (sourcerPos != ERR_NOT_FOUND) {
            this.memory.positions.creep[source.id] = sourcerPos;
        }
        else {
            console.log('Failed to find position adjacent to source.');
        }
    }
    this.memory.initialized = true;
};

Room.prototype.run = function () {
    if (!this.memory.initialized) {
        this.init();
    }
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
    if (Game.time % 5 == 0) {
        this.checkCreepsNeeded();
    }
    if (this.memory.spawnQueue.length > 0) {
        let spawn = this.findClosestSpawn();
        // TODO: This only spawns when room is full of energy right now. We might not want/need all of it.
        if (spawn.room.energyAvailable >= spawn.room.energyCapacityAvailable) {
            // TODO: Sort spawnqueue by priority
            let newCreep = this.memory.spawnQueue[0];
            let name = ROLE_MODULES[newCreep.role].createCreep(spawn, spawn.room.energyAvailable);
            if (_.isString(name)) {
                Game.creeps[name].memory = newCreep;
                this.memory.spawnQueue.shift();
                return;
            }
        }
    }
    // TODO: Remove this old spawn code
    if ((Game.time - 1) % 5 == 0) {
        for (let spawn of this.find(FIND_MY_SPAWNS)) {
            spawn.doSpawn();
        }
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
    for (let item of this.memory.spawnQueue) {
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

Room.prototype.queueCreepSpawn = function (role, targetId, targetRoom, level, base) {
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
        if (object.role !== 'sourcer') {
            return false;
        }
        if (object.routing && object.routing.targetId !== source.id) {
          return false;
        }
        if (object.routing && object.routing.targetRoom !== source.pos.roomName) {
          return false;
        }
        return true;
    };

    for (source of sources) {
        let sourcers = _(Memory.creeps).filter(isSourcer).value();
        //console.log(JSON.stringify(sourcers));
        if (sourcers.length === 0) {
            this.queueCreepSpawn('sourcer', source.id, this.name);
        }
    }

};

Room.prototype.findClosestSpawn = function () {
    // TODO: multi-room
    return this.find(FIND_MY_SPAWNS)[0];
};

Room.prototype.creepsByRole = function () {
    let defaults = _.mapValues(ROLES, (...x) => 0);
    return _.assign(defaults, _.countBy(this.find(FIND_MY_CREEPS), c => c.memory.role));
};

Room.prototype.handleTowers () {
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
}

// Check if the room needs any creeps spawned. Adds them to spawn queue if so.
Room.prototype.handleNeededCreeps () {
    for (roleName, roleClass in ROLE_CLASS) {
        for (let needed in roleClass.creepsNeeded(this)) {
            // TODO: Make this real
            this.addToSpawnQueue(needed);
        }
    }
}

Room.prototype.handleSpawning () {
    if (this.room.memory.spawnQueue.length == 0) {
        return false;
    }

    let availableSpawns = _.filter(this.find(FIND_MY_SPAWNS), s => !s.spawning);
    if (availableSpawns.length == 0) {
        return false;
    }
    this.memory.spawnQueue = _.sortBy(this.memory.spawnQueue, 'priority');
    for (let spawn in availableSpawns) {
        spawn.createCustomCreep(this.memory.spawnQueue.shift());
    }
    return true;
}

Room.prototype.handle () {
    this.handleTowers();
    this.handleNeededCreeps();
    this.handleSpawning(); // todo make it

    // run the creeps in the room
    for (let creep of this.find(FIND_MY_CREEPS)) {
        creep.role.handle();
    }

}
