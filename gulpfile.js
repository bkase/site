var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');

var paths = {
  scss: './src/scss/**/*.scss',
  js: './src/js/**/*.jsx',
  mainJs: './src/js/main.jsx',
  html: './src/index.html'
}

gulp.task('sass', function() {
  gulp.src(paths.scss)
      .pipe(sourcemaps.init())
        .pipe(sass({ errLogToConsole: true }))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./dist/css'));
});

function compile(watch) {
  var bundler = watchify(browserify(paths.mainJs, { debug: true }).transform(babel));

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('build.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist/js'));
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
    });
  }

  rebundle();
}

gulp.task('babel', function() {
  gulp.src(paths.js)
      .pipe(sourcemaps.init())
        .pipe(babel())
        .on('error', dumpBabelErr)
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
  gulp.watch(paths.html, ["html"]);
  compile(true);
});

gulp.task('default', ['sass', 'html', 'watch']);

