package p2p

import (
	"context"
	"fmt"

	"berty.tech/core/api/p2p"
	"berty.tech/core/entity"
)

// driverService is a p2p.ServiceServer
var _ p2p.ServiceServer = (*driverService)(nil)

type driverService Driver

func ServiceServer(d *Driver) p2p.ServiceServer {
	return (*driverService)(d)
}

func (ds *driverService) HandleEnvelope(ctx context.Context, e *entity.Envelope) (*entity.Void, error) {
	if ds.handler != nil {
		return ds.handler(ctx, e)
	}

	return nil, fmt.Errorf("no handler set")
}

func (ds *driverService) Ping(ctx context.Context, _ *entity.Void) (*entity.Void, error) {
	return &entity.Void{}, nil
}
