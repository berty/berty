package scalar

import (
	"fmt"
	"io"
	"time"

	"go.uber.org/zap"
)

type DateTime struct {
	Value *time.Time
}

// UnmarshalGQL implements the graphql.Marshaler interface
func (y *DateTime) UnmarshalGQL(v interface{}) error {
	value, ok := v.(string)
	if !ok {
		return fmt.Errorf("points must be strings")
	}

	parsedTime, err := time.Parse(time.RFC3339, value)

	if err != nil {
		return err
	}

	y.Value = &parsedTime

	return nil
}

// MarshalGQL implements the graphql.Marshaler interface
func (y DateTime) MarshalGQL(w io.Writer) {
	var err error

	if y.Value == nil {
		if _, err = w.Write([]byte(`null`)); err != nil {
			zap.L().Error("Write error", zap.Error(err))
		}
	} else {
		ret := y.Value.UTC().Format(time.RFC3339)
		if _, err = w.Write([]byte("\"")); err != nil {
			zap.L().Error("Write error", zap.Error(err))
		}
		if _, err = w.Write([]byte(ret)); err != nil {
			zap.L().Error("Write error", zap.Error(err))
		}

		if _, err = w.Write([]byte("\"")); err != nil {
			zap.L().Error("Write error", zap.Error(err))
		}
	}
}
