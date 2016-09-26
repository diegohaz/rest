# generator-rest [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage percentage][coveralls-image]][coveralls-url] [![Dependency Status][daviddm-image]][daviddm-url]
> RESTful API generator using NodeJS, Express and Mongoose

[Watch this video](https://www.youtube.com/watch?v=6x-ijyG-ack) for an overview on how to use **generator-rest** and deploy your project to [Heroku](https://heroku.com).

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

## Generators

Then, you can use `yo` to generate your project.

```bash
yo rest # generate a new project
yo rest:api # generate a new api endpoint inside your project
```

## Commands

After you generate your project, these commands are available in `package.json`.

```bash
npm test # test using AVA
npm run test:unit # run unit tests
npm run test:integration # run integration tests
npm run coverage # open the last test coverage report on the browser
npm run lint # lint using ESLint
npm run dev # run the API in development mode
npm run prod # run the API in production mode
npm run build # build the project into dist folder
npm run docs # generate API docs
```

## Playing locally

First, run the server in development mode.

```bash
$ npm run dev
Express server listening on http://0.0.0.0:9000, in development mode
```

If you choose to generate the authentication API, you can start to play with it.
> Note that creating and authenticating users needs a master key (which is defined in the `.env` file)

Create a user (sign up):
```bash
curl -X POST http://0.0.0.0:9000/users -i -d "email=test@example.com&password=123456&access_token=MASTER_KEY_HERE"
```

It will return something like:
```bash
HTTP/1.1 201 Created
...
{
  "id": "57d8160eabfa186c7887a8d3",
  "name": "test",
  "picture":"https://gravatar.com/avatar/55502f40dc8b7c769880b10874abc9d0?d=identicon",
  "email": "test@example.com",
  "createdAt": "2016-09-13T15:06:54.633Z"
}
```

Authenticate the user (sign in):
```bash
curl -X POST http://0.0.0.0:9000/auth -i -u test@example.com:123456 -d "access_token=MASTER_KEY_HERE"
```

It will return something like:
```bash
HTTP/1.1 201 Created
...
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  "user": {
    "id": "57d8160eabfa186c7887a8d3",
    "name": "test",
    "picture": "https://gravatar.com/avatar/55502f40dc8b7c769880b10874abc9d0?d=identicon",
    "email": "test@example.com",
    "createdAt":"2016-09-13T15:06:54.633Z"
  }
}
```

Now you can use the `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9` token (it's usually greater than this) to call user protected APIs. For example, you can create a new `article` API using `yo rest:api` and make the `POST /articles` endpoint only accessible to authenticated users. Then, to create a new article you must pass the `access_token` parameter.
```bash
curl -X POST http://0.0.0.0:9000/articles -i -d "title=Awesome Article&content=Yeah Baby&access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
```

It will return something like:
```bash
HTTP/1.1 201 Created
...
{
  "id": "57d819bfabfa186c7887a8d6",
  "title": "Awesome Article",
  "content": "Yeah Baby",
  "createdAt": "2016-09-13T15:22:39.846Z",
  "updatedAt":"2016-09-13T15:22:39.846Z"
}
```

> Some endpoints are only accessible by admin users. To create an admin user, just pass the `role=admin` along to other data when calling `POST /users`.

## Deploy

You can easily build your project by executing `npm run build`. It will put the build files in `./dist` so you can deploy its content anywhere.

Here is an example on how to deploy to [Heroku](https://heroku.com) using [Heroku CLI](https://devcenter.heroku.com/articles/heroku-command-line):
```bash
# build files and change directory to ./dist
npm run build
cd dist

# start a new local git repository inside there
git init

# create a new heroku app
heroku apps:create my-new-app

# add heroku remote reference to the local repository
heroku git:remote --app my-new-app

# add the MongoLab addon to the heroku app
heroku addons:create mongolab

# set the environment variables to the heroku app (see the .env file in root directory)
heroku config:set MASTER_KEY=masterKey JWT_SECRET=jwtSecret

# commit and push the build files
git add -A
git commit -m "Some commit message"
git push heroku master

# open the deployed app in the browser
heroku open
```

The second time you deploy, you just need to:

```bash
npm run build
cd dist
git add -A
git commit -m "Some commit message"
git push heroku master
heroku open
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
- Socket.io support

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
