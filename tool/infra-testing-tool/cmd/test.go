package cmd

import (
	"context"
	"fmt"
	"github.com/google/uuid"
	"github.com/spf13/cobra"
	"infratesting/config"
	"infratesting/daemon/grpc/daemon"
	"infratesting/iac/components/ec2"
	"infratesting/testing"
	"log"
	"strconv"
	"time"
)

var (
	testCmd = &cobra.Command{
		Use: "test",
		RunE: func(cmd *cobra.Command, args []string) error {

			availablePeers,  err := testing.GetAllEligiblePeers(ec2.Ec2TagType, []string{config.NodeTypePeer})
			availableRepl, err := testing.GetAllEligiblePeers(ec2.Ec2TagType, []string{config.NodeTypeReplication})

			if err != nil {
				return err
			}

			c, err := loadConfig()
			if err != nil {
				return err
			}

			for i := range availablePeers {
				availablePeers[i].MatchNodeToPeer(c)
			}

			for i := range availableRepl {
				availableRepl[i].MatchNodeToPeer(c)
			}

			if len(availablePeers) == 0 {
				log.Println("no available/eligible peers")
				return nil
			} else {
				fmt.Printf("%v available peers\n", len(availablePeers))
			}

			var groups = make(map[string]*testing.Group)
			for _, group := range c.Attributes.Groups {
				groups[group.Name] = &testing.Group{
					Tests: group.Tests,
					Peers: nil,
				}
			}

			for i := range availablePeers {
				for _, group := range availablePeers[i].ConfigGroups {

					availablePeers[i].ConfigGroups = nil

					if groups[group.Name].Name == "" {
						groups[group.Name] = &testing.Group{
							Name:  group.Name,
							Tests: group.Tests,
							Peers: []*testing.Peer{&availablePeers[i]},
						}
					} else {
						groupCopy := groups[group.Name]
						groupCopy.Peers = append(groupCopy.Peers, &availablePeers[i])
						groups[group.Name] = groupCopy

					}
				}
			}

			ctx := context.Background()
			for i := range groups {
				fmt.Printf("GROUP: %s\n", groups[i].Name)
				groups[i].Name = fmt.Sprintf("%s-%s", groups[i].Name, uuid.NewString()[:8])

				leader := groups[i].Peers[0]

				invite, err := leader.G.CreateInvite(ctx, &daemon.CreateInvite_Request{GroupName: groups[i].Name})
				if err != nil {
					return err
				}

				if invite == nil {
					return err
				}

				for peerIndex := 1; peerIndex <= len(groups[i].Peers)-1; peerIndex += 1 {

					_, err := groups[i].Peers[peerIndex].G.JoinGroup(ctx, &daemon.JoinGroup_Request{
						GroupName: groups[i].Name,
						Invite:    invite.Invite,
					})
					if err != nil {
						log.Println(err)
					}

					_, err = groups[i].Peers[peerIndex].G.StartReceiveMessage(ctx, &daemon.StartReceiveMessage_Request{
						GroupName: groups[i].Name,
					})
					if err != nil {
						log.Println(err)
					}
				}

				for j := range groups[i].Tests {

					fmt.Println("test: " + strconv.Itoa(j+1))

					for k := range groups[i].Peers {

						_, err = groups[i].Peers[k].T.NewTest(ctx, &daemon.NewTest_Request{
							GroupName: groups[i].Name,
							TestName:  string(j),
							Type:      groups[i].Tests[j].TypeInternal,
							Size:      int64(groups[i].Tests[j].SizeInternal),
							Interval:  int64(groups[i].Tests[j].IntervalInternal),
						})

						if err != nil {
							log.Println(err)
						}

						_, err = groups[i].Peers[k].T.StartTest(ctx, &daemon.StartTest_Request{
							GroupName: groups[i].Name,
							TestName:  string(j),
							Duration:  10,
						})
						if err != nil {
							log.Println(err)
						}

					for p, _ := range availablePeers {
						fmt.Printf("%s reveived %d messages in group: %s\n", availablePeers[p].Name, len(availablePeers[p].Messages[groups[i].Name]), groups[i].Name)
					}
				}
				for j := range groups[i].Tests {
					for k := range groups[i].Peers {
						for {
							isrunning, err := groups[i].Peers[k].T.IsTestRunning(ctx, &daemon.IsTestRunning_Request{
								GroupName: groups[i].Name,
								TestName:  string(j),
							})
							if err != nil {
								log.Println(err)
							} else {
								log.Println(isrunning.TestIsRunning)
								if isrunning.TestIsRunning == false {
									break
								}
								time.Sleep(time.Second * 3)
							}
						}
					}
				}
 			}
			return nil
		},
	}
)
