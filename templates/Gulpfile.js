/**
 * Created by ssilvestri on 1/20/16.
 */
'use strict';

var config = {
    src : './src',
    dist : './dist'
};

var gzip_config = {
    src : config.dist + "/**/*.{html,css,js}",
    dist : config.dist,
    options : {}
};

var gulp = require('gulp');
var usemin = require('gulp-usemin');
var connect = require('gulp-connect');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var clean = require('del');
var gzip = require('gulp-gzip');
var imageop = require('gulp-image-optimization');
var uglifyInline = require('gulp-uglify-inline');

gulp.task('connect', function(){
    connect.server({
        port: 8080,
        root: './src'
    });
});


gulp.task('connect:dist', function(){
    connect.server({
        root : './dist',
        port : 8080
    });
});

gulp.task('clean', function(){
    clean([config.dist]);
});

gulp.task('gzip', ['usemin'], function(){
    return gulp.src(gzip_config.src)
        .pipe(gzip(gzip_config.options))
        .pipe(gulp.dest(gzip_config.dist));
});

gulp.task('usemin', ['clean'], function(){
    return gulp.src(config.src + '/index.html')
        .pipe(usemin({
            css : [minifyCss(), 'concat', rev()],
            html : [minifyHtml({empty:true})],
            js : [uglify(), rev()],
            js1: [uglify(), rev()],
        })).pipe(gulp.dest(config.dist));
});

gulp.task('minify-views', ['usemin'], function(){
    return gulp.src(config.src + '/views/*.html').pipe(minifyHtml({
        empty: true
    })).pipe(uglifyInline())
        .pipe(gulp.dest(config.dist + '/views'));
});

gulp.task('sass', ['clean'], function(){
    return gulp.src(config.src + '/styles/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle:'compressed'}).on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.dist + '/styles'));
});

gulp.task('copy', ['clean'], function(){
    gulp.src(config.src + '/bower_components/bootstrap/fonts/*.*').pipe(gulp.dest(config.dist + '/fonts'));
    gulp.src(config.src + '/bower_components/font-awesome/fonts/*.*').pipe(gulp.dest(config.dist + '/fonts'));
    gulp.src(config.src + '/img/**/*').pipe(gulp.dest(config.dist + "/img"));
    return gulp.src(config.src + '/views/*').pipe(gulp.dest(config.dist + '/views'));
});

gulp.task('images', function(){
    gulp.src(config.src + '/img/**/*').pipe(imageop({
        optimizationLevel : 5,
        progressive : true,
        interlaced : true
    })).pipe(gulp.dest(config.dist + '/img'));
});

gulp.task('uglify-inline', ['usemin'], function() {
    gulp.src(config.dist + '/index.html')
        .pipe(uglifyInline())
        .pipe(gulp.dest(config.dist))
});

gulp.task('build', ['clean', 'copy', 'usemin', 'sass', 'gzip', 'uglify-inline', 'minify-views', 'connect:dist']);