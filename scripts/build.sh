#!/bin/sh
# Testet und baut alles in einem festgenagelten Node-Container (auf dem Heimserver ist kein Node installiert).
#   scripts/build.sh          Tests (JS + Python), Card, Grav-Asset und Grav-ZIP
#   scripts/build.sh test     nur Tests
set -eu
cd "$(dirname "$0")/.."
NODE_IMAGE=node:22.11.0-alpine

docker run --rm -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD":/w -w /w "$NODE_IMAGE" \
    sh -c 'npm ci --no-audit --no-fund --loglevel=error && npm test'
python3 -m unittest discover -s test

[ "${1:-}" = test ] && exit 0

docker run --rm -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD":/w -w /w "$NODE_IMAGE" npm run --silent build

VERSION=$(python3 -c 'import json; print(json.load(open("package.json"))["version"])')
ZIP="dist/grav-plugin-agff-drywatch-$VERSION.zip"
python3 - "$ZIP" <<'PY'
import sys, zipfile, pathlib
ziel = pathlib.Path(sys.argv[1])
with zipfile.ZipFile(ziel, "w", zipfile.ZIP_DEFLATED) as z:
    for f in sorted(pathlib.Path("dist/agff-drywatch").rglob("*")):
        if f.is_file():
            z.write(f, f.relative_to("dist"))
print(ziel)
PY
