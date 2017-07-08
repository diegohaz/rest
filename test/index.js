'use strict';
var Promise = require('bluebird');
var path = require('path');
var fs = require('fs-extra');
var spawnCommand = require('yeoman-generator/lib/actions/spawn_command').spawnCommand;
var helpers = require('yeoman-test');

var authServices = ['facebook', 'github', 'google'];

function install(answers, done, generateApis) {
  return helpers.run(path.join(__dirname, '../generators/app'))
    .withPrompts(answers)
    .toPromise()
    .then(function (dir) {
      var promise = Promise.resolve(dir);

      if (generateApis) {
        console.log('Generating APIs...');
        promise = defaultApi(dir).then(function (dir) {
          return apiWithDifferentEndpointName(dir);
        }).then(function (dir) {
          return apiWithNoMethods(dir);
        }).then(function (dir) {
          return apiWithReservedWord(dir);
        }).then(function (dir) {
          return apiWithAllMasterMethods(dir);
        }).then(function (dir) {
          return apiWithAllAdminMethods(dir);
        }).then(function (dir) {
          return apiWithAllUserMethods(dir);
        }).then(function (dir) {
          return apiWithDifferentUserField(dir);
        }).then(function (dir) {
          return apiWithOnlyPostUserMethod(dir);
        }).then(function (dir) {
          return apiWithoutModel(dir);
        }).then(function (dir) {
          return apiWithModelFields(dir);
        }).then(function (dir) {
          return apiWithUserModelField(dir);
        }).then(function (dir) {
          return apiWithCountAndRowsGetList(dir);
        });
      }

      promise.then(function (dir) {
        console.log('Copying node_modules folder...');
        fs.ensureSymlinkSync(path.join(__dirname, '../node_modules'), path.join(dir, 'node_modules'));
        spawnCommand('npm', ['run', 'lint']).on('exit', function (err) {
          if (err) {
            return done(err);
          }
          if (process.env.CI) {
            spawnCommand('npm', ['test', '--', '-i', '--coverage']).on('exit', done);
          } else {
            spawnCommand('npm', ['test']).on('exit', done);
          }
        });
      }).catch(function (err) {
        console.log(err);
        console.log(err.stack);
        done(err);
      });
    });
}

function defaultApi(dir) {
  return api({
    kebab: 'default-api'
  }, dir);
}

function apiWithDifferentEndpointName(dir) {
  return api({
    kebab: 'different-endpoint',
    kebabs: 'tests'
  }, dir);
}

function apiWithNoMethods(dir) {
  console.log("apiWithNoMethods");
  return api({
    kebab: 'no-method',
    methods: []
  }, dir);
}

function apiWithReservedWord(dir) {
  return api({
    kebab: 'case'
  }, dir);
}

function apiWithAllMasterMethods(dir) {
  return api({
    kebab: 'all-master',
    masterMethods: ['POST', 'GET LIST', 'GET ONE', 'PUT', 'DELETE']
  }, dir);
}

function apiWithAllAdminMethods(dir) {
  return api({
    kebab: 'all-admin',
    adminMethods: ['POST', 'GET LIST', 'GET ONE', 'PUT', 'DELETE']
  }, dir);
}

function apiWithAllUserMethods(dir) {
  return api({
    kebab: 'all-user',
    userMethods: ['POST', 'GET LIST', 'GET ONE', 'PUT', 'DELETE']
  }, dir);
}

function apiWithDifferentUserField(dir) {
  console.log("apiWithDifferentUserField");
  return api({
    kebab: 'user-field',
    userMethods: ['POST', 'PUT', 'DELETE'],
    userField: 'author'
  }, dir);
}

function apiWithOnlyPostUserMethod(dir) {
  return api({
    kebab: 'only-post-user',
    userMethods: ['POST']
  }, dir);
}

function apiWithoutModel(dir) {
  return api({
    kebab: 'no-model',
    generateModel: false
  }, dir);
}

function apiWithModelFields(dir) {
  return api({
    kebab: 'field',
    modelFields: 'title, content'
  }, dir);
}

function apiWithUserModelField(dir) {
  return api({
    kebab: 'user-model-field',
    modelFields: 'user',
    userMethods: ['POST']
  }, dir);
}

function apiWithCountAndRowsGetList(dir) {
  return api({
    kebab: 'count-and-rows-get-list',
    getList: true
  }, dir);
}

function api(answers, dir) {
  return helpers.run(path.join(__dirname, '../generators/api'))
    .inTmpDir(function (tmpDir) {
      fs.copySync(dir, tmpDir);
    })
    .withPrompts(answers)
    .toPromise();
}

describe('generator-rest', function () {
  describe('default install', function () {
    before(function (done) {
      install({}, done, true);
    });
    it('should install and pass tests', function () {});
  });

  describe('install with password method and auth after user create', function () {
    before(function (done) {
      install({authMethods: ['password'], authOnUserCreate: true}, done);
    });
    it('should install and pass tests', function () {});
  });

  describe('install with password reset option', function () {
    before(function (done) {
      install({
        https: true,
        passwordReset: true
      }, done);
    });
    it('should install and pass tests', function () {});
  });

  describe('install with different src and api directories', function () {
    before(function (done) {
      install({srcDir: 'server', apiDir: 'endpoints'}, done, true);
    });
    it('should install and pass tests', function () {});
  });

  authServices.forEach(function (service) {
    describe('install with ' + service + ' auth method', function () {
      before(function (done) {
        install({authMethods: [service]}, done);
      });
      it('should install and pass tests', function () {});
    });
  });

  describe('install with all auth methods', function () {
    before(function (done) {
      install({authMethods: ['password'].concat(authServices)}, done);
    });
    it('should install and pass tests', function () {});
  });

  describe('install without auth API', function () {
    before(function (done) {
      install({generateAuthApi: false}, done, true);
    });
    it('should install and pass tests', function () {});
  });

  describe('install with { rows, count } API', function () {
    before(function (done) {
      install({getList: true}, done, true);
    });
    it('should install and pass tests', function () {});
  });
});
