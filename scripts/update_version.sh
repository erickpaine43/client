#!/bin/bash
set -euo pipefail

VERSION_FILE="version.txt"

validate_semver() {
  local version="$1"
  if [[ ! "$version" =~ ^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$ ]]; then
    echo "❌ Error: Invalid version '$version'. It must follow SemVer (X.Y.Z where X, Y, Z are numbers >= 0 without leading zeros)"
    exit 1
  fi
}

if [ $# -eq 0 ]; then
  echo "❌ Error: You must provide a version as an argument"
  echo "Example: ./update_version.sh 1.2.3"
  exit 1
fi

new_version="$1"
validate_semver "$new_version"

# Ensure the version file exists and create backup
trap 'rm -f "${VERSION_FILE}.backup"' EXIT
touch "$VERSION_FILE"
cp "$VERSION_FILE" "${VERSION_FILE}.backup" 2>/dev/null || true

printf "%s" "$new_version" > "$VERSION_FILE"

# Verify the version was written correctly
written_version=$(< "$VERSION_FILE" tr -d '\n')
if [ "$written_version" != "$new_version" ]; then
  echo "❌ Error: Version write verification failed. Expected: $new_version, Got: $written_version"
  # Restore backup if available
  if [ -f "${VERSION_FILE}.backup" ]; then
    mv "${VERSION_FILE}.backup" "$VERSION_FILE"
    echo "✅ Restored previous version from backup"
  fi
  exit 1
fi

echo "✅ Version successfully updated to: $new_version"
echo "   Modified file: $(pwd)/$VERSION_FILE"
