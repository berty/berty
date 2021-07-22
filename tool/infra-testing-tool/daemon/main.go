package main

import (
	"fmt"
	"google.golang.org/grpc"
	"infratesting/daemon/grpc/daemon"
	"infratesting/logging"
	"net"
)

const (
	usedGrpcPort = 7091
)

func main() {
	logging.Log("Berty Infra Daemmon starting")

	lis, err := net.Listen("tcp", fmt.Sprintf("0.0.0.0:%v", usedGrpcPort))
	if err != nil {
		logging.Log(fmt.Sprintf("Failed to listen to port %v: %v", usedGrpcPort, err))
	}

	grpcServer := grpc.NewServer()

	s := daemon.NewServer()
	daemon.RegisterProxyServer(grpcServer, &s)

	if err := grpcServer.Serve(lis); err != nil {
		panic(err)
	}


}
