<%_ var emailSignup = authMethods.indexOf('email') !== -1 _%>
<%_ var facebookLogin = authMethods.indexOf('facebook') !== -1 _%>
import test from 'ava'
import crypto from 'crypto'
import mockgoose from 'mockgoose'
import mongoose from '../../config/mongoose'
import { schema } from '.'

test.beforeEach(async (t) => {
  const mongo = new mongoose.Mongoose()
  await mockgoose(mongo)
  await mongo.connect('')
  const User = mongo.model('User', schema)
  const user = await User.create({ name: 'user', email: 'a@a.com', password: '123456' })

  t.context = { ...t.context, User, user }
})

test.cb.after.always((t) => {
  mockgoose.reset(t.end)
})

test('view', (t) => {
  const { user } = t.context
  const fullView = user.view(true)
  t.true(fullView.id === user.id)
  t.true(fullView.name === user.name)
  t.true(fullView.email === user.email)
  t.true(fullView.picture === user.picture)
  t.true(fullView.createdAt === user.createdAt)
})

test('name', (t) => {
  t.context.user.name = ''
  t.context.user.email = 'test@example.com'
  t.true(t.context.user.name === 'test')
})

test('picture', async (t) => {
  const { user } = t.context
  const hash = crypto.createHash('md5').update(user.email).digest('hex')
  t.true(user.picture === `https://gravatar.com/avatar/${hash}?d=identicon`)

  user.picture = 'test.jpg'
  user.email = 'test@example.com'
  await user.save()
  t.true(user.picture === 'test.jpg')
})
<%_ if (emailSignup) { _%>

test('authenticate', async (t) => {
  t.truthy(await t.context.user.authenticate('123456'))
  t.falsy(await t.context.user.authenticate('blah'))
})
<%_ } _%>
<%_ if (facebookLogin) { _%>

test('createFromFacebook', async (t) => {
  const { User, user } = t.context
  const fbUser = {
    id: '123',
    name: 'Test Name',
    email: 'test@test.com',
    picture: { data: { url: 'test.jpg' } }
  }

  const updatedUser = await User.createFromFacebook({ ...fbUser, email: 'a@a.com' })
  t.true(updatedUser.id === user.id)
  t.true(updatedUser.facebook.id === fbUser.id)
  t.true(updatedUser.name === fbUser.name)
  t.true(updatedUser.email === user.email)
  t.true(updatedUser.picture === fbUser.picture.data.url)

  const updatedFbUser = await User.createFromFacebook(fbUser)
  t.true(updatedFbUser.id === user.id)
  t.true(updatedFbUser.facebook.id === fbUser.id)
  t.true(updatedFbUser.name === fbUser.name)
  t.true(updatedFbUser.email === user.email)
  t.true(updatedFbUser.picture === fbUser.picture.data.url)

  const createdFbUser = await User.createFromFacebook({ ...fbUser, id: '321' })
  t.true(createdFbUser.id !== user.id)
  t.true(createdFbUser.facebook.id === '321')
  t.true(createdFbUser.name === fbUser.name)
  t.true(createdFbUser.email === fbUser.email)
  t.true(createdFbUser.picture === fbUser.picture.data.url)
})
<%_ } _%>
