//go:build (!android && !ios) || (ios && catalyst)
// +build !android,!ios ios,catalyst

package username

import "os/user"

const defaultUsername = "anon#1337"

func getUsername() string {
	user, err := user.Current()
	if err != nil || user == nil {
		return ""
	}

	return user.Name
}
