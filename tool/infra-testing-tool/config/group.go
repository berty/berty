package config

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
)

type Group struct {
	Name  string `yaml:"name"`
	Tests []Test `yaml:"tests"`
}

const (
	TestTypeText  = "text"
	TestTypeMedia = "media"
)

type Test struct {
	// here we have to work with "input" & "internal"
	// because the inputs and post-compilation values are different types

	// Input -> parsed straight from yaml
	// Internal -> compiled value from Input

	// inputs
	TypeInput     string `yaml:"type"`
	SizeInput     string `yaml:"size"`
	IntervalInput int    `yaml:"interval"`

	// parsed values
	TypeInternal     string `yaml:"typeInternal"`
	SizeInternal     int    `yaml:"sizeInternal"`     // in KB
	IntervalInternal int    `yaml:"intervalInternal"` // in Seconds

}

func (c *NodeGroup) parseGroups() error {

	// we check if the user doesn't try to add groups to types that are not supposed to have group
	// only types that support groups are:
	// Peer & Replication

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
		// groups a re allowed here
		// do nothing
	}

	// parse the test cases for each individual group
	for i, group := range c.Groups {
		config.Attributes.Groups[group.Name] = group

		// parse the tests
		for j, test := range c.Groups[i].Tests {
			t := strings.ToLower(test.TypeInput)

			// parse group type
			switch {
			case strings.Contains(t, TestTypeText):
				c.Groups[i].Tests[j].TypeInternal = TestTypeText
			case strings.Contains(t, TestTypeMedia):
				c.Groups[i].Tests[j].TypeInternal = TestTypeMedia
			default:
				return errors.New(fmt.Sprintf("invalid test type in test in group: %s test: %v", group.Name, i+1))
			}

			// parse message size
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

			size, err := strconv.Atoi(s[:len(s)-2])
			if err != nil {
				return errors.New(fmt.Sprintf("invalid test size in test in group: %s test: %v", group.Name, i+1))
			}

			c.Groups[i].Tests[j].SizeInternal = size * unit

			// parse interval
			if test.IntervalInput > 0 {
				c.Groups[i].Tests[j].IntervalInternal = test.IntervalInput
			} else {
				return errors.New(fmt.Sprintf("invterval needs to be bigger than 0 in group: %s test: %v", group.Name, i+1))

			}
		}
	}

	return nil
}
