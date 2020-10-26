package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"math/rand"
	"os"
	"os/signal"
	"os/user"
	"runtime"
	"strings"
	"sync"
	"time"

	"github.com/gogo/protobuf/proto"
	"github.com/matryer/resync"
	qrterminal "github.com/mdp/qrterminal/v3"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"moul.io/srand"
	"moul.io/u"
	"moul.io/zapconfig"

	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertyversion"
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
		Convs       []*Conversation
		StaffConvPK string
	}
	client           bertymessenger.MessengerServiceClient
	storeIsNew       bool
	storePath        string
	storeConvMap     map[*Conversation]*sync.Mutex
	storeConvMapLock sync.Mutex
	// storeWholeConvLock is a lock where holding it is equivalent to holding all
	// conversations locks.
	storeWholeConvLock sync.RWMutex
	storeMutex         sync.RWMutex
	storeOnce          resync.Once
	isReplaying        bool
	logger             *zap.Logger
}

type Conversation struct {
	ConversationPublicKey string
	ContactPublicKey      string
	ContactDisplayName    string
	Step                  uint
	IsOneToOne            bool
}

// The function returned by LockConversation is the Unlocker.
func (bot *Bot) LockConversation(c *Conversation) func() {
	bot.storeConvMapLock.Lock()
	l, ok := bot.storeConvMap[c]
	if ok {
		goto Done
	}
	{
		var m sync.Mutex
		l = &m
		bot.storeConvMap[c] = l
	}

Done:
	bot.storeConvMapLock.Unlock()
	(*l).Lock()
	bot.storeWholeConvLock.RLock()
	return func() {
		(*l).Unlock()
		bot.storeWholeConvLock.RUnlock()
	}
}

func betabot() error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	flag.Parse()
	rand.Seed(srand.MustSecure())

	// init bot
	bot := &Bot{storeConvMap: make(map[*Conversation]*sync.Mutex)}

	// init logger
	{
		logger, err := zapconfig.Configurator{}.Build()
		if err != nil {
			return fmt.Errorf("build zap logger failed: %w", err)
		}
		bot.logger = logger
	}

	// init store
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
			bot.logger.Info("store loaded from file",
				zap.String("path", *storePath),
				zap.String("staff-conv-pk", bot.store.StaffConvPK),
			)
			for _, conv := range bot.store.Convs {
				bot.logger.Debug("loaded conv from store", zap.Any("meta", conv))
			}
		} else {
			bot.storeIsNew = true
		}
		bot.storePath = *storePath
	}

	// init messenger gRPC client
	{
		bot.logger.Info("connecting to remote berty messenger node", zap.String("addr", *nodeAddr))
		cc, err := grpc.Dial(*nodeAddr, grpc.WithInsecure())
		if err != nil {
			return fmt.Errorf("connect to remote berty messenger node: %w", err)
		}
		bot.client = bertymessenger.NewMessengerServiceClient(cc)
	}

	// get sharing link and print qr code
	{
		req := &bertymessenger.InstanceShareableBertyID_Request{DisplayName: *displayName}
		res, err := bot.client.InstanceShareableBertyID(ctx, req)
		if err != nil {
			return fmt.Errorf("get instance shareable berty ID failed: %w", err)
		}
		bot.logger.Info("retrieve instance Berty ID", zap.String("link", res.HTMLURL))
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
			bot.logger.Warn("missing -staff-conv-link")
			// noop
		case alreadyExistsInStore:
			// noop
			bot.logger.Info("staff conv is already (or should already be) joined")
			// FIXME: or should we join the group again?
		case shouldJoin:
			bot.logger.Info("joining staff conv")
			req := &bertymessenger.ConversationJoin_Request{
				Link: *staffConvLink,
			}
			_, err := bot.client.ConversationJoin(ctx, req)
			if err != nil {
				return fmt.Errorf("conversation join failed: %w", err)
			}

			// store staffConvPk
			link := req.GetLink()
			if link == "" {
				return fmt.Errorf("cannot get link")
			}

			query, method, err := bertymessenger.NormalizeDeepLinkURL(req.Link)
			if err != nil {
				return fmt.Errorf("normalize deeplink failed: %w", err)
			}

			var pdlr *bertymessenger.ParseDeepLink_Reply
			switch method {
			case "/group":
				pdlr, err = bertymessenger.ParseGroupInviteURLQuery(query)
				if err != nil {
					return fmt.Errorf("parse group invite failed: %w", err)
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
			var handledEvents uint
			for {
				gme, err := s.Recv()
				if err != nil {
					cancel()
					bot.logger.Error("stream error", zap.Error(err))
					return
				}

				if bot.isReplaying {
					if gme.Event.Type == bertymessenger.StreamEvent_TypeListEnded {
						bot.logger.Info("finished replaying logs from the previous sessions", zap.Uint("count", handledEvents))
						bot.isReplaying = false
					}
					// replayed events
					// bot.logger.Debug("ignoring already handled event", zap.Any("event", gme))
					handledEvents++
					continue
				}
				// replay is done, let's handle events normally
				wg.Add(1)
				go func() {
					defer wg.Done()
					err := bot.handleEvent(ctx, gme)
					if err != nil {
						bot.logger.Error("handleEvent failed", zap.Error(err))
					}
				}()
			}
		}()
	}

	waitForCtrlC(ctx, cancel)
	wg.Wait()
	bot.saveStore()
	return nil
}

