import http from 'http'
import { env, mongo, port, ip } from './config'
import mongoose from './config/mongoose'
import express from './config/express'
import routes from './routes'

const app = express(routes)
const server = http.createServer(app)

mongoose.connect(mongo.uri)

setImmediate(() => {
  server.listen(port, ip, () => {
    console.log('Express server listening on http://%s:%d, in %s mode', ip, port, env)
  })
})

export default app
