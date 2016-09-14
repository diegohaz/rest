import test from 'ava'
import mockgoose from 'mockgoose'
import mongoose from '../../config/mongoose'
import { schema } from '.'
<%_ if (storeUser) { _%>
import { schema as userSchema } from '../user'
<%_ } _%>

test.beforeEach(async (t) => {
  const mongo = new mongoose.Mongoose()
  await mockgoose(mongo)
  await mongo.connect('')
  const <%= pascal %> = mongo.model('<%= pascal %>', schema)
  <%_ if (storeUser) { _%>
  const User = mongo.model('User', userSchema)
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  <%_ } _%>
  <%_ if (modelFields.length) { _%>
  const <%= camel %> = await <%= pascal %>.create({ <%-
    storeUser ? userField === 'user' ? 'user, ' : userField + ': user, ' : ''
  %><%- modelFields.map(function (field) {
    return field + ": 'test'";
  }).join(', ') %> })
  <%_ } else { _%>
  const <%= camel %> = await <%= pascal %>.create({<%-
    storeUser ? userField === 'user' ? ' user ' : ' ' + userField + ': user ' : ''
  %>})
  <%_ } _%>

  t.context = { ...t.context, <%= pascal %>, <%= camel %><%= storeUser ? ', user' : '' %> }
})

test.cb.after.always((t) => {
  mockgoose.reset(t.end)
})

test('view', (t) => {
  const { <%= camel %><%= storeUser ? ', user' : '' %> } = t.context
  const view = <%= camel %>.view()
  t.true(typeof view === 'object')
  t.true(view.id === <%= camel %>.id)
  <%_ if (storeUser) { _%>
  t.true(typeof view.<%= userField %> === 'object')
  t.true(view.<%= userField %>.id === user.id)
  <%_ } _%>
  <%_ if (modelFields.length) { _%>
  <%_ modelFields.forEach(function (field) { _%>
  t.true(view.<%=field%> === <%= camel %>.<%= field %>)
  <%_ }) _%>
  <%_ } _%>
  t.truthy(view.createdAt)
  t.truthy(view.updatedAt)
})

test('full view', (t) => {
  const { <%= camel %><%= storeUser ? ', user' : '' %> } = t.context
  const view = <%= camel %>.view(true)
  t.true(typeof view === 'object')
  t.true(view.id === <%= camel %>.id)
  <%_ if (storeUser) { _%>
  t.true(typeof view.<%= userField %> === 'object')
  t.true(view.<%= userField %>.id === user.id)
  <%_ } _%>
  <%_ if (modelFields.length) { _%>
  <%_ modelFields.forEach(function (field) { _%>
  t.true(view.<%=field%> === <%= camel %>.<%= field %>)
  <%_ }) _%>
  <%_ } _%>
  t.truthy(view.createdAt)
  t.truthy(view.updatedAt)
})
