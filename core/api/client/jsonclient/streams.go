package jsonclient

import (
	"context"
	"fmt"
	"strings"

	"github.com/berty/berty/core/api/client"
)

type GenericServerStreamClient interface {
	Recv() (interface{}, error)
	// grpc.ClientStream
}

type genericStreamEntry struct {
	data interface{}
	err  error
}

type genericServerStreamProxy struct {
	queue chan genericStreamEntry
}

func (p *genericServerStreamProxy) Recv() (interface{}, error) {
	entry := <-p.queue
	return entry.data, entry.err
}

func newGenericServerStreamProxy() *genericServerStreamProxy {
	return &genericServerStreamProxy{
		queue: make(chan genericStreamEntry, 100),
	}
}

type serverStreamCallback func(*client.Client, context.Context, []byte) (GenericServerStreamClient, error)

var serverStreamMap map[string]serverStreamCallback

func registerServerStream(name string, endpoint serverStreamCallback) {
	if serverStreamMap == nil {
		serverStreamMap = make(map[string]serverStreamCallback)
	}
	serverStreamMap[name] = endpoint
}

func CallServerStream(ctx context.Context, c *client.Client, endpoint string, jsonInput []byte) (GenericServerStreamClient, error) {
	if jsonInput == nil {
		jsonInput = []byte("{}")
	}
	for name, handler := range serverStreamMap {
		if strings.ToLower(name) == strings.ToLower(endpoint) {
			return handler(c, ctx, jsonInput)
		}
	}
	return nil, fmt.Errorf("unknown endpoint: %q", endpoint)
}

func ServerStreams() []string {
	names := []string{}
	for name := range serverStreamMap {
		names = append(names, name)
	}
	return names
}
