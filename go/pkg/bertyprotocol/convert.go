package bertyprotocol

import (
	"berty.tech/go/internal/protocoldb"
	"github.com/gogo/protobuf/proto"
)

func fromDBContact(in *protocoldb.Contact) *Contact {
	// replace marshal by safe & direct copy
	blob, _ := proto.Marshal(in)
	var out Contact
	_ = proto.Unmarshal(blob, &out)
	return &out
}
