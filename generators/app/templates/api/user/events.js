import { EventEmitter } from 'events'
var UserEvents = new EventEmitter()

// Set max event listeners (0 == unlimited)
UserEvents.setMaxListeners(0)

// Model events
export const events = ['save', 'remove']

// Register the event emitter to the model events
const registerEvents = User => events.forEach(event => User.post(event, emitEvent(event)))
const emitEvent = event => doc => UserEvents.emit(`user:${event}`, doc)

export {registerEvents}
export default UserEvents
