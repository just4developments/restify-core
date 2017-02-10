var gulp = require('gulp'),
		useref = require('gulp-useref'),
		uglify = require('gulp-uglify'),
		rename = require("gulp-rename"),
		babel = require('gulp-babel'),
		// sourcemaps = require('gulp-sourcemaps'),
		// gulpif = require('gulp-if'),
		livereload = require('gulp-livereload'),
		sass = require('gulp-sass'),
		minifyCSS = require('gulp-minify-css'),
		minifyHtml = require("gulp-minify-html"),
		gulpSequence = require('gulp-sequence'),
		clean = require('gulp-clean');

gulp.task('package', [], gulpSequence('clean', 'compile', 'buildJS', 'buildCSS', 'buildHTML'));

gulp.task('default', ['dev'], function() {
   
});

gulp.task('clean', [], function(){
	return gulp.src('dist', {read: false}).pipe(clean({force: true}));
});

gulp.task('buildJS', [], function() {
	return gulp.src(['dist/js/*.min.js'])
		.pipe(babel({presets: ['es2015']}))		
	  .pipe(uglify())
  	.pipe(gulp.dest('dist/js'))
  	.pipe(livereload());
});

gulp.task('reload', [], function(){
	
});

gulp.task('buildSASS', [], function() {
	return gulp.src(['dist/scss/*.scss'])
	  .pipe(sass({outputStyle: 'compressed'}))
  	.pipe(gulp.dest('public/css'));
});

gulp.task('buildCSS', [], function() {
	return gulp.src(['dist/css/*.css'])
	  .pipe(minifyCSS())
  	.pipe(gulp.dest('dist/css'));
});

gulp.task('buildHTML', [], function() {
	return gulp.src(['dist/**/*.html'])
	  .pipe(minifyHtml())
  	.pipe(gulp.dest('dist'));
});

gulp.task('compile', [], function() {
	return gulp.src(['public/**/*.html'])
		.pipe(useref())      
		.pipe(gulp.dest('dist/'));
});

gulp.task('dev', [], function(){
	livereload.listen();
	gulp.watch(['public/**/*.js', 'public/**/*.css', 'public/**/*.html'], function(event) {
		console.log('File ' + event.path + ' was ' + event.type + ', rebuilt');
		livereload.reload(event.path);
	});
	gulp.watch('public/**/*.scss', ['buildSASS']);	
	require('./');
});