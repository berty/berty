IMAGE ?= bertychat/protoc:v9

build:
	docker build --pull -t $(IMAGE) .

release: build
	docker push $(IMAGE)
