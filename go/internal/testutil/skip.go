package testutil

import (
	"fmt"
	"os"
	"strings"
	"testing"
)

// Stability level enum
type Stability string

const (
	Stable       Stability = "stable"
	Flappy       Stability = "flappy"
	Broken       Stability = "broken"
	AnyStability Stability = "any"
)

// Speed level enum
type Speed string

const (
	Fast     Speed = "fast"
	Slow     Speed = "slow"
	AnySpeed Speed = "any"
)

// RacePolicy enum
type RacePolicy string

const (
	SkipIfRace RacePolicy = "skip-if-race"
	RunIfRace  RacePolicy = "run-if-race"
)

// Default levels
const (
	defaultStabilityFilter Stability = Stable
	defaultSpeedFilter     Speed     = AnySpeed
)

var (
	enabledStability = map[Stability]bool{}
	enabledSpeed     = map[Speed]bool{}
	envParsed        = false
)

func parseEnv() {
	// Get stability filters
	stabFilter := os.Getenv("TEST_STABILITY")
	if stabFilter == "" {
		stabFilter = string(defaultStabilityFilter)
	}

	for _, level := range strings.Split(stabFilter, ",") {
		switch Stability(level) {
		case Stable, Flappy, Broken:
			enabledStability[Stability(level)] = true
		case AnyStability:
			enabledStability[Stable] = true
			enabledStability[Flappy] = true
			enabledStability[Broken] = true
		default:
			panic(fmt.Sprintf("invalid stability level: %q", level))
		}
	}

	// Get speed filters
	speedFilter := os.Getenv("TEST_SPEED")
	if speedFilter == "" {
		speedFilter = string(defaultSpeedFilter)
	}

	for _, level := range strings.Split(speedFilter, ",") {
		switch Speed(level) {
		case Slow, Fast:
			enabledSpeed[Speed(level)] = true
		case AnySpeed:
			enabledSpeed[Slow] = true
			enabledSpeed[Fast] = true
		default:
			panic(fmt.Sprintf("invalid speed level: %q", level))
		}
	}

	envParsed = true
}

func FilterStability(t *testing.T, stability Stability) {
	t.Helper()

	if !envParsed {
		parseEnv()
	}

	if !enabledStability[stability] {
		t.Skip(fmt.Sprintf("skip test with %q stability", stability))
	}
}

func FilterSpeed(t *testing.T, speed Speed) {
	t.Helper()

	if !envParsed {
		parseEnv()
	}

	if !enabledSpeed[speed] {
		t.Skip(fmt.Sprintf("skip test with %q speed", speed))
	}
}

func FilterStabilityAndSpeed(t *testing.T, stability Stability, speed Speed) {
	FilterStability(t, stability)
	FilterSpeed(t, speed)
}
