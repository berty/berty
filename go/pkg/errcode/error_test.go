package errcode

import (
	"fmt"
	"testing"

	"github.com/pkg/errors"
	"github.com/stretchr/testify/assert"
)

func TestError(t *testing.T) {
	// test instance
	var (
		_ ErrCode  = ErrNotImplemented
		_ error    = ErrNotImplemented
		_ WithCode = ErrNotImplemented
	)

	// table-driven tests
	var (
		errStdHello  = fmt.Errorf("hello")
		errCodeUndef = ErrCode(65530) // simulate a client receiving an error generated from a more recent API
	)
	var tests = []struct {
		name              string
		input             error
		expectedString    string
		expectedCause     error
		expectedCode      int32
		expectedFirstCode int32
		expectedLastCode  int32
	}{
		{"ErrNotImplemented", ErrNotImplemented, "ErrNotImplemented(#777)", ErrNotImplemented, 777, 777, 777},
		{"ErrInternal", ErrInternal, "ErrInternal(#888)", ErrInternal, 888, 888, 888},
		{"ErrNotImplemented.Wrap(errStdHello)", ErrNotImplemented.Wrap(errStdHello), "ErrNotImplemented(#777): hello", errStdHello, 777, 777, 777},
		{"ErrNotImplemented.Wrap(ErrInternal)", ErrNotImplemented.Wrap(ErrInternal), "ErrNotImplemented(#777): ErrInternal(#888)", ErrInternal, 777, 777, 888},
		{"ErrNotImplemented.Wrap(ErrInternal.Wrap(errStdHello))", ErrNotImplemented.Wrap(ErrInternal.Wrap(errStdHello)), "ErrNotImplemented(#777): ErrInternal(#888): hello", errStdHello, 777, 777, 888},
		{`errors.Wrap(ErrNotImplemented,blah)`, errors.Wrap(ErrNotImplemented, "blah"), "blah: ErrNotImplemented(#777)", ErrNotImplemented, -1, 777, 777},
		{`errors.Wrap(ErrNotImplemented.Wrap(ErrInternal),blah)`, errors.Wrap(ErrNotImplemented.Wrap(ErrInternal), "blah"), "blah: ErrNotImplemented(#777): ErrInternal(#888)", ErrInternal, -1, 777, 888},
		{"nil", nil, "<nil>", nil, -1, -1, -1},
		{"errStdHello", errStdHello, "hello", errStdHello, -1, -1, -1},
		{"errCodeUndef", errCodeUndef, "UNKNOWN_ERRCODE(#65530)", errCodeUndef, 65530, 65530, 65530},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			assert.Equal(t, test.expectedString, fmt.Sprint(test.input))
			assert.Equal(t, test.expectedCode, Code(test.input))
			assert.Equal(t, test.expectedFirstCode, FirstCode(test.input))
			assert.Equal(t, test.expectedLastCode, LastCode(test.input))
			assert.Equal(t, test.expectedCause, errors.Cause(test.input))
		})
	}
}
