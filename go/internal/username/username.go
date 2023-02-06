package username

import "strings"

func GetUsername() string {
	username := getUsername()
	trimed := strings.TrimSpace(username)
	if trimed != "" {
		return trimed
	}

	return defaultUsername
}
