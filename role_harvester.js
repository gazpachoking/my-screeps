class Harvester extends Role {
    static get name () {
        return 'harvester';
    }

    static *creepsNeeded (room) {
        let numCreeps = room.creepsByRole();
        if (numCreeps.harvester.length <= 1) {
            let energyAllowance = numCreeps.harvester.length === 0 ? room.energyAvailable : room.energyCapacityAvailable;
            let newCreep = this.creepBuilder(energyAllowance, 'MWC').addRouting(room.name).setPriority(5);
            newCreep.addParts('MWC', 4);
            // If we are down to one harvester, spawn a new one before he dies
            if (numCreeps.harvester.length === 1) {
                let bufferTime = newCreep.spawnTime;
                //let currentSpawnTime = _.min(room.spawns, (s) => room.spawns[s].spawning ? room.spawns[s].spawning.remainingTime : 0);
                //console.log(bufferTime + ' ' + currentSpawnTime);
                //bufferTime += currentSpawnTime;
                if (numCreeps.harvester[0].ticksToLive > bufferTime) {
                    return;
                }
            }
            yield newCreep;
        }
    }

    static taskList (room) {
        return [
            new Task.MovePos({x:4,y:4}),
            new Task.MovePos({x:9,y:9})
        ];
    }
}

module.exports = Harvester;
