package main

import (
	"fmt"
	"google.golang.org/grpc"
	"infratesting/daemon/grpc/daemon"
	"infratesting/iac/components/networking"
	"infratesting/logging"
	"net"
)

func main() {
	logging.Log("Berty Infra Daemon starting")

	lis, err := net.Listen("tcp", fmt.Sprintf("0.0.0.0:%v", networking.DaemonGRPCPort))
	if err != nil {
		logging.Log(fmt.Sprintf("Failed to listen to port %v: %v", networking.DaemonGRPCPort, err))
	}

	grpcServer := grpc.NewServer()

	s := daemon.NewServer()
	daemon.RegisterProxyServer(grpcServer, &s)

	if err := grpcServer.Serve(lis); err != nil {
		panic(err)
	}

}
