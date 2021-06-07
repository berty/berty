package cmd

import (
	"github.com/spf13/cobra"
	"infratesting/configParse"
	"infratesting/testing"
	"log"
)

var (
	sendMessageCmd = &cobra.Command{
		Use: "sendMessage",
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


			leader := availablePeers[0]

			err = leader.SendMessage("")
			if err != nil {
				log.Println(err)
			}

			return nil
		},
	}
)
