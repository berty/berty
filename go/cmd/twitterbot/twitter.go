package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"

	"github.com/pkg/errors"
)

const baseStreamURL = "https://api.twitter.com/2/tweets/search/stream"
const baseRuleURL = "https://api.twitter.com/2/tweets/search/stream/rules"
const usernameLookupBaseURL = "https://api.twitter.com/2/users/by/username/"

type ruleData struct {
	ID    string `json:"id,omitempty"`
	Value string `json:"value,omitempty"`
	Tag   string `json:"tag,omitempty"`
}
type ruleMeta struct {
	Sent        string `json:"sent,omitempty"`
	ResultCount int    `json:"result_count,omitempty"`
}

type rules struct {
	Data []*ruleData `json:"data,omitempty"`
	Meta *ruleMeta   `json:"meta,omitempty"`
}

type ruleAdd struct {
	Value string `json:"value,omitempty"`
	Tag   string `json:"tag,omitempty"`
}

type ruleDelete struct {
	IDs []string `json:"ids,omitempty"`
}

type rulesForm struct {
	Add    []*ruleAdd  `json:"add,omitempty"`
	Delete *ruleDelete `json:"delete,omitempty"`
}

type user struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Username string `json:"username"`
}

type streamReplyIncludes struct {
	Users []*user `json:"users,omitempty"`
}

type streamReplyData struct {
	ID       string `json:"id,omitempty"`
	AuthorID string `json:"author_id,omitempty"`
	Text     string `json:"text,omitempty"`
}

type streamReplyMatchingRule struct {
	ID  string `json:"id,omitempty"`
	Tag string `json:"tag,omitempty"`
}

type streamReply struct {
	Data          *streamReplyData           `json:"data,omitempty"`
	Includes      *streamReplyIncludes       `json:"includes,omitempty"`
	MatchingRules []*streamReplyMatchingRule `json:"matching_rules,omitempty"`
}

func getStreamRules(bearerToken string) (*rules, error) {
	req, err := http.NewRequest("GET", baseRuleURL, nil)
	if err != nil {
		return nil, errors.Wrap(err, "create request")
	}

	req.Header.Set("Authorization", "Bearer "+bearerToken)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, errors.Wrap(err, "send request")
	}

	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return nil, fmt.Errorf("not ok: %s", res.Status)
	}

	resBody, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, errors.Wrap(err, "read response")
	}

	var r rules
	err = json.Unmarshal(resBody, &r)
	if err != nil {
		return nil, errors.Wrap(err, "unmarshal response")
	}

	return &r, nil
}

func isValidUsername(bearerToken, username string) error {
	req, err := http.NewRequest("GET", usernameLookupBaseURL+username, nil)
	if err != nil {
		return errors.Wrap(err, "create request")
	}

	req.Header.Set("Authorization", "Bearer "+bearerToken)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return errors.Wrap(err, "send request")
	}

	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return fmt.Errorf("not ok: %s", res.Status)
	}

	return nil
}

func mutateStreamRules(bearerToken string, body *rulesForm) ([]byte, error) {
	bodyBytes, err := json.Marshal(body)
	if err != nil {
		return nil, errors.Wrap(err, "marshal params")
	}

	req, err := http.NewRequest("POST", baseRuleURL, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, errors.Wrap(err, "create request")
	}

	req.Header.Set("Content-type", "application/json")
	req.Header.Set("Authorization", "Bearer "+bearerToken)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, errors.Wrap(err, "send request")
	}

	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return nil, fmt.Errorf("not ok: %s", res.Status)
	}

	resBody, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, errors.Wrap(err, "read reesponse")
	}

	return resBody, nil
}

func ensureRule(bearerToken, tag, value string) error {
	r, err := getStreamRules(bearerToken)
	if err != nil {
		return errors.Wrap(err, "get rules")
	}

	found := ""
	for _, d := range r.Data {
		if d.Tag == tag {
			if d.Value == value {
				return nil
			}
			found = d.ID
			break
		}
	}

	if found != "" {
		body := &rulesForm{Delete: &ruleDelete{IDs: []string{found}}}
		if _, err := mutateStreamRules(bearerToken, body); err != nil {
			return errors.Wrap(err, "remove existing rule")
		}
	}

	body := &rulesForm{Add: []*ruleAdd{{Value: value, Tag: tag}}}
	if _, err := mutateStreamRules(bearerToken, body); err != nil {
		return errors.Wrap(err, "add rule")
	}

	return nil
}

type rateLimitInfo struct {
	Limit     int
	Remaining int
	Reset     int
}

func filteredStream(bearerToken string, cb func(*streamReply) error) (*rateLimitInfo, error) {
	req, err := http.NewRequest("GET", baseStreamURL+"?user.fields=username&expansions=author_id", nil)
	if err != nil {
		return nil, errors.Wrap(err, "creatte request")
	}

	req.Header.Set("Authorization", "Bearer "+bearerToken)

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, errors.Wrap(err, "send request")
	}

	if res.StatusCode == 429 {
		remaining, err := strconv.Atoi(res.Header.Get("x-rate-limit-remaining"))
		if err != nil {
			return nil, errors.Wrap(err, "parse remaining")
		}
		if remaining > 0 {
			return nil, errors.New("rate limit hit while having remaining requests, do you have another connection open?")
		}
		limit, err := strconv.Atoi(res.Header.Get("x-rate-limit-limit"))
		if err != nil {
			return nil, errors.Wrap(err, "parse limit")
		}
		reset, err := strconv.Atoi(res.Header.Get("x-rate-limit-reset"))
		if err != nil {
			return nil, errors.Wrap(err, "parse reset")
		}
		return &rateLimitInfo{
			Limit:     limit,
			Remaining: remaining,
			Reset:     reset,
		}, nil
	} else if res.StatusCode < 200 || res.StatusCode >= 300 {
		return nil, fmt.Errorf("not ok: %s", res.Status)
	}

	scanner := bufio.NewScanner(res.Body)
	scanner.Split(bufio.ScanLines)
	for scanner.Scan() {
		line := scanner.Bytes()
		if len(line) == 0 {
			continue
		}
		fmt.Println(string(line))
		var r streamReply
		if err := json.Unmarshal(line, &r); err != nil {
			fmt.Println(err)
			continue
		}
		if err := cb(&r); err != nil {
			fmt.Println(err)
			continue
		}
	}

	return nil, nil
}
