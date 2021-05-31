package testing

import (
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"context"
	"fmt"
	"google.golang.org/grpc"
)


func PrintInvite() {
	ctx := context.Background()
	host := "127.0.0.1:9091" // default daemon gRPC listener

	// Init gRPC services (protocol and messenger)
	cc, err := grpc.DialContext(ctx, host, grpc.FailOnNonTempDialError(true), grpc.WithInsecure())
	if err != nil {
		panic(err)
	}

	protocol := protocoltypes.NewProtocolServiceClient(cc)
	messenger := messengertypes.NewMessengerServiceClient(cc)

	// Create group using protocol
	resCreate, err := protocol.MultiMemberGroupCreate(ctx, &protocoltypes.MultiMemberGroupCreate_Request{})
	if err != nil {
		panic(err)
	}

	// Print group invit on stdout using messenger
	resInvit, err := messenger.ShareableBertyGroup(ctx, &messengertypes.ShareableBertyGroup_Request{
		GroupPK:   resCreate.GroupPK,
		GroupName: "foo",
	})
	if err != nil {
		panic(err)
	}

	fmt.Println(resInvit.GetWebURL())
}
