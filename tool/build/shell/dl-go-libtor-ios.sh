#!/usr/bin/env bash

download () {
    url=$1
    output=${2:--}

    if [ -x "$(command -v curl)" ]; then
        curl -sfL --output "$output" "$url" || (echo "unable to download $url" >&2 && exit 1)
    elif [ -x "$(command -v wget)" ] ; then
        wget -qO "$output" "$url"|| (echo "unable to download $url" >&2 && exit 1)
    else
        echo "curl or wget is required" >&2
        exit 1
    fi
}

script_dir=$(cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
root_dir=$(cd "$( dirname "$script_dir/../../../.." )" &> /dev/null && pwd)

go_libtor_ver=$(go list -mod=readonly -modfile="$root_dir/go.mod" -f '{{.Version}}' -m berty.tech/go-libtor)
go_libtor_libs_ver=$(cat "$root_dir/js/ios/tor-deps/version" 2> /dev/null)

if [ "$go_libtor_ver" != "$go_libtor_libs_ver" ]
then
    set -o pipefail;
    mkdir -p "$root_dir/js/ios/tor-deps"
    download "https://github.com/berty/go-libtor/releases/tag/$go_libtor_ver" |\
        grep -o 'ios-.*-universal\.tar\.gz' |\
        uniq |\
        while read -r lib; do
            download "https://github.com/berty/go-libtor/releases/download/$go_libtor_ver/$lib" | tar xf - -C "$root_dir/js/ios/tor-deps" || exit 1
        done || exit 1
    echo "$go_libtor_ver" > "$root_dir/js/ios/tor-deps/version";
fi
