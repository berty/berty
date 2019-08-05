CIRCLECI=circleci
CONFIG=config.yml
LOCAL_CONFIG=local.config.yml

$(LOCAL_CONFIG): $(CONFIG) $(CIRCLECI)
	$(CIRCLECI) config process $(CONFIG) > $(LOCAL_CONFIG)

.PHONY: validate
validate: $(CIRCLECI) $(CONFIG)
	$(CIRCLECI) config validate $(CONFIG)

local_%: $(CIRCLECI) $(LOCAL_CONFIG)
	cd .. && $(CIRCLECI) local execute --job $* -c .circleci/$(LOCAL_CONFIG)
