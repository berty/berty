package cmd

import (
	"fmt"
	"github.com/google/uuid"
	"github.com/spf13/cobra"
	"infratesting/config"
	"infratesting/iac/components/ec2"
	"infratesting/testing"
	"log"
	"strconv"
	"sync"
	"time"
)

var (
	testCmd = &cobra.Command{
		Use: "test",
		RunE: func(cmd *cobra.Command, args []string) error {
			availablePeers,  err := testing.GetAllEligiblePeers(ec2.Ec2TagType, []string{config.NodeTypePeer})
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

			for i := range groups {
				fmt.Printf("GROUP: %s\n", groups[i].Name)
				groups[i].Name = fmt.Sprintf("%s-%s", groups[i].Name, uuid.NewString()[:8])

				leader := groups[i].Peers[0]

				inv, err := leader.GetInvite(groups[i].Name)
				if err != nil {
					log.Println(err)
				}

				err = leader.ActivateGroup(groups[i].Name)
				if err != nil {
					log.Println(err)
				}

				for peerIndex := 1; peerIndex <= len(groups[i].Peers)-1; peerIndex += 1 {
					err := groups[i].Peers[peerIndex].JoinInvite(inv, groups[i].Name)
					if err != nil {
						log.Println(err)
					}

					err = groups[i].Peers[peerIndex].ActivateGroup(groups[i].Name)
					if err != nil {
						log.Println(err)
					}
				}

				//testWg := sync.WaitGroup{}
				//testWg.Add(len(daemon[i].Tests))
				//go func() {
					for j := range groups[i].Tests {

						fmt.Println("test: " + strconv.Itoa(j+1))
						peerWg := sync.WaitGroup{}
						for k := range groups[i].Peers {
							peerWg.Add(1)

							peerIndex := k
							groupIndex := i
							testIndex := j

							go func() {
								fmt.Println("Started messaging goroutine on: " + groups[i].Peers[peerIndex].Name)
								var x int
								for x = 0; x < 5; x += 1 {
									err = groups[groupIndex].Peers[peerIndex].SendMessage(groups[groupIndex].Name, testing.ConstructMessage(groups[i].Tests[j].SizeInternal))
									if err != nil {
										panic(err)
									}
									time.Sleep(time.Second * time.Duration(groups[groupIndex].Tests[testIndex].IntervalInternal))
								}

								fmt.Printf("%s sent %d messages\n", groups[groupIndex].Peers[peerIndex].Name, x)

								peerWg.Done()
							}()

						}
						peerWg.Wait()

						//testWg.Done()

						for k := range availablePeers {
							err = groups[i].Peers[k].GetMessageList(groups[i].Name, j)
							if err != nil {
								panic(err)
							}

							amount := groups[i].Peers[k].CountMessages(groups[i].Name, j)
							size := groups[i].Peers[k].CountSize(groups[i].Name, j)

							fmt.Printf("%s reveived %d messages with average size of +-%d bytes in group: %s\n", groups[i].Peers[k].Name, amount, size/amount, groups[i].Name)
						}



					}
				//}()
				//testWg.Wait()


			}

			return nil
		},
	}
)
