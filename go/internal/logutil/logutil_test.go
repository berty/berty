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
	logger, cleanup, err := logutil.NewLogger("error:*", "light-console", "stdout")
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
	// ERROR	bty               	top error
	// ERROR	bty.foo           	foo error
}
