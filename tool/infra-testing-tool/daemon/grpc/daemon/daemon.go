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
	log "github.com/sirupsen/logrus"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"infratesting/aws"
	"infratesting/config"
	"io"
	"os"
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

var logger *zap.Logger

func init() {
	var err error
	logger, err = NewLogger()
	if err != nil {
		panic(err)
	}

}


func NewLogger() (*zap.Logger, error) {
	cfg := zap.NewProductionConfig()
	cfg.OutputPaths = []string {
		"/home/ec2-user/logs/infra-daemon.log",
	}

	return cfg.Build()
}

func wrapError(err error) error {
	if err != nil {
		logger.Info(err.Error())
		return errors.New(fmt.Sprintf("internal gRPC err: %s\n", err.Error()))
	}

	return nil
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


	logger.Info("new server created")
	return s
}

func (s *Server) mustEmbedUnimplementedProxyServer() {
	logger.Error("unimplemented proxy server")
	panic("implement me")
}

// IsTestRunning checks if a specific test is running at the moment
func (s *Server) IsTestRunning(ctx context.Context, request *IsTestRunning_Request) (response *IsTestRunning_Response, err error) {
	logger.Info(fmt.Sprintf("IsTestRunning - incoming request: %+v", request))

	if s.Groups[request.GroupName] == nil {
		return &IsTestRunning_Response{TestIsRunning: false}, wrapError(err)
	}

	if s.Tests[request.GroupName][request.TestName] == *new(config.Test) {
		return response, wrapError(errors.New(ErrTestNotExist))
	}

	return &IsTestRunning_Response{TestIsRunning: s.RunningTests[request.GroupName][request.TestName]}, wrapError(err)
}

