ID ?= 42

.PHONY: run
run:
	berty --debug-p2p --debug-odb --logfile=/tmp/berty-mini-$(ID).log --debug mini -d /tmp/berty-mini-$(ID)

.PHONY: tail
tail:
	tail -f /tmp/berty-mini-$(ID).log

.PHONY: log-stats
log-stats:
	cat /tmp/berty-mini-$(ID).log | jq -r '.level + " " + .logger + " " + .msg + " " + .error' | sort | uniq -c

.PHONY: watch-log-stats
watch-log-stats:
	watch -d make log-stats
