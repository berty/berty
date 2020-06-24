storybookweb_pwd=$(shell pwd)/packages/storybook-web

.PHONY: \
	deps.storybook \
	deps.storybook.web \

deps.storybook.web: export PWD := $(storybookweb_pwd)
deps.storybook.web: $(storybookweb_pwd)/node_modules
deps.storybook: deps.storybook.web

.PHONY: \
	run.storybook \
	run.storybook.web \

run.storybook.web: export PWD := $(storybookweb_pwd)
run.storybook.web: deps.storybook.web
	cd $(storybookweb_pwd) \
		&& (kill $$(lsof -t -i :7008) 2>/dev/null || true) \
		&& echo Y | start-storybook --port=7008 -c lib &
run.storybook: run.storybook.web
