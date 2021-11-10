#!/bin/sh

# See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/15960#issuecomment-440892917

case "$OSTYPE" in
    darwin*)  PLATFORM="OSX" ;;
    linux*)   PLATFORM="LINUX" ;;
    bsd*)     PLATFORM="BSD" ;;
    *)        PLATFORM="UNKNOWN" ;;
esac

# cross platform sed
replace() {
    if [[ "$PLATFORM" == "OSX" || "$PLATFORM" == "BSD" ]]; then
        sed -i "" "$1" "$2"
    elif [ "$PLATFORM" == "LINUX" ]; then
        sed -i "$1" "$2"
    fi
}

# React Native declares global types that interfere with @types/node and lib dom.
rm -f node_modules/@types/react-native/globals.d.ts
replace 's|/// <reference path="globals.d.ts" />||' node_modules/@types/react-native/index.d.ts

# Namespace the globals
replace 's|declare global|declare namespace IgnoreTheseGlobals|' node_modules/@types/react-native/index.d.ts