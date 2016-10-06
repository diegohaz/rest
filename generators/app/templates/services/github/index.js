import request from 'request-promise'
import Promise from 'bluebird'

const userRequest = (accessToken) => request({
  uri: 'https://api.github.com/user',
  json: true,
  qs: {
    access_token: accessToken
  }
})

const emailRequest = (accessToken) => request({
  uri: 'https://api.github.com/user/emails',
  json: true,
  qs: {
    access_token: accessToken
  }
})

export const getUser = (accessToken) =>
  Promise.all([userRequest(accessToken), emailRequest(accessToken)])
    .spread((responseOfUserReq, responseOfEmailReq) => ({
      service: 'github',
      id: responseOfUserReq.id,
      name: responseOfUserReq.login,
      email: responseOfEmailReq[0].email,
      picture: responseOfUserReq.avatar_url
    }))
