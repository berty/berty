package main

import (
	"context"
	"encoding/base64"
	"errors"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"time"

	"go.uber.org/zap"
	"moul.io/u"

	"berty.tech/berty/v2/go/internal/config"
	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
)

func main() {
	i := &integration{startedAt: time.Now()}

	i.checkErr(i.init(), "init")
	i.checkErr(i.testbotAdd(), "testbot.add")
	// i.checkErr(i.testbotFoo(), "testbot.echo")
	// i.checkErr(i.betabotAdd(), "betabot.add")
	// i.checkErr(i.testbotBar(), "testbot.bar")
	// i.checkErr(i.testbotBar(), "services.register")
	// i.checkErr(i.testbotBar(), "services.use")
	// i.checkErr(i.rdvpConnect(), "connect-to-rdvp")

	i.cleanup()
	fmt.Printf("[+] finished - %s\n", u.ShortDuration(time.Since(i.startedAt)))
}

type integration struct {
	tempdir   string
	startedAt time.Time
	manager   initutil.Manager
	logger    *zap.Logger
	ctx       context.Context
	client    bertymessenger.MessengerServiceClient
	opts      struct {
		betabotAddr string
		testbotAddr string
	}
}

func (i *integration) init() error {
	var err error
	i.tempdir, err = ioutil.TempDir("", "berty-integration")
	if err != nil {
		return err
	}

	i.manager.Datastore.Dir = i.tempdir
	i.manager.Logging.Format = "light-color"
	i.manager.Logging.Filters = "warn:*,-ipfs.* error+:*" // (level==warn for everything except ipfs.*) || (levels >= error)
	i.manager.Logging.Service = "berty-integration"
	fs := flag.NewFlagSet("integration", flag.ExitOnError)
	fs.StringVar(&i.opts.betabotAddr, "integration.betabot", config.Config.Berty.Contacts["betabot-dev"].Link, "betabot addr")
	fs.StringVar(&i.opts.testbotAddr, "integration.testbot", config.Config.Berty.Contacts["testbot-dev"].Link, "testbot addr")
	i.manager.SetupLoggingFlags(fs)
	i.manager.SetupLocalMessengerServerFlags(fs)
	i.manager.SetupEmptyGRPCListenersFlags(fs)
	if err := fs.Parse(os.Args[1:]); err != nil {
		return err
	}

	logger, err := i.manager.GetLogger()
	if err != nil {
		return err
	}
	i.logger = logger.Named("inte")
	i.logger.Debug("init", zap.Any("opts", i.opts))
	i.ctx = context.Background()
	i.client, err = i.manager.GetMessengerClient()
	if err != nil {
		return err
	}
	return nil
}

func (i *integration) testbotAdd() error {
	ctx, cancel := context.WithTimeout(i.ctx, 60*time.Second)
	defer cancel()

	// parse invite URL
	parsed, err := i.client.ParseDeepLink(ctx, &bertymessenger.ParseDeepLink_Request{Link: i.opts.testbotAddr})
	if err != nil {
		return err
	}

	// subscribe to events
	s, err := i.client.EventStream(ctx, &bertymessenger.EventStream_Request{})
	if err != nil {
		return err
	}
	defer func() {
		if err := s.CloseSend(); err != nil {
			i.logger.Warn("CloseSend failed", zap.Error(err))
		}
	}()

	// send contact request
	_, err = i.client.SendContactRequest(ctx, &bertymessenger.SendContactRequest_Request{
		BertyID: parsed.BertyID,
	})
	if err != nil {
		return err
	}

	var contactAccepted, conversationReady, welcomeReceived bool
	for {
		if contactAccepted && conversationReady && welcomeReceived {
			// this test can be racy, i.e., if we receive more events,
			// but it's not important in the context of this integration test.
			time.Sleep(100 * time.Millisecond)
			// success
			return nil
		}

		ret, err := s.Recv()
		if err != nil {
			if errors.Is(ctx.Err(), context.Canceled) || errors.Is(ctx.Err(), context.DeadlineExceeded) {
				return fmt.Errorf("timeout: %w", err)
			}
			return fmt.Errorf("streaming error: %w", err)
		}

		event := ret.GetEvent()
		payload, err := event.UnmarshalPayload()
		if err != nil {
			return fmt.Errorf("unmarshal: %w", err)
		}

		i.logger.Debug("new event", zap.Any("event", event))

		switch event.GetType() {
		case bertymessenger.StreamEvent_TypeContactUpdated:
			contact := payload.(*bertymessenger.StreamEvent_ContactUpdated).Contact

			if contact.State == bertymessenger.Contact_Accepted {
				contactAccepted = true
			}
		case bertymessenger.StreamEvent_TypeConversationUpdated:
			conversation := payload.(*bertymessenger.StreamEvent_ConversationUpdated).Conversation
			if base64.RawURLEncoding.EncodeToString(parsed.BertyID.AccountPK) != conversation.ContactPublicKey {
				continue
			}
			conversationReady = true

		case bertymessenger.StreamEvent_TypeInteractionUpdated:
			interaction := payload.(*bertymessenger.StreamEvent_InteractionUpdated).Interaction

			if interaction.GetType() == bertymessenger.AppMessage_TypeUserMessage {
				payload, err := interaction.UnmarshalPayload()
				if err != nil {
					return err
				}
				body := payload.(*bertymessenger.AppMessage_UserMessage).Body

				if base64.RawURLEncoding.EncodeToString(parsed.BertyID.AccountPK) != interaction.Conversation.ContactPublicKey {
					continue
				}
				if body != "welcome to testbot1" {
					continue
				}
				welcomeReceived = true
			}

		default:
			// ignore other messages
		}
	}
}

func (i *integration) cleanup() {
	i.manager.Close()
	time.Sleep(100 * time.Millisecond)
	if i.tempdir != "" {
		os.RemoveAll(i.tempdir)
	}
}

func (i *integration) checkErr(err error, step string) {
	if err != nil {
		fmt.Printf("[-] %s: %v - %s\n", step, err, u.ShortDuration(time.Since(i.startedAt)))
		i.cleanup()
		os.Exit(1)
	} else {
		fmt.Printf("[+] %s - %s\n", step, u.ShortDuration(time.Since(i.startedAt)))
	}
}
