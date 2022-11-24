package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/go-playground/webhooks/v6/github"
)

var (
	GithubSecret = os.Getenv("GITHUB_SECRET")
	GithubToken  = os.Getenv("GITHUB_TOKEN")

	blacklistSender = []string{"dependabot"}
	worflowFrom     = "Go benchmark"
	worflowTo       = "mirror-workflow"
	artifactPrefix  = "bench-"
)

type ArtifactPayload struct {
	TotalCount int `json:"total_count"`
	Artifacts  []struct {
		ID                 int       `json:"id"`
		Name               string    `json:"name"`
		SizeInBytes        int       `json:"size_in_bytes"`
		URL                string    `json:"url"`
		ArchiveDownloadURL string    `json:"archive_download_url"`
		Expired            bool      `json:"expired"`
		CreatedAt          time.Time `json:"created_at"`
	} `json:"artifacts"`
}

func BenchHooks(w http.ResponseWriter, r *http.Request) {
	sessionid := r.Header.Get("X-GitHub-Delivery")
	if sessionid == "" {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintln(w, "")

		// log error and end request
		log.New(os.Stdout, "", 0).Fatalf("receiving invalid request, missing github `X-GitHub-Delivery` header")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	logger := log.New(os.Stdout, fmt.Sprintf("%s | ", sessionid), 0)

	logger.Println("-- receiving incoming request")

	if err := handleRequest(ctx, logger, w, r); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, "{\"error\": \"%s\"}\n", err.Error())

		// log error and end request
		logger.Fatalf("unable to handle status events: %s", err)
	} else {
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, "{}")
	}
}

func handleRequest(ctx context.Context, logger *log.Logger, w http.ResponseWriter, r *http.Request) error {
	hook, err := github.New(github.Options.Secret(GithubSecret))
	if err != nil {
		return fmt.Errorf("unable to create github hook handler: %w", err)
	}

	payload, err := hook.Parse(r, github.WorkflowRunEvent)
	switch err {
	case nil: // ok
	case github.ErrEventNotFound:
		logger.Printf("event not found: %s", err.Error())
		return nil
	case github.ErrEventNotSpecifiedToParse:
		return fmt.Errorf("receiving unwanted event: %s", err)
	default:
		return fmt.Errorf("unable to parse status: %w", err)
	}

	switch p := payload.(type) {
	case github.WorkflowRunPayload:
		if err := checksender(p.Sender.Login); err != nil {
			return err
		}

		artifacturl := p.WorkflowRun.ArtifactsURL
		if p.WorkflowRun.Name != worflowFrom {
			logger.Printf("unwanted workflow: `%s`", p.WorkflowRun.Name)
			return nil
		}

		logger.Printf("receiving dispatch request from: %s", p.Sender.Login)

		req, err := http.NewRequest("GET", artifacturl, nil)
		if err != nil {
			return fmt.Errorf("unable to get artifact url: %w", err)
		}
		req = req.WithContext(ctx)

		res, err := http.DefaultClient.Do(req)
		if err != nil {
			return fmt.Errorf("unable to get artifact url: %w", err)
		}

		body, err := ioutil.ReadAll(res.Body)
		if err != nil {
			return fmt.Errorf("unable to read body response: %w", err)
		}

		var ap ArtifactPayload
		if err := json.Unmarshal(body, &ap); err != nil {
			return fmt.Errorf("uanble to unmarshall payload: %w", err)
		}

		if ap.TotalCount == 0 {
			return fmt.Errorf("no artifacts found")
		}

		for _, artifact := range ap.Artifacts {
			if !strings.HasPrefix(artifact.Name, artifactPrefix) {
				logger.Printf("skiping artifact with wrong prefix: %s", artifact.Name)
				continue
			}

			if err := dispatch(ctx, logger, worflowTo, artifact); err != nil {
				return fmt.Errorf("unable to dispatch event: %w", err)
			}

			logger.Printf("disaptch artifact(%s) success !", artifact.Name)
		}

		return nil

	default:
		return fmt.Errorf("unknown event")
	}
}

func dispatch(ctx context.Context, logger *log.Logger, typ string, payload any) error {
	if GithubToken == "" {
		return fmt.Errorf("github token cannot be empty")
	}

	api := NewGithubAPI(logger, GithubToken, "berty", "berty-bench")
	return api.Dispatch(ctx, typ, payload)
}

func checksender(login string) error {
	switch {
	case login == "":
		return fmt.Errorf("sender cannot be empty")
	case containString(blacklistSender, login):
		return fmt.Errorf("sender is blacklisted: %s", login)
	}
	return nil
}

func containString(s []string, str string) bool {
	for _, v := range s {
		if v == str {
			return true
		}
	}

	return false
}
