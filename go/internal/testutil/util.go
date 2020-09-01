package testutil

import (
	"os"
	"strconv"
)

func parseBoolFromEnv(key string) (b bool) {
	b, _ = strconv.ParseBool(os.Getenv(key))
	return
}
