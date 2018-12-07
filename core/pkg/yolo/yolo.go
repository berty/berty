package yolo

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"time"

	"berty.tech/core"
	"github.com/pkg/errors"
)

type Release struct {
	Branch      string    `json:"branch"`
	StopTime    time.Time `json:"stop-time"`
	Author      string    `json:"author"`
	GitSha      string    `json:"git-sha"`
	BuildURL    string    `json:"build-url"`
	Body        string    `json:"body"`
	ManifestURL string    `json:"manifest-url"`
}

func (r Release) IsMoreRecentThanCurrent() bool {
	return r.IsMoreRecentThan(core.CommitDate())
}

func (r Release) IsMoreRecentThan(comparison time.Time) bool {
	// FIXME: do not use only StopTime? for instance, for building releases
	return comparison.Before(r.StopTime)
}

type LatestBuilds struct {
	Master    *Release   `json:"master"`
	LatestPRs []*Release `json:"latest-prs"`
}

func LatestIOSReleases() (*LatestBuilds, error) {
	client := http.Client{}
	req, err := http.NewRequest(http.MethodGet, "https://yolo.berty.io/release/ios.json", nil)
	if err != nil {
		return nil, errors.Wrap(err, "failed to create http request")
	}
	resp, err := client.Do(req)
	if resp != nil {
		defer resp.Body.Close()
	}
	if err != nil {
		return nil, errors.Wrap(err, "failed to fetch release file")
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, errors.Wrap(err, "failed to read body")
	}
	var ret LatestBuilds
	if err := json.Unmarshal(body, &ret); err != nil {
		return nil, errors.Wrap(err, "invalid json body")
	}
	return &ret, nil
}

func LatestIOSMaster() (*Release, error) {
	latestBuilds, err := LatestIOSReleases()
	if err != nil {
		return nil, err
	}

	return latestBuilds.Master, nil
}
