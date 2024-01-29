// @FIXME(gfanton): auto relay can occasionally rise data race in some tests,
// disabling race for now
//go:build !race
// +build !race

package bertybridge_test

import (
	"encoding/base64"
	"fmt"
	"os"

	"github.com/gogo/protobuf/proto"

	"berty.tech/berty/v2/go/framework/bertybridge"
	"berty.tech/berty/v2/go/pkg/accounttypes"
	bridge_svc "berty.tech/berty/v2/go/pkg/bertybridge"
	"berty.tech/weshnet/pkg/protocoltypes"
)

func Example() {
	// disable ressources manager for the sake of this example
	os.Setenv("LIBP2P_RCMGR", "false")

	tmpdir, err := os.MkdirTemp("", "example")
	checkErr(err)
	defer os.RemoveAll(tmpdir)

	// create and start the bridge
	var b *bertybridge.Bridge
	{
		config := bertybridge.NewBridgeConfig()
		if false { // disabled in example, but not commented to be sure that compiler performs various checks
			config.SetLifeCycleDriver(nil)
			config.SetNotificationDriver(nil)
		}

		// set bridge root dir
		config.SetAppRootDir(tmpdir)

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
		"--p2p.swarm-listeners=/ip4/127.0.0.1/tcp/0,/ip6/::1/tcp/0",
		"--p2p.mdns=false",
		"--p2p.webui-listener=:3000",
		"--store.dir=" + tmpdir,
	}

	var accountID string
	// create account
	{
		// create `CreateAccount` Input
		input := &accounttypes.CreateAccount_Request{}
		payload, err := proto.Marshal(input)
		checkErr(err)

		// Serialize request
		in := &bridge_svc.ClientInvokeUnary_Request{
			MethodDesc: &bridge_svc.MethodDesc{
				Name: "/berty.account.v1.AccountService/CreateAccount",
			},
			Payload: payload,
		}

		reqb64, err := encodeProtoMessage(in)
		checkErr(err)

		// invoke through bridge client
		ret, err := b.InvokeBridgeMethod("/berty.bridge.v1.BridgeService/ClientInvokeUnary", reqb64)
		checkErr(err)

		// deserialize reply
		var output bridge_svc.ClientInvokeUnary_Reply
		err = decodeProtoMessage(ret, &output)
		checkErr(err)

		// deserialize reply
		var res accounttypes.CreateAccount_Reply
		err = proto.Unmarshal(output.Payload, &res)
		checkErr(err)

		accountID = res.GetAccountMetadata().GetAccountID()

		fmt.Println("[+] account created.")
	}

	// open account
	{
		// create `CreateAccount` Input
		input := &accounttypes.OpenAccount_Request{
			AccountID: accountID,
			Args:      args,
		}
		payload, err := proto.Marshal(input)
		checkErr(err)

		// Serialize request
		in := &bridge_svc.ClientInvokeUnary_Request{
			MethodDesc: &bridge_svc.MethodDesc{
				Name: "/berty.account.v1.AccountService/OpenAccount",
			},
			Payload: payload,
		}

		reqb64, err := encodeProtoMessage(in)
		checkErr(err)

		// invoke through bridge client
		ret, err := b.InvokeBridgeMethod("/berty.bridge.v1.BridgeService/ClientInvokeUnary", reqb64)
		checkErr(err)

		// deserialize reply
		var output bridge_svc.ClientInvokeUnary_Reply
		err = decodeProtoMessage(ret, &output)
		checkErr(err)

		fmt.Println("[+] account opened.")
	}

	// check for GRPC listeners
	{
		// create `ServiceGetConfiguration` Input
		input := &accounttypes.GetGRPCListenerAddrs_Request{}
		payload, err := proto.Marshal(input)
		checkErr(err)

		// Serialize request
		in := &bridge_svc.ClientInvokeUnary_Request{
			MethodDesc: &bridge_svc.MethodDesc{
				Name: "/berty.account.v1.AccountService/GetGRPCListenerAddrs",
			},
			Payload: payload,
		}

		reqb64, err := encodeProtoMessage(in)
		checkErr(err)

		// invoke through bridge client
		ret, err := b.InvokeBridgeMethod("/berty.bridge.v1.BridgeService/ClientInvokeUnary", reqb64)
		checkErr(err)

		var output bridge_svc.ClientInvokeUnary_Reply
		err = decodeProtoMessage(ret, &output)
		checkErr(err)

		// deserialize reply
		var res accounttypes.GetGRPCListenerAddrs_Reply
		err = proto.Unmarshal(output.Payload, &res)
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
		// create `ServiceGetConfiguration` Input
		input := &protocoltypes.ServiceGetConfiguration_Request{}
		payload, err := proto.Marshal(input)
		checkErr(err)

		// Serialize request
		in := &bridge_svc.ClientInvokeUnary_Request{
			MethodDesc: &bridge_svc.MethodDesc{
				Name: "/weshnet.protocol.v1.ProtocolService/ServiceGetConfiguration",
			},
			Payload: payload,
		}

		reqb64, err := encodeProtoMessage(in)
		checkErr(err)

		// invoke through bridge client
		ret, err := b.InvokeBridgeMethod("/berty.bridge.v1.BridgeService/ClientInvokeUnary", reqb64)
		checkErr(err)

		var output bridge_svc.ClientInvokeUnary_Reply
		err = decodeProtoMessage(ret, &output)
		checkErr(err)

		var res protocoltypes.ServiceGetConfiguration_Reply
		err = proto.Unmarshal(output.Payload, &res)
		checkErr(err)

		fmt.Println("[+] has more than one swarm listener:", len(res.Listeners) > 1)
		// log.Println("ret", godev.PrettyJSON(output))
	}

	// Output:
	// [+] initialized.
	// [+] account created.
	// go-libp2p resource manager protection disabled
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
