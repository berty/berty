package testutil

import (
	"os"
	"testing"
)

func SkipSlow(t *testing.T) {
	t.Helper()
	if os.Getenv("SKIP_SLOW_TESTS") == "1" {
		t.Skip("slow test skipped")
	}
}
