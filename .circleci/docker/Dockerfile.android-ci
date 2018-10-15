FROM  circleci/android:api-27-node8-alpha

RUN cd ~ \
&&  git clone https://github.com/udhos/update-golang \
&&  sudo ~/update-golang/update-golang.sh

RUN echo "export PATH=/usr/local/go/bin/:~/go/bin:$PATH" >> ~/.bashrc

ENV PATH="/usr/local/go/bin/:/home/circleci/go/bin:${PATH}"

RUN go get golang.org/x/mobile/cmd/gomobile

RUN sdkmanager ndk-bundle

COPY ./gomobile-env-flag.diff /tmp/gomobile-env-flag.diff

RUN patch -l < /tmp/gomobile-env-flag.diff ~/go/src/golang.org/x/mobile/cmd/gomobile/env.go \
&&  go install golang.org/x/mobile/cmd/gomobile

# see https://github.com/RedCoolBeans/dockerlint/issues/49
RUN gomobile init -v -ndk /opt/android/sdk/ndk-bundle

RUN mkdir -p /opt/android/sdk/ndk-bundle/toolchains/mips64el-linux-android/prebuilt/linux-x86_64
