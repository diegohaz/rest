import { Router } from 'express'
<%_ if (generateAuthApi) { _%>
import user from './user'
import auth from './auth'
<%_ } _%>
<%_ if (typeof passwordReset !== 'undefined' && passwordReset) { _%>
import passwordReset from './password-reset'
<%_ } _%>

const router = new Router()

/**
 * @apiDefine master Master access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine admin Admin access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine user User access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine listParams
 * @apiParam {String} [q] Query to search.
 * @apiParam {Number{1..30}} [page=1] Page number.
 * @apiParam {Number{1..100}} [limit=30] Amount of returned items.
 * @apiParam {String[]} [sort=-createdAt] Order of returned items.
 * @apiParam {String[]} [fields] Fields to be returned.
 */
<%_ if (generateAuthApi) { _%>
router.use('/users', user)
router.use('/auth', auth)
<%_ } _%>
<%_ if (typeof passwordReset !== 'undefined' && passwordReset) { _%>
router.use('/password-resets', passwordReset)
<%_ } _%>

export default router
