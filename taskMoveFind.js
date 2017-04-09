/**
 * Runs a function to retrieve a target, then moves to that target once.
 */
class MoveFind extends Task.MovePos {
    constructor (findModule, findFunc, range=1) {
        super(undefined, range);
        this.name = 'MoveFind';
        this.findModule = findModule;
        this.findFunc = findFunc;
    }

    handleTask(creep) {
        if (this.target === undefined) {
            let findModule = require(this.findModule);
            this.target = findModule[this.findFunc](creep);
        }
        let rv = super.handleTask(creep);
        // Clear the target once we reach our location, so a new one is found next time.
        if (rv === Task.FINISHED) {
            this.target = undefined;
        }
        return rv;
    }
}


module.exports = MoveFind;
