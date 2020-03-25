export PWD := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)

berty_root := $(abspath $(PWD)/../../..)

berty_store_mod := $(PWD)/node_modules
berty_store_bin := $(berty_store_mod)/.bin

berty_store_lint := $(berty_store_bin)/eslint
berty_store_lint_options := --cache --fix

berty_store_berty_path := $(abspath $(PWD)/../../../api)
berty_store_protobuf_path := $(abspath $(PWD)/../../node_modules/@protocolbuffers/protobuf/src)
berty_store_googleapis_path := $(abspath $(PWD)/../../node_modules/@googleapis/googleapis)
berty_store_go_path := $(abspath $(berty_root)/vendor)

berty_store_berty_files := \
	$(berty_store_berty_path)/js-internal/bertychat.proto \
	$(berty_store_berty_path)/js-internal/chatmodel.proto \

berty_store_berty_targets := \
	$(PWD)/swr.gen.tsx \

berty_store_files := $(berty_store_berty_files) \

berty_store_targets := $(berty_store_berty_targets) \

berty_store_pbhbs := $(abspath $(PWD)/node_modules/.bin/pbhbs)
berty_store_pbhbs_flags := \
	-p $(berty_store_berty_path) \
	-p $(berty_store_googleapis_path) \
	-p $(berty_store_go_path) \
	-p $(berty_store_protobuf_path) \
	-t $(PWD)/templates \
	-H $(PWD)/templates/helpers \
	-o $(PWD) \

berty_store_deps := \
	$(PWD)/Makefile \
	$(berty_store_go_path) \
	$(PWD)/node_modules \

$(PWD)/%: $(berty_story_deps) $(berty_store_berty_files)
$(PWD)/%: $(PWD)/templates/%.hbs
	$(berty_store_pbhbs) $(berty_store_pbhbs_flags) $(berty_store_berty_files)
	$(berty_store_lint) $(berty_store_lint_options) $@

.PHONY: gen.berty.store
gen.berty.store: $(berty_store_deps) $(berty_store_targets)

.PHONY: gen.berty.store.watch
gen.berty.store.watch: export PWD := $(PWD)
gen.berty.store.watch: $(berty_store_deps) $(berty_store_targets)
	watchexec -w $(PWD) -- make gen.berty.store

.PHONY: gen
gen: gen.berty.store
