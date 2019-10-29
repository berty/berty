export PWD := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)

berty_go_path := $(abspath $(PWD)/../../../go)

api_chat_mod := $(PWD)/node_modules
api_chat_bin := $(api_chat_mod)/.bin

api_chat_lint := $(api_chat_bin)/eslint
api_chat_lint_options := --cache --fix

api_chat_berty_path := $(abspath $(PWD)/../../../api)
api_chat_protobuf_path := $(abspath $(PWD)/../../node_modules/@protocolbuffers/protobuf/src)
api_chat_googleapis_path := $(abspath $(PWD)/../../node_modules/@googleapis/googleapis)
api_chat_go_path := $(abspath $(berty_go_path)/vendor)

api_chat_berty_files := $(api_chat_berty_path)/bertychat.proto $(api_chat_berty_path)/chatmodel.proto
api_chat_berty_targets := \
	$(PWD)/index.pb.js \
	$(PWD)/index.pb.d.ts \
	$(PWD)/index.js \

api_chat_files := $(api_chat_berty_files) \

api_chat_targets := $(api_chat_berty_targets) \

api_chat_pbjs := $(abspath $(PWD)/node_modules/.bin/pbjs)
api_chat_pbjs_flags := \
	-p $(api_chat_googleapis_path) \
	-p $(api_chat_go_path) \
	-p $(api_chat_protobuf_path) \


api_chat_pbts := $(abspath $(PWD)/node_modules/.bin/pbts)
api_chat_pbts_flags := --no-comments

api_chat_pbhbs := $(abspath $(PWD)/node_modules/.bin/pbhbs)

api_chat_pbhbs_flags := \
	-p $(api_chat_berty_path) \
	-p $(api_chat_googleapis_path) \
	-p $(api_chat_go_path) \
	-p $(api_chat_protobuf_path) \
	-t $(PWD)/templates \
	-H $(PWD)/templates/helpers \
	-o $(PWD) \

api_chat_deps := $(PWD)/Makefile $(berty_go_path)/vendor $(PWD)/node_modules $(api_chat_pbjs) $(api_chat_pbts)

$(berty_go_path)/vendor:
	cd $(berty_go_path) && GO111MODULE=on go mod vendor

$(PWD)/index.pb.js: api_chat_pbjs_flags += --no-comments --es6 -w es6
$(PWD)/index.pb.js: $(api_chat_berty_files) $(PWD)/Makefile
	$(api_chat_pbjs) $(api_chat_pbjs_flags) -t json-module -o $@ $(api_chat_berty_files)
	@# $(api_chat_lint) $(api_chat_lint_options) $@

$(PWD)/index.pb.d.ts: $(api_chat_berty_files) $(PWD)/Makefile
	$(api_chat_pbjs) $(api_chat_pbjs_flags) -t static-module $(api_chat_berty_files) | $(api_chat_pbts) $(api_chat_pbts_flags) -o $@ -
	sed -E -i.bak 's/(.*)\?(.*\(.*)\|null(\).*)/\1\2\3/g' $@
	sed -E -i.bak 's/(.*)(:.*\(.*\.I[^(Timestamp)].*)(\))/\1?\2\|null\3/g' $@
	rm $@.bak
	@# $(api_chat_lint) $(api_chat_lint_options) $@

$(PWD)/index.js: $(PWD)/templates/index.js.hbs $(api_chat_berty_files) $(PWD)/Makefile
	$(api_chat_pbhbs) $(api_chat_pbhbs_flags) $(api_chat_berty_files)
	@# $(api_chat_lint) $(api_chat_lint_options) $@

.PHONY: gen.api.chat
gen.api.chat: $(api_chat_deps) $(api_chat_targets)

.PHONY: gen
gen: gen.api.chat

.PHONY: gen.clean.api.chat
gen.clean.api.chat: export PWD := $(PWD)
gen.clean.api.chat:
	rm -rf $(api_chat_targets)

.PHONY: gen.clean
gen.clean: gen.clean.api.chat
