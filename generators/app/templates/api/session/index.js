import { Router } from 'express'
import { middleware as querymen } from 'querymen'
import { index, create, destroy } from './session.controller'
import { <% if (emailSignup) { %>basic, <% } %>bearer<% if (facebookLogin) {%>, facebook<% } %> } from '../../services/passport'

const router = new Router()

router.get('/',
  bearer({ required: true, roles: ['admin'] }),
  querymen({ user: String }),
  index)

<%_ if (emailSignup) {_%>
router.post('/',
  basic(),
  create)

<%_ } _%>
<%_ if (facebookLogin) {_%>
router.post('/facebook',
  facebook(),
  create)

<%_ } _%>
router.delete('/:token?',
  bearer({ required: true }),
  destroy)

export default router
