Room.prototype.init = function () {
    console.log('resetting room');
    this.memory.positions = {
        creep: {},
        structure: {}
    };
    this.memory.spawnQueue = [];
    // Find source mining spots
    let sources = this.find(FIND_SOURCES);
    console.log(sources);
    for (let source of sources) {
        let sourcerPos = source.pos.findValidAdjacentPos();
        console.log(sourcerPos);
        if (sourcerPos != ERR_NOT_FOUND) {
            this.memory.positions.creep[source.id] = sourcerPos;
        }
        else {
            console.log('Failed to find position adjacent to source.');
        }
    }
    this.memory.initialized = true;
};

Room.prototype.initBase = function () {
    let costMatrix = new PathFinder.CostMatrix();
    let base = {};
    let minerals = this.room.find(FIND_MINERALS);
    base.minerals = {};
    let sources = this.find(FIND_SOURCES);
    base.sources = _.map(sources, s => {return {pos: s.pos}}).keyBy(s => s.id);
    let mainSource = sources[0];
    if (sources.length > 1) {
        controller.pos.findClosestByPath(sources, {ignoreCreeps: true, ignoreRoads: true});
    }
    let upgradePath = mainSource.findPathTo(controller, {ignoreCreeps: true, ignoreRoads: true});
    base.sources[mainSource.id].sourcerPos = {x: upgradePath[0].x, y: upgradePath[0].y};
    CONTROLLER_STRUCTURES



};

Room.prototype.initSources = function () {
    let sourceDict = {};
    let sources = this.find(FIND_SOURCES);
    for (let source of sources) {
        sourceDict[source.id] = {

        }
    }

};

Room.prototype.inSpawnQueue = function (builtCreep) {
    this.memory.spawnQueue = this.memory.spawnQueue || [];
    for (let item of this.memory.spawnQueue) {
        if (!item.memory.routing) {
            continue;
        }
        let creepRouting = item.memory.routing;
        let found = builtCreep.memory.routing.targetId == creepRouting.targetId
            && builtCreep.memory.routing.targetRoom == creepRouting.targetRoom
            && builtCreep.memory.role === item.memory.role;
        if (found) {
            return true;
        }
    }
    return false;
};

Room.prototype.addToSpawnQueue = function (builtCreep) {
    builtCreep.addMemory({'base': this.name});
    // If creep with same job is already in the queue, update with new properties
    for (const [index, creep] of this.memory.spawnQueue.entries()) {
        if (builtCreep.sameJobAs(creep)) {
            this.memory.spawnQueue[index] = builtCreep;
            builtCreep = null;
            break;
        }
    }
    // If not already in the queue, add it
    if (builtCreep) {
        this.memory.spawnQueue.push(builtCreep);
    }
};

Room.prototype.findClosestSpawn = function () {
    // TODO: multi-room
    return this.find(FIND_MY_SPAWNS)[0];
};

Room.prototype.creepsByRole = function () {
    let creepsInRoom = _.filter(Game.creeps, c => c.room.name == this.name);
    let creepRoles = _.groupBy(creepsInRoom, c => c.memory.role);
    for (let r of Role.getAll()) {
        if (!(r.name in creepRoles)) {
            creepRoles[r.name] = [];
        }
    }
    //console.log(JSON.stringify(_.mapValues(creepRoles, 'length')));
    return creepRoles;
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
            if (!needed.memory.routing.targetRoom) {
                needed.addRouting(this.name);
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
    this.memory.spawnQueue = _.sortBy(this.memory.spawnQueue, 'priority').reverse();
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
    //this.memory.initialized = false;
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
        //if (creep.role.drawVisual) {
            creep.role.drawVisual(this.visual);
        //}
    }
};
