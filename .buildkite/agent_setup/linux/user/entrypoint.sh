#!/bin/sh
export GOROOT=${HOME}/goroot
PATH=${HOME}/bin:${GOROOT}/bin:${PATH} exec ${HOME}/.buildkite-agent/bin/buildkite-agent start
