import test from 'ava'
import { spy } from 'sinon'
import * as response from '.'

test.beforeEach((t) => {
  const res = {
    status () { return this },
    json () { return this },
    end () { return this }
  }
  const user = {
    id: 1,
    role: 'user'
  }
  const entity = {
    author: {
      id: 1,
      equals (id) {
        return id === this.id
      }
    }
  }
  spy(res, 'status')
  spy(res, 'json')
  spy(res, 'end')
  t.context = { res, user, entity }
})

test('success 200', (t) => {
  const { res } = t.context
  t.falsy(response.success(res)({ prop: 'value' }))
  t.true(res.status.calledWith(200))
  t.true(res.json.calledWith({ prop: 'value' }))
})

test('success 201', (t) => {
  const { res } = t.context
  t.falsy(response.success(res, 201)({ prop: 'value' }))
  t.true(res.status.calledWith(201))
  t.true(res.json.calledWith({ prop: 'value' }))
})

test('success null', (t) => {
  const { res } = t.context
  t.falsy(response.success(res, 201)())
  t.true(res.status.notCalled)
})

test('notFound', (t) => {
  const { res } = t.context
  t.falsy(response.notFound(res)())
  t.true(res.status.calledWith(404))
  t.true(res.end.calledOnce)
})

test('notFound found', (t) => {
  const { res } = t.context
  t.truthy(response.notFound(res)({ prop: 'value' }))
  t.true(res.status.notCalled)
  t.true(res.end.notCalled)
})

test('authorOrAdmin author', (t) => {
  const { res, user, entity } = t.context
  t.truthy(response.authorOrAdmin(res, user, 'author')(entity))
})

test('authorOrAdmin admin', (t) => {
  const { res, user, entity } = t.context
  user.role = 'admin'
  t.truthy(response.authorOrAdmin(res, user, 'user')(entity))
})

test('authorOrAdmin not author nor admin', (t) => {
  const { res, user, entity } = t.context
  user.id = 2
  t.falsy(response.authorOrAdmin(res, user, 'author')(entity))
})

test('authorOrAdmin no entity', (t) => {
  const { res, user } = t.context
  t.falsy(response.authorOrAdmin(res, user, 'author')())
})
