IMAGE ?= bertychat/android-ci:v2

build:
	docker build --pull -t $(IMAGE) .

release: build
	docker push $(IMAGE)
