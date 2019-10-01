export IMAGE ?=	bertytech/bazel

build:
	$(MAKE) build.ubuntu

publish:
	$(MAKE) publish.ubuntu

build.%:
	$(MAKE) -C $* build

publish.%:
	$(MAKE) -C $* publish
