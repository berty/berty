package chatbridge

import (
	"context"

	"berty.tech/go/internal/bridgeutil"
	"google.golang.org/grpc"
)

type Client struct {
	grpcClient *grpc.ClientConn
}

// UnaryRequest request make an unary request to the given method.
// the request need to be already serialized
func (c *Client) UnaryRequest(method string, req []byte) (res []byte, err error) {
	codec := bridgeutil.NewLazyCodec()
	in := bridgeutil.NewLazyMessage().FromBytes(req)
	out := bridgeutil.NewLazyMessage()
	err = c.grpcClient.Invoke(context.Background(), method, in, out, grpc.ForceCodec(codec))
	res = out.Bytes()
	return
}
