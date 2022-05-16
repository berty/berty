package cmd

import (
	"bytes"
	"context"
	"encoding/gob"
	"fmt"
	"infratesting/aws"
	"infratesting/config"
	"infratesting/logging"
	"infratesting/server/grpc/server"
	"infratesting/testing"
	"math/rand"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"

	"berty.tech/berty/v2/go/pkg/messengertypes"

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
			return logging.LogErr(err)
		}

		// @TODO: handle error correctly
		// need better logging system
		res, err := runTestFlow(ctx, timeout, c)
		if err != nil {
			return logging.LogErr(err)
		}

		logging.Log(
			fmt.Sprintf("elpased: %dm%ds", int(res.elapsed.Minutes()), int(res.elapsed.Seconds())),
		)

		logging.Log("stopping the test now...")

		return stopTest(ctx, &c)
	},
}

func updoadLogs(ctx context.Context, res *Result, c config.Config) error {
	// handle ctrl+c
	ctx, cancel := contextHandleSignal(ctx, syscall.SIGINT)
	defer cancel()

	logging.Log("uploading logs... (ctrl+c to cancel)")

	allNodes, err := testing.GetAllEligiblePeers(aws.Ec2TagType, config.GetAllTypes())
	if err != nil {
		return logging.LogErr(err)
	}

	cerr := make([]chan error, len(allNodes))
	for n := range allNodes {
		cerr[n] = make(chan error, 1)
		go func(n int) {
			name := allNodes[n].Name
			resp, err := allNodes[n].P.UploadLogs(ctx, &server.UploadLogs_Request{
				Folder: strconv.FormatInt(res.started.Unix(), 10),
				Name:   strings.ReplaceAll(allNodes[n].Tags[aws.Ec2TagName], ".", "-"),
			})
			if err != nil {
				cerr[n] <- logging.LogErr(fmt.Errorf("[%s]: %w", name, err))
				return
			}

			bucketName, err := aws.GetBucketName()
			if err != nil {
				cerr[n] <- logging.LogErr(fmt.Errorf("[%s]: %w", name, err))
				return
			}
			logging.Log(fmt.Sprintf("%v uploaded: %v files to bucket: %s", allNodes[n].Tags[aws.Ec2TagName], resp.UploadCount, bucketName))

			cerr[n] <- nil
		}(n)
	}

	for _, c := range cerr {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case err := <-c:
			if err != nil {
				logging.LogErr(err)
			}
		}
	}

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
		logging.Log("there are no tests configured in the config")
		return res, nil
	}

	aws.SetRegion(c.Settings.Region)

	availablePeers, err := testing.GetAllEligiblePeers(aws.Ec2TagType, []string{config.NodeTypePeer})
	if err != nil {
		return res, logging.LogErr(err)
	}

	availableRepl, err := testing.GetAllEligiblePeers(aws.Ec2TagType, []string{config.NodeTypeReplication})
	if err != nil {
		return res, logging.LogErr(err)
	}

	allPeers, err := testing.GetAllPeers()
	if err != nil {
		return res, logging.LogErr(err)
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
			group.Peers = append(group.Peers, &availablePeers[i])

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
				return res, logging.LogErr(err)
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
					return res, logging.LogErr(err)
				}

				gr := groups[availablePeers[i].ConfigGroups[g].Name]
				gr.Pk = invite.Invite
				groups[availablePeers[i].ConfigGroups[g].Name] = gr

				n := bytes.NewBuffer(invite.Invite)
				dec := gob.NewDecoder(n)
				var inv messengertypes.ShareableBertyGroup_Reply
				err = dec.Decode(&inv)
				if err != nil {
					_ = logging.LogErr(err)
				}

				// invite url
				// logging.Log(inv.WebURL)

				_, err = availablePeers[i].P.StartReceiveMessage(ctx, &server.StartReceiveMessage_Request{
					GroupName: availablePeers[i].ConfigGroups[g].Name,
				})
				if err != nil {
					return res, logging.LogErr(err)
				}

			} else {
				// group already exists, join it
				_, err := availablePeers[i].P.JoinGroup(ctx, &server.JoinGroup_Request{
					GroupName: availablePeers[i].ConfigGroups[g].Name,
					Invite:    groups[availablePeers[i].ConfigGroups[g].Name].Pk,
				})
				if err != nil {
					if !strings.Contains(err.Error(), server.ErrAlreadyInGroup) {
						return res, logging.LogErr(err)
					}
				}

				_, err = availablePeers[i].P.StartReceiveMessage(ctx, &server.StartReceiveMessage_Request{
					GroupName: availablePeers[i].ConfigGroups[g].Name,
				})
				if err != nil {
					return res, logging.LogErr(err)
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
					// create new test with correct variables
					_, err = groupArray[groupIndex].Peers[peerIndex].P.NewTest(ctx, &server.NewTest_Request{
						GroupName: groupArray[groupIndex].Name,
						TestN:     int64(testIndex),
						Type:      groupArray[groupIndex].Tests[testIndex].TypeInternal,
						Size:      int64(groupArray[groupIndex].Tests[testIndex].SizeInternal),
						Interval:  int64(groupArray[groupIndex].Tests[testIndex].IntervalInternal),
						Amount:    int64(groupArray[groupIndex].Tests[testIndex].AmountInternal),
					})
					logging.Log(fmt.Sprintf("added test - test: '%v' in group: '%v' on node: %v", testIndex, groupArray[groupIndex].Name, groupArray[g].Peers[peerIndex].Tags[aws.Ec2TagName]))

					if err != nil {
						logging.Log(err.Error())
					}

					newTestWG.Done()
					// makes sure all tests are synced up
					newTestWG.Wait()

					// start said test
					_, err = groupArray[groupIndex].Peers[peerIndex].P.StartTest(ctx, &server.StartTest_Request{
						GroupName: groupArray[groupIndex].Name,
						TestN:     int64(testIndex),
					})
					if err != nil {
						logging.Log(err.Error())
					}
					time.Sleep(time.Second * 3)

					logging.Log(fmt.Sprintf("started test - test: '%v' in group: '%v' on node: %v", testIndex, groupArray[g].Name, groupArray[g].Peers[peerIndex].Tags[aws.Ec2TagName]))

					startTestWG.Done()
				}(&newTestWG, &startTestWG)
			}
		}

		startTestWG.Wait()
	}

	if ctx.Err() == nil {
		logging.Log("all interaction has been sent, use ctrl+c to stop the test")
	} else {
		logging.Log(fmt.Sprintf("the test ended prematurely: %s", ctx.Err().Error()))
	}

	<-ctx.Done()

	return res, nil
}
