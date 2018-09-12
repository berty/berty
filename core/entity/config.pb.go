// Code generated by protoc-gen-gogo. DO NOT EDIT.
// source: entity/config.proto

package entity // import "berty.tech/core/entity"

import proto "github.com/golang/protobuf/proto"
import fmt "fmt"
import math "math"
import _ "github.com/gogo/protobuf/gogoproto"
import _ "github.com/golang/protobuf/ptypes/timestamp"

import time "time"

import github_com_gogo_protobuf_types "github.com/gogo/protobuf/types"

import io "io"

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf
var _ = time.Kitchen

// This is a compile-time assertion to ensure that this generated file
// is compatible with the proto package it is being compiled against.
// A compilation error at this line likely means your copy of the
// proto package needs to be updated.
const _ = proto.ProtoPackageIsVersion2 // please upgrade the proto package

type Config struct {
	ID                   string     `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty" gorm:"primary_key"`
	CreatedAt            time.Time  `protobuf:"bytes,2,opt,name=created_at,json=createdAt,stdtime" json:"created_at"`
	UpdatedAt            time.Time  `protobuf:"bytes,3,opt,name=updated_at,json=updatedAt,stdtime" json:"updated_at"`
	DeletedAt            *time.Time `protobuf:"bytes,4,opt,name=deleted_at,json=deletedAt,stdtime" json:"deleted_at,omitempty"`
	Myself               *Contact   `protobuf:"bytes,5,opt,name=myself" json:"myself,omitempty"`
	MyselfID             string     `protobuf:"bytes,6,opt,name=myself_id,json=myselfId,proto3" json:"myself_id,omitempty"`
	CurrentDevice        *Device    `protobuf:"bytes,7,opt,name=current_device,json=currentDevice" json:"current_device,omitempty"`
	CurrentDeviceID      string     `protobuf:"bytes,8,opt,name=current_device_id,json=currentDeviceId,proto3" json:"current_device_id,omitempty"`
	CryptoParams         []byte     `protobuf:"bytes,9,opt,name=crypto_params,json=cryptoParams,proto3" json:"crypto_params,omitempty"`
	XXX_NoUnkeyedLiteral struct{}   `json:"-"`
	XXX_unrecognized     []byte     `json:"-"`
	XXX_sizecache        int32      `json:"-"`
}

func (m *Config) Reset()         { *m = Config{} }
func (m *Config) String() string { return proto.CompactTextString(m) }
func (*Config) ProtoMessage()    {}
func (*Config) Descriptor() ([]byte, []int) {
	return fileDescriptor_config_2f8db6232af726cf, []int{0}
}
func (m *Config) XXX_Unmarshal(b []byte) error {
	return m.Unmarshal(b)
}
func (m *Config) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	if deterministic {
		return xxx_messageInfo_Config.Marshal(b, m, deterministic)
	} else {
		b = b[:cap(b)]
		n, err := m.MarshalTo(b)
		if err != nil {
			return nil, err
		}
		return b[:n], nil
	}
}
func (dst *Config) XXX_Merge(src proto.Message) {
	xxx_messageInfo_Config.Merge(dst, src)
}
func (m *Config) XXX_Size() int {
	return m.Size()
}
func (m *Config) XXX_DiscardUnknown() {
	xxx_messageInfo_Config.DiscardUnknown(m)
}

var xxx_messageInfo_Config proto.InternalMessageInfo

func (m *Config) GetID() string {
	if m != nil {
		return m.ID
	}
	return ""
}

func (m *Config) GetCreatedAt() time.Time {
	if m != nil {
		return m.CreatedAt
	}
	return time.Time{}
}

func (m *Config) GetUpdatedAt() time.Time {
	if m != nil {
		return m.UpdatedAt
	}
	return time.Time{}
}

func (m *Config) GetDeletedAt() *time.Time {
	if m != nil {
		return m.DeletedAt
	}
	return nil
}

func (m *Config) GetMyself() *Contact {
	if m != nil {
		return m.Myself
	}
	return nil
}

func (m *Config) GetMyselfID() string {
	if m != nil {
		return m.MyselfID
	}
	return ""
}

func (m *Config) GetCurrentDevice() *Device {
	if m != nil {
		return m.CurrentDevice
	}
	return nil
}

func (m *Config) GetCurrentDeviceID() string {
	if m != nil {
		return m.CurrentDeviceID
	}
	return ""
}

func (m *Config) GetCryptoParams() []byte {
	if m != nil {
		return m.CryptoParams
	}
	return nil
}

