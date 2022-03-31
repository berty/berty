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

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/sysutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/go-orbit-db/stores/operation"
)

func (s *service) DebugListGroups(req *protocoltypes.DebugListGroups_Request, srv protocoltypes.ProtocolService_DebugListGroupsServer) error {
	if err := srv.SendMsg(&protocoltypes.DebugListGroups_Reply{
		GroupPK:   s.accountGroup.group.PublicKey,
		GroupType: s.accountGroup.group.GroupType,
	}); err != nil {
		return err
	}

	for _, c := range s.accountGroup.MetadataStore().ListContactsByStatus(protocoltypes.ContactStateAdded) {
		pk, err := crypto.UnmarshalEd25519PublicKey(c.PK)
		if err != nil {
			return errcode.ErrDeserialization.Wrap(err)
		}

		sk, err := s.deviceKeystore.ContactGroupPrivKey(pk)
		if err != nil {
			return errcode.ErrCryptoKeyGeneration.Wrap(err)
		}

		g, err := cryptoutil.GetGroupForContact(sk)
		if err != nil {
			return errcode.ErrOrbitDBOpen.Wrap(err)
		}

		if err := srv.SendMsg(&protocoltypes.DebugListGroups_Reply{
			GroupPK:   g.PublicKey,
			GroupType: g.GroupType,
			ContactPK: c.PK,
		}); err != nil {
			return err
		}
	}

	for _, g := range s.accountGroup.MetadataStore().ListMultiMemberGroups() {
		if err := srv.SendMsg(&protocoltypes.DebugListGroups_Reply{
			GroupPK:   g.PublicKey,
			GroupType: g.GroupType,
		}); err != nil {
			return err
		}
	}

	return nil
}

