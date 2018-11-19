
bootstrap ?= false
pubsub ?= false
relay ?= false
id ?=
chan ?= foo
discover ?= false
flags ?=

daemon:
	ipfs init || true
	if ${pubsub}; then \
		ipfs config Pubsub.Router gossipsub; \
		$(eval flags += --enable-pubsub-experiment) \
	fi
	if ${relay}; then \
		ipfs config --json Swarm.EnableRelayHop true; \
	else \
		ipfs config --json Swarm.EnableRelayHop false; \
	fi
	ipfs bootstrap rm --all
	cat bootstrap | ipfs bootstrap add;
	ipfs daemon ${flags}

stop:
	kill `ps aux | grep -v grep | grep 'ipfs' | cut -d ' ' -f 7`

connect:
	ipfs swarm connect /p2p-circuit/ipfs/${id}

sub:
	if ${discover}; then \
		ipfs pubsub sub --discover ${chan}; \
	else \
		ipfs pubsub sub ${chan}; \
	fi

pub:
	ipfs pubsub pub ${chan}

peers:
	ipfs pubsub peers

id:
	@ipfs id | grep '\"ID\"' | cut -d '"' -f 4
