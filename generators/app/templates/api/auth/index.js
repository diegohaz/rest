<%_ var emailSignup = authMethods.indexOf('email') !== -1 _%>
<%_ var facebookLogin = authMethods.indexOf('facebook') !== -1 _%>
<%_
  var passport = [];
  if (emailSignup) {
    passport.push('basic', 'master');
  }
  if (facebookLogin) {
    passport.push('facebook');
  }
_%>
import { Router } from 'express'
import { login } from './auth.controller'
<%_ if (passport.length) { _%>
import { <%= passport.join(', ') %> } from '../../services/passport'
<%_ } _%>

const router = new Router()

<%_ if (emailSignup) { _%>
/**
 * @api {post} /auth Authenticate
 * @apiName Authenticate
 * @apiGroup Auth
 * @apiPermission master
 * @apiHeader {String} Authorization Basic authorization with email and password.
 * @apiParam {String} access_token Master access_token.
 * @apiSuccess (Success 201) {String} token User `access_token` to be passed to other requests.
 * @apiSuccess (Success 201) {Object} user Current user's data.
 * @apiError 401 Master access only or invalid credentials.
 */
router.post('/',
  master(),
  basic(),
  login)

<%_ } _%>
<%_ if (facebookLogin) { _%>
/**
 * @api {post} /auth/facebook Authenticate with Facebook
 * @apiName AuthenticateFacebook
 * @apiGroup Auth
 * @apiParam {String} access_token Facebook user accessToken.
 * @apiSuccess (Success 201) {String} token User `access_token` to be passed to other requests.
 * @apiSuccess (Success 201) {Object} user Current user's data.
 * @apiError 401 Invalid credentials.
 */
router.post('/facebook',
  facebook(),
  login)

<%_ } _%>
export default router
