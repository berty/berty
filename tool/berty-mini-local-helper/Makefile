ID ?= 42
FORMAT ?= json
TMPDIR ?= /tmp
RUN_OPTS ?=
NAME ?= $(USER)-mini-$(ID)

.PHONY: run
run:
	berty $(RUN_OPTS) --logformat=$(FORMAT) --logfile=$(TMPDIR)/berty-mini-$(ID).log mini -d $(TMPDIR)/berty-mini-$(ID)

.PHONY: tail
tail:
	@touch $(TMPDIR)/berty-mini-$(ID).log
	tail -f $(TMPDIR)/berty-mini-$(ID).log

.PHONY: log-stats
log-stats:
	@touch $(TMPDIR)/berty-mini-$(ID).log
	cat $(TMPDIR)/berty-mini-$(ID).log | jq -r '.level + " " + .logger + " " + .msg + " " + .error' | sort | uniq -c

.PHONY: share-qr
share-qr:
	berty share-invite -d $(TMPDIR)/berty-mini-$(ID) --dev-channel

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
