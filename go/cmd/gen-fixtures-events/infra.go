package main

import (
	"fmt"
	"os"
	"path/filepath"

	"go.uber.org/multierr"
)

type node struct {
	server *daemon
	client *client
}

func (n *node) Close() error {
	err := n.client.Close()
	return multierr.Append(err, n.server.Close())
}

type infra struct {
	nodes map[string]*node
}

func newInfra(dir, outDir string, names ...string) (*infra, error) {
	nodes := make(map[string]*node)
	port := 9091
	for _, name := range names {
		addr := fmt.Sprintf("127.0.0.1:%d", port)
		ipfsAddr := fmt.Sprintf("/ip4/127.0.0.1/tcp/%d", port+len(names))
		webuiAddr := fmt.Sprintf(":%d", port+(2*len(names)))

		nodeDir := filepath.Join(dir, name)
		server, err := newDaemon(nodeDir, addr, ipfsAddr, webuiAddr, filepath.Join(outDir, name+"-events.json"), os.Stdout, os.Stderr)
		if err != nil {
			return nil, err
		}

		client, err := newClient(addr)
		if err != nil {
			return nil, err
		}

		nodes[name] = &node{
			client: client,
			server: server,
		}

		port++
	}
	return &infra{
		nodes: nodes,
	}, nil
}

func (i *infra) Close() error {
	var err error
	for _, n := range i.nodes {
		err = multierr.Append(err, n.Close())
	}
	return err
}
