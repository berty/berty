package bertybridge

import (
	"flag"
	"fmt"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/internal/notification"
)

// Config is used to build a bridge configuration using only simple types or types returned by the bridge package.
type Config struct {
	dLogger     NativeLoggerDriver
	lc          LifeCycleDriver
	notifdriver NotificationDriver
	cliArgs     []string
}

func NewConfig() *Config {
	return &Config{cliArgs: []string{}}
}

func (c *Config) SetLoggerDriver(dLogger NativeLoggerDriver)      { c.dLogger = dLogger }
func (c *Config) SetNotificationDriver(driver NotificationDriver) { c.notifdriver = driver }
func (c *Config) SetLifeCycleDriver(lc LifeCycleDriver)           { c.lc = lc }
func (c *Config) AppendCLIArg(arg string)                         { c.cliArgs = append(c.cliArgs, arg) }

func (c *Config) manager() (*initutil.Manager, func(), error) {
	manager := initutil.Manager{}

	// configure flagset options
	fs := flag.NewFlagSet("bridge", flag.ContinueOnError)
	manager.SetupLoggingFlags(fs)
	manager.SetupLocalMessengerServerFlags(fs)
	manager.SetupEmptyGRPCListenersFlags(fs)
	// manager.SetupMetricsFlags(fs)

	// parse CLI args
	err := fs.Parse(c.cliArgs)
	if err != nil {
		return nil, nil, err
	}
	if len(fs.Args()) > 0 {
		return nil, nil, fmt.Errorf("invalid CLI args, should only have flags")
	}

	// minimal requirements
	{
		// here we can add various checks that return an error early if some settings are invalid or missing
	}

	// native logger
	logger, loggerCleanup, err := newLogger(manager.Logging.Filters, c.dLogger)
	if err != nil {
		return nil, nil, err
	}
	manager.SetLogger(logger)
	logger.Info("init", zap.Any("manager", &manager))

	// native notification manager
	if c.notifdriver == nil {
		manager.SetNotificationManager(notification.NewLoggerManager(logger))
	} else {
		manager.SetNotificationManager(newNotificationManagerAdaptater(logger, c.notifdriver))
	}

	// native life-cycle driver
	if c.lc == nil {
		c.lc = newNoopLifeCycleDriver()
	}

	cleanup := func() {
		manager.Close()
		loggerCleanup()
	}
	return &manager, cleanup, nil
}
