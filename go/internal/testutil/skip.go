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

func SkipUnstable(t *testing.T) {
	t.Helper()
	if os.Getenv("DONT_SKIP_UNSTABLE") != "1" {
		t.Log("FIXME: stabilize test")
		t.Skip("unstable test skipped")
	}
}

func SkipBroken(t *testing.T) {
	t.Helper()
	if os.Getenv("DONT_SKIP_BROKEN") != "1" {
		t.Log("FIXME: stabilize test")
		t.Skip("broken test skipped")
	}
}
