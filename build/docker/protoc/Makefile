IMAGE ?= bertychat/protoc:v3

build:
	docker build --pull -t $(IMAGE) .

release: build
	docker push $(IMAGE)
