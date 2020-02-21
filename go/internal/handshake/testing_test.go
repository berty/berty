package handshake

import (
	"testing"

	"berty.tech/berty/go/pkg/errcode"
	"github.com/stretchr/testify/assert"
)

func testSameErrcodes(t *testing.T, expected, got error) {
	t.Helper()

	assert.Equalf(
		t,
		errcode.ErrCode_name[errcode.Code(expected)],
		errcode.ErrCode_name[errcode.Code(got)],
		"%v", got,
	)
}
