MAKEFILE_DIR = $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
ENV_FILE     = $(MAKEFILE_DIR)/.env
PLAYBOOKS    = $(basename $(shell cd $(MAKEFILE_DIR) && ls *.yml | grep -v inventory.yml) .yml)
VERBOSE      ?= 0
HOST_PARAM   ?=
TYPE_DELAY   ?= 5

ifneq ("$(wildcard $(ENV_FILE))","")
    include $(ENV_FILE)
    export
else
    $(warning File '.env' not found, this could prevent the Ansible scripts from working properly)
endif

help:
	@echo 'Help:'
	@for PLAYBOOK in $(PLAYBOOKS); do \
		DESC=$$(grep -e '- name:' "$$PLAYBOOK.yml" | head -1 | sed -e 's/^- name: //'); \
		printf "\tmake %-27s -> %s\n" "$$PLAYBOOK" "$$DESC"; \
	done
	@printf "\t%-32s -> %s\n" "generate_xcode_cookie" "Generate a cookie to download XCode"; \
	printf "\t%-32s -> %s\n" "type_password" "Wait $(TYPE_DELAY)s then type content of PASSWORD env var"

$(PLAYBOOKS):
	ansible-playbook -i $(MAKEFILE_DIR)/inventory.yml $(MAKEFILE_DIR)/$@.yml $(if $(filter $(VERBOSE), 1), -vvv) $(if $(HOST_PARAM),--extra-vars "host_param=$(HOST_PARAM)",) $(if $(filter $(VERBOSE), 1), -vvv)

generate_xcode_cookie: $(MAKEFILE_DIR)/xcode-cookie/vendor
	$(MAKEFILE_DIR)/xcode-cookie/gen_cookie.sh

$(MAKEFILE_DIR)/xcode-cookie/vendor: $(MAKEFILE_DIR)/xcode-cookie/Gemfile.lock
	cd $(MAKEFILE_DIR)/xcode-cookie && bundle install
	touch $@

type_password:
	@echo "Wait $(TYPE_DELAY)s then type '$(PASSWORD)'"
	@sleep $(TYPE_DELAY)
	@osascript \
		-e 'tell application "System Events"' \
		-e 'set textToType to "$(PASSWORD)"' \
		-e 'repeat with charToType in textToType' \
		-e 'keystroke charToType' \
		-e 'delay 0.042' \
		-e 'end repeat' \
		-e 'end tell'
	@if [ $$? -ne 0 ]; then \
		echo "\033[0;31mCheck if your terminal app has permission allowed in:\n\tPreferences → Security & Privacy → Privacy → Accessibility\033[0m"; \
	fi
