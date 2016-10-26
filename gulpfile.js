var gulp 					= require("gulp"),
	 babel 					= require("gulp-babel"),
	 concat 				= require('gulp-concat'),
     plumber                = require('gulp-plumber'),
	 browserSync 			= require('browser-sync').create();


gulp.task('serve', ['babel'], function() {
	browserSync.init({
		server: {
			baseDir: "./app"
		},
		files: ["app/css/*"],
		port: 3300,
		notify: false,
		reloadDelay: 100
	});
});



gulp.task("babel", function () {
	return gulp.src("src/**/*.js")
        .pipe(plumber())
		.pipe(babel({
				presets: ['es2015']
		  }))
		//.pipe(concat('common.js'))
		.pipe(gulp.dest("app/js"));
});


gulp.task('watch', function () {
	gulp.watch('app/js/*.js').on("change", browserSync.reload);
	gulp.watch('app/*.html').on('change', browserSync.reload);
	
	gulp.watch('src/**/*.js', ['babel']);	    
});


gulp.task('default', ['serve', 'watch']);