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
		name              string
		input             error
		expectedString    string
		expectedCause     error
		expectedCode      int32
		expectedFirstCode int32
		expectedLastCode  int32
	}{
		{
			"ErrNotImplemented",
			ErrNotImplemented,
			"ErrNotImplemented(#777)",
			ErrNotImplemented,
			777,
			777,
			777,
		}, {
			"ErrInternal",
			ErrInternal,
			"ErrInternal(#999)",
			ErrInternal,
			999,
			999,
			999,
		}, {
			"ErrNotImplemented.Wrap(errStdHello)",
			ErrNotImplemented.Wrap(errStdHello),
			"ErrNotImplemented(#777): hello",
			errStdHello,
			777,
			777,
			777,
		}, {
			"ErrNotImplemented.Wrap(ErrInternal)",
			ErrNotImplemented.Wrap(ErrInternal),
			"ErrNotImplemented(#777): ErrInternal(#999)",
			ErrInternal,
			777,
			777,
			999,
		}, {
			"ErrNotImplemented.Wrap(ErrInternal.Wrap(errStdHello))",
			ErrNotImplemented.Wrap(ErrInternal.Wrap(errStdHello)),
			"ErrNotImplemented(#777): ErrInternal(#999): hello",
			errStdHello,
			777,
			777,
			999,
		}, {
			`errors.Wrap(ErrNotImplemented,blah)`,
			errors.Wrap(ErrNotImplemented, "blah"),
			"blah: ErrNotImplemented(#777)",
			ErrNotImplemented,
			-1,
			777,
			777,
		}, {
			`errors.Wrap(ErrNotImplemented.Wrap(ErrInternal),blah)`,
			errors.Wrap(ErrNotImplemented.Wrap(ErrInternal), "blah"),
			"blah: ErrNotImplemented(#777): ErrInternal(#999)",
			ErrInternal,
			-1,
			777,
			999,
		}, {
			"nil",
			nil,
			"<nil>",
			nil,
			-1,
			-1,
			-1,
		}, {
			"errStdHello",
			errStdHello,
			"hello",
			errStdHello,
			-1,
			-1,
			-1,
		}, {
			"errCodeUndef",
			errCodeUndef,
			"UNKNOWN_ERRCODE(#65530)",
			errCodeUndef,
			65530,
			65530,
			65530,
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

			actualCode = FirstCode(test.input)
			if test.expectedFirstCode != actualCode {
				t.Errorf("Expected first-code to be %d, got %d.", test.expectedCode, actualCode)
			}

			actualCode = LastCode(test.input)
			if test.expectedLastCode != actualCode {
				t.Errorf("Expected last-code to be %d, got %d.", test.expectedCode, actualCode)
			}

			actualCause := errors.Cause(test.input)
			if test.expectedCause != actualCause {
				t.Errorf("Expected cause to be %v, got %v.", test.expectedCause, actualCause)
			}
		})
	}
}
