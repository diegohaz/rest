import request from 'request-promise'

export const getMe = ({ accessToken, fields = 'name' }) =>
  request({
    uri: 'https://graph.facebook.com/me',
    json: true,
    qs: {
      access_token: accessToken,
      fields
    }
  })
