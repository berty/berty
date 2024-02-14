package cmd

import (
	"context"
	"fmt"
	"infratesting/aws"
	"infratesting/config"
	"infratesting/server/grpc/server"
	"infratesting/testing"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/spf13/cobra"
	"go.uber.org/zap"
)

var testStopCmd = &cobra.Command{
	Use: "test-stop",
	RunE: func(cmd *cobra.Command, args []string) error {
		ctx := context.Background()

		c, err := loadConfig()
		if err != nil {
			return fmt.Errorf("uanble to load config: %w", err)
		}

		return stopTest(ctx, &c)
	},
}

func stopTest(ctx context.Context, c *config.Config) error {
	availablePeers, err := testing.GetAllEligiblePeers(ctx, logger, aws.Ec2TagType, []string{config.NodeTypePeer})
	if err != nil {
		return fmt.Errorf("unable to get node eligible peer: %w", err)
	}

	t := time.Now()

	// assign peers and tests to group
	for _, peer := range availablePeers {
		peer.MatchNodeToPeer(*c)
		_, err := peer.P.StopTest(ctx, &server.StopTest_Request{})
		if err != nil {
			return fmt.Errorf("unable to stop test server: %w", err)
		}
	}

	// upload logs
	allNodes, err := testing.GetAllEligiblePeers(ctx, logger, aws.Ec2TagType, config.GetAllTypes())
	if err != nil {
		return fmt.Errorf("unable to get all eligible peer: %w", err)
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
				logger.Error("unable to upload logs", zap.Error(err))
				return
			}

			bucketName, err := aws.GetBucketName(logger)
			if err != nil {
				logger.Error("unable to get bucket name", zap.Error(err))
			} else {
				logger.Debug("uploaded log file(s) to bucket", zap.String("bucket", bucketName), zap.String("tag", allNodes[i].Tags[aws.Ec2TagName]), zap.Int64("files", resp.UploadCount))
			}

			uploadWg.Done()
		}(i)
	}

	uploadWg.Wait()
	return nil
}
