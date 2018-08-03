package node

import (
	"context"
	"fmt"
	"sync"

	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
	uuid "github.com/satori/go.uuid"
	"go.uber.org/zap"

	"github.com/berty/berty/core/api/p2p"
	"github.com/berty/berty/core/entity"
	"github.com/berty/berty/core/network"
	"github.com/berty/berty/core/sql"
)

// Node is the top-level object of a Berty peer
type Node struct {
	clientEvents          chan *p2p.Event
	outgoingEvents        chan *p2p.Event
	clientEventsConnected bool
	sql                   *gorm.DB
	config                *entity.Config
	initDevice            *entity.Device
	handleMutex           sync.Mutex
	networkDriver         network.Driver
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
		zap.L().Debug("config is missing from sql, creating a new one")
		if config, err = n.initConfig(); err != nil {
			return nil, errors.Wrap(err, "failed to initialize config")
		}
	}
	if err = config.Validate(); err != nil {
		return nil, errors.Wrap(err, "node config is invalid")
	}
	n.config = config

	n.networkDriver.SetReceiveEventHandler(n.Handle)

	return n, nil
}

// Start is the node's mainloop
func (n *Node) Start() error {
	ctx := context.Background()
	for {
		select {
		case event := <-n.outgoingEvents:
			switch {
			case event.ReceiverID != "": // ContactEvent
				if err := n.networkDriver.SendEvent(ctx, event); err != nil {
					zap.L().Warn("failed to send outgoing event", zap.Error(err), zap.String("event", event.ToJSON()))
				}
			case event.ConversationID != "": //ConversationEvent
				members, err := sql.MembersByConversationID(n.sql, event.ConversationID)
				if err != nil {
					zap.L().Warn("failed to get members for conversation", zap.String("conversation_id", event.ConversationID))
					break
				}
				for _, member := range members {
					if member.ContactID == n.UserID() {
						// skip myself
						continue
					}
					copy := event.Copy()
					copy.ReceiverID = member.ContactID
					if err := n.networkDriver.SendEvent(ctx, copy); err != nil {
						zap.L().Warn("failed to send outgoing event", zap.Error(err), zap.String("event", event.ToJSON()))
					}
				}
			default:
				zap.L().Error("unhandled event type")
			}
		}
	}
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

func (n *Node) ClientEventsChan() chan *p2p.Event { return n.clientEvents }
