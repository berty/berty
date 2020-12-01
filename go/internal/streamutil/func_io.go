package streamutil

import (
	"io"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/errcode"
)

func FuncReader(readFunc func() ([]byte, error), l *zap.Logger) *io.PipeReader {
	in, out := io.Pipe()

	go func() {
		err := func() error {
			for {
				block, err := readFunc()
				if err == io.EOF {
					return nil
				}
				if err != nil {
					return errcode.ErrStreamRead.Wrap(err)
				}
				if _, err := out.Write(block); err != nil {
					return errcode.ErrStreamWrite.Wrap(err)
				}
			}
		}()
		ClosePipeOut(out, err, "FuncReader: close pipe out", l)
	}()

	return in
}

func FuncSink(buffer []byte, reader io.Reader, writeFunc func(block []byte) error) error {
	for {
		n, err := reader.Read(buffer)
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return errcode.ErrStreamRead.Wrap(err)
		}
		if err := writeFunc(buffer[:n]); err != nil {
			return errcode.ErrStreamWrite.Wrap(err)
		}
	}
}

func FuncBlockTransformer(buf []byte, reader io.Reader, l *zap.Logger, transformFunc func(block []byte) ([]byte, error)) *io.PipeReader {
	in, out := io.Pipe()

	go func() {
		err := func() error {
			for {
				n, readErr := io.ReadFull(reader, buf)
				if readErr == io.EOF {
					return nil
				}
				if readErr != nil && readErr != io.ErrUnexpectedEOF {
					return errcode.ErrStreamRead.Wrap(readErr)
				}

				transformed, err := transformFunc(buf[:n])
				if err != nil {
					return errcode.ErrStreamTransform.Wrap(err)
				}

				if _, err := out.Write(transformed); err != nil {
					return errcode.ErrStreamWrite.Wrap(err)
				}

				if readErr == io.ErrUnexpectedEOF {
					return nil // last block can be smaller
				}
			}
		}()
		ClosePipeOut(out, err, "FuncBlockTransformer: close pipe out", l)
	}()

	return in
}

func ClosePipeOut(out *io.PipeWriter, incoming error, errPrefix string, l *zap.Logger) {
	var cErr error
	if incoming == nil || incoming == io.EOF {
		cErr = out.Close()
	} else {
		cErr = out.CloseWithError(incoming)
	}
	if cErr != nil {
		l.Error(errPrefix, zap.Error(cErr))
	}
}
