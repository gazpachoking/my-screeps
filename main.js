// import modules
require('prototype.spawn')();
require('prototype.creep')();
require('prototype.room');
require('prototype.roomPosition');
global.ROLES = ['harvester', 'upgrader', 'builder', 'repairer', 'wallRepairer', 'miner', 'sourcer'];
global.ROLE_MODULES = {};
for (let r of ROLES) {
    ROLE_MODULES[r] = require('role.' + r);
}
global.creepsByRole = _.groupBy(Game.creeps, 'role');
// for (let c in creepsByRole) {
//     console.log(c + ': ' + creepsByRole[c].length);
// }

module.exports.loop = function () {
    // check for memory entries of died creeps by iterating over Memory.creeps
    for (let name in Memory.creeps) {
        // and checking if the creep is still alive
        if (Game.creeps[name] == undefined) {
            let c = Memory.creeps[name];
            // if not, delete the memory entry
            //console.log(name + ', level ' + c.level.toFixed(1) + ' ' + c.role + ' has died.');
            delete Memory.creeps[name];
            global.creepsByRole = _.groupBy(Game.creeps, 'role');
        }
    }
    for (let roomName in Game.rooms) {
        let room = Game.rooms[roomName];
        //console.log(room);
        room.run();
    }
    // // for every creep name in Game.creeps
    // for (let creepName in Game.creeps) {
    //     // get the creep object
    //     let creep = Game.creeps[creepName];
    //     creep.run();
    // }
    //
    // let towers = Game.rooms.E89N74.find(FIND_STRUCTURES, {
    //     filter: (s) => s.structureType == STRUCTURE_TOWER
    // });
    // for (let tower of towers) {
    //     let target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    //     if (target != undefined) {
    //         tower.attack(target);
    //     }
    // }
    //
    // for (let spawnName in Game.spawns){
    //     Game.spawns[spawnName].doSpawn();
    // }
};
