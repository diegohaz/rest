import gulp from 'gulp'
import del from 'del'
import lazypipe from 'lazypipe'
import loadPlugins from 'gulp-load-plugins'
import runSequence from 'run-sequence'
import { Instrumenter } from 'isparta'

const paths = {}
paths.src = '<%= srcDir %>'
paths.dist = 'dist'
paths.scripts = [
  `${paths.src}/**/!(*.spec|*.integration).js`,
  `!${paths.src}/config/local.env.sample.js`
]
paths.test = {
  unit: [`${paths.src}/**/*.spec.js`, 'mocha.global.js'],
  integration: [`${paths.src}/**/*.integration.js`, 'mocha.global.js']
}

const plugins = loadPlugins()

const mocha = lazypipe()
  .pipe(plugins.mocha, {
    reporter: 'spec',
    timeout: 5000,
    require: ['./mocha.conf']
  })

const istanbul = lazypipe()
  .pipe(plugins.istanbul.writeReports)
  .pipe(plugins.istanbulEnforcer, {
    thresholds: {
      global: {
        lines: 80,
        statements: 80,
        branches: 80,
        functions: 80
      }
    },
    coverageDirectory: './coverage',
    rootDirectory: ''
  })

const babel = lazypipe()
  .pipe(plugins.sourcemaps.init)
  .pipe(plugins.babel)
  .pipe(plugins.sourcemaps.write, '.')

const express = (env) => {
  plugins.express.run(
    env === 'prod' ? [`${paths.dist}/${paths.src}`] : [paths.src],
    undefined,
    false
  )
  gulp.watch([`${paths.src}/**/*`], plugins.express.run)
}

gulp.task('env:all', () => {
  let vars
  try {
    vars = require(`./${paths.src}/config/local.env`)
  } catch (e) {
    vars = {}
  }
  plugins.env({ vars })
})

gulp.task('env:test', () => {
  plugins.env({
    vars: { NODE_ENV: 'test' }
  })
})

gulp.task('env:prod', () => {
  plugins.env({
    vars: { NODE_ENV: 'production' }
  })
})

gulp.task('lint', () => {
  return gulp.src(paths.scripts)
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format())
})

gulp.task('mocha:unit', () => {
  return gulp.src(paths.test.unit)
    .pipe(mocha())
})

gulp.task('mocha:integration', () => {
  return gulp.src(paths.test.integration)
    .pipe(mocha())
})

gulp.task('test:pre', () => {
  return gulp.src(paths.scripts)
    .pipe(plugins.istanbul({
      instrumenter: Instrumenter,
      includeUntested: true
    }))
    .pipe(plugins.istanbul.hookRequire())
})

gulp.task('istanbul', () => {
  return gulp.src(paths.scripts)
    .pipe(istanbul())
})

gulp.task('test:unit', (cb) => {
  runSequence(
    'lint',
    'test:pre',
    'env:all',
    'env:test',
    'mocha:unit',
    'istanbul',
    cb
  )
})

gulp.task('test:integration', (cb) => {
  runSequence(
    'lint',
    'test:pre',
    'env:all',
    'env:test',
    'mocha:integration',
    'istanbul',
    cb
  )
})

gulp.task('test', (cb) => {
  runSequence(
    'lint',
    'test:pre',
    'env:all',
    'env:test',
    'mocha:unit',
    'mocha:integration',
    'istanbul',
    cb
  )
})

gulp.task('clean', () => {
  return del([`${paths.dist}/!(.git*|Procfile)**`], {dot: true})
})

gulp.task('copy', () => {
  return gulp.src('package.json')
    .pipe(gulp.dest(paths.dist))
})

gulp.task('transpile', () => {
  return gulp.src(paths.scripts)
    .pipe(babel())
    .pipe(gulp.dest(`${paths.dist}/${paths.src}`))
})

gulp.task('build', (cb) => {
  runSequence(
    'clean',
    ['copy', 'transpile'],
    cb
  )
})

gulp.task('express:dev', () => {
  return express('dev')
})

gulp.task('express:prod', () => {
  return express('prod')
})

gulp.task('serve', ['serve:dev'])

gulp.task('serve:dev', (cb) => {
  runSequence(
    'env:all',
    'express:dev',
    cb
  )
})

gulp.task('serve:prod', (cb) => {
  runSequence(
    'build',
    'env:all',
    'env:prod',
    'express:prod',
    cb
  )
})

gulp.task('watch', () => {
  gulp.watch([`${paths.src}/**/*`], ['test'])
})

gulp.task('default', (cb) => {
  runSequence(
    'test',
    'build',
    'serve',
    cb
  )
})
