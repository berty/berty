IMAGE ?=	bertytech/protoc
VERSION ?=	32

build:
	cd ../../ && docker build --platform linux/amd64 -f ./tool/docker-protoc/Dockerfile -t $(IMAGE):$(VERSION) -t $(IMAGE):latest .

publish: build
	docker push $(IMAGE):$(VERSION)
	docker push $(IMAGE):latest
