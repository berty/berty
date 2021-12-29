package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"math/rand"
	"os"
	"strings"
	"sync"
	"syscall"
	"time"
	"unicode"

	"github.com/gogo/protobuf/proto"
	qrterminal "github.com/mdp/qrterminal/v3"
	"github.com/oklog/run"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"moul.io/srand"
	"moul.io/zapconfig"

	"berty.tech/berty/v2/go/pkg/bertybot"
	"berty.tech/berty/v2/go/pkg/bertyversion"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

var (
	nodeAddr    = flag.String("addr", "127.0.0.1:9091", "remote 'berty daemon' address")
	displayName = flag.String("name", "TwitterBot", "bot's display name")
	debug       = flag.Bool("debug", false, "debug mode")
	logFormat   = flag.String("log-format", "console", strings.Join(zapconfig.AvailablePresets, ", "))
)

func main() {
	flag.Parse()
	rand.Seed(srand.MustSecure())
	if err := Main(); err != nil {
		fmt.Fprintf(os.Stderr, "error: %+v\n", err)
		os.Exit(1)
	}
}

type TwitterBot struct {
	Bot    *bertybot.Bot
	ctx    context.Context
	logger *zap.Logger
}

func Main() error {
	config := zapconfig.Configurator{}
	config.SetPreset(*logFormat)
	logger := config.MustBuild()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// init twitterbot
	twitterbot := &TwitterBot{ctx: ctx, logger: logger}
	if err := twitterbot.InitBot(); err != nil {
		return fmt.Errorf("init bot: %w", err)
	}

	// FIXME: bot1 and bot2 should be contact

	// start testbot
	var g run.Group
	g.Add(func() error { return twitterbot.Bot.Start(ctx) }, func(error) { cancel() })
	g.Add(run.SignalHandler(ctx, syscall.SIGKILL))
	return g.Run()
}

func (twitterbot *TwitterBot) VersionCommand(ctx bertybot.Context) {
	_ = ctx.ReplyString("version: " + bertyversion.Version)
	// FIXME: also returns the version of the remote messenger and protocol
}

type sub struct {
	targets []string
}

type SubData struct {
	Targets []string
}

type SubsData struct {
	Map map[string]*SubData
}

func newSubsData() *SubsData {
	return &SubsData{Map: make(map[string]*SubData)}
}

