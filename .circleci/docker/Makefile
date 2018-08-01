DOCKER_IMAGE ?= berty/android-ci
DOCKER_TAG ?= latest

.PHONY: docker.build
docker.build:
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .

.PHONY: release
release:
	docker push $(DOCKER_IMAGE):$(DOCKER_TAG)
