<%_
var emailSignup = authMethods.indexOf('email') !== -1;
var services = authMethods.filter(function (method) {
  return method !== 'email';
});
var passport = [];
if (emailSignup) {
  passport.push('basic', 'master');
}
if (services.length) {
  passport.push.apply(passport, services)
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
<%_ if (services.length) { _%>
<%_
services.forEach(function(service) {
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
<%_ } _%>
export default router
