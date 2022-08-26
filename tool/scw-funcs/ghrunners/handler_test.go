package handler

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRunners(t *testing.T) {
	req, err := http.NewRequest("GET", "/Runners", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(Runners)
	handler.ServeHTTP(rr, req)

	{
		got := rr.Code
		expected := http.StatusOK
		if expected != got {
			t.Errorf("expected %v, got %v.", expected, got)
		}
	}

	{
		got := rr.Body.String()
		t.Log("got: ", got)
		// expected := `{...}`
		// if expected != got {
		//     t.Errorf("expected %v, got %v.", expected, got)
		// }
	}
}
