'use strict';
var path = require('path');
var spawnCommand = require('yeoman-generator/lib/actions/spawn_command').spawnCommand;
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

function install (answers, done) {
  helpers.run(path.join(__dirname, '../generators/app'))
    .withPrompts(answers)
    .toPromise()
    .then(function () {
      spawnCommand('npm', ['install', '--silent', '--depth', 0, '--cache-min', Infinity])
        .on('exit', function (err) {
          if (!err) {
            spawnCommand('npm', ['run', 'lint']).on('exit', function (err) {
              if (!err && answers.generateAuthApi) {
                spawnCommand('npm', ['test']).on('exit', done);
              } else {
                done(err);
              }
            });
          } else {
            done(err);
          }
        });
    });
}

describe('generator-rest:app', function () {
  describe('full install', function () {
    before(function (done) {
      install({
        https: true,
        passwordReset: true,
        sendgridKey: 'sendgridKey'
      }, done);
    })
    it('should install and pass tests', function () {});
  });

  describe('default install', function () {
    before(function (done) {
      install({}, done);
    });
    it('should install and pass tests', function () {});
  });

  describe('install with different src and api directories', function () {
    before(function (done) {
      install({srcDir: 'server', apiDir: 'endpoints'}, done);
    });
    it('should install and pass tests', function () {});
  });

  describe('install without facebook auth', function () {
    before(function (done) {
      install({authMethods: ['email']}, done);
    });
    it('should install and pass tests', function () {});
  });

  describe('install without email auth', function () {
    before(function (done) {
      install({authMethods: ['facebook']}, done);
    });
    it('should install and pass tests', function () {});
  });

  describe('install without auth API', function () {
    before(function (done) {
      install({generateAuthApi: false}, done);
    });
    it('should install and pass tests', function () {});
  });
});
