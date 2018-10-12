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

var E_GraphqlSpread = &proto.ExtensionDesc{
	ExtendedType:  (*descriptor.FieldOptions)(nil),
	ExtensionType: (*bool)(nil),
	Field:         53006,
	Name:          "berty.gql.graphql_spread",
	Tag:           "varint,53006,opt,name=graphql_spread,json=graphqlSpread",
	Filename:      "api/protobuf/graphql.proto",
}

func init() {
	proto.RegisterExtension(E_GraphqlFields)
	proto.RegisterExtension(E_GraphqlType)
	proto.RegisterExtension(E_GraphqlInterface)
	proto.RegisterExtension(E_GraphqlId)
	proto.RegisterExtension(E_GraphqlResolver)
	proto.RegisterExtension(E_GraphqlSpread)
}

func init() { proto.RegisterFile("api/protobuf/graphql.proto", fileDescriptor_graphql_e7a0f013e0eb6706) }

var fileDescriptor_graphql_e7a0f013e0eb6706 = []byte{
	// 288 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0x84, 0xd2, 0xbd, 0x4a, 0xc4, 0x40,
	0x10, 0xc0, 0x71, 0x83, 0x20, 0x66, 0xfd, 0x4e, 0x25, 0x87, 0x86, 0x2b, 0xad, 0x36, 0x85, 0xdd,
	0x16, 0x16, 0x0a, 0x27, 0x0a, 0x87, 0x10, 0xad, 0x6c, 0x8e, 0x7c, 0x4c, 0x3e, 0x20, 0xdc, 0xee,
	0xcd, 0xae, 0x42, 0x1e, 0xc1, 0xcf, 0xda, 0xca, 0xe7, 0xb1, 0xf4, 0x11, 0x24, 0xbe, 0x88, 0xb0,
	0x99, 0xf5, 0x04, 0x8b, 0x74, 0x21, 0xcc, 0xff, 0xc7, 0x30, 0x09, 0x1b, 0x25, 0xaa, 0x8e, 0x14,
	0x4a, 0x23, 0xd3, 0xbb, 0x22, 0x2a, 0x31, 0x51, 0xd5, 0xa2, 0xe1, 0xf6, 0x45, 0xe0, 0xa7, 0x80,
	0xa6, 0xe5, 0xe5, 0xa2, 0x19, 0x8d, 0x4b, 0x29, 0xcb, 0x06, 0x96, 0x93, 0x39, 0xe8, 0x0c, 0x6b,
	0x65, 0x24, 0xf6, 0xc3, 0xe2, 0x9c, 0x6d, 0x53, 0x3d, 0x2b, 0x6a, 0x68, 0x72, 0x1d, 0x84, 0xbc,
	0x8f, 0xb8, 0x8b, 0xf8, 0x14, 0x4c, 0x25, 0xf3, 0x2b, 0x65, 0x6a, 0x39, 0xd7, 0xfb, 0x0f, 0xef,
	0xab, 0x63, 0xef, 0xc8, 0x8f, 0xb7, 0xa8, 0x9b, 0xd8, 0x4c, 0x9c, 0xb1, 0x4d, 0x07, 0x99, 0x56,
	0xc1, 0x20, 0xf3, 0x48, 0xcc, 0x06, 0x55, 0x37, 0xad, 0x02, 0x31, 0x65, 0x7b, 0x0e, 0xa9, 0xe7,
	0x06, 0xb0, 0x48, 0xb2, 0x61, 0xe9, 0x89, 0xa4, 0x5d, 0x4a, 0x2f, 0x5c, 0x29, 0x4e, 0x18, 0xfb,
	0xe5, 0xf2, 0xe0, 0xf0, 0x9f, 0x63, 0x57, 0x77, 0xcc, 0xb3, 0x65, 0xd6, 0x63, 0xdf, 0x31, 0xb9,
	0xb8, 0x64, 0xce, 0x9c, 0x21, 0x68, 0xd9, 0xdc, 0x03, 0x0e, 0x29, 0x2f, 0xa4, 0xec, 0x50, 0x18,
	0x53, 0x27, 0x26, 0xcb, 0x43, 0x6b, 0x85, 0x90, 0x0c, 0xee, 0xf3, 0x4a, 0x92, 0xbb, 0xf3, 0xb5,
	0xad, 0x4e, 0xf9, 0x47, 0x17, 0x7a, 0x9f, 0x5d, 0xe8, 0x7d, 0x75, 0xa1, 0xf7, 0xf6, 0x1d, 0xae,
	0xdc, 0x1e, 0xf4, 0xdf, 0xdb, 0x40, 0x56, 0x45, 0x99, 0x44, 0x88, 0xfe, 0xfe, 0x1b, 0xe9, 0x9a,
	0x7d, 0x3a, 0xfe, 0x09, 0x00, 0x00, 0xff, 0xff, 0xf0, 0x35, 0x0d, 0x63, 0x32, 0x02, 0x00, 0x00,
}
