FROM bertytech/berty:latest

RUN apk add --no-cache ca-certificates

EXPOSE 80
EXPOSE 443
EXPOSE 4004/tcp
EXPOSE 4004/udp

ARG OPTIONS
ENV OPTIONS=$OPTIONS

COPY ios-push-certs/certs/ .
# remove this line and give private key in cmd argument
COPY apns_private_key .

RUN echo $OPTIONS

ENTRYPOINT ["sh", "-c"]
CMD ["berty daemon \
        --bind-p2p /ip4/0.0.0.0/udp/4004/quic,/ip4/0.0.0.0/tcp/4004,/ip4/0.0.0.0/tcp/80,/ip4/0.0.0.0/tcp/443 \
        --mdns=false \
        $OPTIONS"]

