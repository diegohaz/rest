import http from 'http'
import { env, mongo, port, ip, apiRoot } from './config'
import mongoose from './services/mongoose'
import express from './services/express'
<%_ if (sockets) { _%>
import initWebSocketServer from './services/websockets'
<%_ } _%>
import api from './api'

const app = express(apiRoot, api)
const server = http.createServer(app)
<%_ if (sockets) { _%>
const primus = initWebSocketServer(server)
app.primus = primus
<%_ } _%>

if (mongo.uri) {
  mongoose.connect(mongo.uri)
}
mongoose.Promise = Promise

setImmediate(() => {
  server.listen(port, ip, () => {
    console.log('Express server listening on http://%s:%d, in %s mode', ip, port, env)
  })
})

export default app
