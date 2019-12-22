package handshake

import (
	"testing"

	"berty.tech/berty/go/pkg/errcode"
	"github.com/stretchr/testify/assert"
)

func checkErr(t *testing.T, err error, msgs ...interface{}) {
	t.Helper()

	if !assert.NoError(t, err, msgs...) {
		t.Fatal("fatal")
	}
}

func testSameErrcodes(t *testing.T, expected, got error) {
	t.Helper()

	assert.Equalf(
		t,
		errcode.ErrCode_name[errcode.Code(expected)],
		errcode.ErrCode_name[errcode.Code(got)],
		"%v", got,
	)
}
