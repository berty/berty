IMAGE ?=	bertytech/protoc
VERSION ?=	27

build:
	cd ../../ && docker build -f ./tool/docker-protoc/Dockerfile -t $(IMAGE):$(VERSION) -t $(IMAGE):latest .

publish: build
	docker push $(IMAGE):$(VERSION)
	docker push $(IMAGE):latest
