import { Router } from 'express'
import { middleware as bodymen } from 'bodymen'
import { create, show, update } from './password-reset.controller'
import { schema } from '../user/user.model'

const router = new Router()
const { email, password } = schema.tree

router.post('/',
  bodymen({ email, link: { type: String, required: true } }),
  create)

router.get('/:token',
  show)

router.put('/:token',
  bodymen({ password }),
  update)

export default router
