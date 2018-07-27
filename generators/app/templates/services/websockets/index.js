import Primus from 'primus'
import primusEmit from 'primus-emit'
<%_ if (socketsOnUser) { _%>
import { register as registerUserWebSocket } from '../../api/user/socket'
<%_ } _%>

// Insert sockets below
const registerFunctions = [<%_ if (socketsOnUser) { _%>registerUserWebSocket<%_ } _%>]

// On spark disconnect
const onDisconnect = spark => console.info(`WebSocket from ${spark.address.ip}:${spark.address.port} disconnected`)
// On spark connect
const onConnect = spark => {
  console.info(`WebSocket from ${spark.address.ip}:${spark.address.port} connected`)

  // Register the spark with each WebSocket event handler function in registerFunctions
  registerFunctions.forEach(registerFunction => registerFunction(spark))
}

let primus

export const broadcast = message => primus.forEach(spark => spark.emit('broadcast', message))

export default function initWebSocketServer (server) {
  primus = new Primus(server, {
    transformer: 'uws'
  })

  primus.plugin('emit', primusEmit)

  primus.on('connection', onConnect)
  primus.on('disconnection', onDisconnect)

  return primus
}
