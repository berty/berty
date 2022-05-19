package main

import (
	"fmt"
	"infratesting/iac/components/networking"
	"infratesting/logging"
	"infratesting/server/grpc/server"
	"net"

	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"google.golang.org/grpc"
)

func main() {
	logger, err := logging.New(zapcore.DebugLevel)
	if err != nil {
		panic(err)
	}

	lis, err := net.Listen("tcp", fmt.Sprintf("0.0.0.0:%d", networking.ServerGRPCPort))
	if err != nil {
		logger.Debug("failed to listen to port", zap.Int("port", networking.ServerGRPCPort), zap.Error(err))
	}

	grpclogger := logger.Named("grpc")
	grpcServer := grpc.NewServer(
		grpc.StreamInterceptor(grpc_zap.StreamServerInterceptor(grpclogger)),
		grpc.UnaryInterceptor(grpc_zap.UnaryServerInterceptor(grpclogger)),
	)

	s := server.NewServer(logger)
	s.ReliabilityProcess()

	server.RegisterProxyServer(grpcServer, s)

	if err := grpcServer.Serve(lis); err != nil {
		panic(err)
	}
}
