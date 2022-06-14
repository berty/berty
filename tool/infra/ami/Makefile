# Parameters
export AWS_OWNER     ?= 406944788069
export AWS_REGION    ?= eu-west-3
export GITHUB_REMOTE ?= berty
export GITHUB_BRANCH ?= master
export GO_VERSION    ?= $(shell cat $(MAKEFILE_DIR)/../../../.tool-versions | grep '^golang [0-9]\+\.[0-9]\+\.[0-9]\+.*$$' | cut -d ' ' -f 2)
export DEBUG_GEN     ?= false
export HISTORY_SIZE  ?= 5


# Internal
MAKEFILE_DIR   := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
COMPONENTS_DIR := $(MAKEFILE_DIR)/components
COMPONENTS     := $(shell cd $(COMPONENTS_DIR) && ls -d */ | cut -d'/' -f1)
COMPONENT_PREF := comp
RECIPES_DIR    := $(MAKEFILE_DIR)/recipes
RECIPES        := $(shell cd $(RECIPES_DIR) && ls -d */ | cut -d'/' -f1)
RECIPE_PREF    := rcp
PIPELINE_DIR   := $(MAKEFILE_DIR)/pipeline
PIPELINE_PREF  := pipl
IMAGE_PREF     := img
LIBS_DIR       := $(MAKEFILE_DIR)/libs
MO             := $(LIBS_DIR)/mo
YAML           := $(LIBS_DIR)/yaml
SCRIPT_TMP     := $(shell mktemp)
OUTPUT_FIFO    := /tmp/fifo.$$PPID


# Help rule
help:
	@$(EXEC) printParameters AWS_OWNER AWS_REGION GITHUB_REMOTE GITHUB_BRANCH GO_VERSION DEBUG_GEN HISTORY_SIZE
	@$(EXEC) printCategory 'Create' 'component' 0 $(COMPONENT_PREF) $(COMPONENTS_DIR) $(COMPONENTS)
	@$(EXEC) printCategory 'Create' 'image recipe' 0 $(RECIPE_PREF) $(RECIPES_DIR) $(RECIPES)
	@$(EXEC) printCategory 'Build' 'image' 1 $(IMAGE_PREF) $(RECIPES_DIR) $(RECIPES)
.PHONY: help


# Component rules
$(addprefix $(COMPONENT_PREF).,$(COMPONENTS)):
	@`# Set folder name as component name for moustache generation`; \
	export COMPONENT_NAME='$(@:$(COMPONENT_PREF).%=%)'; \
