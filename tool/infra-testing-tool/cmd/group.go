package cmd

import (
	"fmt"
	"github.com/google/uuid"
	"github.com/spf13/cobra"
	"infratesting/configParse"
	"infratesting/testing"
	"log"
	"math/rand"
)

var (
	groupCmd = &cobra.Command{
		Use: "group",
		RunE: func(cmd *cobra.Command, args []string) error {

			// get all ips

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
					if *tag.Key == "Type" && *tag.Value == configParse.NodeTypePeer {
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

			// pick a "leader"
			leader := availablePeers[0]
			slaves := availablePeers[1:]
			//p, _ := testing.NewPeer("127.0.0.1")
			//slaves = append(availablePeers, leader)

			fmt.Println(availablePeers)
			fmt.Println(leader)
			fmt.Println(slaves)

			// create invite
			groupName := uuid.NewString()[:8]
			invite, err := leader.GetInvite(groupName)
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
					log.Println(peer)
					log.Println(err)
				}
			}

			fmt.Println(leader)
			fmt.Println(slaves)

			fmt.Println("waiting ...")

			fmt.Println("sending msg")

			err = leader.SendMessage(groupName)
			if err != nil {
				log.Println(err)
			}

			for _, peer := range slaves {
				err = peer.GetMessageList(groupName)
				if err != nil {
					log.Println(err)
				}

				log.Println("messages: " + string(len(peer.Messages)))

				for _, message := range peer.Messages {
					log.Println(string(message.Payload))
				}

			}

			return nil
		},
	}
)
