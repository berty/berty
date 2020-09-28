package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"os"
	"os/signal"
	"os/user"
	"strings"
	"sync"
	"time"

	"github.com/gogo/protobuf/proto"
	qrterminal "github.com/mdp/qrterminal/v3"
	"google.golang.org/grpc"
	"moul.io/srand"
	"moul.io/u"

	"berty.tech/berty/v2/go/pkg/bertymessenger"
)

const (
	staffXConvPrefix = "Berty Staff X "
)

var (
	nodeAddr      = flag.String("addr", "127.0.0.1:9091", "remote 'berty daemon' address")
	displayName   = flag.String("display-name", safeDefaultDisplayName(), "bot's display name")
	staffConvLink = flag.String("staff-conversation-link", "", "link of the staff's conversation to join")
	storePath     = flag.String("store", "./betabot.store", "store file path")
)

func main() {
	if err := betabot(); err != nil {
		fmt.Fprintf(os.Stderr, "error: %+v\n", err)
		os.Exit(1)
	}
}

type Bot struct {
	store struct {
		Convs       []Conversation
		StaffConvPK string
	}
	client      bertymessenger.MessengerServiceClient
	storeIsNew  bool
	storePath   string
	storeMutex  sync.Mutex
	isReplaying bool
}

type Conversation struct {
	ConversationPublicKey string
	ContactPublicKey      string
	ContactDisplayName    string
	Count                 int
	IsOneToOne            bool
}

func betabot() error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	flag.Parse()
	rand.Seed(srand.MustSecure())

	// init bot
	var bot Bot
	{
		// store
		{
			if u.FileExists(*storePath) {
				data, err := ioutil.ReadFile(*storePath)
				if err != nil {
					return fmt.Errorf("read %q: %w", *storePath, err)
				}

				// parse
				err = json.Unmarshal(data, &bot.store)
				if err != nil {
					return fmt.Errorf("parse %q: %w", *storePath, err)
				}
				bot.isReplaying = true // if the db exists on disk, then we switch the bot to replay mode

				// debug
				log.Printf("store loaded from file")
				log.Printf("staff conv pk: %s", bot.store.StaffConvPK)
				for _, conv := range bot.store.Convs {
					log.Printf("- conv: %s", u.JSON(conv))
				}
			} else {
				bot.storeIsNew = true
			}
			bot.storePath = *storePath
		}

		// messenger gRPC client
		{
			cc, err := grpc.Dial(*nodeAddr, grpc.WithInsecure())
			if err != nil {
				return fmt.Errorf("connect to remote berty messenger node: %w", err)
			}
			bot.client = bertymessenger.NewMessengerServiceClient(cc)
		}
	}

	// get sharing link and print qr code
	{
		req := &bertymessenger.InstanceShareableBertyID_Request{DisplayName: *displayName}
		res, err := bot.client.InstanceShareableBertyID(ctx, req)
		if err != nil {
			return err
		}
		log.Printf("berty id: %s", res.HTMLURL)

		qrterminal.GenerateHalfBlock(res.HTMLURL, qrterminal.L, os.Stdout)
	}

	// join staff conversation
	{
		var (
			noFlagProvided       = *staffConvLink == ""
			alreadyExistsInStore = bot.store.StaffConvPK != ""
			shouldJoin           = !noFlagProvided && !alreadyExistsInStore
		)
		switch {
		case noFlagProvided:
			// noop
		case alreadyExistsInStore:
			// noop
			// FIXME: or should we join the group again?
		case shouldJoin:
			req := &bertymessenger.ConversationJoin_Request{
				Link: *staffConvLink,
			}
			_, err := bot.client.ConversationJoin(ctx, req)
			if err != nil {
				return err
			}

			// store staffConvPk
			link := req.GetLink()
			if link == "" {
				return fmt.Errorf("cannot get link")
			}

			query, method, err := bertymessenger.NormalizeDeepLinkURL(req.Link)
			if err != nil {
				return err
			}

			var pdlr *bertymessenger.ParseDeepLink_Reply
			switch method {
			case "/group":
				pdlr, err = bertymessenger.ParseGroupInviteURLQuery(query)
				if err != nil {
					return err
				}
			default:
				return fmt.Errorf("invalid link input")
			}
			bgroup := pdlr.GetBertyGroup()
			gpkb := bgroup.GetGroup().GetPublicKey()
			bot.store.StaffConvPK = base64.RawURLEncoding.EncodeToString(gpkb)
			bot.saveStore()
		}
	}

	// event loop
	var wg sync.WaitGroup
	{
		s, err := bot.client.EventStream(ctx, &bertymessenger.EventStream_Request{})
		if err != nil {
			return fmt.Errorf("failed to listen to EventStream: %w", err)
		}
		wg.Add(1)
		go func() {
			defer wg.Done()
			for {
				gme, err := s.Recv()
				if err != nil {
					cancel()
					log.Printf("stream error: %v", err)
					return
				}

				switch {
				case !bot.isReplaying:
					// replay is done, let's handle events normally
					wg.Add(1)
					go func() {
						defer wg.Done()
						err := bot.handleEvent(ctx, gme)
						if err != nil {
							log.Printf("error: handle event: %v", err)
						}
					}()
				case gme.Event.Type == bertymessenger.StreamEvent_TypeListEnd:
					bot.isReplaying = false
				default:
					// replayed events
					// noop
				}
			}
		}()
	}

	waitForCtrlC(ctx, cancel)
	wg.Wait()
	return nil
}

