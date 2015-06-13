var gulp = require('gulp');
var gulpUtil = require('gulp-util');
var gulpConcat = require('gulp-concat');
var gulpUglify = require('gulp-uglify');
var gulpSass = require('gulp-sass');
var gulpNgConfig = require('gulp-ng-config');
var gulpRename = require('gulp-rename');
var gulpFlatten = require('gulp-flatten');
var jshint = require('gulp-jshint');
var minifyCSS = require('gulp-minify-css');
var runSequence = require('run-sequence');
var del = require('del');
var env = require('dotenv').load();

var bowerRoot = 'assets/js/vendor/';

var paths = {
	app_js: [
		'assets/angular_app/trd_app.js',
		'assets/angular_app/trd_interceptor.js',
		'assets/angular_app/controllers.js',
		'assets/angular_app/services.js',
		'assets/angular_app/filters.js',
		'assets/angular_app/directives.js',
		'assets/angular_app/filters/*.js',
		'assets/angular_front/**/*.js',
		'assets/angular_app/controllers/*.js',
		'assets/angular_app/services/*.js',
		bowerRoot + 'n3-line-chart/build/line-chart.min.js',
		bowerRoot + 'angulartics/dist/angulartics.min.js',
		bowerRoot + 'angulartics/dist/angulartics-ga.min.js',
		bowerRoot + 'foundation/js/foundation.js'
	],
	scss: [
		'assets/scss/mitch.scss'
	],
	html_src_and_dest: [
		{src:'assets/angular_front/directives/**/*.html', dest:'public/directives/'},
		{src:'assets/angular_front/**/*.html', dest:'public/partials/'},
	],
	config: 'trd_modules/config.json',
	watch_scss: 'assets/scss/**/*.scss'
};

gulp.task('clean:css', function(cb) {
	del(['public/css'], cb);
});

gulp.task('clean:all', function(cb) {
	del(['public'], cb);
});

gulp.task('jshint', function() {
  return gulp.src([
        'assets/angular_app/app.js', 
        'ddocs/*.js', 
        'routes/*.js',
        'trd_modules/*.js',
        'models/*.js',
        'app.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('handle-scss', ['clean:css'], function() {
	gulp.src(paths.scss)
		.pipe(gulpSass())				// sass
		.pipe(gulpConcat('trdapp.css'))	// concat css files into one
		.pipe(gulp.dest('public/css'))	// output unminified version
		.pipe(minifyCSS())				// minify
		.pipe(gulpRename("trdapp.min.css"))// change name for minificated verion
		.pipe(gulp.dest('public/css'));	// output minified version
});

gulp.task('handle-app-js', function() {
	gulp.src(paths.app_js)
		.pipe(gulpConcat('trdapp.js'))
		.pipe(gulp.dest('public/js/'))
		.pipe(gulpUglify())
		.pipe(gulpRename("trdapp.min.js"))
		.pipe(gulp.dest('public/js/'));
});

gulp.task('config', function() {
});

gulp.task('copy', function() {
	for (var i = 0; i < paths.html_src_and_dest.length; i++) {
		gulp.src(paths.html_src_and_dest[i].src)
			.pipe(gulpFlatten())
			.pipe(gulp.dest(paths.html_src_and_dest[i].dest));
	}

	gulp.src('assets/img/**/*')
		.pipe(gulp.dest('public/img/'));

	gulp.src('assets/favicons/**/*')
		.pipe(gulp.dest('public/'));	

	gulp.src('assets/fonts/**/*')
		.pipe(gulp.dest('public/fonts/'));

	gulp.src('assets/js/**/*')
		.pipe(gulp.dest('public/js/'));

	gulp.src(paths.config)
		.pipe(gulpNgConfig('env.config', {
			environment: process.env.CLIENT_CONFIG
		}))
		.pipe(gulp.dest('public/js/'));
});

gulp.task('watch', function() {
	gulp.watch(paths.app_js, ['handle-app-js']);
	gulp.watch(paths.watch_scss, ['handle-scss']);
	for (var i = 0; i < paths.html_src_and_dest.length; i++) {
		gulp.watch(paths.html_src_and_dest[i].src, ['copy']);
	};
});

gulp.task('default', function(callback) {
	runSequence('clean:all', 'jshint',
				['handle-app-js', 'handle-scss'],
				'copy', 'watch',
				callback);
});

gulp.task('staging', function(callback) {
	runSequence('clean:all', 'jshint',
				['handle-app-js', 'handle-scss'],
				'copy',
				callback);
});