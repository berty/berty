IMAGE ?=	bertytech/bazel
VERSION ?=  1.1.0-buster-r0

build:
	docker build -t $(IMAGE):$(VERSION) .

publish: build
	docker tag $(IMAGE):$(VERSION) $(IMAGE):latest
	docker push $(IMAGE):$(VERSION)
	docker push $(IMAGE):latest