\
	`# Set md5 hash of component related files as client token for moustache generation`; \
	export CLIENT_TOKEN=$$(cat $(COMPONENTS_DIR)/$$COMPONENT_NAME/* | md5 | cut -d ' ' -f 1); \
\
	`# Get component parameters to ignore then while generating data`; \
	$(EXEC) getComponentParameters $(COMPONENTS_DIR) $$COMPONENT_NAME $(OUTPUT_FIFO); \
	for param in $$(cat $(OUTPUT_FIFO)); do export "$$param={{ $$param }}"; done; \
\
	`# Generate data using moustache template`; \
	GEN_DATA=$$( \
		$(MO) -u \
		-s=$(COMPONENTS_DIR)/$$COMPONENT_NAME/variables \
		$(COMPONENTS_DIR)/$$COMPONENT_NAME/data.template.yml \
	); $(EXEC) printDebugGen "component $$COMPONENT_NAME data" "$$GEN_DATA" 1; \
\
	`# Generate aws-cli json using moustache template`; \
	GEN_JSON=$$( \
		$(MO) -u \
		-s=$(COMPONENTS_DIR)/$$COMPONENT_NAME/variables \
		$(COMPONENTS_DIR)/$$COMPONENT_NAME/specs.template.json \
	); $(EXEC) printDebugGen "component $$COMPONENT_NAME json" "$$GEN_JSON" 0; \
\
	`# Finally create component by passing generated json and data to aws-cli`; \
	aws imagebuilder create-component \
		--cli-input-json "$$GEN_JSON" \
		--data "$$GEN_DATA" > /dev/null \
	&& printf "Component <$$COMPONENT_NAME> creation : $$(tput setaf 2)Succeeded$$(tput sgr0)\n" \
	|| printf "Component <$$COMPONENT_NAME> creation : $$(tput setaf 1)Failed$$(tput sgr0)\n"

$(addprefix $(COMPONENT_PREF).,$(addsuffix .list,$(COMPONENTS))):
	@$(EXEC) printComponentVersion $(@:$(COMPONENT_PREF).%.list=%)

$(COMPONENT_PREF).all: $(addprefix $(COMPONENT_PREF).,$(COMPONENTS))
.PHONY: $(COMPONENT_PREF).all


# Image recipe rules
$(addprefix $(RECIPE_PREF).,$(RECIPES)):
	@`# Set folder name as recipe name for moustache generation`; \
	export RECIPE_NAME='$(@:$(RECIPE_PREF).%=%)'; \
\
	`# Set md5 hash of recipe related files as client token for moustache generation`; \
	export CLIENT_TOKEN=$$(cat $(RECIPES_DIR)/$$RECIPE_NAME/* | md5 | cut -d ' ' -f 1); \
\
	`# Generate data using moustache template`; \
	GEN_DATA=$$( \
		$(MO) -u \
		-s=$(RECIPES_DIR)/$$RECIPE_NAME/variables \
		$(RECIPES_DIR)/$$RECIPE_NAME/user_data.template.sh \
	); $(EXEC) printDebugGen "image recipe $$RECIPE_NAME data" "$$GEN_DATA" 1; \
\
	`# Generate aws-cli json using moustache template`; \
	GEN_JSON=$$( \
		USER_DATA=$$(echo "$$GEN_DATA" | base64) \
		$(MO) -u \
		-s=$(RECIPES_DIR)/$$RECIPE_NAME/variables \
		$(RECIPES_DIR)/$$RECIPE_NAME/specs.template.json \
	); $(EXEC) printDebugGen "image recipe $$RECIPE_NAME json" "$$GEN_JSON" 0; \
\
	`# Finally create image recipe by passing generated json and data to aws-cli`; \
	aws imagebuilder create-image-recipe --cli-input-json "$$GEN_JSON" > /dev/null \
	&& printf "Image recipe <$$RECIPE_NAME> creation : $$(tput setaf 2)Succeeded$$(tput sgr0)\n" \
	|| printf "Image recipe <$$RECIPE_NAME> creation : $$(tput setaf 1)Failed$$(tput sgr0)\n"

$(addprefix $(RECIPE_PREF).,$(addsuffix .list,$(RECIPES))):
	@$(EXEC) printImageRecipeVersion $(@:$(RECIPE_PREF).%.list=%)

$(RECIPE_PREF).all: $(addprefix $(RECIPE_PREF).,$(RECIPES))
.PHONY: $(RECIPE_PREF).all


# Image pipeline rules
$(addprefix $(IMAGE_PREF).,$(RECIPES)):
	@`# Set folder name as recipe name for moustache generation`; \
	export RECIPE_NAME='$(@:$(IMAGE_PREF).%=%)'; \
\
	`# Set md5 hash of image related files as client token for moustache generation`; \
	export CLIENT_TOKEN=$$(cat $(RECIPES_DIR)/$$RECIPE_NAME/* $(PIPELINE_DIR)/* | md5 | cut -d ' ' -f 1); \
\
	`# Create or update image timeline if needed`; \
	$(MAKE) $(PIPELINE_PREF).$$RECIPE_NAME; \
\
	`# Generate aws-cli json using moustache template`; \
	GEN_JSON=$$( \
		$(MO) -u \
		-s=$(RECIPES_DIR)/$$RECIPE_NAME/variables \
		$(PIPELINE_DIR)/start_pipeline_specs.template.json \
	); \
\
	printf "Starting this image pipeline to build a <$$RECIPE_NAME> image will launch servers and incur costs.\n"; \
	if printf "Do you still want to proceed? [y/N] " && read ans && [ $${ans:-N} = y ]; then \
		`# Finally start image pipeline by passing generated json and data to aws-cli`; \
		aws imagebuilder start-image-pipeline-execution --cli-input-json "$$GEN_JSON" > /dev/null \
		&& printf "Image pipeline <$$RECIPE_NAME> start : $$(tput setaf 2)Succeeded$$(tput sgr0)\n" \
		|| printf "Image pipeline <$$RECIPE_NAME> start : $$(tput setaf 1)Failed$$(tput sgr0)\n"; \
	else \
		printf "$$(tput setaf 3)Image build cancelled$$(tput sgr0)\n"; \
	fi

$(addprefix $(IMAGE_PREF).,$(addsuffix .list,$(RECIPES))):
	@$(EXEC) printImageVersion $(@:$(IMAGE_PREF).%.list=%)

$(IMAGE_PREF).all: $(addprefix $(IMAGE_PREF).,$(RECIPES))
.PHONY: $(IMAGE_PREF).all

$(addprefix $(PIPELINE_PREF).,$(RECIPES)): distrib_cfg infra_cfg
	@`# Set folder name as recipe name for moustache generation`; \
	export RECIPE_NAME='$(@:$(PIPELINE_PREF).%=%)'; \
\
	`# Set md5 hash of image pipeline related files as client token for moustache generation`; \
	export CLIENT_TOKEN=$$(cat $(RECIPES_DIR)/$$RECIPE_NAME/* $(PIPELINE_DIR)/* | md5 | cut -d ' ' -f 1); \
\
	`# Generate aws-cli json using moustache template`; \
	GEN_JSON=$$( \
		$(MO) -u \
		-s=$(PIPELINE_DIR)/variables \
		-s=$(RECIPES_DIR)/$$RECIPE_NAME/variables \
		$(PIPELINE_DIR)/pipeline_specs.template.json \
	); \
\
	`# Check if image pipeline already exists to choose between update or create`; \
    PIPELINE_ARN=$$(echo "$$GEN_JSON" | grep -o 'arn:aws:imagebuilder:.*image-pipeline/.*",' | cut -d '"' -f 1); \
	if aws imagebuilder get-image-pipeline --image-pipeline-arn "$$PIPELINE_ARN" &> /dev/null; then \
		`# Finally update image pipeline by passing generated json and data to aws-cli`; \
		UPDATE_JSON=$$(echo "$$GEN_JSON" | grep -v '"name":'); \
		$(EXEC) printDebugGen "image pipeline update json" "$$UPDATE_JSON" 0; \
		aws imagebuilder update-image-pipeline --cli-input-json "$$UPDATE_JSON" > /dev/null \
		&& printf "Image pipeline <$$RECIPE_NAME> update : $$(tput setaf 2)Succeeded$$(tput sgr0)\n" \
		|| printf "Image pipeline <$$RECIPE_NAME> update : $$(tput setaf 1)Failed$$(tput sgr0)\n"; \
	else \
		`# Finally create image pipeline by passing generated json and data to aws-cli`; \
		CREATE_JSON=$$(echo "$$GEN_JSON" | grep -v '"imagePipelineArn":'); \
		$(EXEC) printDebugGen "image pipeline update json" "$$CREATE_JSON" 0; \
		aws imagebuilder create-image-pipeline --cli-input-json "$$CREATE_JSON" > /dev/null \
		&& printf "Image pipeline <$$RECIPE_NAME> creation : $$(tput setaf 2)Succeeded$$(tput sgr0)\n" \
		|| printf "Image pipeline <$$RECIPE_NAME> creation : $$(tput setaf 1)Failed$$(tput sgr0)\n"; \
	fi

$(PIPELINE_PREF).all: $(addprefix $(PIPELINE_PREF).,$(RECIPES))
.PHONY: $(PIPELINE_PREF).all

distrib_cfg:
	@`# Set md5 hash of related files as client token for moustache generation`; \
	export CLIENT_TOKEN=$$(cat $(PIPELINE_DIR)/{distrib_cfg_specs.template.json,variables} | md5 | cut -d ' ' -f 1); \
\
	`# Generate aws-cli json using moustache template`; \
	GEN_JSON=$$( \
		$(MO) -u \
		-s=$(PIPELINE_DIR)/variables \
		$(PIPELINE_DIR)/distrib_cfg_specs.template.json \
	); \
\
	`# Check if distribution config already exists to choose between update or create`; \
    DISTRIB_CFG_ARN=$$(echo "$$GEN_JSON" | grep -o 'arn:aws:imagebuilder:.*",' | cut -d '"' -f 1); \
	if aws imagebuilder get-distribution-configuration --distribution-configuration-arn "$$DISTRIB_CFG_ARN" &> /dev/null; then \
		`# Finally update distribution config by passing generated json and data to aws-cli`; \
		UPDATE_JSON=$$(echo "$$GEN_JSON" | grep -v '"name":'); \
		$(EXEC) printDebugGen "distrib config update json" "$$UPDATE_JSON" 0; \
		aws imagebuilder update-distribution-configuration --cli-input-json "$$UPDATE_JSON" > /dev/null \
		&& printf "Distribution configuration update : $$(tput setaf 2)Succeeded$$(tput sgr0)\n" \
		|| printf "Distribution configuration update : $$(tput setaf 1)Failed$$(tput sgr0)\n"; \
	else \
		`# Finally create distribution config by passing generated json and data to aws-cli`; \
		CREATE_JSON=$$(echo "$$GEN_JSON" | grep -v '"distributionConfigurationArn":'); \
		$(EXEC) printDebugGen "distrib config update json" "$$CREATE_JSON" 0; \
		aws imagebuilder create-distribution-configuration --cli-input-json "$$CREATE_JSON" > /dev/null \
		&& printf "Distribution configuration creation : $$(tput setaf 2)Succeeded$$(tput sgr0)\n" \
		|| printf "Distribution configuration creation : $$(tput setaf 1)Failed$$(tput sgr0)\n"; \
	fi

infra_cfg:
	@`# Set md5 hash of related files as client token for moustache generation`; \
	export CLIENT_TOKEN=$$(cat $(PIPELINE_DIR)/{infra_cfg_specs.template.json,variables} | md5 | cut -d ' ' -f 1); \
\
	`# Generate aws-cli json using moustache template`; \
	GEN_JSON=$$( \
		$(MO) -u \
		-s=$(PIPELINE_DIR)/variables \
		$(PIPELINE_DIR)/infra_cfg_specs.template.json \
	); \
\
	`# Check if infrastructure config already exists to choose between update or create`; \
    INFRA_CFG_ARN=$$(echo "$$GEN_JSON" | grep -o 'arn:aws:imagebuilder:.*",' | cut -d '"' -f 1); \
	if aws imagebuilder get-infrastructure-configuration --infrastructure-configuration-arn "$$INFRA_CFG_ARN" &> /dev/null; then \
		`# Finally update infrastructure config by passing generated json and data to aws-cli`; \
		UPDATE_JSON=$$(echo "$$GEN_JSON" | grep -v '"name":'); \
		$(EXEC) printDebugGen "infra config update json" "$$UPDATE_JSON" 0; \
		aws imagebuilder update-infrastructure-configuration --cli-input-json "$$UPDATE_JSON" > /dev/null \
		&& printf "Infrastructure configuration update : $$(tput setaf 2)Succeeded$$(tput sgr0)\n" \
		|| printf "Infrastructure configuration update : $$(tput setaf 1)Failed$$(tput sgr0)\n"; \
	else \
		`# Finally create infrastructure config by passing generated json and data to aws-cli`; \
		CREATE_JSON=$$(echo "$$GEN_JSON" | grep -v '"infrastructureConfigurationArn":'); \
		$(EXEC) printDebugGen "infra config update json" "$$CREATE_JSON" 0; \
		aws imagebuilder create-infrastructure-configuration --cli-input-json "$$CREATE_JSON" > /dev/null \
		&& printf "Infrastructure configuration creation : $$(tput setaf 2)Succeeded$$(tput sgr0)\n" \
		|| printf "Infrastructure configuration creation : $$(tput setaf 1)Failed$$(tput sgr0)\n"; \
	fi


# Bash utils
define _script
	export AWS_PAGER=''

	function getComponentParameters {
		path=$1
		name=$2
		output_file=$3

		params=$(./libs/yaml "$path/$name/data.template.yml" | grep '^parameters+=(' | cut -d '"' -f 2 | cut -d : -f 1)
		for param in $params; do
			resp="$resp $param"
		done

		mkfifo $output_file
		echo "$resp" > $output_file && rm $output_file &
	}

	function printVersion {
		name=$1
		type=$2
		versions=$3

		if [ -z "$(echo "$versions" | xargs)" ]; then
			versions_count='0'
		else
			versions_count=$(echo "$versions" | wc -l | xargs)
		fi

		if [ "$versions_count" == "0" ]; then
			echo "No previous version found for $type '$name'."
		elif [ "$versions_count" == "1" ]; then
			printTitle "Last version found for $type '$name'"
			printf "\t- $versions\n"
		else
			printTitle "Last $versions_count versions found for $type '$name'"
			echo "$versions" | awk '{print "\t- "$0}'
		fi
		echo
	}

	function printComponentVersion {
		name=$1
		versions=$(aws imagebuilder list-components --owner Self --filters "name=name,values=$name" --query "sort_by(componentVersionList[], &dateCreated)[-$HISTORY_SIZE:].version" | tr -d '[]" ,' | sed '/^\s*$/d')

		printVersion "$name" component "$versions"
	}

	function printImageRecipeVersion {
		name=$1
		versions=$(aws imagebuilder list-image-recipes --owner Self --filters "name=name,values=$name" --query "sort_by(imageRecipeSummaryList[], &dateCreated)[-$HISTORY_SIZE:].arn" | tr -d '[]" ,' | sed '/^\s*$/d' | rev | cut -d/ -f1 | rev)

		printVersion "$name" 'image recipe' "$versions"
	}

	function printImageVersion {
		name=$1
		versions=$(aws imagebuilder list-images --owner Self --filters "name=name,values=$name" --query "sort_by(imageVersionList[], &dateCreated)[-$HISTORY_SIZE:].version" | tr -d '[]" ,' | sed '/^\s*$/d')

		[ -z "$(echo "$versions" | xargs)" ] && echo "No previous version found for image '$name'." && exit

		printTitle "Last version builds found for image '$name'"

		for version in $versions; do
			printf "    - $version :\n"
			aws imagebuilder list-image-build-versions --image-version-arn "arn:aws:imagebuilder:$AWS_REGION:$AWS_OWNER:image/$name/$version" --query "sort_by(imageSummaryList[], &dateCreated)[-$HISTORY_SIZE:].{BuildVersion: version, DateCreated: dateCreated, State: state}" |  sed '/^\[$/d' |  sed '/^\]$/d'

		done

		echo "\n    Logs available here : https://$AWS_REGION.console.aws.amazon.com/cloudwatch/home?region=$AWS_REGION#logsV2:log-groups/log-group/%252Faws%252Fimagebuilder%252F$name"
	}

	function printTitle {
	 	printf "\e[1m\e[4m$1\e[0m\n\n"
	}

	function printCategory {
		action=$1
		category=$2
		no_desc=$3
		rule_prefix=$4
		file_path=$5
		items="${@:6}"
	 	width=$(($(echo "$items" | tr ' ' '\n' | awk '{print length, $0}' | sort -rn | head -1 | cut -d ' ' -f 1) + $(echo "$rule_prefix" | wc -c)))

		echo
	 	printTitle "$action ${category}s"
	 	for item in $items; do
			if [ $no_desc -eq 0 ]; then
				description=$(grep 'DESCRIPTION=' $file_path/$item/variables | cut -d = -f 2 | tr -d '"')
			else
				description="$action $category for $item"
			fi
			printf "\tmake %-${width}s -> %s\n" "$rule_prefix.$item" "$description"
		done
	 	printf "\tmake %-${width}s -> %s\n" "$rule_prefix.all" "$action all ${category}s listed above"
		echo

	 	printTitle "List ${category}s"
	 	printf "\tmake %-${width}s -> %s\n" "$rule_prefix.<name>.list" "List HISTORY_SIZE last versions for <name>"
	}

	function printParameters {
		parameters="$@"
		printTitle 'Variable parameters'

	 	width=$(($(echo "$parameters" | tr ' ' '\n' | awk '{print length, $0}' | sort -rn | head -1 | cut -d ' ' -f 1) + 1))
		for parameter in $parameters; do
			printf "\t%-${width}s (default : %s)\n" "$parameter" "${!parameter}"
		done;
	}

	function printDebugGen {
		target=$1
		content=$2
		newline=$3

		if [ "$DEBUG_GEN" == "true" ]; then
			printTitle "Debug generation ($target)"
			[ -z "$content" ] && printf "<Empty>" || printf "$content\n"
			[ $newline -eq 1 ] && printf "\n\n"
		fi
	}

	$1 "${@:2}"
endef
export script=$(value _script)
EXEC=echo "$$script" > $(SCRIPT_TMP); bash $(SCRIPT_TMP)
