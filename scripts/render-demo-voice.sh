#!/usr/bin/env bash
set -euo pipefail

output="${1:?usage: render-demo-voice.sh OUTPUT_MP3}"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_dir="$(cd "$script_dir/.." && pwd)"
voice_dir="$(mktemp -d /tmp/unstash-voice.XXXXXX)"
voiceover_file="$project_dir/docs/VIDEO_VOICEOVER.txt"

segments=()
while IFS= read -r segment; do
  segments+=("$segment")
done < <(awk 'BEGIN { RS=""; ORS="\n" } { gsub(/\n/, " "); print }' "$voiceover_file")

rates=("+10%" "+12%" "+16%" "+15%" "+12%" "+8%")
pitches=("-2Hz" "+1Hz" "+3Hz" "+2Hz" "+1Hz" "-2Hz")
pauses=("0.20" "0.24" "0.16" "0.20" "0.25" "0")

test "${#segments[@]}" -eq "${#rates[@]}"

ffmpeg_inputs=()
filter_complex=""
concat_inputs=""

for index in "${!segments[@]}"; do
  segment_file="$voice_dir/segment-$index.mp3"

  uvx --from edge-tts edge-tts \
    --text "${segments[$index]}" \
    --voice en-US-EmmaMultilingualNeural \
    --rate="${rates[$index]}" \
    --pitch="${pitches[$index]}" \
    --volume=+0% \
    --write-media "$segment_file"

  ffmpeg_inputs+=(-i "$segment_file")
  filter_complex+="[$index:a]aresample=48000,apad=pad_dur=${pauses[$index]}[a$index];"
  concat_inputs+="[a$index]"
done

filter_complex+="${concat_inputs}concat=n=${#segments[@]}:v=0:a=1,loudnorm=I=-18:TP=-2:LRA=7[voice]"

ffmpeg -y \
  "${ffmpeg_inputs[@]}" \
  -filter_complex "$filter_complex" \
  -map "[voice]" \
  -codec:a libmp3lame \
  -b:a 128k \
  "$output"
