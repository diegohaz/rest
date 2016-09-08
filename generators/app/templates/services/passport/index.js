import passport from 'passport'
import { BasicStrategy } from 'passport-http'
import { Strategy as BearerStrategy } from 'passport-http-bearer'
<%_ if (facebookLogin) { _%>
import { getMe } from '../facebook'
<%_ } _%>
import User from '../../<%= apiDir %>/user/user.model'
import Session from '../../<%= apiDir %>/session/session.model'

<%_ if (emailSignup) {_%>
passport.use(new BasicStrategy((email, password, done) => {
  User.findOne({ email: email.toLowerCase() }).then((user) => {
    if (!user) return done(true)

    return user.authenticate(password, user.password).then((user) => {
      done(null, user)
      return null
    }).catch(done)
  })
}))

export const basic = () => passport.authenticate('basic', { session: false })

<%_ } _%>
passport.use(new BearerStrategy((token, done) => {
  Session.login(token).then((session) => {
    done(null, session.user)
    return null
  }).catch(done)
}))

export const bearer = ({ required, roles = User.roles } = {}) => (req, res, next) =>
  passport.authenticate('bearer', { session: false }, (err, user, info) => {
    if (err || (required && !user) || (required && roles.indexOf(user.role) === -1)) {
      return res.status(401).end()
    }
    req.logIn(user, { session: false }, (err) => err ? res.status(401).end() : next())
  })(req, res, next)

<%_ if (facebookLogin) {_%>
passport.use('facebook', new BearerStrategy((sessionToken, done) => {
  getMe({ sessionToken, fields: 'id, name, email, picture' }).then((user) => {
    return User.createFromFacebook(user)
  }).then((user) => {
    done(null, user)
    return null
  }).catch(done)
}))

export const facebook = () => passport.authenticate('facebook', { session: false })

<%_ } _%>
