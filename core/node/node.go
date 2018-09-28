package node

import (
	"encoding/base64"
	"fmt"
	"sync"

	"github.com/gogo/protobuf/proto"
	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
	uuid "github.com/satori/go.uuid"

	"berty.tech/core/api/p2p"
	"berty.tech/core/crypto/sigchain"
	"berty.tech/core/entity"
	"berty.tech/core/network"
)

// Node is the top-level object of a Berty peer
type Node struct {
	clientEvents            chan *p2p.Event
	clientEventsSubscribers []clientEventSubscriber
	clientEventsMutex       sync.Mutex
	outgoingEvents          chan *p2p.Event
	sql                     *gorm.DB
	config                  *entity.Config
	initDevice              *entity.Device
	handleMutex             sync.Mutex
	networkDriver           network.Driver
	asyncWaitGroup          sync.WaitGroup
	devtools                struct {
		mapset map[string]string
	}

	pubkey    []byte // FIXME: use a crypto instance, i.e., enclave
	b64pubkey string // FIXME: same as above
}

// New initializes a new Node object
func New(opts ...NewNodeOption) (*Node, error) {
	n := &Node{
		// FIXME: fetch myself from db
		outgoingEvents: make(chan *p2p.Event, 100),
		clientEvents:   make(chan *p2p.Event, 100),
	}

	// apply optioners
	for _, opt := range opts {
		opt(n)
	}

	// check for misconfigurations based on optioners
	if err := n.Validate(); err != nil {
		return nil, errors.Wrap(err, "node is misconfigured")
	}

	// get config from sql
	config, err := n.Config()
	if err != nil {
		logger().Debug("config is missing from sql, creating a new one")
		if config, err = n.initConfig(); err != nil {
			return nil, errors.Wrap(err, "failed to initialize config")
		}
	}
	if err = config.Validate(); err != nil {
		return nil, errors.Wrap(err, "node config is invalid")
	}
	n.config = config

	// cache the signing pubkey
	var sc sigchain.SigChain
	if err := proto.Unmarshal(config.Myself.Sigchain, &sc); err != nil {
		return nil, errors.Wrap(err, "cannot get sigchain")
	}
	n.pubkey = []byte(sc.UserId)
	n.b64pubkey = base64.StdEncoding.EncodeToString(n.pubkey)

	// configure network
	if n.networkDriver != nil {
		if err := n.UseNetworkDriver(n.networkDriver); err != nil {
			return nil, errors.Wrap(err, "failed to setup network driver")
		}
	}

	return n, nil
}

// Close closes object initialized by Node itself
//
// it should be called in a defer from the caller of New()
func (n *Node) Close() error {
	return nil
}

// Validate returns an error if object is invalid
func (n *Node) Validate() error {
	if n == nil || n.sql == nil || n.initDevice == nil || n.networkDriver == nil {
		return errors.New("missing required fields to create a new Node")
	}
	return nil
}

// NewNodeOption is a callback used to configure a Node during intiailization phase
type NewNodeOption func(n *Node)

// NewID returns a unique ID prefixed with our contact ID
func (n *Node) NewID() string {
	return fmt.Sprintf("%s:%s", n.config.Myself.ID, uuid.Must(uuid.NewV4()).String())
}

func (n *Node) DeviceID() string {
	return n.config.CurrentDevice.ID
}

func (n *Node) UserID() string {
	return n.config.Myself.ID
}
