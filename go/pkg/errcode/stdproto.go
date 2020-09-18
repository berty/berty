package errcode

import proto "github.com/golang/protobuf/proto" // nolint:staticcheck // cannot use the new protobuf API while keeping gogoproto

// nolint:gochecknoinits // cannot avoid using this init func
// nolint:staticcheck // cannot use the new protobuf API while keeping gogoproto
func init() {
	// the goal of this file is to register types on non-gogo proto (required by status.Details)
	proto.RegisterEnum("berty.errcode.ErrCode", ErrCode_name, ErrCode_value) // nolint:staticcheck // cannot use the new protobuf API while keeping gogoproto
	proto.RegisterType((*ErrDetails)(nil), "berty.errcode.ErrDetails")       // nolint:staticcheck // cannot use the new protobuf API while keeping gogoproto
}
