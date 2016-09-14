'use strict';
var path = require('path');
var yeoman = require('yeoman-generator');
var pluralize = require('pluralize');
var _ = require('lodash');
var recast = require('recast');

module.exports = yeoman.Base.extend({
  prompting: function () {
    var srcDir = this.config.get('srcDir') || 'src';
    var apiDir = this.config.get('apiDir') || 'api';
    var authMethods = this.config.get('authMethods') || [];

    var methods = [
      {name: 'Create (POST)', value: 'POST'},
      {name: 'Retrieve list (GET)', value: 'GET LIST'},
      {name: 'Retrieve one (GET)', value: 'GET ONE'},
      {name: 'Update (PUT)', value: 'PUT'},
      {name: 'Delete (DELETE)', value: 'DELETE'}
    ];

    var getSelectedMethods = function (props) {
      return methods.filter(function (method) {
        return props.methods.indexOf(method.value) !== -1;
      });
    };

    var prompts = [{
      type: 'input',
      name: 'kebab',
      message: 'What\'s the API name?',
      default: 'some-entity'
    }, {
      type: 'input',
      name: 'kebabs',
      message: 'What\'s the endpoint name?',
      default: function (props) {
        return pluralize(props.kebab);
      }
    }, {
      type: 'input',
      name: 'dir',
      message: 'Where to put the code?',
      default: srcDir + '/' + apiDir
    }, {
      type: 'checkbox',
      name: 'methods',
      message: 'Which methods it will have?',
      default: methods.map(function (method) {
        return method.value;
      }),
      choices: methods.map(function (method) {
        return _.assign({}, method, {checked: true});
      })
    }, {
      type: 'checkbox',
      name: 'masterMethods',
      message: 'Which methods are protected by the master key?',
      choices: getSelectedMethods,
      default: [],
      when: function () {
        return authMethods.length;
      }
    }, {
      type: 'checkbox',
      name: 'adminMethods',
      message: 'Which methods are only accessible by authenticated admin users?',
      default: [],
      choices: function (props) {
        var choices = getSelectedMethods(props);
        return choices.map(function (choice) {
          if (props.masterMethods.indexOf(choice.value) !== -1) {
            return _.assign({}, choice, {disabled: 'Accessible only with master key'});
          }
          return choice;
        });
      },
      when: function () {
        return authMethods.length;
      }
    }, {
      type: 'checkbox',
      name: 'userMethods',
      message: 'Which methods are only accessible by authenticated users?',
      default: [],
      choices: function (props) {
        var choices = getSelectedMethods(props);
        return choices.map(function (choice) {
          if (props.masterMethods.indexOf(choice.value) !== -1) {
            return _.assign({}, choice, {disabled: 'Accessible only with master key'});
          } else if (props.adminMethods.indexOf(choice.value) !== -1) {
            return _.assign({}, choice, {disabled: 'Accessible only by admin users'});
          }
          return choice;
        });
      },
      when: function () {
        return authMethods.length;
      }
    }, {
      type: 'confirm',
      name: 'generateModel',
      message: 'Do you want to generate a model?',
      default: true
    }, {
      type: 'input',
      name: 'modelFields',
      message: 'Which fields the model will have? (comma separated)',
      when: function (props) {
        return props.generateModel;
      }
    }, {
      type: 'confirm',
      name: 'storeUser',
      default: true,
      message: function (props) {
        return 'Do you want to store in a field the user who created the ' + props.kebab + '?';
      },
      when: function (props) {
        return props.generateModel && props.userMethods && props.userMethods.indexOf('POST') !== -1;
      }
    }, {
      type: 'input',
      name: 'userField',
      message: 'What\'s the name of the field which will store the user?',
      default: 'user',
      when: function (props) {
        return props.storeUser;
      }
    }];

    return this.prompt(prompts).then(function (props) {
      this.props = props;
      this.props.camel = _.camelCase(this.props.kebab);
      this.props.camels = pluralize(this.props.camel);
      this.props.pascal = _.upperFirst(this.props.camel);
      this.props.pascals = _.upperFirst(this.props.camels);
      this.props.lower = _.lowerCase(this.props.camel);
      this.props.lowers = _.lowerCase(this.props.camels);
      this.props.start = _.upperFirst(this.props.lower);
      this.props.starts = _.upperFirst(this.props.lowers);
      this.props.authMethods = authMethods;
      this.props.srcDir = srcDir;
      this.props.apiDir = apiDir;

      this.props.modelFields = this.props.modelFields || '';
      this.props.modelFields = this.props.modelFields ?
        this.props.modelFields.split(',').map(function (field) {
          return field.trim();
        }) : [];

      this.props.storeUser = this.props.storeUser || false;

      if (props.userField && this.props.modelFields.indexOf(props.userField) !== -1) {
        this.props.modelFields.splice(this.props.modelFields.indexOf(props.userField), 1);
      }
    }.bind(this));
  },

  writing: function () {
    var props = this.props;
    var routesFile = path.join(props.srcDir, 'routes.js');
    var copyTpl = this.fs.copyTpl.bind(this.fs);
    var tPath = this.templatePath.bind(this);
    var dPath = this.destinationPath.bind(this);
    var filepath = function (filename) {
      return path.join(props.dir, props.kebab, filename.replace('api', props.kebab));
    };

    copyTpl(tPath('api.controller.js'), dPath(filepath('api.controller.js')), props);
    copyTpl(tPath('api.router.js'), dPath(filepath('api.router.js')), props);
    copyTpl(tPath('api.router.test.js'), dPath(filepath('api.router.test.js')), props);
    copyTpl(tPath('package.json'), dPath(filepath('package.json')), props);

    if (props.generateModel) {
      copyTpl(tPath('api.model.js'), dPath(filepath('api.model.js')), props);
      copyTpl(tPath('api.model.test.js'), dPath(filepath('api.model.test.js')), props);
    }

    if (this.fs.exists(routesFile)) {
      var ast = recast.parse(this.fs.read(routesFile));
      var body = ast.program.body;
      var lastImportIndex = _.findLastIndex(body, function (statement) {
        return statement.type === 'ImportDeclaration';
      });
      var actualImportCode = recast.print(body[lastImportIndex]).code;
      var importString = [
        'import ', props.camel, ' from \'./', props.apiDir, '/', props.kebab, '\''
      ].join('');
      body.splice(lastImportIndex, 1, importString);
      body.splice(lastImportIndex, 0, actualImportCode);

      var middlewareString = [
        'router.use(\'/', props.kebabs, '\', ', props.camel, ')'
      ].join('');
      var lastMiddlewareIndex = _.findLastIndex(body, function (statement) {
        if (!statement.expression || !statement.expression.callee) {
          return false;
        }
        var callee = statement.expression.callee;
        return callee.object.name === 'router' && callee.property.name === 'use';
      });

      if (lastMiddlewareIndex === -1) {
        var exportRouterIndex = _.findIndex(body, function (statement) {
          return statement.type === 'ExportDefaultDeclaration';
        });
        body.splice(exportRouterIndex, 0, middlewareString);
      } else {
        var actualMiddlewareCode = recast.print(body[lastMiddlewareIndex]).code;
        body.splice(lastMiddlewareIndex, 1, middlewareString);
        body.splice(lastMiddlewareIndex, 0, actualMiddlewareCode);
      }

      this.fs.write(routesFile, recast.print(ast).code);
    }
  },

  install: function () {

  }
});
