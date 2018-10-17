package models

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"strconv"
	"time"

	"github.com/99designs/gqlgen/graphql"
	"go.uber.org/zap"
)

// type ID struct {
// 	Table string
// 	ID    string
// }
//
// func (id *ID) MarshalID(w io.Writer) {
// 	w.Write([]byte(base64.StdEncoding.EncodeToString([]byte(id.Table + ":" + id.ID))))
// }
//
// func (id *ID) UnmarshalID(v interface{}) error {
// 	logger().Debug("UnmarshalID", zap.String("v", fmt.Sprintf("%+v\n", v)))
// 	switch v := v.(type) {
// 	case nil:
// 		return nil
// 	case string:
// 		decodedID, err := base64.StdEncoding.DecodeString(v)
// 		if err != nil {
// 			return err
// 		}
// 		splitedID := strings.SplitN(string(decodedID), ":", 2)
// 		id.Table = splitedID[0]
// 		id.ID = splitedID[1]
// 		return nil
// 	default:
// 		return nil
// 	}
// }

func MarshalID(v string) graphql.Marshaler {
	return graphql.MarshalID(base64.StdEncoding.EncodeToString([]byte(v)))
}

func UnmarshalID(v interface{}) (string, error) {
	logger().Debug("UnmarshalID", zap.String("v", fmt.Sprintf("%+v\n", v)))
	switch v := v.(type) {
	case nil:
		return "", nil
	case string:
		id, err := base64.StdEncoding.DecodeString(v)
		if err != nil {
			return "", err
		}
		return graphql.UnmarshalID(string(id))
	default:
		return graphql.UnmarshalID(v)
	}
}

func MarshalString(v string) graphql.Marshaler {
	return graphql.MarshalString(v)
}

func UnmarshalString(v interface{}) (string, error) {
	logger().Debug("UnmarshalString", zap.String("v", fmt.Sprintf("%+v\n", v)))
	switch v := v.(type) {
	case nil:
		return "", nil
	default:
		return graphql.UnmarshalString(v)
	}
}

func MarshalTime(t time.Time) graphql.Marshaler {
	return graphql.MarshalTime(t)
}

func UnmarshalTime(v interface{}) (time.Time, error) {
	logger().Debug("UnmarshalTime", zap.String("v", fmt.Sprintf("%+v\n", v)))
	switch v := v.(type) {
	case nil:
		return time.Time{}, nil
	case json.Number:
	case string:
		if len(v) == 0 {
			return time.Time{}, nil
		}
		return graphql.UnmarshalTime(v)
	default:
		return graphql.UnmarshalTime(v)
	}
	return graphql.UnmarshalTime(v)
}

func MarshalEnum(v int32) graphql.Marshaler {
	return MarshalInt32(v)
}

func UnmarshalEnum(v interface{}) (int32, error) {
	logger().Debug("UnmarshalEnum", zap.String("v", fmt.Sprintf("%+v\n", v)))
	switch v := v.(type) {
	case nil:
		return 0, nil
	case int64:
	case int:
		return int32(v), nil
	case int32:
		return v, nil
	case string:
	case json.Number:
		res, err := strconv.ParseInt(string(v), 10, 32)
		if err != nil {
			return 0, err
		}
		return int32(res), nil
	default:
		return 0, errors.New("not an enum")
	}
	return int32(v.(int64)), nil
}

func MarshalDouble(v float64) graphql.Marshaler {
	return graphql.MarshalFloat(v)
}

func UnmarshalDouble(v interface{}) (float64, error) {
	logger().Debug("UnmarshalDouble", zap.String("v", fmt.Sprintf("%+v\n", v)))
	switch v := v.(type) {
	case nil:
		return 0.0, nil
	default:
		return graphql.UnmarshalFloat(v)
	}
}

func MarshalInt64(v int64) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		_, err := io.WriteString(w, strconv.FormatInt(v, 10))
		if err != nil {
			logger().Error(err.Error())
			return
		}
	})
}

