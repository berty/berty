export PWD := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)

berty_go_path := $(abspath $(PWD)/../../../go)

berty_api_mod := $(PWD)/node_modules
berty_api_bin := $(berty_api_mod)/.bin

berty_api_lint := $(berty_api_bin)/eslint
berty_api_lint_options := --cache --fix

berty_api_berty_path := $(abspath $(PWD)/../../../api)
berty_api_protobuf_path := $(abspath $(PWD)/../../node_modules/@protocolbuffers/protobuf/src)
berty_api_googleapis_path := $(abspath $(PWD)/../../node_modules/@googleapis/googleapis)
berty_api_go_path := $(abspath $(berty_go_path)/vendor)

berty_api_protos := $(berty_api_berty_path)/js-internal/bertychat.proto $(berty_api_berty_path)/js-internal/chatmodel.proto
berty_api_targets := \
	$(PWD)/index.pb.js \
	$(PWD)/index.pb.d.ts \

berty_api_pbjs := $(abspath $(PWD)/node_modules/.bin/pbjs)
berty_api_pbjs_flags := \
	-p $(berty_api_googleapis_path) \
	-p $(berty_api_go_path) \
	-p $(berty_api_protobuf_path) \

berty_api_pbts := $(abspath $(PWD)/node_modules/.bin/pbts)
berty_api_pbts_flags := --no-comments

berty_api_deps := $(PWD)/Makefile $(berty_go_path)/vendor $(PWD)/node_modules $(berty_api_pbjs) $(berty_api_pbts)

$(PWD)/index.pb.js: berty_api_pbjs_flags += --no-comments --es6 -w es6
$(PWD)/index.pb.js: $(berty_api_deps) $(berty_api_protos)
	$(berty_api_pbjs) $(berty_api_pbjs_flags) -t json-module -o $@ $(berty_api_protos)
	@# $(berty_api_lint) $(berty_api_lint_options) $@

$(PWD)/index.pb.d.ts: $(berty_api_deps) $(berty_api_protos)
	$(berty_api_pbjs) $(berty_api_pbjs_flags) -t static-module $(berty_api_protos) | $(berty_api_pbts) $(berty_api_pbts_flags) -o $@ -
	@# sed -E -i.bak 's/(.*)\?(.*\(.*)\|null(\).*)/\1\2\3/g' $@
	@# sed -E -i.bak 's/(.*)(:.*\(.*\.I[^(Timestamp)].*)(\))/\1?\2\|null\3/g' $@
	@# remove constructor (json-module does not support it)
	sed -E -i.bak 's/^.*constructor.*$$//g' $@
	rm $@.bak
	@# $(berty_api_lint) $(berty_api_lint_options)

.PHONY: gen.berty.api
gen.berty.api: $(berty_api_deps) $(berty_api_targets)

.PHONY: gen
gen: gen.berty.api
