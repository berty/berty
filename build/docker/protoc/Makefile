IMAGE ?= bertychat/protoc:v5

build:
	docker build --pull -t $(IMAGE) .

release: build
	docker push $(IMAGE)
