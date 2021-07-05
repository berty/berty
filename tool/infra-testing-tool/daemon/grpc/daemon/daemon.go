package daemon

import (
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"bytes"
	"context"
	"encoding/gob"
	"errors"
	"fmt"
	"google.golang.org/grpc"
	"infratesting/config"
	"infratesting/testing"
	"log"
	"sync"
)

type Server struct {

	Cc *grpc.ClientConn
	Messenger messengertypes.MessengerServiceClient
	Protocol  protocoltypes.ProtocolServiceClient

	Name string
	Tags map[string]string

	Lock sync.Mutex

	Groups map[string]*protocoltypes.Group
	ConfigGroups []config.Group

	DevicePK []byte
	Messages map[string][]testing.MessageHistory
	LastMessageId map[string][]byte
}

func NewServer() (Server) {
	var s Server

	s.Tags = make(map[string]string)

	s.Groups = make(map[string]*protocoltypes.Group)

	s.Messages = make(map[string][]testing.MessageHistory)
	s.LastMessageId = make(map[string][]byte)

	return s
}

func (s *Server) mustEmbedUnimplementedPeerServer() {
	panic("implement me")
}

func (s *Server) mustEmbedUnimplementedGroupServer() {
	panic("implement me")
}

// ConnectToPeer connects to a peer based on the request
func (s *Server) ConnectToPeer(ctx context.Context, request *ConnectToPeer_Request) (response *ConnectToPeer_Response, err error) {
	response = new(ConnectToPeer_Response)

	host := fmt.Sprintf("%s:%s", request.Host, request.Port)

	cc, err := grpc.DialContext(ctx, host, grpc.FailOnNonTempDialError(true), grpc.WithInsecure())
	if err != nil {
		return response, err
	}

	s.Cc = cc
	s.Messenger = messengertypes.NewMessengerServiceClient(s.Cc)
	s.Protocol = protocoltypes.NewProtocolServiceClient(s.Cc)


	resp, err := s.Protocol.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
	if err != nil {
		return response, err
	}

	s.DevicePK = resp.DevicePK

	return response, err
}

func (s *Server) CreateInvite(ctx context.Context, request *CreateInvite_Request) (response *CreateInvite_Response, err error) {
	response = new(CreateInvite_Response)

	resCreate, err := s.Protocol.MultiMemberGroupCreate(ctx, &protocoltypes.MultiMemberGroupCreate_Request{})
	if err != nil {
		return response, err
	}

	invite, err := s.Messenger.ShareableBertyGroup(ctx, &messengertypes.ShareableBertyGroup_Request{
		GroupPK: resCreate.GroupPK,
		GroupName: request.GroupName,
	})

	if invite == nil {
		return response, errors.New("created invite was of type nil, something went wrong")
	}

	s.Lock.Lock()
	s.Groups[request.GroupName] = invite.Link.GetBertyGroup().Group
	s.Lock.Unlock()

	// encode invite into gob
	var n bytes.Buffer
	enc := gob.NewEncoder(&n)

	err = enc.Encode(invite)
	if err != nil {
		return response, err
	}

	return &CreateInvite_Response{Invite: n.Bytes()}, err
}

func (s *Server) JoinGroup(ctx context.Context, request *JoinGroup_Request) (response *JoinGroup_Response, err error) {
	response = new(JoinGroup_Response)

	if s.Groups[request.GroupName] != nil {
		log.Printf("already in group %v\n", request.GroupName)
		return response, err
	}

	// decode gob into invite
	n := bytes.NewBuffer(request.Invite)
	dec := gob.NewDecoder(n)

	var invite messengertypes.ShareableBertyGroup_Reply
	err = dec.Decode(&invite)
	if err != nil {
		return response, err
	}

	link := invite.GetLink()
	_, err = s.Protocol.MultiMemberGroupJoin(ctx, &protocoltypes.MultiMemberGroupJoin_Request{
		Group: link.BertyGroup.GetGroup(),
	})
	if err != nil {
		return response, err
	}

	s.Lock.Lock()
	s.Groups[request.GroupName] = invite.Link.GetBertyGroup().Group
	s.Lock.Unlock()

	return response, err
}

// TestConnection always returns true
func (s *Server) TestConnection(ctx context.Context, request *TestConnection_Request) (response *TestConnection_Response, err error) {
	fmt.Printf("Connection test: %v\n", request.Message)

	return &TestConnection_Response{Success: true}, err
}
