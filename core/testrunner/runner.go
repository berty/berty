package testrunner

import (
	"fmt"
	"io/ioutil"
	"os"
	"runtime/debug"
	"testing"
)

func TestRunner(name string, testFunc func(*testing.T)) (succeed bool, out string) {
	succeed = false

	m := testing.MainStart(TestDeps{}, []testing.InternalTest{
		{
			Name: name,
			F:    testFunc,
		},
	}, []testing.InternalBenchmark{}, []testing.InternalExample{})

	rescueStdout := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	rescueStderr := os.Stderr
	rerr, werr, _ := os.Pipe()
	os.Stderr = werr

	defer func() {
		if r := recover(); r != nil {
			err, ok := r.(error)
			if !ok {
				//
			} else {
				fmt.Fprintf(os.Stderr, "panic recovered, app should be in stable state (%s)", err)
				debug.PrintStack()
			}

			succeed = false
		}

		w.Close()
		werr.Close()

		outBytes, _ := ioutil.ReadAll(r)
		outBytesErr, _ := ioutil.ReadAll(rerr)

		out = string(outBytes) + string("\n\n\n") + string(outBytesErr)

		os.Stdout = rescueStdout
		os.Stderr = rescueStderr
	}()

	succeed = m.Run() == 0

	return
}
