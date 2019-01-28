package chunk

import (
	"bytes"
	"math/rand"
	"os"
	"testing"
	time "time"

	"berty.tech/core/pkg/deviceinfo"
	"berty.tech/core/testrunner"
	. "github.com/smartystreets/goconvey/convey"
)

func init() {
	testrunner.InitLogger()
}

func Test(t *testing.T) {
	var (
		err error
		//			ctx    = context.Background()
		data                   []byte
		dataLength             int
		dataRandLength         int
		chunkSize              int
		slice                  []*Chunk
		reconstruct            []byte
		sliceMarshal           [][]byte
		reconstructFromMarshal []byte
	)

	Convey("set storage path and remove last db", t, FailureHalts, func() {
		err = deviceinfo.SetStoragePath("/tmp/chunk_test")
		So(err, ShouldBeNil)
		os.Remove("/tmp/chunk_test/berty.core.db")
	})

	Convey("split random data", t, FailureHalts, func() {
		dataLength = 2000
		data = make([]byte, dataLength)
		So(len(data), ShouldEqual, dataLength)

		dataRandLength, err = rand.Read(data)
		So(err, ShouldBeNil)
		So(dataRandLength, ShouldEqual, dataLength)

		chunkSize = 200
		slice, err = Split(data, chunkSize)
		So(err, ShouldBeNil)

		Convey("chunk size should equal chunkSize", FailureHalts, func() {
			offset := 0
			for _, chunk := range slice {
				size := len(chunk.ID) + len(chunk.SliceID) + len(chunk.Data) + 4 /*chunk.Index*/ + 4 /*chunk.SliceLength*/
				if chunkSize > size {
					break
				}
				So(size, ShouldEqual, chunkSize)
				offset = offset + int(size)
			}
		})

		Convey("reconstruct slice", FailureHalts, func() {
			reconstruct, err = Reconstruct(slice)
			So(err, ShouldBeNil)

			Convey("check that reconstruct is equal to data", FailureHalts, func() {
				So(len(reconstruct), ShouldEqual, len(data))
				So(reconstruct, ShouldResemble, data)
			})
		})
	})

	Convey("split random data", t, FailureHalts, func() {

		dataLength = 2000
		data = make([]byte, dataLength)
		So(len(data), ShouldEqual, dataLength)

		dataRandLength, err = rand.Read(data)
		So(err, ShouldBeNil)
		So(dataRandLength, ShouldEqual, dataLength)

		chunkSize = 200
		slice, err = Split(data, chunkSize)
		So(err, ShouldBeNil)

		Convey("chunk size should equal chunkSize", FailureHalts, func() {
			offset := 0
			for _, chunk := range slice {
				size := len(chunk.ID) + len(chunk.SliceID) + len(chunk.Data) + 4 /*chunk.Index*/ + 4 /*chunk.SliceLength*/
				if chunkSize > size {
					break
				}
				So(size, ShouldEqual, chunkSize)
				offset = offset + int(size)
			}
		})

		Convey("reconstruct slice", FailureHalts, func() {
			reconstruct, err = Reconstruct(slice)
			So(err, ShouldBeNil)

			Convey("check that reconstruct is equal to data", FailureHalts, func() {
				So(len(reconstruct), ShouldEqual, len(data))
				So(reconstruct, ShouldResemble, data)
			})
		})

		Convey("publish chunks", FailureHalts, func() {
			for _, c := range slice {
				err = Publish(c)
				So(err, ShouldBeNil)
			}
			Convey("retrieve slice with subscribe", FailureHalts, func() {
				subscriber := Subscribe()
				sliceSub := <-subscriber
				So(sliceSub, ShouldResemble, data)
				Unsubscribe(subscriber)
			})
		})

	})

	Convey("marshal split random data", t, FailureHalts, func() {

		dataLength = 2000
		data = make([]byte, dataLength)
		So(len(data), ShouldEqual, dataLength)

		dataRandLength, err = rand.Read(data)
		So(err, ShouldBeNil)
		So(dataRandLength, ShouldEqual, dataLength)

		chunkSize = 200
		sliceMarshal, err = SplitMarshal(data, chunkSize)
		So(err, ShouldBeNil)

		Convey("chunk size should equal chunkSize", FailureHalts, func() {
			offset := 0
			for i, chunkMarshal := range sliceMarshal {
				if i == len(sliceMarshal)-1 {
					break
				}
				size := len(chunkMarshal)
				if i == 0 {
					So(size, ShouldEqual, chunkSize-2)
				} else {
					So(size, ShouldEqual, chunkSize)
				}
				offset = offset + int(size)
			}
		})

		Convey("reconstruct from marshal slice", FailureHalts, func() {
			reconstructFromMarshal, err = ReconstructFromMarshal(sliceMarshal)
			So(err, ShouldBeNil)

			Convey("check that reconstruct from marshal is equal to data", FailureHalts, func() {
				So(len(reconstructFromMarshal), ShouldEqual, len(data))
				So(reconstructFromMarshal, ShouldResemble, data)
			})
		})
	})

	Convey("pub/sub to multiple data", t, FailureHalts, func() {
		chunkSizes := []int{10000, 3000, 4000, 5000, 7000}
		dataSlice := [][]byte{}
		splitDataSlice := [][]*Chunk{}

		subscriber := Subscribe()
		Convey("create data slice", FailureHalts, func() {
			i := 0
			for i < 5 {
				chunkSize = chunkSizes[rand.Intn(5)]
				data := make([]byte, chunkSize)
				_, err := rand.Read(data)
				So(err, ShouldBeNil)
				dataSlice = append(dataSlice, data)
				i++
			}
			Convey("split all data", FailureHalts, func() {
				for _, data := range dataSlice {
					split, err := Split(data, 200)
					So(err, ShouldBeNil)
					splitDataSlice = append(splitDataSlice, split)
				}
				Convey("publish all chunks", FailureHalts, func() {
					for _, slice := range splitDataSlice {
						for _, c := range slice {
							err := Publish(c)
							So(err, ShouldBeNil)
						}
					}
					Convey("subscribe and retrieve all data", FailureHalts, func() {
						i = 0
						for i < 5 {
							select {
							case dataSub := <-subscriber:

								data := []byte{}
								for _, data = range dataSlice {
									if bytes.Equal(data, dataSub) {
										So(dataSub, ShouldResemble, data)
										i++
										break
									}
								}
							case <-time.After(time.Second * 5):
								break
							}
						}
						So(i, ShouldEqual, 5)
					})
				})
			})
		})
	})

}
