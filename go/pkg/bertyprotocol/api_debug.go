package bertyprotocol

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/gogo/protobuf/proto"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/libp2p/go-libp2p-core/network"
	peer "github.com/libp2p/go-libp2p-core/peer"
	"go.uber.org/multierr"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/sysutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-orbit-db/stores/operation"
)

func (s *service) DebugListGroups(req *bertytypes.DebugListGroups_Request, srv ProtocolService_DebugListGroupsServer) error {
	if err := srv.SendMsg(&bertytypes.DebugListGroups_Reply{
		GroupPK:   s.accountGroup.group.PublicKey,
		GroupType: s.accountGroup.group.GroupType,
	}); err != nil {
		return err
	}

	for _, c := range s.accountGroup.MetadataStore().ListContactsByStatus(bertytypes.ContactStateAdded) {
		pk, err := crypto.UnmarshalEd25519PublicKey(c.PK)
		if err != nil {
			return errcode.ErrDeserialization.Wrap(err)
		}

		sk, err := s.deviceKeystore.ContactGroupPrivKey(pk)
		if err != nil {
			return errcode.ErrCryptoKeyGeneration.Wrap(err)
		}

		g, err := getGroupForContact(sk)
		if err != nil {
			return errcode.ErrOrbitDBOpen.Wrap(err)
		}

		if err := srv.SendMsg(&bertytypes.DebugListGroups_Reply{
			GroupPK:   g.PublicKey,
			GroupType: g.GroupType,
			ContactPK: c.PK,
		}); err != nil {
			return err
		}
	}

	for _, g := range s.accountGroup.MetadataStore().ListMultiMemberGroups() {
		if err := srv.SendMsg(&bertytypes.DebugListGroups_Reply{
			GroupPK:   g.PublicKey,
			GroupType: g.GroupType,
		}); err != nil {
			return err
		}
	}

	return nil
}

func (s *service) DebugInspectGroupStore(req *bertytypes.DebugInspectGroupStore_Request, srv ProtocolService_DebugInspectGroupStoreServer) error {
	if req.LogType == bertytypes.DebugInspectGroupLogTypeUndefined {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("invalid log type specified"))
	}

	cg, err := s.getContextGroupForID(req.GroupPK)
	if err != nil {
		return errcode.ErrInvalidInput.Wrap(err)
	}

	switch req.LogType {
	case bertytypes.DebugInspectGroupLogTypeMessage:
		for _, e := range cg.messageStore.OpLog().GetEntries().Slice() {
			var (
				payload  = []byte(nil)
				devicePK = []byte(nil)
				nexts    = make([][]byte, len(e.GetNext()))
			)

			if evt, err := cg.messageStore.openMessage(srv.Context(), e, false); err != nil {
				s.logger.Error("unable to open message", zap.Error(err))
			} else {
				devicePK = evt.Headers.DevicePK
				payload = evt.Message
			}

			for i, n := range e.GetNext() {
				nexts[i] = n.Bytes()
			}

			if err := srv.SendMsg(&bertytypes.DebugInspectGroupStore_Reply{
				CID:        e.GetHash().Bytes(),
				ParentCIDs: nexts,
				DevicePK:   devicePK,
				Payload:    payload,
			}); err != nil {
				return err
			}
		}

	case bertytypes.DebugInspectGroupLogTypeMetadata:
		log := cg.metadataStore.OpLog()

		for _, e := range log.GetEntries().Slice() {
			var (
				eventType bertytypes.EventType
				payload   = []byte(nil)
				devicePK  = []byte(nil)
				nexts     = make([][]byte, len(e.GetNext()))
			)

			if op, err := operation.ParseOperation(e); err != nil {
				s.logger.Error("unable to parse operation", zap.Error(err))
			} else if meta, event, err := openGroupEnvelope(cg.group, op.GetValue()); err != nil {
				s.logger.Error("unable to open group envelope", zap.Error(err))
			} else if metaEvent, err := newGroupMetadataEventFromEntry(log, e, meta, event, cg.group); err != nil {
				s.logger.Error("unable to get group metadata event from entry", zap.Error(err))
			} else {
				payload = metaEvent.Event
				eventType = metaEvent.Metadata.EventType

				if typeData, ok := eventTypesMapper[metaEvent.Metadata.EventType]; ok {
					p := proto.Clone(typeData.Message)
					if err := proto.Unmarshal(metaEvent.Event, p); err == nil {
						if msg, ok := p.(eventDeviceSigned); ok {
							devicePK = msg.GetDevicePK()
						}
					}
				} else {
					s.logger.Error("unable to get message struct for event type", zap.String("event_type", metaEvent.Metadata.EventType.String()))
				}
			}

			for i, n := range e.GetNext() {
				nexts[i] = n.Bytes()
			}

			if err := srv.SendMsg(&bertytypes.DebugInspectGroupStore_Reply{
				CID:               e.GetHash().Bytes(),
				ParentCIDs:        nexts,
				Payload:           payload,
				MetadataEventType: eventType,
				DevicePK:          devicePK,
			}); err != nil {
				return err
			}
		}
	}

	return nil
}

