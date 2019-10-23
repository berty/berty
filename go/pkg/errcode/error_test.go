package errcode

import (
	"fmt"
	"testing"

	"berty.tech/go/internal/chaterrcode"
	"berty.tech/go/internal/protocolerrcode"
	"github.com/pkg/errors"
)

func TestError(t *testing.T) {
	// test instance
	var (
		_ protocolerrcode.ProtocolErrCode = protocolerrcode.ErrNotImplemented
		_ error                           = protocolerrcode.ErrNotImplemented
		_ WithCode                        = protocolerrcode.ErrNotImplemented
		_ chaterrcode.ChatErrCode         = chaterrcode.ErrNotImplemented
		_ error                           = chaterrcode.ErrNotImplemented
		_ WithCode                        = chaterrcode.ErrNotImplemented
	)

	// table-driven tests
	var (
		errStdHello  = fmt.Errorf("hello")
		errCodeUndef = protocolerrcode.ProtocolErrCode(65530) // simulate a client receiving an error generated from a more recent API
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
			"protocolerrcode.ErrNotImplemented",
			protocolerrcode.ErrNotImplemented,
			"ErrNotImplemented(#2002)",
			protocolerrcode.ErrNotImplemented,
			2002,
			2002,
			2002,
		}, {
			"chaterrcode.ErrInternal",
			chaterrcode.ErrInternal,
			"ErrInternal(#1003)",
			chaterrcode.ErrInternal,
			1003,
			1003,
			1003,
		}, {
			"protocolerrcode.ErrNotImplemented.Wrap(errStdHello)",
			protocolerrcode.ErrNotImplemented.Wrap(errStdHello),
			"ErrNotImplemented(#2002): hello",
			errStdHello,
			2002,
			2002,
			2002,
		}, {
			"protocolerrcode.ErrNotImplemented.Wrap(chaterrcode.ErrInternal)",
			protocolerrcode.ErrNotImplemented.Wrap(chaterrcode.ErrInternal),
			"ErrNotImplemented(#2002): ErrInternal(#1003)",
			chaterrcode.ErrInternal,
			2002,
			2002,
			1003,
		}, {
			"protocolerrcode.ErrNotImplemented.Wrap(chaterrcode.ErrInternal.Wrap(errStdHello))",
			protocolerrcode.ErrNotImplemented.Wrap(chaterrcode.ErrInternal.Wrap(errStdHello)),
			"ErrNotImplemented(#2002): ErrInternal(#1003): hello",
			errStdHello,
			2002,
			2002,
			1003,
		}, {
			`errors.Wrap(protocolerrcode.ErrNotImplemented,blah)`,
			errors.Wrap(protocolerrcode.ErrNotImplemented, "blah"),
			"blah: ErrNotImplemented(#2002)",
			protocolerrcode.ErrNotImplemented,
			-1,
			2002,
			2002,
		}, {
			`errors.Wrap(protocolerrcode.ErrNotImplemented.Wrap(chaterrcode.ErrInternal),blah)`,
			errors.Wrap(protocolerrcode.ErrNotImplemented.Wrap(chaterrcode.ErrInternal), "blah"),
			"blah: ErrNotImplemented(#2002): ErrInternal(#1003)",
			chaterrcode.ErrInternal,
			-1,
			2002,
			1003,
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
