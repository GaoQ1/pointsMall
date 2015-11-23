var gulp = require('gulp'),
	concat = require('gulp-concat'),
	jshint = require('gulp-jshint'),
	livereload = require('gulp-livereload'),
	//sass = require('gulp-sass'),
	less = require('gulp-less'),
	rename = require('gulp-rename'),
	autoprefixer = require('gulp-autoprefixer'),
	uglify = require('gulp-uglify'),
	watch = require('gulp-watch'),
	cache = require('gulp-cache'),
	imagemin = require('gulp-imagemin'),
	minifycss = require('gulp-minify-css'),
	del = require('del'),
	sourcemaps = require('gulp-sourcemaps'),
	notify = require('gulp-notify');


//js检查,合并，压缩js文件
/*gulp.task('lint', function(){
	gulp.src(['./src/js/!*.js', '!./src/js/libs/!*', '!./src/js/util/!*'])
		//.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(concat('main.js'))
		.pipe(gulp.dest('./public/js'))
		.pipe(rename({suffix: '.min'}))
		.pipe(uglify())
		.pipe(gulp.dest('./public/js'));
});*/

gulp.task('libsjs', function(){
	gulp.src(['./src/js/libs/*'])
        .pipe(concat('libs.js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
		.pipe(gulp.dest('./public/js/libs'));
});

gulp.task('utils', function(){
	gulp.src(['./src/js/util/*'])
        .pipe(concat('utils.js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
		.pipe(gulp.dest('./public/js/util'));
});

////sass编译
//gulp.task('sass', function(){
//	gulp.src('./src/scss/*.scss')
//		.pipe(sass())
//		.pipe(autoprefixer({browsers: ['last 2 versions', 'ff 18', 'safari 5','ie 8','ie 9', 'opera 12.1', 'ios 6', 'android 4']}))
//		.pipe(concat('style.css'))
//		//.pipe(gulp.dest('./public/css/'))
//		.pipe(minifycss())
//		.pipe(rename({suffix: '.min'}))
//		.pipe(gulp.dest('./public/css'))
//});

//less编译
gulp.task('less', function(){
	gulp.src(['./src/less/*.less', './public/vendor/Swiper/dist/css/swiper.css', '!./src/less/style.less'])
		.pipe(less())
		.pipe(autoprefixer({browsers: ['last 2 versions', 'ff 18', 'safari 5','ie 8','ie 9', 'opera 12.1', 'ios 6', 'android 4']}))
		.pipe(concat('style.css'))
		//.pipe(gulp.dest('./public/css/'))
		.pipe(minifycss())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('./public/css'))
});

//图片压缩
/*gulp.task('images', function() {
  return gulp.src('./src/images/!**!/!*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('./public/images/'))
	//.pipe(notify({ message: 'Images task complete' }));
});*/

//gulp.task('testImagemin', function () {
//    gulp.src('src/img/*.{png,jpg,gif,ico}')
//        .pipe(imagemin({
//            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
//            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
//            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
//            multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
//        }))
//        .pipe(gulp.dest('img'));
//});

//压缩前删除原来文件夹里的内容
gulp.task('clean', function(cb){
	del(['./public/js', './public/css'], cb);
});

gulp.task('live', function(){
	livereload.listen();
	gulp.watch(['./src/**']).on('change', livereload.changed);
});

// 默认任务
gulp.task('default', function(){
    gulp.run('clean', 'less', 'live', 'utils','libsjs');

    // 监听文件变化
    gulp.watch('./src/**/*.*', function(){
        gulp.run( 'less', 'images');
    });
});