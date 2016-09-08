import { Router } from 'express'
import { middleware as querymen } from 'querymen'
import { middleware as bodymen } from 'bodymen'
import { basic, bearer } from '../../services/passport'
import { schema } from './user.model'
import { index, showMe, show, create, update<% if (emailSignup) { %>, updatePassword<% } %>, destroy } from './user.controller'

const router = new Router()
const { email<% if (emailSignup) { %>, password<% } %>, name, picture } = schema.tree

router.get('/',
  bearer({ required: true, roles: ['admin'] }),
  querymen(),
  index)

router.get('/me',
  bearer({ required: true }),
  showMe)

router.get('/:id',
  show)

<%_ if (emailSignup) {_%>
router.post('/',
  bodymen({ email, password, name, picture }),
  create)
<%_ } else { _%>
router.post('/',
  bearer({ required: true, roles: ['admin'] }),
  bodymen({ email, name, picture }),
  create)

<%_ } _%>
router.put('/:id',
  bearer({ required: true }),
  bodymen({ name, picture }),
  update)

<%_ if (emailSignup) {_%>
router.put('/:id/password',
  basic(),
  bodymen({ password }),
  updatePassword)

<%_ } _%>
router.delete('/:id',
  bearer({ required: true, roles: ['admin'] }),
  destroy)

export default router
