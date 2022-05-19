package cmd

import (
	"context"
	"fmt"
	"infratesting/aws"
	"infratesting/config"
	"infratesting/logging"
	"infratesting/server/grpc/server"
	"infratesting/testing"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/spf13/cobra"
)

var testStopCmd = &cobra.Command{
	Use: "test-stop",
	RunE: func(cmd *cobra.Command, args []string) error {
		ctx := context.Background()

		c, err := loadConfig()
		if err != nil {
			return logging.LogErr(err)
		}

		return stopTest(ctx, &c)
	},
}

func stopTest(ctx context.Context, c *config.Config) error {
	availablePeers, err := testing.GetAllEligiblePeers(aws.Ec2TagType, []string{config.NodeTypePeer})
	if err != nil {
		return logging.LogErr(err)
	}

	t := time.Now()

	// assign peers and tests to group
	for _, peer := range availablePeers {
		peer.MatchNodeToPeer(*c)
		_, err := peer.P.StopTest(ctx, &server.StopTest_Request{})
		if err != nil {
			return logging.LogErr(err)
		}
	}

	// upload logs
	allNodes, err := testing.GetAllEligiblePeers(aws.Ec2TagType, config.GetAllTypes())
	if err != nil {
		return logging.LogErr(err)
	}

	uploadWg := sync.WaitGroup{}

	for i := range allNodes {
		uploadWg.Add(1)
		go func(i int) {
			resp, err := allNodes[i].P.UploadLogs(ctx, &server.UploadLogs_Request{
				Folder: strconv.FormatInt(t.Unix(), 10),
				Name:   strings.ReplaceAll(allNodes[i].Tags[aws.Ec2TagName], ".", "-"),
			})
			if err != nil {
				logging.LogErr(err)
				return
			}

			bucketName, err := aws.GetBucketName()
			if err != nil {
				panic(logging.LogErr(err))
			}
			logging.Log(fmt.Sprintf("%v uploaded: %v files to bucket: %s", allNodes[i].Tags[aws.Ec2TagName], resp.UploadCount, bucketName))

			uploadWg.Done()
		}(i)
	}

	uploadWg.Wait()
	return nil
}
