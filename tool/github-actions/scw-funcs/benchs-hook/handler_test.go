package handler

import (
	"net/http"
	"testing"
)

func TestBenchsHooks(t *testing.T) {
	_, err := http.NewRequest("GET", "/benchshook", nil)
	if err != nil {
		t.Fatal(err)
	}
}
