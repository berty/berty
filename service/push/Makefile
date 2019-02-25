name ?= berty-push
version ?= latest

apns ?= true
fcm ?= true

fcm-api-key ?=

bundle-type ?=

android-bundle ?= chat.berty.main
ios-bundle ?= chat.berty.ios

apns-dev-certs ?= $(ios-bundle).debug-voip.p12
apns-prod-certs ?= $(ios-bundle)-voip.p12 \
	$(ios-bundle).staff-voip.p12 \
	$(ios-bundle).yolo-voip.p12

fcm-api-keys ?= $(android-bundle):$(fcm-api-key) \
	$(android-bundle).yolo:$(fcm-api-key) \
	$(android-bundle).staff:$(fcm-api-key) \
	$(android-bundle).debug:$(fcm-api-key)

noop =
space = $(noop) $(noop)
comma = $(noop),$(noop)
join-with = $(shell echo $(2) | sed 's/ /$(1)/g' )

eval-apns-dev-certs := $(call join-with,$(comma), \
	$(filter $(ios-bundle)%$(bundle-type)-voip.p12, $(apns-dev-certs)))
eval-apns-prod-certs := $(call join-with,$(comma), \
	$(filter $(ios-bundle)%$(bundle-type)-voip.p12, $(apns-prod-certs)))
eval-fcm-api-keys := $(call join-with,$(comma), \
	$(filter $(android-bundle)%$(bundle-type):$(fcm-api-key), $(fcm-api-keys)))

apns-opts ?=
fcm-opts ?=

.PHONY: apns-opts
apns-opts:
ifeq ($(apns), true)
ifndef apns-opts
ifdef eval-apns-dev-certs
	$(eval apns-opts += --apns-dev-voip-certs $(eval-apns-dev-certs))
endif
ifdef eval-apns-prod-certs
	$(eval apns-opts += --apns-certs $(eval-apns-prod-certs))
endif
endif
endif

.PHONY: fcm-opts
fcm-opts:
ifeq ($(fcm), true)
ifndef fcm-opts
ifndef fcm-api-key
	@echo "error: you need to specify the fcm-api-key argument"
	@false
endif
ifdef eval-fcm-api-keys
	$(eval fcm-opts = --fcm-api-keys $(eval-fcm-api-keys))
endif
endif
endif


.PHONY: deps
deps: fcm-opts apns-opts
	git clone git@github.com:berty/ios-push-certs || true

.PHONY: build
build: deps
	docker build --no-cache --rm \
			--build-arg OPTIONS='$(fcm-opts) $(apns-opts) $(options)' \
			-t bertychat/push . \

.PHONY: run
run: build deps
	docker rm -f $(name) || true
	docker run --name $(name) bertychat/push

.PHONY: push
push: build
	docker push bertychat/push:$(version)
