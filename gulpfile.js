var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var uglifyify = require('uglifyify');
var envify = require('envify/custom');
var execSync = require('exec-sync');
var clean = require('gulp-clean');

var paths = {
  scss: './src/scss/**/*.scss',
  js: ['./src/js/**/*.jsx', './src/js/**/*.js'],
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

function compile(watch, isDebug) {
  if (!isDebug) {
    // for some reason chaining transforms on browserify doesn't work
    // but the from the shell it does, oh well
    console.log('-> prod making...');
    execSync("NODE_ENV=production browserify -t babelify -t envify -g uglifyify src/js/main.jsx -o dist/js/build.js");
    return;
  }

  var bundler = watchify(
      browserify(paths.mainJs, { debug: isDebug })
        .transform(babelify)
        .transform(envify({ NODE_ENV: isDebug ? "development" : "production" }))
        .transform(uglifyify)
  );

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('build.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: isDebug }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist/js'));
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
    });
  }

  console.log('-> bundling...');
  rebundle();
}

gulp.task('babel', function() {
  gulp.src(paths.js)
      .pipe(sourcemaps.init())
        .pipe(babelify())
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
  compile(true, true);
});

gulp.task('build', function() {
  compile(false, false);
});

gulp.task('clean-js', function() {
  gulp.src('dist/js/*')
      .pipe(clean());
});

gulp.task('default', ['sass', 'html', 'watch']);
gulp.task('prod', ['sass', 'html', 'clean-js', 'build']);

