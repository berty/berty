#!/bin/sh

@test() {
    title=$1
    shift

    ansi "- $title... "

    if [ $# -gt 0 ]; then
        (eval "$@" && ansi --green --bold --newline "OK")
    else
        fail 'Nothing to eval...'
    fi
}


@test_start() {
    title=$1
    ansi "- $title..."
    SECONDS=0
}


@test_end() {
    if [ $# -gt 0 ]; then
        (eval "$@" && ansi --green --bold --newline "OK (took $SECONDS .sec)")
    else
        fail 'Nothing to eval'
    fi
}


print_separator() {
    ansi --bold --newline '=============================='
}


waitport() {
    while ! nc -z localhost $1; do
        sleep 0.1
    done
}
