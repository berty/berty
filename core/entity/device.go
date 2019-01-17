package entity

import (
	"strings"
)

func (d *Device) Username() string {
	if d == nil {
		return "unknown username"
	}
	name := d.Name
	name = strings.Replace(name, "iPhone de ", "", -1)
	name = strings.Replace(name, "'s iPhone", "", -1)
	return name
}

func (d Device) IsNode() {} // required by gqlgen
