<%_
var hasMaster = authMethods.length && masterMethods.length;
var hasSession = authMethods.length && (userMethods.length || adminMethods.length);
var hasAdminSession = hasSession && (hasMaster || adminMethods.length)
var hasAnotherSession = storeUser &&
  (userMethods.indexOf('PUT') >= 0 || userMethods.indexOf('DELETE') >= 0);
_%>
<%_ if (methods.length) { _%>
import request from 'supertest'
<%_ } _%>
<%_ if (hasMaster) { _%>
import { masterKey, apiRoot } from '../../config'
<%_ } else if (methods.length) { _%>
import { apiRoot } from '../../config'
<%_ } _%>   
<%_ if (hasSession) { _%>
import { signSync } from '../../services/jwt'
<%_ } _%>
<%_ if (methods.length) { _%>
import express from '../../services/express'
<%_ } _%>
<%_ if (hasSession) { _%>
import { User } from '../user'
<%_ } _%>
<%_ if (methods.length) { _%>
import routes<% if (generateModel) { %>, { <%= pascal %> }<% } %> from '.'

const app = () => express(apiRoot, routes)
<%_ } _%>
<%_
if (methods.length && (generateModel || hasSession)) {
var variables = [];
hasSession && variables.push('userSession');
hasAnotherSession && variables.push('anotherSession');
hasAdminSession && variables.push('adminSession');
generateModel && variables.push(camel);
_%>

let <%- variables.join(', ') %>

beforeEach(async () => {
  <%_ if (hasSession) { _%>
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  <%_ if (hasAnotherSession) { _%>
  const anotherUser = await User.create({ email: 'b@b.com', password: '123456' })
  <%_ } _%>
  <%_ if (hasAdminSession) { _%>
  const admin = await User.create({ email: 'c@c.com', password: '123456', role: 'admin' })
  <%_ } _%>
  userSession = signSync(user.id)
  <%_ if (hasAnotherSession) { _%>
  anotherSession = signSync(anotherUser.id)
  <%_ } _%>
  <%_ if (hasAdminSession) { _%>
  adminSession = signSync(admin.id)
  <%_ } _%>
  <%_ } _%>
  <%_ if (generateModel) { _%>
  <%= camel %> = await <%= pascal %>.create({<%=
    storeUser ? userField === 'user' ? ' user ' : ' ' + userField + ': user ' : ''
  %>})
  <%_ } _%>
})
<%_ } _%>
<%_
methods.forEach(function (method) {
  var needsId = ['GET ONE', 'PUT', 'DELETE'].indexOf(method.method) !== -1;
  if (!generateModel && needsId) {
    return;
  }

  var verb = method.method.replace(/( ONE| LIST)$/, '');
  var successCode = verb === 'POST' ? 201 : verb === 'DELETE' ? 204 : 200;
  var permission = method.permission ? ' (' + method.permission + ')' : '';
  var link = '/' + kebabs + (needsId ? '/:id' : '');
  var request = needsId ? '`${apiRoot}/${' + camel + '.id}`' : '`${apiRoot}`';
  var queryOrSend = ['POST', 'PUT'].indexOf(verb) !== -1 ? 'send' : 'query';
  var check = method.method === 'GET LIST'
    ? (getList ? ['Array.isArray(body.rows)', 'toBe', 'true'] : ['Array.isArray(body)', 'toBe', 'true'])
    : ['typeof body', 'toEqual', "'object'"];
  var params = [];
  var additionalChecks = [];

  if (method.admin || method.user) {
    params.push('access_token: ' + method.permission + 'Session');
  } else if (method.master) {
    params.push('access_token: masterKey');
  }

  if (needsId) {
    additionalChecks.push(['body.id', 'toEqual', camel + '.id']);
  }
  if (getList && method.method === 'GET LIST') {
    additionalChecks.push(['Number.isNaN(body.count)', 'toBe', 'false']);
  }
  if (['PUT', 'POST'].indexOf(verb) !== -1 && modelFields.length) {
    params.push.apply(params, modelFields.map(function (field) {
      return field + ": 'test'";
    }));
    additionalChecks.push.apply(additionalChecks, modelFields.map(function (field) {
      return ['body.' + field, 'toEqual', "'test'"];
    }));
  }
  if (verb !== 'DELETE' && storeUser && method.user) {
    if (method.method === 'GET LIST') {
      if (getList) {
        additionalChecks.push(['typeof body.rows[0].' + userField, 'toEqual', "'object'"]);
      } else {
        additionalChecks.push(['typeof body[0].' + userField, 'toEqual', "'object'"]);
      }
    } else {
      additionalChecks.push(['typeof body.' + userField, 'toEqual', "'object'"]);
    }
  }
_%>

test('<%= verb %> <%= link %> <%= successCode %><%= permission %>', async () => {
  const { status<% if (verb !== 'DELETE') { %>, body<% } %> } = await request(app())
    .<%= method.router %>(<%- request %>)
    <%_ if (params.length) { _%>
    .<%= queryOrSend %>({ <%- params.join(', ') %> })
    <%_ } _%>
  expect(status).toBe(<%= successCode %>)
  <%_ if (method.method !== 'DELETE') { _%>
  expect(<%- check[0] %>).<%- check[1] %>(<%- check[2] %>)
  <%_ additionalChecks.forEach(function (check) { _%>
  expect(<%- check[0] %>).<%- check[1] %>(<%- check[2] %>)
  <%_ }) _%>
  <%_ } _%>
})
<%_
if (storeUser && userMethods.indexOf(verb) !== -1 && ['PUT', 'DELETE'].indexOf(verb) !== -1) {
var parameters = params;
parameters[0] = 'access_token: anotherSession';
_%>

test('<%= verb %> <%= link %> 401 (user) - another user', async () => {
  const { status } = await request(app())
    .<%= method.router %>(<%- request %>)
    .send({ <%- parameters.join(', ') %> })
  expect(status).toBe(401)
})
<%_ } _%>
<%_ if (hasSession && method.master) { _%>

test('<%= verb %> <%= link %> 401 (admin)', async () => {
  const { status } = await request(app())
    .<%= method.router %>(<%- request %>)
    .<%= queryOrSend %>({ access_token: adminSession })
  expect(status).toBe(401)
})
<%_ } _%>
<%_ if (hasSession && (method.master || method.admin)) { _%>

test('<%= verb %> <%= link %> 401 (user)', async () => {
  const { status } = await request(app())
    .<%= method.router %>(<%- request %>)
    .<%= queryOrSend %>({ access_token: userSession })
  expect(status).toBe(401)
})
<%_ } _%>
<%_ if (method.permission) { _%>

test('<%= verb %> <%= link %> 401', async () => {
  const { status } = await request(app())
    .<%= method.router %>(<%- request %>)
  expect(status).toBe(401)
})
<%_ } _%>
<%_ if (['GET ONE', 'PUT', 'DELETE'].indexOf(method.method) !== -1) { _%>

test('<%= verb %> <%= link %> 404<%= permission %>', async () => {
  const { status } = await request(app())
    .<%= method.router %>(apiRoot + '/123456789098765432123456')
    <%_ if (params.length) { _%>
    .<%= queryOrSend %>({ <%- params.join(', ') %> })
    <%_ } _%>
  expect(status).toBe(404)
})
<%_ } _%>
<%_ }) _%>
<%_ if (!methods.length) { _%>

test('pass', () => {})
<%_ } _%>
