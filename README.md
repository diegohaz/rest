# rest [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> RESTful API generator using NodeJS, Express and Mongoose

📹 [Watch this video](https://www.youtube.com/watch?v=6x-ijyG-ack) for an overview on how to use **generator-rest** and deploy your project to [Heroku](https://heroku.com).

<br>
<hr>
<p align="center">
If you find this useful, please don't forget to star ⭐️ the repo, as this will help to promote the project.<br>
Follow me on <a href="https://twitter.com/diegohaz">Twitter</a> and <a href="https://github.com/diegohaz">GitHub</a> to keep updated about this project and <a href="https://github.com/diegohaz?tab=repositories">others</a>.
</p>
<hr>
<br>

## Features

 - **Highly customizable** - You can choose what to install
 - **Really RESTful** - It follows the best practices
 - **ES6!** - Using [babel](https://babeljs.io/)
 - **User registration API** - Using [passport](http://passportjs.org/) (optional)
 - **Social login API** - Facebook, Google and GitHub (optional)
 - **Password reset API** - Sending emails with [SendGrid API](https://sendgrid.com/docs/API_Reference/index.html) (optional)
 - **Listing query strings** - `q`, `page`, `limit`, `fields` etc. already provided by [querymen](https://github.com/diegohaz/querymen)
 - **Query string validator** - Using [querymen](https://github.com/diegohaz/querymen)
 - **Request body validator** - Using [bodymen](https://github.com/diegohaz/bodymen)
 - **Standard error responses** - Using [querymen](https://github.com/diegohaz/querymen) and [bodymen](https://github.com/diegohaz/bodymen) error handlers
 - **Unit and integration tests** - Using [Jest](https://github.com/facebook/jest)
 - **Continuous integration support** - Using [Travis CI](https://travis-ci.org/)
 - **API docs generator** - Using [apidoc](http://apidocjs.com/)
 - **WebSockets** - Using [primus](https://github.com/primus/primus)
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
npm test # test using Jest
npm run coverage # test and open the coverage report in the browser
npm run lint # lint using ESLint
npm run dev # run the API in development mode
npm run prod # run the API in production mode
npm run docs # generate API docs
```

## Playing locally

First, you will need to install and run [MongoDB](https://www.mongodb.com/) in another terminal instance.

```bash
$ mongod
```

Then, run the server in development mode.

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

If you choose to generate the WebSockets set up you can connect directly to the server. You can see an example on [real-time-react](https://github.com/adamhepton/real-time-react).

## Deploy

Here is an example on how to deploy to [Heroku](https://heroku.com) using [Heroku CLI](https://devcenter.heroku.com/articles/heroku-command-line):
```bash
# start a new local git repository
git init

# create a new heroku app
heroku apps:create my-new-app

# add heroku remote reference to the local repository
heroku git:remote --app my-new-app

# add the MongoLab addon to the heroku app
heroku addons:create mongolab

# set the environment variables to the heroku app (see the .env file in root directory)
heroku config:set MASTER_KEY=masterKey JWT_SECRET=jwtSecret

# commit and push the files
git add -A
git commit -m "Initial commit"
git push heroku master

# open the deployed app in the browser
heroku open
```

The second time you deploy, you just need to:

```bash
git add -A
git commit -m "Update code"
git push heroku master
```

## Directory structure

### Overview

You can customize the `src` and `api` directories.

```
src/
├─ api/
│  ├─ user/
│  │  ├─ controller.js
│  │  ├─ index.js
│  │  ├─ index.test.js
│  │  ├─ model.js
│  │  └─ model.test.js
│  └─ index.js
├─ services/
│  ├─ express/
│  ├─ facebook/
│  ├─ mongoose/
│  ├─ passport/
│  ├─ sendgrid/
│  └─ your-service/
├─ app.js
├─ config.js
└─ index.js
```

### src/api/

Here is where the API endpoints are defined. Each API has its own folder.

#### src/api/some-endpoint/model.js

It defines the Mongoose schema and model for the API endpoint. Any changes to the data model should be done here.

#### src/api/some-endpoint/controller.js

This is the API controller file. It defines the main router middlewares which use the API model.

#### src/api/some-endpoint/events.js

This is the events handler for the WebSockets. Binds a handler to the `post(event)` method on the model.

#### src/api/some-endpoint/socket.js

This is the WebSockets handler. Receives the events emitted by `some-endpoint/events.js` file and sends it to the spark.

#### src/api/some-endpoint/index.js

This is the entry file of the API. It defines the routes using, along other middlewares (like session, validation etc.), the middlewares defined in the `some-endpoint.controller.js` file.

### services/

Here you can put `helpers`, `libraries` and other types of modules which you want to use in your APIs.

## TODO

- Support optional phone authentication
- Support optional email confirmation process
- Support Twitter and other social login methods
- WebSockets configuration tests (`events.test.js` and `socket.test.js`)

PRs are welcome.

## Credits

[@QzSG](https://github.com/QzSG) and all [contributors](https://github.com/diegohaz/generator-rest/graphs/contributors)

## License

MIT © [Diego Haz](https://github.com/diegohaz)


[npm-image]: https://badge.fury.io/js/generator-rest.svg
[npm-url]: https://npmjs.org/package/generator-rest
[travis-image]: https://travis-ci.org/diegohaz/rest.svg?branch=master
[travis-url]: https://travis-ci.org/diegohaz/rest
[coveralls-image]: https://coveralls.io/repos/diegohaz/rest/badge.svg
[coveralls-url]: https://coveralls.io/r/diegohaz/rest
