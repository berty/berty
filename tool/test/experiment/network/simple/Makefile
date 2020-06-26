SCALE ?= 2

.PHONY: start
start:
	docker-compose up -d --scale node=$(SCALE)

.PHONY: test
test: start
	./2nodes_1relay.sh

.PHONY: stop
stop:
	docker-compose down

.PHONY: restart
restart: stop start
