package bertybridge_test

import (
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/gogo/protobuf/proto"

	"berty.tech/berty/v2/go/framework/bertybridge"
	"berty.tech/berty/v2/go/pkg/bertyaccount"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func Example() {
	tmpdir, err := ioutil.TempDir("", "example")
	checkErr(err)
	defer os.RemoveAll(tmpdir)

	// create and start the bridge
	var b *bertybridge.Bridge
	{
		config := bertybridge.NewConfig()
		if false { // disabled in example, but not commented to be sure that compiler performs various checks
			config.SetLifeCycleDriver(nil)
			config.SetLoggerDriver(nil)
			config.SetNotificationDriver(nil)
		}

		b, err = bertybridge.NewBridge(config)
		checkErr(err)

		defer b.Close()
		fmt.Println("[+] initialized.")
	}

	args := []string{
		"--log.filters=info+:bty*,-*.grpc warn+:*.grpc error+:*",
		"--log.format=console",
		"--node.display-name=",
		"--node.listeners=/ip4/127.0.0.1/tcp/0/grpcws",
		"--p2p.swarm-listeners=/ip4/0.0.0.0/tcp/0,/ip6/0.0.0.0/tcp/0",
		"--p2p.local-discovery=false",
		"--p2p.webui-listener=:3000",
		"--store.dir=" + tmpdir,
	}

	// open account
	{
		// create `OpenAccount_Request` Input
		reqb64, err := encodeProtoMessage(&bertyaccount.CreateAccount_Request{
			Args: args,
		})
		checkErr(err)

		// invoke through bridge client
		ret, err := b.InvokeBridgeMethod("/berty.account.v1.AccountService/CreateAccount", reqb64)
		checkErr(err)

		// deserialize reply
		var res bertyaccount.ClientInvokeUnary_Reply
		err = decodeProtoMessage(ret, &res)
		checkErr(err)

		fmt.Println("[+] account opened.")
	}

	// check for GRPC listeners
	{
		// create `GetGRPCListenerAddrs_Request` Input
		reqb64, err := encodeProtoMessage(&bertyaccount.GetGRPCListenerAddrs_Request{})
		checkErr(err)

		// invoke through bridge client
		ret, err := b.InvokeBridgeMethod("/berty.account.v1.AccountService/GetGRPCListenerAddrs", reqb64)
		checkErr(err)

		// deserialize reply
		var res bertyaccount.GetGRPCListenerAddrs_Reply
		err = decodeProtoMessage(ret, &res)
		checkErr(err)

		hasGRPCWeb := false
		hasGRPCWebSocket := false
		for _, entry := range res.Entries {
			switch entry.Proto {
			case "ip4/tcp/grpcweb":
				hasGRPCWeb = true
			case "ip4/tcp/grpcws":
				hasGRPCWebSocket = true
			}
		}

		fmt.Println("[+] has grpc-web listener:           ", hasGRPCWeb)       // no, because `--node.listeners` does not contain grpcweb
		fmt.Println("[+] has websocket listener:          ", hasGRPCWebSocket) // yes, because `--node.listeners`` contains grpcws
	}

	// make unary call to underlying `BertyMessenger` Service
	{
		// create `InstanceGetConfiguration` Input
		input := &protocoltypes.InstanceGetConfiguration_Request{}
		payload, err := proto.Marshal(input)
		checkErr(err)

		// Serialize request
		in := &bertyaccount.ClientInvokeUnary_Request{
			MethodDesc: &bertyaccount.MethodDesc{
				Name: "/berty.protocol.v1.ProtocolService/InstanceGetConfiguration",
			},
			Payload: payload,
		}

		reqb64, err := encodeProtoMessage(in)
		checkErr(err)

		// invoke through bridge client
		ret, err := b.InvokeBridgeMethod("/berty.account.v1.AccountService/ClientInvokeUnary", reqb64)
		checkErr(err)

		var output bertyaccount.ClientInvokeUnary_Reply
		err = decodeProtoMessage(ret, &output)
		checkErr(err)

		var res protocoltypes.InstanceGetConfiguration_Reply
		err = proto.Unmarshal(output.Payload, &res)
		checkErr(err)

		fmt.Println("[+] has more than one swarm listener:", len(res.Listeners) > 1)
		// log.Println("ret", godev.PrettyJSON(output))
	}

	// Output:
	// [+] initialized.
	// [+] account opened.
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
