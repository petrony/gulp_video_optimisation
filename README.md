# gulp_video_optimisation

A minimal Gulp task that batch-compresses `.mp4` videos using [FFmpeg](https://ffmpeg.org/) (H.264/libx264, CRF-based). It reads every `.mp4` file from `source-videos/`, runs it through FFmpeg, and writes the compressed result to `compressed-videos/`, keeping the original filename.

## How it works

The gulpfile uses [`gulp-exec`](https://www.npmjs.com/package/gulp-exec) to shell out to the `ffmpeg` binary for each matched file — Gulp itself only handles file discovery (`gulp.src`) and orchestration; the actual video transcoding is delegated entirely to FFmpeg.

For every file found in `source-videos/*.mp4`, the task runs:

```bash
ffmpeg -i <source-videos/filename.mp4> -vcodec libx264 -crf 28 -preset faster compressed-videos/<filename.mp4>
```

| Flag                | Meaning                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------ |
| `-vcodec libx264`     | Encode video with the H.264 codec.                                                         |
| `-crf 28`             | Constant Rate Factor — controls quality/size trade-off. Lower = higher quality & larger file; higher = smaller file & lower quality. 28 is a fairly aggressive, size-favoring setting (the libx264 default is 23). |
| `-preset faster`      | Encoding speed/compression-efficiency trade-off. `faster` favors encoding speed over maximum compression efficiency. |

The output filename matches the source filename (extension normalized to `.mp4`), and results are streamed through `exec.reporter()`, so FFmpeg's stdout/stderr for each file is printed to the terminal as it runs.

## Requirements

- [Node.js](https://nodejs.org/) (any version compatible with Gulp 5, i.e. Node 18+ recommended)
- npm
- **[FFmpeg](https://ffmpeg.org/download.html) installed and available on your system `PATH`** — this is a system dependency, not an npm package, and the task will fail if the `ffmpeg` binary isn't found.

Verify FFmpeg is installed:

```bash
ffmpeg -version
```

## Installation

```bash
git clone https://github.com/petrony/gulp_video_optimisation.git
cd gulp_video_optimisation
npm install
```

## Project structure

```
gulp_video_optimisation/
├── source-videos/        # Place your source .mp4 files here
├── compressed-videos/     # Generated — compressed output lands here
├── gulpfile.js
├── package.json
└── package-lock.json
```

> Note: unlike more elaborate image-optimization setups, this project does **not** clean or recreate the output folder automatically — make sure `compressed-videos/` exists before running the task (it's already present in the repo).

## Usage

1. Drop your source `.mp4` files directly into `source-videos/` (the glob pattern `source-videos/*.mp4` is **not** recursive — subfolders are not scanned).
2. Run the default Gulp task:

```bash
npx gulp
```

This runs the single `compress-video` task, which is also the default export:

```js
gulp.task('default', gulp.series('compress-video'));
```

You can also run it explicitly by name:

```bash
npx gulp compress-video
```

Compressed files appear in `compressed-videos/`, one output file per input file, same base filename.

### Adding an npm script (optional)

For convenience, add this to `package.json`:

```json
{
  "scripts": {
    "compress": "gulp"
  }
}
```

Then run:

```bash
npm run compress
```

## Customizing the compression settings

All FFmpeg parameters are hardcoded in `gulpfile.js`, inside the `compress-video` task. Adjust them directly to fit your needs:

```js
return `ffmpeg -i ${file.path} -vcodec libx264 -crf 28 -preset faster ${outputPath}`;
```

Common tweaks:

- **Better quality, larger files:** lower `-crf` (e.g. `20`–`23`).
- **Smaller files, lower quality:** raise `-crf` (e.g. `30`–`32`).
- **Better compression, slower encode:** change `-preset faster` to `medium`, `slow`, or `slower`.
- **Different container/extension:** update both the `ffmpeg` output flag and the `outputPath` extension in `path.extname` / template string accordingly.
- **Other input formats:** widen the glob beyond `*.mp4` (e.g. `*.{mp4,mov,avi}`) if you need to accept other source formats — note the current output is always written with a `.mp4` extension regardless of input format.

## Dependencies

| Package      | Purpose                                                          |
| ------------- | ------------------------------------------------------------------ |
| `gulp`        | Task runner (v5)                                                  |
| `gulp-exec`   | Runs arbitrary shell commands (here: `ffmpeg`) per matched file    |

FFmpeg itself is **not** an npm dependency — it must be installed separately at the OS level.

## Troubleshooting

- **`ffmpeg: command not found` / task exits immediately** — FFmpeg isn't installed or isn't on your `PATH`. Install it via your OS package manager (e.g. `brew install ffmpeg`, `apt install ffmpeg`, or download a build for Windows) and restart your terminal.
- **No output files produced** — confirm your source files are directly inside `source-videos/` (not in a subfolder) and have the `.mp4` extension.
- **Compression looks too aggressive / too light** — tune `-crf` and `-preset` as described above.

## License

No license specified. Add a `LICENSE` file if you intend to make this project open source under a specific license.
