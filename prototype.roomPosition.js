RoomPosition.prototype.isValid = function() {
    // Check we are in bounds (and not an exit)
    if (this.x <= 1 || this.x >= 48 || this.y <= 1 || this.y >= 48) {
        return false;
    }
    // Check we aren't a wall
    if (Game.map.getTerrainAt(this) == 'wall') {
        return false;
    }
    // Check there isn't a creep stationed here
    let room = Game.rooms[this.roomName];
    for (let creepId in room.memory.positions.creep) {
        let pos = room.memory.positions.creep[creepId];
        if (this.isEqualTo(pos.x, pos.y)) {
            return false;
        }
    }
    // All checks pass
    return true;
};

RoomPosition.prototype.findValidAdjacentPos = function() {
    //delete this.memory.position;
    //console.log(this.findAdjacent().next());

    return _.find([...this.findAdjacent()], p => p.isValid());
};

RoomPosition.prototype.findAdjacent = function* () {
    for (let xOffset of [-1, 0, 1]) {
        for (let yOffset of [-1, 0, 1]) {
            if (xOffset == 0 && yOffset == 0) {
                continue;
            }
            let newPos = new RoomPosition(this.x + xOffset, this.y + yOffset, this.roomName);
            if (Game.map.getTerrainAt(newPos) !== 'wall') {
                yield newPos;
            }
        }
    }

};
