export PWD := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)

berty_root := $(abspath $(PWD)/../../..)

api_mod := $(PWD)/node_modules
api_bin := $(api_mod)/.bin

api_lint := $(api_bin)/eslint
api_lint_options := --cache --fix

api_berty_path := $(abspath $(PWD)/../../../api)
api_protobuf_path := $(abspath $(PWD)/../../node_modules/@protocolbuffers/protobuf/src)
api_googleapis_path := $(abspath $(PWD)/../../node_modules/@googleapis/googleapis)
api_go_path := $(abspath $(berty_root)/vendor)

api_protos := \
	$(api_berty_path)/js-internal/bertychat.proto \
	$(api_berty_path)/js-internal/chatmodel.proto \
	$(api_berty_path)/bertydemo.proto \
	$(api_berty_path)/bertyprotocol.proto \

api_targets := \
	$(PWD)/index.pb.js \
	$(PWD)/index.pb.d.ts \

api_pbjs := $(abspath $(PWD)/node_modules/.bin/pbjs)
api_pbjs_flags := \
	-p $(api_googleapis_path) \
	-p $(api_go_path) \
	-p $(api_protobuf_path) \

api_pbts := $(abspath $(PWD)/node_modules/.bin/pbts)
api_pbts_flags := --no-comments

api_deps := \
	$(PWD)/Makefile \
	$(api_go_path) \
	$(PWD)/node_modules \
	$(api_pbjs) \
	$(api_pbts) \

$(PWD)/index.pb.js: api_pbjs_flags += --no-comments --es6 -w es6
$(PWD)/index.pb.js: $(api_deps) $(api_protos)
	$(api_pbjs) \
		$(api_pbjs_flags) \
		-t json-module \
		-o $@ \
		$(api_protos)
	@# $(api_lint) $(api_lint_options) $@

$(PWD)/index.pb.d.ts: $(api_deps) $(api_protos)
	$(api_pbjs) \
		$(api_pbjs_flags) \
		-t static-module \
		$(api_protos) \
		| $(api_pbts) $(api_pbts_flags) -o $@ -
	@# sed -E -i.bak 's/(.*)\?(.*\(.*)\|null(\).*)/\1\2\3/g' $@
	@# sed -E -i.bak 's/(.*)(:.*\(.*\.I[^(Timestamp)].*)(\))/\1?\2\|null\3/g' $@
	@# remove constructor (json-module does not support it)
	sed -E -i.bak 's/^.*constructor.*$$//g' $@
	rm $@.bak
	@# $(api_lint) $(api_lint_options)

.PHONY: gen.api
gen.api: $(api_deps) $(api_targets)

.PHONY: gen
gen: gen.api
