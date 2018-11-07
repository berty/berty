package node

import (
	"encoding/base64"
	"fmt"
	"sync"
	"time"

	"github.com/gogo/protobuf/proto"
	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
	uuid "github.com/satori/go.uuid"

	"berty.tech/core/api/p2p"
	"berty.tech/core/crypto/keypair"
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
	networkMetrics          network.Metrics
	asyncWaitGroup          sync.WaitGroup
	pubkey                  []byte // FIXME: use a crypto instance, i.e., enclave
	b64pubkey               string // FIXME: same as above
	sigchain                *sigchain.SigChain
	crypto                  keypair.Interface

	// devtools
	createdAt time.Time // used for uptime calculation
	devtools  struct {
		mapset map[string]string
	}
}

// New initializes a new Node object
func New(opts ...NewNodeOption) (*Node, error) {
	n := &Node{
		// FIXME: fetch myself from db
		outgoingEvents: make(chan *p2p.Event, 100),
		clientEvents:   make(chan *p2p.Event, 100),
		createdAt:      time.Now().UTC(),
	}

	// apply optioners
	for _, opt := range opts {
		opt(n)
	}

	// check for misconfigurations based on optioners
	if err := n.Validate(); err != nil {
		return nil, errors.Wrap(err, "node is misconfigured")
	}

	// cache the signing pubkey
	var sc sigchain.SigChain
	if err := proto.Unmarshal(n.config.Myself.Sigchain, &sc); err != nil {
		return nil, errors.Wrap(err, "cannot get sigchain")
	}

	pubKey, err := n.crypto.GetPubKey()

	if err != nil {
		return nil, errors.Wrap(err, "failed to retrieve public key")
	}

	n.pubkey = pubKey
	n.b64pubkey = base64.StdEncoding.EncodeToString(n.pubkey)

	n.sigchain = &sc

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
	if n == nil {
		return errors.New("missing required fields (node) to create a new Node")
	} else if n.sql == nil {
		return errors.New("missing required fields (gorm) to create a new Node")
	} else if n.initDevice == nil {
		return errors.New("missing required fields (initDevice) to create a new Node")
	} else if n.networkDriver == nil {
		return errors.New("missing required fields (networkDriver) to create a new Node")
	} else if n.crypto == nil {
		return errors.New("missing required fields (crypto) to create a new Node")
	} else if n.config == nil {
		return errors.New("missing required fields (config) to create a new Node")
	} else if n.config.Myself == nil {
		return errors.New(fmt.Sprintf("missing required fields (config.Myself) to create a new Node %+v\n\n\n\n", n.config))
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

func (n *Node) PubKey() string {
	return n.b64pubkey
}
