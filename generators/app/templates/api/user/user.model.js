import crypto from 'crypto'
import bcrypt from 'bcrypt'
import randtoken from 'rand-token'
import mongoose, { Schema } from 'mongoose'
import mongooseKeywords from 'mongoose-keywords'
import { env } from '../../config'
import Session from '../session/session.model'

const compare = require('bluebird').promisify(bcrypt.compare)
const roles = ['user', 'admin']

const UserSchema = new Schema({
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
<%_ if (emailSignup) {_%>
  password: {
    type: String,
    required: true,
    minlength: 6
  },
<%_ } _%>
  name: {
    type: String,
    index: true,
    trim: true
  },
<%_ if (facebookLogin) { _%>
  facebook: {
    id: String
  },
<%_ } _%>
  role: {
    type: String,
    enum: roles,
    default: 'user'
  },
  picture: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

UserSchema.path('email').set(function (email) {
  if (!this.picture || this.picture.indexOf('https://gravatar.com') === 0) {
    const hash = crypto.createHash('md5').update(email).digest('hex')
    this.picture = `https://gravatar.com/avatar/${hash}?d=identicon`
  }

  if (!this.name) {
    this.name = email.replace(/^(.+)@.+$/, '$1')
  }

  return email
})

<%_ if (emailSignup) {_%>
UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next()

  let rounds = env === 'test' ? 1 : 9

  bcrypt.hash(this.password, rounds, (err, hash) => {
    if (err) return next(err)
    this.password = hash
    next()
  })
})

<%_ } _%>
UserSchema.pre('remove', function (next) {
  Session.remove({ user: this }).then(next).catch(next)
})

UserSchema.methods = {
  view (full) {
    let view = {}
    let fields = ['id', 'name', 'picture']

    if (full) {
      fields = [...fields, 'email', 'createdAt']
    }

    fields.forEach((field) => { view[field] = this[field] })

    return view
  }<%_ if (emailSignup) {_%>,

  authenticate (password) {
    return compare(password, this.password).then((valid) => valid ? this : false)
  }
<%_ } _%>
}

UserSchema.statics = {
  roles<%_ if (facebookLogin) { _%>,

  createFromFacebook ({ id, name, email, picture }) {
    const User = mongoose.model('User')

    return User.findOne({ email }).then((user) => {
      if (user) {
        user.facebook.id = id
        user.name = name
        user.email = email
        user.picture = picture.data.url
        return user.save()
      } else {
        const password = randtoken.generate(16)
        return User.create({ name, email, password, facebook: { id }, picture: picture.data.url })
      }
    })
  }
<%_ } _%>
}

UserSchema.plugin(mongooseKeywords, { paths: ['email', 'name'] })

export default mongoose.model('User', UserSchema)
