.PHONY: test
test:
	docker-compose up -d homeserver-0 homeserver-1 homeserver-2
	docker-compose build client-0 client-1 client-2
	docker-compose up client-0 client-1 client-2

.PHONY: testwatch
testwatch:
	@if ! command -v watchman &>/dev/null; then brew install watchman; fi
	trap 'kill $$(jobs -p) 2>/dev/null; exit 0' INT;
	make test
	while true; do watchman-wait . -p "**/*.go"; clear; make test; sleep .3; done

