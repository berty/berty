package bertyprotocol

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"strings"
	"sync"

	ggio "github.com/gogo/protobuf/io"
	ipfscid "github.com/ipfs/go-cid"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/libp2p/go-libp2p-core/network"
	peer "github.com/libp2p/go-libp2p-core/peer"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/handshake"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
)

const contactRequestV1 = "/berty/contact_req/1.0.0"

type contactRequestsManager struct {
	muManager sync.Mutex

	rootCtx        context.Context
	announceCancel context.CancelFunc

	lookupProcess   map[string]context.CancelFunc
	muLookupProcess sync.Mutex

	logger *zap.Logger

	enabled bool

	ownRendezvousSeed []byte
	accSK             crypto.PrivKey

	ipfs          ipfsutil.ExtendedCoreAPI
	swiper        *Swiper
	metadataStore *MetadataStore
}

func initContactRequestsManager(ctx context.Context, s *Swiper, store *MetadataStore, ipfs ipfsutil.ExtendedCoreAPI, logger *zap.Logger) error {
	sk, err := store.devKS.AccountPrivKey()
	if err != nil {
		return err
	}

	cm := &contactRequestsManager{
		lookupProcess: make(map[string]context.CancelFunc),
		metadataStore: store,
		ipfs:          ipfs,
		logger:        logger.Named("req-mngr"),
		accSK:         sk,
		rootCtx:       ctx,
		swiper:        s,
	}

	go cm.metadataWatcher(ctx)

	return nil
}

func (c *contactRequestsManager) metadataWatcher(ctx context.Context) {
	handlers := map[protocoltypes.EventType]func(context.Context, *protocoltypes.GroupMetadataEvent) error{
		protocoltypes.EventTypeAccountContactRequestDisabled:         c.metadataRequestDisabled,
		protocoltypes.EventTypeAccountContactRequestEnabled:          c.metadataRequestEnabled,
		protocoltypes.EventTypeAccountContactRequestReferenceReset:   c.metadataRequestReset,
		protocoltypes.EventTypeAccountContactRequestOutgoingEnqueued: c.metadataRequestEnqueued,

		// @FIXME: looks like we don't need those events
		protocoltypes.EventTypeAccountContactRequestOutgoingSent:     c.metadataRequestSent,
		protocoltypes.EventTypeAccountContactRequestIncomingReceived: c.metadataRequestReceived,
	}

	// subscribe to new event
	sub, err := c.metadataStore.EventBus().Subscribe(new(protocoltypes.GroupMetadataEvent))
	if err != nil {
		c.logger.Warn("unable to subscribe to group metadata event", zap.Error(err))
		return
	}

	// recreate previous contact request state
	enabled, contact := c.metadataStore.GetIncomingContactRequestsStatus()
	if contact != nil {
		c.ownRendezvousSeed = contact.PublicRendezvousSeed
	}

	if enabled {
		if err := c.enableContactRequest(ctx); err != nil {
			c.logger.Warn("unable to enable contact request", zap.Error(err))
		}
	}

	// enqueue all contact with the `ToRequest` state
	for _, contact := range c.metadataStore.ListContactsByStatus(protocoltypes.ContactStateToRequest) {
		if err := c.enqueueRequest(ctx, contact); err != nil {
			c.logger.Warn("unable to enqueue contact request", logutil.PrivateBinary("pk", contact.PK), zap.Error(err))
		}
	}

	defer sub.Close()
	for {
		var evt interface{}
		select {
		case evt = <-sub.Out():
		case <-ctx.Done():
			return
		}

		// handle new events
		e := evt.(protocoltypes.GroupMetadataEvent)
		typ := e.GetMetadata().GetEventType()
		hctx, _, endSection := tyber.Section(ctx, c.logger, fmt.Sprintf("handling event - %s", typ.String()))

		c.muManager.Lock()

		var err error
		if handler, ok := handlers[typ]; ok {
			if err = handler(hctx, &e); err != nil {
				c.logger.Error("metadata store event handler", zap.String("event", typ.String()), zap.Error(err))
			}
		}

		c.muManager.Unlock()

		endSection(err, "")
	}
}

