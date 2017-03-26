const ROLE_PRIORITIES = ['harvester', 'miner', 'builder', 'repairer', 'upgrader', 'wallRepairer'];
const ROLE_BALANCE = {
    harvester: {min:2, max: 2, required: true},
    upgrader: {min:1, max: 2},
    builder: {min:1, max:100},
    repairer: {min:1, max:2},
    wallRepairer: {min:0, max:0},
    miner: {min:2, max:2}
};

module.exports = function() {
    // create a new function for StructureSpawn
    StructureSpawn.prototype.createCustomCreep =
        function(energy, roleName, minParts, upgradeParts) {
            minParts = minParts || [WORK, CARRY, MOVE];
            upgradeParts = upgradeParts || [CARRY, MOVE, WORK];
            let level = 0;
            energy -= this.bodyCost(minParts);
            while (energy > 0) {
                for (let p of upgradeParts) {
                    if (energy >= BODYPART_COST[p]) {
                        minParts.push(p);
                        level += 1 / upgradeParts.length;
                        energy -= BODYPART_COST[p];
                    }
                    else {
                        energy = 0;
                        break;
                    }
                }
            }
            let name = this.createCreep(minParts, undefined, {role: roleName, working: false, level: level});
            if (!(name <= 0)) {
                console.log('Spawning new level ' + level.toFixed(1) + ' ' + roleName +' creep: ' + name);
                global.creepsByRole = _.groupBy(Game.creeps, 'role');
            }
            return name;
        };
    StructureSpawn.prototype.bodyCost = function (parts) {
        return _.sum(parts, p => BODYPART_COST[p])
    };
    StructureSpawn.prototype.doSpawn = function () {
        // count the number of creeps alive for each role
        // _.sum will count the number of properties in Game.creeps filtered by the
        //  arrow function, which checks for the creep being a harvester
        roleNumbers = {};
        for (let creepName in Game.creeps) {
            c = Game.creeps[creepName];
            roleNumbers[c.role] = (roleNumbers[c.role] || 0) + 1
        }
        let name = 0;
        let energy = this.room.energyCapacityAvailable;
        for (let roleName of ROLE_PRIORITIES) {
            let roleNum = _.get(creepsByRole[roleName], 'length', 0);
            let roleBalance = ROLE_BALANCE[roleName];
            if (roleNum < roleBalance.min) {
                //console.log(roleName + ' needed');
                if (roleNum == 0 && _.get(roleBalance, 'required', false)) {
                    // spawn one with what is available
                    return ROLE_MODULES[roleName].createCreep(this, this.room.energyAvailable);
                }
                if (this.room.energyAvailable < energy) {
                    return ERR_NOT_ENOUGH_ENERGY;
                }
                return ROLE_MODULES[roleName].createCreep(this, energy);
            }
        }
        // After minimums are filled
        if (this.room.energyAvailable < this.room.energyCapacityAvailable) {
            return ERR_NOT_ENOUGH_ENERGY;
        }
        return ROLE_MODULES.builder.createCreep(this, this.room.energyCapacityAvailable);
    }
};
