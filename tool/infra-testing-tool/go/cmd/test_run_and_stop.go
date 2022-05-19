package cmd

import (
	"bytes"
	"context"
	"encoding/gob"
	"fmt"
	"infratesting/aws"
	"infratesting/config"
	"infratesting/server/grpc/server"
	"infratesting/testing"
	"math/rand"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"

	"berty.tech/berty/v2/go/pkg/messengertypes"
	"go.uber.org/zap"

	"github.com/spf13/cobra"
)

const DefaultTimeout = time.Minute * 5

var (
	timeout time.Duration
)

func init() {
	testRunAndStopCmd.PersistentFlags().DurationVarP(&timeout, "timeout", "t", DefaultTimeout, "test timeout")
}

type Result struct {
	started time.Time
	elapsed time.Duration
}

var testRunAndStopCmd = &cobra.Command{
	Use:   "test-run-stop",
	Short: "run the test and automatically stop and upload the logs on exit (use ctrl+c)",
	RunE: func(cmd *cobra.Command, args []string) error {
		ctx := context.Background()

		c, err := loadConfig()
		if err != nil {
			return fmt.Errorf("unable to load config: %w", err)
		}

		// @TODO: handle error correctly
		// need better logging system
		res, err := runTestFlow(ctx, timeout, c)
		if err != nil {
			return fmt.Errorf("failed to run test: %w", err)
		}

		logger.Debug("test ended", zap.Duration("elpased", res.elapsed))
		logger.Debug("stopping the test now...")
		if err := stopTest(ctx, &c); err != nil {
			return fmt.Errorf("unable to stop tests: %w", err)
		}
		return nil
	},
}

func updoadLogs(ctx context.Context, res *Result, c config.Config) error {
	// handle ctrl+c
	ctx, cancel := contextHandleSignal(ctx, syscall.SIGINT)
	defer cancel()

	logger.Debug("uploading logs... (ctrl+c to cancel)")
	allNodes, err := testing.GetAllEligiblePeers(ctx, logger, aws.Ec2TagType, config.GetAllTypes())
	if err != nil {
		return fmt.Errorf("unable to get Eligible Peers: %w", err)
	}

	wg := sync.WaitGroup{}
	for n := range allNodes {
		wg.Add(1)
		go func(n int) {
			defer wg.Done()
			name := allNodes[n].Name
			resp, err := allNodes[n].P.UploadLogs(ctx, &server.UploadLogs_Request{
				Folder: strconv.FormatInt(res.started.Unix(), 10),
				Name:   strings.ReplaceAll(allNodes[n].Tags[aws.Ec2TagName], ".", "-"),
			})
			if err != nil {
				logger.Error("unable to upload log", zap.String("node_name", name), zap.Error(err))
				return
			}

			bucketName, err := aws.GetBucketName(logger)
			if err != nil {
				logger.Error("unable to get bucket name", zap.String("node_name", name), zap.Error(err))
				return
			}

			logger.Debug("uploaded log file(s) to bucket", zap.String("bucket", bucketName), zap.String("tag", allNodes[n].Tags[aws.Ec2TagName]), zap.Int64("files", resp.UploadCount))
		}(n)
	}

	// wait for multiple upload to finish
	wg.Wait()

	return nil
}

