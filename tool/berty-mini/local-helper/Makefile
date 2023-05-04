ID ?= 42
IDS ?= 42 32
FORMAT ?= json
TMPDIR ?= /tmp
FILTERS ?= debug+:bty*,-*.grpc,error+:*
RUN_OPTS ?=
DAEMON_OPTS ?=
NAME ?= $(USER)-mini-$(ID)
GRAFANA_PORT ?= $(shell printf "9%03d" "$(ID)")
METRICS_PORT ?= $(shell printf "42%03d" "$(ID)")


.PHONY: run
run: metrics.register
	berty $(RUN_OPTS) \
		-log.file-filters="$(FILTERS)" -log.format=$(FORMAT) --log.file=$(TMPDIR)/berty-mini-$(ID).log mini \
			-store.dir $(TMPDIR)/berty-mini-$(ID) \
			-metrics.listener="/ip4/0.0.0.0/tcp/$(METRICS_PORT)" \
			$(DAEMON_OPTS)

.PHONY: tail
tail:
	@touch $(TMPDIR)/berty-mini-$(ID).log
	tail -f $(TMPDIR)/berty-mini-$(ID).log

.PHONY: loon
loon:
	@touch $(TMPDIR)/berty-mini-$(ID).log
	loon $(TMPDIR)/berty-mini-$(ID).log

.PHONY: multitail
multitail:
	@args='' ; for sid in $(IDS); do \
		args="$$args $(TMPDIR)/berty-mini-$$sid.log"; \
	done; loon -bgcolor $$args

.PHONY: metrics
metrics:;  docker compose up

metrics.register:
	[ -z `docker compose ps -q discovery` ] \
		|| docker compose exec -it discovery wget -qO- "http://localhost:4848/addtarget?target=host.docker.internal:${METRICS_PORT}&labels=mini_id:${ID}" 2>/dev/null \
		|| true

log-path:
	@realpath $(TMPDIR)/berty-mini-$(ID).log


.PHONY: log-stats
log-stats:
	@touch $(TMPDIR)/berty-mini-$(ID).log
	cat $(TMPDIR)/berty-mini-$(ID).log | jq -r '.level + " " + .logger + " " + .msg + " " + .error' | sort | uniq -c

.PHONY: share-qr
share-qr:
	berty share-invite -store.dir $(TMPDIR)/berty-mini-$(ID) --dev-channel

.PHONY: watch-log-stats
watch-log-stats:
	watch -d make log-stats

.PHONY: clean
clean: clean-logs
	rm -rf $(TMPDIR)/berty-mini-$(ID)

.PHONY: clean-logs
clean-logs:
	@# send empty lines and cleanup the log file without deleting it to allow keeping tail -f in other windows
	@printf "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n" >> $(TMPDIR)/berty-mini-$(ID).log
	> $(TMPDIR)/berty-mini-$(ID).log

.PHONY: kill
kill:
	pkill -f -- '--logfile=$(TMPDIR)/berty-mini-$(ID).log'
