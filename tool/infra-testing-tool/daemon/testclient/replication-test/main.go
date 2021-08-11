package main

import (
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"context"
	"fmt"
	"google.golang.org/grpc"
)

func main() {

	ctx := context.Background()

	// replication
	replication, err := grpc.DialContext(ctx, "192.168.1.169:9091", grpc.FailOnNonTempDialError(true), grpc.WithInsecure())
	if err != nil {
		return
	}

	replicationProtocol := protocoltypes.NewProtocolServiceClient(replication)

	resp, err := replicationProtocol.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
	if err != nil {
		panic(err)
		return
	}

	fmt.Println("resp:")
	fmt.Println(resp)
}
