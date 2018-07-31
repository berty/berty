package record

import (
	proto "github.com/gogo/protobuf/proto"
	pb "github.com/libp2p/go-libp2p-record/pb"
)

// MakePutRecord creates a dht record for the given key/value pair
func MakePutRecord(key string, value []byte) *pb.Record {
	record := new(pb.Record)
	record.Key = proto.String(string(key))
	record.Value = value
	return record
}
