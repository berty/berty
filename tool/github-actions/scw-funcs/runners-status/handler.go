package handler

import (
	"io"
	"net/http"
	"os"
)

func Runners(w http.ResponseWriter, r *http.Request) {
	req, err := http.NewRequest("GET", "https://api.github.com/orgs/berty/actions/runners", nil)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		panic(err)
	}
	req.Header.Set("Authorization", "token "+os.Getenv("GITHUB_TOKEN"))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		panic(err)
	}
	defer resp.Body.Close()

	w.WriteHeader(resp.StatusCode)
	w.Header().Set("Content-Type", "application/json")
	io.Copy(w, resp.Body)
}
