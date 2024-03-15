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
	"strings"
	"sync"
	"time"

	"berty.tech/berty/v2/go/pkg/messengertypes"
	"github.com/spf13/cobra"
)

var testStartCmd = &cobra.Command{
	Use: "test-start",
	RunE: func(cmd *cobra.Command, args []string) error {
		ctx := context.Background()

		c, err := loadConfig()
		if err != nil {
			return err
		}

		return startTest(ctx, &c)
	},
}

func startTest(ctx context.Context, c *config.Config) error {
	var amountOfGroups int
	for _, group := range c.Attributes.Groups {
		amountOfGroups += len(group.Tests)
	}

	if amountOfGroups == 0 {
		logging.Log("there are no tests configured in the config")
		return nil
	}

	aws.SetRegion(c.Settings.Region)

	availablePeers, err := testing.GetAllEligiblePeers(aws.Ec2TagType, []string{config.NodeTypePeer})
	if err != nil {
		return logging.LogErr(err)
	}

	availableRepl, err := testing.GetAllEligiblePeers(aws.Ec2TagType, []string{config.NodeTypeReplication})
	if err != nil {
		return logging.LogErr(err)
	}

	allPeers, err := testing.GetAllPeers()
	if err != nil {
		return logging.LogErr(err)
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
		availablePeers[i].MatchNodeToPeer(*c)
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
		availableRepl[i].MatchNodeToPeer(*c)
		for g := range availableRepl[i].ConfigGroups {
			p := groups[availableRepl[i].ConfigGroups[g].Name].Peers[rand.Intn(len(groups[availableRepl[i].ConfigGroups[g].Name].Peers))]
			_, err = p.P.AddReplication(ctx, &server.AddReplication_Request{
				GroupName: availableRepl[g].ConfigGroups[g].Name,
				TokenIp:   availableRepl[i].Ip,
			})

			if err != nil {
				return logging.LogErr(err)
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
					return logging.LogErr(err)
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
					return logging.LogErr(err)
				}

			} else {
				// group already exists, join it
				_, err := availablePeers[i].P.JoinGroup(ctx, &server.JoinGroup_Request{
					GroupName: availablePeers[i].ConfigGroups[g].Name,
					Invite:    groups[availablePeers[i].ConfigGroups[g].Name].Pk,
				})
				if err != nil {
					if !strings.Contains(err.Error(), server.ErrAlreadyInGroup) {
						return logging.LogErr(err)
					}
				}

				_, err = availablePeers[i].P.StartReceiveMessage(ctx, &server.StartReceiveMessage_Request{
					GroupName: availablePeers[i].ConfigGroups[g].Name,
				})
				if err != nil {
					return logging.LogErr(err)
				}
			}
		}
	}

	for p := range allPeers {
		allPeers[p].MatchNodeToPeer(*c)
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
		logging.Log("test started, use `stop-test` command to stop and get the logs for this session")
	}

	return nil
}
