'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var randtoken = require('rand-token');
var _ = require('lodash');

module.exports = yeoman.Base.extend({
  prompting: function () {
    var that = this;
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the slick ' + chalk.red('generator-rest') + ' generator!'
    ));

    return this.prompt([{
      type: 'input',
      name: 'name',
      message: 'What\'s the project name?',
      default: _.startCase(this.appname)
    }, {
      type: 'input',
      name: 'srcDir',
      message: 'Where to put the source code?',
      default: that.config.get('srcDir') || 'src'
    }, {
      type: 'input',
      name: 'apiDir',
      message: function (props) {
        return 'Where to put the API code (inside ./' + props.srcDir + ')?';
      },
      default: that.config.get('apiDir') || 'api'
    }, {
      type: 'confirm',
      name: 'https',
      message: 'Do you want to force SSL in production mode?',
      default: false
    }, {
      type: 'confirm',
      name: 'generateAuthApi',
      message: 'Do you want to generate authentication API?',
      default: true
    }, {
      type: 'checkbox',
      name: 'authMethods',
      message: 'Which types of authentication do you want to enable?',
      default: ['password'],
      choices: [
        'password',
        'facebook',
        'github',
        'google',
        {name: 'twitter', disabled: 'Soon - PRs are welcome (see: https://github.com/diegohaz/generator-rest/issues/8)'}
      ],
      when: function (props) {
        return props.generateAuthApi;
      }
    }, {
      type: 'confirm',
      name: 'authOnUserCreate',
      message: 'Do you want to sign in user after create?',
      default: false,
      when: function (props) {
        return props.generateAuthApi && props.authMethods.indexOf('password') !== -1;
      }
    }, {
      type: 'confirm',
      name: 'passwordReset',
      message: 'Do you want to generate password reset API (it will need a SendGrid API Key)?',
      default: false,
      when: function (props) {
        return props.generateAuthApi && props.authMethods.indexOf('password') !== -1;
      }
    }, {
      type: 'input',
      name: 'sendgridKey',
      message: 'What\'s your SendGrid API Key (you can skip this and update the .env file later)?',
      default: 'key',
      when: function (props) {
        return props.passwordReset;
      }
    }, {
      type: 'confirm',
      name: 'getList',
      message: 'Do you want the retrieve methods from users (GET) to have the form { rows, count } ?',
      default: false,
      when: function (props) {
        return props.authMethods;
      }
    }]).then(function (props) {
      that.props = props;
      that.props.authOnUserCreate = props.authOnUserCreate || false;
      that.props.slug = _.kebabCase(that.props.name);
      that.props.passwordSignup = props.authMethods && props.authMethods.indexOf('password') !== -1;
      that.props.authServices = props.authMethods && props.authMethods.filter(function (method) {
        return method !== 'password';
      });
      that.props.masterKey = randtoken.uid(32);
      if (that.props.generateAuthApi) {
        that.props.jwtSecret = randtoken.uid(32);
      }
      that.config.set({
        srcDir: props.srcDir,
        apiDir: props.apiDir,
        authMethods: props.authMethods || []
      });
    });
  },

  writing: function () {
    var props = this.props;
    var copy = this.fs.copy.bind(this.fs);
    var copyTpl = this.fs.copyTpl.bind(this.fs);
    var tPath = this.templatePath.bind(this);
    var dPath = this.destinationPath.bind(this);

    copy(tPath('editorconfig'), dPath('.editorconfig'));
    copy(tPath('eslintrc'), dPath('.eslintrc'));
    copy(tPath('babelrc'), dPath('.babelrc'));
    copyTpl(tPath('gitignore'), dPath('.gitignore'), props);
    copyTpl(tPath('travis.yml'), dPath('.travis.yml'), props);
    copyTpl(tPath('env'), dPath('.env'), props);
    copyTpl(tPath('env.example'), dPath('.env.example'), props);
    copyTpl(tPath('_package.json'), dPath('package.json'), props);
    copyTpl(tPath('README.md'), dPath('README.md'), props);
    copyTpl(tPath('src'), dPath(props.srcDir), props);
    copyTpl(tPath('test'), dPath('test'), props);
    copyTpl(tPath('services/response'), dPath(props.srcDir + '/services/response'), props);
    copyTpl(tPath('api/index.js'), dPath(props.srcDir + '/' + props.apiDir + '/index.js'), props);

    if (props.generateAuthApi) {
      copyTpl(tPath('services/passport'), dPath(props.srcDir + '/services/passport'), props);
      copyTpl(tPath('services/jwt'), dPath(props.srcDir + '/services/jwt'), props);
      copyTpl(tPath('api/user'), dPath(props.srcDir + '/' + props.apiDir + '/user'), props);

      if (props.authMethods.length) {
        copyTpl(tPath('api/auth'), dPath(props.srcDir + '/' + props.apiDir + '/auth'), props);
      }

      props.authServices.forEach(function (service) {
        copyTpl(tPath('services/' + service), dPath(props.srcDir + '/services/' + service), props);
      });
    }

    if (props.passwordReset && props.sendgridKey) {
      copyTpl(
        tPath('api/password-reset'),
        dPath(props.srcDir + '/' + props.apiDir + '/password-reset'),
        props
      );
    }

    if (props.sendgridKey) {
      copyTpl(tPath('services/sendgrid'), dPath(props.srcDir + '/services/sendgrid'), props);
    }
  },

  install: function () {
    this.installDependencies({bower: false});
  }
});
