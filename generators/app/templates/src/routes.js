import { errorHandler as queryErrorHandler } from 'querymen'
import { errorHandler as bodyErrorHandler } from 'bodymen'
import { Router } from 'express'

// api imports
<%_ if (generateAuthApi) { _%>
import user from './<%= apiDir %>/user'
import session from './<%= apiDir %>/session'
<%_ } _%>
<%_ if (typeof passwordReset !== 'undefined' && passwordReset) { _%>
import passwordReset from './<%= apiDir %>/password-reset'
<%_ } _%>

const router = new Router()

// api endpoints
<%_ if (generateAuthApi) { _%>
router.use('/users', user)
router.use('/sessions', session)
<%_ } _%>
<%_ if (typeof passwordReset !== 'undefined' && passwordReset) { _%>
router.use('/password-resets', passwordReset)
<%_ } _%>

router.use(queryErrorHandler())
router.use(bodyErrorHandler())

export default router