func (c *contactRequestsManager) metadataRequestDisabled(_ context.Context, _ *protocoltypes.GroupMetadataEvent) error {
	if !c.enabled {
		c.logger.Warn("contact request already disabled")
		return nil
	}

	c.enabled = false

	c.disableAnnounce()

	c.ipfs.RemoveStreamHandler(contactRequestV1)

	return nil
}

func (c *contactRequestsManager) metadataRequestEnabled(ctx context.Context, evt *protocoltypes.GroupMetadataEvent) error {
	e := &protocoltypes.AccountContactRequestEnabled{}
	if err := e.Unmarshal(evt.Event); err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	return c.enableContactRequest(ctx)
}

func (c *contactRequestsManager) enableContactRequest(ctx context.Context) error {
	if c.enabled {
		c.logger.Warn("contact request already enabled")
		return nil
	}

	pkBytes, err := c.accSK.GetPublic().Raw()
	if err != nil {
		return fmt.Errorf("unable to get raw pk: %w", err)
	}

	c.ipfs.SetStreamHandler(contactRequestV1, func(s network.Stream) {
		ctx, _, endSection := tyber.Section(c.rootCtx, c.logger, "receiving incoming contact request")

		if err := c.handleIncomingRequest(ctx, s); err != nil {
			c.logger.Error("unable to handle incoming contact request", zap.Error(err))
		}

		endSection(err, "")

		if err := s.Reset(); err != nil {
			c.logger.Error("unable to reset stream", zap.Error(err))
		}
	})

	c.enabled = true
	tyber.LogStep(ctx, c.logger, "enabled contact request")

	// announce on swiper if we already got seed
	if c.ownRendezvousSeed != nil {
		return c.enableAnnounce(ctx, c.ownRendezvousSeed, pkBytes)
	}

	c.logger.Warn("no seed registered, reset will be needed before announcing")
	return nil
}

func (c *contactRequestsManager) metadataRequestReset(ctx context.Context, evt *protocoltypes.GroupMetadataEvent) error {
	e := &protocoltypes.AccountContactRequestReferenceReset{}
	if err := e.Unmarshal(evt.Event); err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	accPK, err := c.accSK.GetPublic().Raw()
	if err != nil {
		return fmt.Errorf("unable to get raw pk: %w", err)
	}

	switch {
	case e.PublicRendezvousSeed == nil:
		return fmt.Errorf("unable to reset with an empty seed")
	case bytes.Equal(e.PublicRendezvousSeed, c.ownRendezvousSeed):
		return fmt.Errorf("unable to reset twice with the same seed")
	}

	// updating rendezvous seed
	tyber.LogStep(ctx, c.logger, "update rendezvous seed")
	c.ownRendezvousSeed = e.PublicRendezvousSeed

	// if contact request manager is disable don't run announce
	if !c.enabled {
		return nil
	}

	return c.enableAnnounce(ctx, c.ownRendezvousSeed, accPK)
}

func (c *contactRequestsManager) metadataRequestEnqueued(ctx context.Context, evt *protocoltypes.GroupMetadataEvent) error {
	ctx = tyber.ContextWithConstantTraceID(ctx, "msgrcvd-"+cidBytesString(evt.EventContext.ID))

	traceName := fmt.Sprintf("Received %s on group %s",
		strings.TrimPrefix(evt.Metadata.EventType.String(), "EventType"), base64.RawURLEncoding.EncodeToString(evt.EventContext.GroupPK))
	c.logger.Debug(traceName, tyber.FormatStepLogFields(ctx, []tyber.Detail{}, tyber.UpdateTraceName(traceName))...)

	e := &protocoltypes.AccountContactRequestEnqueued{}
	if err := e.Unmarshal(evt.Event); err != nil {
		return tyber.LogError(ctx, c.logger, "Failed to unmarshal event", err)
	}

	// enqueue contact request
	if err := c.enqueueRequest(ctx, e.Contact); err != nil {
		return tyber.LogError(ctx, c.logger, "Failed to enqueue request", err)
	}

	return nil
}

