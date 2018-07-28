package client

import "google.golang.org/grpc"

type Client struct {
	conn *grpc.ClientConn
}

func New(conn *grpc.ClientConn) *Client {
	return &Client{conn: conn}
}
