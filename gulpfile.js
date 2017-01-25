var gulp = require('gulp');
var concat = require('gulp-concat');
var less = require('gulp-less');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var browserSync = require('browser-sync').create();


// Gulp task for sass
gulp.task('less', function () {
    return gulp.src('components/stylesheet/**/*.less')
        .pipe(less())
        .pipe(concat('main.css'))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream());
});

gulp.task('js', function() {
    var jsFiles = [
        'components/libs/jquery/dist/jquery.min.js',
        'components/libs/bootstrap/dist/js/bootstrap.min.js',
        'components/libs/angular/angular.min.js',
        'components/libs/angular-bootstrap/ui-bootstrap.min.js',
        'components/libs/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'components/libs/angular-resizable/angular-resizable.min.js',
        'components/libs/ngtouch/build/ngTouch.min.js',
        'components/libs/modernizr-detectizr/libs/modernizr-detectizr.min.js',
        'components/libs/angular-loading-bar/build/loading-bar.js',
        'components/libs/highcharts/js/highstock.js',
        'components/libs/highcharts-ng/dist/highcharts-ng.js',
        'components/scripts/*.js'
    ];
    return gulp.src(jsFiles)
        .pipe(concat('main.js'))
        // uglify later in build script
        //.pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('cssPlugins', function(){

    var cssFiles = [
        'components/libs/bootstrap/dist/css/bootstrap.css',
        'components/libs/highcharts/css/highcharts.css',
        'components/libs/angular-bootstrap/ui-bootstrap-csp.css',
        'components/libs/angular-resizable/angular-resizable.min.css',
        'components/libs/angular-loading-bar/build/loading-bar.min.css'
    ];

    return gulp.src(cssFiles)
        .pipe(concat('plugins.css'))
        .pipe(minifyCss({compatibility: 'ie8'}))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('css', ['less', 'cssPlugins']);
gulp.task('build', ['less', 'cssPlugins', 'js']);

gulp.task('fonts', function() {
    return gulp.src([
        'components/libs/bootstrap/fonts/glyphicons-halflings-regular.*'
    ]).pipe(gulp.dest('dist/fonts'));
});


// Watching files
gulp.task('watch', function() {

    browserSync.init({
        server: {baseDir: './dist'}
    });

    gulp.watch("components/**/*.js", ['js']);
    gulp.watch("components/stylesheet/**/*.less", ['less']);
    gulp.watch("**/*.html").on('change', browserSync.reload);
    gulp.watch("dist/**/*.js").on('change', browserSync.reload);
});