#!/bin/sh

set -e

# Absolute path to this script, e.g. /home/user/bin/foo.sh
SCRIPT=$(readlink -f "$0")
# Absolute path this script is in, thus /home/user/bin
SCRIPTPATH=$(dirname "$SCRIPT")

username="$1"

[ -n "$username" ] || {
  echo "Error: missing username argument" 1>&2
  echo "Usage: $0 <username>" 1>&2
  false
}

agent_token_file="/root/secrets/buildkite-agent-token"
[ -f "$agent_token_file" ] || {
  echo "Error: missing buildkite agent token file '$agent_token_file'" 1>&2
  false
}
bootstrap_vars="BUILDKITE_AGENT_TOKEN=$(cat $agent_token_file)"

# Add codecov token if present
codecov_token_file="/root/secrets/codecov-token"
[ ! -f "$codecov_token_file" ] || {
  bootstrap_vars="$bootstrap_vars CODECOV_TOKEN=$(cat $codecov_token_file)"
}

useradd -m $username -G docker

user_home=`getent passwd $username | cut -d: -f6`
cp -r $SCRIPTPATH/user/* $user_home/
chown -R $username:$username $user_home

su -l $username -c "$bootstrap_vars make deps"

echo
echo "WARNING: YOU must add this key to the repo host (GitHub)"
cat $user_home/.ssh/id_ed25519.pub

echo
echo "WARNING: If this agent must be in special queues, don't forget to edit tags in '$user_home/.buildkite-agent/buildkite-agent.cfg'"

echo
echo "INFO: To start agent run 'systemctl start berty-build-agent@$username.service"
