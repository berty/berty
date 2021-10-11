package bertybridge

import "berty.tech/berty/v2/go/internal/sysutil"

type NativeKeystoreDriver interface {
	sysutil.NativeKeystore
}
