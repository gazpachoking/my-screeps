const TASK_NAMES = ['MovePos', 'MoveFind'];
const TASK_CLASSES = {};


const RETURN_VALUES = {
    FINISHED: 'finished',
    UNFINISHED: 'unfinished',
    ROLLBACK: 'rollback'
};


class Task {
    constructor () {
    }

    static fromMemory (state) {
        //console.log(JSON.stringify(state.name));
        if (state instanceof Object) {
            return Object.setPrototypeOf(state, TASK_CLASSES[state.name].prototype);
        }
    }

    /**
     * Subclasses can access return values easily from here
     * @return {{FINISHED: string, UNFINISHED: string, ROLLBACK: string}}
     */
    static get rv () {
        return RETURN_VALUES;
    }
}


class TaskList extends Array {
    static fromMemory (state) {
        if (state instanceof Array) {
            return Object.setPrototypeOf(state, TaskList.prototype);
        }
    }

    runTasks () {
        let result = Task.FINISHED;
        while (result === Task.FINISHED) {
            let nextTask = Task.fromMemory(this[0]);
            if (nextTask === undefined) {
                return Task.FINISHED;
            }
            else if (nextTask instanceof Array) {

            }
            result = nextTask.handleTask(this);
            if (result === Task.FINISHED) {
                taskList.push(taskList.shift());
            }
        }
    }
}

// Allow easy access to subclasses and return values
let proxyHandler = {
    get: function(target, name) {
        if (name in TASK_CLASSES) {
            return TASK_CLASSES[name];
        }
        else if (name in RETURN_VALUES) {
            return RETURN_VALUES[name];
        }
        else {
            return target[name];
        }
    }
};

const TaskProxy = new Proxy(Task, proxyHandler);


global.Task = TaskProxy;


for (let taskName of TASK_NAMES) {
    TASK_CLASSES[taskName] = require('task' + taskName);
}

module.exports = TaskProxy;
