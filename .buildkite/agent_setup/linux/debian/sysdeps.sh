#!/bin/sh

set -e

# Absolute path to this script, e.g. /home/user/bin/foo.sh
SCRIPT=$(readlink -f "$0")
# Absolute path this script is in, thus /home/user/bin
SCRIPTPATH=$(dirname "$SCRIPT")

$SCRIPTPATH/install_docker.sh
$SCRIPTPATH/install_yarn.sh
apt-get install -y $(cat $SCRIPTPATH/bazel_requirements.txt)
install $SCRIPTPATH/../berty-build-agent@.service /etc/systemd/system
systemctl daemon-reload
