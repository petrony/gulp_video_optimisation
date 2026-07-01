const gulp = require('gulp');
const exec = require('gulp-exec');
const path = require('path');

gulp.task('compress-video', () => {
  const inputDir = './source-videos/*.mp4'; // Вихідна папка з відео
  const outputDir = './compressed-videos/'; // Папка для стиснутих відео

  return gulp.src(inputDir)
    .pipe(exec(file => {
      const fileName = path.basename(file.path, path.extname(file.path));
      const outputPath = `${outputDir}${fileName}.mp4`;
      return `ffmpeg -i ${file.path} -vcodec libx264 -crf 28 -preset faster ${outputPath}`;
    }))
    .pipe(exec.reporter());
});

gulp.task('default', gulp.series('compress-video'));