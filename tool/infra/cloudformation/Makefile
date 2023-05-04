MAKEFILE_DIR   := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
STACK_DIR      := $(MAKEFILE_DIR)/stack

stack:
	@`# Set md5 hash of related files as client token for moustache generation`; \
	export CLIENT_TOKEN=$$(cat $(STACK_DIR)/* | md5 | cut -d ' ' -f 1); \
\
	`# Set other required variables`; \
	export STACK_NAME='$@'; \
\
	`# Generate aws-cli json using moustache template`; \
	GEN_JSON=$$($(MO) -u $(STACK_DIR)/specs.template.json); \
\
	`# Check if stack already exists to choose between update or create`; \
    DISTRIB_CFG_ARN=$$(echo "$$GEN_JSON" | grep -o 'arn:aws:imagebuilder:.*",' | cut -d '"' -f 1); \
	if aws imagebuilder get-stack --stack-arn "$$DISTRIB_CFG_ARN" &> /dev/null; then \
		`# Finally update stack by passing generated json and data to aws-cli`; \
		UPDATE_JSON=$$(echo "$$GEN_JSON" | grep -v '"name":'); \
		$(EXEC) printDebugGen "distrib config update json" "$$UPDATE_JSON" 0; \
		aws imagebuilder update-stack --cli-input-json "$$UPDATE_JSON" > /dev/null \
		&& printf "Stack update : $$(tput setaf 2)Succeeded$$(tput sgr0)\n" \
		|| printf "Stack update : $$(tput setaf 1)Failed$$(tput sgr0)\n"; \
	else \
		`# Finally create stack by passing generated json and data to aws-cli`; \
		CREATE_JSON=$$(echo "$$GEN_JSON" | grep -v '"stackArn":'); \
		$(EXEC) printDebugGen "distrib config update json" "$$CREATE_JSON" 0; \
		aws imagebuilder create-stack --cli-input-json "$$CREATE_JSON" > /dev/null \
		&& printf "Stack creation : $$(tput setaf 2)Succeeded$$(tput sgr0)\n" \
		|| printf "Stack creation : $$(tput setaf 1)Failed$$(tput sgr0)\n"; \
	fi
