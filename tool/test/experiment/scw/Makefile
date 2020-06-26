RELAY_SCALE ?= 10

relays:
	ansible-playbook ./run-relay.yaml --extra-vars "scale=$(RELAY_SCALE)"

daemon:
	ansible-playbook ./run-daemon.yaml
