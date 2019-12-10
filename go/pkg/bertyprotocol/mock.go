package bertyprotocol

import (
	"bytes"
	"context"
	"crypto/rand"
	"fmt"
	"net"

	"berty.tech/go/internal/crypto"
	"berty.tech/go/internal/protocoldb"
	"berty.tech/go/pkg/errcode"
	"github.com/jinzhu/gorm"
	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
	"github.com/oklog/run"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

func NewMock(db *gorm.DB, opts Opts) (*Mock, error) {
	mock := Mock{
		DB:                  db,
		Logger:              opts.Logger,
		Peers:               []*Mock{},
		GRPCServer:          grpc.NewServer(),
		Context:             context.Background(),
		RendezvousPointSeed: make([]byte, 16),
		Events:              make(chan interface{}, 1000),
	}
	if opts.Logger == nil {
		mock.Logger = zap.NewNop()
	}

	manager, privkey, err := crypto.InitNewIdentity(context.TODO(), &crypto.Opts{Logger: mock.Logger})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}
	mock.CryptoManager = manager
	mock.PrivKey = privkey

	_, err = rand.Read(mock.RendezvousPointSeed)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	RegisterProtocolServiceServer(mock.GRPCServer, &mock)

	{ // gRPC server & client
		var err error
		mock.GRPCServerListener, err = net.Listen("tcp", "127.0.0.1:0")
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		mock.Workers.Add(func() error {
			return mock.GRPCServer.Serve(mock.GRPCServerListener)
		}, func(error) {
			mock.GRPCServerListener.Close()
		})

		serverAddr := mock.GRPCServerListener.Addr().String()
		mock.GRPCClientConn, err = grpc.Dial(serverAddr, grpc.WithInsecure())
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		mock.GRPCClient = NewProtocolServiceClient(mock.GRPCClientConn)
	}

	go func() {
		if err := mock.Workers.Run(); err != nil {
			mock.Logger.Warn("workers quit unexpectedly: %v", zap.Error(err))
		}
	}()

	return &mock, nil
}

type Mock struct {
	DB                  *gorm.DB
	Logger              *zap.Logger
	Peers               []*Mock
	GRPCServer          *grpc.Server
	GRPCServerListener  net.Listener
	GRPCClient          ProtocolServiceClient
	GRPCClientConn      *grpc.ClientConn
	Workers             run.Group
	Context             context.Context
	CryptoManager       crypto.Manager
	RendezvousPointSeed []byte
	PrivKey             p2pcrypto.PrivKey
	Events              chan interface{}
}

func (m Mock) GetContactRequestLink() *ContactRequestLink {
	b, err := m.PrivKey.GetPublic().Bytes()
	if err != nil {
		panic(err)
	}

	return &ContactRequestLink{
		RendezvousPointSeed:  m.RendezvousPointSeed,
		ContactAccountPubKey: b,
		Metadata:             []byte{},
	}
}

var _ Client = (*Mock)(nil)

// NewPeerMock creates a standalone in-memory mock on the same mocked network
func (m *Mock) NewPeerMock(db *gorm.DB, opts Opts) (*Mock, error) {
	if opts.Logger == nil {
		name := fmt.Sprintf("peer%d", len(m.Peers))
		opts.Logger = m.Logger.Named(name)
	}

	peer, err := NewMock(db, opts)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	m.Peers = append(m.Peers, peer)
	return peer, nil
}

// FIXME: func (m *Mock) GenerateFakeData() error { return nil }

func (m Mock) GetPeerByAccountPubKey(pubkey []byte) *Mock {
	for _, peer := range m.Peers {
		if bytes.Equal(peer.GetContactRequestLink().ContactAccountPubKey, pubkey) {
			return peer
		}
	}
	return nil
}

func (m *Mock) Close() error {
	// FIXME: cleanup
	return nil
}

func (m *Mock) Status() Status { return Status{DB: nil, Protocol: nil} }

