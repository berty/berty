//go:build !android && !ios
// +build !android,!ios

package osversion

func GetVersion() Version {
	// Not implemented
	return &version{
		major: -1,
		minor: -1,
		patch: -1,
	}
}
