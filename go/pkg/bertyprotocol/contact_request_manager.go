package bertyprotocol

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"strings"
	"sync"

	ggio "github.com/gogo/protobuf/io"
	ipfscid "github.com/ipfs/go-cid"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/libp2p/go-libp2p-core/network"
	"github.com/libp2p/go-libp2p-core/peer"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"moul.io/u"

	"berty.tech/berty/v2/go/internal/handshake"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
)

type pendingRequestDetails struct {
	contact     *protocoltypes.ShareableContact
	ownMetadata []byte
}

type pendingRequest struct {
	updateCh   chan *pendingRequestDetails
	cancelFunc context.CancelFunc
}

type contactRequestsManager struct {
	enabled        bool
	seed           []byte
	announceCancel context.CancelFunc
	metadataStore  *MetadataStore
	lock           sync.Mutex
	ipfs           ipfsutil.ExtendedCoreAPI
	accSK          crypto.PrivKey
	ctx            context.Context
	logger         *zap.Logger
	swiper         *Swiper
	toAdd          map[string]*pendingRequest
}

func (c *contactRequestsManager) metadataRequestDisabled(_ *protocoltypes.GroupMetadataEvent) error {
	c.enabled = false
	if c.announceCancel != nil {
		c.announceCancel()
		c.ipfs.RemoveStreamHandler(contactRequestV1)
	}

	c.announceCancel = nil

	return nil
}

func (c *contactRequestsManager) metadataRequestEnabled(_ *protocoltypes.GroupMetadataEvent) error {
	c.ipfs.SetStreamHandler(contactRequestV1, func(s network.Stream) { _ = c.incomingHandler(s) })

	c.enabled = true
	if c.announceCancel != nil {
		return nil
	}

	return c.enableIncomingRequests()
}

func (c *contactRequestsManager) metadataRequestReset(evt *protocoltypes.GroupMetadataEvent) error {
	e := &protocoltypes.AccountContactRequestReferenceReset{}
	if err := e.Unmarshal(evt.Event); err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	c.seed = e.PublicRendezvousSeed

	if !c.enabled {
		return nil
	}

	return c.enableIncomingRequests()
}

func cidBytesString(bytes []byte) string {
	cid, err := ipfscid.Cast(bytes)
	if err != nil {
		return "error"
	}
	return cid.String()
}

func (c *contactRequestsManager) metadataRequestEnqueued(evt *protocoltypes.GroupMetadataEvent) error {
	ctx := tyber.ContextWithConstantTraceID(c.ctx, "msgrcvd-"+cidBytesString(evt.EventContext.ID))
	traceName := fmt.Sprintf("Received %s on group %s", strings.TrimPrefix(evt.Metadata.EventType.String(), "EventType"), base64.RawURLEncoding.EncodeToString(evt.EventContext.GroupPK))
	c.logger.Debug(traceName, tyber.FormatStepLogFields(ctx, []tyber.Detail{}, tyber.UpdateTraceName(traceName))...)

	e := &protocoltypes.AccountContactRequestEnqueued{}
	if err := e.Unmarshal(evt.Event); err != nil {
		return tyber.LogError(ctx, c.logger, "Failed to unmarshal event", err)
	}

	if err := c.enqueueRequest(context.TODO(), &protocoltypes.ShareableContact{
		PK:                   e.Contact.PK,
		PublicRendezvousSeed: e.Contact.PublicRendezvousSeed,
	}, e.OwnMetadata); err != nil {
		return tyber.LogError(ctx, c.logger, "Failed to enqueue request", err)
	}

	return nil
}

func (c *contactRequestsManager) metadataRequestSent(evt *protocoltypes.GroupMetadataEvent) error {
	e := &protocoltypes.AccountContactRequestSent{}
	if err := e.Unmarshal(evt.Event); err != nil {
		return err
	}

	if request, ok := c.toAdd[string(e.ContactPK)]; ok {
		request.cancelFunc()
		delete(c.toAdd, string(e.ContactPK))
	}

	return nil
}

func (c *contactRequestsManager) metadataRequestReceived(evt *protocoltypes.GroupMetadataEvent) error {
	e := &protocoltypes.AccountContactRequestReceived{}
	if err := e.Unmarshal(evt.Event); err != nil {
		return err
	}

	if request, ok := c.toAdd[string(e.ContactPK)]; ok {
		request.cancelFunc()
		delete(c.toAdd, string(e.ContactPK))
	}

	return nil
}