func init() {
	proto.RegisterType((*Config)(nil), "berty.entity.Config")
}
func (m *Config) Marshal() (dAtA []byte, err error) {
	size := m.Size()
	dAtA = make([]byte, size)
	n, err := m.MarshalTo(dAtA)
	if err != nil {
		return nil, err
	}
	return dAtA[:n], nil
}

func (m *Config) MarshalTo(dAtA []byte) (int, error) {
	var i int
	_ = i
	var l int
	_ = l
	if len(m.ID) > 0 {
		dAtA[i] = 0xa
		i++
		i = encodeVarintConfig(dAtA, i, uint64(len(m.ID)))
		i += copy(dAtA[i:], m.ID)
	}
	dAtA[i] = 0x12
	i++
	i = encodeVarintConfig(dAtA, i, uint64(github_com_gogo_protobuf_types.SizeOfStdTime(m.CreatedAt)))
	n1, err := github_com_gogo_protobuf_types.StdTimeMarshalTo(m.CreatedAt, dAtA[i:])
	if err != nil {
		return 0, err
	}
	i += n1
	dAtA[i] = 0x1a
	i++
	i = encodeVarintConfig(dAtA, i, uint64(github_com_gogo_protobuf_types.SizeOfStdTime(m.UpdatedAt)))
	n2, err := github_com_gogo_protobuf_types.StdTimeMarshalTo(m.UpdatedAt, dAtA[i:])
	if err != nil {
		return 0, err
	}
	i += n2
	if m.DeletedAt != nil {
		dAtA[i] = 0x22
		i++
		i = encodeVarintConfig(dAtA, i, uint64(github_com_gogo_protobuf_types.SizeOfStdTime(*m.DeletedAt)))
		n3, err := github_com_gogo_protobuf_types.StdTimeMarshalTo(*m.DeletedAt, dAtA[i:])
		if err != nil {
			return 0, err
		}
		i += n3
	}
	if m.Myself != nil {
		dAtA[i] = 0x2a
		i++
		i = encodeVarintConfig(dAtA, i, uint64(m.Myself.Size()))
		n4, err := m.Myself.MarshalTo(dAtA[i:])
		if err != nil {
			return 0, err
		}
		i += n4
	}
	if len(m.MyselfID) > 0 {
		dAtA[i] = 0x32
		i++
		i = encodeVarintConfig(dAtA, i, uint64(len(m.MyselfID)))
		i += copy(dAtA[i:], m.MyselfID)
	}
	if m.CurrentDevice != nil {
		dAtA[i] = 0x3a
		i++
		i = encodeVarintConfig(dAtA, i, uint64(m.CurrentDevice.Size()))
		n5, err := m.CurrentDevice.MarshalTo(dAtA[i:])
		if err != nil {
			return 0, err
		}
		i += n5
	}
	if len(m.CurrentDeviceID) > 0 {
		dAtA[i] = 0x42
		i++
		i = encodeVarintConfig(dAtA, i, uint64(len(m.CurrentDeviceID)))
		i += copy(dAtA[i:], m.CurrentDeviceID)
	}
	if len(m.CryptoParams) > 0 {
		dAtA[i] = 0x4a
		i++
		i = encodeVarintConfig(dAtA, i, uint64(len(m.CryptoParams)))
		i += copy(dAtA[i:], m.CryptoParams)
	}
	if m.XXX_unrecognized != nil {
		i += copy(dAtA[i:], m.XXX_unrecognized)
	}
	return i, nil
}

func encodeVarintConfig(dAtA []byte, offset int, v uint64) int {
	for v >= 1<<7 {
		dAtA[offset] = uint8(v&0x7f | 0x80)
		v >>= 7
		offset++
	}
	dAtA[offset] = uint8(v)
	return offset + 1
}
func (m *Config) Size() (n int) {
	if m == nil {
		return 0
	}
	var l int
	_ = l
	l = len(m.ID)
	if l > 0 {
		n += 1 + l + sovConfig(uint64(l))
	}
	l = github_com_gogo_protobuf_types.SizeOfStdTime(m.CreatedAt)
	n += 1 + l + sovConfig(uint64(l))
	l = github_com_gogo_protobuf_types.SizeOfStdTime(m.UpdatedAt)
	n += 1 + l + sovConfig(uint64(l))
	if m.DeletedAt != nil {
		l = github_com_gogo_protobuf_types.SizeOfStdTime(*m.DeletedAt)
		n += 1 + l + sovConfig(uint64(l))
	}
	if m.Myself != nil {
		l = m.Myself.Size()
		n += 1 + l + sovConfig(uint64(l))
	}
	l = len(m.MyselfID)
	if l > 0 {
		n += 1 + l + sovConfig(uint64(l))
	}
	if m.CurrentDevice != nil {
		l = m.CurrentDevice.Size()
		n += 1 + l + sovConfig(uint64(l))
	}
	l = len(m.CurrentDeviceID)
	if l > 0 {
		n += 1 + l + sovConfig(uint64(l))
	}
	l = len(m.CryptoParams)
	if l > 0 {
		n += 1 + l + sovConfig(uint64(l))
	}
	if m.XXX_unrecognized != nil {
		n += len(m.XXX_unrecognized)
	}
	return n
}

