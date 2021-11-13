//go:build race
// +build race

package testutil

import "testing"

func FilterRace(t *testing.T, race RacePolicy) {
	t.Helper()
	if race == SkipIfRace {
		t.Skip("skipping, this test can only run without the '-race' flag")
	}
}
