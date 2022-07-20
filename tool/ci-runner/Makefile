MAKEFILE_DIR = $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
ENV_FILE     = $(MAKEFILE_DIR)/.env
PLAYBOOKS    = m1_setup_runner \
               mac_start_runner_daemon \
               mac_stop_runner_daemon \
               mac_install_xcode_version \
               mac_switch_to_xcode_version
VERBOSE      ?= 0

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

$(PLAYBOOKS):
	ansible-playbook -i $(MAKEFILE_DIR)/inventory.yml $(MAKEFILE_DIR)/$@.yml $(if $(filter $(VERBOSE), 1), -vvv)

generate_xcode_cookie:
	$(MAKEFILE_DIR)/xcode-cookie/gen_cookie.sh
