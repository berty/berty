package main

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/pkg/errors"
	"github.com/spf13/cobra"
	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/berty/berty/core/client"
	"github.com/berty/berty/core/client/jsonclient"
)

type clientOptions struct {
	endpoint    string
	nodeAddress string
	args        []string
}

func newClientCommand() *cobra.Command {
	opts := &clientOptions{}
	cmd := &cobra.Command{
		Use: "client",
	}

	for _, endpoint := range jsonclient.Unaries() {
		endpointCopy := endpoint
		cmd.AddCommand(&cobra.Command{
			Use: fmt.Sprintf("%s [input in json]", endpoint),
			RunE: func(cmd *cobra.Command, args []string) error {
				opts.endpoint = endpointCopy
				opts.args = args
				return clientUnary(opts)
			},
		})
	}

	// fixme handle streaming

	flags := cmd.Flags()
	flags.StringVarP(&opts.nodeAddress, "node-address", "", "127.0.0.1:1337", "node gRPC address")
	return cmd
}

func clientUnary(opts *clientOptions) error {
	ctx := context.Background()

	zap.L().Debug("dialing node", zap.String("addr", opts.nodeAddress), zap.String("protocol", "gRPC"))
	conn, err := grpc.Dial(opts.nodeAddress, grpc.WithInsecure())
	if err != nil {
		return errors.Wrap(err, "failed to dial node")
	}

	input := []byte("{}")
	if len(opts.args) > 0 {
		input = []byte(opts.args[0])
	}

	client := client.New(conn)
	ret, err := jsonclient.Call(ctx, client, opts.endpoint, input)
	if err != nil {
		return errors.Wrap(err, "failed calling endpoint")
	}

	out, _ := json.MarshalIndent(ret, "", "  ")
	fmt.Println(string(out))
	return nil
}
