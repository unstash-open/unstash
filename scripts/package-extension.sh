#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_dir="$(cd "$script_dir/.." && pwd)"
output_input="${1:-$project_dir/public/unstash-extension-v0.1.0.zip}"

mkdir -p "$(dirname "$output_input")"
output="$(cd "$(dirname "$output_input")" && pwd)/$(basename "$output_input")"
stage_dir="$(mktemp -d /tmp/unstash-extension.XXXXXX)"

node -e '
  const manifest = JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8"));
  if (manifest.manifest_version !== 3) throw new Error("Manifest V3 is required");
  if (JSON.stringify(manifest.permissions) !== JSON.stringify(["activeTab"])) {
    throw new Error("The developer preview must request activeTab only");
  }
  if (manifest.host_permissions) throw new Error("Host permissions are not allowed");
' "$project_dir/extension/manifest.json"

mkdir -p "$stage_dir/extension"
cp -R "$project_dir/extension/." "$stage_dir/extension/"
find "$stage_dir/extension" -type f -exec touch -t 198001010000 {} +
staged_output="$stage_dir/unstash-extension-v0.1.0.zip"

(
  cd "$stage_dir"
  find extension -type f -print | LC_ALL=C sort | zip -X -q "$staged_output" -@
)

unzip -tq "$staged_output"
mv "$staged_output" "$output"
printf '%s\n' "$output"
