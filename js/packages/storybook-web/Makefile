export PWD := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
export PATH := $(PWD)/node_modules/.bin:$(PATH)

.PHONY: \
	deps.storybook \
	deps.storybook.web \

deps.storybook.web: export PWD := $(PWD)
deps.storybook.web: $(PWD)/node_modules
deps.storybook: deps.storybook.web

.PHONY: \
	run.storybook \
	run.storybook.web \

run.storybook.web: export PWD := $(PWD)
run.storybook.web: deps.storybook.web
	cd $(PWD) \
		&& (kill $$(lsof -t -i :7008) 2>/dev/null || true) \
		&& echo Y | start-storybook --port=7008 -c lib &
run.storybook: run.storybook.web
