package cmd

import (
	"fmt"
	"github.com/google/uuid"
	"github.com/spf13/cobra"
	"infratesting/config"
	"infratesting/testing"
	"log"
	"math/rand"
)

var (
	joinGroupCmd = &cobra.Command{
		Use: "joinGroup",
		RunE: func(cmd *cobra.Command, args []string) error {
			instances, err := testing.DescribeInstances()
			if err != nil {
				return err
			}

			if len(instances) == 0 {
				log.Println("no running instances")
				return nil
			}

			// slice that holds ips of peers
			var availablePeers []testing.Peer

			for _, instance := range instances {
				for _, tag := range instance.Tags {
					// if instance is peer
					if *tag.Key == "Type" && *tag.Value == config.NodeTypePeer {
						p, err := testing.NewPeer(*instance.PublicIpAddress)
						if err != nil {
							return err
						}
						availablePeers = append(availablePeers, p)
					}
				}
			}

			if len(availablePeers) == 0 {
				log.Println("no available peers")
				return nil
			}

			//shuffle for good measure
			rand.Shuffle(len(availablePeers), func(i, j int) { availablePeers[i], availablePeers[j] = availablePeers[j], availablePeers[i] })

			leader := availablePeers[0]
			slaves := availablePeers[1:]

			// create invite
			groupName := uuid.NewString()[:8]
			invite, err := leader.GetInvite(groupName)

			fmt.Printf("%p\n", invite.Link.BertyGroup.Group.PublicKey)

			if err != nil {
				log.Println(err)
			}

			// everybody needs to join in
			for _, peer := range slaves {
				if peer.Ip == leader.Ip {
					continue
				}
				err = peer.JoinInvite(invite, groupName)
				if err != nil {
					log.Println(err)
				}
			}

			return nil
		},
	}
)
