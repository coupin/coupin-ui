const config = require('./config');
const fs = require('fs');
const gulp = require('gulp');
const ngConfig = require('gulp-ng-config');

var ENV = process.env.NODE_ENV || 'development';

gulp.task('ng-config', function() {
  fs.writeFileSync('./config.json', JSON.stringify(config[ENV]));
  gulp.src('./config.json')
  .pipe(
    ngConfig('ngEnvVars.config')
  ).pipe(gulp.dest('./public/js/'))
});