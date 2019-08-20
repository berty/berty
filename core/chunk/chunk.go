package chunk

import (
	"errors"
	fmt "fmt"

	"berty.tech/core/pkg/errorcodes"
	"github.com/gofrs/uuid"
	"github.com/jinzhu/gorm"
)

var (
	db *gorm.DB
)

// Validate validate chunk slice
func validate(slice []*Chunk) error {
	if len(slice) == 0 {
		return errorcodes.ErrChunk.New()
	}
	sliceID := slice[0].SliceID
	n := slice[0].SliceLength

	if int(n) != len(slice) {
		return errorcodes.ErrChunkSliceNotComplete.New()
	}
	for i := range slice {
		if slice[i].SliceID != sliceID {
			return errorcodes.ErrChunkBadSliceID.New()
		}
		if slice[i].SliceLength != n {
			return errorcodes.ErrChunkBadSliceLength.New()
		}
		if slice[i].Data == nil {
			return errorcodes.ErrChunkBadData.New()
		}
		for j := range slice {
			if slice[i] != slice[j] && slice[i].Index == slice[j].Index {
				return errorcodes.ErrChunkBadIndex.New()
			}
		}
	}
	return nil
}

func Reconstruct(slice []*Chunk) ([]byte, error) {
	err := validate(slice)
	if err != nil {
		return nil, err
	}

	data := []byte{}
	for i := range slice {
		data = append(data, slice[i].Data...)
	}

	return data, nil
}

func ReconstructFromMarshal(sliceMarshal [][]byte) ([]byte, error) {
	slice := []*Chunk{}
	for _, bytes := range sliceMarshal {
		chunk := &Chunk{}
		if err := chunk.Unmarshal(bytes); err != nil {
			return nil, err
		}
		slice = append(slice, chunk)
	}
	return Reconstruct(slice)
}

func getDataLength(data []byte, offset, chunkSize int, sliceID string, id string) int {
	dataLength := chunkSize - len(sliceID) - len(id) - 4 /*chunk.Index*/ - 4 /*chunk.SliceLength*/
	if dataLength > len(data[offset:]) {
		return len(data[offset:])
	}
	return dataLength
}

// Split split data in chunk slice
func Split(data []byte, chunkSize int) ([]*Chunk, error) {
	sliceID := uuid.Must(uuid.NewV4()).String()

	slice := []*Chunk{}
	i := int32(0)
	offset := 0

	// generate all chunk
	for {
		if offset == len(data) {
			break
		}

		chunk := &Chunk{
			SliceID: sliceID,
			ID:      fmt.Sprintf("%+v:%+v", sliceID, i),
			Index:   i,
		}

		dataLength := getDataLength(data, offset, chunkSize, chunk.SliceID, chunk.ID)
		if dataLength <= 0 {
			return nil, errors.New("cannot create chunk with len(data) <= 0")
		}
		chunk.Data = data[offset : offset+dataLength]

		slice = append(slice, chunk)

		offset = offset + dataLength
		i++
	}

	for _, chunk := range slice {
		chunk.SliceLength = int32(len(slice))
	}

	return slice, nil
}

func SplitMarshal(data []byte, chunkSize int) ([][]byte, error) {
	fakeChunk := &Chunk{ID: "1", Index: 1, Data: []byte{1}, SliceID: "1", SliceLength: 1}
	marshalSize := fakeChunk.Size() - len(fakeChunk.SliceID) - len(fakeChunk.ID) - len(fakeChunk.Data) - 4 - 4
	// split with marshal size
	slice, err := Split(data, chunkSize-marshalSize)
	if err != nil {
		return nil, err
	}
	marshalSlice := [][]byte{}
	for _, chunk := range slice {
		bytes, err := chunk.Marshal()
		if err != nil {
			return nil, err
		}
		marshalSlice = append(marshalSlice, bytes)
	}
	return marshalSlice, nil
}
