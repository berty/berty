package bertyprotocol

import (
	"context"

	"berty.tech/go/internal/protocolerrcode"
)

func (c *client) InstanceExportData(context.Context, *InstanceExportDataRequest) (*InstanceExportDataReply, error) {
	return nil, protocolerrcode.ErrNotImplemented
}

func (c *client) InstanceGetConfiguration(context.Context, *InstanceGetConfigurationRequest) (*InstanceGetConfigurationReply, error) {
	return nil, protocolerrcode.ErrNotImplemented
}
