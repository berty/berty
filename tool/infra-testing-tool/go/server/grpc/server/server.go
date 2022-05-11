package server

import (
	"bytes"
	"context"
	"encoding/gob"
	"errors"
	"fmt"
	"infratesting/aws"
	"infratesting/config"
	"infratesting/iac/components/networking"
	"infratesting/logging"
	"io"
	"os"
	"strings"
	"sync"
	"time"

	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"github.com/anaskhan96/soup"
	"google.golang.org/grpc"
)

type Server struct {
	Cc        *grpc.ClientConn
	Messenger messengertypes.MessengerServiceClient
	Protocol  protocoltypes.ProtocolServiceClient

	Lock sync.Mutex

	Groups map[string]*protocoltypes.Group

	// group --> test --> bool
	Tests        map[string]map[int64]config.Test
	RunningTests map[string]map[int64]bool

	ReceivingMessages map[string]bool

	DevicePK      []byte
	Messages      map[string][]Message
	LastMessageId map[string][]byte

	Reliability        config.Reliability
	ReliabilityRunning bool
}

// NewServer returns server with initialised internal maps
func NewServer() Server {
	var s Server

	s.Groups = make(map[string]*protocoltypes.Group)
	s.Tests = make(map[string]map[int64]config.Test)
	s.RunningTests = make(map[string]map[int64]bool)

	s.ReceivingMessages = make(map[string]bool)

	s.Messages = make(map[string][]Message)
	s.LastMessageId = make(map[string][]byte)

	return s
}

func (s *Server) mustEmbedUnimplementedProxyServer() {
	logging.Log("unimplemented proxy server")
	panic("implement me")
}

// IsTestRunning checks if a specific test is running at the moment
func (s *Server) IsTestRunning(ctx context.Context, request *IsTestRunning_Request) (response *IsTestRunning_Response, err error) {
	logging.Log(fmt.Sprintf("IsTestRunning - incoming request: %+v", request))

	if s.Groups[request.GroupName] == nil {
		return &IsTestRunning_Response{TestIsRunning: false}, logging.LogErr(errors.New(ErrNotInGroup))
	}

	_, ok := s.Tests[request.GroupName][request.TestN]
	if !ok {
		return response, logging.LogErr(errors.New(ErrTestNotExist))
	}

	return &IsTestRunning_Response{TestIsRunning: s.RunningTests[request.GroupName][request.TestN]}, logging.LogErr(err)
}

// NewTest adds a test to the peers' test memory
func (s *Server) NewTest(ctx context.Context, request *NewTest_Request) (response *NewTest_Response, err error) {
	logging.Log(fmt.Sprintf("NewTest - incoming request: %+v", request))
	response = new(NewTest_Response)

	if s.Groups[request.GroupName] == nil {
		return response, logging.LogErr(errors.New(ErrNotInGroup))
	}

	test := config.Test{
		TypeInternal:     request.Type,
		SizeInternal:     int(request.Size),
		IntervalInternal: int(request.Interval),
		AmountInternal:   int(request.Amount),
	}

	s.Lock.Lock()

	_, ok := s.Tests[request.GroupName]
	if !ok {
		s.Tests[request.GroupName] = make(map[int64]config.Test)
	}

	s.Tests[request.GroupName][request.TestN] = test

	s.Lock.Unlock()

	return response, logging.LogErr(err)
}

