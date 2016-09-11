import test from 'ava'
import mockgoose from 'mockgoose'
import mongoose from '../../config/mongoose'
import { schema } from '.'
import { schema as userSchema } from '../user'

test.beforeEach(async (t) => {
  const mongo = new mongoose.Mongoose()
  await mockgoose(mongo)
  await mongo.connect('')
  const User = mongo.model('User', userSchema)
  const PasswordReset = mongo.model('PasswordReset', schema)
  const user = await User.create({ name: 'user', email: 'a@a.com', password: '123456' })
  const passwordReset = await PasswordReset.create({ user })

  t.context = { ...t.context, User, user, PasswordReset, passwordReset }
})

test.cb.after.always((t) => {
  mockgoose.reset(t.end)
})

test('view', (t) => {
  const { passwordReset } = t.context
  const view = passwordReset.view()
  t.true(view.token === passwordReset.token)
  t.true(typeof view.user === 'object')
})
