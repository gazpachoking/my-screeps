/**
 * Moves to a specific target position.
 */
class MovePos extends Task {
    constructor (target, range=1) {
        super();
        this.name = 'MovePos';
        this.target = target;
        this.range = range;
    }

    handleTask(creep) {
        if (creep.pos.inRangeTo(this.target.x, this.target.y, this.range)) {
            return Task.FINISHED;
        }
        creep.moveTo(this.target.x, this.target.y);
        return Task.UNFINISHED;
    }
}

module.exports = MovePos;
