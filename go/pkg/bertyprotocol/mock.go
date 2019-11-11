package bertyprotocol

import (
	"context"
	"fmt"
	"net"

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
	}

	if opts.Logger == nil {
		mock.Logger = zap.NewNop()
	}
	RegisterInstanceServer(mock.GRPCServer, &mock)

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

		mock.GRPCClient = NewInstanceClient(mock.GRPCClientConn)
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
	GRPCClient         InstanceClient
	GRPCClientConn     *grpc.ClientConn
	Workers            run.Group
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

func (m *Mock) AccountGetConfiguration(context.Context, *AccountGetConfigurationRequest) (*AccountGetConfigurationReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) AccountGetInformation(ctx context.Context, req *AccountGetInformationRequest) (*AccountGetInformationReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) AccountLinkNewDevice(context.Context, *AccountLinkNewDeviceRequest) (*AccountLinkNewDeviceReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) AccountDisableIncomingContactRequest(context.Context, *AccountDisableIncomingContactRequestRequest) (*AccountDisableIncomingContactRequestReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) AccountEnableIncomingContactRequest(context.Context, *AccountEnableIncomingContactRequestRequest) (*AccountEnableIncomingContactRequestReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) AccountResetIncomingContactRequestLink(context.Context, *AccountResetIncomingContactRequestLinkRequest) (*AccountResetIncomingContactRequestLinkReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) InstanceExportData(context.Context, *InstanceExportDataRequest) (*InstanceExportDataReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) InstanceGetConfiguration(context.Context, *InstanceGetConfigurationRequest) (*InstanceGetConfigurationReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) ContactGet(context.Context, *ContactGetRequest) (*ContactGetReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) ContactList(req *ContactListRequest, stream Instance_ContactListServer) error {
	contacts := []*Contact{ // FIXME: get from DB
		{
			AccountPubKey:       []byte("lorem1"),
			Metadata:            []byte("ipsum1"),
			OneToOneGroupPubKey: []byte("dolor1"),
			TrustLevel:          Contact_Trusted,
			Blocked:             false,
		},
		{
			AccountPubKey:       []byte("lorem2"),
			Metadata:            []byte("ipsum2"),
			OneToOneGroupPubKey: []byte("dolor2"),
			TrustLevel:          Contact_Trusted,
			Blocked:             false,
		},
	}

	for _, contact := range contacts {
		err := stream.Send(&ContactListReply{
			Contact: contact,
		})

		if err != nil {
			return err
		}
	}
	return nil
}

func (m *Mock) ContactRemove(context.Context, *ContactRemoveRequest) (*ContactRemoveReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) ContactRequestAccept(context.Context, *ContactRequestAcceptRequest) (*ContactRequestAcceptReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) ContactRequestDiscard(context.Context, *ContactRequestDiscardRequest) (*ContactRequestDiscardReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) ContactRequestListIncoming(*ContactRequestListIncomingRequest, Instance_ContactRequestListIncomingServer) error {
	return errcode.ErrNotImplemented
}

func (m *Mock) ContactRequestListOutgoing(*ContactRequestListOutgoingRequest, Instance_ContactRequestListOutgoingServer) error {
	return errcode.ErrNotImplemented
}

func (m *Mock) ContactRequestSend(context.Context, *ContactRequestSendRequest) (*ContactRequestSendReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) EventSubscribe(*EventSubscribeRequest, Instance_EventSubscribeServer) error {
	return errcode.ErrNotImplemented
}

func (m *Mock) GroupCreate(context.Context, *GroupCreateRequest) (*GroupCreateReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) GroupGenerateInviteLink(context.Context, *GroupGenerateInviteLinkRequest) (*GroupGenerateInviteLinkReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) GroupLeave(context.Context, *GroupLeaveRequest) (*GroupLeaveReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) GroupList(*GroupListRequest, Instance_GroupListServer) error {
	return errcode.ErrNotImplemented
}

func (m *Mock) GroupMessageCreate(context.Context, *GroupMessageCreateRequest) (*GroupMessageCreateReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) GroupMessageList(*GroupMessageListRequest, Instance_GroupMessageListServer) error {
	return errcode.ErrNotImplemented
}

func (m *Mock) GroupTopicPublish(Instance_GroupTopicPublishServer) error {
	return errcode.ErrNotImplemented
}

func (m *Mock) GroupTopicSubscribe(*GroupTopicSubscribeRequest, Instance_GroupTopicSubscribeServer) error {
	return errcode.ErrNotImplemented
}

func (m *Mock) GroupInvitationAccept(context.Context, *GroupInvitationAcceptRequest) (*GroupInvitationAcceptReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) GroupInvitationCreate(context.Context, *GroupInvitationCreateRequest) (*GroupInvitationCreateReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) GroupInvitationDiscard(context.Context, *GroupInvitationDiscardRequest) (*GroupInvitationDiscardReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) GroupInvitationList(*GroupInvitationListRequest, Instance_GroupInvitationListServer) error {
	return errcode.ErrNotImplemented
}

func (m *Mock) StreamManagerRequestToContact(context.Context, *StreamManagerRequestToContactRequest) (*StreamManagerRequestToContactReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (m *Mock) StreamManagerAccept(Instance_StreamManagerAcceptServer) error {
	return errcode.ErrNotImplemented
}
