#!/bin/bash

GO111MODULE=on

repos=$(grep -E 'multiformats|libp2p|ipfs' go.mod | awk -F' ' '{if ($1) print $1}')

# clean up
[ "clean" = "$1" ] && echo "cleaning..." && (rm -rf vendor || true) && go clean -modcache > /dev/null 2>&1


echo "upgrading..."

# update them all
for repo in $repos; do
    version=$(git ls-remote --tags "git://$repo" | sed -E 's`refs/tags/(v[0-9]+\.[0-9]+\.[0-9]+).*`\1`g' | sort -V -k 2 | tail -1 | cut -f2)
    if [ ! -z "$version" ]; then
        echo "$repo -> $version"
        go mod edit -require "$repo@$version"
    fi
done

go mod vendor -v
go mod tidy
go mod verify