func (bot *Bot) handleEvent(ctx context.Context, gme *bertymessenger.EventStream_Reply) error {
	handlers := map[bertymessenger.StreamEvent_Type]func(ctx context.Context, gme *bertymessenger.EventStream_Reply, payload proto.Message) error{
		bertymessenger.StreamEvent_TypeContactUpdated:      bot.handleContactUpdated,
		bertymessenger.StreamEvent_TypeInteractionUpdated:  bot.handleInteractionUpdated,
		bertymessenger.StreamEvent_TypeConversationUpdated: bot.handleConversationUpdated,
	}

	handler, found := handlers[gme.Event.Type]
	if !found {
		bot.logger.Debug("handling event", zap.Any("event", gme))
		return fmt.Errorf("unhandled event type: %q", gme.Event.Type)
	}

	payload, err := gme.Event.UnmarshalPayload()
	if err != nil {
		return fmt.Errorf("unmarshal payload failed: %w", err)
	}
	bot.logger.Info("handling event", zap.Any("event", gme), zap.Any("payload", payload))

	if err := handler(ctx, gme, payload); err != nil {
		return fmt.Errorf("handler %q error: %w", gme.Event.Type, err)
	}

	return nil
}

func (bot *Bot) handleContactUpdated(ctx context.Context, _ *bertymessenger.EventStream_Reply, payload proto.Message) error {
	// auto-accept contact requests
	contact := payload.(*bertymessenger.StreamEvent_ContactUpdated).Contact

	if contact.State == bertymessenger.Contact_IncomingRequest {
		req := &bertymessenger.ContactAccept_Request{PublicKey: contact.PublicKey}
		_, err := bot.client.ContactAccept(ctx, req)
		if err != nil {
			return fmt.Errorf("contact accept failed: %w", err)
		}
	} else if contact.State == bertymessenger.Contact_Accepted {
		// When contact was established, send message and a group invitation
		time.Sleep(2 * time.Second)
		bot.storeMutex.Lock()
		bot.store.Convs = append(bot.store.Convs, &Conversation{
			ConversationPublicKey: contact.ConversationPublicKey,
			ContactPublicKey:      contact.PublicKey,
			ContactDisplayName:    contact.DisplayName,
			IsOneToOne:            true,
		})
		bot.storeMutex.Unlock()
		bot.saveStore()

		body := `Hey! 🙌 Welcome to the Berty beta version! 🎊
I’m here to help you with the onboarding process.
Let's test out some features together!
Just type 'yes' to let me know you copy that.`
		options := []*bertymessenger.ReplyOption{
			{Payload: "yes", Display: "Sure, go for it!"},
			{Payload: "no", Display: "Show me all you can do instead!"},
		}
		if err := bot.interactUserMessage(ctx, body, contact.ConversationPublicKey, options); err != nil {
			return fmt.Errorf("interact user message failed: %w", err)
		}
	}
	return nil
}

