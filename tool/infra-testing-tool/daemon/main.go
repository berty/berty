package main

import (
	"google.golang.org/grpc"
	"infratesting/daemon/grpc/daemon"
	"log"
	"net"
)

func main() {
	log.Println("Berty Infra Daemmon starting")

	lis, err := net.Listen("tcp", "0.0.0.0:9090")
	if err != nil {
		log.Fatalf("Failed to listen to port 9091: %v", err)
	}

	//	var s daemon.GroupServer
	//	var opts []grpc.ServerOption
	//	grpcServer := grpc.NewServer(opts...)
	//	daemon.RegisterGroupServer(grpcServer, s)
	//
	//	err = grpcServer.Serve(lis)
	//	if err != nil {
	//		log.Println(err)
	//	}
	//}
	grpcServer := grpc.NewServer()

	s := daemon.NewServer()
	daemon.RegisterGroupServer(grpcServer, &s)
	daemon.RegisterPeerServer(grpcServer, &s)

	if err := grpcServer.Serve(lis); err != nil {
		panic(err)
	}


}
