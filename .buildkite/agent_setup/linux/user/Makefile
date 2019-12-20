AGENT_GO_VERSION=1.13.5
AGENT_BAZEL_VERSION=0.29.1
AGENT_GOLANGCILINT_VERSION=1.21.0
AGENT_KEY_TYPE=ed25519
BUILDKITE_AGENT_TOKEN ?=xxx
CODECOV_TOKEN ?=xxx

check-program = $(foreach exec,$(1),$(if $(shell PATH="$(PATH)" which $(exec)),,$(error "No $(exec) in PATH")))
$(call check-program, sed sh mkdir chmod tar mv ssh-keygen bash curl yarn docker)

~/.ssh/id_%:
	ssh-keygen -t $* -f $@ -P ""

~/.buildkite-agent:
	bash -c "`curl -sL https://raw.githubusercontent.com/buildkite/agent/master/install.sh`"
	sed -i 's/^name="%hostname-%n"/name="%hostname-$(shell id -un)-%n"/g' $@/buildkite-agent.cfg
	@sed -i 's/^token="xxx"/token="$(BUILDKITE_AGENT_TOKEN)"/g' $@/buildkite-agent.cfg
	@echo sed -i 's/^token="xxx"/token="REDACTED"/g' $@/buildkite-agent.cfg

~/.buildkite-agent/hooks/environment: ~/.buildkite-agent
	mkdir -p ~/.buildkite-agent/hooks
	cp ~/environment.hook.template.sh $@
	chmod og-rwx $@
	@sed -i 's/^export CODECOV_TOKEN="xxx"/export CODECOV_TOKEN="$(CODECOV_TOKEN)"/g' $@
	@echo sed -i 's/^export CODECOV_TOKEN="xxx"/export CODECOV_TOKEN="REDACTED"/g' $@

~/bin:
	mkdir -p $@

~/goroot: export go_archive=go$(AGENT_GO_VERSION).linux-amd64.tar.gz
~/goroot:
	rm -fr ~/tmp/go
	mkdir -p ~/tmp/go
	cd ~/tmp && curl -LO https://dl.google.com/go/$(go_archive)
	cd ~/tmp && tar -xf $(go_archive)
	mv ~/tmp/go $@

~/bin/golangci-lint:
	cd ~ && curl -sfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s v$(AGENT_GOLANGCILINT_VERSION)

~/bin/codecov: ~/bin
	curl -s https://codecov.io/bash > $@
	chmod +x $@

~/go/pkg/mod:
	mkdir -p $@

~/bin/bazel: export bazel_installer=bazel-$(AGENT_BAZEL_VERSION)-installer-linux-x86_64.sh
~/bin/bazel:
	curl -LO https://github.com/bazelbuild/bazel/releases/download/$(AGENT_BAZEL_VERSION)/$(bazel_installer)
	chmod +x $(bazel_installer)
	./$(bazel_installer) --user

.PHONY: deps
deps: ~/.ssh/id_$(AGENT_KEY_TYPE) \
      ~/.buildkite-agent/hooks/environment \
      ~/.buildkite-agent \
      ~/goroot \
      ~/bin/golangci-lint \
      ~/bin/codecov \
      ~/bin/bazel \
      ~/go/pkg/mod \


.PHONY: start
start: deps
	~/entrypoint.sh