func runTestFlow(ctx context.Context, timeout time.Duration, c config.Config) (*Result, error) {
	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	// handle ctrl+c
	ctx, cancel = contextHandleSignal(ctx, syscall.SIGINT)
	defer cancel()

	res := &Result{}
	res.started = time.Now()
	defer func() {
		res.elapsed = time.Since(res.started)
	}()

	var amountOfGroups int
	for _, group := range c.Attributes.Groups {
		amountOfGroups += len(group.Tests)
	}

	if amountOfGroups == 0 {
		logger.Warn("there are no tests configured in the config")
		return res, nil
	}

	aws.SetRegion(c.Settings.Region)

	availablePeers, err := testing.GetAllEligiblePeers(ctx, logger, aws.Ec2TagType, []string{config.NodeTypePeer})
	if err != nil {
		return res, fmt.Errorf("unable to get node eligible peers: %w", err)
	}

	availableRepl, err := testing.GetAllEligiblePeers(ctx, logger, aws.Ec2TagType, []string{config.NodeTypeReplication})
	if err != nil {
		return res, fmt.Errorf("unable to get repl eligible peers: %w", err)
	}

	allPeers, err := testing.GetAllPeers(ctx, logger)
	if err != nil {
		return res, fmt.Errorf("unable to get all peers: %w", err)
	}

	// temporary group object
	type group struct {
		Name  string
		Pk    []byte
		Peers []*testing.Peer
		Tests []config.Test
	}

	groups := make(map[string]group, c.GetAmountOfGroups())

	// assign peers and tests to group
	for i := range availablePeers {
		availablePeers[i].MatchNodeToPeer(c)
		for g := range availablePeers[i].ConfigGroups {
			group := groups[availablePeers[i].ConfigGroups[g].Name]

			group.Name = availablePeers[i].ConfigGroups[g].Name
			group.Peers = append(group.Peers, availablePeers[i])

			if len(group.Tests) == 0 {
				group.Tests = availablePeers[i].ConfigGroups[g].Tests
			}

			// group.Tests = append(group.Tests)

			groups[availablePeers[i].ConfigGroups[g].Name] = group
		}
	}

	// match replication server to node
	for i := range availableRepl {
		availableRepl[i].MatchNodeToPeer(c)
		for g := range availableRepl[i].ConfigGroups {
			p := groups[availableRepl[i].ConfigGroups[g].Name].Peers[rand.Intn(len(groups[availableRepl[i].ConfigGroups[g].Name].Peers))]
			_, err = p.P.AddReplication(ctx, &server.AddReplication_Request{
				GroupName: availableRepl[g].ConfigGroups[g].Name,
				TokenIp:   availableRepl[i].Ip,
			})

			if err != nil {
				return res, fmt.Errorf("unable to add replication service: %w", err)
			}
		}
	}

	// create and join groups
	for i := range availablePeers {
		for g := range availablePeers[i].ConfigGroups {
			if len(groups[availablePeers[i].ConfigGroups[g].Name].Pk) == 0 {
				// group doesn't exist yet
				invite, err := availablePeers[i].P.CreateInvite(ctx, &server.CreateInvite_Request{
					GroupName: availablePeers[i].ConfigGroups[g].Name,
				})
				if err != nil {
					return res, fmt.Errorf("unable to create invite: %w", err)
				}

				gr := groups[availablePeers[i].ConfigGroups[g].Name]
				gr.Pk = invite.Invite
				groups[availablePeers[i].ConfigGroups[g].Name] = gr

				n := bytes.NewBuffer(invite.Invite)
				dec := gob.NewDecoder(n)
				var inv messengertypes.ShareableBertyGroup_Reply
				err = dec.Decode(&inv)
				if err != nil {
					logger.Warn("unable to decode invite", zap.Error(err))
				}

				// invite url
				// logger.Debug(inv.WebURL)

				_, err = availablePeers[i].P.StartReceiveMessage(ctx, &server.StartReceiveMessage_Request{
					GroupName: availablePeers[i].ConfigGroups[g].Name,
				})
				if err != nil {
					return res, fmt.Errorf("unable to start receive message: %w", err)
				}

			} else {
				// group already exists, join it
				_, err := availablePeers[i].P.JoinGroup(ctx, &server.JoinGroup_Request{
					GroupName: availablePeers[i].ConfigGroups[g].Name,
					Invite:    groups[availablePeers[i].ConfigGroups[g].Name].Pk,
				})
				if err != nil {
					if !strings.Contains(err.Error(), server.ErrAlreadyInGroup.Error()) {
						return res, fmt.Errorf("unable to join group: %w", err)
					}
				}

				_, err = availablePeers[i].P.StartReceiveMessage(ctx, &server.StartReceiveMessage_Request{
					GroupName: availablePeers[i].ConfigGroups[g].Name,
				})
				if err != nil {
					return res, fmt.Errorf("unable to start receive message: %w", err)
				}
			}
		}
	}

	for p := range allPeers {
		allPeers[p].MatchNodeToPeer(c)
		allPeers[p].P.AddReliability(ctx, &server.AddReliability_Request{
			Timeout: allPeers[p].Reliability.Timeout,
			Odds:    allPeers[p].Reliability.Odds,
		})
	}

	// convert map to slice for ease of use
	var groupArray []group
	for key := range groups {
		groupArray = append(groupArray, groups[key])
	}

	var newTestWG sync.WaitGroup
	var startTestWG sync.WaitGroup

	if len(groupArray) == 0 {
		return res, fmt.Errorf("no group/peers found")
	}

	// iterate over groups
	for g := range groupArray {
		// iterate over tests in groups
		for j := range groupArray[g].Tests {
			newTestWG.Add(len(groupArray[g].Peers))
			startTestWG.Add(len(groupArray[g].Peers))
			// iterate over peers in group
			for k := range groupArray[g].Peers {
				groupIndex := g
				testIndex := j
				peerIndex := k
				go func(newTestWG, startTestWG *sync.WaitGroup) {
					defer startTestWG.Done()
					// create new test with correct variables
					_, err = groupArray[groupIndex].Peers[peerIndex].P.NewTest(ctx, &server.NewTest_Request{
						GroupName: groupArray[groupIndex].Name,
						TestN:     int64(testIndex),
						Type:      groupArray[groupIndex].Tests[testIndex].TypeInternal,
						Size:      int64(groupArray[groupIndex].Tests[testIndex].SizeInternal),
						Interval:  int64(groupArray[groupIndex].Tests[testIndex].IntervalInternal),
						Amount:    int64(groupArray[groupIndex].Tests[testIndex].AmountInternal),
					})

					if err != nil {
						logger.Warn("unable to start test", zap.Error(err))
						// @TODO: maybe return here
					}

					logger.Debug("added test", zap.Int("index", testIndex), zap.String("group", groupArray[g].Name), zap.String("node", groupArray[g].Peers[peerIndex].Tags[aws.Ec2TagName]))

					newTestWG.Done()
					// makes sure all tests are synced up
					newTestWG.Wait()

					// start said test
					_, err = groupArray[groupIndex].Peers[peerIndex].P.StartTest(ctx, &server.StartTest_Request{
						GroupName: groupArray[groupIndex].Name,
						TestN:     int64(testIndex),
					})
					if err != nil {
						logger.Warn("unable to start test", zap.Error(err))
						// @TODO: maybe return here
					}
					time.Sleep(time.Second * 3)

					logger.Debug("started test", zap.Int("index", testIndex), zap.String("group", groupArray[g].Name), zap.String("node", groupArray[g].Peers[peerIndex].Tags[aws.Ec2TagName]))
				}(&newTestWG, &startTestWG)
			}
		}

		startTestWG.Wait()
	}

	if ctx.Err() == nil {
		logger.Debug("all interaction has been sent, use ctrl+c to stop the test")
	} else {
		logger.Error("the test ended prematurely", zap.Error(ctx.Err()))
	}

	<-ctx.Done()

	return res, nil
}
