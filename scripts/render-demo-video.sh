#!/usr/bin/env bash
set -euo pipefail

title_card_input="${1:?usage: render-demo-video.sh TITLE_CARD FRAME_DIR OUTPUT_MP4}"
frame_dir_input="${2:?usage: render-demo-video.sh TITLE_CARD FRAME_DIR OUTPUT_MP4}"
output_input="${3:?usage: render-demo-video.sh TITLE_CARD FRAME_DIR OUTPUT_MP4}"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_dir="$(cd "$script_dir/.." && pwd)"
title_card="$(cd "$(dirname "$title_card_input")" && pwd)/$(basename "$title_card_input")"
frame_dir="$(cd "$frame_dir_input" && pwd)"
output="$(cd "$(dirname "$output_input")" && pwd)/$(basename "$output_input")"
voiceover="$frame_dir/voiceover.mp3"
captions="public/unstash-demo.vtt"

test -f "$title_card"
test -f "$frame_dir/01-prototype-hero.png"
test -f "$frame_dir/03-import-success.png"
test -f "$frame_dir/05-mark-done.png"
test -f "$frame_dir/06-search.png"
test -f "$voiceover"
test -f "$project_dir/$captions"

mkdir -p "$(dirname "$output")"
cd "$project_dir"
node scripts/render-demo-captions.mjs "$frame_dir"

ffmpeg -y \
  -loop 1 -framerate 24 -t 4.1 -i "$title_card" \
  -loop 1 -framerate 24 -t 6.2 -i "$frame_dir/01-prototype-hero.png" \
  -loop 1 -framerate 24 -t 5 -i "$frame_dir/03-import-success.png" \
  -loop 1 -framerate 24 -t 5.9 -i "$frame_dir/05-mark-done.png" \
  -loop 1 -framerate 24 -t 5.6 -i "$frame_dir/06-search.png" \
  -loop 1 -framerate 24 -t 5 -i "$title_card" \
  -i "$voiceover" \
  -loop 1 -framerate 24 -t 29 -i "$frame_dir/caption-01.png" \
  -loop 1 -framerate 24 -t 29 -i "$frame_dir/caption-02.png" \
  -loop 1 -framerate 24 -t 29 -i "$frame_dir/caption-03.png" \
  -loop 1 -framerate 24 -t 29 -i "$frame_dir/caption-04.png" \
  -loop 1 -framerate 24 -t 29 -i "$frame_dir/caption-05.png" \
  -loop 1 -framerate 24 -t 29 -i "$frame_dir/caption-06.png" \
  -filter_complex "
    [0:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,fps=24,settb=AVTB,setpts=PTS-STARTPTS[v0];
    [1:v]scale=1280:720,setsar=1,fps=24,settb=AVTB,setpts=PTS-STARTPTS[v1];
    [2:v]scale=1280:720,setsar=1,fps=24,settb=AVTB,setpts=PTS-STARTPTS[v2];
    [3:v]scale=1280:720,setsar=1,fps=24,settb=AVTB,setpts=PTS-STARTPTS[v3];
    [4:v]scale=1280:720,setsar=1,fps=24,settb=AVTB,setpts=PTS-STARTPTS[v4];
    [5:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,fps=24,settb=AVTB,setpts=PTS-STARTPTS[v5];
    [v0][v1]xfade=transition=fade:duration=0.4:offset=3.7[x1];
    [x1][v2]xfade=transition=fade:duration=0.4:offset=9.5[x2];
    [x2][v3]xfade=transition=fade:duration=0.4:offset=14.1[x3];
    [x3][v4]xfade=transition=fade:duration=0.4:offset=19.6[x4];
    [x4][v5]xfade=transition=fade:duration=0.4:offset=24.1[x5];
    [x5][7:v]overlay=0:0:enable='between(t,0,3.7)'[c1];
    [c1][8:v]overlay=0:0:enable='between(t,3.7,9.5)'[c2];
    [c2][9:v]overlay=0:0:enable='between(t,9.5,14.1)'[c3];
    [c3][10:v]overlay=0:0:enable='between(t,14.1,19.6)'[c4];
    [c4][11:v]overlay=0:0:enable='between(t,19.6,24.1)'[c5];
    [c5][12:v]overlay=0:0:enable='between(t,24.1,29)'[video];
    [6:a]aresample=48000,volume=1.05,apad,atrim=duration=29,loudnorm=I=-16:TP=-1.5:LRA=11[audio]
  " \
  -map "[video]" \
  -map "[audio]" \
  -c:v libx264 \
  -preset medium \
  -crf 21 \
  -profile:v high \
  -level 4.1 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  -c:a aac \
  -b:a 160k \
  -shortest \
  "$output"
