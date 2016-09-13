import test from 'ava'
import mockgoose from 'mockgoose'
import mongoose from '../../config/mongoose'
import { schema } from '.'

test.beforeEach(async (t) => {
  const mongo = new mongoose.Mongoose()
  await mockgoose(mongo)
  await mongo.connect('')
  const <%= pascal %> = mongo.model('<%= pascal %>', schema)
  <%_ if (modelFields.length) { _%>
  const <%= camel %> = await <%= pascal %>.create({ <%- modelFields.map(function (field) {
    return field + ": 'test'";
  }).join(', ') %> })
  <%_ } else { _%>
  const <%= camel %> = await <%= pascal %>.create({})
  <%_ } _%>

  t.context = { ...t.context, <%= pascal %>, <%= camel %> }
})

test.cb.after.always((t) => {
  mockgoose.reset(t.end)
})

test('view', (t) => {
  const { <%= camel %> } = t.context
  const view = <%= camel %>.view()
  t.true(typeof view === 'object')
  t.true(view.id === <%= camel %>.id)
  <%_ if (modelFields.length) { _%>
  <%_ modelFields.forEach(function (field) { _%>
  t.true(view.<%=field%> === <%= camel %>.<%= field %>)
  <%_ }) _%>
  <%_ } _%>
})

test('full view', (t) => {
  const { <%= camel %> } = t.context
  const view = <%= camel %>.view(true)
  t.true(typeof view === 'object')
  t.true(view.id === <%= camel %>.id)
  <%_ if (modelFields.length) { _%>
  <%_ modelFields.forEach(function (field) { _%>
  t.true(view.<%=field%> === <%= camel %>.<%= field %>)
  <%_ }) _%>
  <%_ } _%>
  t.truthy(view.createdAt)
  t.truthy(view.updatedAt)
})
