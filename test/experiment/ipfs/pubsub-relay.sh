#!/bin/sh
cd "$(dirname "$(readlink "$0")")" && make daemon pubsub=true relay=true
