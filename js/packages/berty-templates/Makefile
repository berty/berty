export PWD := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)

berty_go_path := $(abspath $(PWD)/../../../go)
berty_api_path := $(abspath $(PWD)/../../../api)

berty_templates_mod := $(PWD)/node_modules
berty_templates_bin := $(berty_templates_mod)/.bin

berty_templates_lint := $(berty_templates_bin)/eslint
berty_templates_lint_options := --cache --fix --no-ignore

berty_templates_berty_path := $(berty_api_path)
berty_templates_protobuf_path := $(abspath $(PWD)/../../node_modules/@protocolbuffers/protobuf/src)
berty_templates_googleapis_path := $(abspath $(PWD)/../../node_modules/@googleapis/googleapis)
berty_templates_go_path := $(abspath $(berty_go_path)/vendor)

berty_templates_berty_protos := \
	$(berty_templates_berty_path)/js-internal/bertychat.proto \
	$(berty_templates_berty_path)/js-internal/chatmodel.proto \

berty_templates_berty_sources := $(shell \
	find $(abspath $(PWD)/..) -type f -name '*.hbs' -path '*/berty-*/*' -not -path '*/node_modules/*')
berty_templates_berty_targets := $(patsubst %.hbs, %, $(berty_templates_berty_sources))

berty_templates_files := $(berty_templates_berty_protos) \

berty_templates_targets := $(berty_templates_berty_targets) \

berty_templates_pbhbs := $(abspath $(PWD)/node_modules/.bin/pbhbs)
berty_templates_pbhbs_flags := \
	-p $(berty_templates_berty_path) \
	-p $(berty_templates_googleapis_path) \
	-p $(berty_templates_go_path) \
	-p $(berty_templates_protobuf_path) \
	-H $(PWD)/helpers \

berty_templates_deps := \
	$(PWD)/Makefile \
	$(berty_go_path)/vendor \
	$(PWD)/node_modules \

$(berty_templates_targets): $(berty_story_deps) $(berty_templates_berty_protos)
$(berty_templates_targets): %: %.hbs
	$(berty_templates_pbhbs) $(berty_templates_pbhbs_flags) -t $(dir $@) -o $(dir $@) $(berty_templates_berty_protos)

.PHONY: gen.berty.templates
gen.berty.templates: $(berty_templates_deps) $(berty_templates_targets)
	$(berty_templates_lint) $(berty_templates_lint_options) $(berty_templates_targets)

.PHONY: gen.berty.templates.watch
gen.berty.templates.watch: export PWD := $(PWD)
gen.berty.templates.watch: $(berty_templates_deps) $(berty_templates_targets)
	watchexec -w $(PWD)/.. -- make gen.berty.templates

.PHONY: gen
gen: gen.berty.templates
