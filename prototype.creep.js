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

// TODO: This doesn't go here
Object.defineProperty(Structure.prototype, 'energyDeficit', {get: function() {
    if (!this.energyCapacity) {
        return 0;
    }
    return this.energyCapacity - this.energy;
}});
