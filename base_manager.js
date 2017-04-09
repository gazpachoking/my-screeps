Source.prototype.pickupAvailable = function () {
    let energy = _.sum(source.sourcers, s => Game.getObjectById(s.id).carry.energy);
    energy += _.sum(pos.findInRange(FIND_DROPPED_ENERGY, 1), e => e.amount);
};

class SourceManager {
    constructor (room) {
        this.room = room;
        if (!room.memory.sources) {
            let sourceList = {};
            let sources = room.find(FIND_SOURCES);
            for (let source of sources) {
                let sourceInfo = {
                    pos: source.pos,
                    id: source.id,
                    genRate: source.energyCapacity / ENERGY_REGEN_TIME,
                    slots: [source.pos.findAdjacent()],
                    sourcers: {},
                    harvesters: {},
                    scheduledOut: {}
                };
            }
        }
        this.sources = room.memory.sources;
    }

    energyAt (source, futureTicks=0) {
        let pos = new RoomPosition(source.pos.x, source.pos.y, source.pos.roomName);
        Source
    }


}