// NewTest adds a test to the peers' test memory
func (s *Server) NewTest(ctx context.Context, request *NewTest_Request) (response *NewTest_Response, err error) {
	logger.Info(fmt.Sprintf("NewTest - incoming request: %+v", request))
	response = new(NewTest_Response)

	if s.Groups[request.GroupName] == nil {
		return response, wrapError(errors.New(ErrNotInGroup))
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

	return response, wrapError(err)
}

// StartTest starts a specific test
func (s *Server) StartTest(ctx context.Context, request *StartTest_Request) (response *StartTest_Response, err error) {
	logger.Info(fmt.Sprintf("StartTest - incoming request: %+v", request))
	response = new(StartTest_Response)

	if s.Tests[request.GroupName][request.TestName] == *new(config.Test) {
		return response, wrapError(errors.New(ErrTestNotExist))
	}

	if s.RunningTests[request.GroupName][request.TestName] == true {
		return response, wrapError(errors.New(ErrTestInProgress))
	}

	duration := int(request.GetDuration())
	test := s.Tests[request.GroupName][request.TestName]


	s.Lock.Lock()
	if s.RunningTests[request.GroupName] == nil {
		s.RunningTests[request.GroupName] = make(map[string]bool)
	}

	s.RunningTests[request.GroupName][request.TestName] = true

	s.Lock.Unlock()

	logger.Info(fmt.Sprintf("starting test: %+v", test))

	go func() {
		// set running state to false
		defer func() {
			s.RunningTests[request.GroupName][request.TestName] = false
		}()


		var x int
		for x = 0; x < duration; x += 1 {
			err = s.SendMessage(request.GroupName, ConstructMessage(test.SizeInternal))
			if err != nil {
				_ = wrapError(err)
			}
			logger.Info(fmt.Sprintf("sent message to group: %s", request.GroupName))
			time.Sleep(time.Second * time.Duration(test.IntervalInternal))
		}

		logger.Info(fmt.Sprintf("sent %d messages to %s\n",x ,  request.GroupName))


	}()

	return response, wrapError(err)
}


// ConnectToPeer connects to a peer based on the request
func (s *Server) ConnectToPeer(ctx context.Context, request *ConnectToPeer_Request) (response *ConnectToPeer_Response, err error) {
	logger.Info(fmt.Sprintf("ConnectToPeer - incoming request: %+v", request))
	response = new(ConnectToPeer_Response)

	host := fmt.Sprintf("%s:%s", request.Host, request.Port)

	cc, err := grpc.DialContext(ctx, host, grpc.FailOnNonTempDialError(true), grpc.WithInsecure())
	if err != nil {
		return response, wrapError(err)
	}

	s.Cc = cc
	s.Messenger = messengertypes.NewMessengerServiceClient(s.Cc)
	s.Protocol = protocoltypes.NewProtocolServiceClient(s.Cc)

	resp, err := s.Protocol.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
	if err != nil {
		return response, wrapError(err)
	}

	s.DevicePK = resp.DevicePK

	return response, wrapError(err)
}

func (s *Server) UploadLogs(ctx context.Context, request *UploadLogs_Request) (response *UploadLogs_Response, err error) {
	logger.Info(fmt.Sprintf("UploadLogs - incoming request: %+v", request))
	response = new(UploadLogs_Response)

	uploadCount := 0

	path := "/home/ec2-user/logs"
	fileInfo, err := os.ReadDir(path)
	if err != nil {
		return response, wrapError(err)
	}

	for _, file := range fileInfo {
		if !file.IsDir() {
			err = aws.UploadFile(fmt.Sprintf("%s/%s", path, file.Name()), fmt.Sprintf("test-%s/instance-%s/%s", request.Folder, request.Name, file.Name()))
			if err != nil {
				return response, wrapError(err)
			}
			uploadCount += 1
		}
	}

	response.UploadCount = int64(uploadCount)

	return response, wrapError(err)
}

// CreateInvite creates an invite and returns the invite blob from the berty protocoltypes api
func (s *Server) CreateInvite(ctx context.Context, request *CreateInvite_Request) (response *CreateInvite_Response, err error) {
	logger.Info(fmt.Sprintf("CreateInvite - incoming request: %+v", request))
	response = new(CreateInvite_Response)

	resCreate, err := s.Protocol.MultiMemberGroupCreate(ctx, &protocoltypes.MultiMemberGroupCreate_Request{})
	if err != nil {
		return response, wrapError(err)
	}

	invite, err := s.Messenger.ShareableBertyGroup(ctx, &messengertypes.ShareableBertyGroup_Request{
		GroupPK: resCreate.GroupPK,
		GroupName: request.GroupName,
	})

	if invite == nil {
		return response, wrapError(errors.New("created invite was of type nil, something went wrong"))
	}

	s.Lock.Lock()
	s.Groups[request.GroupName] = invite.Link.GetBertyGroup().Group
	s.Lock.Unlock()

	// activate group
	_, err = s.Protocol.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{GroupPK: resCreate.GroupPK})
	if err != nil {
		return response, wrapError(err)
	}

	// encode invite into gob
	var n bytes.Buffer
	enc := gob.NewEncoder(&n)

	err = enc.Encode(invite)
	if err != nil {
		return response, wrapError(err)
	}

	return &CreateInvite_Response{Invite: n.Bytes()}, err
}

// JoinGroup takes in the invite blob from the berty protocol api and join the group
func (s *Server) JoinGroup(ctx context.Context, request *JoinGroup_Request) (response *JoinGroup_Response, err error) {
	logger.Info(fmt.Sprintf("JoinGroup - incoming request: %+v", request))
	response = new(JoinGroup_Response)

	if s.Groups[request.GroupName] != nil {
		return response, wrapError(errors.New(ErrAlreadyInGroup))
	}

	// decode gob into invite
	n := bytes.NewBuffer(request.Invite)
	dec := gob.NewDecoder(n)

	var invite messengertypes.ShareableBertyGroup_Reply
	err = dec.Decode(&invite)
	if err != nil {
		return response, wrapError(err)
	}

	link := invite.GetLink()
	_, err = s.Protocol.MultiMemberGroupJoin(ctx, &protocoltypes.MultiMemberGroupJoin_Request{
		Group: link.BertyGroup.GetGroup(),
	})
	if err != nil {
		return response, wrapError(err)
	}

	// activate group
	_, err = s.Protocol.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{GroupPK: invite.Link.GetBertyGroup().Group.PublicKey})
	if err != nil {
		return response, wrapError(err)
	}

	s.Lock.Lock()
	s.Groups[request.GroupName] = invite.Link.GetBertyGroup().Group
	s.Lock.Unlock()

	return response, wrapError(err)
}

