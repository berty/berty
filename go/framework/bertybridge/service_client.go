package bertybridge

import (
	"context"

	"github.com/pkg/errors"

	"berty.tech/berty/v2/go/internal/grpcutil"
)

type PromiseBlock interface {
	CallResolve(reply string)
	CallReject(err error)
}

type ServiceClient interface {
	InvokeBridgeMethodWithPromiseBlock(promise PromiseBlock, method string, b64message string)
	InvokeBridgeMethod(method string, b64message string) (string, error)
}

type serviceClient struct {
	client *grpcutil.LazyClient
}

func NewServiceClient(cl *grpcutil.LazyClient) ServiceClient {
	return &serviceClient{cl}
}

func (s *serviceClient) InvokeBridgeMethodWithPromiseBlock(promise PromiseBlock, method string, b64message string) {
	go func() {
		res, err := s.InvokeBridgeMethod(method, b64message)
		// if an internal error occurred generate a new bridge error
		if err != nil {
			err = errors.Wrap(err, "unable to invoke bridge method")
			promise.CallReject(err)
			return
		}

		promise.CallResolve(res)
	}()
}

func (s *serviceClient) InvokeBridgeMethod(method string, b64message string) (string, error) {
	in, err := grpcutil.NewLazyMessage().FromBase64(b64message)
	if err != nil {
		return "", err
	}
	desc := &grpcutil.LazyMethodDesc{
		Name: method,
	}

	out, err := s.client.InvokeUnary(context.Background(), desc, in)
	if err != nil {
		return "", err
	}

	return out.Base64(), nil
}
