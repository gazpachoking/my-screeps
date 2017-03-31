Room.prototype.init = function () {
    console.log('resetting room');
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
            this.memory.position.creep[source.id] = sourcerPos;
        }
        else {
            console.log('Failed to find position adjacent to source.');
        }
    }
    this.memory.initialized = true;
};

Room.prototype.inSpawnQueue = function (builtCreep) {
    this.memory.spawnQueue = this.memory.spawnQueue || [];
    for (let item of this.memory.spawnQueue) {
        if (!item.memory.routing) {
            continue;
        }
        let creepTarget = {
            targetId: item.memory.routing.targetId,
            targetRoom: item.memory.routing.targetRoom
        };
        let found = _.eq(builtCreep.memory.routing, creepTarget) && builtCreep.memory.role === item.memory.role;
        if (found) {
            return true;
        }
    }
    return false;
};

Room.prototype.addToSpawnQueue = function (builtCreep) {
    builtCreep.addMemory({'base': this.name});
    if (this.inSpawnQueue(builtCreep)) {
        return false;
    }
    this.memory.spawnQueue.push(builtCreep);
    return true;
};

Room.prototype.findClosestSpawn = function () {
    // TODO: multi-room
    return this.find(FIND_MY_SPAWNS)[0];
};

Room.prototype.creepsByRole = function () {
    let creepsSpawning = _(this.find(FIND_MY_SPAWNS)).map(s => s.spawning && Game.creeps[s.spawning.name]).compact().value();
    let creeps = this.find(FIND_MY_CREEPS).concat(...creepsSpawning);
    let creepNums = _.countBy(creeps, c => c.memory.role);
    for (let r of Role.getAll()) {
        if (!r.name in creepNums) {
            creepNums[r.name] = 0;
        }
    }
    return creepNums;
};

Room.prototype.handleTowers = function () {
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
};

// Check if the room needs any creeps spawned. Adds them to spawn queue if so.
Room.prototype.handleNeededCreeps = function () {
    for (let roleClass of Role.getAll()) {
        for (let needed of roleClass.creepsNeeded(this)) {
            if (!needed.valid) {
                console.log('non valid needed: ' + JSON.stringify(needed));
                continue;
            }
            this.addToSpawnQueue(needed);
        }
    }
};

Room.prototype.handleSpawning = function () {
    if (this.memory.spawnQueue.length == 0) {
        return false;
    }
    let availableSpawns = _.filter(this.find(FIND_MY_SPAWNS), s => !s.spawning);
    if (availableSpawns.length == 0) {
        return false;
    }
    this.memory.spawnQueue = _.sortBy(this.memory.spawnQueue, 'priority');
    let newCreep = this.memory.spawnQueue[0];
    for (let spawn of availableSpawns) {
        let result = spawn.createCreep(newCreep.bodyParts, undefined, newCreep.memory);
        if (_.isString(result)) {
            console.log('Spawning new ' + newCreep.memory.role + ' creep: ' + result);
            Game.creeps[result].memory.born = Game.time;
            this.memory.spawnQueue.shift();
        }
    }
    return true;
};

Room.prototype.handle = function () {
    if (!this.memory.initialized) {
        this.init();
    }
    this.handleTowers();
    if (Game.time % 5 == 0) {
        this.handleNeededCreeps();
    }
    this.handleSpawning();

    // run the creeps in the room
    for (let creep of this.find(FIND_MY_CREEPS)) {
        creep.role.handle();
    }
};