// StartTest starts a specific test
func (s *Server) StartTest(ctx context.Context, request *StartTest_Request) (response *StartTest_Response, err error) {
	logging.Log(fmt.Sprintf("StartTest - incoming request: %+v", request))
	response = new(StartTest_Response)

	// checks if test exists
	if s.Tests[request.GroupName][request.TestN] == *new(config.Test) {
		return response, logging.LogErr(errors.New(ErrTestNotExist))
	}

	// checks if test isn't already running
	if s.RunningTests[request.GroupName][request.TestN] {
		return response, logging.LogErr(errors.New(ErrTestInProgress))
	}

	s.Lock.Lock()
	// adds test to local test cache
	test := s.Tests[request.GroupName][request.TestN]

	if s.RunningTests[request.GroupName] == nil {
		s.RunningTests[request.GroupName] = make(map[int64]bool)
	}

	// sets test to running
	s.RunningTests[request.GroupName][request.TestN] = true
	s.Lock.Unlock()

	logging.Log(fmt.Sprintf("starting test: %+v", test))

	time.Sleep(time.Second * 5)

	go func() {
		defer func() {
			s.Lock.Lock()
			defer s.Lock.Unlock()
			// set running state to false when function finishes
			s.RunningTests[request.GroupName][request.TestN] = false
		}()

		var x int
		for x = 0; x < test.AmountInternal; x += 1 {
			switch test.TypeInternal {
			case config.TestTypeText:
				message := ConstructTextMessage(test.SizeInternal)
				err = s.SendTextMessage(request.GroupName, message)
				if err != nil {
					logging.Log(err.Error())
				}

			case config.TestTypeMedia:
				image, err := ConstructImageMessage(test.SizeInternal)
				if err != nil {
					logging.Log(err.Error())
				}

				err = s.SendImageMessage(request.GroupName, image)
				if err != nil {
					logging.Log(err.Error())
				}
			}

			logging.Log(fmt.Sprintf("sent message to group: %s", request.GroupName))
			time.Sleep(time.Second * time.Duration(test.IntervalInternal))
		}

		logging.Log(fmt.Sprintf("sent %d messages to %s\n", x, request.GroupName))
	}()

	return response, logging.LogErr(err)
}

// ConnectToPeer connects to a peer based on the request
func (s *Server) ConnectToPeer(ctx context.Context, request *ConnectToPeer_Request) (response *ConnectToPeer_Response, err error) {
	logging.Log(fmt.Sprintf("ConnectToPeer - incoming request: %+v", request))
	response = new(ConnectToPeer_Response)

	host := fmt.Sprintf("%s:%s", request.Host, request.Port)

	cc, err := grpc.DialContext(ctx, host, grpc.FailOnNonTempDialError(true), grpc.WithInsecure())
	if err != nil {
		return response, logging.LogErr(err)
	}

	s.Cc = cc
	s.Messenger = messengertypes.NewMessengerServiceClient(s.Cc)
	s.Protocol = protocoltypes.NewProtocolServiceClient(s.Cc)

	resp, err := s.Protocol.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
	if err != nil {
		return response, logging.LogErr(err)
	}

	s.DevicePK = resp.DevicePK

	return response, logging.LogErr(err)
}

func (s *Server) UploadLogs(ctx context.Context, request *UploadLogs_Request) (response *UploadLogs_Response, err error) {
	logging.Log(fmt.Sprintf("UploadLogs - incoming request: %+v", request))
	response = new(UploadLogs_Response)

	uploadCount := 0

	path := "/home/ec2-user/logs"
	fileInfo, err := os.ReadDir(path)
	if err != nil {
		return response, logging.LogErr(err)
	}

	for _, file := range fileInfo {
		if !file.IsDir() {
			err = aws.UploadFile(fmt.Sprintf("%s/%s", path, file.Name()), fmt.Sprintf("test-run-%s/%s/%s", request.Folder, request.Name, file.Name()))
			if err != nil {
				return response, logging.LogErr(err)
			}
			uploadCount += 1
		}
	}

	response.UploadCount = int64(uploadCount)

	return response, logging.LogErr(err)
}

