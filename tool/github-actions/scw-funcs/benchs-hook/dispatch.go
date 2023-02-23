package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"strings"
)

const (
	GithubEndpoint   = "https://api.github.com"
	GithubAPIVersion = "2022-11-28"
)

type GithubAPI struct {
	logger *log.Logger

	secret      string
	owner, repo string
}

func NewGithubAPI(logger *log.Logger, secret, owner, repo string) *GithubAPI {
	return &GithubAPI{
		logger: logger,
		secret: secret,
		owner:  owner,
		repo:   repo,
	}
}

func (api *GithubAPI) token() string { return fmt.Sprintf("Bearer %s", api.secret) }

func (api *GithubAPI) Dispatch(ctx context.Context, eventType string, clientPayload any) error {
	client := http.DefaultClient

	url, err := url.Parse(fmt.Sprintf("%s/repos/%s/%s/dispatches", GithubEndpoint, api.owner, api.repo))
	if err != nil {
		return fmt.Errorf("unable to craft api url: %w", err)
	}

	api.logger.Printf("dipatching event(%s)", eventType)
	data := map[string]any{
		"event_type":     eventType,
		"client_payload": clientPayload,
	}

	payload, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("unable to marshall payload: %w", err)
	}

	req, err := http.NewRequest("POST", url.String(), bytes.NewBuffer(payload))
	if err != nil {
		return fmt.Errorf("unable to create payload: %w", err)
	}
	req = req.WithContext(ctx)

	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("Authorization", api.token())
	req.Header.Set("X-GitHub-Api-Version", GithubAPIVersion)

	res, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("unable to make request: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return fmt.Errorf("unable dispatch action, github api returned: %d", res.StatusCode)
	}

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return fmt.Errorf("unable to read body response: %w", err)
	}

	api.logger.Printf("github dispatch(%s) to `%s` success!", eventType, url.String())
	if len(strings.TrimSpace(string(body))) > 0 {
		api.logger.Printf("resp: -- [%s] --", body)
	}

	return nil
}
