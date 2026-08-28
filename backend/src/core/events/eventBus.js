const EventEmitter = require("events");

/** Event emitter used as the application's in-process event bus. */
class EventBus extends EventEmitter {}

module.exports = new EventBus();