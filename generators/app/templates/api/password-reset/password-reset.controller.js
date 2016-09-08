'use strict'

import { success, error, notFound } from '../../services/response/'
import { sendMail } from '../../services/sendgrid'
import PasswordReset from './password-reset.model'
import User from '../user/user.model'

export const create = ({ bodymen: { body: { email, link } } }, res) =>
  User.findOne({ email })
    .then(notFound(res))
    .then((user) => user ? PasswordReset.create({ user }) : null)
    .then((reset) => {
      if (!reset) return null
      const { user, token } = reset
      link = `${link.replace(/\/$/, '')}/${token}`
      const content = `
        Hey, ${user.name}.<br><br>
        You requested a new password for your <%= projectName %> account.<br>
        Please use the following link to set a new password. It will expire in 1 hour.<br><br>
        <a href="${link}">${link}</a><br><br>
        If you didn't make this request then you can safely ignore this email. :)<br><br>
        &mdash; <%= projectName %> Team
      `
      return sendMail({ toEmail: email, subject: '<%= projectName %> - Password Reset', content })
    })
    .then((response) => response ? success(res, response.statusCode)({}) : null)
    .catch(error(res))

export const show = ({ params: { token } }, res) =>
  PasswordReset.findOne({ token })
    .populate('user')
    .then(notFound(res))
    .then((reset) => reset ? reset.view(true) : null)
    .then(success(res))
    .catch(error(res))

export const update = ({ params: { token }, bodymen: { body: { password } } }, res) => {
  return PasswordReset.findOne({ token })
    .populate('user')
    .then(notFound(res))
    .then((reset) => {
      if (!reset) return null
      const { user } = reset
      return user.set({ password }).save()
        .then(() => PasswordReset.remove({ user }))
        .then(() => user.view(true))
    })
    .then(success(res))
    .catch(error(res))
}
