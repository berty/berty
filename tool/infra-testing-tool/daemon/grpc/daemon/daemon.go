package daemon

import (
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"bytes"
	"context"
	"encoding/gob"
	"errors"
	"fmt"
	"github.com/anaskhan96/soup"
	"google.golang.org/grpc"
	"infratesting/aws"
	"infratesting/config"
	"io"
	"io/fs"
	"log"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

type Server struct {

	Cc *grpc.ClientConn
	Messenger messengertypes.MessengerServiceClient
	Protocol  protocoltypes.ProtocolServiceClient

	Lock sync.Mutex

	Groups map[string]*protocoltypes.Group

	// group --> test --> bool
	RunningTests map[string]map[string]bool
	Tests 	map[string]map[string]config.Test

	ReceivingMessages map[string]bool

	DevicePK []byte
	Messages map[string][]Message
	LastMessageId map[string][]byte
}

// NewServer returns server with initialised internal maps
func NewServer() Server {
	var s Server

	s.Groups = make(map[string]*protocoltypes.Group)
	s.Tests = make(map[string]map[string]config.Test)
	s.RunningTests = make(map[string]map[string]bool)

	s.ReceivingMessages = make(map[string]bool)

	s.Messages = make(map[string][]Message)
	s.LastMessageId = make(map[string][]byte)

	return s
}

func (s *Server) mustEmbedUnimplementedPeerServer() {
	panic("implement me")
}

func (s *Server) mustEmbedUnimplementedGroupServer() {
	panic("implement me")
}

func (s *Server) mustEmbedUnimplementedTestServer() {
	panic("implement me")
}

// IsTestRunning checks if a specific test is running at the moment
func (s *Server) IsTestRunning(ctx context.Context, request *IsTestRunning_Request) (response *IsTestRunning_Response, err error) {
	if s.Groups[request.GroupName] == nil {
		return &IsTestRunning_Response{TestIsRunning: false}, err
	}

	if s.Tests[request.GroupName][request.TestName] == *new(config.Test) {
		return response, errors.New(ErrTestNotExist)
	}

	return &IsTestRunning_Response{TestIsRunning: s.RunningTests[request.GroupName][request.TestName]}, err
}

// NewTest adds a test to the peers' test memory
func (s *Server) NewTest(ctx context.Context, request *NewTest_Request) (response *NewTest_Response, err error) {
	response = new(NewTest_Response)

	if s.Groups[request.GroupName] == nil {
		return response, errors.New(ErrNotInGroup)
	}

	test := config.Test{
		TypeInternal: request.Type,
		SizeInternal: int(request.Size),
		IntervalInternal: int(request.Interval),
	}

	s.Lock.Lock()

	if s.Tests[request.GroupName][request.TestName] == *new(config.Test) {
		s.Tests[request.GroupName] = make(map[string]config.Test)
	}

	s.Tests[request.GroupName][request.TestName] = test

	s.Lock.Unlock()

	return response, err
}

// StartTest starts a specific test
func (s *Server) StartTest(ctx context.Context, request *StartTest_Request) (response *StartTest_Response, err error) {
	response = new(StartTest_Response)

	if s.Tests[request.GroupName][request.TestName] == *new(config.Test) {
		return response, errors.New(ErrTestNotExist)
	}

	if s.RunningTests[request.GroupName][request.TestName] == true {
		return response, errors.New(ErrTestInProgress)
	}

		duration := int(request.GetDuration())
	test := s.Tests[request.GroupName][request.TestName]

	fmt.Println("test: " + request.TestName)

	s.Lock.Lock()
	if s.RunningTests[request.GroupName] == nil {
		s.RunningTests[request.GroupName] = make(map[string]bool)
	}

	s.RunningTests[request.GroupName][request.TestName] = true

	s.Lock.Unlock()

	go func() {
		// set running state to false
		defer func() {
			s.RunningTests[request.GroupName][request.TestName] = false
		}()


		var x int
		for x = 0; x < duration; x += 1 {
			err = s.SendMessage(request.GroupName, ConstructMessage(test.SizeInternal))
			if err != nil {
				panic(err)
			}
			time.Sleep(time.Second * time.Duration(test.IntervalInternal))
		}

		log.Printf("sent %d messages to %s\n",x ,  request.GroupName)


	}()

	return response, err
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

func (s *Server) UploadLogs(ctx context.Context, request *UploadLogs_Request) (response *UploadLogs_Response, err error) {
	response = new(UploadLogs_Response)

	err = filepath.Walk("/home/ec2-user/logs", func(path string, info fs.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			return filepath.SkipDir
		}
		// uploads file
		err = aws.UploadFile(path, fmt.Sprintf("%s/%s/%s", request.Folder, request.Folder, info.Name()))
		if err != nil {
			return err
		}

		return err
	})


	return response, err
}

// CreateInvite creates an invite and returns the invite blob from the berty protocoltypes api
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

	// activate group
	_, err = s.Protocol.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{GroupPK: resCreate.GroupPK})
	if err != nil {
		return response, err
	}

	// encode invite into gob
	var n bytes.Buffer
	enc := gob.NewEncoder(&n)

	err = enc.Encode(invite)
	if err != nil {
		return response, err
	}

	return &CreateInvite_Response{Invite: n.Bytes()}, err
}

// JoinGroup takes in the invite blob from the berty protocol api and join the group
func (s *Server) JoinGroup(ctx context.Context, request *JoinGroup_Request) (response *JoinGroup_Response, err error) {
	response = new(JoinGroup_Response)

	if s.Groups[request.GroupName] != nil {
		return response, errors.New(ErrAlreadyInGroup)
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

	// activate group
	_, err = s.Protocol.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{GroupPK: invite.Link.GetBertyGroup().Group.PublicKey})
	if err != nil {
		return response, err
	}

	s.Lock.Lock()
	s.Groups[request.GroupName] = invite.Link.GetBertyGroup().Group
	s.Lock.Unlock()

	return response, err
}

