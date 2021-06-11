package config

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
)

type Group struct {
	Name string `yaml:"name"`
	Tests []Test `yaml:"tests"`
}

const (
	TestTypeText = iota
	TestTypeMedia
)

type Test struct {
	// inputs
	TypeInput string `yaml:"type"`
	SizeInput string `yaml:"size"`
	IntervalInput int `yaml:"interval"`

	// parsed values
	TypeInternal int
	SizeInternal int
	IntervalInternal int

}

func (c *NodeGroup) parseGroups() error {


	switch c.NodeType {
	case NodeTypeRDVP:
		if len(c.Groups) > 0 {
			return errors.New("can't have groups in type RDVP")
		}
	case NodeTypeBootstrap:
		if len(c.Groups) > 0 {
			return errors.New("can't have groups in type Bootstrap")
		}
	case NodeTypeRelay:
		if len(c.Groups) > 0 {
			return errors.New("can't have groups in type Relay")
		}
	case NodeTypeReplication:
		//TODO add replication
		if len(c.Groups) > 0 {
			return errors.New("can't have groups in type Replication yet")
		}
	case NodeTypePeer:
		//
	}


	for i, group := range c.Groups {
		configAttributes.Groups[group.Name] = group

		// parse the tests
		for j, test := range c.Groups[i].Tests {
			t := strings.ToLower(test.TypeInput)

			switch {
			case strings.Contains(t, "text"):
				c.Groups[j].Tests[j].TypeInternal = TestTypeText
			case strings.Contains(t, "media"):
				c.Groups[j].Tests[j].TypeInternal = TestTypeMedia
			default:
				return errors.New(fmt.Sprintf("invalid test type in test in group: %s test: %v", group.Name, i+1))
			}

			s := strings.ToLower(test.SizeInput)
			var unit int

			switch {
			case strings.Contains(s, "kb"):
				unit = 1
			case strings.Contains(s, "mb"):
				unit = 1000
			case strings.Contains(s, "gb"):
				unit = 1000000
			default:
				return errors.New(fmt.Sprintf("invalid test size in test in group: %s test: %v", group.Name, i+1))
			}

			size, err := strconv.Atoi(s[:len(s)-3])
			if err != nil {
				return errors.New(fmt.Sprintf("invalid test size in test in group: %s test: %v", group.Name, i+1))
			}

			c.Groups[j].Tests[j].SizeInternal = size * unit

			if test.IntervalInput > 0 {
				c.Groups[j].Tests[j].IntervalInternal = test.IntervalInput
			} else {
				return errors.New(fmt.Sprintf("invterval needs to be bigger than 0 in group: %s test: %v", group.Name, i+1))

			}
		}
	}

	return nil
}
