package bertyprotocol

import (
	"bytes"
	"context"
	"fmt"
	"sync"
	"time"

	ggio "github.com/gogo/protobuf/io"
	"github.com/libp2p/go-libp2p-core/crypto"
	p2phelpers "github.com/libp2p/go-libp2p-core/helpers"
	"github.com/libp2p/go-libp2p-core/network"
	"github.com/libp2p/go-libp2p-core/peer"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/handshake"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

type pendingRequest struct {
	cancel      context.CancelFunc
	contact     *bertytypes.ShareableContact
	lock        sync.RWMutex
	ch          chan peer.AddrInfo
	swiper      *Swiper
	ownMetadata []byte
}

func (p *pendingRequest) update(ctx context.Context, contact *bertytypes.ShareableContact, ownMetadata []byte) {
	p.lock.RLock()
	currentContact := p.contact
	p.lock.RUnlock()

	if currentContact != nil && bytes.Equal(currentContact.PublicRendezvousSeed, contact.PublicRendezvousSeed) {
		return
	}

	p.lock.Lock()
	if p.cancel != nil {
		p.cancel()
	}

	p.contact = contact
	p.ownMetadata = ownMetadata
	ctx, p.cancel = context.WithCancel(ctx)

	p.lock.Unlock()

	p.swiper.logger.Info("enqueued request updated")

	for addr := range p.swiper.WatchTopic(ctx, contact.PK, contact.PublicRendezvousSeed) {
		p.swiper.logger.Info("get peer on topic")
		p.lock.Lock()

		p.swiper.logger.Info("sending them")
		if ctx.Err() == nil {
			p.swiper.logger.Info("sending them ok")

			select {
			case p.ch <- addr:
			case <-time.After(time.Second):
				fmt.Println("timed out")
			}
		}
		p.lock.Unlock()
	}
}

func (p *pendingRequest) Close() error {
	p.lock.Lock()
	close(p.ch)
	if p.cancel != nil {
		p.cancel()
	}

	p.lock.Unlock()

	return nil
}

func newPendingRequest(ctx context.Context, swiper *Swiper, contact *bertytypes.ShareableContact, ownMetadata []byte) (*pendingRequest, chan peer.AddrInfo) {
	ch := make(chan peer.AddrInfo)
	p := &pendingRequest{
		ch:          ch,
		swiper:      swiper,
		ownMetadata: ownMetadata,
	}

	go p.update(ctx, contact, ownMetadata)

	return p, ch
}

type contactRequestsManager struct {
	enabled        bool
	seed           []byte
	announceCancel context.CancelFunc
	metadataStore  *metadataStore
	lock           sync.Mutex
	ipfs           ipfsutil.ExtendedCoreAPI
	accSK          crypto.PrivKey
	ctx            context.Context
	logger         *zap.Logger
	swiper         *Swiper
	toAdd          map[string]*pendingRequest
}

func (c *contactRequestsManager) metadataRequestDisabled(_ *bertytypes.GroupMetadataEvent) error {
	c.enabled = false
	if c.announceCancel != nil {
		c.announceCancel()
		c.ipfs.RemoveStreamHandler(contactRequestV1)
	}

	c.announceCancel = nil

	return nil
}

func (c *contactRequestsManager) metadataRequestEnabled(_ *bertytypes.GroupMetadataEvent) error {
	c.ipfs.SetStreamHandler(contactRequestV1, c.incomingHandler)

	c.enabled = true
	if c.announceCancel != nil {
		return nil
	}

	return c.enableIncomingRequests()
}

func (c *contactRequestsManager) metadataRequestReset(evt *bertytypes.GroupMetadataEvent) error {
	e := &bertytypes.AccountContactRequestReferenceReset{}
	if err := e.Unmarshal(evt.Event); err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	c.seed = e.PublicRendezvousSeed

	if !c.enabled {
		return nil
	}

	return c.enableIncomingRequests()
}

func (c *contactRequestsManager) metadataRequestEnqueued(evt *bertytypes.GroupMetadataEvent) error {
	e := &bertytypes.AccountContactRequestEnqueued{}
	if err := e.Unmarshal(evt.Event); err != nil {
		return err
	}

	return c.enqueueRequest(&bertytypes.ShareableContact{
		PK:                   e.Contact.PK,
		PublicRendezvousSeed: e.Contact.PublicRendezvousSeed,
	}, e.OwnMetadata)
}

func (c *contactRequestsManager) metadataRequestSent(evt *bertytypes.GroupMetadataEvent) error {
	e := &bertytypes.AccountContactRequestSent{}
	if err := e.Unmarshal(evt.Event); err != nil {
		return err
	}

	if request, ok := c.toAdd[string(e.ContactPK)]; ok {
		if err := request.Close(); err != nil {
			c.logger.Warn("error while closing request", zap.Error(err))
		}

		delete(c.toAdd, string(e.ContactPK))
	}

	return nil
}

func (c *contactRequestsManager) metadataRequestReceived(evt *bertytypes.GroupMetadataEvent) error {
	e := &bertytypes.AccountContactRequestReceived{}
	if err := e.Unmarshal(evt.Event); err != nil {
		return err
	}

	if request, ok := c.toAdd[string(e.ContactPK)]; ok {
		if err := request.Close(); err != nil {
			c.logger.Warn("error while closing request", zap.Error(err))
		}

		delete(c.toAdd, string(e.ContactPK))
	}

	return nil
}

func (c *contactRequestsManager) enqueueRequest(contact *bertytypes.ShareableContact, ownMetadata []byte) error {
	pk, err := crypto.UnmarshalEd25519PublicKey(contact.PK)
	if err != nil {
		return err
	}

	if pending, ok := c.toAdd[string(contact.PK)]; ok {
		go pending.update(c.ctx, contact, ownMetadata)
	} else {
		toAdd, ch := newPendingRequest(c.ctx, c.swiper, contact, ownMetadata)
		c.toAdd[string(contact.PK)] = toAdd

		for addr := range ch {
			go func(pk crypto.PubKey, addr peer.AddrInfo) {
				if err := c.ipfs.Swarm().Connect(c.ctx, addr); err != nil {
					c.logger.Error("error while connecting with other peer", zap.Error(err))
					return
				}

				stream, err := c.ipfs.NewStream(context.TODO(), addr.ID, contactRequestV1)
				if err != nil {
					c.logger.Error("error while opening stream with other peer", zap.Error(err))
					return
				}

				if err := c.performSend(pk, stream); err != nil {
					c.logger.Error("unable to perform send", zap.Error(err))
				}
			}(pk, addr)
		}
	}

	return nil
}

func (c *contactRequestsManager) metadataWatcher(ctx context.Context) {
	handlers := map[bertytypes.EventType]func(*bertytypes.GroupMetadataEvent) error{
		bertytypes.EventTypeAccountContactRequestDisabled:         c.metadataRequestDisabled,
		bertytypes.EventTypeAccountContactRequestEnabled:          c.metadataRequestEnabled,
		bertytypes.EventTypeAccountContactRequestReferenceReset:   c.metadataRequestReset,
		bertytypes.EventTypeAccountContactRequestOutgoingEnqueued: c.metadataRequestEnqueued,
		bertytypes.EventTypeAccountContactRequestOutgoingSent:     c.metadataRequestSent,
		bertytypes.EventTypeAccountContactRequestIncomingReceived: c.metadataRequestReceived,
	}

	c.lock.Lock()
	enabled, contact := c.metadataStore.GetIncomingContactRequestsStatus()
	c.enabled = enabled

	if contact != nil {
		c.seed = contact.PublicRendezvousSeed
	}

	if c.enabled && len(c.seed) > 0 {
		if err := c.metadataRequestEnabled(&bertytypes.GroupMetadataEvent{}); err != nil {
			c.logger.Warn("unable to enable metadata request", zap.Error(err))
		}
	}

	for _, contact := range c.metadataStore.ListContactsByStatus(bertytypes.ContactStateToRequest) {
		ownMeta, err := c.metadataStore.GetRequestOwnMetadataForContact(contact.PK)
		if err != nil {
			c.logger.Warn("error while retrieving own metadata for contact", zap.Binary("pk", contact.PK), zap.Error(err))
		}

		if err := c.enqueueRequest(contact, ownMeta); err != nil {
			c.logger.Error("unable to enqueue contact request", zap.Error(err))
		}
	}
	c.lock.Unlock()

	go func() {
		for evt := range c.metadataStore.Subscribe(ctx) {
			e, ok := evt.(*bertytypes.GroupMetadataEvent)
			if !ok {
				continue
			}

			if _, ok := handlers[e.Metadata.EventType]; !ok {
				continue
			}

			c.logger.Debug("METADATA WATCHER", zap.String("event", e.Metadata.EventType.String()))
			c.lock.Lock()
			if err := handlers[e.Metadata.EventType](e); err != nil {
				c.lock.Unlock()
				c.logger.Error("error while handling metadata store event", zap.Error(err))
				continue
			}

			c.lock.Unlock()
		}
	}()
}

const contactRequestV1 = "/berty/contact_req/1.0.0"

func (c *contactRequestsManager) incomingHandler(stream network.Stream) {
	defer func() {
		if err := p2phelpers.FullClose(stream); err != nil {
			c.logger.Warn("error while closing stream with other peer", zap.Error(err))
		}
	}()

	reader := ggio.NewDelimitedReader(stream, 2048)
	writer := ggio.NewDelimitedWriter(stream)

	otherPK, err := handshake.ResponseUsingReaderWriter(reader, writer, c.accSK)
	if err != nil {
		c.logger.Error("an error occurred during handshake", zap.Error(err))
		return
	}

	otherPKBytes, err := otherPK.Raw()
	if err != nil {
		c.logger.Error("an error occurred during serialization", zap.Error(err))
		return
	}

	contact := &bertytypes.ShareableContact{}

	if err := reader.ReadMsg(contact); err != nil {
		c.logger.Error("an error occurred while retrieving contact information", zap.Error(err))
		return
	}

	if err := contact.CheckFormat(bertytypes.ShareableContactOptionsAllowMissingRDVSeed); err != nil {
		c.logger.Error("an error occurred while verifying contact information", zap.Error(err))
		return
	}

	if !bytes.Equal(otherPKBytes, contact.PK) {
		c.logger.Error("received contact information does not match handshake data")
		return
	}

	if _, err = c.metadataStore.ContactRequestIncomingReceived(c.ctx, &bertytypes.ShareableContact{
		PK:                   otherPKBytes,
		PublicRendezvousSeed: contact.PublicRendezvousSeed,
		Metadata:             contact.Metadata,
	}); err != nil {
		c.logger.Error("an error occurred while adding contact request to received", zap.Error(err))
		return
	}
}

func (c *contactRequestsManager) performSend(otherPK crypto.PubKey, stream network.Stream) error {
	defer func() {
		if err := p2phelpers.FullClose(stream); err != nil {
			c.logger.Warn("error while closing stream with other peer", zap.Error(err))
		}
	}()

	_, contact := c.metadataStore.GetIncomingContactRequestsStatus()
	if contact == nil {
		return fmt.Errorf("unable to retrieve own contact information")
	}

	pkB, err := otherPK.Raw()
	if err != nil {
		return fmt.Errorf("unable to get raw pk: %w", err)
	}

	ownMetadata, err := c.metadataStore.GetRequestOwnMetadataForContact(pkB)
	if err != nil {
		c.logger.Warn("unable to get own metadata for contact", zap.Error(err))
		ownMetadata = nil
	}

	contact.Metadata = ownMetadata

	reader := ggio.NewDelimitedReader(stream, 2048)
	writer := ggio.NewDelimitedWriter(stream)

	if err := handshake.RequestUsingReaderWriter(reader, writer, c.accSK, otherPK); err != nil {
		return fmt.Errorf("an error occurred during handshake: %w", err)
	}

	if err := writer.WriteMsg(contact); err != nil {
		return fmt.Errorf("an error occurred while sending own contact information: %w", err)
	}

	if _, err := c.metadataStore.ContactRequestOutgoingSent(c.ctx, otherPK); err != nil {
		return fmt.Errorf("an error occurred while marking contact request as sent: %w", err)
	}

	return nil
}

func (c *contactRequestsManager) enableIncomingRequests() error {
	c.logger.Debug("enableIncomingRequests start")

	if c.announceCancel != nil {
		c.announceCancel()
	}

	c.logger.Debug("enableIncomingRequests get public")
	pkBytes, err := c.accSK.GetPublic().Raw()
	if err != nil {
		return err
	}

	var ctx context.Context

	ctx, c.announceCancel = context.WithCancel(c.ctx)

	c.logger.Debug("enableIncomingRequests run announce")
	c.swiper.Announce(ctx, pkBytes, c.seed)

	c.logger.Debug("enableIncomingRequests end")
	return nil
}

func initContactRequestsManager(ctx context.Context, s *Swiper, store *metadataStore, ipfs ipfsutil.ExtendedCoreAPI, logger *zap.Logger) error {
	sk, err := store.devKS.AccountPrivKey()
	if err != nil {
		return err
	}

	cm := &contactRequestsManager{
		metadataStore: store,
		ipfs:          ipfs,
		logger:        logger,
		accSK:         sk,
		ctx:           ctx,
		swiper:        s,
		toAdd:         map[string]*pendingRequest{},
	}

	go cm.metadataWatcher(ctx)

	return nil
}
