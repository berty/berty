package main

import (
	"context"
	"encoding/base64"
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"berty.tech/berty/v2/go/pkg/bertylinks"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"

	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	"github.com/oklog/run"
	"github.com/peterbourgon/ff/v3/ffcli"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
)

// flags
var (
	rootFlagSet = flag.NewFlagSet("client", flag.ExitOnError)

	hostaddr = rootFlagSet.String("host", "127.0.0.1:9091", "berty daemon addr")
	verbose  = rootFlagSet.Bool("v", false, "increase log verbosity")

	groupFlagSet = flag.NewFlagSet("group", flag.ExitOnError)
	groupPK      = groupFlagSet.String("pk", "", "group pk (base64)")
	groupName    = groupFlagSet.String("name", "some group", "group name")
	groupLink    = groupFlagSet.String("link", "", "group link")

	contactFlagSet = flag.NewFlagSet("contact", flag.ExitOnError)
	contactLink    = contactFlagSet.String("link", "", "shareable url")
)

type client struct {
	logger *zap.Logger

	messenger messengertypes.MessengerServiceClient
	protocol  protocoltypes.ProtocolServiceClient
}

func (c *client) contactShare(ctx context.Context) error {
	res, err := c.messenger.InstanceShareableBertyID(ctx, &messengertypes.InstanceShareableBertyID_Request{})
	if err != nil {
		return err
	}

	fmt.Println(res.GetWebURL())

	return nil
}

func (c *client) contactRequest(ctx context.Context, weburl string) error {
	_, err := c.messenger.ContactRequest(ctx, &messengertypes.ContactRequest_Request{
		Link: weburl,
	})

	return err
}

// @TODO(gfanton): contact accept all

func (c *client) groupNew(ctx context.Context) error {
	res, err := c.protocol.MultiMemberGroupCreate(ctx, &protocoltypes.MultiMemberGroupCreate_Request{})
	if err != nil {
		return err
	}

	gpk := base64.RawStdEncoding.EncodeToString(res.GroupPK)
	fmt.Println(gpk)

	return nil
}

func (c *client) groupShare(ctx context.Context, name, base64pk string) error {
	gpk, err := base64.RawStdEncoding.DecodeString(base64pk)
	if err != nil {
		return fmt.Errorf("unable to decode b64 pk: %w", err)
	}

	res, err := c.messenger.ShareableBertyGroup(ctx, &messengertypes.ShareableBertyGroup_Request{
		GroupPK:   gpk,
		GroupName: name,
	})
	if err != nil {
		return err
	}

	fmt.Println(res.GetWebURL())

	return nil
}

func (c *client) groupJoin(ctx context.Context, url string) error {
	link, err := bertylinks.UnmarshalLink(url, nil) // FIXME: support passing an optional passphrase to decrypt the link
	if err != nil {
		return fmt.Errorf("unalbe to unmarshal link: %w", err)
	}
	if !link.IsGroup() {
		return fmt.Errorf("provided link is not a group")
	}

	_, err = c.protocol.MultiMemberGroupJoin(ctx, &protocoltypes.MultiMemberGroupJoin_Request{
		Group: link.GetBertyGroup().GetGroup(),
	})

	return err
}

