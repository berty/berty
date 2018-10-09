// Code generated by protoc-gen-gogo. DO NOT EDIT.
// source: api/protobuf/graphql.proto

package protobuf // import "berty.tech/core/api/protobuf"

import proto "github.com/golang/protobuf/proto"
import fmt "fmt"
import math "math"
import descriptor "github.com/golang/protobuf/protoc-gen-go/descriptor"

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// This is a compile-time assertion to ensure that this generated file
// is compatible with the proto package it is being compiled against.
// A compilation error at this line likely means your copy of the
// proto package needs to be updated.
const _ = proto.ProtoPackageIsVersion2 // please upgrade the proto package

var E_GraphqlFields = &proto.ExtensionDesc{
	ExtendedType:  (*descriptor.MethodOptions)(nil),
	ExtensionType: (*string)(nil),
	Field:         53001,
	Name:          "berty.gql.graphql_fields",
	Tag:           "bytes,53001,opt,name=graphql_fields,json=graphqlFields",
	Filename:      "api/protobuf/graphql.proto",
}

var E_GraphqlType = &proto.ExtensionDesc{
	ExtendedType:  (*descriptor.MethodOptions)(nil),
	ExtensionType: (*string)(nil),
	Field:         53002,
	Name:          "berty.gql.graphql_type",
	Tag:           "bytes,53002,opt,name=graphql_type,json=graphqlType",
	Filename:      "api/protobuf/graphql.proto",
}

var E_GraphqlInterface = &proto.ExtensionDesc{
	ExtendedType:  (*descriptor.MethodOptions)(nil),
	ExtensionType: (*string)(nil),
	Field:         53003,
	Name:          "berty.gql.graphql_interface",
	Tag:           "bytes,53003,opt,name=graphql_interface,json=graphqlInterface",
	Filename:      "api/protobuf/graphql.proto",
}

var E_GraphqlId = &proto.ExtensionDesc{
	ExtendedType:  (*descriptor.FieldOptions)(nil),
	ExtensionType: (*bool)(nil),
	Field:         53004,
	Name:          "berty.gql.graphql_id",
	Tag:           "varint,53004,opt,name=graphql_id,json=graphqlId",
	Filename:      "api/protobuf/graphql.proto",
}

var E_GraphqlResolver = &proto.ExtensionDesc{
	ExtendedType:  (*descriptor.FieldOptions)(nil),
	ExtensionType: (*bool)(nil),
	Field:         53005,
	Name:          "berty.gql.graphql_resolver",
	Tag:           "varint,53005,opt,name=graphql_resolver,json=graphqlResolver",
	Filename:      "api/protobuf/graphql.proto",
}

func init() {
	proto.RegisterExtension(E_GraphqlFields)
	proto.RegisterExtension(E_GraphqlType)
	proto.RegisterExtension(E_GraphqlInterface)
	proto.RegisterExtension(E_GraphqlId)
	proto.RegisterExtension(E_GraphqlResolver)
}

func init() { proto.RegisterFile("api/protobuf/graphql.proto", fileDescriptor_graphql_47df7f5e3c95b5b1) }

var fileDescriptor_graphql_47df7f5e3c95b5b1 = []byte{
	// 270 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0x84, 0xd1, 0xbd, 0x4a, 0xc5, 0x30,
	0x14, 0xc0, 0x71, 0x8b, 0x20, 0x36, 0x7e, 0x77, 0x92, 0x8b, 0x86, 0x3b, 0x3a, 0xa5, 0x83, 0x5b,
	0x06, 0x07, 0x05, 0x45, 0xe1, 0x22, 0x14, 0x27, 0x97, 0x4b, 0xdb, 0x9c, 0xb6, 0x81, 0x70, 0x93,
	0x9b, 0x46, 0xa1, 0x8f, 0xe0, 0xd7, 0xee, 0xe4, 0xf3, 0x38, 0xfa, 0x08, 0x52, 0x5f, 0x44, 0x48,
	0x4f, 0x54, 0x70, 0xe8, 0x16, 0xc2, 0xf9, 0xff, 0x38, 0x70, 0xc8, 0x24, 0x37, 0x32, 0x35, 0x56,
	0x3b, 0x5d, 0xdc, 0x55, 0x69, 0x6d, 0x73, 0xd3, 0x2c, 0x15, 0xf3, 0x1f, 0x49, 0x5c, 0x80, 0x75,
	0x1d, 0xab, 0x97, 0x6a, 0x32, 0xad, 0xb5, 0xae, 0x15, 0xfc, 0x4e, 0x0a, 0x68, 0x4b, 0x2b, 0x8d,
	0xd3, 0x76, 0x18, 0xe6, 0x17, 0x64, 0x1b, 0xeb, 0x79, 0x25, 0x41, 0x89, 0x36, 0xa1, 0x6c, 0x88,
	0x58, 0x88, 0xd8, 0x0c, 0x5c, 0xa3, 0xc5, 0xb5, 0x71, 0x52, 0x2f, 0xda, 0xfd, 0x87, 0xb7, 0xd5,
	0x69, 0x74, 0x14, 0x67, 0x5b, 0xd8, 0x9d, 0xfb, 0x8c, 0x9f, 0x91, 0xcd, 0x00, 0xb9, 0xce, 0xc0,
	0x28, 0xf3, 0x88, 0xcc, 0x06, 0x56, 0x37, 0x9d, 0x01, 0x3e, 0x23, 0x7b, 0x01, 0x91, 0x0b, 0x07,
	0xb6, 0xca, 0xcb, 0x71, 0xe9, 0x09, 0xa5, 0x5d, 0x4c, 0x2f, 0x43, 0xc9, 0x4f, 0x08, 0xf9, 0xe1,
	0x44, 0x72, 0xf8, 0xcf, 0xf1, 0xab, 0x07, 0xe6, 0xd9, 0x33, 0xeb, 0x59, 0x1c, 0x18, 0xc1, 0xaf,
	0x48, 0x30, 0xe7, 0x16, 0x5a, 0xad, 0xee, 0xc1, 0x8e, 0x29, 0x2f, 0xa8, 0xec, 0x60, 0x98, 0x61,
	0x77, 0xca, 0xde, 0x7b, 0x1a, 0x7d, 0xf4, 0x34, 0xfa, 0xec, 0x69, 0xf4, 0xfa, 0x45, 0x57, 0x6e,
	0x0f, 0x86, 0x3b, 0x39, 0x28, 0x9b, 0xb4, 0xd4, 0x16, 0xd2, 0xbf, 0x37, 0x2d, 0xd6, 0xfc, 0xeb,
	0xf8, 0x3b, 0x00, 0x00, 0xff, 0xff, 0xc0, 0xc9, 0x49, 0x8a, 0xea, 0x01, 0x00, 0x00,
}
