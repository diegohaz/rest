import UserEvents, { events } from './events'

export const register = spark => events.forEach(event => {
  const listener = createListener(`user:${event}`, spark)
  UserEvents.on(`user:${event}`, listener)
  spark.on('end', removeListener(`user:${event}`, listener))
})

const createListener = (event, spark) => doc => spark.emit(event, doc)
const removeListener = (event, listener) => () => UserEvents.removeListener(event, listener)
