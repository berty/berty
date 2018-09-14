package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"

	"github.com/pkg/errors"
	"github.com/spf13/cobra"
	"go.uber.org/zap"
	"google.golang.org/grpc"

	"berty.tech/core/api/client"
	"berty.tech/core/api/client/jsonclient"
)

type clientOptions struct {
	endpoint    string   `mapstructure:"endpoint"`
	nodeAddress string   `mapstructure:"node-address"`
	args        []string `mapstructure:"args"`
	unarize     bool     `mapstructure:"unarize"`
	noIndent    bool     `mapstructure:"no-indent"`
}

func newClientCommand() *cobra.Command {
	opts := &clientOptions{}
	cmd := &cobra.Command{
		Use: "client",
	}

	for _, endpoint := range jsonclient.Unaries() {
		endpointCopy := endpoint
		cmd.AddCommand(&cobra.Command{
			Use:   fmt.Sprintf("%s [input in json]", endpoint),
			Short: "unary",
			RunE: func(cmd *cobra.Command, args []string) error {
				opts.endpoint = endpointCopy
				opts.args = args
				return clientUnary(opts)
			},
		})
	}

	for _, endpoint := range jsonclient.ServerStreams() {
		endpointCopy := endpoint
		cmd.AddCommand(&cobra.Command{
			Use:   fmt.Sprintf("%s [input in json]", endpoint),
			Short: "stream",
			RunE: func(cmd *cobra.Command, args []string) error {
				opts.endpoint = endpointCopy
				opts.args = args
				return clientServerStream(opts)
			},
		})
	}

	// fixme handle streaming

	cmd.PersistentFlags().StringVarP(&opts.nodeAddress, "node-address", "", "127.0.0.1:1337", "node gRPC address")
	cmd.PersistentFlags().BoolVar(&opts.unarize, "unarize", false, "return only one json at the end of the stream (streams only)")
	cmd.PersistentFlags().BoolVar(&opts.noIndent, "no-indent", false, "do not indent json")
	return cmd
}

func clientServerStream(opts *clientOptions) error {
	ctx := context.Background()

	logger().Debug("dialing node", zap.String("addr", opts.nodeAddress), zap.String("protocol", "gRPC"))
	conn, err := grpc.Dial(opts.nodeAddress, grpc.WithInsecure())
	if err != nil {
		return errors.Wrap(err, "failed to dial node")
	}

	input := []byte("{}")
	if len(opts.args) > 0 {
		input = []byte(opts.args[0])
	}

	client := client.New(conn)
	stream, err := jsonclient.CallServerStream(ctx, client, opts.endpoint, input)
	if err != nil {
		return errors.Wrap(err, "failed calling endpoint")
	}

	if opts.unarize {
		entries := make([]interface{}, 0)
		for {
			entry, err := stream.Recv()
			if err == io.EOF {
				break
			}
			if err != nil {
				return err
			}
			entries = append(entries, entry)
		}
		jsonPrint(entries, opts)
	} else {
		fmt.Println("[")
		index := 0
		for {
			entry, err := stream.Recv()
			if err == io.EOF {
				break
			}
			if err != nil {
				return err
			}
			if index > 0 {
				fmt.Print(",")
			}
			index++
			jsonPrint(entry, opts)
		}
		fmt.Println("]")
	}
	return nil
}

func clientUnary(opts *clientOptions) error {
	ctx := context.Background()

	logger().Debug("dialing node", zap.String("addr", opts.nodeAddress), zap.String("protocol", "gRPC"))
	conn, err := grpc.Dial(opts.nodeAddress, grpc.WithInsecure())
	if err != nil {
		return errors.Wrap(err, "failed to dial node")
	}

	input := []byte("{}")
	if len(opts.args) > 0 {
		input = []byte(opts.args[0])
	}

	client := client.New(conn)
	ret, err := jsonclient.CallUnary(ctx, client, opts.endpoint, input)
	if err != nil {
		return errors.Wrap(err, "failed calling endpoint")
	}

	jsonPrint(ret, opts)
	return nil
}

func jsonPrint(data interface{}, opts *clientOptions) {
	var out []byte
	if opts.noIndent {
		out, _ = json.Marshal(data)
	} else {
		out, _ = json.MarshalIndent(data, "", "  ")
	}
	fmt.Println(string(out))
}
