IMAGE ?= bertytech/linter:v4

build:
	docker build --pull -t $(IMAGE) .

release: build
	docker push $(IMAGE)