func UnmarshalInt64(v interface{}) (int64, error) {
	logger().Debug("UnmarshalInt64", zap.String("v", fmt.Sprintf("%+v\n", v)))
	switch v := v.(type) {
	case nil:
		return 0, nil
	case string:
	case json.Number:
		return strconv.ParseInt(string(v), 10, 64)
	case int:
	case int32:
		return int64(v), nil
	case int64:
		return v, nil
	default:
		return 0, fmt.Errorf("%T is not an int64", v)
	}
	return 0, nil
}
func MarshalInt32(v int32) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		_, err := io.WriteString(w, strconv.Itoa(int(v)))
		if err != nil {
			logger().Error(err.Error())
			return
		}
	})
}

func UnmarshalInt32(v interface{}) (int32, error) {
	logger().Debug("UnmarshalInt32", zap.String("v", fmt.Sprintf("%+v\n", v)))
	switch v := v.(type) {
	case nil:
		return 0, nil
	case string:
	case json.Number:
		i, err := strconv.Atoi(string(v))
		return int32(i), err
	case int:
	case int32:
		return v, nil
	case int64:
		return int32(v), nil
	default:
		return 0, fmt.Errorf("%T is not an int32", v)
	}
	return 0, nil
}
func MarshalUint64(v uint64) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		_, err := io.WriteString(w, strconv.FormatUint(v, 10))
		if err != nil {
			logger().Error(err.Error())
			return
		}
	})
}

func UnmarshalUint64(v interface{}) (uint64, error) {
	logger().Debug("UnmarshalUint64", zap.String("v", fmt.Sprintf("%+v\n", v)))
	switch v := v.(type) {
	case nil:
		return 0, nil
	case string:
	case json.Number:
		return strconv.ParseUint(string(v), 10, 64)
	case uint:
	case uint32:
		return uint64(v), nil
	case uint64:
		return v, nil
	default:
		return 0, fmt.Errorf("%T is not an uint64", v)
	}
	return 0, nil
}

func MarshalUint32(v uint32) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		_, err := io.WriteString(w, strconv.FormatUint(uint64(v), 10))
		if err != nil {
			logger().Error(err.Error())
			return
		}
	})
}

func UnmarshalUint32(v interface{}) (uint32, error) {
	logger().Debug("UnmarshalUint32", zap.String("v", fmt.Sprintf("%+v\n", v)))
	switch v := v.(type) {
	case nil:
		return 0, nil
	case string:
	case json.Number:
		i, err := strconv.ParseUint(string(v), 10, 32)
		return uint32(i), err
	case uint:
		return uint32(v), nil
	case uint32:
		return v, nil
	case uint64:
		return uint32(v), nil
	default:
		return 0, fmt.Errorf("%T is not an uint64", v)
	}
	return 0, nil
}

func MarshalSint32(v int32) graphql.Marshaler {
	return MarshalInt32(v)
}

func UnmarshalSint32(v interface{}) (int32, error) {
	return UnmarshalInt32(v)
}

func MarshalFixed64(v uint64) graphql.Marshaler {
	return MarshalUint64(v)
}

func UnmarshalFixed64(v interface{}) (uint64, error) {
	return UnmarshalUint64(v)
}

func MarshalFixed32(v uint32) graphql.Marshaler {
	return MarshalUint32(v)
}

func UnmarshalFixed32(v interface{}) (uint32, error) {
	return UnmarshalUint32(v)
}

func MarshalBool(b bool) graphql.Marshaler {
	return graphql.MarshalBoolean(b)
}

func UnmarshalBool(v interface{}) (bool, error) {
	logger().Debug("UnmarshalBool", zap.String("v", fmt.Sprintf("%+v\n", v)))
	switch v := v.(type) {
	case nil:
		return false, nil
	default:
		return graphql.UnmarshalBoolean(v)
	}
}

func MarshalByte(v byte) graphql.Marshaler {
	return graphql.WriterFunc(func(w io.Writer) {
		_, err := w.Write([]byte(strconv.FormatInt(int64(v), 10)))
		if err != nil {
			logger().Error(err.Error())
			return
		}
	})
}

func UnmarshalByte(v interface{}) (byte, error) {
	logger().Debug("UnmarshalByte", zap.String("v", fmt.Sprintf("%+v\n", v)))
	switch v := v.(type) {
	default:
		i, err := strconv.ParseInt(string(v.(json.Number)), 10, 8)
		if err != nil {
			return 0, err
		}
		return byte(i), nil
	}

}