func (c *contactRequestsManager) metadataRequestSent(_ context.Context, evt *protocoltypes.GroupMetadataEvent) error {
	e := &protocoltypes.AccountContactRequestSent{}
	if err := e.Unmarshal(evt.Event); err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	// another device may have successfully sent contact request, try to cancel
	// lookup if needed
	c.cancelContactLookup(e.ContactPK)
	return nil
}

func (c *contactRequestsManager) metadataRequestReceived(_ context.Context, evt *protocoltypes.GroupMetadataEvent) error {
	e := &protocoltypes.AccountContactRequestReceived{}
	if err := e.Unmarshal(evt.Event); err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	// another device may have successfully sent contact request, try to cancel
	// lookup if needed
	c.cancelContactLookup(e.ContactPK)
	return nil
}

func (c *contactRequestsManager) registerContactLookup(ctx context.Context, contactPK []byte) context.Context {
	c.muLookupProcess.Lock()

	key := hex.EncodeToString(contactPK)

	// make sure to only have one process for this pk running
	ctx, cancel := context.WithCancel(ctx)
	if cancelProvious, ok := c.lookupProcess[key]; ok {
		cancelProvious() // cancel previous lookup if needed
	}
	c.lookupProcess[key] = cancel

	c.muLookupProcess.Unlock()
	return ctx
}

func (c *contactRequestsManager) cancelContactLookup(contactPK []byte) {
	c.muLookupProcess.Lock()

	key := hex.EncodeToString(contactPK)

	// cancel current lookup if needed
	if cancel, ok := c.lookupProcess[key]; ok {
		cancel()
		delete(c.lookupProcess, key)
	}

	c.muLookupProcess.Unlock()
}

func (c *contactRequestsManager) enableAnnounce(ctx context.Context, seed, accPK []byte) error {
	if seed == nil {
		return fmt.Errorf("announcing with empty seed")
	}

	if c.announceCancel != nil { // is already enable
		tyber.LogStep(ctx, c.logger, "canceling previous announce")
		c.announceCancel()
	}

	ctx, c.announceCancel = context.WithCancel(ctx)
	c.enabled = true

	tyber.LogStep(ctx, c.logger, "announcing on swipper")
	// start announcing on swiper, this method should take care ton announce as
	// many time as needed
	c.swiper.Announce(ctx, accPK, seed)
	return nil
}

func (c *contactRequestsManager) disableAnnounce() {
	if c.announceCancel != nil {
		c.announceCancel()
		c.announceCancel = nil
	}
}

func (c *contactRequestsManager) enqueueRequest(ctx context.Context, to *protocoltypes.ShareableContact) (err error) {
	ctx, _, endSection := tyber.Section(ctx, c.logger, "Enqueue contact request: "+base64.RawURLEncoding.EncodeToString(to.PK))

	otherPK, err := crypto.UnmarshalEd25519PublicKey(to.PK)
	if err != nil {
		return err
	}

	if ok := c.metadataStore.checkContactStatus(otherPK, protocoltypes.ContactStateAdded); ok {
		err = fmt.Errorf("contact already added")
		endSection(err, "")
		// contact already added,
		return err
	}

	// register lookup process
	ctx = c.registerContactLookup(ctx, to.PK)

	// start watching topic on swiper, this method should take care of calling
	// `FindPeer` as many times as needed
	cpeers := c.swiper.WatchTopic(ctx, to.PK, to.PublicRendezvousSeed)
	go func() {
		var err error
		for peer := range cpeers {
			// get our sharable contact to send to other contact
			if err = c.SendContactRequest(ctx, to, otherPK, peer); err != nil {
				c.logger.Warn("unable to send contact request", zap.Error(err))
			} else {
				// succefully send contact request, leave the loop and cancel lookup
				break
			}
		}

		// cancel lookup process
		c.cancelContactLookup(to.PK)

		endSection(err, "")
	}()

	return nil
}

