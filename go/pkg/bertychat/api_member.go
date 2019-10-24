package bertychat

import (
	"context"

	"berty.tech/go/pkg/errcode"
)

func (c *client) MemberList(*MemberList_Request, ChatService_MemberListServer) error {
	return errcode.ErrNotImplemented
}

func (c *client) MemberGet(context.Context, *MemberGet_Request) (*MemberGet_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
