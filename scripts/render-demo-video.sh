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
voiceover="$frame_dir/voiceover.aiff"
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
  -loop 1 -framerate 24 -t 4 -i "$title_card" \
  -loop 1 -framerate 24 -t 6 -i "$frame_dir/01-prototype-hero.png" \
  -loop 1 -framerate 24 -t 5 -i "$frame_dir/03-import-success.png" \
  -loop 1 -framerate 24 -t 6 -i "$frame_dir/05-mark-done.png" \
  -loop 1 -framerate 24 -t 5 -i "$frame_dir/06-search.png" \
  -loop 1 -framerate 24 -t 5 -i "$title_card" \
  -i "$voiceover" \
  -f lavfi -t 29 -i "sine=frequency=180:sample_rate=48000" \
  -f lavfi -t 29 -i "anoisesrc=color=pink:sample_rate=48000:amplitude=0.02" \
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
    [v0][v1]xfade=transition=fade:duration=0.4:offset=3.6[x1];
    [x1][v2]xfade=transition=fade:duration=0.4:offset=9.2[x2];
    [x2][v3]xfade=transition=fade:duration=0.4:offset=13.8[x3];
    [x3][v4]xfade=transition=fade:duration=0.4:offset=19.4[x4];
    [x4][v5]xfade=transition=fade:duration=0.4:offset=24.0[x5];
    [x5][9:v]overlay=0:0:enable='between(t,0,3.6)'[c1];
    [c1][10:v]overlay=0:0:enable='between(t,3.6,9.2)'[c2];
    [c2][11:v]overlay=0:0:enable='between(t,9.2,13.8)'[c3];
    [c3][12:v]overlay=0:0:enable='between(t,13.8,19.4)'[c4];
    [c4][13:v]overlay=0:0:enable='between(t,19.4,24)'[c5];
    [c5][14:v]overlay=0:0:enable='between(t,24,29)'[video];
    [6:a]atempo=0.9,volume=1.35[voice];
    [7:a]volume=0.018,lowpass=f=700[tone];
    [8:a]volume=0.008,lowpass=f=1200[noise];
    [voice][tone][noise]amix=inputs=3:duration=longest:dropout_transition=2,loudnorm=I=-16:TP=-1.5:LRA=11[audio]
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
