package bertyprotocol

import (
	"context"
	"encoding/base64"
	"encoding/hex"
	"fmt"

	"github.com/libp2p/go-libp2p-core/crypto"
	peer "github.com/libp2p/go-libp2p-core/peer"
	manet "github.com/multiformats/go-multiaddr/net"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func (s *service) GroupInfo(ctx context.Context, req *protocoltypes.GroupInfo_Request) (*protocoltypes.GroupInfo_Reply, error) {
	var (
		g   *protocoltypes.Group
		err error
	)

	switch {
	case req.GroupPK != nil:
		pk, err := crypto.UnmarshalEd25519PublicKey(req.GroupPK)
		if err != nil {
			return nil, errcode.ErrInvalidInput.Wrap(err)
		}

		g, err = s.getGroupForPK(ctx, pk)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}
	case req.ContactPK != nil:
		pk, err := crypto.UnmarshalEd25519PublicKey(req.ContactPK)
		if err != nil {
			return nil, errcode.ErrInvalidInput.Wrap(err)
		}

		g, err = s.getContactGroup(pk)
		if err != nil {
			return nil, errcode.ErrOrbitDBOpen.Wrap(err)
		}
	default:
		return nil, errcode.ErrInvalidInput
	}

	md, err := s.deviceKeystore.MemberDeviceForGroup(g)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	member, err := md.PrivateMember().GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	device, err := md.PrivateDevice().GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return &protocoltypes.GroupInfo_Reply{
		Group:    g,
		MemberPK: member,
		DevicePK: device,
	}, nil
}

func (s *service) ActivateGroup(ctx context.Context, req *protocoltypes.ActivateGroup_Request) (*protocoltypes.ActivateGroup_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	err = s.activateGroup(ctx, pk, req.LocalOnly)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return &protocoltypes.ActivateGroup_Reply{}, nil
}

func (s *service) DeactivateGroup(_ context.Context, req *protocoltypes.DeactivateGroup_Request) (*protocoltypes.DeactivateGroup_Reply, error) {
	pk, err := crypto.UnmarshalEd25519PublicKey(req.GroupPK)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	if err := s.deactivateGroup(pk); err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return &protocoltypes.DeactivateGroup_Reply{}, nil
}

func (s *service) GroupDeviceStatus(req *protocoltypes.GroupDeviceStatus_Request, srv protocoltypes.ProtocolService_GroupDeviceStatusServer) error {
	ctx := srv.Context()
	gkey := hex.EncodeToString(req.GroupPK)
	peers := PeersConnectedness{}

	logger := s.logger.Named("pstatus")
	logger.Debug("start monitor device status group", logutil.PrivateString("group_key", gkey))

	for {
		updated, ok := s.peerStatusManager.WaitForConnectednessChange(ctx, gkey, peers)
		if !ok {
			return nil // server context has expired
		}

		// send updated peers
		var err error
		for _, peer := range updated {
			var evt protocoltypes.GroupDeviceStatus_Reply

			switch peers[peer] {
			case ConnectednessTypeConnected:
				evt.Type = protocoltypes.TypePeerConnected
				var connected *protocoltypes.GroupDeviceStatus_Reply_PeerConnected
				if connected, err = s.craftPeerConnectedMessage(peer); err == nil {
					evt.Event, err = connected.Marshal()
					logger.Debug("peer connected",
						logutil.PrivateString("group_key", gkey),
						logutil.PrivateString("peer", connected.PeerID),
						logutil.PrivateString("devicePK", base64.URLEncoding.EncodeToString(connected.GetDevicePK())))
				}

			case ConnectednessTypeDisconnected:
				evt.Type = protocoltypes.TypePeerDisconnected
				disconnected := s.craftDeviceDisconnectedMessage(peer)
				logger.Debug("peer disconnected",
					logutil.PrivateString("group_key", gkey),
					logutil.PrivateString("peer", disconnected.PeerID))
				evt.Event, err = disconnected.Marshal()

			case ConnectednessTypeReconnecting:
				evt.Type = protocoltypes.TypePeerConnected
				reconnecting := s.craftDeviceReconnectedMessage(peer)
				logger.Debug("peer reconnecting",
					logutil.PrivateString("group_key", gkey),
					logutil.PrivateString("peer", reconnecting.PeerID))
				evt.Event, err = reconnecting.Marshal()

			default:
				evt.Type = protocoltypes.TypeUnknown
			}

			if err != nil {
				logger.Error("GroupDeviceStatus: unable to handle event", zap.Error(err))
				continue
			}

			if err := srv.Send(&evt); err != nil {
				logger.Debug("GroupDeviceStatus: failed to send event", zap.Error(err))
				return err
			}
		}
	}
}

func (s *service) craftPeerConnectedMessage(peer peer.ID) (*protocoltypes.GroupDeviceStatus_Reply_PeerConnected, error) {
	pdg, ok := s.odb.GetDevicePKForPeerID(peer)
	if !ok {
		return nil, fmt.Errorf("PeerDeviceGroup unknown")
	}

	devicePKRaw, err := pdg.DevicePK.Raw()
	if err != nil {
		return nil, fmt.Errorf("unable to get raw devicePK: %w", err)
	}

	connected := protocoltypes.GroupDeviceStatus_Reply_PeerConnected{
		PeerID:   peer.Pretty(),
		DevicePK: devicePKRaw,
	}

	activeConns := s.host.Network().ConnsToPeer(peer)
	connected.Transports = make([]protocoltypes.GroupDeviceStatus_Transport, len(activeConns))
	connected.Maddrs = make([]string, len(activeConns))

CONN_LOOP:
	for i, conn := range activeConns {
		connected.Maddrs[i] = conn.RemoteMultiaddr().String()

		// check for proximity transport
		protocols := conn.RemoteMultiaddr().Protocols()
		for _, protocol := range protocols {
			switch protocol.Name {
			case "nearby", "mc", "ble":
				connected.Transports[i] = protocoltypes.TptProximity
				continue CONN_LOOP
			}
		}

		// otherwise, check for WAN/LAN addr
		if manet.IsPrivateAddr(conn.RemoteMultiaddr()) {
			connected.Transports[i] = protocoltypes.TptLAN
		} else {
			connected.Transports[i] = protocoltypes.TptWAN
		}
	}

	return &connected, nil
}

func (s *service) craftDeviceDisconnectedMessage(peer peer.ID) *protocoltypes.GroupDeviceStatus_Reply_PeerDisconnected {
	return &protocoltypes.GroupDeviceStatus_Reply_PeerDisconnected{
		PeerID: peer.Pretty(),
	}
}

func (s *service) craftDeviceReconnectedMessage(peer peer.ID) *protocoltypes.GroupDeviceStatus_Reply_PeerReconnecting {
	return &protocoltypes.GroupDeviceStatus_Reply_PeerReconnecting{
		PeerID: peer.Pretty(),
	}
}
