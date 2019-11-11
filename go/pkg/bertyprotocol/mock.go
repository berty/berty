package bertyprotocol

import (
	"context"
	"fmt"
	"net"

	"berty.tech/go/internal/protocoldb"
	"berty.tech/go/pkg/errcode"
	"github.com/jinzhu/gorm"
	"github.com/oklog/run"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

func NewMock(db *gorm.DB, opts Opts) (*Mock, error) {
	mock := Mock{
		DB:         db,
		Logger:     opts.Logger,
		Peers:      []*Mock{},
		GRPCServer: grpc.NewServer(),
		Context:    context.Background(),
	}

	if opts.Logger == nil {
		mock.Logger = zap.NewNop()
	}
	RegisterProtocolServiceServer(mock.GRPCServer, &mock)

	{ // gRPC server & client
		var err error
		mock.GRPCServerListener, err = net.Listen("tcp", "127.0.0.1:0")
		if err != nil {
			return nil, err
		}

		mock.Workers.Add(func() error {
			return mock.GRPCServer.Serve(mock.GRPCServerListener)
		}, func(error) {
			mock.GRPCServerListener.Close()
		})

		serverAddr := mock.GRPCServerListener.Addr().String()
		mock.GRPCClientConn, err = grpc.Dial(serverAddr, grpc.WithInsecure())
		if err != nil {
			return nil, err
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
	DB                 *gorm.DB
	Logger             *zap.Logger
	Peers              []*Mock
	GRPCServer         *grpc.Server
	GRPCServerListener net.Listener
	GRPCClient         ProtocolServiceClient
	GRPCClientConn     *grpc.ClientConn
	Workers            run.Group
	Context            context.Context
}

var _ Client = (*Mock)(nil)

// NewPeerMock creates a standalone in-memory mock on the same mocked network
func (m *Mock) NewPeerMock() (*Mock, error) {
	name := fmt.Sprintf("peer%d", len(m.Peers))

	db, err := gorm.Open("sqlite3", ":memory:")
	if err != nil {
		return nil, err
	}

	opts := Opts{Logger: m.Logger.Named(name)}
	return NewMock(db, opts)
}

// FIXME: func (m *Mock) GenerateFakeData() error { return nil }

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

	err := m.DB.Find(&dbContacts).Error
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

func (m *Mock) ContactRequestListIncoming(*ContactRequestListIncoming_Request, ProtocolService_ContactRequestListIncomingServer) error {
	return errcode.ErrNotImplemented
}

func (m *Mock) ContactRequestListOutgoing(*ContactRequestListOutgoing_Request, ProtocolService_ContactRequestListOutgoingServer) error {
	return errcode.ErrNotImplemented
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
		TrustLevel: protocoldb.Contact_Untrusted,
		Metadata:   req.ContactRequestLink.Metadata,
		Blocked:    false,
	}

	err := m.DB.Create(&contact).Error
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	ret := ContactRequestSend_Reply{Contact: fromDBContact(&contact)}
	return &ret, nil
}

func (m *Mock) EventSubscribe(*EventSubscribe_Request, ProtocolService_EventSubscribeServer) error {
	return errcode.ErrNotImplemented
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
