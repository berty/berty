package main

import (
	"fmt"
	"infratesting/iac/components/networking"
	"infratesting/logging"
	"infratesting/server/grpc/server"
	"net"

	"google.golang.org/grpc"
)

func main() {
	logging.Log("Berty Infra Server starting")

	lis, err := net.Listen("tcp", fmt.Sprintf("0.0.0.0:%v", networking.ServerGRPCPort))
	if err != nil {
		logging.Log(fmt.Sprintf("Failed to listen to port %v: %v", networking.ServerGRPCPort, err))
	}

	grpcServer := grpc.NewServer()

	s := server.NewServer()
	s.ReliabilityProcess()

	server.RegisterProxyServer(grpcServer, &s)

	if err := grpcServer.Serve(lis); err != nil {
		panic(err)
	}
}
