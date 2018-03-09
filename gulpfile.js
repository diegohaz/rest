const path = require('path');
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const excludeGitignore = require('gulp-exclude-gitignore');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const nsp = require('gulp-nsp');
const plumber = require('gulp-plumber');
const coveralls = require('gulp-coveralls');

gulp.task('lint', () => {
  return gulp.src('generators/!(templates)**/index.js')
  .pipe(excludeGitignore())
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());
});

gulp.task('nsp', (cb) => {
  nsp({package: path.resolve('package.json')}, cb);
});

gulp.task('pre-test',() => {
  return gulp.src(['generators/!(templates)**/index.js'])
  .pipe(excludeGitignore())
  .pipe(istanbul({
    includeUntested: true
  }))
  .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], (cb) => {
  let mochaErr;

  gulp.src('test/**/*.js')
  .pipe(plumber())
  .pipe(mocha({reporter: 'spec', timeout: 600000}))
  .on('error', (err) => {
    mochaErr = err;
  })
  .pipe(istanbul.writeReports())
  .on('end', () => {
    cb(mochaErr);
  });

});

gulp.task('watch', () => {
  gulp.watch(['generators/**/*.js', 'test/**'], ['test']);
});

gulp.task('coveralls', ['test'], () => {
  if (!process.env.CI) {
    return;
  }

  return gulp.src(path.join(__dirname, 'coverage/lcov.info')).pipe(coveralls());
  
});

gulp.task('prepublish', ['nsp']);
gulp.task('default', ['test', 'coveralls']);
