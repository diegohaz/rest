import <%= pascal %>Events, { events } from './events'

export const register = spark => events.forEach(event => {
  const listener = createListener(`<%= camel %>:${event}`, spark)
  <%= pascal %>Events.on(`<%= camel %>:${event}`, listener)
  spark.on('end', removeListener(`<%= camel %>:${event}`, listener))
})

const createListener = (event, spark) => doc => spark.emit(event, doc)
const removeListener = (event, listener) => () => <%= pascal %>Events.removeListener(event, listener)
