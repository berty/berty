package testutil

import (
	"fmt"
	"os"
	"testing"
)

func SkipSlow(t *testing.T) {
	t.Helper()
	if os.Getenv("SKIP_SLOW_TESTS") == "1" {
		t.Skip(fmt.Sprintf("slow test skipped"))
	}
}