// StartReceiveMessage starts a goroutine on the server that reads messages in a specific group
func (s *Server) StartReceiveMessage(ctx context.Context, request *StartReceiveMessage_Request) (response *StartReceiveMessage_Response,err  error) {
	logger.Info(fmt.Sprintf("StartReveiveMessage - incoming request: %+v", request))
	response = new(StartReceiveMessage_Response)

	if s.Groups[request.GroupName] == nil {
		return response, wrapError(errors.New(ErrNotInGroup))
	}

	if s.ReceivingMessages[request.GroupName] == true {
		return response, wrapError(errors.New(ErrAlreadyReceiving))
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
				_ = wrapError(err)
			}

			for {
				evt, err := cl.Recv()
				if err != nil {
					if err != io.EOF {
						_ = wrapError(err)
					}
					break
				}

				// this doesn't work  ??
				if s.ReceivingMessages[request.GroupName] == false {
					logger.Info(fmt.Sprintf("done receiving messages in group %s", request.GroupName))
					break
				}

				_, am, err := messengertypes.UnmarshalAppMessage(evt.GetMessage())
				if err != nil {
					 _ = wrapError(err).Error()
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
						s.Messages[request.GroupName] = append([]Message{currentMessage}, s.Messages[request.GroupName]...)
					}
					s.Lock.Unlock()
				}

			}
			time.Sleep(time.Second * 1)
		}
	}()

	return response, wrapError(err)
}

// StopReceiveMessage stops the receiving goroutine
func (s *Server) StopReceiveMessage(ctx context.Context, request *StopReceiveMessage_Request) (response *StopReceiveMessage_Response, err error) {
	logger.Info(fmt.Sprintf("StopReceiveMessage - incoming request: %+v", request))
	response = new(StopReceiveMessage_Response)

	if s.Groups[request.GroupName] == nil {
		return response, wrapError(errors.New(ErrNotInGroup))
	}

	s.Lock.Lock()
	s.ReceivingMessages[request.GroupName] = false
	s.Lock.Unlock()

	return response, wrapError(err)
}

// AddReplication ready's a replication server by contacting the token server.
func (s *Server) AddReplication(ctx context.Context, request *AddReplication_Request) (response *AddReplication_Response,err error) {
	logger.Info(fmt.Sprintf("AddReplication - incoming request: %+v", request))
	response = new(AddReplication_Response)

	initFlowResp, err := s.Protocol.AuthServiceInitFlow(ctx, &protocoltypes.AuthServiceInitFlow_Request{
		AuthURL: fmt.Sprintf("http://%s:8091", request.TokenIp),
	})
	if err != nil {
		return response, wrapError(err)
	}

	URL := initFlowResp.URL
	URL = strings.ReplaceAll(URL, "https", "http")
	res, err := soup.Get(URL)
	if err != nil {
		return response, wrapError(err)
	}

	doc := soup.HTMLParse(res)
	links := doc.FindAll("a")
	callbackURL := links[0].Attrs()["href"]

	_, err = s.Protocol.AuthServiceCompleteFlow(ctx, &protocoltypes.AuthServiceCompleteFlow_Request{
		CallbackURL: callbackURL,
	})

	return response, wrapError(err)
}

// TestConnection always returns true
func (s *Server) TestConnection(ctx context.Context, request *TestConnection_Request) (response *TestConnection_Response, err error) {
	logger.Info(fmt.Sprintf("TestConnection - incoming request: %+v", request))
	response = new(TestConnection_Response)

	return &TestConnection_Response{Success: true}, err
}


