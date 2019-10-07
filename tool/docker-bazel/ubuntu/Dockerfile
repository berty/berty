# https://docs.bazel.build/versions/master/install-ubuntu.html

FROM ubuntu:18.04

# We need go because we use vendored dependencies
RUN apt-get update \
  && apt-get install -y software-properties-common \
  && add-apt-repository ppa:longsleep/golang-backports \
  && apt-get update \
  && apt-get install -y \
    pkg-config \
    zip \
    g++ \
    zlib1g-dev \
    unzip \
    python3 \
    git \
    golang-go \
    libssl-dev \
  && rm -rf /var/lib/apt/lists/*

ADD https://github.com/bazelbuild/bazel/releases/download/0.29.1/bazel-0.29.1-installer-linux-x86_64.sh \
    /tmp/bazel-0.29.1-installer-linux-x86_64.sh

RUN chmod +x /tmp/bazel-0.29.1-installer-linux-x86_64.sh

RUN /tmp/bazel-0.29.1-installer-linux-x86_64.sh --user

ENV PATH="${PATH}:/root/bin"
