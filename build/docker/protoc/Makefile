IMAGE ?= bertychat/protoc:v8

build:
	docker build --pull -t $(IMAGE) .

release: build
	docker push $(IMAGE)
