package bertybridge

import "berty.tech/berty/v2/go/internal/accountutils"

type NativeKeystoreDriver interface {
	accountutils.NativeKeystore
}
