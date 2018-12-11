package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"time"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_opentracing "github.com/grpc-ecosystem/go-grpc-middleware/tracing/opentracing"
	"github.com/pkg/errors"
	"github.com/spf13/cobra"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"google.golang.org/grpc"

	"berty.tech/core/api/client"
	"berty.tech/core/api/client/jsonclient"
	"berty.tech/core/api/node"
	"berty.tech/core/pkg/jaeger"
)

type clientOptions struct {
	endpoint    string   `mapstructure:"endpoint"`
	nodeAddress string   `mapstructure:"node-address"`
	args        []string `mapstructure:"args"`
	unarize     bool     `mapstructure:"unarize"`
	noIndent    bool     `mapstructure:"no-indent"`

	daemonOpts daemonOptions `mapstructure:"daemon-options"`
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

	cmd.AddCommand(&cobra.Command{
		Use: "LogStream",
		RunE: func(cmd *cobra.Command, args []string) error {
			client, ctx, err := getClient(opts)
			if err != nil {
				return err
			}

			stream, err := client.Node().LogStream(ctx, &node.LogStreamInput{Continues: true})
			if err != nil {
				return err
			}

			return clientPrettyLogStream(stream.Recv)
		},
	})

	cmd.AddCommand(&cobra.Command{
		Use: "LogfileRead",
		RunE: func(cmd *cobra.Command, args []string) error {
			client, ctx, err := getClient(opts)
			if err != nil {
				return err
			}

			path := "berty.log"
			if len(args) > 0 {
				path = args[0]
			}
			stream, err := client.Node().LogfileRead(ctx, &node.LogfileReadInput{Path: path})
			if err != nil {
				return err
			}

			return clientPrettyLogStream(stream.Recv)
		},
	})

	// fixme handle streaming

	cmd.PersistentFlags().StringVarP(&opts.nodeAddress, "node-address", "", "127.0.0.1:1337", "node gRPC address")
	cmd.PersistentFlags().BoolVar(&opts.unarize, "unarize", false, "return only one json at the end of the stream (streams only)")
	cmd.PersistentFlags().BoolVar(&opts.noIndent, "no-indent", false, "do not indent json")
	return cmd
}

func clientPrettyLogStream(recv func() (*node.LogEntry, error)) error {
	config := zap.NewDevelopmentConfig()
	config.DisableStacktrace = true
	config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	logger, err := config.Build()
	if err != nil {
		return err
	}

	defer func() {
		if err := logger.Sync(); err != nil {
			_, _ = fmt.Fprintf(os.Stderr, "%v\n", err)
		}
	}()
	for {
		entry, err := recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}
		var obj map[string]interface{}
		if err := json.Unmarshal([]byte(entry.Line), &obj); err != nil {
			return err
		}
		var ce *zapcore.CheckedEntry
		msg := obj["M"].(string)
		switch obj["L"] {
		case "DEBUG":
			ce = logger.Check(zapcore.DebugLevel, msg)
		case "INFO":
			ce = logger.Check(zapcore.InfoLevel, msg)
		case "WARN":
			ce = logger.Check(zapcore.WarnLevel, msg)
		case "ERROR":
			ce = logger.Check(zapcore.ErrorLevel, msg)
		case "FATAL":
			ce = logger.Check(zapcore.FatalLevel, msg)
		case "PANIC":
			ce = logger.Check(zapcore.PanicLevel, msg)
		default:
			msg = fmt.Sprintf("unhandled zap type: %q; %s", obj["L"], msg)
			ce = logger.Check(zapcore.ErrorLevel, msg)
		}
		fields := []zapcore.Field{}
		t, err := time.Parse("2006-01-02T15:04:05.000Z0700", obj["T"].(string))
		if err != nil {
			return err
		}
		ce.Time = t
		ce.Caller.File = obj["C"].(string)
		ce.Caller.Line = 0
		if _, found := obj["N"]; found {
			ce.LoggerName = obj["N"].(string)
			delete(obj, "N")
		}
		delete(obj, "L")
		delete(obj, "M")
		delete(obj, "T")
		delete(obj, "C")
		for k, v := range obj {
			fields = append(fields, zap.Any(k, v))
		}
		ce.Write(fields...)
	}
	return nil
}

func clientServerStream(opts *clientOptions) error {
	client, ctx, err := getClient(opts)
	if err != nil {
		return err
	}

	input := []byte("{}")
	if len(opts.args) > 0 {
		input = []byte(opts.args[0])
	}

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
	client, ctx, err := getClient(opts)
	if err != nil {
		return err
	}

	input := []byte("{}")
	if len(opts.args) > 0 {
		input = []byte(opts.args[0])
	}

	ret, err := jsonclient.CallUnary(ctx, client, opts.endpoint, input)
	if err != nil {
		return errors.Wrap(err, "failed calling endpoint")
	}

	jsonPrint(ret, opts)
	return nil
}

func getClient(opts *clientOptions) (*client.Client, context.Context, error) {
	ctx := context.Background()

	dialopts := []grpc.DialOption{
		grpc.WithInsecure(),
	}

	if jaegerAddr != "" {
		tracer, closer, err := jaeger.InitTracer(jaegerAddr, jaegerName+"client")
		if err != nil {
			return nil, nil, err
		}
		defer closer.Close()

		dialopts = append(dialopts, grpc.WithStreamInterceptor(grpc_middleware.ChainStreamClient(
			grpc_opentracing.StreamClientInterceptor(grpc_opentracing.WithTracer(tracer)),
		)))
	}

	logger().Debug("dialing node", zap.String("addr", opts.nodeAddress), zap.String("protocol", "gRPC"))
	conn, err := grpc.Dial(opts.nodeAddress, dialopts...)
	if err != nil {
		return nil, nil, errors.Wrap(err, "failed to dial node")
	}

	return client.New(conn), ctx, nil
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
