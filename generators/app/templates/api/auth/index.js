<%_
var passport = [];
if (passwordSignup) {
  passport.push('password', 'master');
}
if (authServices.length) {
  passport.push.apply(passport, authServices)
}
_%>
import { Router } from 'express'
import { login } from './controller'
<%_ if (passport.length) { _%>
import { <%= passport.join(', ') %> } from '../../services/passport'
<%_ } _%>

const router = new Router()

<%_ if (passwordSignup) { _%>
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
  password(),
  login)

<%_ } _%>
<%_
authServices.forEach(function(service) {
var upperFirst = service.charAt(0).toUpperCase() + service.slice(1);
_%>
/**
 * @api {post} /auth/<%= service %> Authenticate with <%= upperFirst %>
 * @apiName Authenticate<%= upperFirst %>
 * @apiGroup Auth
 * @apiParam {String} access_token <%= upperFirst %> user accessToken.
 * @apiSuccess (Success 201) {String} token User `access_token` to be passed to other requests.
 * @apiSuccess (Success 201) {Object} user Current user's data.
 * @apiError 401 Invalid credentials.
 */
router.post('/<%= service %>',
  <%= service %>(),
  login)

<%_ }) _%>
export default router