func (m *Mock) AccountGetConfiguration(context.Context, *AccountGetConfiguration_Request) (*AccountGetConfiguration_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) AccountGetInformation(ctx context.Context, req *AccountGetInformation_Request) (*AccountGetInformation_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) AccountLinkNewDevice(context.Context, *AccountLinkNewDevice_Request) (*AccountLinkNewDevice_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) AccountDisableIncomingContactRequest(context.Context, *AccountDisableIncomingContactRequest_Request) (*AccountDisableIncomingContactRequest_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) AccountEnableIncomingContactRequest(context.Context, *AccountEnableIncomingContactRequest_Request) (*AccountEnableIncomingContactRequest_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) AccountResetIncomingContactRequestLink(context.Context, *AccountResetIncomingContactRequestLink_Request) (*AccountResetIncomingContactRequestLink_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) InstanceExportData(context.Context, *InstanceExportData_Request) (*InstanceExportData_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) InstanceGetConfiguration(context.Context, *InstanceGetConfiguration_Request) (*InstanceGetConfiguration_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) ContactGet(ctx context.Context, req *ContactGet_Request) (*ContactGet_Reply, error) {
	if req == nil || req.ContactAccountPubKey == nil {
		return nil, errcode.ErrMissingInput
	}

	var contact protocoldb.Contact
	err := m.DB.First(&contact, req.ContactAccountPubKey).Error
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	ret := &ContactGet_Reply{
		Contact: fromDBContact(&contact),
	}
	return ret, nil
}

func (m *Mock) ContactList(req *ContactList_Request, stream ProtocolService_ContactListServer) error {
	var dbContacts []*protocoldb.Contact

	err := m.DB.Where(protocoldb.Contact{RequestStatus: protocoldb.Contact_AcceptedRequest}).Find(&dbContacts).Error
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	for _, dbContact := range dbContacts {
		err := stream.Send(&ContactList_Reply{
			Contact: fromDBContact(dbContact),
		})

		if err != nil {
			return errcode.TODO.Wrap(err)
		}
	}

	return nil
}

func (m *Mock) ContactRemove(ctx context.Context, req *ContactRemove_Request) (*ContactRemove_Reply, error) {
	if req == nil || req.ContactAccountPubKey == nil {
		return nil, errcode.ErrMissingInput
	}

	contact := protocoldb.Contact{AccountPubKey: req.ContactAccountPubKey}
	err := m.DB.Delete(&contact).Error
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	ret := ContactRemove_Reply{}
	return &ret, nil
}

func (m *Mock) ContactRequestAccept(context.Context, *ContactRequestAccept_Request) (*ContactRequestAccept_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) ContactRequestDiscard(context.Context, *ContactRequestDiscard_Request) (*ContactRequestDiscard_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) ContactRequestListIncoming(req *ContactRequestListIncoming_Request, stream ProtocolService_ContactRequestListIncomingServer) error {
	var dbContacts []*protocoldb.Contact

	err := m.DB.Where(protocoldb.Contact{RequestStatus: protocoldb.Contact_IncomingRequest}).Find(&dbContacts).Error
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	for _, dbContact := range dbContacts {
		err := stream.Send(&ContactRequestListIncoming_Reply{
			Contact: fromDBContact(dbContact),
		})

		if err != nil {
			return errcode.TODO.Wrap(err)
		}
	}

	return nil
}

func (m *Mock) ContactRequestListOutgoing(req *ContactRequestListOutgoing_Request, stream ProtocolService_ContactRequestListOutgoingServer) error {
	var dbContacts []*protocoldb.Contact

	err := m.DB.Where(protocoldb.Contact{RequestStatus: protocoldb.Contact_OutgoingRequest}).Find(&dbContacts).Error
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	for _, dbContact := range dbContacts {
		err := stream.Send(&ContactRequestListOutgoing_Reply{
			Contact: fromDBContact(dbContact),
		})

		if err != nil {
			return errcode.TODO.Wrap(err)
		}
	}

	return nil
}

