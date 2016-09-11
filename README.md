# generator-rest [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage percentage][coveralls-image]][coveralls-url] [![Dependency Status][daviddm-image]][daviddm-url]
> RESTful API generator using NodeJS, Express and Mongoose

## Features

 - **Highly customizable** - You can choose what to install
 - **Really RESTful** - It follows the best practices
 - **ES6!** - Using [babel](https://babeljs.io/)
 - **User registration API** - Using [passport](http://passportjs.org/) (optional)
 - **Social login API** - Currently only Facebook (optional)
 - **Password reset API** - Sending emails with [SendGrid API](https://sendgrid.com/docs/API_Reference/index.html) (optional)
 - **Listing query strings** - `q`, `page`, `limit`, `fields` etc. already provided by [querymen](https://github.com/diegohaz/querymen)
 - **Query string validator** - Using [querymen](https://github.com/diegohaz/querymen)
 - **Request body validator** - Using [bodymen](https://github.com/diegohaz/bodymen)
 - **Standard error responses** - Using [querymen](https://github.com/diegohaz/querymen) and [bodymen](https://github.com/diegohaz/bodymen) error handlers
 - **Unit and integration tests** - Using [AVA](https://github.com/avajs/ava)
 - **Continuous integration support** - Using [Travis CI](https://travis-ci.org/)
 - **API docs generator** - Using [apidoc](http://apidocjs.com/)
 - **Love ♥** - Using [me](https://github.com/diegohaz)

## Installation

First, install [Yeoman](http://yeoman.io) and generator-rest using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo
npm install -g generator-rest
```

Then generate your new project:

```bash
yo rest
```

## Directory structure

You can customize the `src` and `api` directories.

```
src/
├─ api/
│  ├─ user/
│  │  ├─ user.controller.js
│  │  ├─ user.model.js
│  │  ├─ user.model.test.js
│  │  ├─ user.router.js
│  │  └─ user.router.test.js
│  └─ another-endpoint/
├─ config/
│  ├─ index.js
│  ├─ express.js
│  └─ mongoose.js
├─ services/
│  ├─ facebook/
│  ├─ passport/
│  ├─ sendgrid/
│  └─ your-service/
├─ app.js
├─ index.js
└─ routes.js
```

## TODO

- Support optional phone authentication
- Support optional email confirmation process
- Support Google, Twitter, GitHub and other social login methods

PRs are welcome.

## License

MIT © [Diego Haz](https://github.com/diegohaz)


[npm-image]: https://badge.fury.io/js/generator-rest.svg
[npm-url]: https://npmjs.org/package/generator-rest
[travis-image]: https://travis-ci.org/diegohaz/generator-rest.svg?branch=master
[travis-url]: https://travis-ci.org/diegohaz/generator-rest
[daviddm-image]: https://david-dm.org/diegohaz/generator-rest.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/diegohaz/generator-rest
[coveralls-image]: https://coveralls.io/repos/diegohaz/generator-rest/badge.svg
[coveralls-url]: https://coveralls.io/r/diegohaz/generator-rest
