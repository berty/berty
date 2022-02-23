package config

import (
	"crypto/md5"
	"encoding/json"
	"errors"
	"fmt"
	"infratesting/logging"
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
	TypeInput     string `yaml:"type"`     // media / text
	SizeInput     string `yaml:"size"`     // in bytes
	IntervalInput int    `yaml:"interval"` // in Seconds
	AmountInput   int    `yaml:"amount"`   // in Messages

	// parsed values
	TypeInternal     string `yaml:"typeInternal"`     // media / text
	SizeInternal     int    `yaml:"sizeInternal"`     // in bytes
	IntervalInternal int    `yaml:"intervalInternal"` // in Seconds
	AmountInternal   int    `yaml:"amountInternal"`   // in Messages

}

func (c *NodeGroup) parseGroups() error {
	// we check if the user doesn't try to add types that are not supposed to have groups
	// only types that support groups are:
	// Peer & Replication

	switch c.NodeType {
	case NodeTypeRDVP:
		if len(c.Groups) > 0 {
			return errors.New("can't have type RDVP in group")
		}
	case NodeTypeBootstrap:
		if len(c.Groups) > 0 {
			return errors.New("can't have type Bootstrap in group")
		}
	case NodeTypeRelay:
		if len(c.Groups) > 0 {
			return errors.New("can't have type Relay in group")
		}
	case NodeTypeReplication:
		// allowed
	case NodeTypePeer:
		// group are re allowed here
		// do nothing
	}

	// parse the test cases for each individual group
	for i, group := range c.Groups {
		config.Attributes.Groups[c.Groups[i].Name] = &c.Groups[i]

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
				return fmt.Errorf("invalid test type in test in group: %s test: %v", group.Name, i)
			}

			// parse message size
			s := strings.ToLower(test.SizeInput)
			s = strings.ReplaceAll(s, " ", "")

			var unit int
			switch {
			case strings.Contains(s, "kb"):
				unit = 1000
			case strings.Contains(s, "mb"):
				unit = 1000000
			case strings.Contains(s, "gb"):
				unit = 1000000000
			case strings.Contains(s, "b"):
				// this one has to go last because of the single "b"
				unit = 1
			default:
				return fmt.Errorf("invalid test size in test in group: %s test: %d", group.Name, i)
			}

			size, err := strconv.Atoi(s[:len(s)-2])
			if err != nil {
				return fmt.Errorf("invalid test size in test in group: %s test: %d", group.Name, i+1)
			}

			c.Groups[i].Tests[j].SizeInternal = size * unit

			if unit >= 3800000 && c.Groups[i].Tests[j].TypeInternal == TestTypeText {
				return fmt.Errorf("exceeded 4MB grpc limit for text messages group: %s test: %d", group.Name, i)
			}

			// parse interval
			if test.IntervalInput > 0 {
				c.Groups[i].Tests[j].IntervalInternal = test.IntervalInput
			} else {
				return fmt.Errorf("invterval needs to be bigger than 0 in group: %s test: %d", group.Name, i)
			}

			if test.AmountInput > 0 {
				c.Groups[i].Tests[j].AmountInternal = test.AmountInput
			} else {
				return fmt.Errorf("amount needs to be bigger than 0 in group: %s test %d", group.Name, i)
			}

		}
	}

	return nil
}

func (g Group) Hash() [16]byte {
	bytes, err := json.Marshal(g)
	if err != nil {
		logging.Log(err)
	}

	return md5.Sum(bytes)
}

func (c Config) GetAmountOfGroups() (i int) {
	return len(c.Attributes.Groups)
}
