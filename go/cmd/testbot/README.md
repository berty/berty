# Berty TestBot

`TestBot` is a simple Berty bot service.

## Usage (in tests)

Its goal is to be used in end-to-end tests to check that everything runs smoothly including our code, our dependencies, and internet.

## Usage (as a human)

1. add the first bot as a contact

[embedmd]:# (../../../config/.tmp/qr-testbot.txt txt)
```txt
█████████████████████████████████████████████████████
█████████████████████████████████████████████████████
████ ▄▄▄▄▄ ██ ▄█▀▄▄█▄▀▄ ▄ ▀▄█▄▄▀ ▀ █▄▄█▀▄█ ▄▄▄▄▄ ████
████ █   █ █▄█  ▄▄█▀ ██    ██▀ █▄▀██▄██ ▀█ █   █ ████
████ █▄▄▄█ ██ ▄▀▄▄▀▄▄▀▄  ▄▄▄  ▄▄ ▄ ▄▀ ▄▄▄█ █▄▄▄█ ████
████▄▄▄▄▄▄▄█ ▀▄▀ ▀ ▀▄▀ ▀ █▄█ █▄█ █ █ █ █▄█▄▄▄▄▄▄▄████
████▄  ▀▄▄▄▄ ▀█▀▄ ██   ▄▄ ▄  █▄█▄▄█▄ ▄█▀█▄▄▀▀█▄█▀████
█████▄█ █▀▄ ▀███▀▄▄█▀  ▄█ █▄ ▄▄  ▀▀▀ ▀█▀ ▄██ ▀█ ▄████
█████ ▄██▀▄█▀▀█▄▄  ▄█▄▄ █ █ ▀▄█ ▄██  ▄▄█▄██▀  █▄▄████
████▄█▄ ▄█▄▀▄██▄██▄██▄▀█▄▄▄▄ █▄▄██      █▄██ █▄ ▄████
████▄   ▄▄▄ █ ▄▀██▄ ▄▄   ▀▀  █▄▄▄▄█▄▄▄▄███▄▄▄ █▄ ████
█████▀▄▀ ▀▄███▀ ▀▄▄ ▄  ▄██▄▀  █▀▄▄ █▄██ █ ▀▄  █ ▄████
█████ █▄ ▄▄▄ ▀▀█▄ ▄▄▄█   ▄▄▄ ▄▄▄▄█▄  █▄▄ ▄▄▄  █ ▄████
█████▄ █ █▄█ █ ▄  ▀▄▄ ▄  █▄█ ██▀ ▀▀▀▀█▄▀ █▄█  █▄▄████
████▀█▀▀▄▄▄ ▄ ▀ ▄ ██ ▀▄▄▄ ▄ ▄▄▄▄▄██ ▄▀▄█    ▄▄██ ████
████▄▄▄▀▀ ▄▀  █ ▄▀ █▀▄▄▀▄▄███▀▀█▄█ ▄ █▀█   ██▀▄ ▄████
█████ █▀▀ ▄ ▄ ▀▄▄  █▄ ▄▄   ▄█▀▄  ▄█ ▄▀▄▀▀████ ▀▀█████
████ █▀█▀ ▄██▄█▄ █▄█▄ ▀▀ █▄██ █▄▄▀██  ██▀▀ ▀█▀█▄ ████
██████▀▄█▄▄ ▄  █ █▄ ▄ █▀ ▄▄ ▀██ ▄██  ▄█▀▀█ ▄█▀█▀ ████
█████▀▀▀ █▄  ███▀█▄ ▄▀▀██▄▄▄█▀█▀██▄▄███▄  ▄ █▄▄  ████
████▄██▄▄█▄█▀  █▄ ▄███ █ ▄▄▄ ██▄▄▄▄ ▄██▀ ▄▄▄ ▄▀█▀████
████ ▄▄▄▄▄ █  ▄ █ ▀ ▀█▄█ █▄█  ▄▄ ▄▀▀▀ ▄█ █▄█  █▄ ████
████ █   █ █▄▄█ ▄ ██ █▄█▄ ▄▄▄▄█▄▄█▄▄ ▄█▀▄▄   ▀█ ▄████
████ █▄▄▄█ █ ▀▄ ▄  █▀█▄ ▀▄█▀▄▀█  ▀▄ ███ ▄██▄ █▄▀█████
████▄▄▄▄▄▄▄█▄▄▄█▄▄▄██▄▄▄▄██▄▄▄▄▄▄██▄▄▄▄██▄█▄██▄▄▄████
█████████████████████████████████████████████████████
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
https://berty.tech/id#contact/oZBLExQaU8TTubcawgfs8AVcH9FbFV5J1kdEVqgueBaFCMWsADV341pCv26zcHMv3GaTL6UHPzVoHzLoereFQLmBGAh2QKb/name=TestBot
```

2. type `/help`

TODO: use embedmd to list commands here
TODO: use embedmd to load qr code dynamically from /config/vars.yaml

## Under the hood

* requires two running `berty daemon` instances.
  * the first one is the "entrypoint"
  * the second one is used for some advanced workflows, i.e., multi-user-group, inviting, etc
* this bot is designed for short testing session, it is often reset, and may forgot your shared conversations

## Suggested Dev Environment

Open 3 terminals:

1. `berty daemon -node.listeners=/ip4/127.0.0.1/tcp/9092/grpc -store.dir=/tmp/testbot/1`
2. `berty daemon -node.listeners=/ip4/127.0.0.1/tcp/9093/grpc -store.dir=/tmp/testbot/2`
3. `testbot -debug`

## Deployment

See [../../../tool/deployments/testbot/](../../../tool/deployments/testbot/)
