AGENT_KEY_TYPE=ed25519
BUILDKITE_AGENT_TOKEN ?=xxx

.PHONY: deps
deps:	~/.ssh/id_$(AGENT_KEY_TYPE) \
			~/.buildkite-agent \
			~/Library/LaunchAgents/com.buildkite.buildkite-agent.plist \


~/.ssh/id_%:
	ssh-keygen -t $* -f $@ -P ""

~/.buildkite-agent:
	bash -c "`curl -sL https://raw.githubusercontent.com/buildkite/agent/master/install.sh`"
	gsed -i 's/^name="%hostname-%n"/name="%hostname-$(shell id -un)-%n"/g' $@/buildkite-agent.cfg
	@gsed -i 's/^token="xxx"/token="$(BUILDKITE_AGENT_TOKEN)"/g' $@/buildkite-agent.cfg
	@echo sed -i 's/^token="xxx"/token="REDACTED"/g' $@/buildkite-agent.cfg
	touch $@

~/Library/LaunchAgents/com.buildkite.buildkite-agent.plist: ~/.buildkite-agent
	# Download the launchd config to /Library/LaunchDaemons/
	curl --create-dirs -o $@ https://raw.githubusercontent.com/buildkite/agent/master/templates/launchd_local_with_gui.plist
	# Set buildkite-agent to be run as the current user (a full user, created via System Prefs)
	sed -i '' "s/your-build-user/$(whoami)/g" $@
	# Create the agent's log directory with the correct permissions
	mkdir -p ~/.buildkite-agent/log && chmod 775 ~/.buildkite-agent/log
