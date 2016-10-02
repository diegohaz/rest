import passport from 'passport'
<%_ if (authMethods.indexOf('email') !== -1) { _%>
import { Schema } from 'bodymen'
import { BasicStrategy } from 'passport-http'
<%_ } _%>
import { Strategy as BearerStrategy } from 'passport-http-bearer'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import { jwtSecret, masterKey } from '../../config'
<%_ if (authMethods.indexOf('facebook') !== -1) { _%>
import * as facebookService from '../facebook'
<%_ } _%>
<%_ if (authMethods.indexOf('github') !== -1) { _%>
import * as githubService from '../github'
<%_ } _%>
import User<% if (authMethods.indexOf('email') !== -1) { %>, { schema }<% } %> from '../../<%= apiDir %>/user/user.model'

<%_ if (authMethods.indexOf('email') !== -1) { _%>
export const basic = () => (req, res, next) =>
  passport.authenticate('basic', { session: false }, (err, user, info) => {
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
<%_ if (authMethods.indexOf('facebook') !== -1) { _%>
export const facebook = () =>
  passport.authenticate('facebook', { session: false })
<%_ } _%>
<%_ if (authMethods.indexOf('github') !== -1) { _%>
export const github = () =>
  passport.authenticate('github', { session: false })
<%_ } _%>
export const master = () =>
  passport.authenticate('master', { session: false })

export const session = ({ required, roles = User.roles } = {}) => (req, res, next) =>
  passport.authenticate('session', { session: false }, (err, user, info) => {
    if (err || (required && !user) || (required && !~roles.indexOf(user.role))) {
      return res.status(401).end()
    }
    req.logIn(user, { session: false }, (err) => {
      if (err) return res.status(401).end()
      next()
    })
  })(req, res, next)

<%_ if (authMethods.indexOf('email') !== -1) { _%>
passport.use('basic', new BasicStrategy((email, password, done) => {
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
<%_ if (authMethods.indexOf('facebook') !== -1) { _%>
passport.use('facebook', new BearerStrategy((sessionToken, done) => {
  facebookService.getMe({ sessionToken, fields: 'id, name, email, picture' }).then((user) => {
    return User.createFromService(user)
  }).then((user) => {
    done(null, user)
    return null
  }).catch(done)
}))

<%_ } _%>
<%_ if (authMethods.indexOf('github') !== -1) { _%>
passport.use('github', new BearerStrategy((sessionToken, done) => {
  githubService.getMe({ sessionToken, fields: 'id, name, email, picture' }).then((user) => {
    return User.createFromService(user)
  }).then((user) => {
    done(null, user)
    return null
  }).catch(done)
}))

<%_ } _%>
passport.use('master', new BearerStrategy((token, done) => {
  if (token === masterKey) {
    done(null, {})
  } else {
    done(null, false)
  }
}))

passport.use('session', new JwtStrategy({
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
