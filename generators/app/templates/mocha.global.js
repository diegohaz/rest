import app from './'
import mongoose from 'mongoose'

after((done) => {
  mongoose.connection.close()
  mongoose.connection.on('close', () => {
    app.server.close()
  })
  app.server.on('close', () => done())
})
