package bpbridge

import "testing"

func checkErr(t *testing.T, err error) {
	t.Helper()

	if err != nil {
		t.Fatalf("error: %+v", err)
	}
}
