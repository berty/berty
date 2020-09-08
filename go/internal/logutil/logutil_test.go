package logutil_test

import (
	"berty.tech/berty/v2/go/internal/logutil"
)

func Example_logall() {
	logger, cleanup, err := logutil.NewLogger("*", "light-console", "stdout")
	if err != nil {
		panic(err)
	}
	defer cleanup()

	logger.Debug("top debug")
	logger.Info("top info")
	logger.Warn("top warn")
	logger.Error("top error")

	logger.Named("foo").Debug("foo debug")
	logger.Named("foo").Info("foo info")
	logger.Named("foo").Warn("foo warn")
	logger.Named("foo").Error("foo error")

	// Output:
	// DEBUG	bty               	top debug
	// INFO 	bty               	top info
	// WARN 	bty               	top warn
	// ERROR	bty               	top error
	// DEBUG	bty.foo           	foo debug
	// INFO 	bty.foo           	foo info
	// WARN 	bty.foo           	foo warn
	// ERROR	bty.foo           	foo error
}

func Example_logerrors() {
	logger, cleanup, err := logutil.NewLogger("error:*,-*.bar warn:*.bar", "light-console", "stdout")
	if err != nil {
		panic(err)
	}
	defer cleanup()

	logger.Debug("top debug")
	logger.Info("top info")
	logger.Warn("top warn")
	logger.Error("top error")

	logger.Named("foo").Debug("foo debug")
	logger.Named("foo").Info("foo info")
	logger.Named("foo").Warn("foo warn")
	logger.Named("foo").Error("foo error")

	logger.Named("foo").Named("bar").Debug("foo.bar debug")
	logger.Named("foo").Named("bar").Info("foo.bar info")
	logger.Named("foo").Named("bar").Warn("foo.bar warn")
	logger.Named("foo").Named("bar").Error("foo.bar error")

	// Output:
	// ERROR	bty               	top error
	// ERROR	bty.foo           	foo error
	// WARN 	bty.foo.bar       	foo.bar warn
}
