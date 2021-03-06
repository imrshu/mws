const gulp = require('gulp');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const cleanCss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const uglify = require('gulp-uglify-es').default;


// Gulp default task
gulp.task('default', ['minifyCSS', 'minifyMainJS', 'minifyInfoJS', 'compressIMG'], () => {
  gulp.watch('css/styles.css', ['minifyCSS']);
  gulp.watch(['js/main.js', 'js/dbhelper.js', 'js/idb.js'], ['minifyMainJS']);
  gulp.watch(['js/restaurant_info.js', 'js/dbhelper.js', 'js/idb.js'], ['minifyInfoJS']);
  console.log('Operation successfull');
});

// Gulp task for minify css
gulp.task('minifyCSS', () => {
  gulp.src('css/styles.css')
    .pipe(cleanCss())
    .pipe(rename('styles.min.css'))
    .pipe(gulp.dest('./css/dist'))
});

// Gulp task for minify all js
// files with main js
gulp.task('minifyMainJS', () => {
  gulp.src([
    'js/swRegister.js',
    'js/dbhelper.js',
    'js/backtotop.js',
    'js/idblib.js',
    'js/idb.js',
    'js/main.js',
    'js/progressively.js'
  ])
    .pipe(uglify())
    .pipe(concat('main.js'))
    .pipe(rename('main.min.js'))
    .pipe(gulp.dest('./js/dist'))
});

// Gulp task for minify all js
// files with restaurant_info js
gulp.task('minifyInfoJS', () => {
  gulp.src([
    'js/swRegister.js',
    'js/dbhelper.js',
    'js/backtotop.js',
    'js/idblib.js',
    'js/idb.js',
    'js/restaurant_info.js',
    'js/progressively.js'
  ])
    .pipe(uglify())
    .pipe(concat('restaurant_info.js'))
    .pipe(rename('restaurant_info.min.js'))
    .pipe(gulp.dest('./js/dist'))
});

gulp.task('compressIMG', () => {
  gulp.src('img/logo/*.png')
    .pipe(imagemin({
      progressive: true,
      optimizationLevel: 5,
      use: [pngquant()]
    }))
    .pipe(gulp.dest('./img/dist'))
});
