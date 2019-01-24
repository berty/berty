package chunk

import (
	fmt "fmt"
	"sync"

	"berty.tech/core/pkg/errorcodes"
	"github.com/gofrs/uuid"
	"github.com/jinzhu/gorm"
)

var (
	db *gorm.DB

	subscribers      = []chan []byte{}
	subscribersMutex sync.Mutex
)

// Validate validate chunk slice
func validate(slice []*Chunk) error {
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
	if err != nil && err != errorcodes.ErrChunkSliceNotComplete.New() {
		logger().Debug("bad chunk slice, delete all chunks")
		for i := range slice {
			db.Delete(slice[i])
		}
		return nil, errorcodes.ErrChunkBadSlice.Wrap(err)
	}
	if err != nil {
		return nil, err
	}

	data := []byte{}
	for i := range slice {
		data = append(data, slice[i].Data...)
	}

	return data, nil
}

func ReconstructMarshal(sliceMarshal [][]byte) ([]byte, error) {
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

// Split split data in chunk slice
func Split(data []byte, chunkSize int) ([]*Chunk, error) {
	sliceID := uuid.Must(uuid.NewV4()).String()

	// id len = slitID + ":" + index
	idLen := len(sliceID) + 20

	// update the chunkSize based on marshalled size
	chunkSize = chunkSize - len(sliceID) - idLen

	// define number of chunk
	length := int32(len(data) / chunkSize)

	// if there is a rest, increase n
	rest := len(data) % chunkSize
	if rest != 0 {
		length++
	}

	slice := make([]*Chunk, length)
	for i := range slice {
		offset := i * chunkSize

		// if it's the last chunk and there is a rest, rest will be its size
		isLast := i == (len(slice) - 1)
		if isLast && rest != 0 {
			chunkSize = rest
		}

		slice[i] = &Chunk{
			ID:          fmt.Sprintf("%+v:%+v", sliceID, i),
			Index:       int32(i),
			Data:        data[offset : offset+chunkSize],
			SliceID:     sliceID,
			SliceLength: int32(length),
		}
	}

	return slice, nil
}

func SplitMarshal(data []byte, chunkSize int) ([][]byte, error) {
	// split with marshal size
	slice, err := Split(data, chunkSize-(&Chunk{ID: "1", Index: 1, Data: []byte{1}, SliceID: "1", SliceLength: 1}).Size())
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