func (c *contactRequestsManager) enqueueRequest(tctx context.Context, contact *protocoltypes.ShareableContact, ownMetadata []byte) error {
	tctx, _, endSection := tyber.Section(tctx, c.logger, "Requesting contact "+base64.RawURLEncoding.EncodeToString(contact.PK))

	pk, err := crypto.UnmarshalEd25519PublicKey(contact.PK)
	if err != nil {
		endSection(err, "Failed to unmarshal contact public key")
		return err
	}

	// contact already queued
	if pending, ok := c.toAdd[string(contact.PK)]; ok {
		pending.updateCh <- &pendingRequestDetails{
			contact:     contact,
			ownMetadata: ownMetadata,
		}

		endSection(nil, "Contact already queued")
		return nil
	}

	swiperCh := make(chan peer.AddrInfo)
	reqCtx, reqCancel := context.WithCancel(c.ctx)
	parent := u.NewUniqueChild(context.Background())
	var wg sync.WaitGroup
	pending := &pendingRequest{
		updateCh:   make(chan *pendingRequestDetails),
		cancelFunc: reqCancel,
	}

	go func() {
		for {
			select {
			case details := <-pending.updateCh:
				wg.Add(1)
				parent.SetChild(func(ctx context.Context) {
					c.swiper.WatchTopic(
						ctx,
						details.contact.PK,
						details.contact.PublicRendezvousSeed,
						swiperCh,
						wg.Done,
					)
				})
			case <-reqCtx.Done():
				parent.CloseChild()
				// drain channel
				go func() {
					for range swiperCh {
					}
				}()

				wg.Wait()
				close(swiperCh)
				return
			}
		}
	}()
	pending.updateCh <- &pendingRequestDetails{
		contact:     contact,
		ownMetadata: ownMetadata,
	}
	c.toAdd[string(contact.PK)] = pending

	// process addresses from swiper
	go func() {
		for addr := range swiperCh {
			if err := c.ipfs.Swarm().Connect(c.ctx, addr); err != nil {
				endSection(err, "Failed to connect to peer")
				return
			}

			stream, err := c.ipfs.NewStream(context.TODO(), addr.ID, contactRequestV1)
			if err != nil {
				endSection(err, "Failed to open stream with peer")
				return
			}

			if err := c.performSend(tctx, pk, stream); err != nil {
				endSection(err, "Contact request send failed")
				return
			}

			endSection(nil, "Contact request success")
		}
	}()

	return nil
}

func (c *contactRequestsManager) metadataWatcher(ctx context.Context) {
	handlers := map[protocoltypes.EventType]func(*protocoltypes.GroupMetadataEvent) error{
		protocoltypes.EventTypeAccountContactRequestDisabled:         c.metadataRequestDisabled,
		protocoltypes.EventTypeAccountContactRequestEnabled:          c.metadataRequestEnabled,
		protocoltypes.EventTypeAccountContactRequestReferenceReset:   c.metadataRequestReset,
		protocoltypes.EventTypeAccountContactRequestOutgoingEnqueued: c.metadataRequestEnqueued,
		protocoltypes.EventTypeAccountContactRequestOutgoingSent:     c.metadataRequestSent,
		protocoltypes.EventTypeAccountContactRequestIncomingReceived: c.metadataRequestReceived,
	}

	c.lock.Lock()
	enabled, contact := c.metadataStore.GetIncomingContactRequestsStatus()
	c.enabled = enabled

	if contact != nil {
		c.seed = contact.PublicRendezvousSeed
	}

	if c.enabled && len(c.seed) > 0 {
		if err := c.metadataRequestEnabled(&protocoltypes.GroupMetadataEvent{}); err != nil {
			c.logger.Warn("unable to enable metadata request", zap.Error(err))
		}
	}

	for _, contact := range c.metadataStore.ListContactsByStatus(protocoltypes.ContactStateToRequest) {
		ownMeta, err := c.metadataStore.GetRequestOwnMetadataForContact(contact.PK)
		if err != nil {
			c.logger.Warn("error while retrieving own metadata for contact", logutil.PrivateBinary("pk", contact.PK), zap.Error(err))
		}

		if err := c.enqueueRequest(context.TODO(), contact, ownMeta); err != nil {
			c.logger.Error("unable to enqueue contact request", zap.Error(err))
		}
	}
	c.lock.Unlock()

	chSub, err := c.metadataStore.EventBus().Subscribe(new(protocoltypes.GroupMetadataEvent))
	if err != nil {
		c.logger.Warn("unable to subscribe to group metadata event", zap.Error(err))
		return
	}

	go func() {
		defer chSub.Close()
		for {
			var evt interface{}
			select {
			case evt = <-chSub.Out():
			case <-ctx.Done():
				return
			}

			// @FIXME(gfanton): we should run this in a gorouting to potentially
			// avoid to stuck the channel
			e := evt.(protocoltypes.GroupMetadataEvent)
			c.lock.Lock()
			if handler, ok := handlers[e.Metadata.EventType]; ok {
				if err := handler(&e); err != nil {
					c.logger.Error("error while handling metadata store event", zap.Error(err))
				}
			}
			c.lock.Unlock()
		}
	}()
}

