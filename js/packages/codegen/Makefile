export PWD := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)

berty_root := $(abspath $(PWD)/../../..)
berty_go_path := $(abspath $(PWD)/../../../go)
berty_api_path := $(abspath $(PWD)/../../../api)

codegen_mod := $(PWD)/node_modules
codegen_bin := $(codegen_mod)/.bin

codegen_lint := $(codegen_bin)/eslint
codegen_lint_options := --cache --fix --no-ignore

codegen_berty_path := $(berty_api_path)
codegen_protobuf_path := $(abspath $(PWD)/../../node_modules/@protocolbuffers/protobuf/src)
codegen_googleapis_path := $(abspath $(PWD)/../../node_modules/@googleapis/googleapis)
codegen_go_path := $(abspath $(berty_root)/vendor)

codegen_berty_chat_protos := \
	$(codegen_berty_path)/js-internal/bertychat.proto \
	$(codegen_berty_path)/js-internal/chatmodel.proto \

codegen_berty_protocol_protos := \
	$(codegen_berty_path)/bertyprotocol.proto \

codegen_berty_types_protos := \
	$(codegen_berty_path)/bertytypes.proto \

codegen_berty_orbitdb_protos := \
	$(codegen_berty_path)/bertydemo.proto \

codegen_berty_shared_protos := \
	$(codegen_berty_chat_protos) \
	$(codegen_berty_protocol_protos) \
	$(codegen_berty_types_protos) \
	$(codegen_berty_orbitdb_protos) \

codegen_berty_chat_sources := \
	$(shell find $(abspath $(PWD)/..) -type f -name '*.hbs' -path '*/berty-*/*' -not -path '*/node_modules/*') \
	$(shell find $(abspath $(PWD)/..) -type f -name '*.hbs' -path '*/*/chat/*' -not -path '*/node_modules/*')
codegen_berty_protocol_sources := $(shell \
	find $(abspath $(PWD)/..) -type f -name '*.hbs' -path '*/*/protocol/*' -not -path '*/node_modules/*')
codegen_berty_types_sources := $(shell \
	find $(abspath $(PWD)/..) -type f -name '*.hbs' -path '*/*/types/*' -not -path '*/node_modules/*')
codegen_berty_orbitdb_sources := $(shell \
	find $(abspath $(PWD)/..) -type f -name '*.hbs' -path '*/*/orbitdb/*' -not -path '*/node_modules/*')
codegen_berty_shared_sources := $(shell \
	find $(abspath $(PWD)/..) -maxdepth 2 -type f -name '*.hbs' -not -path '*/berty-*/*')

codegen_berty_chat_targets := $(patsubst %.hbs, %, $(codegen_berty_chat_sources))
codegen_berty_protocol_targets := $(patsubst %.hbs, %, $(codegen_berty_protocol_sources))
codegen_berty_types_targets := $(patsubst %.hbs, %, $(codegen_berty_types_sources))
codegen_berty_orbitdb_targets := $(patsubst %.hbs, %, $(codegen_berty_orbitdb_sources))
codegen_berty_shared_targets := $(patsubst %.hbs, %, $(codegen_berty_shared_sources))

codegen_targets := \
	$(codegen_berty_chat_targets) \
	$(codegen_berty_protocol_targets) \
	$(codegen_berty_types_targets) \
	$(codegen_berty_orbitdb_targets) \
	$(codegen_berty_shared_targets) \

codegen_pbhbs := $(abspath $(PWD)/node_modules/.bin/pbhbs)
codegen_pbhbs_flags := \
	-p $(codegen_berty_path) \
	-p $(codegen_googleapis_path) \
	-p $(codegen_go_path) \
	-p $(codegen_protobuf_path) \
	-H $(PWD)/helpers \

codegen_deps := \
	$(PWD)/Makefile \
	$(codegen_go_path) \
	$(PWD)/node_modules \

$(codegen_berty_chat_sources): $(codegen_deps) $(codegen_berty_chat_protos)
	touch $@

$(codegen_berty_protocol_sources): $(codegen_deps) $(codegen_berty_chat_protos)
	touch $@

$(codegen_berty_types_sources): $(codegen_deps) $(codegen_berty_chat_protos)
	touch $@

$(codegen_berty_orbitdb_sources): $(codegen_deps) $(codegen_berty_chat_protos)
	touch $@

$(codegen_berty_shared_sources): $(codegen_deps) $(codegen_berty_chat_protos)
	touch $@

$(codegen_berty_chat_targets): %: %.hbs
	$(codegen_pbhbs) $(codegen_pbhbs_flags) -t $(dir $@) -o $(dir $@) $(codegen_berty_chat_protos)

$(codegen_berty_protocol_targets): %: %.hbs
	$(codegen_pbhbs) $(codegen_pbhbs_flags) -t $(dir $@) -o $(dir $@) $(codegen_berty_protocol_protos)

$(codegen_berty_types_targets): %: %.hbs
	$(codegen_pbhbs) $(codegen_pbhbs_flags) -t $(dir $@) -o $(dir $@) $(codegen_berty_types_protos)

$(codegen_berty_orbitdb_targets): %: %.hbs
	$(codegen_pbhbs) $(codegen_pbhbs_flags) -t $(dir $@) -o $(dir $@) $(codegen_berty_orbitdb_protos)

$(codegen_berty_shared_targets): %: %.hbs
	$(codegen_pbhbs) $(codegen_pbhbs_flags) -t $(dir $@) -o $(dir $@) $(codegen_berty_shared_protos)

.PHONY: gen.codegen
gen.codegen: $(codegen_deps) $(codegen_targets)
	$(codegen_lint) $(codegen_lint_options) $(codegen_targets)

.PHONY: gen.codegen.watch
gen.codegen.watch: export PWD := $(PWD)
gen.codegen.watch: $(codegen_deps) $(codegen_targets)
	watchexec -w $(PWD)/.. -- make gen.codegen

.PHONY: gen
gen: gen.codegen
