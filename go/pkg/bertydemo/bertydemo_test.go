package bertydemo

import "testing"

func TestNewDemo(t *testing.T) {
	opts := &Opts{":memory:"}
	demo, err := New(opts)
	checkErr(t, err)

	demo.Close()
}
