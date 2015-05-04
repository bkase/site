var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var gulp = require('gulp');

gulp.task('sass', function() {
  gulp.src('./scss/*.scss')
      .pipe(sourcemaps.init())
        .pipe(sass({ errLogToConsole: true }))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./css'));
});

gulp.task('watch', function() {
  gulp.watch('./scss/*.scss', ["sass"]);
});

gulp.task('default', ['sass', 'watch']);