// StartReceiveMessage starts a goroutine on the server that reads messages in a specific group
func (s *Server) StartReceiveMessage(ctx context.Context, request *StartReceiveMessage_Request) (response *StartReceiveMessage_Response,err  error) {
	response = new(StartReceiveMessage_Response)

	if s.Groups[request.GroupName] == nil {
		return response, errors.New(ErrNotInGroup)
	}

	if s.ReceivingMessages[request.GroupName] == true {
		return response, errors.New(ErrAlreadyReceiving)
	}

	s.Lock.Lock()
	s.ReceivingMessages[request.GroupName] = true
	s.Lock.Unlock()

	pk := s.Groups[request.GroupName]

	go func() {

		newContext := context.Background()

		for {
			cl, err := s.Protocol.GroupMessageList(newContext, &protocoltypes.GroupMessageList_Request{
				GroupPK:  pk.PublicKey,
				SinceNow: true,
			})
			if err != nil {
				log.Println(err)
			}

			for {
				evt, err := cl.Recv()
				if err != nil {
					if err != io.EOF {
						log.Println(err)
					}
					break
				}

				// this doesn't work  ??
				if s.ReceivingMessages[request.GroupName] == false {
					log.Println("done receiving messages in group ", request.GroupName)
					break
				}

				_, am, err := messengertypes.UnmarshalAppMessage(evt.GetMessage())
				if err != nil {
					log.Println(err)
					continue
				}


				switch am.GetType() {
				case messengertypes.AppMessage_TypeUserMessage:
					var isDupe bool
					currentMessage := ToMessage(am)

					var wg sync.WaitGroup
					var dupeLock sync.Mutex

					for _, message := range s.Messages[request.GroupName] {
						wg.Add(1)
						m := message

						go func(wg *sync.WaitGroup) {
							if m.PayloadHash == currentMessage.PayloadHash {
								dupeLock.Lock()
								isDupe = true
								dupeLock.Unlock()
							}
							wg.Done()
						}(&wg)

						if isDupe == true {
							break
						}
					}

					wg.Wait()

					s.Lock.Lock()
					if !isDupe {
						// prepend
						// we prepend instead of append to make dupes be detected faster
						log.Println(currentMessage.PayloadHash)
						s.Messages[request.GroupName] = append([]Message{currentMessage}, s.Messages[request.GroupName]..., )
					}
					s.Lock.Unlock()
				}

			}
			time.Sleep(time.Second * 1)
		}
	}()

	return response, err
}

// StopReceiveMessage stops the receiving goroutine
func (s *Server) StopReceiveMessage(ctx context.Context, request *StopReceiveMessage_Request) (response *StopReceiveMessage_Response, err error) {
	response = new(StopReceiveMessage_Response)

	if s.Groups[request.GroupName] == nil {
		return response, errors.New(ErrNotInGroup)
	}

	s.Lock.Lock()
	s.ReceivingMessages[request.GroupName] = false
	s.Lock.Unlock()

	return response, err
}

// ReadyReplication ready's a replication server by contacting the token server.
func (s *Server) ReplicationJoinGroup(ctx context.Context, request *ReplicationJoinGroup_Request) (response *ReplicationJoinGroup_Response,err error) {
	fmt.Println(request)

	response = new(ReplicationJoinGroup_Response)

	// replication
	replication, err := grpc.DialContext(ctx, "127.0.0.1:9091", grpc.FailOnNonTempDialError(true), grpc.WithInsecure())
	if err != nil {
		return response, err
	}

	replicationProtocol :=  protocoltypes.NewProtocolServiceClient(replication)

	resp, err := replicationProtocol.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
	if err != nil {
		panic(err)
		return response, err
	}

	fmt.Println("resp:")
	fmt.Println(resp)


	// decode gob into invite
	n := bytes.NewBuffer(request.Invite)
	dec := gob.NewDecoder(n)

	var invite messengertypes.ShareableBertyGroup_Reply
	err = dec.Decode(&invite)
	if err != nil {
		panic(err)
		return response, err
	}

	initFlowResp, err := replicationProtocol.AuthServiceInitFlow(ctx, &protocoltypes.AuthServiceInitFlow_Request{
		AuthURL: "http://127.0.0.1:8091",
	})
	if err != nil {
		panic(err)
		return response, err
	}

	URL := initFlowResp.URL
	URL = strings.ReplaceAll(URL, "https", "http")
	res, err := soup.Get(URL)
	if err != nil {
		panic(err)
		return response, err
	}

	doc := soup.HTMLParse(res)
	links := doc.FindAll("a")
	callbackURL := links[0].Attrs()["href"]

	_, err = replicationProtocol.AuthServiceCompleteFlow(ctx, &protocoltypes.AuthServiceCompleteFlow_Request{
		CallbackURL: callbackURL,
	})
	if err != nil {
		panic(err)
		return response, err
	}

	_, err = replicationProtocol.MultiMemberGroupJoin(ctx, &protocoltypes.MultiMemberGroupJoin_Request{
		Group: invite.GetLink().BertyGroup.Group,
	})

	panic(err)
	return response, err
}

// TestConnection always returns true
func (s *Server) TestConnection(ctx context.Context, request *TestConnection_Request) (response *TestConnection_Response, err error) {
	fmt.Printf("Connection test: %v\n", request.Message)

	return &TestConnection_Response{Success: true}, err
}


