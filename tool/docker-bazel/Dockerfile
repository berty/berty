# https://docs.bazel.build/versions/master/install-ubuntu.html

# We need go because we use vendored dependencies
FROM golang:1.13.5-buster

RUN apt-get update \
  && apt-get install -y \
    pkg-config \
    zip \
    g++ \
    zlib1g-dev \
    unzip \
    python3 \
    git \
    libssl-dev \
    patch \
  && rm -rf /var/lib/apt/lists/*

# libssl-dev is needed by go-openssl
# patch is needed by rules_go to build org_golang_x_tools with go 1.12.10
# git is needed by circleci
# the rest is bazel dependencies

ADD https://github.com/bazelbuild/bazel/releases/download/2.0.0/bazel-2.0.0-installer-linux-x86_64.sh \
    /tmp/bazel-2.0.0-installer-linux-x86_64.sh

RUN chmod +x /tmp/bazel-2.0.0-installer-linux-x86_64.sh

RUN /tmp/bazel-2.0.0-installer-linux-x86_64.sh --user

RUN chmod o+x /root

ENV PATH="${PATH}:/root/bin"
