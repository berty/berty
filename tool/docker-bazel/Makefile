IMAGE ?=	bertytech/bazel
VERSION ?=  0.29.1-buster-r2

build:
	docker build -t $(IMAGE):$(VERSION) .

publish: build
	docker tag $(IMAGE):$(VERSION) $(IMAGE):latest
	docker push $(IMAGE):$(VERSION)
	docker push $(IMAGE):latest
