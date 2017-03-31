// import modules
require('prototype.room');
require('prototype.creep');
require('prototype.roomPosition');
require('role');

module.exports.loop = function () {
    // check for memory entries of died creeps by iterating over Memory.creeps
    for (let name in Memory.creeps) {
        // and checking if the creep is still alive
        if (Game.creeps[name] == undefined) {
            let c = Memory.creeps[name];
            // if not, delete the memory entry
            console.log(name + ' has died.');
            delete Memory.creeps[name];
        }
    }
    // Handle all of our rooms
    for (let roomName in Game.rooms) {
        let room = Game.rooms[roomName];
        //console.log(room);
        room.handle();
    }
};
