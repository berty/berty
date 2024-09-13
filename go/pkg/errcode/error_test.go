package errcode

import (
	"fmt"
	"testing"

	"github.com/pkg/errors"
	"github.com/stretchr/testify/assert"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

var (
	errStdHello  = fmt.Errorf("hello")
	errCodeUndef = ErrCode(65530) // simulate a client receiving an error generated from a more recent API
)

func TestError(t *testing.T) {
	// test instance
	var (
		_ ErrCode  = ErrCode_ErrNotImplemented
		_ error    = ErrCode_ErrNotImplemented
		_ WithCode = ErrCode_ErrNotImplemented
	)

	// table-driven tests
	tests := []struct {
		name             string
		input            error
		expectedString   string
		expectedCause    error
		expectedCode     ErrCode
		expectedLastCode ErrCode
		expectedCodes    []ErrCode
		has777           bool
		has888           bool
		is777            bool
		is888            bool
	}{
		{"ErrInternal", ErrCode_ErrInternal, "ErrInternal(#888)", ErrCode_ErrInternal, 888, 888, []ErrCode{888}, false, true, false, true},
		{"ErrNotImplemented", ErrCode_ErrNotImplemented, "ErrNotImplemented(#777)", ErrCode_ErrNotImplemented, 777, 777, []ErrCode{777}, true, false, true, false},
		{"ErrNotImplemented.Wrap(ErrInternal)", ErrCode_ErrNotImplemented.Wrap(ErrCode_ErrInternal), "ErrNotImplemented(#777): ErrInternal(#888)", ErrCode_ErrInternal, 777, 888, []ErrCode{777, 888}, true, true, true, false},
		{"ErrNotImplemented.Wrap(ErrInternal.Wrap(TODO))", ErrCode_ErrNotImplemented.Wrap(ErrCode_ErrInternal.Wrap(ErrCode_TODO)), "ErrNotImplemented(#777): ErrInternal(#888): TODO(#666)", ErrCode_TODO, 777, 666, []ErrCode{777, 888, 666}, true, true, true, false},
		{"ErrNotImplemented.Wrap(ErrInternal.Wrap(errStdHello))", ErrCode_ErrNotImplemented.Wrap(ErrCode_ErrInternal.Wrap(errStdHello)), "ErrNotImplemented(#777): ErrInternal(#888): hello", errStdHello, 777, 888, []ErrCode{777, 888}, true, true, true, false},
		{"ErrNotImplemented.Wrap(errStdHello)", ErrCode_ErrNotImplemented.Wrap(errStdHello), "ErrNotImplemented(#777): hello", errStdHello, 777, 777, []ErrCode{777}, true, false, true, false},
		{"errCodeUndef", errCodeUndef, "UNKNOWN_ERRCODE(#65530)", errCodeUndef, 65530, 65530, []ErrCode{65530}, false, false, false, false},
		{"errStdHello", errStdHello, "hello", errStdHello, -1, -1, []ErrCode{}, false, false, false, false},
		{"nil", nil, "<nil>", nil, -1, -1, nil, false, false, false, false},
		{`errors.Wrap(ErrNotImplemented,blah)`, errors.Wrap(ErrCode_ErrNotImplemented, "blah"), "blah: ErrNotImplemented(#777)", ErrCode_ErrNotImplemented, 777, 777, []ErrCode{777}, true, false, false, false},
		{`errors.Wrap(ErrNotImplemented.Wrap(ErrInternal),blah)`, errors.Wrap(ErrCode_ErrNotImplemented.Wrap(ErrCode_ErrInternal), "blah"), "blah: ErrNotImplemented(#777): ErrInternal(#888)", ErrCode_ErrInternal, 777, 888, []ErrCode{777, 888}, true, true, false, false},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			assert.Equal(t, test.expectedString, fmt.Sprint(test.input))
			assert.Equal(t, test.expectedCode, Code(test.input))
			assert.Equal(t, test.expectedLastCode, LastCode(test.input))
			assert.Equal(t, test.expectedCause, errors.Cause(test.input))
			assert.Equal(t, test.expectedCodes, Codes(test.input))
			assert.Equal(t, test.has777, Has(test.input, ErrCode_ErrNotImplemented))
			assert.Equal(t, test.has888, Has(test.input, ErrCode_ErrInternal))
			assert.Equal(t, test.is777, Is(test.input, ErrCode_ErrNotImplemented))
			assert.Equal(t, test.is888, Is(test.input, ErrCode_ErrInternal))
		})
	}
}

func TestStatus(t *testing.T) {
	tests := []struct {
		name             string
		input            error
		has777           bool
		has888           bool
		expectedGrpcCode codes.Code
		hasGrpcStatus    bool
	}{
		{"ErrInternal", ErrCode_ErrInternal, false, true, codes.Unavailable, true},
		{"ErrNotImplemented", ErrCode_ErrNotImplemented, true, false, codes.Unavailable, true},
		{"ErrNotImplemented.Wrap(ErrInternal)", ErrCode_ErrNotImplemented.Wrap(ErrCode_ErrInternal), true, true, codes.Unavailable, true},
		{"ErrNotImplemented.Wrap(ErrInternal.Wrap(ErrNotImplemented))", ErrCode_ErrNotImplemented.Wrap(ErrCode_ErrInternal.Wrap(ErrCode_ErrNotImplemented)), true, true, codes.Unavailable, true},
		{"ErrNotImplemented.Wrap(ErrInternal.Wrap(TODO))", ErrCode_ErrNotImplemented.Wrap(ErrCode_ErrInternal.Wrap(ErrCode_TODO)), true, true, codes.Unavailable, true},
		{"ErrNotImplemented.Wrap(ErrInternal.Wrap(errStdHello))", ErrCode_ErrNotImplemented.Wrap(ErrCode_ErrInternal.Wrap(errStdHello)), true, true, codes.Unavailable, true},
		{"ErrNotImplemented.Wrap(errStdHello)", ErrCode_ErrNotImplemented.Wrap(errStdHello), true, false, codes.Unavailable, true},
		{"errCodeUndef", errCodeUndef, false, false, codes.Unavailable, true},
		{"errStdHello", errStdHello, false, false, codes.Unknown, false},
		{"nil", nil, false, false, codes.OK, true},
		{`errors.Wrap(ErrNotImplemented,blah)`, errors.Wrap(ErrCode_ErrNotImplemented, "blah"), true, false, codes.Unavailable, true},
		{`errors.Wrap(ErrNotImplemented.Wrap(ErrInternal},blah)`, errors.Wrap(ErrCode_ErrNotImplemented.Wrap(ErrCode_ErrInternal), "blah"), true, true, codes.Unavailable, true},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			st, ok := status.FromError(test.input)
			assert.Equal(t, test.hasGrpcStatus, ok)
			if test.input != nil {
				assert.Error(t, st.Err())
				assert.Equal(t, st.Message(), test.input.Error())
			}
			if test.hasGrpcStatus {
				stErr := st.Err()
				if test.input != nil {
					assert.NotNil(t, st)
					assert.Error(t, stErr)
				}
				assert.Equal(t, st.Code().String(), test.expectedGrpcCode.String())
				assert.Equal(t, Code(test.input), Code(stErr))
				assert.Equal(t, LastCode(test.input), LastCode(stErr))
				assert.Equal(t, LastCode(test.input), LastCode(stErr))
				assert.Equal(t, Codes(test.input), Codes(stErr))
			}
		})
	}
}
