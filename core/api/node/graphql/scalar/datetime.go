package scalar

import (
	"fmt"
	"io"
	"time"
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
	if y.Value == nil {
		w.Write([]byte(`null`))
	} else {
		ret := y.Value.UTC().Format(time.RFC3339)

		w.Write([]byte("\""))
		w.Write([]byte(ret))
		w.Write([]byte("\""))
	}
}
