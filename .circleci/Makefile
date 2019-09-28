export PWD = $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))

LOCAL_CONFIG=$(abspath $(PWD)/config.local.yml)

$(LOCAL_CONFIG): $(abspath $(PWD)/config.yml)
	circleci config process $< > $@

.PHONY: run.local
run.local: job ?= unknown
run.local: $(LOCAL_CONFIG)
	cd $(abspath $(PWD)/..) && circleci local execute --config $< --job $(job)
