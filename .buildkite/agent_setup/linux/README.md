# Buildkite linux agent setup

## Debian, root

### Sysdeps

Run `./debian/sysdeps.sh` to install/check apt deps
TODO: replace custom install docker with get.docker.com

### Create new agent

Run `./create-agent.sh <username>`

### Start agent

Run `systemctl start berty-build-agent@<username>.service`

### Start agent at boot

Run `systemctl enable berty-build-agent@<username>.service`

## Any linux, no root

### Init agent for your user

Run `cd user && BUILDKITE_AGENT_TOKEN=xxx make deps`

### Start agent
Run `cd user && ./entrypoint.sh`
