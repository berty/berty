IMAGE ?= bertychat/protoc:v13

rebuild:
	docker build --no-cache --pull -t $(IMAGE) .

build:
	docker build --pull -t $(IMAGE) .

release: build
	docker push $(IMAGE)