func (m *Mock) ContactRequestSend(ctx context.Context, req *ContactRequestSend_Request) (*ContactRequestSend_Reply, error) {
	if req == nil ||
		req.ContactRequestLink == nil ||
		req.ContactRequestLink.ContactAccountPubKey == nil ||
		req.ContactRequestLink.RendezvousPointSeed == nil {
		return nil, errcode.ErrMissingInput
	}

	// FIXME: do something with req.ContactRequestLink.RendezvousPointSeed
	contact := protocoldb.Contact{
		AccountPubKey: req.ContactRequestLink.ContactAccountPubKey,
		// FIXME: OneToOneGroupPubKey: something,
		// FIXME: BinderPubKey: something,
		TrustLevel:    protocoldb.Contact_Untrusted,
		Metadata:      req.ContactRequestLink.Metadata,
		Blocked:       false,
		RequestStatus: protocoldb.Contact_OutgoingRequest,
	}

	err := m.DB.Create(&contact).Error
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	ret := ContactRequestSend_Reply{Contact: fromDBContact(&contact)}

	peer := m.GetPeerByAccountPubKey(req.ContactRequestLink.ContactAccountPubKey)
	if peer != nil {
		if err := peer.handleContactRequest(m.GetContactRequestLink().ContactAccountPubKey, nil); err != nil {
			m.Logger.Warn("peer failed to handle the request", zap.Error(err))
		}
	}
	return &ret, nil
}

func (m *Mock) handleContactRequest(pubkey []byte, metadata []byte) error {
	// add new contact request in db
	contact := protocoldb.Contact{
		AccountPubKey: pubkey,
		Metadata:      metadata,
		TrustLevel:    protocoldb.Contact_Untrusted,
		Blocked:       false,
		RequestStatus: protocoldb.Contact_IncomingRequest,
	}
	err := m.DB.Create(&contact).Error
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	// append event
	m.Events <- &EventSubscribe_ContactRequestEvent{
		ContactAccountPubKey: pubkey,
		Metadata:             []byte{},
	}

	return nil
}

func (m *Mock) EventSubscribe(req *EventSubscribe_Request, stream ProtocolService_EventSubscribeServer) error {
	for event := range m.Events {
		rep := &EventSubscribe_Reply{
			// FIXME: EventID
		}
		switch typed := event.(type) {
		case *EventSubscribe_ContactRequestEvent:
			rep.Type = EventSubscribe_EventContactRequest
			rep.ContactRequestEvent = typed
		default:
			return errcode.ErrNotImplemented.Wrap(fmt.Errorf("unsupported event type: %v", event))
		}

		err := stream.Send(rep)
		if err != nil {
			return err
		}
	}
	return nil
}

func (m *Mock) GroupCreate(context.Context, *GroupCreate_Request) (*GroupCreate_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) GroupGenerateInviteLink(context.Context, *GroupGenerateInviteLink_Request) (*GroupGenerateInviteLink_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) GroupLeave(context.Context, *GroupLeave_Request) (*GroupLeave_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) GroupList(*GroupList_Request, ProtocolService_GroupListServer) error {
	return errcode.ErrNotImplemented
}

func (m *Mock) GroupMessageCreate(context.Context, *GroupMessageCreate_Request) (*GroupMessageCreate_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) GroupMessageList(*GroupMessageList_Request, ProtocolService_GroupMessageListServer) error {
	return errcode.ErrNotImplemented
}

func (m *Mock) GroupTopicPublish(ProtocolService_GroupTopicPublishServer) error {
	return errcode.ErrNotImplemented
}

func (m *Mock) GroupTopicSubscribe(*GroupTopicSubscribe_Request, ProtocolService_GroupTopicSubscribeServer) error {
	return errcode.ErrNotImplemented
}

func (m *Mock) GroupInvitationAccept(context.Context, *GroupInvitationAccept_Request) (*GroupInvitationAccept_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) GroupInvitationCreate(context.Context, *GroupInvitationCreate_Request) (*GroupInvitationCreate_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) GroupInvitationDiscard(context.Context, *GroupInvitationDiscard_Request) (*GroupInvitationDiscard_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) GroupInvitationList(*GroupInvitationList_Request, ProtocolService_GroupInvitationListServer) error {
	return errcode.ErrNotImplemented
}

func (m *Mock) StreamManagerRequestToContact(context.Context, *StreamManagerRequestToContact_Request) (*StreamManagerRequestToContact_Reply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) StreamManagerAccept(ProtocolService_StreamManagerAcceptServer) error {
	return errcode.ErrNotImplemented
}