func (s *service) DebugInspectGroupStore(req *protocoltypes.DebugInspectGroupStore_Request, srv protocoltypes.ProtocolService_DebugInspectGroupStoreServer) error {
	if req.LogType == protocoltypes.DebugInspectGroupLogTypeUndefined {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("invalid log type specified"))
	}

	cg, err := s.GetContextGroupForID(req.GroupPK)
	if err != nil {
		return errcode.ErrInvalidInput.Wrap(err)
	}

	switch req.LogType {
	case protocoltypes.DebugInspectGroupLogTypeMessage:
		for _, e := range cg.messageStore.OpLog().GetEntries().Slice() {
			var (
				payload  = []byte(nil)
				devicePK = []byte(nil)
				nexts    = make([][]byte, len(e.GetNext()))
			)

			if evt, err := cg.messageStore.openMessage(srv.Context(), e); err != nil {
				s.logger.Error("unable to open message", zap.Error(err))
			} else {
				devicePK = evt.Headers.DevicePK
				payload = evt.Message
			}

			for i, n := range e.GetNext() {
				nexts[i] = n.Bytes()
			}

			if err := srv.SendMsg(&protocoltypes.DebugInspectGroupStore_Reply{
				CID:        e.GetHash().Bytes(),
				ParentCIDs: nexts,
				DevicePK:   devicePK,
				Payload:    payload,
			}); err != nil {
				return err
			}
		}

	case protocoltypes.DebugInspectGroupLogTypeMetadata:
		log := cg.metadataStore.OpLog()

		for _, e := range log.GetEntries().Slice() {
			var (
				eventType protocoltypes.EventType
				payload   = []byte(nil)
				devicePK  = []byte(nil)
				nexts     = make([][]byte, len(e.GetNext()))
			)

			if op, err := operation.ParseOperation(e); err != nil {
				s.logger.Error("unable to parse operation", zap.Error(err))
			} else if meta, event, _, err := openGroupEnvelope(cg.group, op.GetValue(), s.deviceKeystore); err != nil {
				s.logger.Error("unable to open group envelope", zap.Error(err))
			} else if metaEvent, err := newGroupMetadataEventFromEntry(log, e, meta, event, cg.group, nil); err != nil {
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

			if err := srv.SendMsg(&protocoltypes.DebugInspectGroupStore_Reply{
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

func (s *service) DebugGroup(ctx context.Context, request *protocoltypes.DebugGroup_Request) (*protocoltypes.DebugGroup_Reply, error) {
	rep := &protocoltypes.DebugGroup_Reply{}

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

func (s *service) SystemInfo(ctx context.Context, request *protocoltypes.SystemInfo_Request) (*protocoltypes.SystemInfo_Reply, error) {
	reply := protocoltypes.SystemInfo_Reply{}

	// process
	process, errs := sysutil.SystemInfoProcess()
	reply.Process = process
	reply.Process.StartedAt = s.startedAt.Unix()
	reply.Process.UptimeMS = time.Since(s.startedAt).Milliseconds()

	// gRPC
	// TODO

	// p2p
	{
		reply.P2P = &protocoltypes.SystemInfo_P2P{}

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
	reply.OrbitDB = &protocoltypes.SystemInfo_OrbitDB{
		AccountMetadata: &protocoltypes.SystemInfo_OrbitDB_ReplicationStatus{
			Progress: int64(status.GetProgress()),
			Maximum:  int64(status.GetMax()),
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

func (s *service) PeerList(ctx context.Context, request *protocoltypes.PeerList_Request) (*protocoltypes.PeerList_Reply, error) {
	reply := protocoltypes.PeerList_Reply{}
	api := s.IpfsCoreAPI()
	if api == nil {
		return nil, errcode.TODO.Wrap(fmt.Errorf("IPFS Core API is not available"))
	}
	swarmPeers, err := api.Swarm().Peers(ctx) // https://pkg.go.dev/github.com/ipfs/interface-go-ipfs-core#ConnectionInfo
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	peers := map[peer.ID]*protocoltypes.PeerList_Peer{}

	// each peer in the swarm should be visible
	for _, swarmPeer := range swarmPeers {
		peers[swarmPeer.ID()] = &protocoltypes.PeerList_Peer{
			ID:     swarmPeer.ID().Pretty(),
			Errors: []string{},
			Routes: []*protocoltypes.PeerList_Route{},
		}
	}
	// FIXME: do not restrict on swarm peers, also print some other important ones (old, etc)

	// append peer addrs from peerstore
	for peerID, peer := range peers {
		info := s.host.Peerstore().PeerInfo(peerID)
		for _, addr := range info.Addrs {
			peer.Routes = append(peer.Routes, &protocoltypes.PeerList_Route{
				Address: addr.String(),
			})
		}
	}

	// append more info for active connections
	for _, swarmPeer := range swarmPeers {
		peer, ok := peers[swarmPeer.ID()]
		if !ok {
			peer = &protocoltypes.PeerList_Peer{
				ID:     swarmPeer.ID().Pretty(),
				Errors: []string{},
				Routes: []*protocoltypes.PeerList_Route{},
			}
			peer.Errors = append(peer.Errors, "peer in swarm peers, but not in peerstore")
			peers[swarmPeer.ID()] = peer
		}

		address := swarmPeer.Address().String()
		found := false
		var selectedRoute *protocoltypes.PeerList_Route
		for _, route := range peer.Routes {
			if route.Address == address {
				found = true
				selectedRoute = route
			}
		}
		if !found {
			newRoute := protocoltypes.PeerList_Route{Address: address}
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
				selectedRoute.Direction = protocoltypes.InboundDir
			case network.DirOutbound:
				selectedRoute.Direction = protocoltypes.OutboundDir
			}
		}
		// streams
		{
			peerStreams, err := swarmPeer.Streams()
			if err != nil {
				peer.Errors = append(peer.Errors, err.Error())
			} else {
				selectedRoute.Streams = []*protocoltypes.PeerList_Stream{}
				for _, peerStream := range peerStreams {
					if peerStream == "" {
						continue
					}
					selectedRoute.Streams = append(selectedRoute.Streams, &protocoltypes.PeerList_Stream{
						ID: string(peerStream),
					})
				}
			}
		}
	}

	// compute features
	for _, peer := range peers {
		features := map[protocoltypes.PeerList_Feature]bool{}
		for _, route := range peer.Routes {
			// FIXME: use the multiaddr library instead of string comparisons
			if strings.Contains(route.Address, "/quic") {
				features[protocoltypes.QuicFeature] = true
			}
			if strings.Contains(route.Address, "/mc/") {
				features[protocoltypes.BLEFeature] = true
				features[protocoltypes.BertyFeature] = true
			}
			if strings.Contains(route.Address, "/tor/") {
				features[protocoltypes.TorFeature] = true
			}
			for _, stream := range route.Streams {
				if stream.ID == "/berty/contact_req/1.0.0" {
					features[protocoltypes.BertyFeature] = true
				}
				if stream.ID == "/rendezvous/1.0.0" {
					features[protocoltypes.BertyFeature] = true
				}
			}
		}
		for feature := range features {
			peer.Features = append(peer.Features, feature)
		}
	}

	// compute peer-level aggregates
	for _, peer := range peers {
		// aggregate direction
		for _, route := range peer.Routes {
			if route.Direction == protocoltypes.UnknownDir {
				continue
			}
			switch {
			case peer.Direction == protocoltypes.UnknownDir: // first route with a direction
				peer.Direction = route.Direction
			case peer.Direction == protocoltypes.BiDir: // peer aggregate is already maximal
				// noop
			case route.Direction == peer.Direction: // another route with the same direction
				// noop
			case route.Direction == protocoltypes.InboundDir && peer.Direction == protocoltypes.OutboundDir:
				peer.Direction = protocoltypes.BiDir
			case route.Direction == protocoltypes.OutboundDir && peer.Direction == protocoltypes.InboundDir:
				peer.Direction = protocoltypes.BiDir
			default:
				peer.Errors = append(peer.Errors, "failed to compute direction aggregate")
			}
		}

		// aggregate latency
		for _, route := range peer.Routes {
			if route.Latency == 0 {
				continue
			}
			switch {
			case peer.MinLatency == 0: // first route with a latency
				peer.MinLatency = route.Latency
			case peer.MinLatency > route.Latency: // smaller value
				peer.MinLatency = route.Latency
			}
		}

		// aggregate isActive
		for _, route := range peer.Routes {
			if route.IsActive {
				peer.IsActive = true
				break
			}
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
