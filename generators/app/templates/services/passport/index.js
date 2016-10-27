import passport from 'passport'
<%_ if (passwordSignup) { _%>
import { Schema } from 'bodymen'
import { BasicStrategy } from 'passport-http'
<%_ } _%>
import { Strategy as BearerStrategy } from 'passport-http-bearer'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { jwtSecret, masterKey } from '../../config'
<%_ authServices.forEach(function (service) { _%>
import * as <%= service %>Service from '../<%= service %>'
<%_ }) _%>
import User<% if (passwordSignup) { %>, { schema }<% } %> from '../../<%= apiDir %>/user/model'

<%_ if (passwordSignup) { _%>
export const password = () => (req, res, next) =>
  passport.authenticate('password', { session: false }, (err, user, info) => {
    if (err && err.param) {
      return res.status(400).json(err)
    } else if (err || !user) {
      return res.status(401).end()
    }
    req.logIn(user, { session: false }, (err) => {
      if (err) return res.status(401).end()
      next()
    })
  })(req, res, next)

<%_ } _%>
<%_ authServices.forEach(function (service) { _%>
export const <%= service %> = () =>
  passport.authenticate('<%= service %>', { session: false })

<%_ }) _%>
export const master = () =>
  passport.authenticate('master', { session: false })

export const token = ({ required, roles = User.roles } = {}) => (req, res, next) =>
  passport.authenticate('token', { session: false }, (err, user, info) => {
    if (err || (required && !user) || (required && !~roles.indexOf(user.role))) {
      return res.status(401).end()
    }
    req.logIn(user, { session: false }, (err) => {
      if (err) return res.status(401).end()
      next()
    })
  })(req, res, next)

<%_ if (passwordSignup) { _%>
passport.use('password', new BasicStrategy((email, password, done) => {
  const userSchema = new Schema({ email: schema.tree.email, password: schema.tree.password })

  userSchema.validate({ email, password }, (err) => {
    if (err) done(err)
  })

  User.findOne({ email }).then((user) => {
    if (!user) {
      done(true)
      return null
    }
    return user.authenticate(password, user.password).then((user) => {
      done(null, user)
      return null
    }).catch(done)
  })
}))

<%_ } _%>
<%_ authServices.forEach(function (service) { _%>
passport.use('<%= service %>', new BearerStrategy((token, done) => {
  <%= service %>Service.getUser(token).then((user) => {
    return User.createFromService(user)
  }).then((user) => {
    done(null, user)
    return null
  }).catch(done)
}))

<%_ }) _%>
passport.use('master', new BearerStrategy((token, done) => {
  if (token === masterKey) {
    done(null, {})
  } else {
    done(null, false)
  }
}))

passport.use('token', new JwtStrategy({
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromUrlQueryParameter('access_token'),
    ExtractJwt.fromBodyField('access_token'),
    ExtractJwt.fromAuthHeaderWithScheme('Bearer')
  ])
}, ({ id }, done) => {
  User.findById(id).then((user) => {
    done(null, user)
    return null
  }).catch(done)
}))
