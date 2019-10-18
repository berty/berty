package errcode

import (
	"fmt"
	"testing"

	"github.com/pkg/errors"
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
		name           string
		input          error
		expectedString string
		expectedCode   int32
		expectedCause  error
	}{
		{
			"ErrNotImplemented",
			ErrNotImplemented,
			"ErrNotImplemented(#777)",
			777,
			ErrNotImplemented,
		}, {
			"ErrInternal",
			ErrInternal,
			"ErrInternal(#999)",
			999,
			ErrInternal,
		}, {
			"ErrNotImplemented.Wrap(errStdHello)",
			ErrNotImplemented.Wrap(errStdHello),
			"ErrNotImplemented(#777): hello",
			777,
			errStdHello,
		}, {
			"ErrNotImplemented.Wrap(ErrInternal)",
			ErrNotImplemented.Wrap(ErrInternal),
			"ErrNotImplemented(#777): ErrInternal(#999)",
			777,
			ErrInternal,
		}, {
			"ErrNotImplemented.Wrap(ErrInternal.Wrap(errStdHello))",
			ErrNotImplemented.Wrap(ErrInternal.Wrap(errStdHello)),
			"ErrNotImplemented(#777): ErrInternal(#999): hello",
			777,
			errStdHello,
		}, {
			`errors.Wrap(ErrNotImplemented, "blah")`,
			errors.Wrap(ErrNotImplemented, "blah"),
			"blah: ErrNotImplemented(#777)",
			-1,
			ErrNotImplemented,
		}, {
			`errors.Wrap(ErrNotImplemented.Wrap(ErrInternal), "blah")`,
			errors.Wrap(ErrNotImplemented.Wrap(ErrInternal), "blah"),
			"blah: ErrNotImplemented(#777): ErrInternal(#999)",
			-1,
			ErrInternal,
		}, {
			"nil",
			nil,
			"<nil>",
			-1,
			nil,
		}, {
			"errStdHello",
			errStdHello,
			"hello",
			-1,
			errStdHello,
		}, {
			"errCodeUndef",
			errCodeUndef,
			"UNKNOWN_ERRCODE(#65530)",
			65530,
			errCodeUndef,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			actualString := fmt.Sprint(test.input)
			if test.expectedString != actualString {
				t.Errorf("Expected string to be %q, got %q.", test.expectedString, actualString)
			}

			actualCode := Code(test.input)
			if test.expectedCode != actualCode {
				t.Errorf("Expected code to be %d, got %d.", test.expectedCode, actualCode)
			}

			actualCause := errors.Cause(test.input)
			if test.expectedCause != actualCause {
				t.Errorf("Expected cause to be %v, got %v.", test.expectedCause, actualCause)
			}
		})
	}
}