func (bot *Bot) handleUserMessageInteractionUpdated(ctx context.Context, _ *bertymessenger.EventStream_Reply, interaction *bertymessenger.Interaction, payload proto.Message) error {
	if interaction.IsMe || interaction.Acknowledged {
		return nil
	}

	var conv *Conversation
	bot.storeMutex.RLock()
	for i := range bot.store.Convs {
		if bot.store.Convs[i].ConversationPublicKey == interaction.ConversationPublicKey {
			conv = bot.store.Convs[i]
		}
	}
	bot.storeMutex.RUnlock()
	receivedMessage := payload.(*bertymessenger.AppMessage_UserMessage)
	if conv != nil && conv.IsOneToOne {
		unlock := bot.LockConversation(conv)
		success, err := [3]doStepFn{
			doStep0,
			doStep1,
			doStep2,
		}[conv.Step](ctx, conv, bot, receivedMessage, interaction, unlock)
		if err != nil {
			return err
		}
		if success {
			return nil
		}
		// auto-reply to user's messages
		answer := getRandomReply()
		if err := bot.interactUserMessage(ctx, answer, interaction.ConversationPublicKey, defaultReplyOption()); err != nil {
			return fmt.Errorf("interact user message failed: %w", err)
		}
	}
	return nil
}

type doStepFn func(context.Context, *Conversation, *Bot, *bertymessenger.AppMessage_UserMessage, *bertymessenger.Interaction, func()) (bool, error)

func doStep0(ctx context.Context, conv *Conversation, bot *Bot, receivedMessage *bertymessenger.AppMessage_UserMessage, interaction *bertymessenger.Interaction, unlock func()) (bool, error) {
	if checkValidationMessage(receivedMessage.GetBody()) {
		conv.Step++
		unlock()
		bot.saveStore()
		time.Sleep(1 * time.Second)

		body := `Okay, perfect! 🤙
Would you like me to invite you to a group chat to test multimember conversations?
Type 'yes' to receive it! 💌`
		options := []*bertymessenger.ReplyOption{
			{Payload: "yes", Display: "Sure, go for it!"},
			{Payload: "no", Display: "Show me all you can do instead!"},
		}
		if err := bot.interactUserMessage(ctx, body, interaction.ConversationPublicKey, options); err != nil {
			return false, fmt.Errorf("interact user message failed: %w", err)
		}
		return true, nil
	}
	unlock()
	return false, nil
}

func doStep1(ctx context.Context, conv *Conversation, bot *Bot, receivedMessage *bertymessenger.AppMessage_UserMessage, interaction *bertymessenger.Interaction, unlock func()) (bool, error) {
	if checkValidationMessage(receivedMessage.GetBody()) {
		conv.Step++
		unlock()
		bot.saveStore()
		time.Sleep(1 * time.Second)

		body := `Okay, I'm inviting you! 🤝
I'll also invite some staff members to join the group!
I’m cool, but humans are sometimes cooler than me… 🤖 ❤️`
		if err := bot.interactUserMessage(ctx, body, interaction.ConversationPublicKey, nil); err != nil {
			return false, fmt.Errorf("interact user message failed: %w", err)
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
				return false, fmt.Errorf("conversation create failed: %w", err)
			}
			bot.storeMutex.Lock()
			bot.store.Convs = append(bot.store.Convs, &Conversation{
				ConversationPublicKey: createdConv.PublicKey,
				IsOneToOne:            false,
			})
			bot.storeMutex.Unlock()
			bot.saveStore()
		}
		time.Sleep(1 * time.Second)

		body = `Okay, done! 👏 👍
Welcome and thanks for joining our community. You're part of the revolution now! 🔥
Type /help when you need info about available test commands! 📖`
		if err := bot.interactUserMessage(ctx, body, interaction.ConversationPublicKey, defaultReplyOption()); err != nil {
			return false, fmt.Errorf("interact user message failed: %w", err)
		}
		bot.logger.Info("scenario finished")
		return true, nil
	}
	unlock()
	return false, nil
}