// main
func main() {
	args := os.Args[1:]

	// parse root flags to get verbose level
	if err := rootFlagSet.Parse(args); err != nil {
		log.Fatalf("unable to parse roots flags: %s", err)
	}

	// init logger
	logger := initLogger(*verbose)
	defer logger.Sync()

	// groups
	groupNew := &ffcli.Command{
		Name:    "new",
		FlagSet: groupFlagSet,
		Exec: func(ctx context.Context, args []string) error {
			c, err := getClient(ctx, logger, *hostaddr)
			if err != nil {
				return err
			}

			return c.groupNew(ctx)
		},
	}

	groupShare := &ffcli.Command{
		Name:       "share",
		ShortUsage: "share -pk <group_pk> [-name group_name]",
		FlagSet:    groupFlagSet,
		Exec: func(ctx context.Context, args []string) error {
			c, err := getClient(ctx, logger, *hostaddr)
			if err != nil {
				return err
			}

			if *groupPK == "" {
				return fmt.Errorf("group pk cannot be empty - %w", flag.ErrHelp)
			}

			return c.groupShare(ctx, *groupName, *groupPK)
		},
	}

	groupJoin := &ffcli.Command{
		Name:       "join",
		ShortUsage: "join -link <group_link>",
		FlagSet:    groupFlagSet,
		Exec: func(ctx context.Context, args []string) error {
			c, err := getClient(ctx, logger, *hostaddr)
			if err != nil {
				return err
			}

			if *groupLink == "" {
				return fmt.Errorf("group link cannot be empty - %w", flag.ErrHelp)
			}

			return c.groupJoin(ctx, *groupLink)
		},
	}

	group := &ffcli.Command{
		Name:        "group",
		ShortUsage:  "client group",
		FlagSet:     groupFlagSet,
		Subcommands: []*ffcli.Command{groupNew, groupShare, groupJoin},
		Exec: func(ctx context.Context, args []string) error {
			if len(args) == 0 {
				return flag.ErrHelp
			}

			return fmt.Errorf("invalid command - %w", flag.ErrHelp)
		},
	}

	// contacts
	contactShare := &ffcli.Command{
		Name:       "share",
		ShortUsage: "client share",
		Exec: func(ctx context.Context, args []string) error {
			c, err := getClient(ctx, logger, *hostaddr)
			if err != nil {
				return err
			}

			return c.contactShare(ctx)
		},
	}

	contactRequest := &ffcli.Command{
		Name:       "link",
		ShortUsage: "client contact request -link <contact_link>",
		FlagSet:    contactFlagSet,
		Exec: func(ctx context.Context, args []string) error {
			c, err := getClient(ctx, logger, *hostaddr)
			if err != nil {
				return err
			}

			if *contactLink == "" {
				return fmt.Errorf("invalid link - %w", flag.ErrHelp)
			}

			return c.contactRequest(ctx, *contactLink)
		},
	}

	contact := &ffcli.Command{
		Name:        "contact",
		ShortUsage:  "client contact",
		FlagSet:     contactFlagSet,
		Subcommands: []*ffcli.Command{contactRequest, contactShare},
		Exec: func(ctx context.Context, args []string) error {
			if len(args) == 0 {
				return flag.ErrHelp
			}

			return fmt.Errorf("invalid command - %w", flag.ErrHelp)
		},
	}

	// root
	root := &ffcli.Command{
		Name:        "client",
		ShortUsage:  "client [flags] <subcommand>",
		FlagSet:     rootFlagSet,
		Subcommands: []*ffcli.Command{contact, group},
		Exec: func(ctx context.Context, args []string) error {
			if len(args) == 0 {
				return flag.ErrHelp
			}

			return fmt.Errorf("invalid command - %w", flag.ErrHelp)
		},
	}

	// create process context
	processCtx, processCancel := context.WithCancel(context.Background())
	var process run.Group
	{
		// handle interrupt signals
		execute, interrupt := run.SignalHandler(processCtx, os.Interrupt)
		process.Add(execute, interrupt)

		// add root command to process
		process.Add(func() error {
			return root.ParseAndRun(processCtx, args)
		}, func(error) {
			processCancel()
		})
	}

	// start process
	switch err := process.Run(); err {
	case flag.ErrHelp, nil: // ok
	case context.Canceled, context.DeadlineExceeded:
		logger.Fatal("interrupted", zap.Error(err))
	default:
		logger.Fatal(err.Error())
	}
}

func getClient(ctx context.Context, logger *zap.Logger, host string) (*client, error) {
	ctl := grpc_zap.CodeToLevel(func(c codes.Code) zapcore.Level {
		return zapcore.DebugLevel
	})

	cc, err := grpc.DialContext(ctx, host,
		grpc.FailOnNonTempDialError(true),
		grpc.WithInsecure(),
		grpc.WithUnaryInterceptor(grpc_zap.UnaryClientInterceptor(logger, grpc_zap.WithLevels(ctl))),
		grpc.WithStreamInterceptor(grpc_zap.StreamClientInterceptor(logger, grpc_zap.WithLevels(ctl))))

	if err != nil {
		return nil, err
	}

	return &client{
		logger:    logger,
		protocol:  protocoltypes.NewProtocolServiceClient(cc),
		messenger: messengertypes.NewMessengerServiceClient(cc),
	}, nil
}

func initLogger(verbose bool) *zap.Logger {
	var level zapcore.Level
	if verbose {
		level = zapcore.DebugLevel
	} else {
		level = zapcore.InfoLevel
	}

	encodeConfig := zap.NewDevelopmentEncoderConfig()
	encodeConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	encodeConfig.EncodeTime = zapcore.TimeEncoderOfLayout(time.Stamp)
	consoleEncoder := zapcore.NewConsoleEncoder(encodeConfig)
	consoleDebugging := zapcore.Lock(os.Stdout)
	core := zapcore.NewCore(consoleEncoder, consoleDebugging, level)
	logger := zap.New(core)

	logger.Debug("logger initialised")
	return logger
}
