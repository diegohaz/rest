'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
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
      name: 'projectName',
      message: 'Project name:',
      default: _.startCase(this.appname)
    }, {
      type: 'input',
      name: 'projectSlug',
      message: 'Project slug:',
      default: _.kebabCase(this.appname)
    }, {
      type: 'confirm',
      name: 'https',
      message: 'Force HTTPS in production mode?',
      default: false
    }, {
      type: 'input',
      name: 'srcDir',
      message: 'Source directory:',
      default: that.config.get('srcDir') || 'src'
    }, {
      type: 'input',
      name: 'apiDir',
      message: 'API directory:',
      default: that.config.get('apiDir') || 'api'
    }, {
      type: 'input',
      name: 'mongoTestUri',
      message: 'MongoDB test uri:',
      default: function (answers) {
        return 'mongodb://localhost/' + answers.projectSlug + '-test';
      }
    }, {
      type: 'input',
      name: 'mongoDevUri',
      message: 'MongoDB development uri:',
      default: function (answers) {
        return 'mongodb://localhost/' + answers.projectSlug + '-dev';
      }
    }, {
      type: 'input',
      name: 'mongoProdUri',
      message: 'MongoDB production uri:',
      default: function (answers) {
        return 'mongodb://localhost/' + answers.projectSlug;
      }
    }, {
      type: 'confirm',
      name: 'generateAuthApi',
      message: 'Generate authentication API?',
      default: true
    }, {
      type: 'confirm',
      name: 'facebookLogin',
      message: 'Enable Facebook login?',
      default: true,
      when: function (answers) {
        return answers.generateAuthApi;
      }
    }, {
      type: 'confirm',
      name: 'emailSignup',
      message: 'Enable email sign up?',
      default: true,
      when: function (answers) {
        return answers.generateAuthApi;
      }
    }, {
      type: 'confirm',
      name: 'passwordReset',
      message: 'Generate password reset API? (will need SendGrid API Key)',
      default: false,
      when: function (answers) {
        return answers.emailSignup;
      }
    }, {
      type: 'input',
      name: 'defaultEmail',
      message: 'Default sender email:',
      default: function (answers) {
        return 'no-reply@' + answers.projectSlug + '.com';
      },
      when: function (answers) {
        return answers.passwordReset;
      }
    }, {
      type: 'input',
      name: 'sendgridKey',
      message: 'SendGrid API Key (https://sendgrid.com/docs/Classroom/Send/How_Emails_Are_Sent/api_keys.html):',
      when: function (answers) {
        return answers.passwordReset;
      }
    }]).then(function (answers) {
      that.answers = answers;
      that.config.set({srcDir: answers.srcDir, apiDir: answers.apiDir});
    });
  },

  writing: function () {
    this.fs.copy(
      this.templatePath('babelrc'),
      this.destinationPath('.babelrc')
    );

    this.fs.copy(
      this.templatePath('editorconfig'),
      this.destinationPath('.editorconfig')
    );

    this.fs.copy(
      this.templatePath('eslintrc'),
      this.destinationPath('.eslintrc')
    );

    this.fs.copyTpl(
      this.templatePath('gitignore'),
      this.destinationPath('.gitignore'),
      this.answers
    );

    this.fs.copy(
      this.templatePath('travis.yml'),
      this.destinationPath('.travis.yml')
    );

    this.fs.copyTpl(
      this.templatePath('gulpfile.babel.js'),
      this.destinationPath('gulpfile.babel.js'),
      this.answers
    );

    this.fs.copy(
      this.templatePath('mocha.conf.js'),
      this.destinationPath('mocha.conf.js')
    );

    this.fs.copy(
      this.templatePath('mocha.global.js'),
      this.destinationPath('mocha.global.js')
    );

    this.fs.copyTpl(
      this.templatePath('package.json'),
      this.destinationPath('package.json'),
      this.answers
    );

    this.fs.copyTpl(
      this.templatePath('README.md'),
      this.destinationPath('README.md'),
      this.answers
    );

    this.fs.copyTpl(
      this.templatePath('src'),
      this.destinationPath(this.answers.srcDir),
      this.answers
    );

    this.fs.copyTpl(
      this.templatePath('services/response'),
      this.destinationPath(this.answers.srcDir + '/services/response'),
      this.answers
    );

    if (this.answers.generateAuthApi) {
      this.fs.copyTpl(
        this.templatePath('services/passport'),
        this.destinationPath(this.answers.srcDir + '/services/passport'),
        this.answers
      );

      this.fs.copyTpl(
        this.templatePath('api/user'),
        this.destinationPath(this.answers.srcDir + '/' + this.answers.apiDir + '/user'),
        this.answers
      );

      this.fs.copyTpl(
        this.templatePath('api/session'),
        this.destinationPath(this.answers.srcDir + '/' + this.answers.apiDir + '/session'),
        this.answers
      );
    }

    if (this.answers.facebookLogin) {
      this.fs.copyTpl(
        this.templatePath('services/facebook'),
        this.destinationPath(this.answers.srcDir + '/services/facebook'),
        this.answers
      );
    }

    if (this.answers.passwordReset && this.answers.sendgridKey) {
      this.fs.copyTpl(
        this.templatePath('api/password-reset'),
        this.destinationPath(
          this.answers.srcDir + '/' + this.answers.apiDir + '/password-reset'
        ),
        this.answers
      );
    }

    if (this.answers.sendgridKey) {
      this.fs.copyTpl(
        this.templatePath('services/sendgrid'),
        this.destinationPath(this.answers.srcDir + '/services/sendgrid'),
        this.answers
      );
    }
  },

  install: function () {
    // this.installDependencies();
  }
});
