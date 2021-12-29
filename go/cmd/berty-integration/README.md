# Berty Integration

Utility used to test Berty in realistic environments.

It can be used with the CLI when developing, but it was made primarily as a monitoring healthcheck.

## Usage

From the CLI, you can go to the `go/` folder of the project and run one of those commands:

```console
# test with the dev configuration (relays, bots, etc)
foo@bar:~$ make integration.dev
[...]
[+] finished - 42s
```

```console
# test with the production configuration (relays, bots, etc)
foo@bar:~$ make integration.dev
[...]
[+] finished - 42s
```

## Under the Hood

`berty-integration` runs a full `berty daemon` node with a temporary datastore.

By compiling and running the binary manually you can run the integration with various advanced workflows.

## Advanced Usages

`berty-integration` is very similar to a `berty daemon` node with few additional options.

```console
foo@bar:~$ make install
foo@bar:~$ berty-integration -h
Usage of integration:
  -integration.welcomebot string
        welcomebot addr (default "https://berty.tech/id#key=CiBQHH6a84AHwdahXR6NQcOxTKjUHeqLdQfIAzxAYSoD1xIgT-tFTYrU-tD55bYgaXbBNTlqTHubq-_Qb8ksv2bSH9o&name=Welcomebot%20Dev")
  -integration.testbot string
        testbot addr (default "https://berty.tech/id#key=CiAxSP1RYrv4yi7PsQZtqFH9fepMiqDD1M7y1aIZAzMmghIg_fXVz1J-HfCd6gtRlUN0GsWiIlfgVPamj7lgFIUqfOA&name=TestBot%20Dev")
  -log.file string
        if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters string
        zapfilter configuration (default "warn:*,-ipfs.* error+:*")
  -log.format string
        can be: json, console, color, light-console, light-color (default "light-color")
  -log.service string
        service name, used by the tracer (default "berty-integration")
  -log.tracer string
        specify "stdout" to output tracing on stdout or <hostname:port> to trace on jaeger
  -node.display-name string
        display name (default "moul (cli)")
  -node.listeners string
        gRPC API listeners
  -node.no-notif
        disable desktop notifications
  -node.rebuild-db
        reconstruct messenger DB from OrbitDB logs
  -node.restore-export-path string
        inits node from a specified export path
  -p2p.disable-ipfs-network
        disable as much networking feature as possible, useful during development
  -p2p.swarm-announce string
        IPFS announce addrs
  -p2p.ipfs-api-listeners string
        IPFS API listeners
  -p2p.swarm-no-announce string
        IPFS exclude announce addrs
  -p2p.local-discovery
        if true local discovery will be enabled (default true)
  -p2p.max-backoff duration
        maximum p2p backoff duration (default 1m0s)
  -p2p.min-backoff duration
        minimum p2p backoff duration (default 1s)
  -p2p.multipeer-connectivity
        if true Multipeer Connectivity will be enabled (default true)
  -p2p.rdvp string
        list of rendezvous point maddr, ":dev:" will add the default devs servers, ":none:" will disable rdvp (default ":default:")
  -p2p.swarm-listeners string
        IPFS swarm listeners (default ":default:")
  -p2p.webui-listener string
        IPFS WebUI listener
  -preset string
        applies various default values, see ADVANCED section below
  -store.dir string
        root datastore directory (default "/tmp/berty-integration004419521")
  -store.inmem
        disable datastore persistence
  -tor.binary-path string
        if set berty will use this external tor binary instead of his builtin one
  -tor.mode string
        changes the behavior of libp2p regarding tor, see advanced help for more details (default "disabled")
```

### Examples

* without logs: `berty-integration -log.filters=''`
* full logs: `berty-integration -log.filters='*'`
* custom testbot (i.e., local): `berty-integration -integration.testbot=https://berty.tech/id#foo-bar`
* ipv4 only, tcp and quic: `berty-integration -p2p.swarm-listeners=/ip4/0.0.0.0/tcp/0,/ip4/0.0.0.0/udp/0/quic`
* ipv6 only, without quic: `berty-integration -p2p.swarm-listeners=/ip6/::/tcp/0`
* with tor: `berty-integration -tor.mode=required`
