package main

import (
	"fmt"
	"infratesting/iac/components/networking"
	"infratesting/logging"
	"infratesting/server/grpc/server"
	"net"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"google.golang.org/grpc"
)

func main() {
	logger, err := logging.NewTeeLogger(zapcore.DebugLevel)
	if err != nil {
		panic(err)
	}

	lis, err := net.Listen("tcp", fmt.Sprintf("0.0.0.0:%d", networking.ServerGRPCPort))
	if err != nil {
		logger.Fatal("failed to listen to port", zap.Int("port", networking.ServerGRPCPort), zap.Error(err))
	}

	grpclogger := logger.Named("grpc")
	grpc_zap.ReplaceGrpcLoggerV2(logger)
	grpcServer := grpc.NewServer(
		grpc.StreamInterceptor(grpc_middleware.ChainStreamServer(
			grpc_zap.StreamServerInterceptor(grpclogger),
			grpc_recovery.StreamServerInterceptor(),
		)),
		grpc.UnaryInterceptor(grpc_middleware.ChainUnaryServer(
			grpc_zap.UnaryServerInterceptor(grpclogger),
			grpc_recovery.UnaryServerInterceptor(),
		)),
	)

	s := server.NewServer(logger)
	s.ReliabilityProcess()

	server.RegisterProxyServer(grpcServer, s)

	logger.Debug("serving grpc", zap.Int("port", networking.ServerGRPCPort))
	if err := grpcServer.Serve(lis); err != nil {
		panic(err)
	}
}
