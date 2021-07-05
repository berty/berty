package main

import (
	"context"
	"fmt"
	"github.com/google/uuid"
	"google.golang.org/grpc"
	"infratesting/daemon/grpc/daemon"
)

func main() {
	conn, err := grpc.Dial("192.168.1.169:9090", grpc.WithInsecure())
	if err != nil {
		panic(err)
	}
	defer conn.Close()

	g := daemon.NewGroupClient(conn)
	p := daemon.NewPeerClient(conn)

	ctx := context.Background()
	//for {
	//	resp, err := client.TestConnection(ctx, &daemon.TestConnection_Request{Message: uuid.NewString()})
	//	if err != nil {
	//		panic(err)
	//	}
	//
	//	log.Printf("successfull: %v", resp.Success)
	//}

	_, err = p.ConnectToPeer(ctx, &daemon.ConnectToPeer_Request{
		Host: "127.0.0.1",
		Port: "9091",
	})
	if err != nil {
		panic(err)
	}

	groupName := uuid.NewString()

	resp, err := g.CreateInvite(ctx, &daemon.CreateInvite_Request{GroupName: groupName})
	if err != nil {
		panic(err)
	}

	r2, err := g.JoinGroup(ctx, &daemon.JoinGroup_Request{
		GroupName: groupName,
		Invite:    resp.Invite,
	})
	if err != nil {
		panic(err)
	}

	fmt.Printf(r2.String())


}
