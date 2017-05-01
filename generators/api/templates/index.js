<%_
var authMiddlewares = [];
var httpVerbs = [
  { method: 'POST', router: 'post', controller: 'create', desc: 'Create' },
  { method: 'GET LIST', router: 'get', controller: 'index', desc: 'Retrieve' },
  { method: 'GET ONE', router: 'get', controller: 'show', desc: 'Retrieve' },
  { method: 'PUT', router: 'put', controller: 'update', desc: 'Update' },
  { method: 'DELETE', router: 'delete', controller: 'destroy', desc: 'Delete' }
];
methods = httpVerbs.filter(function (verb) {
  if (methods.indexOf(verb.method) === -1) {
    return false;
  }
  if (authMethods.length) {
    verb.master = masterMethods.indexOf(verb.method) !== -1 && 'master';
    verb.admin = adminMethods.indexOf(verb.method) !== -1 && 'admin';
    verb.user = userMethods.indexOf(verb.method) !== -1 && 'user';
    verb.permission = verb.master || verb.admin || verb.user;
    if (verb.master && authMiddlewares.indexOf('master') === -1) {
      authMiddlewares.push('master');
    }
    if ((verb.admin || verb.user) && authMiddlewares.indexOf('token') === -1) {
      authMiddlewares.push('token');
    }
  }
  return true
});
var hasQuery = methods.find(function (method) {
  return method.method === 'GET LIST';
});
var hasBody = modelFields.length && methods.find(function (method) {
  return method.method === 'POST' || method.method === 'PUT';
});
_%>
import { Router } from 'express'
<%_ if (hasQuery) { _%>
import { middleware as query } from 'querymen'
<%_ } _%>
<%_ if (hasBody) { _%>
import { middleware as body } from 'bodymen'
<%_ } _%>
<%_ if (authMiddlewares.length) { _%>
import { <%= authMiddlewares.join(', ') %> } from '../../services/passport'
<%_ } _%>
<%_ if (methods.length) { _%>
import { <%= methods.map(function (method) { return method.controller }).join(', ') %> } from './controller'
<%_ } _%>
<%_ if (generateModel) { _%>
<%_ if (hasBody) { _%>
import { schema } from './model'
<%_ } _%>
export <%= pascal %>, { schema } from './model'
<%_ } _%>

const router = new Router()
<%_ if (generateModel && hasBody && modelFields.length) { _%>
const { <%= modelFields.join(', ') %> } = schema.tree
<%_ } _%>

<%_ methods.forEach(function (method) { _%>
/**
 * @api {<%= method.router %>} /<%= kebabs %><%= ['GET ONE', 'PUT', 'DELETE'].indexOf(method.method) !== -1 ? '/:id' : '' %> <%= method.desc %> <%= method.method === 'GET LIST' ? lowers : lower %>
 * @apiName <%= method.desc + (method.method === 'GET LIST' ? pascals : pascal) %>
 * @apiGroup <%= pascal %>
 <%_ if (method.permission) {_%>
 * @apiPermission <%= method.permission %>
 * @apiParam {String} access_token <%= method.permission %> access token.
 <%_ } _%>
 <%_ if ((method.method === 'POST' || method.method === 'PUT') && modelFields.length) { _%>
 <%_ modelFields.forEach(function (field) { _%>
 * @apiParam <%= field %> <%= start %>'s <%= field %>.
 <%_ }) _%>
 <%_ } _%>
 <%_ if (method.method === 'GET LIST') { _%>
 * @apiUse listParams
 <%_ if (getList) { _%>
 * @apiSuccess {Number} count Total amount of <%= lowers %>.
 * @apiSuccess {Object[]} rows List of <%= lowers %>.
 <%_ } else { _%>
 * @apiSuccess {Object[]} <%= camels %> List of <%= lowers %>.
 <%_ } _%>
 * @apiError {Object} 400 Some parameters may contain invalid values.
 <%_ } else if (method.method === 'DELETE') { _%>
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 <%= start %> not found.
 <%_ } else if (method.method === 'CREATE') { _%>
 * @apiSuccess (Success 201) {Object} <%= camel %> <%= start %>'s data.
 <%_ } else { _%>
 * @apiSuccess {Object} <%= camel %> <%= start %>'s data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 <%= start %> not found.
 <%_ } _%>
 <%_ if (method.permission) { _%>
 * @apiError 401 <%= method.permission %> access only.
 <%_ } _%>
 */
router.<%= method.router %>('/<%= ['GET ONE', 'PUT', 'DELETE'].indexOf(method.method) !== -1 ? ':id' : '' %>',
  <%_ if (method.master) { _%>
  master(),
  <%_ } _%>
  <%_ if (method.admin || method.user) { _%>
  token({ required: true<% if (method.admin) { %>, roles: ['admin']<% } %> }),
  <%_ } _%>
  <%_ if (method.method === 'GET LIST') { _%>
  query(),
  <%_ } _%>
  <%_ if (['POST', 'PUT'].indexOf(method.method) !== -1 && modelFields.length) { _%>
  body({ <%= modelFields.join(', ') %> }),
  <%_ } _%>
  <%= method.controller %>)

<%_ }); _%>
export default router
