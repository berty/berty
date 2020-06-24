api_pwd=$(shell pwd)/packages/api

api_mod := $(api_pwd)/node_modules
api_bin := $(api_mod)/.bin

api_lint := $(api_bin)/eslint
api_lint_options := --cache --fix

api_berty_path := $(abspath $(api_pwd)/../../../api)
api_protobuf_path := $(abspath $(api_pwd)/../../node_modules/@protocolbuffers/protobuf/src)
api_googleapis_path := $(abspath $(api_pwd)/../../node_modules/@googleapis/googleapis)
api_go_path := $(abspath $(BERTY_ROOT)/vendor)

api_protos := \
	$(api_berty_path)/bertyprotocol.proto \
	$(api_berty_path)/bertymessenger.proto \

api_targets := \
	$(api_pwd)/index.pb.js \
	$(api_pwd)/index.pb.d.ts \

api_pbjs := $(abspath $(api_pwd)/node_modules/.bin/pbjs)
api_pbjs_flags := \
	-p $(api_googleapis_path) \
	-p $(api_go_path) \
	-p $(api_protobuf_path) \

api_pbts := $(abspath $(api_pwd)/node_modules/.bin/pbts)
api_pbts_flags := --no-comments

api_deps := \
	makefiles/api.mk \
	$(api_go_path) \
	$(api_pwd)/node_modules \
	$(api_pbjs) \
	$(api_pbts) \

$(api_pwd)/index.pb.js: api_pbjs_flags += --no-comments --es6 -w es6
$(api_pwd)/index.pb.js: $(api_deps) $(api_protos)
	$(api_pbjs) \
		$(api_pbjs_flags) \
		-t json-module \
		-o $@ \
		$(api_protos)
	@# $(api_lint) $(api_lint_options) $@

$(api_pwd)/index.pb.d.ts: $(api_deps) $(api_protos)
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