// CreateInvite creates an invite and returns the invite blob from the berty protocoltypes api
func (s *Server) CreateInvite(ctx context.Context, request *CreateInvite_Request) (response *CreateInvite_Response, err error) {
	logging.Log(fmt.Sprintf("CreateInvite - incoming request: %+v", request))
	response = new(CreateInvite_Response)

	resCreate, err := s.Protocol.MultiMemberGroupCreate(ctx, &protocoltypes.MultiMemberGroupCreate_Request{})
	if err != nil {
		return response, logging.LogErr(err)
	}

	invite, err := s.Messenger.ShareableBertyGroup(ctx, &messengertypes.ShareableBertyGroup_Request{
		GroupPK:   resCreate.GroupPK,
		GroupName: request.GroupName,
	})
	if err != nil {
		return response, err
	}

	if invite == nil {
		return response, logging.LogErr(errors.New("created invite was of type nil, something else went wrong"))
	}

	s.Lock.Lock()
	s.Groups[request.GroupName] = invite.Link.GetBertyGroup().Group
	s.Lock.Unlock()

	// activate group
	_, err = s.Protocol.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{GroupPK: resCreate.GroupPK})
	if err != nil {
		return response, logging.LogErr(err)
	}

	// encode invite into gob
	var n bytes.Buffer
	enc := gob.NewEncoder(&n)

	err = enc.Encode(invite)
	if err != nil {
		return response, logging.LogErr(err)
	}

	return &CreateInvite_Response{Invite: n.Bytes()}, err
}

// JoinGroup takes in the invite blob from the berty protocol api and join the group
func (s *Server) JoinGroup(ctx context.Context, request *JoinGroup_Request) (response *JoinGroup_Response, err error) {
	logging.Log(fmt.Sprintf("JoinGroup - incoming request: %+v", request))
	response = new(JoinGroup_Response)

	if s.Groups[request.GroupName] != nil {
		return response, logging.LogErr(errors.New(ErrAlreadyInGroup))
	}

	// decode gob into invite
	n := bytes.NewBuffer(request.Invite)
	dec := gob.NewDecoder(n)

	var invite messengertypes.ShareableBertyGroup_Reply
	err = dec.Decode(&invite)
	if err != nil {
		return response, logging.LogErr(err)
	}

	link := invite.GetLink()
	_, err = s.Protocol.MultiMemberGroupJoin(ctx, &protocoltypes.MultiMemberGroupJoin_Request{
		Group: link.BertyGroup.GetGroup(),
	})
	if err != nil {
		return response, logging.LogErr(err)
	}

	// activate group
	_, err = s.Protocol.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{GroupPK: invite.Link.GetBertyGroup().Group.PublicKey})
	if err != nil {
		return response, logging.LogErr(err)
	}

	s.Lock.Lock()
	s.Groups[request.GroupName] = invite.Link.GetBertyGroup().Group
	s.Lock.Unlock()

	return response, logging.LogErr(err)
}

// StartReceiveMessage starts a goroutine on the server that reads messages in a specific group
func (s *Server) StartReceiveMessage(ctx context.Context, request *StartReceiveMessage_Request) (response *StartReceiveMessage_Response, err error) {
	logging.Log(fmt.Sprintf("StartReveiveMessage - incoming request: %+v", request))
	response = new(StartReceiveMessage_Response)

	if s.Groups[request.GroupName] == nil {
		return response, logging.LogErr(errors.New(ErrNotInGroup))
	}

	if s.ReceivingMessages[request.GroupName] {
		logging.Log(ErrAlreadyReceiving)
		return response, nil
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
				logging.Log(err.Error())
			}

			for {
				evt, err := cl.Recv()
				if err != nil {
					if err != io.EOF {
						logging.Log(err.Error())
					}
					break
				}

				// this doesn't work  ??
				if !s.ReceivingMessages[request.GroupName] {
					logging.Log(fmt.Sprintf("done receiving messages in group %s", request.GroupName))
					break
				}

				_, am, err := messengertypes.UnmarshalAppMessage(evt.GetMessage())
				if err != nil {
					logging.Log(err.Error())
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

						if isDupe {
							break
						}
					}

					wg.Wait()

					s.Lock.Lock()
					if !isDupe {
						// prepend
						// we prepend instead of append to make dupes be detected faster
						logging.Log(fmt.Sprintf("received message: %s", currentMessage.PayloadHash))
						s.Messages[request.GroupName] = append([]Message{currentMessage}, s.Messages[request.GroupName]...)
					}
					s.Lock.Unlock()
				}

			}
			time.Sleep(time.Second * 1)
		}
	}()

	return response, logging.LogErr(err)
}

