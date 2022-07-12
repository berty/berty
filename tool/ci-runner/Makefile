MAKEFILE_DIR = $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
ENV_FILE     = $(MAKEFILE_DIR)/.env
PLAYBOOKS    = m1_setup_runner \
               mac_start_runner_daemon \
               mac_stop_runner_daemon

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
		printf "\tmake %-23s -> %s\n" "$$PLAYBOOK" "$$DESC"; \
	done

$(PLAYBOOKS):
	ansible-playbook -i inventory.yml $@.yml