func (s *service) DebugGroup(ctx context.Context, request *bertytypes.DebugGroup_Request) (*bertytypes.DebugGroup_Reply, error) {
	rep := &bertytypes.DebugGroup_Reply{}

	peers, err := s.ipfsCoreAPI.Swarm().Peers(ctx)
	if err != nil {
		return nil, err
	}

	topic := fmt.Sprintf("grp_%s", string(request.GroupPK))

	for _, p := range peers {
		tagInfo := s.ipfsCoreAPI.ConnMgr().GetTagInfo(p.ID())
		if _, ok := tagInfo.Tags[topic]; ok {
			rep.PeerIDs = append(rep.PeerIDs, p.ID().String())
		}
	}

	return rep, nil
}

func (s *service) SystemInfo(ctx context.Context, request *bertytypes.SystemInfo_Request) (*bertytypes.SystemInfo_Reply, error) {
	reply := bertytypes.SystemInfo_Reply{}

	// process
	process, errs := sysutil.SystemInfoProcess()
	reply.Process = process
	reply.Process.StartedAt = s.startedAt.Unix()
	reply.Process.UptimeMS = time.Since(s.startedAt).Milliseconds()

	// gRPC
	// TODO

	// p2p
	{
		reply.P2P = &bertytypes.SystemInfo_P2P{}

		// swarm metrics
		if api := s.IpfsCoreAPI(); api != nil {
			peers, err := api.Swarm().Peers(ctx)
			reply.P2P.ConnectedPeers = int64(len(peers))
			errs = multierr.Append(errs, err)
		} else {
			errs = multierr.Append(errs, fmt.Errorf("no such IPFS core API"))
		}

		// pubsub metrics
		// TODO

		// BLE metrics
	}

	// OrbitDB
	status := s.accountGroup.metadataStore.ReplicationStatus()
	reply.OrbitDB = &bertytypes.SystemInfo_OrbitDB{
		AccountMetadata: &bertytypes.SystemInfo_OrbitDB_ReplicationStatus{
			Progress: int64(status.GetProgress()),
			Maximum:  int64(status.GetMax()),
			Buffered: int64(status.GetBuffered()),
			Queued:   int64(status.GetQueued()),
		},
	}
	// FIXME: compute more stores

	// warns
	if errs != nil {
		reply.Warns = []string{}
		for _, err := range multierr.Errors(errs) {
			reply.Warns = append(reply.Warns, err.Error())
		}
	}

	return &reply, nil
}

