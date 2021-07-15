package main

import (
	"fmt"
	"google.golang.org/grpc"
	"infratesting/daemon/grpc/daemon"
	"log"
	"net"
)

const (
	usedGrpcPort = 7091
)

func main() {
	log.Println("Berty Infra Daemmon starting")

	lis, err := net.Listen("tcp", fmt.Sprintf("0.0.0.0:%v", usedGrpcPort))
	if err != nil {
		log.Fatalf("Failed to listen to port %v: %v", usedGrpcPort, err)
	}

	grpcServer := grpc.NewServer()

	s := daemon.NewServer()
	daemon.RegisterProxyServer(grpcServer, &s)

	if err := grpcServer.Serve(lis); err != nil {
		panic(err)
	}


}