func (bot *Bot) handleEvent(ctx context.Context, gme *bertymessenger.EventStream_Reply) error {
	switch gme.Event.Type {
	case bertymessenger.StreamEvent_TypeContactUpdated:
		// parse event's payload
		update, err := gme.Event.UnmarshalPayload()
		if err != nil {
			return err
		}
		// auto-accept contact requests
		contact := update.(*bertymessenger.StreamEvent_ContactUpdated).Contact
		log.Printf("<<< %s: contact=%q conversation=%q name=%q", gme.Event.Type, contact.PublicKey, contact.ConversationPublicKey, contact.DisplayName)
		if contact.State == bertymessenger.Contact_IncomingRequest {
			req := &bertymessenger.ContactAccept_Request{PublicKey: contact.PublicKey}
			_, err = bot.client.ContactAccept(ctx, req)
			if err != nil {
				return err
			}
		} else if contact.State == bertymessenger.Contact_Established {
			// When contact was established, send message and a group invitation
			time.Sleep(2 * time.Second)
			bot.store.Convs = append(bot.store.Convs, Conversation{
				ConversationPublicKey: contact.ConversationPublicKey,
				ContactPublicKey:      contact.PublicKey,
				Count:                 0,
				ContactDisplayName:    contact.DisplayName,
				IsOneToOne:            true,
			})
			bot.saveStore()
			userMessage, err := proto.Marshal(&bertymessenger.AppMessage_UserMessage{
				Body: "Hey! 🙌 Welcome to the Berty beta version! 🎊 \nI’m here to help you on the onboarding process.\nLet’s have some little test together.\nOK ? Just type ‘yes’, to let me know you copy that.",
			})
			if err != nil {
				return err
			}
			_, err = bot.client.Interact(ctx, &bertymessenger.Interact_Request{
				Type:                  bertymessenger.AppMessage_TypeUserMessage,
				Payload:               userMessage,
				ConversationPublicKey: contact.ConversationPublicKey,
			})
			if err != nil {
				return err
			}
		}
	case bertymessenger.StreamEvent_TypeInteractionUpdated:
		// parse event's payload
		update, err := gme.Event.UnmarshalPayload()
		if err != nil {
			return err
		}
		interaction := update.(*bertymessenger.StreamEvent_InteractionUpdated).Interaction
		log.Printf("<<< %s: conversation=%q", gme.Event.Type, interaction.ConversationPublicKey)
		switch {
		case interaction.Type == bertymessenger.AppMessage_TypeUserMessage && !interaction.IsMe && !interaction.Acknowledged:
			var conv *Conversation
			for i := range bot.store.Convs {
				if bot.store.Convs[i].ConversationPublicKey == interaction.ConversationPublicKey {
					conv = &bot.store.Convs[i]
				}
			}
			interactionPayload, err := interaction.UnmarshalPayload()
			if err != nil {
				return err
			}
			receivedMessage := interactionPayload.(*bertymessenger.AppMessage_UserMessage)
			log.Printf("userMessage [%s], conv [%v], convs [%v]", receivedMessage.GetBody(), conv, bot.store.Convs)
			if conv != nil && conv.IsOneToOne {
				switch {
				case conv.Count == 0 && checkValidationMessage(receivedMessage.GetBody()):
					conv.Count++
					bot.saveStore()
					time.Sleep(1 * time.Second)
					userMessage, err := proto.Marshal(&bertymessenger.AppMessage_UserMessage{
						Body: "OK, perfect! 🤙\nSo, would you like me to invite you in a group, to test multimember conversations?\nType ‘yes’ to receive it! 💌",
					})
					if err != nil {
						return err
					}
					_, err = bot.client.Interact(ctx, &bertymessenger.Interact_Request{
						Type:                  bertymessenger.AppMessage_TypeUserMessage,
						Payload:               userMessage,
						ConversationPublicKey: interaction.ConversationPublicKey,
					})
					if err != nil {
						return err
					}
				case conv.Count == 1 && checkValidationMessage(receivedMessage.GetBody()):
					conv.Count++
					bot.saveStore()
					time.Sleep(1 * time.Second)
					userMessage, err := proto.Marshal(&bertymessenger.AppMessage_UserMessage{
						Body: "OK, I invite you! 🤝\nAnd I’ll also invite some staff members to join the group!\nI’m cool, but humans are sometimes more cool than me… :) ❤️",
					})
					if err != nil {
						return err
					}
					_, err = bot.client.Interact(ctx, &bertymessenger.Interact_Request{
						Type:                  bertymessenger.AppMessage_TypeUserMessage,
						Payload:               userMessage,
						ConversationPublicKey: interaction.ConversationPublicKey,
					})
					if err != nil {
						return err
					}

					// TODO create with real staff group (in this group, betabot auto-reply will be disable)
					time.Sleep(1 * time.Second)
					{
						// create staff conversation
						createdConv, err := bot.client.ConversationCreate(ctx, &bertymessenger.ConversationCreate_Request{
							DisplayName: staffXConvPrefix + conv.ContactDisplayName,
							ContactsToInvite: []string{
								conv.ContactPublicKey,
							},
						})
						if err != nil {
							return err
						}
						bot.store.Convs = append(bot.store.Convs, Conversation{
							ConversationPublicKey: createdConv.PublicKey,
							IsOneToOne:            false,
						})
						bot.saveStore()
					}

					time.Sleep(1 * time.Second)
					userMessage, err = proto.Marshal(&bertymessenger.AppMessage_UserMessage{
						Body: "OK, it’s done! 👏👍\nWelcome here, and congrats for joining our community! 🔥\nType /help when you need infos about available test commands! 📖",
					})
					if err != nil {
						return err
					}
					_, err = bot.client.Interact(ctx, &bertymessenger.Interact_Request{
						Type:                  bertymessenger.AppMessage_TypeUserMessage,
						Payload:               userMessage,
						ConversationPublicKey: interaction.ConversationPublicKey,
					})
					if err != nil {
						return err
					}
					log.Printf("Scenario finished !%v", bot.store.Convs)
				case conv.Count >= 2 && receivedMessage.GetBody() == "/help":
					userMessage, err := proto.Marshal(&bertymessenger.AppMessage_UserMessage{
						Body: "In this conversation, you can type all theses commands :\n/demo group\n/demo demo\n/demo share\n/demo contact \"Here is the QR code of manfred, just add him!\"",
					})
					if err != nil {
						return err
					}

					_, err = bot.client.Interact(ctx, &bertymessenger.Interact_Request{
						Type:                  bertymessenger.AppMessage_TypeUserMessage,
						Payload:               userMessage,
						ConversationPublicKey: interaction.ConversationPublicKey,
					})
					if err != nil {
						return err
					}
				default:
					// auto-reply to user's messages
					answer := getRandomReply()
					userMessage, err := proto.Marshal(&bertymessenger.AppMessage_UserMessage{
						Body: answer,
					})
					if err != nil {
						return err
					}

					_, err = bot.client.Interact(ctx, &bertymessenger.Interact_Request{
						Type:                  bertymessenger.AppMessage_TypeUserMessage,
						Payload:               userMessage,
						ConversationPublicKey: interaction.ConversationPublicKey,
					})
					if err != nil {
						return err
					}
				}
			}
		case interaction.Type == bertymessenger.AppMessage_TypeGroupInvitation && !interaction.IsMe:
			// auto-accept invitations to group
			interactionPayload, err := interaction.UnmarshalPayload()
			if err != nil {
				return err
			}
			receivedInvitation := interactionPayload.(*bertymessenger.AppMessage_GroupInvitation)
			_, err = bot.client.ConversationJoin(ctx, &bertymessenger.ConversationJoin_Request{
				Link: receivedInvitation.GetLink(),
			})
			if err != nil {
				return err
			}
			log.Printf("GroupInvit: %q", interaction)
			return nil
		}
	case bertymessenger.StreamEvent_TypeConversationUpdated:
		// send to multimember staff conv that this user join us on Berty with the link of the group
		// parse event's payload
		update, err := gme.Event.UnmarshalPayload()
		if err != nil {
			return err
		}
		conversation := update.(*bertymessenger.StreamEvent_ConversationUpdated).Conversation
		log.Printf("<<< %s: conversation=%q", gme.Event.Type, conversation)
		if bot.store.StaffConvPK != "" && strings.HasPrefix(conversation.GetDisplayName(), staffXConvPrefix) {
			userName := strings.TrimPrefix(conversation.GetDisplayName(), staffXConvPrefix)
			userMessage, err := proto.Marshal(&bertymessenger.AppMessage_UserMessage{
				Body: fmt.Sprintf("Hi guys, we have a new user in our community! 🥳\nSay hello to %s! 👍\nFor the moment i can't send a group invitation so i share the link of the conversation here: %s", userName, conversation.GetLink()),
			})
			if err != nil {
				return err
			}
			_, err = bot.client.Interact(ctx, &bertymessenger.Interact_Request{
				Type:                  bertymessenger.AppMessage_TypeUserMessage,
				Payload:               userMessage,
				ConversationPublicKey: bot.store.StaffConvPK,
			})
			if err != nil {
				return err
			}

			// TODO send the group invitation, maybe the group invitation was broken so for the moment i sent the link in a message

			// time.Sleep(2 * time.Second)
			// {
			// 	log.Printf("Link: %s", conversation.GetLink())
			// 	groupInvitation, err := proto.Marshal(&bertymessenger.AppMessage_GroupInvitation{
			// 		Link: conversation.GetLink(),
			// 	})
			// 	if err != nil {
			// 		return err
			// 	}
			// 	_, err = bot.client.Interact(ctx, &bertymessenger.Interact_Request{
			// 		Type:                  bertymessenger.AppMessage_TypeGroupInvitation,
			// 		Payload:               groupInvitation,
			// 		ConversationPublicKey: staffConvPk,
			// 	})
			// 	if err != nil {
			// 		return err
			// 	}
			// }
		}
	default:
		log.Printf("<<< %s: ignored", gme.Event.Type)
	}
	return nil
}

// internal stuff

func (bot *Bot) saveStore() {
	bot.storeMutex.Lock()
	defer bot.storeMutex.Unlock()

	// marshal
	data, err := json.MarshalIndent(bot.store, "", "  ")
	if err != nil {
		panic(fmt.Errorf("marshal: %w", err))
	}

	// write file
	if err := ioutil.WriteFile(bot.storePath, data, 0o600); err != nil {
		panic(fmt.Errorf("write store file: %w", err))
	}
}

func checkValidationMessage(s string) bool {
	switch strings.ToLower(s) {
	case "y", "yes", "yes!":
		return true
	default:
		return false
	}
}

func waitForCtrlC(ctx context.Context, cancel context.CancelFunc) {
	signalChannel := make(chan os.Signal, 1)
	signal.Notify(signalChannel, os.Interrupt)

	select {
	case <-signalChannel:
		cancel()
	case <-ctx.Done():
	}
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

func getRandomReply() string {
	available := []string{
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
	return available[rand.Intn(len(available))] // nolint:gosec // absolutely no importance in this case
}