func (s *service) PeerList(ctx context.Context, request *bertytypes.PeerList_Request) (*bertytypes.PeerList_Reply, error) {
	reply := bertytypes.PeerList_Reply{}
	api := s.IpfsCoreAPI()
	if api == nil {
		return nil, errcode.TODO.Wrap(fmt.Errorf("IPFS Core API is not available"))
	}
	swarmPeers, err := api.Swarm().Peers(ctx) // https://pkg.go.dev/github.com/ipfs/interface-go-ipfs-core#ConnectionInfo
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	peers := map[peer.ID]*bertytypes.PeerList_Peer{}

	// each peer in the swarm should be visible
	for _, swarmPeer := range swarmPeers {
		peers[swarmPeer.ID()] = &bertytypes.PeerList_Peer{
			ID:     swarmPeer.ID().Pretty(),
			Errors: []string{},
			Routes: []*bertytypes.PeerList_Route{},
		}
	}
	// FIXME: do not restrict on swarm peers, also print some other important ones (old, etc)

	// append peer addrs from peerstore
	for peerID, peer := range peers {
		info := s.host.Peerstore().PeerInfo(peerID)
		for _, addr := range info.Addrs {
			peer.Routes = append(peer.Routes, &bertytypes.PeerList_Route{
				Address: addr.String(),
			})
		}
	}

	// append more info for active connections
	for _, swarmPeer := range swarmPeers {
		peer, ok := peers[swarmPeer.ID()]
		if !ok {
			peer = &bertytypes.PeerList_Peer{
				ID:     swarmPeer.ID().Pretty(),
				Errors: []string{},
				Routes: []*bertytypes.PeerList_Route{},
			}
			peer.Errors = append(peer.Errors, "peer in swarm peers, but not in peerstore")
			peers[swarmPeer.ID()] = peer
		}

		address := swarmPeer.Address().String()
		found := false
		var selectedRoute *bertytypes.PeerList_Route
		for _, route := range peer.Routes {
			if route.Address == address {
				found = true
				selectedRoute = route
			}
		}
		if !found {
			newRoute := bertytypes.PeerList_Route{Address: address}
			peer.Routes = append(peer.Routes, &newRoute)
			selectedRoute = &newRoute
		}
		selectedRoute.IsActive = true
		// latency
		{
			latency, err := swarmPeer.Latency()
			if err != nil {
				peer.Errors = append(peer.Errors, err.Error())
			} else {
				selectedRoute.Latency = latency.Milliseconds()
			}
		}
		// direction
		{
			switch swarmPeer.Direction() {
			case network.DirInbound:
				selectedRoute.Direction = bertytypes.InboundDir
			case network.DirOutbound:
				selectedRoute.Direction = bertytypes.OutboundDir
			}
		}
		// streams
		{
			peerStreams, err := swarmPeer.Streams()
			if err != nil {
				peer.Errors = append(peer.Errors, err.Error())
			} else {
				selectedRoute.Streams = []*bertytypes.PeerList_Stream{}
				for _, peerStream := range peerStreams {
					if peerStream == "" {
						continue
					}
					selectedRoute.Streams = append(selectedRoute.Streams, &bertytypes.PeerList_Stream{
						ID: string(peerStream),
					})
				}
			}
		}
	}

	// compute features
	for _, peer := range peers {
		features := map[bertytypes.PeerList_Feature]bool{}
		for _, route := range peer.Routes {
			// FIXME: use the multiaddr library instead of string comparisons
			if strings.Contains(route.Address, "/quic") {
				features[bertytypes.QuicFeature] = true
			}
			if strings.Contains(route.Address, "/mc/") {
				features[bertytypes.BLEFeature] = true
				features[bertytypes.BertyFeature] = true
			}
			if strings.Contains(route.Address, "/tor/") {
				features[bertytypes.TorFeature] = true
			}
			for _, stream := range route.Streams {
				if stream.ID == "/berty/contact_req/1.0.0" {
					features[bertytypes.BertyFeature] = true
				}
				if stream.ID == "/rendezvous/1.0.0" {
					features[bertytypes.BertyFeature] = true
				}
			}
		}
		for feature := range features {
			peer.Features = append(peer.Features, feature)
		}
	}

	// FIXME: compute pubsub peers too?

	// FIXME: add metrics about "amount of times seen", "first time seen", "bandwidth"

	// use protobuf format
	for _, peer := range peers {
		reply.Peers = append(reply.Peers, peer)
	}
	return &reply, nil
}
