package bertybridge

import (
	"context"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"google.golang.org/grpc"
)

type Client struct {
	grpcClient *grpc.ClientConn
}

func (c *Client) Close() error {
	return c.grpcClient.Close()
}

// UnaryRequest request make an unary request to the given method.
// the request need to be already serialized
func (c *Client) UnaryRequest(ctx context.Context, method string, req []byte) (res []byte, err error) {
	codec := grpcutil.NewLazyCodec()
	in := grpcutil.NewLazyMessage().FromBytes(req)
	out := grpcutil.NewLazyMessage()
	err = c.grpcClient.Invoke(ctx, method, in, out, grpc.ForceCodec(codec))
	res = out.Bytes()
	return
}

// UnaryRequestFromBase64 request make an unary request to the given method.
// the request need to be already serialized and encoded in a base64 string
func (c *Client) UnaryRequestFromBase64(method string, b64req string) (b64res string, err error) {
	codec := grpcutil.NewLazyCodec()
	in, err := grpcutil.NewLazyMessage().FromBase64(b64req)
	if err != nil {
		return "", err
	}

	out := grpcutil.NewLazyMessage()
	err = c.grpcClient.Invoke(context.Background(), method, in, out, grpc.ForceCodec(codec))
	b64res = out.Base64()
	return
}
