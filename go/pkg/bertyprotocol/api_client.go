package bertyprotocol

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) InstanceExportData(context.Context, *InstanceExportDataRequest) (*InstanceExportDataReply, error) {
	return nil, errcode.ErrNotImplemented
}

func (c *client) InstanceGetConfiguration(context.Context, *InstanceGetConfigurationRequest) (*InstanceGetConfigurationReply, error) {
	return nil, errcode.ErrNotImplemented
}
