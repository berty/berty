package cryptoutil

import (
	"math/big"

	"berty.tech/berty/v2/go/pkg/errcode"
)

// shim for go1.14
func bigIntFillBytes(bi *big.Int, buf []byte) {
	// Clear whole buffer. (This gets optimized into a memclr.)
	for i := range buf {
		buf[i] = 0
	}

	bytes := bi.Bytes()
	max := len(bytes)
	if len(buf) < max {
		max = len(buf)
	}
	for i := 0; i < max; i++ {
		buf[i] = bytes[i]
	}
}

func mapBufArray(in [][]byte, transform func([]byte) ([]byte, error)) ([][]byte, error) {
	var err error
	out := make([][]byte, len(in))
	for i, elem := range in {
		out[i], err = transform(elem)
		if err != nil {
			return nil, errcode.ErrMap.Wrap(err)
		}
	}
	return out, nil
}
