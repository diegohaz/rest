import mongoose, { Schema } from 'mongoose'
import mongooseKeywords from 'mongoose-keywords'
import { uid } from 'rand-token'
import moment from 'moment'

const SessionSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    index: true
  },
  token: {
    type: String,
    unique: true,
    index: true,
    default: () => uid(32)
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date
})

SessionSchema.pre('save', function (next) {
  this.expiresAt = moment().add(1, 'month').toDate()
  next()
})

SessionSchema.methods = {
  view (full) {
    return full ? {
      user: this.user.view(),
      token: this.token
    } : {
      user: this.user.view()
    }
  },

  expired () {
    return moment().isSameOrAfter(this.expiresAt)
  },

  updateExpirationTime (done) {
    return this.save(done)
  }
}

SessionSchema.statics = {
  login (token) {
    const Session = mongoose.model('Session')

    return Session.findOne({ token }).populate('user').then((session) => {
      if (!session) throw new Error('Invalid session')

      if (session.expired()) {
        session.remove()
        throw new Error('Session has expired')
      }

      session.updateExpirationTime()
      return session
    })
  }
}

SessionSchema.plugin(mongooseKeywords, { paths: ['user'] })

export default mongoose.model('Session', SessionSchema)
