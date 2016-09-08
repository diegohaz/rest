/* eslint-disable no-unused-vars */
import path from 'path'
import _ from 'lodash'

/* istanbul ignore next */
const requireProcessEnv = (name) => {
  if (!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable')
  }
  return process.env[name]
}

const config = {
  all: {
    env: process.env.NODE_ENV || 'development',
    root: path.join(__dirname, '../../..'),
    port: process.env.PORT || 9000,
    ip: process.env.IP || '0.0.0.0',
<%_ if (typeof defaultEmail !== 'undefined' && defaultEmail) { _%>
    defaultEmail: '<%= defaultEmail %>',
<%_ } _%>
<%_ if (typeof sendgridKey !== 'undefined' && sendgridKey) { _%>
    sendgridKey: requireProcessEnv('SENDGRID_KEY'),
<%_ } _%>
    mongo: {
      options: {
        db: {
          safe: true
        }
      }
    }
  },
  test: {
    mongo: {
      uri: '<%= mongoTestUri %>'
    }
  },
  development: {
    mongo: {
      uri: '<%= mongoDevUri %>'
    }
  },
  production: {
    ip: process.env.IP || undefined,
    port: process.env.PORT || 8080,
    mongo: {
      uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || '<%= mongoProdUri %>'
    }
  }
}

export default _.merge(config.all, config[config.all.env])
