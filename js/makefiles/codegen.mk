codegen_pwd=$(shell pwd)/packages/codegen

berty_go_path := $(BERTY_ROOT)/go
berty_api_path := $(BERTY_ROOT)/api

codegen_mod := $(codegen_pwd)/node_modules
codegen_bin := $(codegen_mod)/.bin

codegen_lint := $(codegen_bin)/eslint
codegen_lint_options := --cache --fix --no-ignore

codegen_berty_path := $(berty_api_path)
codegen_protobuf_path := $(abspath $(codegen_pwd)/../../node_modules/@protocolbuffers/protobuf/src)
codegen_googleapis_path := $(abspath $(codegen_pwd)/../../node_modules/@googleapis/googleapis)
codegen_go_path := $(abspath $(BERTY_ROOT)/vendor)

codegen_berty_protocol_protos := \
	$(codegen_berty_path)/bertyprotocol.proto \

codegen_berty_messenger_protos := \
	$(codegen_berty_path)/bertymessenger.proto \

codegen_berty_types_protos := \
	$(codegen_berty_path)/bertytypes.proto \

codegen_berty_shared_protos := \
	$(codegen_berty_protocol_protos) \
	$(codegen_berty_messenger_protos) \
	$(codegen_berty_types_protos) \

codegen_berty_protocol_sources := $(shell \
	find packages -type f -name '*.hbs' -path '*/*/protocol/*' -not -path '*/node_modules/*')
codegen_berty_messenger_sources := $(shell \
	find packages -type f -name '*.hbs' -path '*/*/messenger/*' -not -path '*/node_modules/*')
codegen_berty_types_sources := $(shell \
	find packages -type f -name '*.hbs' -path '*/*/types/*' -not -path '*/node_modules/*')
codegen_berty_shared_sources := $(shell \
	find packages -maxdepth 2 -type f -name '*.hbs' -not -path '*/node_modules/*')

codegen_berty_protocol_targets :=$(patsubst %.hbs,%,$(codegen_berty_protocol_sources))
codegen_berty_messenger_targets :=$(patsubst %.hbs,%,$(codegen_berty_messenger_sources))
codegen_berty_types_targets :=$(patsubst %.hbs,%,$(codegen_berty_types_sources))
codegen_berty_shared_targets :=$(patsubst %.hbs,%,$(codegen_berty_shared_sources))

codegen_targets := \
	$(codegen_berty_protocol_targets) \
	$(codegen_berty_messenger_targets) \
	$(codegen_berty_types_targets) \
	$(codegen_berty_shared_targets) \

codegen_pbhbs := $(abspath $(codegen_pwd)/node_modules/.bin/pbhbs)
codegen_pbhbs_flags := \
	-p $(codegen_berty_path) \
	-p $(codegen_googleapis_path) \
	-p $(codegen_go_path) \
	-p $(codegen_protobuf_path) \
	-H $(codegen_pwd)/helpers \

codegen_deps := \
	makefiles/codegen.mk \
	$(codegen_go_path) \
	$(codegen_pwd)/node_modules \

uniq = $(if $1,$(firstword $1) $(call uniq,$(filter-out $(firstword $1),$1)))

$(codegen_berty_protocol_targets): $(codegen_berty_protocol_sources) $(codegen_berty_protocol_protos) $(codegen_deps)
	$(codegen_pbhbs) $(codegen_pbhbs_flags) -t $(dir $@) -o $(dir $@) $(codegen_berty_protocol_protos)
	$(codegen_lint) $(codegen_lint_options) $(filter $(dir $@)%,$(codegen_berty_protocol_targets))

$(codegen_berty_messenger_targets): $(codegen_berty_messenger_sources) $(codegen_berty_messenger_protos) $(codegen_deps)
	$(codegen_pbhbs) $(codegen_pbhbs_flags) -t $(dir $@) -o $(dir $@) $(codegen_berty_messenger_protos)
	$(codegen_lint) $(codegen_lint_options) $(filter $(dir $@)%,$(codegen_berty_messenger_targets))

$(codegen_berty_types_targets): $(codegen_berty_types_sources) $(codegen_berty_types_protos) $(codegen_deps)
	$(codegen_pbhbs) $(codegen_pbhbs_flags) -t $(dir $@) -o $(dir $@) $(codegen_berty_types_protos)
	$(codegen_lint) $(codegen_lint_options) $(filter $(dir $@)%,$(codegen_berty_types_targets))

$(codegen_berty_shared_targets): $(codegen_berty_shared_sources) $(codegen_berty_shared_protos) $(codegen_deps)
	$(codegen_pbhbs) $(codegen_pbhbs_flags) -t $(dir $@) -o $(dir $@) $(codegen_berty_shared_protos)
	$(codegen_lint) $(codegen_lint_options) $(filter $(dir $@)%,$(codegen_berty_shared_targets))

.PHONY: gen.codegen
gen.codegen: $(codegen_targets)

.PHONY: gen.codegen.watch
gen.codegen.watch: export PWD := $(codegen_pwd)
gen.codegen.watch: $(codegen_deps) $(codegen_targets)
	watchexec -w $(codegen_pwd)/.. -- make gen.codegen

.PHONY: gen
gen: gen.codegen

.PHONY: gen.codegen.clean
gen.codegen.clean:
	rm -f $(codegen_berty_protocol_targets) $(codegen_berty_messenger_targets) $(codegen_berty_types_targets) $(codegen_berty_shared_targets)

.PHONY: gen.clean
gen.clean: gen.codegen.clean
