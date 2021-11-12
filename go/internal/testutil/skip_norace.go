//go:build !race
// +build !race

package testutil

import "testing"

func FilterRace(t *testing.T, race RacePolicy) {
	t.Helper()
	if race == RunIfRace {
		t.Skip("skipping, this test can only run with the '-race' flag")
	}
}
