package rendezvous

import (
	"encoding/json"
	"fmt"
	"math/big"
	"time"

	emitter "github.com/berty/emitter-go/v2"
	// nolint:staticcheck // cannot use the new protobuf API while keeping gogoproto
	"github.com/golang/protobuf/proto"
	"github.com/libp2p/go-libp2p-core/peer"
	rendezvous "github.com/libp2p/go-libp2p-rendezvous"
	pb "github.com/libp2p/go-libp2p-rendezvous/pb"
	"go.uber.org/zap"
)

const EmitterServiceType = "emitter-io"

type EmitterPubSub struct {
	client     *emitter.Client
	adminKey   string
	serverAddr string
	publicaddr string
	logger     *zap.Logger
}

type EmitterPubSubSubscriptionDetails struct {
	ServerAddr  string
	ReadKey     string
	ChannelName string
}

type EmitterOptions struct {
	Logger           *zap.Logger
	ServerPublicAddr string
	EmitterOptions   []func(*emitter.Client)
}

func NewEmitterServer(serverAddr string, adminKey string, options *EmitterOptions) (*EmitterPubSub, error) {
	if options == nil {
		options = &EmitterOptions{}
	}

	if options.ServerPublicAddr == "" {
		options.ServerPublicAddr = serverAddr
	}

	if options.Logger == nil {
		options.Logger = zap.NewNop()
	}
	options.Logger = options.Logger.Named("emitter")

	c, err := emitter.Connect(serverAddr, func(_ *emitter.Client, msg emitter.Message) {
		options.Logger.Debug("emitter received msg", zap.String("topic", msg.Topic()))
	}, emitter.WithLogger(options.Logger.Named("cl")))
	if err != nil {
		options.Logger.Error("error on `Connect`", zap.Error(err))
	}

	options.Logger.Debug("connected to emitter", zap.String("target", serverAddr))

	ps := &EmitterPubSub{
		client:     c,
		adminKey:   adminKey,
		logger:     options.Logger,
		publicaddr: options.ServerPublicAddr,
		serverAddr: serverAddr,
	}

	return ps, nil
}

func (p *EmitterPubSub) Register(pid peer.ID, ns string, addrs [][]byte, ttlAsSeconds int, counter uint64) {
	p.logger.Debug("register", zap.String("pid", pid.String()), zap.String("ns", ns))

	channel := channelForRendezvousPoint(ns)
	writeKey, err := p.writeKeyForChannel(channel)
	if err != nil {
		p.logger.Error("unable to create topic for NS", zap.Error(err))
		return
	}

	dataToSend := &pb.RegistrationRecord{
		Id:    pid.String(),
		Addrs: addrs,
		Ns:    ns,
		Ttl:   time.Now().Add(time.Duration(ttlAsSeconds) * time.Second).UnixMilli(),
	}

	marshaled, err := proto.Marshal(dataToSend)
	if err != nil {
		p.logger.Error("unable to marshal proto", zap.Error(err))
		return
	}

	if err := p.client.PublishWithTTL(writeKey, channel, marshaled, ttlAsSeconds); err != nil {
		p.logger.Error("unable to publish on channel", zap.Error(err))
		return
	}

	p.logger.Debug("publishing done", zap.String("pid", pid.String()), zap.String("channel", channel))
}

func (p *EmitterPubSub) Unregister(_ peer.ID, _ string) {
	p.logger.Debug("unsupported method unregister")
}

func (p *EmitterPubSub) Subscribe(ns string) (string, error) {
	channel := channelForRendezvousPoint(ns)
	readKey, err := p.readKeysForChannel(channel)
	if err != nil {
		return "", err
	}

	jsonData, err := json.Marshal(&EmitterPubSubSubscriptionDetails{
		ServerAddr:  p.publicaddr,
		ReadKey:     readKey,
		ChannelName: channel,
	})
	if err != nil {
		return "", err
	}

	return string(jsonData), nil
}

func (p *EmitterPubSub) GetServiceType() string {
	return EmitterServiceType
}

func (p *EmitterPubSub) Close() error {
	p.client.Disconnect(time.Second)
	return nil
}

func (p *EmitterPubSub) writeKeyForChannel(channelName string) (string, error) {
	return p.keyForChannel(channelName, "w")
}

func (p *EmitterPubSub) readKeysForChannel(channelName string) (string, error) {
	return p.keyForChannel(channelName, "r")
}

func (p *EmitterPubSub) keyForChannel(channelName string, permissions string) (string, error) {
	key, err := p.client.GenerateKey(p.adminKey, channelName, permissions, int(time.Hour.Seconds()*24))
	if err != nil {
		return "", fmt.Errorf("unable to generate key: %w", err)
	}

	return key, nil
}

func channelForRendezvousPoint(topic string) string {
	// force base62 encoded topic (without '+' and '#' that are wildcard in the mqtt world)
	topic = toBase62(topic)
	return fmt.Sprintf("rdvp/%s/", topic)
}

func toBase62(topic string) string {
	var i big.Int
	i.SetBytes([]byte(topic))
	return i.Text(62)
}

var (
	_ rendezvous.RendezvousSync             = (*EmitterPubSub)(nil)
	_ rendezvous.RendezvousSyncSubscribable = (*EmitterPubSub)(nil)
)
