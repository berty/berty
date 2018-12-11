package errorcodes

import (
	"fmt"
	"testing"

	"github.com/pkg/errors"
	. "github.com/smartystreets/goconvey/convey"
	"google.golang.org/genproto/googleapis/rpc/errdetails"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func Test(t *testing.T) {
	errs := map[string]func() error{}
	errs["basic"] = func() error { return fmt.Errorf("basic error") }
	errs["wrap-basic"] = func() error { return errors.Wrap(errs["basic"](), "wrapmsg") }
	errs["wrap-wrap-basic"] = func() error { return errors.Wrap(errs["wrap-basic"](), "wrapmsg") }
	errs["wrap-wrap-wrap-basic"] = func() error { return errors.Wrap(errs["wrap-wrap-basic"](), "wrapmsg") }
	errs["errcode-serialization"] = func() error { return ErrSerialization.New() }
	errs["errcode-serialization-wrap-basic"] = func() error { return ErrSerialization.Wrap(errs["basic"]()) }
	errs["errcode-serialization-wrap-wrap-basic"] = func() error { return ErrSerialization.Wrap(errs["wrap-basic"]()) }
	errs["errcode-with-extensions"] = func() error { return ErrContactReqKey.New() }
	errs["errcode-newargs"] = func() error {
		return ErrContactReqKey.NewArgs(map[string]string{"hello": "world", "hi": "planet"})
	}
	errs["grpc-status"] = func() error { return status.New(codes.DataLoss, "grpc-status").Err() }
	errs["errcode-grpc-status"] = func() error { return ErrContactReqKey.Wrap(errs["grpc-status"]()) }
	errs["wrap-grpc-status"] = func() error { return errors.Wrap(errs["grpc-status"](), "wrap") }
	errs["wrap-wrap-wrap"] = func() error { return ErrContactReqKey.Wrap(errs["errcode-serialization-wrap-wrap-basic"]()) }
	errs["wrap-nil"] = func() error { return ErrContactReqKey.Wrap(nil) }
	errs["wrap-basic-wrap"] = func() error { return errors.Wrap(errs["wrap-wrap-wrap"](), "wrapmsg") }
	errs["badrequest1"] = func() error {
		return WithDetails(
			ErrValidationInput.New(),
			&errdetails.BadRequest{FieldViolations: []*errdetails.BadRequest_FieldViolation{
				{Field: "abcd", Description: "invalid input"},
				{Field: "efgh", Description: "field should not be empty"},
			}},
		)
	}
	errs["badrequest2"] = func() error {
		return ErrValidationInput.New().WithDetails(
			&errdetails.BadRequest{FieldViolations: []*errdetails.BadRequest_FieldViolation{
				{Field: "abcd", Description: "invalid input"},
				{Field: "efgh", Description: "field should not be empty"},
			}},
		)
	}

	Convey("Test Error.Error()", t, func() {
		expected := map[string]string{
			"errcode-serialization-wrap-wrap-basic": "ErrSerialization: wrapmsg: basic error",
			"wrap-grpc-status":                      "wrap: rpc error: code = DataLoss desc = grpc-status",
			"wrap-wrap-wrap":                        "ErrContactReqKey: ErrSerialization: wrapmsg: basic error",
			"wrap-basic-wrap":                       "wrapmsg: ErrContactReqKey: ErrSerialization: wrapmsg: basic error",
			"basic":                                 "basic error",
			"errcode-with-extensions":               "ErrContactReqKey",
			"errcode-grpc-status":                   "ErrContactReqKey: rpc error: code = DataLoss desc = grpc-status",
			"wrap-nil":                              "ErrContactReqKey",
			"errcode-serialization":                 "ErrSerialization",
			"errcode-serialization-wrap-basic":      "ErrSerialization: basic error",
			"errcode-newargs":                       `ErrContactReqKey {"hello":"world","hi":"planet"}`,
			"grpc-status":                           "rpc error: code = DataLoss desc = grpc-status",
			"badrequest2":                           "ErrValidationInput",
			"wrap-wrap-wrap-basic":                  "wrapmsg: wrapmsg: wrapmsg: basic error",
			"wrap-wrap-basic":                       "wrapmsg: wrapmsg: basic error",
			"badrequest1":                           "ErrValidationInput",
			"wrap-basic":                            "wrapmsg: basic error",
		}
		for key, errFn := range errs {
			err := errFn()
			So(err, ShouldNotBeNil)
			//fmt.Printf("%q: %q,\n", key, err.Error())
			So(err.Error(), ShouldEqual, expected[key])
		}
	})
	Convey(`Test Error.Format("%+v")`, t, nil)
	Convey("Test with gRPC", t, nil)
}
