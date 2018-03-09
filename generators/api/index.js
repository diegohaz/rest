const path = require('path');
const generator = require('yeoman-generator');
const pluralize = require('pluralize');
const { camelCase, findLastIndex, findIndex, upperFirst, lowerCase } = require('lodash');
const recast = require('recast');
const reservedWords = require('reserved-words');

module.exports = class extends generator {

  prompting () {
    const srcDir = this.config.get('srcDir') || 'src';
    const apiDir = this.config.get('apiDir') || 'api';
    const authMethods = this.config.get('authMethods') || [];

    const  methods = [
      { name: 'Create (POST)', value: 'POST' },
      { name: 'Retrieve list (GET)', value: 'GET LIST' },
      { name: 'Retrieve one (GET)', value: 'GET ONE' },
      { name: 'Update (PUT)', value: 'PUT' },
      { name: 'Delete (DELETE)', value: 'DELETE' }
    ];

    const getSelectedMethods = (props) => {
      return methods.filter((method) => {
        return props.methods.indexOf(method.value) !== -1;
      });
    };

    const prompts = [{
      type: 'input',
      name: 'kebab',
      message: 'What\'s the API name?',
      default: 'some-entity'
    },
    {
      type: 'input',
      name: 'lowerSuffix',
      message: 'Name is a reserved word, add suffix for lowercase identifier',
      default: 'Obj',
      when (props) {
        return reservedWords.check(lowerCase(props.kebab), 6);
      }
    },
    {
      type: 'input',
      name: 'kebabs',
      message: 'What\'s the endpoint name?',
      default (props) {
        return pluralize(props.kebab);
      }
    },
    {
      type: 'input',
      name: 'dir',
      message: 'Where to put the code?',
      default: srcDir + '/' + apiDir
    },
    {
      type: 'checkbox',
      name: 'methods',
      message: 'Which methods it will have?',
      default: methods.map((method) => {
        return method.value;
      }),
      choices: methods.map((method) => {
        return Object.assign({}, method, {checked: true});
      })
    },
    {
      type: 'checkbox',
      name: 'masterMethods',
      message: 'Which methods are protected by the master key?',
      choices: getSelectedMethods,
      default: [],
      when () {
        return authMethods.length;
      }
    },
    {
      type: 'checkbox',
      name: 'adminMethods',
      message: 'Which methods are only accessible by authenticated admin users?',
      default: [],
      choices (props) {
        const choices = getSelectedMethods(props);
        return choices.map((choice) => {
          if (props.masterMethods.indexOf(choice.value) !== -1) {
            return Object.assign({}, choice, {disabled: 'Accessible only with master key'});
          }
          return choice;
        });
      },
      when () {
        return authMethods.length;
      }
    },
    {
      type: 'checkbox',
      name: 'userMethods',
      message: 'Which methods are only accessible by authenticated users?',
      default: [],
      choices (props) {

        const choices = getSelectedMethods(props);
        
        return choices.map((choice) => {

          if (props.masterMethods.indexOf(choice.value) !== -1) {
            return Object.assign({}, choice, {disabled: 'Accessible only with master key'});
          }
          else if (props.adminMethods.indexOf(choice.value) !== -1) {
            return Object.assign({}, choice, {disabled: 'Accessible only by admin users'});
          }

          return choice;

        });
      },
      when () {
        return authMethods.length;
      }
    },
    {
      type: 'confirm',
      name: 'generateModel',
      message: 'Do you want to generate a model?',
      default: true
    },
    {
      type: 'input',
      name: 'modelFields',
      message: 'Which fields the model will have? (comma separated, do not include id)',
      when (props) {
        return props.generateModel;
      }
    },
    {
      type: 'confirm',
      name: 'storeUser',
      default: true,
      message (props) {
        return 'Do you want to store in a field the user who created the ' + props.kebab + '?';
      },
      when (props) {
        return props.generateModel && props.userMethods && props.userMethods.indexOf('POST') !== -1;
      }
    },
    {
      type: 'input',
      name: 'userField',
      message: 'What\'s the name of the field which will store the user?',
      default: 'user',
      when (props) {
        return props.storeUser;
      }
    },
    {
      type: 'confirm',
      name: 'getList',
      message: 'Do you want the retrieve methods (GET) to have the form { rows, count } ?',
      default: false,
      when (props) {
        const methods = getSelectedMethods(props);
        
        return methods.find((method) => {
          return method.value === 'GET LIST';
        }) && props.generateModel;
      }
    }];

    return this.prompt(prompts).then((props) => {
      this.props = props;
      this.props.camel   = camelCase(this.props.kebab);
      this.props.camels  = pluralize(this.props.camel);
      this.props.pascal  = upperFirst(this.props.camel);
      this.props.pascals = upperFirst(this.props.camels);
      this.props.lower   = lowerCase(this.props.camel);
      this.props.lowers  = lowerCase(this.props.camels);
      this.props.start   = upperFirst(this.props.lower);
      this.props.starts  = upperFirst(this.props.lowers);

      // append suffix so we don't get reserved word clashes
      if (this.props.lowerSuffix) {
        this.props.camel = lowerCase(this.props.camel) + this.props.lowerSuffix;
      }

      this.props.authMethods = authMethods;
      this.props.srcDir = srcDir;
      this.props.apiDir = apiDir;

      this.props.modelFields = this.props.modelFields || '';
      this.props.modelFields = this.props.modelFields ?
      this.props.modelFields.split(',').map((field) => {
        return field.trim();
      }) : [];

      this.props.getList = props.getList || false;
      this.props.storeUser = this.props.storeUser || false;

      if (props.userField && this.props.modelFields.indexOf(props.userField) !== -1) {
        this.props.modelFields.splice(this.props.modelFields.indexOf(props.userField), 1);
      }
    });
  }
  writing () {

    const props = this.props;
    const routesFile = path.join(props.dir, 'index.js');
    const copyTpl = this.fs.copyTpl.bind(this.fs);
    const tPath = this.templatePath.bind(this);
    const dPath = this.destinationPath.bind(this);
    const filepath = (filename) => {
      return path.join(props.dir, props.kebab, filename);
    };

    copyTpl(tPath('controller.js'), dPath(filepath('controller.js')), props);
    copyTpl(tPath('index.js'), dPath(filepath('index.js')), props);
    copyTpl(tPath('index.test.js'), dPath(filepath('index.test.js')), props);

    if (props.generateModel) {
      copyTpl(tPath('model.js'), dPath(filepath('model.js')), props);
      copyTpl(tPath('model.test.js'), dPath(filepath('model.test.js')), props);
    }

    if (this.fs.exists(routesFile)) {

      const ast = recast.parse(this.fs.read(routesFile));
      const body = ast.program.body;
      const lastImportIndex = findLastIndex(body, (statement) => {
        return statement.type === 'ImportDeclaration';
      });
      const actualImportCode = recast.print(body[lastImportIndex]).code;
      const importString = ['import ', props.camel, ' from \'./', props.kebab, '\''].join('');
      
      body.splice(lastImportIndex, 1, importString);
      body.splice(lastImportIndex, 0, actualImportCode);

      const middlewareString = ['router.use(\'/', props.kebabs, '\', ', props.camel, ')'].join('');

      const lastMiddlewareIndex = findLastIndex(body, function (statement) {
        if (!statement.expression || !statement.expression.callee) {
          return false;
        }

        const callee = statement.expression.callee;
        return callee.object.name === 'router' && callee.property.name === 'use';

      });

      if (lastMiddlewareIndex === -1) {

        const exportRouterIndex = findIndex(body, function (statement) {
          return statement.type === 'ExportDefaultDeclaration';
        });

        body.splice(exportRouterIndex, 0, middlewareString);
      }
      else {

        const actualMiddlewareCode = recast.print(body[lastMiddlewareIndex]).code;
        
        body.splice(lastMiddlewareIndex, 1, middlewareString);
        body.splice(lastMiddlewareIndex, 0, actualMiddlewareCode);
      }

      this.fs.write(routesFile, recast.print(ast).code);
    }
  }

  install () {

  }
};
