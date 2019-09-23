package envelope

import (
	"berty.tech/go/pkg/iface"
)

var _ iface.CryptoEnvelope = (*Envelope)(nil)
