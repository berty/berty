IMAGE ?= bertytech/protoc:v15

rebuild:
	docker build --no-cache --pull -t $(IMAGE) .

build:
	docker build --pull -t $(IMAGE) .

release: build
	docker push $(IMAGE)
