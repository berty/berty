DOCKER_NAMESPACE ?= bertychat/
DOCKER_TAG ?= latest
IMAGES ?= android-ci linter

.PHONY: docker.build
docker.build:
	for image in $(IMAGES); do \
	  docker build -t $(DOCKER_NAMESPACE)$$image:$(DOCKER_TAG) -f Dockerfile.$$image .; \
	done

.PHONY: docker.release
docker.release:
	for image in $(IMAGES); do \
	  docker push $(DOCKER_NAMESPACE)$$image:$(DOCKER_TAG); \
	done
