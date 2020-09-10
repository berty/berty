package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"sync"

	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/gogo/protobuf/proto"
	"google.golang.org/grpc"
)

func main() {
	err := betabotCommand()

	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}
}

func betabotCommand() error {
	cc, err := grpc.Dial("127.0.0.1:9092", grpc.WithInsecure())
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	messengerClient := bertymessenger.NewMessengerServiceClient(cc)
	protocolClient := bertyprotocol.NewProtocolServiceClient(cc)

	var ctx context.Context

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	config, err := protocolClient.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	accountGroup, err := protocolClient.GroupInfo(ctx, &bertytypes.GroupInfo_Request{
		GroupPK: config.AccountGroupPK,
	})
	if err != nil {
		return errcode.TODO.Wrap(err)
	}
	fmt.Println("Group Info !", pkAsString(accountGroup.Group.PublicKey))

	displayName := safeDefaultDisplayName()
	res, err := messengerClient.InstanceShareableBertyID(ctx, &bertymessenger.InstanceShareableBertyID_Request{
		DisplayName: displayName,
	})
	if err != nil {
		return errcode.TODO.Wrap(err)
	}
	fmt.Println("ShareableBertyId !", res.DeepLink)

	// Accept contact request
	handlerMutex := sync.Mutex{}
	s, err := messengerClient.EventStream(ctx, &bertymessenger.EventStream_Request{})
	if err != nil {
		return errcode.TODO.Wrap(err)
	}
	go func() {
		for {
			gme, err := s.Recv()
			if err != nil {
				log.Printf("error one: %v", err)
			}
			handlerMutex.Lock()
			err = handleBetaBotEvent(ctx, messengerClient, gme)
			handlerMutex.Unlock()
			if err != nil {
				log.Printf("error two: %v", err)
			}
		}
	}()
	WaitForCtrlC()
	return nil
}

func handleBetaBotEvent(ctx context.Context, messengerClient bertymessenger.MessengerServiceClient, gme *bertymessenger.EventStream_Reply) error {
	var err error

	fmt.Println("HandleBetaBotEvent : ", gme.Event.Type)
	switch gme.Event.Type {
	case bertymessenger.StreamEvent_TypeContactUpdated:
		update, e := gme.Event.UnmarshalPayload()
		if e != nil {
			return e
		}
		contact := update.(*bertymessenger.StreamEvent_ContactUpdated).Contact
		if contact.State == bertymessenger.Contact_IncomingRequest {
			pkb, e := stringToBytes(contact.PublicKey)
			if e != nil {
				return fmt.Errorf("pkg err: %w", err)
			}
			_, err = messengerClient.ContactAccept(ctx, &bertymessenger.ContactAccept_Request{PublicKey: bytesToString(pkb)})
		}
	case bertymessenger.StreamEvent_TypeInteractionUpdated:
		update, e := gme.Event.UnmarshalPayload()
		if e != nil {
			return e
		}
		interaction := update.(*bertymessenger.StreamEvent_InteractionUpdated).Interaction
		if interaction.Type == bertymessenger.AppMessage_TypeUserMessage && !interaction.IsMe && !interaction.Acknowledged {
			userMessage, e := proto.Marshal(&bertymessenger.AppMessage_UserMessage{Body: "Welcome to the beta!"})
			if e != nil {
				return e
			}
			_, err = messengerClient.Interact(ctx, &bertymessenger.Interact_Request{
				Type:                  bertymessenger.AppMessage_TypeUserMessage,
				Payload:               userMessage,
				ConversationPublicKey: interaction.ConversationPublicKey,
			})
		}
	}
	return err
}
