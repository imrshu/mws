const gulp = require('gulp');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const cleanCss = require('gulp-clean-css');
const uglify = require('gulp-uglify-es').default;


// Gulp default task
gulp.task('default', ['minifyCSS', 'minifyMainJS', 'minifyInfoJS'], () =>
 console.log('Operation successfull'));

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
    'js/mapStyles.js',
    'js/backtotop.js',
    'js/main.js',
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
    'js/mapStyles.js',
    'js/backtotop.js',
    'js/restaurant_info.js',
  ])
    .pipe(uglify())
    .pipe(concat('restaurant_info.js'))
    .pipe(rename('restaurant_info.min.js'))
    .pipe(gulp.dest('./js/dist'))
});
