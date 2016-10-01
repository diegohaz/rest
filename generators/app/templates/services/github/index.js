import request from 'request-promise'
import bluebird from 'bluebird'

var userRequest = request({
    uri: 'https://api.github.com/user',
    json: true,
    qs: {
        access_token: accessToken
    }
})

var emailRequest = request({
    uri: 'https://api.github.com/user/emails',
    json: true,
    qs: {
        access_token: accessToken
    }
})

export const getMe = ({ accessToken, fields }) =>
    bluebird.all([userRequest, emailRequest])
        .spread((responseOfUserReq, responseOfEmailReq) => ({
            service: "GitHub",
            id: responseOfUserReq.id,
            name: responseOfUserReq.login,
            email: responseOfEmailReq[0].email,
            picture: responseOfUserReq.avatar_url
        }))