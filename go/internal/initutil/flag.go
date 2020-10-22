package initutil

import (
	"fmt"
	"strings"
)

type flagStringSlice []string

func (i *flagStringSlice) String() string {
	return fmt.Sprintf("%s", *i)
}

func (i *flagStringSlice) Set(value string) error {
	*i = append(*i, strings.Split(value, ",")...)
	return nil
}

type Preset int

const (
	PresetDefault Preset = iota
	PresetAnonymity
)

var presetsStr = [...]string{
	"default",
	"anonymity",
}

func (p Preset) String() string {
	return presetsStr[p]
}

func (p *Preset) Set(value string) error {
	if value == "" {
		*p = PresetDefault
		return nil
	}
	value = strings.ToLower(value)
	// Using an iterative search to avoid stressing the heap too much with a map on init.
	for i, v := range presetsStr {
		if v == value {
			*p = Preset(i)
			return nil
		}
	}
	return fmt.Errorf("%q is not a known preset", value)
}