const contactRequestV1 = "/berty/contact_req/1.0.0"

func (c *contactRequestsManager) incomingHandler(stream network.Stream) (err error) {
	ctx, _, endSection := tyber.Section(c.ctx, c.logger, "Responding to contact request")
	defer func() { endSection(err, "", tyber.ForceReopen) }()

	defer func() {
		if closeErr := stream.Reset(); closeErr != nil {
			endSection(closeErr, "Failed to close stream with other peer", tyber.ForceReopen)
		}
	}()

	reader := ggio.NewDelimitedReader(stream, 2048)
	writer := ggio.NewDelimitedWriter(stream)

	otherPK, err := handshake.ResponseUsingReaderWriter(ctx, c.logger, reader, writer, c.accSK)
	if err != nil {
		return errors.Wrap(err, "handshake failed")
	}

	otherPKBytes, err := otherPK.Raw()
	if err != nil {
		return errors.Wrap(err, "failed to marshal contact public key")
	}

	contact := &protocoltypes.ShareableContact{}

	if err := reader.ReadMsg(contact); err != nil {
		return errors.Wrap(err, "failed to retrieve contact information")
	}

	if err := contact.CheckFormat(protocoltypes.ShareableContactOptionsAllowMissingRDVSeed); err != nil {
		return errors.Wrap(err, "invalid contact information format")
	}

	if !bytes.Equal(otherPKBytes, contact.PK) {
		return errors.Wrap(err, "contact information does not match handshake data")
	}

	if _, err = c.metadataStore.ContactRequestIncomingReceived(ctx, &protocoltypes.ShareableContact{
		PK:                   otherPKBytes,
		PublicRendezvousSeed: contact.PublicRendezvousSeed,
		Metadata:             contact.Metadata,
	}); err != nil {
		return errors.Wrap(err, "failed to add ContactRequestIncomingReceived event to metadata store")
	}

	return nil
}

func (c *contactRequestsManager) performSend(ctx context.Context, otherPK crypto.PubKey, stream network.Stream) error {
	defer func() {
		if err := stream.Close(); err != nil {
			c.logger.Warn("error while closing stream with other peer", zap.Error(err))
		}
	}()

	c.lock.Lock()
	ok := c.metadataStore.checkContactStatus(otherPK, protocoltypes.ContactStateAdded)
	c.lock.Unlock()

	if ok {
		// Nothing to do, contact has already been requested
		return nil
	}

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

	if err := handshake.RequestUsingReaderWriter(ctx, c.logger, reader, writer, c.accSK, otherPK); err != nil {
		return fmt.Errorf("an error occurred during handshake: %w", err)
	}

	if err := writer.WriteMsg(contact); err != nil {
		return fmt.Errorf("an error occurred while sending own contact information: %w", err)
	}

	if _, err := c.metadataStore.ContactRequestOutgoingSent(ctx, otherPK); err != nil {
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

func initContactRequestsManager(ctx context.Context, s *Swiper, store *MetadataStore, ipfs ipfsutil.ExtendedCoreAPI, logger *zap.Logger) error {
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
