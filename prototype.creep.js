Object.defineProperty(Creep.prototype, 'role', {get: function() {
    //console.log(this);
    return Role.forCreep(this);
}});

Object.defineProperty(Creep.prototype, 'energyDeficit', {get: function() {
    if (!this.carry) {
        return 0;
    }
    return this.carryCapacity - this.carry.energy;
}});

Object.defineProperty(Creep.prototype, 'carryAmount', {get: function () {
    if (!this.carry) {
        return 0;
    }
    return _.sum(this.carry.values());
}});

// TODO: This doesn't go here
Object.defineProperty(Structure.prototype, 'energyDeficit', {get: function() {
    if (!this.energyCapacity) {
        return 0;
    }
    return this.energyCapacity - this.energy;
}});
