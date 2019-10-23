package errcode

import (
	"fmt"
	"testing"

	"github.com/pkg/errors"
)

func TestError(t *testing.T) {
	// test instance
	var (
		_ ProtocolErrCode = ErrProtocolNotImplemented
		_ error           = ErrProtocolNotImplemented
		_ WithCode        = ErrProtocolNotImplemented
		_ ChatErrCode     = ErrChatNotImplemented
		_ error           = ErrChatNotImplemented
		_ WithCode        = ErrChatNotImplemented
	)

	// table-driven tests
	var (
		errStdHello  = fmt.Errorf("hello")
		errCodeUndef = ProtocolErrCode(65530) // simulate a client receiving an error generated from a more recent API
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
			"ErrProtocolNotImplemented",
			ErrProtocolNotImplemented,
			"ErrProtocolNotImplemented(#2002)",
			ErrProtocolNotImplemented,
			2002,
			2002,
			2002,
		}, {
			"ErrChatInternal",
			ErrChatInternal,
			"ErrChatInternal(#1003)",
			ErrChatInternal,
			1003,
			1003,
			1003,
		}, {
			"ErrProtocolNotImplemented.Wrap(errStdHello)",
			ErrProtocolNotImplemented.Wrap(errStdHello),
			"ErrProtocolNotImplemented(#2002): hello",
			errStdHello,
			2002,
			2002,
			2002,
		}, {
			"ErrProtocolNotImplemented.Wrap(ErrChatInternal)",
			ErrProtocolNotImplemented.Wrap(ErrChatInternal),
			"ErrProtocolNotImplemented(#2002): ErrChatInternal(#1003)",
			ErrChatInternal,
			2002,
			2002,
			1003,
		}, {
			"ErrProtocolNotImplemented.Wrap(ErrChatInternal.Wrap(errStdHello))",
			ErrProtocolNotImplemented.Wrap(ErrChatInternal.Wrap(errStdHello)),
			"ErrProtocolNotImplemented(#2002): ErrChatInternal(#1003): hello",
			errStdHello,
			2002,
			2002,
			1003,
		}, {
			`errors.Wrap(ErrProtocolNotImplemented,blah)`,
			errors.Wrap(ErrProtocolNotImplemented, "blah"),
			"blah: ErrProtocolNotImplemented(#2002)",
			ErrProtocolNotImplemented,
			-1,
			2002,
			2002,
		}, {
			`errors.Wrap(ErrProtocolNotImplemented.Wrap(ErrChatInternal),blah)`,
			errors.Wrap(ErrProtocolNotImplemented.Wrap(ErrChatInternal), "blah"),
			"blah: ErrProtocolNotImplemented(#2002): ErrChatInternal(#1003)",
			ErrChatInternal,
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
