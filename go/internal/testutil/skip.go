package testutil

import (
	"testing"
)

func SkipSlow(t *testing.T) {
	t.Helper()
	if parseBoolFromEnv("SKIP_SLOW_TESTS") {
		t.Skip("slow test skipped")
	}
}

func SkipUnstable(t *testing.T) {
	t.Helper()
	if !parseBoolFromEnv("DONT_SKIP_UNSTABLE") {
		t.Log("FIXME: stabilize test")
		t.Skip("unstable test skipped")
	}
}

func SkipBroken(t *testing.T) {
	t.Helper()
	if !parseBoolFromEnv("DONT_SKIP_BROKEN") {
		t.Log("FIXME: stabilize test")
		t.Skip("broken test skipped")
	}
}
