package bertybridge_test

import (
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/gogo/protobuf/proto"

	"berty.tech/berty/v2/go/framework/bertybridge"
	"berty.tech/berty/v2/go/framework/bertybridge/internal/bridgepb"
	"berty.tech/berty/v2/go/pkg/bertytypes"
)

func Example() {
	tmpdir, err := ioutil.TempDir("", "example")
	checkErr(err)
	defer os.RemoveAll(tmpdir)

	// create and start the bridge
	var bridge *bertybridge.Bridge
	{
		config := bertybridge.NewConfig()
		{
			if false { // disabled in example, but not commented to be sure that compiler performs various checks
				config.SetLifeCycleDriver(nil)
				config.SetLoggerDriver(nil)
				config.SetNotificationDriver(nil)
			}
			config.AppendCLIArg("--log.filters=info+:bty*,-*.grpc warn+:*.grpc error+:*")
			config.AppendCLIArg("--log.format=console")
			config.AppendCLIArg("--node.display-name=")
			config.AppendCLIArg("--node.listeners=/ip4/127.0.0.1/tcp/0/grpcws")
			config.AppendCLIArg("--p2p.swarm-listeners=/ip4/0.0.0.0/tcp/0,/ip6/0.0.0.0/tcp/0")
			config.AppendCLIArg("--p2p.local-discovery=false")
			config.AppendCLIArg("--p2p.webui-listener=:3000")
			config.AppendCLIArg("--store.dir=" + tmpdir)
		}

		bridge, err = bertybridge.NewBridge(config)
		checkErr(err)
		defer bridge.Close()
		fmt.Println("[+] initialized.")
	}

	fmt.Println("[+] has grpc-web listener:           ", bridge.GRPCWebListenerAddr() != "")       // no, because `--node.listeners` does not contain grpcweb
	fmt.Println("[+] has websocket listener:          ", bridge.GRPCWebSocketListenerAddr() != "") // yes, because `--node.listeners`` contains grpcws

	// unary client call
	{
		// create `InstanceGetConfiguration` Input
		input := &bertytypes.InstanceGetConfiguration_Request{}
		payload, err := proto.Marshal(input)
		checkErr(err)

		// Serialize request
		req := &bridgepb.ClientInvokeUnary_Request{
			MethodDesc: &bridgepb.MethodDesc{
				Name:           "/berty.protocol.v1.ProtocolService/InstanceGetConfiguration",
				IsClientStream: false,
				IsServerStream: false,
			},
			Payload: payload,
		}
		reqb64, err := encodeProtoMessage(req)
		checkErr(err)

		// invoke through bridge client
		ret, err := bridge.InvokeBridgeMethod("/berty.bridge.v1.BridgeService/ClientInvokeUnary", reqb64)
		checkErr(err)

		// deserialize reply
		var res bridgepb.ClientInvokeUnary_Reply
		err = decodeProtoMessage(ret, &res)
		checkErr(err)

		// check for error
		if res.Error != nil {
			fmt.Fprintf(os.Stderr, "bridge client error: `[%s] %s`\n", res.Error.ErrorCode.String(), res.Error.Message)
			panic(err)
		}

		// deserialize output
		var output bertytypes.InstanceGetConfiguration_Reply
		err = proto.Unmarshal(res.Payload, &output)
		checkErr(err)

		fmt.Println("[+] has more than one swarm listener:", len(output.Listeners) > 1)
		// log.Println("ret", godev.PrettyJSON(output))
	}

	// Output:
	// [+] initialized.
	// [+] has grpc-web listener:            false
	// [+] has websocket listener:           true
	// [+] has more than one swarm listener: true
}

func checkErr(err error) {
	if err != nil {
		fmt.Fprintf(os.Stderr, "%+v\n", err)
		panic(err)
	}
}

func decodeProtoMessage(input string, output proto.Message) error {
	dec, err := base64.StdEncoding.DecodeString(input)
	if err != nil {
		return err
	}

	return proto.Unmarshal(dec, output)
}

func encodeProtoMessage(input proto.Message) (string, error) {
	data, err := proto.Marshal(input)
	if err != nil {
		return "", err
	}

	return base64.StdEncoding.EncodeToString(data), nil
}
