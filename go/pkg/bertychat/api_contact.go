package bertychat

import (
	"context"
	"fmt"

	"berty.tech/go/pkg/bertyprotocol"
	"berty.tech/go/pkg/chatmodel"
	"berty.tech/go/pkg/errcode"
)

func (c *client) ContactList(req *ContactList_Request, stream ChatService_ContactListServer) error {
	contacts := []*chatmodel.Contact{
		fakeContact(c.logger),
		fakeContact(c.logger),
		fakeContact(c.logger),
		fakeContact(c.logger),
		fakeContact(c.logger),
		fakeContact(c.logger),
		fakeContact(c.logger),
		fakeContact(c.logger),
	}

	for _, contact := range contacts {
		err := stream.Send(&ContactList_Reply{
			Contact: contact,
		})

		if err != nil {
			return err
		}
	}

	return nil
}

func (c *client) ContactGet(ctx context.Context, in *ContactGet_Request) (*ContactGet_Reply, error) {
	bpContacts, err := c.protocol.ContactGet(ctx, &bertyprotocol.ContactGet_Request{})
	if err != nil {
		return nil, err
	}
	fmt.Println(bpContacts)

	ret := &ContactGet_Reply{
		Contact: fakeContact(c.logger),
	}
	return ret, nil
}

func (c *client) ContactBlock(context.Context, *ContactBlock_Request) (*ContactBlock_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) ContactRemove(context.Context, *ContactRemove_Request) (*ContactRemove_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) ContactRequestSend(context.Context, *ContactRequestSend_Request) (*ContactRequestSend_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) ContactRequestAccept(context.Context, *ContactRequestAccept_Request) (*ContactRequestAccept_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
func (c *client) ContactRequestDecline(context.Context, *ContactRequestDecline_Request) (*ContactRequestDecline_Reply, error) {
	return nil, errcode.ErrNotImplemented
}
