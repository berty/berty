package jsonclient

import (
	"context"
	"fmt"
	"strings"

	"github.com/berty/berty/core/client"
)

type unaryJsonMethod func(*client.Client, context.Context, []byte) (interface{}, error)

var methodMapping map[string]unaryJsonMethod

func registerMethod(name string, method unaryJsonMethod) {
	if methodMapping == nil {
		methodMapping = make(map[string]unaryJsonMethod)
	}
	methodMapping[name] = method
}

func Call(c *client.Client, ctx context.Context, method string, jsonInput []byte) (interface{}, error) {
	if jsonInput == nil {
		jsonInput = []byte("{}")
	}
	for name, handler := range methodMapping {
		if strings.ToLower(name) == strings.ToLower(method) {
			return handler(c, ctx, jsonInput)
		}
	}
	return nil, fmt.Errorf("unknown method: %q", method)
}

func AvailableMethods() []string {
	names := []string{}
	for name := range methodMapping {
		names = append(names, name)
	}
	return names
}
