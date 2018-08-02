FROM  circleci/android:api-27-node8-alpha

COPY ./gomobile-env-flag.diff /tmp/gomobile-env-flag.diff

RUN cd ~ && git clone https://github.com/udhos/update-golang && sudo ~/update-golang/update-golang.sh
RUN echo "export PATH=/usr/local/go/bin/:~/go/bin:$PATH" >> ~/.bashrc
RUN /usr/local/go/bin/go get golang.org/x/mobile/cmd/gomobile
RUN patch -l < /tmp/gomobile-env-flag.diff ~/go/src/golang.org/x/mobile/cmd/gomobile/env.go && /usr/local/go/bin/go install golang.org/x/mobile/cmd/gomobile