// StopReceiveMessage stops the receiving goroutine
func (s *Server) StopReceiveMessage(ctx context.Context, request *StopReceiveMessage_Request) (response *StopReceiveMessage_Response, err error) {
	logging.Log(fmt.Sprintf("StopReceiveMessage - incoming request: %+v", request))
	response = new(StopReceiveMessage_Response)

	if s.Groups[request.GroupName] == nil {
		return response, logging.LogErr(errors.New(ErrNotInGroup))
	}

	s.Lock.Lock()
	s.ReceivingMessages[request.GroupName] = false
	s.Lock.Unlock()

	return response, logging.LogErr(err)
}

// AddReplication ready's a replication server by contacting the token server.
func (s *Server) AddReplication(ctx context.Context, request *AddReplication_Request) (response *AddReplication_Response, err error) {
	logging.Log(fmt.Sprintf("AddReplication - incoming request: %+v", request))
	response = new(AddReplication_Response)

	initFlowResp, err := s.Protocol.AuthServiceInitFlow(ctx, &protocoltypes.AuthServiceInitFlow_Request{
		AuthURL: fmt.Sprintf("http://%s:%v", request.TokenIp, networking.ReplPort),
	})
	if err != nil {
		return response, logging.LogErr(err)
	}

	URL := initFlowResp.URL
	URL = strings.ReplaceAll(URL, "https", "http")
	res, err := soup.Get(URL)
	if err != nil {
		return response, logging.LogErr(err)
	}

	doc := soup.HTMLParse(res)
	links := doc.FindAll("a")
	callbackURL := links[0].Attrs()["href"]

	_, err = s.Protocol.AuthServiceCompleteFlow(ctx, &protocoltypes.AuthServiceCompleteFlow_Request{
		CallbackURL: callbackURL,
	})

	return response, logging.LogErr(err)
}

// TestConnection always returns true
func (s *Server) TestConnection(ctx context.Context, request *TestConnection_Request) (response *TestConnection_Response, err error) {
	logging.Log(fmt.Sprintf("TestConnection - incoming request: %+v", request))
	// response = new(TestConnection_Response)

	return &TestConnection_Response{Success: true}, err
}

// TestConnectionToPeer always returns true
func (s *Server) TestConnectionToPeer(ctx context.Context, request *TestConnectionToPeer_Request) (response *TestConnectionToPeer_Response, err error) {
	logging.Log(fmt.Sprintf("TestConnectionToPeer - incoming request: %+v", request))
	response = new(TestConnectionToPeer_Response)

	host := fmt.Sprintf("%s:%s", request.Host, request.Port)

	var count int
	for {

		cc, err := grpc.DialContext(ctx, host, grpc.FailOnNonTempDialError(true), grpc.WithInsecure())
		if err != nil {
			logging.Log(err.Error())
		}

		temp := protocoltypes.NewProtocolServiceClient(cc)
		_, err = temp.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
		if err != nil {
			if count > int(request.Tries) {
				return response, logging.LogErr(err)
			} else {
				count += 1
				time.Sleep(time.Second * 5)
			}
		} else {
			break
		}
	}

	return &TestConnectionToPeer_Response{Success: true}, err
}

func (s *Server) AddReliability(ctx context.Context, request *AddReliability_Request) (response *AddReliability_Response, err error) {
	logging.Log(fmt.Sprintf("AddReliability - incoming request: %+v", request))
	response = new(AddReliability_Response)

	s.Reliability.Odds = request.Odds
	s.Reliability.Timeout = request.Timeout

	s.ReliabilityRunning = true

	return response, err
}