func sovConfig(x uint64) (n int) {
	for {
		n++
		x >>= 7
		if x == 0 {
			break
		}
	}
	return n
}
func sozConfig(x uint64) (n int) {
	return sovConfig(uint64((x << 1) ^ uint64((int64(x) >> 63))))
}
func (m *Config) Unmarshal(dAtA []byte) error {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		preIndex := iNdEx
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return ErrIntOverflowConfig
			}
			if iNdEx >= l {
				return io.ErrUnexpectedEOF
			}
			b := dAtA[iNdEx]
			iNdEx++
			wire |= (uint64(b) & 0x7F) << shift
			if b < 0x80 {
				break
			}
		}
		fieldNum := int32(wire >> 3)
		wireType := int(wire & 0x7)
		if wireType == 4 {
			return fmt.Errorf("proto: Config: wiretype end group for non-group")
		}
		if fieldNum <= 0 {
			return fmt.Errorf("proto: Config: illegal tag %d (wire type %d)", fieldNum, wire)
		}
		switch fieldNum {
		case 1:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field ID", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConfig
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= (uint64(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthConfig
			}
			postIndex := iNdEx + intStringLen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.ID = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 2:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field CreatedAt", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConfig
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				msglen |= (int(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if msglen < 0 {
				return ErrInvalidLengthConfig
			}
			postIndex := iNdEx + msglen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			if err := github_com_gogo_protobuf_types.StdTimeUnmarshal(&m.CreatedAt, dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		case 3:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field UpdatedAt", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConfig
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				msglen |= (int(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if msglen < 0 {
				return ErrInvalidLengthConfig
			}
			postIndex := iNdEx + msglen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			if err := github_com_gogo_protobuf_types.StdTimeUnmarshal(&m.UpdatedAt, dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		case 4:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field DeletedAt", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConfig
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				msglen |= (int(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if msglen < 0 {
				return ErrInvalidLengthConfig
			}
			postIndex := iNdEx + msglen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			if m.DeletedAt == nil {
				m.DeletedAt = new(time.Time)
			}
			if err := github_com_gogo_protobuf_types.StdTimeUnmarshal(m.DeletedAt, dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		case 5:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field Myself", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConfig
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				msglen |= (int(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if msglen < 0 {
				return ErrInvalidLengthConfig
			}
			postIndex := iNdEx + msglen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			if m.Myself == nil {
				m.Myself = &Contact{}
			}
			if err := m.Myself.Unmarshal(dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		case 6:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field MyselfID", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConfig
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= (uint64(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthConfig
			}
			postIndex := iNdEx + intStringLen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.MyselfID = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 7:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field CurrentDevice", wireType)
			}
			var msglen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConfig
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				msglen |= (int(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if msglen < 0 {
				return ErrInvalidLengthConfig
			}
			postIndex := iNdEx + msglen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			if m.CurrentDevice == nil {
				m.CurrentDevice = &Device{}
			}
			if err := m.CurrentDevice.Unmarshal(dAtA[iNdEx:postIndex]); err != nil {
				return err
			}
			iNdEx = postIndex
		case 8:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field CurrentDeviceID", wireType)
			}
			var stringLen uint64
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConfig
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				stringLen |= (uint64(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			intStringLen := int(stringLen)
			if intStringLen < 0 {
				return ErrInvalidLengthConfig
			}
			postIndex := iNdEx + intStringLen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.CurrentDeviceID = string(dAtA[iNdEx:postIndex])
			iNdEx = postIndex
		case 9:
			if wireType != 2 {
				return fmt.Errorf("proto: wrong wireType = %d for field CryptoParams", wireType)
			}
			var byteLen int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return ErrIntOverflowConfig
				}
				if iNdEx >= l {
					return io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				byteLen |= (int(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			if byteLen < 0 {
				return ErrInvalidLengthConfig
			}
			postIndex := iNdEx + byteLen
			if postIndex > l {
				return io.ErrUnexpectedEOF
			}
			m.CryptoParams = append(m.CryptoParams[:0], dAtA[iNdEx:postIndex]...)
			if m.CryptoParams == nil {
				m.CryptoParams = []byte{}
			}
			iNdEx = postIndex
		default:
			iNdEx = preIndex
			skippy, err := skipConfig(dAtA[iNdEx:])
			if err != nil {
				return err
			}
			if skippy < 0 {
				return ErrInvalidLengthConfig
			}
			if (iNdEx + skippy) > l {
				return io.ErrUnexpectedEOF
			}
			m.XXX_unrecognized = append(m.XXX_unrecognized, dAtA[iNdEx:iNdEx+skippy]...)
			iNdEx += skippy
		}
	}

	if iNdEx > l {
		return io.ErrUnexpectedEOF
	}
	return nil
}
func skipConfig(dAtA []byte) (n int, err error) {
	l := len(dAtA)
	iNdEx := 0
	for iNdEx < l {
		var wire uint64
		for shift := uint(0); ; shift += 7 {
			if shift >= 64 {
				return 0, ErrIntOverflowConfig
			}
			if iNdEx >= l {
				return 0, io.ErrUnexpectedEOF
			}
			b := dAtA[iNdEx]
			iNdEx++
			wire |= (uint64(b) & 0x7F) << shift
			if b < 0x80 {
				break
			}
		}
		wireType := int(wire & 0x7)
		switch wireType {
		case 0:
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return 0, ErrIntOverflowConfig
				}
				if iNdEx >= l {
					return 0, io.ErrUnexpectedEOF
				}
				iNdEx++
				if dAtA[iNdEx-1] < 0x80 {
					break
				}
			}
			return iNdEx, nil
		case 1:
			iNdEx += 8
			return iNdEx, nil
		case 2:
			var length int
			for shift := uint(0); ; shift += 7 {
				if shift >= 64 {
					return 0, ErrIntOverflowConfig
				}
				if iNdEx >= l {
					return 0, io.ErrUnexpectedEOF
				}
				b := dAtA[iNdEx]
				iNdEx++
				length |= (int(b) & 0x7F) << shift
				if b < 0x80 {
					break
				}
			}
			iNdEx += length
			if length < 0 {
				return 0, ErrInvalidLengthConfig
			}
			return iNdEx, nil
		case 3:
			for {
				var innerWire uint64
				var start int = iNdEx
				for shift := uint(0); ; shift += 7 {
					if shift >= 64 {
						return 0, ErrIntOverflowConfig
					}
					if iNdEx >= l {
						return 0, io.ErrUnexpectedEOF
					}
					b := dAtA[iNdEx]
					iNdEx++
					innerWire |= (uint64(b) & 0x7F) << shift
					if b < 0x80 {
						break
					}
				}
				innerWireType := int(innerWire & 0x7)
				if innerWireType == 4 {
					break
				}
				next, err := skipConfig(dAtA[start:])
				if err != nil {
					return 0, err
				}
				iNdEx = start + next
			}
			return iNdEx, nil
		case 4:
			return iNdEx, nil
		case 5:
			iNdEx += 4
			return iNdEx, nil
		default:
			return 0, fmt.Errorf("proto: illegal wireType %d", wireType)
		}
	}
	panic("unreachable")
}

var (
	ErrInvalidLengthConfig = fmt.Errorf("proto: negative length found during unmarshaling")
	ErrIntOverflowConfig   = fmt.Errorf("proto: integer overflow")
)

func init() { proto.RegisterFile("entity/config.proto", fileDescriptor_config_2f8db6232af726cf) }

var fileDescriptor_config_2f8db6232af726cf = []byte{
	// 416 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0x94, 0x51, 0xcf, 0x8a, 0xd3, 0x40,
	0x18, 0xdf, 0xe9, 0xae, 0xb5, 0x1d, 0xb3, 0x2e, 0xce, 0x56, 0x09, 0x45, 0x92, 0x52, 0x2f, 0x11,
	0x34, 0x01, 0xbd, 0xe9, 0x61, 0x69, 0x93, 0x4b, 0x0e, 0x82, 0x04, 0x4f, 0x5e, 0x42, 0x3a, 0x33,
	0x8d, 0x83, 0x4d, 0x27, 0x4c, 0xbf, 0x0a, 0x79, 0x0b, 0x8f, 0x3e, 0xd2, 0x1e, 0x7d, 0x82, 0x28,
	0xf1, 0x0d, 0x7c, 0x00, 0x91, 0xce, 0x4c, 0xb0, 0x3d, 0xc9, 0xde, 0xe6, 0xfb, 0x7d, 0xbf, 0x7f,
	0x7c, 0x83, 0xaf, 0xf9, 0x16, 0x04, 0x34, 0x11, 0x95, 0xdb, 0xb5, 0x28, 0xc3, 0x5a, 0x49, 0x90,
	0xc4, 0x59, 0x71, 0x05, 0x4d, 0x68, 0x56, 0xd3, 0x49, 0x29, 0x4b, 0xa9, 0x17, 0xd1, 0xe1, 0x65,
	0x38, 0x53, 0xbf, 0x94, 0xb2, 0xdc, 0xf0, 0x48, 0x4f, 0xab, 0xfd, 0x3a, 0x02, 0x51, 0xf1, 0x1d,
	0x14, 0x55, 0x6d, 0x09, 0x93, 0x7f, 0xce, 0x50, 0x50, 0xb0, 0x68, 0x9f, 0xc7, 0xf8, 0x17, 0x41,
	0xb9, 0x01, 0xe7, 0x7f, 0xce, 0xf1, 0x30, 0xd6, 0x05, 0xc8, 0x0b, 0x3c, 0x10, 0xcc, 0x45, 0x33,
	0x14, 0x8c, 0x97, 0x4f, 0xbb, 0xd6, 0x1f, 0xa4, 0xc9, 0xef, 0xd6, 0x27, 0xa5, 0x54, 0xd5, 0x9b,
	0x79, 0xad, 0x44, 0x55, 0xa8, 0x26, 0xff, 0xcc, 0x9b, 0x79, 0x36, 0x10, 0x8c, 0xc4, 0x18, 0x53,
	0xc5, 0x0b, 0xe0, 0x2c, 0x2f, 0xc0, 0x1d, 0xcc, 0x50, 0xf0, 0xe0, 0xd5, 0x34, 0x34, 0xcd, 0xc2,
	0xbe, 0x59, 0xf8, 0xa1, 0x6f, 0xb6, 0x1c, 0xdd, 0xb6, 0xfe, 0xd9, 0xd7, 0x1f, 0x3e, 0xca, 0xc6,
	0x56, 0xb7, 0x80, 0x83, 0xc9, 0xbe, 0x66, 0xbd, 0xc9, 0xf9, 0x5d, 0x4c, 0xac, 0x6e, 0x01, 0xe4,
	0x06, 0x63, 0xc6, 0x37, 0xdc, 0x9a, 0x5c, 0xfc, 0xd7, 0xe4, 0xc2, 0x18, 0x58, 0xcd, 0x02, 0xc8,
	0x4b, 0x3c, 0xac, 0x9a, 0x1d, 0xdf, 0xac, 0xdd, 0x7b, 0x5a, 0xfc, 0x38, 0x3c, 0xfe, 0x84, 0x30,
	0x36, 0x57, 0xcc, 0x2c, 0x89, 0x3c, 0xc7, 0x63, 0xf3, 0xca, 0x05, 0x73, 0x87, 0xfa, 0x5c, 0x4e,
	0xd7, 0xfa, 0xa3, 0x77, 0x1a, 0x4c, 0x93, 0x6c, 0x64, 0xd6, 0x29, 0x23, 0x6f, 0xf1, 0x43, 0xba,
	0x57, 0x8a, 0x6f, 0x21, 0x37, 0x57, 0x77, 0xef, 0xeb, 0x84, 0xc9, 0x69, 0x42, 0xa2, 0x77, 0xd9,
	0xa5, 0xe5, 0x9a, 0x91, 0xdc, 0xe0, 0x47, 0xa7, 0xe2, 0x43, 0xde, 0x48, 0xe7, 0x5d, 0x77, 0xad,
	0x7f, 0x15, 0x1f, 0xb3, 0xd3, 0x24, 0xbb, 0x3a, 0x91, 0xa7, 0x8c, 0x3c, 0xc3, 0x97, 0x54, 0x35,
	0x35, 0xc8, 0xbc, 0x2e, 0x54, 0x51, 0xed, 0xdc, 0xf1, 0x0c, 0x05, 0x4e, 0xe6, 0x18, 0xf0, 0xbd,
	0xc6, 0x96, 0xc1, 0x6d, 0xe7, 0xa1, 0xef, 0x9d, 0x87, 0x7e, 0x76, 0x1e, 0xfa, 0xf6, 0xcb, 0x3b,
	0xfb, 0xf8, 0xc4, 0x74, 0x03, 0x4e, 0x3f, 0x45, 0x54, 0x2a, 0x1e, 0x99, 0x96, 0xab, 0xa1, 0xbe,
	0xe5, 0xeb, 0xbf, 0x01, 0x00, 0x00, 0xff, 0xff, 0x6c, 0x29, 0xd3, 0x39, 0xb8, 0x02, 0x00, 0x00,
}