// InitBot1 initializes the entrypoint bot
func (twitterbot *TwitterBot) InitBot() error {
	logger := twitterbot.logger.Named("bot")

	conf, err := loadConfig("./twitterbot.config.json")
	if err != nil {
		return errors.Wrap(err, "load config")
	}

	bearerToken := conf.BearerToken

	subsMutex := &sync.RWMutex{}
	subs := make(map[string]*sub)
	allNames := make(map[string]struct{})

	dataBytes, err := ioutil.ReadFile("./twitterbot.data.json")
	if err != nil && !os.IsNotExist(err) {
		return errors.Wrap(err, "read data bytes")
	}
	if len(dataBytes) != 0 {
		var subsData SubsData
		if err := json.Unmarshal(dataBytes, &subsData); err != nil {
			return errors.Wrap(err, "unmarshal data")
		}
		for convPK, data := range subsData.Map {
			subs[convPK] = &sub{targets: data.Targets}
			for _, t := range data.Targets {
				allNames[t] = struct{}{}
			}
		}
	}

	saveData := func() {
		subsData := newSubsData()
		for convPK, sub := range subs {
			if _, ok := subsData.Map[convPK]; !ok {
				subsData.Map[convPK] = &SubData{}
			}
			subsData.Map[convPK].Targets = sub.targets
		}
		dataBytes, err := json.Marshal(subsData)
		if err != nil {
			logger.Error("failed to marshal data", zap.Error(err))
			return
		}
		if err := ioutil.WriteFile("./twitterbot.data.json", dataBytes, os.ModePerm); err != nil {
			logger.Error("failed to marshal data", zap.Error(err))
			return
		}
	}

	allNamesSlice := func() []string {
		names := make([]string, len(allNames))
		i := 0
		for name := range allNames {
			names[i] = "from:" + name
			i++
		}
		return names
	}

	ans := allNamesSlice()
	if len(ans) == 0 {
		ans = append(ans, "jenny_web3")
	}

	rule := strings.Join(ans, " OR ")
	if len(rule) > 512 {
		return errors.New("Too many subs")
	}
	ensureRule(bearerToken, "user", rule)

	// init bot
	opts := []bertybot.NewOption{}
	opts = append(opts,
		bertybot.WithLogger(logger.Named("lib")),                               // configure a logger
		bertybot.WithDisplayName(*displayName),                                 // bot name
		bertybot.WithAvatar(logoBytes, "image/png"),                            // bot avatar
		bertybot.WithInsecureMessengerGRPCAddr(*nodeAddr),                      // connect to running berty messenger daemon
		bertybot.WithRecipe(bertybot.AutoAcceptIncomingContactRequestRecipe()), // accept incoming contact requests
		bertybot.WithRecipe(bertybot.AutoAcceptIncomingGroupInviteRecipe()),    // accept incoming group invitations
		bertybot.WithRecipe(bertybot.ReplyRecipe(func(ctx bertybot.Context) string {
			text := ctx.UserMessage
			logger.Info("received", zap.String("text", text))
			if strings.HasPrefix(strings.ToLower(text), "/twitter follow ") {
				subsMutex.Lock()
				defer subsMutex.Unlock()
				newFollow := []string{}
				alreadyFollowed := []string{}
				noSuchUsers := []string{}
				names := strings.TrimFunc(strings.ToLower(text[len("/twitter follow "):]), unicode.IsSpace)
				for _, name := range strings.FieldsFunc(names, unicode.IsSpace) {
					if s, ok := subs[ctx.ConversationPK]; ok {
						found := false
						for _, n := range s.targets {
							if n == name {
								found = true
								break
							}
						}
						if found {
							alreadyFollowed = append(alreadyFollowed, name)
							continue
						} else {
							if err := isValidUsername(bearerToken, name); err != nil {
								noSuchUsers = append(noSuchUsers, name)
								continue
							}
							if _, ok := allNames[name]; !ok {
								allNames[name] = struct{}{}
								rule := strings.Join(allNamesSlice(), " OR ")
								if len(rule) > 512 {
									delete(allNames, name)
									return "Too many subs"
								}
								ensureRule(bearerToken, "user", rule)
							}
							s.targets = append(s.targets, name)
							newFollow = append(newFollow, name)
							continue
						}
					} else {
						if err := isValidUsername(bearerToken, name); err != nil {
							noSuchUsers = append(noSuchUsers, name)
							continue
						}
						if _, ok := allNames[name]; !ok {
							allNames[name] = struct{}{}
							rule := strings.Join(allNamesSlice(), " OR ")
							if len(rule) > 512 {
								delete(allNames, name)
								return "Too many subs"
							}
							ensureRule(bearerToken, "user", rule)
						}
						subs[ctx.ConversationPK] = &sub{targets: []string{name}}
						newFollow = append(newFollow, name)
						continue
					}
				}
				msgs := []string{}
				if len(newFollow) != 0 {
					saveData()
					msgs = append(msgs, fmt.Sprintf("Starting to follow:\n%s", strings.Join(newFollow, ", ")))
				}
				if len(alreadyFollowed) != 0 {
					msgs = append(msgs, fmt.Sprintf("Already following:\n%s", strings.Join(alreadyFollowed, ", ")))
				}
				if len(noSuchUsers) != 0 {
					msgs = append(msgs, fmt.Sprintf("No such user(s):\n%s", strings.Join(noSuchUsers, ", ")))
				}
				return strings.Join(msgs, "\n\n")
			}
			if strings.ToLower(text) == "/twitter list" {
				subsMutex.RLock()
				defer subsMutex.RUnlock()
				sub, ok := subs[ctx.ConversationPK]
				if !ok || len(sub.targets) == 0 {
					return "No subs"
				}
				return fmt.Sprintf("Following:\n%s", strings.Join(sub.targets, ", "))
			}
			return ""
		})), // answer with prices
	)
	if *debug {
		opts = append(opts, bertybot.WithRecipe(bertybot.DebugEventRecipe(logger.Named("debug")))) // debug events
	}
	bot, err := bertybot.New(opts...)
	if err != nil {
		return fmt.Errorf("bot initialization failed: %w", err)
	}
	// display link and qr code
	logger.Info("retrieve instance Berty ID",
		zap.String("pk", bot.PublicKey()),
		zap.String("link", bot.BertyIDURL()),
	)
	qrterminal.GenerateHalfBlock(bot.BertyIDURL(), qrterminal.L, os.Stdout)
	twitterbot.Bot = bot

	go func() {
		for {
			logger.Info("starting new stream")
			limits, err := filteredStream(bearerToken, func(sr *streamReply) error {
				logger.Info("stream reply", zap.Any("sr", sr))

				if sr == nil || sr.Data == nil || sr.Data.Text == "" {
					return errors.New("invalid input")
				}

				subsMutex.RLock()
				defer subsMutex.RUnlock()

				for convPK, sub := range subs {
					found := false
					username := ""
					if sr.Includes != nil && len(sr.Includes.Users) > 0 {
						username = strings.ToLower(sr.Includes.Users[0].Username)
					}
					if username == "" {
						continue
					}
					for _, t := range sub.targets {
						if t == username {
							found = true
							break
						}
					}
					if !found {
						continue
					}
					name := username
					if sr.Includes != nil && len(sr.Includes.Users) > 0 {
						name = sr.Includes.Users[0].Name
					}
					logger.Info("sending", zap.String("conv-pk", convPK), zap.String("text", sr.Data.Text), zap.String("name", name))
					text := fmt.Sprintf("%s (@%s):\n\n%s", name, username, sr.Data.Text)
					userMessage, err := proto.Marshal(&messengertypes.AppMessage_UserMessage{Body: text})
					if err != nil {
						return fmt.Errorf("marshal user message failed: %w", err)
					}
					_, err = bot.Client().Interact(context.TODO(), &messengertypes.Interact_Request{
						Type:                  messengertypes.AppMessage_TypeUserMessage,
						Payload:               userMessage,
						ConversationPublicKey: convPK,
					})
					if err != nil {
						return fmt.Errorf("interact failed: %w", err)
					}
				}

				return nil
			})
			if limits != nil {
				end := time.Unix(int64(limits.Reset), 0)
				dur := time.Until(end)
				logger.Info("rate limit hit, waiting", zap.Duration("remaining", dur), zap.Any("limits", limits))
				time.Sleep(dur)
			} else if err != nil {
				logger.Error("stream error", zap.Error(err))
				time.Sleep(60 * time.Second)
			} else {
				time.Sleep(1 * time.Second)
			}
		}
	}()

	return nil
}
