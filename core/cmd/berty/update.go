package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"github.com/pkg/errors"
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"

	"berty.tech/core"
)

type updateOptions struct {
}

func updateSetupFlags(flags *pflag.FlagSet, opts *updateOptions) {
	_ = viper.BindPFlags(flags)
}

func newUpdateCommand() *cobra.Command {
	opts := &updateOptions{}
	cmd := &cobra.Command{
		Use: "update",
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := viper.Unmarshal(opts); err != nil {
				return err
			}
			return update(opts)
		},
	}

	updateSetupFlags(cmd.Flags(), opts)
	return cmd
}

func update(opts *updateOptions) error {
	client := http.Client{}
	req, err := http.NewRequest(http.MethodGet, "https://yolo.berty.io/release/ios.json", nil)
	if err != nil {
		return errors.Wrap(err, "failed to create http request")
	}
	resp, err := client.Do(req)
	if resp != nil {
		defer resp.Body.Close()
	}
	if err != nil {
		return errors.Wrap(err, "failed to fetch release file")
	}
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return errors.Wrap(err, "failed to read body")
	}
	type release struct {
		Branch      string    `json:"branch"`
		StopTime    time.Time `json:"stop-time"`
		Author      string    `json:"author"`
		GitSha      string    `json:"git-sha"`
		BuildURL    string    `json:"build-url"`
		Body        string    `json:"body"`
		ManifestURL string    `json:"manifest-url"`
	}
	ret := struct {
		Master    *release   `json:"master"`
		LatestPRs []*release `json:"latest-prs"`
	}{}
	if err := json.Unmarshal(body, &ret); err != nil {
		return errors.Wrap(err, "invalid json body")
	}

	if core.CommitDate().Before(ret.Master.StopTime) {
		out, _ := json.MarshalIndent(ret.Master, "", "  ")
		fmt.Printf("new master update available: %s\n", string(out))
	} else {
		fmt.Println("you are already up to date")
	}

	return nil
}