func doStep2(ctx context.Context, _ *Conversation, bot *Bot, receivedMessage *bertymessenger.AppMessage_UserMessage, interaction *bertymessenger.Interaction, unlock func()) (bool, error) {
	unlock()
	msg := receivedMessage.GetBody()
	if msg[0] == '/' {
		options := defaultReplyOption()
		switch strings.ToLower(msg[1:]) {
		case "help":
			body := `In this conversation, you can type all theses commands :
/demo group
/demo demo
/demo share
/demo contact "Here is the QR code of manfred, just add him!"
/demo version`
			if err := bot.interactUserMessage(ctx, body, interaction.ConversationPublicKey, options); err != nil {
				return false, fmt.Errorf("interact user message failed: %w", err)
			}
		case "demo version":
			var body string
			if bertyversion.VcsRef == "n/a" {
				body = "berty " + bertyversion.Version + "\n" + runtime.Version()
			} else {
				body = "berty " + bertyversion.Version + " https://github.com/berty/berty/commits/" + bertyversion.VcsRef + "\n" + runtime.Version()
			}
			if err := bot.interactUserMessage(ctx, body, interaction.ConversationPublicKey, options); err != nil {
				return false, fmt.Errorf("interact user message failed: %w", err)
			}
		default:
			body := fmt.Sprintf("Sorry but the command %q is not yet known.", msg)
			if err := bot.interactUserMessage(ctx, body, interaction.ConversationPublicKey, options); err != nil {
				return false, fmt.Errorf("interact user message failed: %w", err)
			}
		}
		return true, nil
	}
	return false, nil
}

func (bot *Bot) handleGroupInvitationInteractionUpdated(ctx context.Context, _ *bertymessenger.EventStream_Reply, interaction *bertymessenger.Interaction, payload proto.Message) error {
	if !interaction.IsMe {
		// auto-accept invitations to group
		receivedInvitation := payload.(*bertymessenger.AppMessage_GroupInvitation)
		_, err := bot.client.ConversationJoin(ctx, &bertymessenger.ConversationJoin_Request{
			Link: receivedInvitation.GetLink(),
		})
		if err != nil {
			return fmt.Errorf("conversation join failed: %w", err)
		}
	}
	return nil
}

func (bot *Bot) handleInteractionUpdated(ctx context.Context, gme *bertymessenger.EventStream_Reply, payload proto.Message) error {
	interaction := payload.(*bertymessenger.StreamEvent_InteractionUpdated).Interaction

	handlers := map[bertymessenger.AppMessage_Type]func(ctx context.Context, gme *bertymessenger.EventStream_Reply, interaction *bertymessenger.Interaction, payload proto.Message) error{
		bertymessenger.AppMessage_TypeUserMessage:     bot.handleUserMessageInteractionUpdated,
		bertymessenger.AppMessage_TypeGroupInvitation: bot.handleGroupInvitationInteractionUpdated,
	}
	handler, found := handlers[interaction.Type]
	if !found {
		return fmt.Errorf("unsupported interaction type: %q", interaction.Type)
	}

	payload, err := interaction.UnmarshalPayload()
	if err != nil {
		return fmt.Errorf("unmarshal interaction payload failed: %w", err)
	}
	bot.logger.Debug("handling interaction", zap.Any("payload", payload))

	if err := handler(ctx, gme, interaction, payload); err != nil {
		return fmt.Errorf("handle %q failed: %w", interaction.Type, err)
	}

	return nil
}

