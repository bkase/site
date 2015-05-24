var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var gulp = require('gulp');

var paths = {
  scss: './src/scss/**/*.scss',
  js: './src/js/**/*.jsx',
  html: './src/index.html'
}

gulp.task('sass', function() {
  gulp.src(paths.scss)
      .pipe(sourcemaps.init())
        .pipe(sass({ errLogToConsole: true }))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./dist/css'));
});

gulp.task('babel', function() {
  gulp.src(paths.js)
      .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('all.js'))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./dist/js'));
});

gulp.task('html', function() {
  gulp.src(paths.html)
      .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function() {
  gulp.watch(paths.scss, ["sass"]);
  gulp.watch(paths.js, ["babel"]);
  gulp.watch(paths.html, ["html"]);
});

gulp.task('default', ['sass', 'babel', 'html', 'watch']);

