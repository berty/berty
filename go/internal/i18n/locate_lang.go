package main

import (
	jj "github.com/cloudfoundry-attic/jibber_jabber"
)

var Lang string

func main() {
	l, err := jj.DetectLanguage()
	if err != nil {
		Lang = "en"
		return
	}
	Lang = l
}
