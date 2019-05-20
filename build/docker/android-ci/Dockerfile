FROM  circleci/android:api-28-node8-alpha

ENV GO_VERSION=1.12.5

RUN cd ~ \
    &&  git clone https://github.com/udhos/update-golang \
    &&  RELEASE=$GO_VERSION sudo ~/update-golang/update-golang.sh

RUN echo "export PATH=/usr/local/go/bin/:~/go/bin:$PATH" >> ~/.bashrc

ENV PATH="/usr/local/go/bin/:/home/circleci/go/bin:${PATH}"

RUN go get -u golang.org/x/mobile/cmd/gomobile

RUN yes | sdkmanager ndk-bundle || true

COPY ./gomobile-env-flag.diff /tmp/gomobile-env-flag.diff

RUN patch -l < /tmp/gomobile-env-flag.diff ~/go/src/golang.org/x/mobile/cmd/gomobile/env.go \
&&  go install golang.org/x/mobile/cmd/gomobile

# see https://github.com/RedCoolBeans/dockerlint/issues/49
RUN gomobile init -v

RUN mkdir -p /opt/android/sdk/ndk-bundle/toolchains/mips64el-linux-android/prebuilt/linux-x86_64
