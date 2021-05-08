import { EventEmitter } from 'events'
var <%= pascal %>Events = new EventEmitter()

// Set max event listeners (0 == unlimited)
<%= pascal %>Events.setMaxListeners(0)

// Model events
export const events = ['save', 'remove']

// Register the event emitter to the model events
const registerEvents = <%= pascal %> => events.forEach(event => <%= pascal %>.post(event, emitEvent(event)))
const emitEvent = event => doc => <%= pascal %>Events.emit(`<%= camel %>:${event}`, doc)

export { registerEvents }
export default <%= pascal %>Events
