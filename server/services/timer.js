var util    = require('util'),
    events  = require('events')
    _       = require('underscore');

// ---------------------------------------------
// Constructor
// ---------------------------------------------
function timer() {
    if(false === (this instanceof timer)) {
        return new timer();
    }

    this.second = 1000;
    this.time = 60*this.second;
    this.interval = undefined;

    events.EventEmitter.call(this);

    // Use Underscore to bind all of our methods
    // to the proper context
    _.bindAll.apply(_, [this].concat(_.functions(this)));
};

// ---------------------------------------------
// Inherit from EventEmitter
// ---------------------------------------------
util.inherits(timer, events.EventEmitter);

// ---------------------------------------------
// Methods
// ---------------------------------------------
timer.prototype.start = function() {
    if (this.interval) {
        return;
    }

    console.log('Starting timer!');
    // note the use of _.bindAll in the constructor
    // with bindAll we can pass one of our methods to
    // setInterval and have it called with the proper 'this' value
    this.interval = setInterval(this.onTick, this.second);
    this.emit('start:timer');
};

timer.prototype.stop = function() {
    console.log('Stopping timer!');
    if (this.interval) {
        clearInterval(this.interval);
        this.interval = undefined;
        this.emit('stop:timer');
    }
};

timer.prototype.reset = function() {
    console.log('Resetting timer!');
    this.time = 60*this.second;
    this.emit('reset:timer', this.formatTime(this.time));
};

timer.prototype.onTick = function() {
    this.time -= this.second;

    var formattedTime = this.formatTime(this.time);
    this.emit('tick:timer', formattedTime);
    
    if (this.time === 0) {
        this.emit('timer:out');
        this.stop();
    }
};

timer.prototype.formatTime = function(time) {

    return time / 1000;
};

timer.prototype.getTime = function() {
    return this.formatTime(this.time);
};

// ---------------------------------------------
// Export
// ---------------------------------------------
module.exports = timer;