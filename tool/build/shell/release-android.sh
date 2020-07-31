#!/bin/bash -e

set -x
cd packages/berty-app

npx jetify
cd android
[ "$BUILDKITE" = "true" ] && echo 'android.buildCacheDir=/home/buildkite-agent/.cache/android-build-cache' >> gradle.properties
./gradlew bundleRelease
find . -name '*.aab'
[ -f ~/bundletool-all-0.12.0.jar ] || wget -O ~/bundletool-all-0.12.0.jar https://github.com/google/bundletool/releases/download/0.12.0/bundletool-all-0.12.0.jar
java -jar ~/bundletool-all-0.12.0.jar build-apks --bundle=./app/build/outputs/bundle/release/app-release.aab --output=./app.apks --mode=universal
unzip ./app.apks
find . -name '*.apk'
