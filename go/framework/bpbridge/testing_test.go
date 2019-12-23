package bpbridge

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func checkErr(t *testing.T, err error) {
	t.Helper()

	if !assert.NoError(t, err) {
		t.Fatal("fatal")
	}
}
