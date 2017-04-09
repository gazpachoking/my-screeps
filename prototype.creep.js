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


Creep.prototype.handleTasks = function () {
    if (!this.memory.tasks) {
        this.memory.tasks = ROLE_CLASS['harvester'].taskList(this.room);
    }
    let taskList = this.memory.tasks;
    let result = Task.FINISHED;
    while (result === Task.FINISHED) {
        let nextTask = Task.fromMemory(taskList[0]);
        result = nextTask.handleTask(this);
        if (result === Task.FINISHED) {
            taskList.push(taskList.shift());
        }
    }
};
