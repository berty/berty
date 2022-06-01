package main

import (
	"context"
	crand "crypto/rand"
	"encoding/base64"
	"flag"
	"fmt"
	mrand "math/rand"
	"net"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/libp2p/go-libp2p"
	libp2p_ci "github.com/libp2p/go-libp2p-core/crypto"
	metrics "github.com/libp2p/go-libp2p-core/metrics"
	"github.com/libp2p/go-libp2p-core/peer"
	libp2p_config "github.com/libp2p/go-libp2p/config"
	"github.com/libp2p/go-libp2p/p2p/protocol/circuitv2/relay"
	ma "github.com/multiformats/go-multiaddr"
	"github.com/peterbourgon/ff/v3/ffcli"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/collectors"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"moul.io/srand"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/pkg/errcode"
)

const (
	DefaultRelaySwarmListeners = "/ip4/0.0.0.0/tcp/4040,/ip4/0.0.0.0/udp/4141/quic,/ip6/::/tcp/4040,/ip6/::/udp/4040/quic"
	DefaultRelayKeySize        = 2048
	DefaultRelayKeyType        = "Ed25519"
)

func relayServerCommand() *ffcli.Command {
	var (
		// relay options
		relayRsrc = relay.Resources{Limit: &relay.RelayLimit{}}

		// p2p options
		swarmListeners string
		swarmAnnounce  string

		// key options
		keyPeerfile     string
		keyBase64       string
		keyGenType      string
		keyGenSize      int
		keyAutogenerate bool

		// metrics options
		prometheusListener string
	)

	defaultRelayRsrc := RelayDefaultResources()
	fsBuilder := func() (*flag.FlagSet, error) {
		fs := flag.NewFlagSet("berty relay", flag.ExitOnError)

		// relay
		fs.IntVar(&relayRsrc.BufferSize, "relay-buffsize", defaultRelayRsrc.BufferSize, "the size of the relayed connection buffers")
		fs.IntVar(&relayRsrc.MaxCircuits, "relay-max-circuits", defaultRelayRsrc.BufferSize, "the maximum number of open relay connections for each peer")
		fs.IntVar(&relayRsrc.MaxReservations, "relay-max-reservations", defaultRelayRsrc.MaxReservations, "the maximum number of active relay slots")
		fs.IntVar(&relayRsrc.MaxReservationsPerASN, "relay-max-reservations-per-asn", defaultRelayRsrc.MaxReservationsPerASN, "the maximum number of reservations origination from the same ASN")
		fs.IntVar(&relayRsrc.MaxReservationsPerIP, "relay-max-reservations-per-ip", defaultRelayRsrc.MaxReservationsPerIP, "the maximum number of reservations originating from the same IP")
		fs.IntVar(&relayRsrc.MaxReservationsPerPeer, "relay-max-reservations-per-peer", defaultRelayRsrc.MaxReservationsPerPeer, "the maximum number of reservations originating from the same peer")
		fs.DurationVar(&relayRsrc.ReservationTTL, "relay-reservation-ttl", defaultRelayRsrc.ReservationTTL, "ReservationTTL is the duration of a new (or refreshed reservation).")
		fs.Int64Var(&relayRsrc.Limit.Data, "relay-limit-data", defaultRelayRsrc.Limit.Data, "Data is the limit of data relayed (on each direction) before resetting the connection. Defaults to 128KB")
		fs.DurationVar(&relayRsrc.Limit.Duration, "relay-limit-duration", defaultRelayRsrc.Limit.Duration, "the time limit before resetting a relayed connection")

		// libp2p
		fs.StringVar(&swarmListeners, "swarm-listeners", DefaultRelaySwarmListeners, "lists of listeners of (m)addrs separate by a comma")
		fs.StringVar(&swarmAnnounce, "swarm-announce", "", "addrs that will be announce by this server")

		// metrics
		fs.StringVar(&prometheusListener, "prom-listener", ":9092", "listener to expose Prometheus host metric")

		// key
		fs.StringVar(&keyPeerfile, "key-file", "peer.key", "path of the peer key, if none exist, one will be automatically created")
		fs.StringVar(&keyBase64, "key-b64", "", "full private key, base 64 encoded")
		fs.StringVar(&keyGenType, "key-type", DefaultRelayKeyType, "for RSA key only, specfy the bit size of the key")
		fs.IntVar(&keyGenSize, "key-size", DefaultRelayKeySize, "for RSA key only, specfy the bit size of the key")
		fs.BoolVar(&keyAutogenerate, "key-autogenerate", true, "auto-generate key if none is found")

		manager.SetupLoggingFlags(fs) // also available at root level

		return fs, nil
	}

	return &ffcli.Command{
		Name:           "relay",
		ShortHelp:      "relay server",
		ShortUsage:     "berty [global flags] relay [flags]",
		FlagSetBuilder: fsBuilder,
		UsageFunc:      usageFunc,
		Options:        ffSubcommandOptions(),
		Exec: func(ctx context.Context, args []string) error {
			if len(args) > 0 {
				return flag.ErrHelp
			}

			mrand.Seed(srand.MustSecure())

			var logger *zap.Logger
			{
				var err error
				if logger, err = manager.GetLogger(); err != nil {
					return err
				}
			}

			// setup default libp2p options
			options := []libp2p.Option{
				libp2p.DefaultTransports, // default transport should be quic, tcp & ws
				libp2p.DefaultMuxers,
				libp2p.DefaultSecurity,
				libp2p.DefaultPeerstore,
			}

			// generate/get identity
			{
				var kbytes []byte
				var err error

				switch {
				case keyBase64 != "":
					kbytes, err = base64.StdEncoding.DecodeString(keyBase64)
					if err != nil {
						return fmt.Errorf("unable to decode base64 key identity: %w", err)
					}
				case keyPeerfile != "":
					if file, err := os.ReadFile(keyPeerfile); err != nil {
						if !os.IsNotExist(err) {
							return fmt.Errorf("unable to read key identity file: %w", err)
						}

						logger.Warn("no identity key file found", zap.String("path", keyPeerfile))

						// try to decode base64 file
					} else if data, err := base64.StdEncoding.DecodeString(string(file)); err == nil {
						kbytes = data
						logger.Debug("loaded identity key file", zap.String("path", keyPeerfile))
					} else {
						kbytes = data
					}
				default:
					logger.Warn("no identity key provided")
				}

				var pkey libp2p_ci.PrivKey

				switch {
				case len(kbytes) > 0:
					if pkey, err = libp2p_ci.UnmarshalPrivateKey(kbytes); err != nil {
						return fmt.Errorf("unable to unmarshall private key: %w", err)
					}
				case keyAutogenerate:
					logger.Warn("generating new identity...")
					pkey, err = generateNewKeyPair(keyGenType, keyGenSize, crand.Reader)
					if err != nil {
						return fmt.Errorf("unable to generate new key pair: %w", err)
					}

					if keyPeerfile != "" {
						if kbytes, err = libp2p_ci.MarshalPrivateKey(pkey); err != nil {
							return fmt.Errorf("unable to marshall key: %w", err)
						}

						logger.Warn("writing new identity key file", zap.String("path", keyPeerfile), zap.String("perm", "0644"))
						if err = os.WriteFile(keyPeerfile, kbytes, 0o600); err != nil {
							return fmt.Errorf("unable to write identity key file `%s`: %w", keyPeerfile, err)
						}
					}
				default:
					return fmt.Errorf("no identity key found")
				}

				// add identity
				options = append(options, libp2p.Identity(pkey))
			}

			// setup listeners
			{
				maddrs := strings.Split(swarmListeners, ",")
				laddrs, err := ipfsutil.ParseAddrs(maddrs...)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				// add listeners
				options = append(options, libp2p.ListenAddrs(laddrs...))
			}

			// setup addrs-factory to correctly advertise custom address
			{
				var addrsFactory libp2p_config.AddrsFactory = func(ms []ma.Multiaddr) []ma.Multiaddr { return ms }
				if swarmAnnounce != "" {
					aaddrs := strings.Split(swarmAnnounce, ",")
					announces, err := ipfsutil.ParseAddrs(aaddrs...)
					if err != nil {
						return errcode.TODO.Wrap(err)
					}

					addrsFactory = func([]ma.Multiaddr) []ma.Multiaddr { return announces }
				}

				// addr addrs factory
				options = append(options, libp2p.AddrsFactory(addrsFactory))
			}

			// setup bandwidth reporter
			var reporter *metrics.BandwidthCounter
			{
				reporter = metrics.NewBandwidthCounter()
				// add Bandwidth Reporter
				options = append(options, libp2p.BandwidthReporter(reporter))
			}

			// setup relay service
			options = append(options,
				libp2p.EnableRelayService(relay.WithResources(relayRsrc)),
				libp2p.ForceReachabilityPublic(),
			)

			// setup nat service, this will help other peers to discover their
			// reachability and their public address
			options = append(options, libp2p.EnableNATService())

			// init p2p host
			host, err := libp2p.New(options...)
			if err != nil {
				return errcode.TODO.Wrap(err)
			}

			maddrs, err := peer.AddrInfoToP2pAddrs(&peer.AddrInfo{
				ID:    host.ID(),
				Addrs: host.Addrs(),
			})
			if err != nil {
				return fmt.Errorf("unable to get peer addrs info: %w", err)
			}

			logfields := []zapcore.Field{zap.String("id", host.ID().Pretty())}
			for i, maddr := range maddrs {
				key := fmt.Sprintf("maddr#%d", i)
				logfields = append(logfields, zap.Stringer(key, maddr))
			}

			logger.Info("host_peer", logfields...)

			if prometheusListener != "" {
				ml, err := net.Listen("tcp", prometheusListener)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				registry := prometheus.NewRegistry()
				registry.MustRegister(collectors.NewBuildInfoCollector())
				registry.MustRegister(collectors.NewGoCollector())
				registry.MustRegister(ipfsutil.NewHostCollector(host))
				registry.MustRegister(ipfsutil.NewBandwidthCollector(reporter))

				handerfor := promhttp.HandlerFor(
					registry,
					promhttp.HandlerOpts{Registry: registry},
				)

				mux := http.NewServeMux()
				mux.Handle("/metrics", handerfor)

				go func() {
					if err := http.Serve(ml, mux); err != nil {
						logger.Error("metrics serve error", zap.Error(err))
					}
				}()

				logger.Info("metrics listener",
					zap.String("handler", "/metrics"),
					zap.String("listener", ml.Addr().String()))
			}

			<-ctx.Done()
			return ctx.Err()
		},
	}
}

// @NOTE(gfanton): those value are taken from `relay.DefaultResources()`.
// we keep these methods here for a better readability and to be able to change
// it easily

// DefaultLimit returns a RelayLimit object with the defaults filled in.
func RelayDefaultLimit() *relay.RelayLimit {
	return &relay.RelayLimit{
		Duration: 2 * time.Minute,
		Data:     1 << 17, // 128K
	}
}

func RelayDefaultResources() relay.Resources {
	return relay.Resources{
		Limit: RelayDefaultLimit(),

		ReservationTTL: time.Hour,

		MaxReservations: 128,
		MaxCircuits:     16,
		BufferSize:      2048,

		MaxReservationsPerPeer: 4,
		MaxReservationsPerIP:   8,
		MaxReservationsPerASN:  32,
	}
}
