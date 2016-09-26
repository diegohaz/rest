<%_
var hasMaster = authMethods.length && masterMethods.length;
var hasSession = authMethods.length && (userMethods.length || adminMethods.length);
_%>
import test from 'ava'
<%_ if (generateModel && hasSession) { _%>
import Promise from 'bluebird'
<%_ } _%>
<%_ if (methods.length) { _%>
import request from 'supertest-as-promised'
<%_ } _%>
<%_ if (generateModel || hasSession) { _%>
import mockgoose from 'mockgoose'
<%_ } _%>
<%_ if (hasMaster) { _%>
import { masterKey } from '../../config'
<%_ } _%>
<%_ if (hasSession) { _%>
import { signSync } from '../../services/jwt'
<%_ } _%>
<%_ if (methods.length) { _%>
import express from '../../config/express'
<%_ } _%>
<%_ if (generateModel || hasSession) { _%>
import mongoose from '../../config/mongoose'
<%_ if (hasSession) { _%>
import { User } from '../user'
<%_ } _%>
<%_ } _%>
<%_ if (methods.length) { _%>
import routes<% if (generateModel) { %>, { <%= pascal %> }<% } %> from '.'

const app = () => express(routes)
<%_ } else if (generateModel) { _%>
import { <%= pascal %> } from '.'
<%_ } _%>
<%_ if (generateModel || hasSession) { _%>

test.before(async (t) => {
  await mockgoose(mongoose)
  await mongoose.connect('')
})

test.beforeEach(async (t) => {
  <%_ if (hasSession) { _%>
  const [ user, anotherUser, admin ] = await User.create([
    { email: 'a@a.com', password: '123456' },
    { email: 'b@b.com', password: '123456' },
    { email: 'c@c.com', password: '123456', role: 'admin' }
  ])
  const [ userSession, anotherSession, adminSession ] = [
    signSync(user.id), signSync(anotherUser.id), signSync(admin.id)
  ]
  <%_ } _%>
  <%_ if (generateModel) { _%>
  const <%= camel %> = await <%= pascal %>.create({<%=
    storeUser ? userField === 'user' ? ' user ' : ' ' + userField + ': user ' : ''
  %>})
  <%_ } _%>
  t.context = { ...t.context<% if (hasMaster) { %>, masterKey<% } %><% if (hasSession) { %>, userSession, anotherSession, adminSession<% } %><% if (generateModel) { %>, <%= camel %><% } %> }
})

test.afterEach.always(async (t) => {
  <%_ if (generateModel && hasSession) { _%>
  await Promise.all([User.remove(), <%= pascal %>.remove()])
  <%_ } else if (generateModel) { _%>
  await <%= pascal %>.remove()
  <%_ } else if (hasSession) { _%>
  await User.remove()
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
  var request = needsId ? '`/${' + camel + '.id}`' : "'/'";
  var queryOrSend = ['POST', 'PUT'].indexOf(verb) !== -1 ? 'send' : 'query';
  var check = method.method === 'GET LIST' ? 'Array.isArray(body)' : "typeof body === 'object'";
  var params = [];
  var contextAssignments = [];
  var additionalChecks = [];

  if (method.admin || method.user) {
    params.push('access_token: ' + method.permission + 'Session');
    contextAssignments.push(method.permission + 'Session');
  } else if (method.master) {
    params.push('access_token: masterKey');
    contextAssignments.push('masterKey');
  }

  if (needsId) {
    additionalChecks.push('body.id === ' + camel + '.id');
    contextAssignments.push(camel);
  }
  if (['PUT', 'POST'].indexOf(verb) !== -1 && modelFields.length) {
    params.push.apply(params, modelFields.map(function (field) {
      return field + ": 'test'";
    }));
    additionalChecks.push.apply(additionalChecks, modelFields.map(function (field) {
      return 'body.' + field + " === 'test'"
    }));
  }
  if (verb !== 'DELETE' && storeUser && method.user) {
    if (method.method === 'GET LIST') {
      additionalChecks.push('typeof body[0].' + userField + " === 'object'")
    } else {
      additionalChecks.push('typeof body.' + userField + " === 'object'")
    }
  }
_%>

test.serial('<%= verb %> <%= link %> <%= successCode %><%= permission %>', async (t) => {
  <%_ if (contextAssignments.length) { _%>
  const { <%= contextAssignments.join(', ') %> } = t.context
  <%_ } _%>
  const { status<% if (verb !== 'DELETE') { %>, body<% } %> } = await request(app())
    .<%= method.router %>(<%- request %>)
    <%_ if (params.length) { _%>
    .<%= queryOrSend %>({ <%- params.join(', ') %> })
    <%_ } _%>
  t.true(status === <%= successCode %>)
  <%_ if (method.method !== 'DELETE') { _%>
  t.true(<%- check %>)
  <%_ additionalChecks.forEach(function (check) { _%>
  t.true(<%- check %>)
  <%_ }) _%>
  <%_ } _%>
})
<%_
if (storeUser && userMethods.indexOf(verb) !== -1 && ['PUT', 'DELETE'].indexOf(verb) !== -1) {
var assignments = contextAssignments;
assignments[0] = 'anotherSession';
var parameters = params;
parameters[0] = 'access_token: anotherSession';
_%>

test.serial('<%= verb %> <%= link %> 401 (user) - another user', async (t) => {
  const { <%= assignments.join(', ') %> } = t.context
  const { status } = await request(app())
    .<%= method.router %>(<%- request %>)
    .send({ <%- parameters.join(', ') %> })
  t.true(status === 401)
})
<%_ } _%>
<%_ if (method.master) { _%>

test.serial('<%= verb %> <%= link %> 401 (admin)', async (t) => {
  <%_ if (contextAssignments.length > 1) { _%>
  const { adminSession, <%= contextAssignments.slice(1).join(', ') %> } = t.context
  <%_ } else { _%>
  const { adminSession } = t.context
  <%_ } _%>
  const { status } = await request(app())
    .<%= method.router %>(<%- request %>)
    .<%= queryOrSend %>({ access_token: adminSession })
  t.true(status === 401)
})
<%_ } _%>
<%_ if (method.master || method.admin) { _%>

test.serial('<%= verb %> <%= link %> 401 (user)', async (t) => {
  <%_ if (contextAssignments.length > 1) { _%>
  const { userSession, <%= contextAssignments.slice(1).join(', ') %> } = t.context
  <%_ } else { _%>
  const { userSession } = t.context
  <%_ } _%>
  const { status } = await request(app())
    .<%= method.router %>(<%- request %>)
    .<%= queryOrSend %>({ access_token: userSession })
  t.true(status === 401)
})
<%_ } _%>
<%_ if (method.permission) { _%>

test.serial('<%= verb %> <%= link %> 401', async (t) => {
  <%_ if (contextAssignments.length > 1) { _%>
  const { <%= contextAssignments.slice(1).join(', ') %> } = t.context
  <%_ } _%>
  const { status } = await request(app())
    .<%= method.router %>(<%- request %>)
  t.true(status === 401)
})
<%_ } _%>
<%_ if (['GET ONE', 'PUT', 'DELETE'].indexOf(method.method) !== -1) { _%>

test.serial('<%= verb %> <%= link %> 404<%= permission %>', async (t) => {
  <%_ if (contextAssignments.length && method.permission) { _%>
  const { <%= contextAssignments[0] %> } = t.context
  <%_ } _%>
  const { status } = await request(app())
    .<%= method.router %>('/123456789098765432123456')
    <%_ if (params.length) { _%>
    .<%= queryOrSend %>({ <%- params.join(', ') %> })
    <%_ } _%>
  t.true(status === 404)
})
<%_ } _%>
<%_ }) _%>
<%_ if (!methods.length) { _%>

test('pass', (t) => {
  t.pass()
})
<%_ } _%>