// SendContactRequest try to perform contact request with the given remote peer
func (c *contactRequestsManager) SendContactRequest(ctx context.Context, to *protocoltypes.ShareableContact, otherPK crypto.PubKey, peer peer.AddrInfo) (err error) {
	ctx, _, endSection := tyber.Section(ctx, c.logger, "sending contact request")
	defer func() {
		endSection(err, "")
	}()

	_, own := c.metadataStore.GetIncomingContactRequestsStatus()
	if own == nil {
		err = fmt.Errorf("unable to retrieve own contact information")
		return
	}

	// get own metadata for contact
	ownMetadata, err := c.metadataStore.GetRequestOwnMetadataForContact(to.PK)
	if err != nil {
		c.logger.Warn("unable to get own metadata for contact", zap.Error(err))
		ownMetadata = nil
	}
	own.Metadata = ownMetadata

	// make sure to have connection with the remote peer
	if err := c.ipfs.Swarm().Connect(ctx, peer); err != nil {
		return fmt.Errorf("unable to connect: %w", err)
	}

	// create a new stream with the remote peer
	stream, err := c.ipfs.NewStream(ctx, peer.ID, contactRequestV1)
	if err != nil {
		return fmt.Errorf("unable to open stream: %w", err)
	}

	defer func() {
		if err := stream.Close(); err != nil {
			c.logger.Warn("error while closing stream with other peer", zap.Error(err))
		}
	}()

	reader := ggio.NewDelimitedReader(stream, 2048)
	writer := ggio.NewDelimitedWriter(stream)

	c.logger.Debug("performing handshake")

	tyber.LogStep(ctx, c.logger, "performing handshake")
	if err := handshake.RequestUsingReaderWriter(ctx, c.logger, reader, writer, c.accSK, otherPK); err != nil {
		return fmt.Errorf("an error occurred during handshake: %w", err)
	}

	tyber.LogStep(ctx, c.logger, "sending own contact")
	// send own contact information
	if err := writer.WriteMsg(own); err != nil {
		return fmt.Errorf("an error occurred while sending own contact information: %w", err)
	}

	tyber.LogStep(ctx, c.logger, "mark contact request has sent")
	// mark this contact request has send
	if _, err := c.metadataStore.ContactRequestOutgoingSent(ctx, otherPK); err != nil {
		return fmt.Errorf("an error occurred while marking contact request as sent: %w", err)
	}

	return nil
}

func (c *contactRequestsManager) handleIncomingRequest(ctx context.Context, stream network.Stream) (err error) {
	reader := ggio.NewDelimitedReader(stream, 2048)
	writer := ggio.NewDelimitedWriter(stream)

	tyber.LogStep(ctx, c.logger, "responding to handshake")

	otherPK, err := handshake.ResponseUsingReaderWriter(ctx, c.logger, reader, writer, c.accSK)
	if err != nil {
		return fmt.Errorf("handshake failed: %w", err)
	}

	otherPKBytes, err := otherPK.Raw()
	if err != nil {
		return fmt.Errorf("failed to marshal contact public key: %w", err)
	}

	contact := &protocoltypes.ShareableContact{}

	tyber.LogStep(ctx, c.logger, "checking remote contact information")

	// read remote contact information
	if err := reader.ReadMsg(contact); err != nil {
		return fmt.Errorf("failed to retrieve contact information: %w", err)
	}

	// validate contact pk
	if !bytes.Equal(otherPKBytes, contact.PK) {
		return fmt.Errorf("contact information does not match handshake data")
	}

	// check contact information format
	if err := contact.CheckFormat(protocoltypes.ShareableContactOptionsAllowMissingRDVSeed); err != nil {
		return fmt.Errorf("invalid contact information format: %w", err)
	}

	tyber.LogStep(ctx, c.logger, "marking contact request has received")

	// mark contact request as received
	_, err = c.metadataStore.ContactRequestIncomingReceived(ctx, &protocoltypes.ShareableContact{
		PK:                   otherPKBytes,
		PublicRendezvousSeed: contact.PublicRendezvousSeed,
		Metadata:             contact.Metadata,
	})

	if err != nil {
		return fmt.Errorf("invalid contact information format: %w", err)
	}

	return nil
}

func cidBytesString(bytes []byte) string {
	cid, err := ipfscid.Cast(bytes)
	if err != nil {
		return "error"
	}
	return cid.String()
}