func (bot *Bot) handleConversationUpdated(ctx context.Context, _ *bertymessenger.EventStream_Reply, payload proto.Message) error {
	// send to multimember staff conv that this user join us on Berty with the link of the group
	conversation := payload.(*bertymessenger.StreamEvent_ConversationUpdated).Conversation
	if bot.store.StaffConvPK != "" && strings.HasPrefix(conversation.GetDisplayName(), staffXConvPrefix) {
		userName := strings.TrimPrefix(conversation.GetDisplayName(), staffXConvPrefix)
		body := fmt.Sprintf(
			`Hi guys, we have a new user in our community! 🥳
Say hello to %s! 👍
For the moment i can't send a group invitation so i share the link of the conversation here: %s`,
			userName,
			conversation.GetLink(),
		)
		if err := bot.interactUserMessage(ctx, body, bot.store.StaffConvPK, nil); err != nil {
			return fmt.Errorf("interact user message failed: %w", err)
		}

		// TODO send the group invitation, maybe the group invitation was broken so for the moment i sent the link in a message

		// time.Sleep(2 * time.Second)
		// {
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
	return nil
}

// internal stuff

func (bot *Bot) interactUserMessage(ctx context.Context, body string, conversationPK string, replyOption []*bertymessenger.ReplyOption) error {
	userMessage, err := proto.Marshal(&bertymessenger.AppMessage_UserMessage{Body: body})
	if err != nil {
		return fmt.Errorf("marshal user message failed: %w", err)
	}
	_, err = bot.client.Interact(ctx, &bertymessenger.Interact_Request{
		Type:                  bertymessenger.AppMessage_TypeUserMessage,
		Payload:               userMessage,
		ConversationPublicKey: conversationPK,
	})
	if err != nil {
		return fmt.Errorf("interact user message failed: %w", err)
	}

	// send reply options
	{
		convPKBytes, err := base64.RawURLEncoding.DecodeString(conversationPK)
		if err != nil {
			return fmt.Errorf("conversation convPK failed: %w", err)
		}
		if replyOption != nil {
			_, err := bot.client.SendReplyOptions(ctx, &bertymessenger.SendReplyOptions_Request{
				GroupPK: convPKBytes,
				Options: &bertymessenger.AppMessage_ReplyOptions{
					Options: replyOption,
				},
			})
			if err != nil {
				return fmt.Errorf("interact reply options failed: %w", err)
			}
		}
	}

	return nil
}

func (bot *Bot) saveStore() {
	var done bool
	// Prevent concurrent saves
	bot.storeOnce.Do(func() {
		done = true
		// Prevent data race with a writing goroutine.
		bot.storeMutex.RLock()
		// Prevent data race on conversations
		bot.storeWholeConvLock.Lock()
		// marshal
		data, err := json.MarshalIndent(bot.store, "", "  ")
		if err != nil {
			panic(fmt.Errorf("marshal: %w", err))
		}

		// write file
		if err := ioutil.WriteFile(bot.storePath, data, 0o600); err != nil {
			panic(fmt.Errorf("write store file: %w", err))
		}
	})
	if done {
		// Allow continuation of saves.
		bot.storeOnce.Reset()
		bot.storeWholeConvLock.Unlock()
		bot.storeMutex.RUnlock()
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
	return fmt.Sprintf("%s (betabot)", name)
}

func defaultReplyOption() []*bertymessenger.ReplyOption {
	return []*bertymessenger.ReplyOption{
		{Payload: "/help", Display: "Display betabot commands"},
		{Payload: "/demo version", Display: "What is the demo version?reload"},
	}
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
