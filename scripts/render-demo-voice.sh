#!/usr/bin/env bash
set -euo pipefail

output="${1:?usage: render-demo-voice.sh OUTPUT_MP3}"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_dir="$(cd "$script_dir/.." && pwd)"

uvx --from edge-tts edge-tts \
  --file "$project_dir/docs/VIDEO_VOICEOVER.txt" \
  --voice en-US-AvaMultilingualNeural \
  --rate=+2% \
  --pitch=-2Hz \
  --volume=+0% \
  --write-media "$output"
