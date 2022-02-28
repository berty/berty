//go:build !windows && !darwin
// +build !windows,!darwin

package main

import (
	"context"
	"encoding/base64"
	"errors"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"runtime"
	"time"

	"github.com/zcalusic/sysinfo"
	"go.uber.org/zap"
	"moul.io/u"

	"berty.tech/berty/v2/go/internal/config"
	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

func main() {
	i := &integration{
		startedAt:    time.Now(),
		previousStep: time.Now(),
		benchmarks:   []benchmark{},
	}

	i.checkErr(i.init(), "init")
	i.checkErr(i.testbotAdd(), "testbot.add")
	// i.checkErr(i.testbotFoo(), "testbot.echo")
	// i.checkErr(i.welcomebotAdd(), "welcomebot.add")
	// i.checkErr(i.testbotBar(), "testbot.bar")
	// i.checkErr(i.testbotBar(), "services.register")
	// i.checkErr(i.testbotBar(), "services.use")
	// i.checkErr(i.rdvpConnect(), "connect-to-rdvp")

	i.cleanup()
	totalDuration := time.Since(i.startedAt)
	fmt.Fprintf(os.Stderr, "[+] finished - %s\n", u.ShortDuration(totalDuration))
	i.addBenchmark("total", totalDuration)
	if i.opts.benchmark {
		fmt.Println(i.benchmarkResult())
	}
}

type integration struct {
	tempdir      string
	startedAt    time.Time
	previousStep time.Time
	manager      initutil.Manager
	logger       *zap.Logger
	ctx          context.Context
	client       messengertypes.MessengerServiceClient
	opts         struct {
		welcomebotAddr string
		testbotAddr    string
		benchmark      bool
	}
	benchmarks []benchmark
}

func (i *integration) init() error {
	var err error
	i.tempdir, err = ioutil.TempDir("", "berty-integration")
	if err != nil {
		return err
	}

	i.manager.Session.Kind = "cli.integration"
	i.manager.Datastore.Dir = i.tempdir
	i.manager.Logging.StderrFormat = "light-color"
	i.manager.Logging.StderrFilters = "debug:bty,bty.inte,bty.tinder" // (level==warn for everything except ipfs.*) || (levels >= error)
	fs := flag.NewFlagSet("integration", flag.ExitOnError)
	fs.StringVar(&i.opts.welcomebotAddr, "integration.welcomebot", config.Config.Berty.Contacts["welcomebot-dev"].Link, "welcomebot addr")
	fs.StringVar(&i.opts.testbotAddr, "integration.testbot", config.Config.Berty.Contacts["testbot-dev"].Link, "testbot addr")
	fs.BoolVar(&i.opts.benchmark, "integration.benchmark", false, "print benchmark result in JSON")
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
	parsed, err := i.client.ParseDeepLink(ctx, &messengertypes.ParseDeepLink_Request{Link: i.opts.testbotAddr})
	if err != nil {
		return err
	}

	// subscribe to events
	s, err := i.client.EventStream(ctx, &messengertypes.EventStream_Request{})
	if err != nil {
		return err
	}
	defer func() {
		if err := s.CloseSend(); err != nil {
			i.logger.Warn("CloseSend failed", zap.Error(err))
		}
	}()

	// send contact request
	_, err = i.client.SendContactRequest(ctx, &messengertypes.SendContactRequest_Request{
		BertyID: parsed.GetLink().GetBertyID(),
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
		case messengertypes.StreamEvent_TypeContactUpdated:
			contact := payload.(*messengertypes.StreamEvent_ContactUpdated).Contact

			if contact.State == messengertypes.Contact_Accepted {
				contactAccepted = true
			}
		case messengertypes.StreamEvent_TypeConversationUpdated:
			conversation := payload.(*messengertypes.StreamEvent_ConversationUpdated).Conversation
			if base64.RawURLEncoding.EncodeToString(parsed.GetLink().GetBertyID().GetAccountPK()) != conversation.ContactPublicKey {
				continue
			}
			conversationReady = true

		case messengertypes.StreamEvent_TypeInteractionUpdated:
			interaction := payload.(*messengertypes.StreamEvent_InteractionUpdated).Interaction

			if interaction.GetType() == messengertypes.AppMessage_TypeUserMessage {
				payload, err := interaction.UnmarshalPayload()
				if err != nil {
					return err
				}
				body := payload.(*messengertypes.AppMessage_UserMessage).Body

				if base64.RawURLEncoding.EncodeToString(parsed.GetLink().GetBertyID().GetAccountPK()) != interaction.Conversation.ContactPublicKey {
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
	i.manager.Close(nil)
	time.Sleep(100 * time.Millisecond)
	if i.tempdir != "" {
		os.RemoveAll(i.tempdir)
	}
}

func (i *integration) checkErr(err error, step string) {
	if err != nil {
		fmt.Fprintf(os.Stderr, "[-] %s: %v - %s\n", step, err, u.ShortDuration(time.Since(i.startedAt)))
		i.cleanup()
		os.Exit(1)
	} else {
		i.addBenchmark(step, time.Since(i.previousStep))
		i.previousStep = time.Now()

		fmt.Fprintf(os.Stderr, "[+] %s - %s\n", step, u.ShortDuration(time.Since(i.startedAt)))
	}
}

func (i *integration) addBenchmark(name string, duration time.Duration) {
	dur := duration.Nanoseconds()
	i.benchmarks = append(i.benchmarks, benchmark{
		Name:       name,
		Iterations: 1,
		TimeUnit:   "ns",
		RealTime:   dur,
		CPUTime:    dur, // FIXME: compute real CPU time
	})
}

type benchmark struct {
	Name       string `json:"name"`
	Iterations int    `json:"iterations"`
	RealTime   int64  `json:"real_time"`
	CPUTime    int64  `json:"cpu_time"`
	TimeUnit   string `json:"time_unit"`
}

func (i *integration) benchmarkResult() string {
	type result struct {
		Context struct {
			Date              string `json:"date"`
			NumCPUs           int    `json:"num_cpus"`
			MhzPerCPU         uint   `json:"mhz_per_cpu"`
			CPUScalingEnabled bool   `json:"cpu_scaling_enabled"`
			LibraryBuildType  string `json:"library_build_type"`
		} `json:"context"`
		Benchmarks []benchmark `json:"benchmarks"`
	}
	res := result{Benchmarks: i.benchmarks}
	res.Context.Date = time.Now().String()
	res.Context.NumCPUs = runtime.NumCPU()
	var si sysinfo.SysInfo
	si.GetSysInfo()
	res.Context.MhzPerCPU = si.CPU.Speed
	res.Context.LibraryBuildType = "debug"
	res.Context.CPUScalingEnabled = false // FIXME: dynamic
	return u.PrettyJSON(res)
}
