package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"math/rand"
	"os"
	"os/signal"
	"os/user"
	"sync"
	"time"

	"github.com/gogo/protobuf/proto"
	qrterminal "github.com/mdp/qrterminal/v3"
	"google.golang.org/grpc"

	"berty.tech/berty/v2/go/pkg/bertymessenger"
)

var (
	nodeAddr    = flag.String("addr", "127.0.0.1:9091", "remote 'berty daemon' address")
	displayName = flag.String("display-name", safeDefaultDisplayName(), "bot's display name")
)

func main() {
	err := betabot()
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %+v\n", err)
		os.Exit(1)
	}
}

func betabot() error {
	flag.Parse()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// open gRPC connection to the remote 'berty daemon' instance
	var messengerClient bertymessenger.MessengerServiceClient
	{
		cc, err := grpc.Dial(*nodeAddr, grpc.WithInsecure())
		if err != nil {
			return fmt.Errorf("cannot connect to remote berty daemon: %w", err)
		}
		messengerClient = bertymessenger.NewMessengerServiceClient(cc)
	}

	// get sharing link
	{
		req := &bertymessenger.InstanceShareableBertyID_Request{DisplayName: *displayName}
		res, err := messengerClient.InstanceShareableBertyID(ctx, req)
		if err != nil {
			return err
		}
		log.Printf("berty id: %s", res.HTMLURL)

		qrterminal.GenerateHalfBlock(res.HTMLURL, qrterminal.L, os.Stdout)
	}

	// event loop
	{
		s, err := messengerClient.EventStream(ctx, &bertymessenger.EventStream_Request{})
		if err != nil {
			return err
		}

		handlerMutex := sync.Mutex{}
		go func() {
			for {
				gme, err := s.Recv()
				if err != nil {
					log.Printf("stream error: %v", err)
				}
				handlerMutex.Lock()
				err = handleEvent(ctx, messengerClient, gme)
				handlerMutex.Unlock()
				if err != nil {
					log.Printf("event handler error: %v", err)
				}
			}
		}()
	}

	waitForCtrlC()
	return nil
}

func handleEvent(ctx context.Context, messengerClient bertymessenger.MessengerServiceClient, gme *bertymessenger.EventStream_Reply) error {
	// parse event's payload
	update, err := gme.Event.UnmarshalPayload()
	if err != nil {
		return err
	}

	switch gme.Event.Type {
	case bertymessenger.StreamEvent_TypeContactUpdated:
		// auto-accept contact requests
		contact := update.(*bertymessenger.StreamEvent_ContactUpdated).Contact
		log.Printf("<<< %s: contact=%q conversation=%q name=%q", gme.Event.Type, contact.PublicKey, contact.ConversationPublicKey, contact.DisplayName)
		if contact.State == bertymessenger.Contact_IncomingRequest {
			req := &bertymessenger.ContactAccept_Request{PublicKey: contact.PublicKey}
			_, err = messengerClient.ContactAccept(ctx, req)
			if err != nil {
				return err
			}
		} else if contact.State == bertymessenger.Contact_Established {
			time.Sleep(5 * time.Second)
			userMessage, err := proto.Marshal(&bertymessenger.AppMessage_UserMessage{
				Body: "Hey! Welcome to the beta!",
			})
			if err != nil {
				return err
			}
			_, err = messengerClient.Interact(ctx, &bertymessenger.Interact_Request{
				Type:                  bertymessenger.AppMessage_TypeUserMessage,
				Payload:               userMessage,
				ConversationPublicKey: contact.ConversationPublicKey,
			})
			if err != nil {
				return err
			}
			time.Sleep(5 * time.Second)
			_, err = messengerClient.ConversationCreate(ctx, &bertymessenger.ConversationCreate_Request{
				DisplayName: "group-bot",
				ContactsToInvite: []string{
					contact.PublicKey,
				},
			})
			if err != nil {
				return err
			}
		}
	case bertymessenger.StreamEvent_TypeInteractionUpdated:
		// auto-reply to user's messages
		interaction := update.(*bertymessenger.StreamEvent_InteractionUpdated).Interaction
		log.Printf("<<< %s: conversation=%q", gme.Event.Type, interaction.ConversationPublicKey)
		if interaction.Type == bertymessenger.AppMessage_TypeUserMessage && !interaction.IsMe && !interaction.Acknowledged {
			answers := []string{
				"Welcome to the beta!",
				"Hello! Welcome to Berty!",
				"Hey, I hope you're feeling well here!",
				"Hi, I'm here for you at anytime for tests!",
				"Hello dude!",
				"Hello :)",
				"Ow, I like to receive test messages <3",
				"What's up ?",
				"How r u ?",
				"Hello, 1-2, 1-2, check, check?!",
				"Do you copy ?",
				"If you say ping, I'll say pong.",
				"I'm faster than you at sending message :)",
				"One day, bots will rules the world. Or not.",
				"You're so cute.",
				"I like discuss with you, I feel more and more clever.",
				"I'm so happy to chat with you.",
				"I could chat with you all day long.",
				"Yes darling ? Can I help you ?",
				"OK, copy that.",
				"OK, I understand.",
				"Hmmm, Hmmmm. One more time ?",
				"I think you're the most clever human I know.",
				"I missed you babe.",
				"OK, don't send me nudes, I'm a bot dude.",
				"Come on, let's party.",
				"May we have a chat about our love relationship future ?",
				"That's cool. I copy.",
			}
			userMessage, err := proto.Marshal(&bertymessenger.AppMessage_UserMessage{
				Body: answers[rand.Intn(len(answers))],
			})
			if err != nil {
				return err
			}

			_, err = messengerClient.Interact(ctx, &bertymessenger.Interact_Request{
				Type:                  bertymessenger.AppMessage_TypeUserMessage,
				Payload:               userMessage,
				ConversationPublicKey: interaction.ConversationPublicKey,
			})
			if err != nil {
				return err
			}
		}
	default:
		log.Printf("<<< %s: ignored", gme.Event.Type)
	}
	return err
}

func waitForCtrlC() {
	signalChannel := make(chan os.Signal, 1)
	signal.Notify(signalChannel, os.Interrupt)
	<-signalChannel
}

func safeDefaultDisplayName() string {
	var name string
	current, err := user.Current()
	if err == nil {
		name = current.Username
	}
	if name == "" {
		name = os.Getenv("USER")
	}
	if name == "" {
		name = "Anonymous4242"
	}
	return fmt.Sprintf("%s (bot)", name)
}
