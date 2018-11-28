#!/bin/bash

# Usage:
# - $CLIENT_X: to get client n entrypoint
# - $CLIENT_PUBKEY_X: to get client n public key

# test
testContactRequest() {
    @test_start "sending request"
    req="$(jq -n --arg id $CLIENT_PUBKEY_2 '{"contact":{"id":$id}}')"
    ret="$($CLIENT_1 berty.node.ContactRequest "$req")"
    @test_end \
     assertEquals 0 $?

    @test_start "accepting request"
    req="$(jq -n --arg id $CLIENT_PUBKEY_1 '{"id":$id}')"
    ret="$($CLIENT_2 berty.node.ContactAcceptRequest "$req")"
    @test_end \
     assertEquals 0 $?
}


# Setup
oneTimeSetUp() {
    . ../libs/ansi.sh
    . ../libs/utils.sh

    if [ ! -z "$CIRCLE_ARTIFACTS" ]; then
        LOGS_ARTIFACTS=$CIRCLE_ARTIFACTS
    fi

    ansi --bold --newline  'Warmup'

    NODES="$(docker-compose ps -q node)"

    if [ ! -n "$NODES" ]; then
        echo "docker compose not started"
        exit 1
    fi

    sleep 1

    @test_start "getting nodes addrs"
    c=1
    for node in $NODES; do
        eval "NODE_$c=$(docker port $node 1337)"
        c=$((c+1))
    done
    @test_end \
     assertNotNull '"Node 1 should not be empty"' '"$NODE_1"'

    @test_start "setup clients"
    c=1
    for node in $NODES; do
        eval "addr=\$NODE_$c"
        eval "CLIENT_$c='berty client --jaeger-address=localhost:6831 --no-indent --node-address=$addr'"
        c=$((c+1))
    done
    @test_end \
     assertNotNull '"Client 1 should not be empty"' '"$CLIENT_1"'

    @test_start "getting public key"
    c=1
    for node in $NODES; do
        eval "client=\$CLIENT_$c"
        eval "CLIENT_PUBKEY_$c=$($client berty.node.DeviceInfos '{}' | jq -ecM '.infos[] | select(.key | contains("pubkey")) | .value')"
        c=$((c+1))
    done
    @test_end \
     assertNotNull '"Client 1 pubkey should not be empty"' '"$CLIENT_PUBKEY_1"'

    print_separator
    ansi --newline
}


. ../libs/shunit2.sh
