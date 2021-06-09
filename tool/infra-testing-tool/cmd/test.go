package cmd

import (
	"fmt"
	"github.com/google/uuid"
	"github.com/spf13/cobra"
	"infratesting/testing"
	"log"
	"time"
)

var (
	testCmd = &cobra.Command{
		Use: "test",
		RunE: func(cmd *cobra.Command, args []string) error {
			availablePeers, err := testing.GetAllEligiblePeers()
			if err != nil {
				return err
			}

			if len(availablePeers) == 0 {
				log.Println("no available/eligible peers")
				return nil
			}

			leader := availablePeers[0]
			fmt.Println(availablePeers[1:])

			groupName := uuid.NewString()[:8]
			inv, err := leader.GetInvite(groupName)
			if err != nil {
				log.Println(err)
			}

			err = leader.ActivateGroup(groupName)
			if err != nil {
				log.Println(err)
			}

			for _, follower := range availablePeers[1:] {
				err := follower.JoinInvite(inv, groupName)
				if err != nil {
					log.Println(err)
				}

				err = follower.ActivateGroup(groupName)
				if err != nil {
					log.Println(err)
				}

			}

			for i:=0; i<100; i+=1 {
				//go func() {
					err = leader.SendMessage(groupName)
					//time.Sleep(time.Second * 1)
					if err != nil {
						panic(err)
					}
				//}()


			}

			time.Sleep(time.Second*3)

			for _, follower := range availablePeers[1:] {
				err = follower.GetMessageList(groupName)
				if err != nil {
					panic(err)
				}


				fmt.Println(follower.Messages)
			}

			return nil
		},
	}
)
