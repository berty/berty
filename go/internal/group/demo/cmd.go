package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"os"
	"path"
	"sync"

	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/events"
	"berty.tech/go-orbit-db/stores"
	"berty.tech/go/internal/group"
	"berty.tech/go/internal/ipfsutil"
	"berty.tech/go/internal/orbitutil"
	"berty.tech/go/internal/orbitutil/orbitutilapi"
	"berty.tech/go/internal/orbitutil/storesecret"
	"github.com/libp2p/go-libp2p-core/crypto"
)

func issueNewInvitation(device crypto.PrivKey, g *group.Group) {
	newI, err := group.NewInvitation(device, g)
	if err != nil {
		panic(err)
	}

	newIB64, err := newI.Marshal()
	if err != nil {
		panic(err)
	}

	fmt.Println("")
	fmt.Println("New invitation: ", base64.StdEncoding.EncodeToString(newIB64))
}

func listMembers(s orbitutilapi.MemberStore) {
	members, err := s.ListMembers()
	if err != nil {
		panic(err)
	}

	fmt.Println("")
	fmt.Println(fmt.Sprintf("Printing list of %d members", len(members)))

	for _, m := range members {
		memberKeyBytes, err := m.Member.Raw()
		if err != nil {
			panic(err)
		}

		deviceKeyBytes, err := m.Device.Raw()
		if err != nil {
			panic(err)
		}

		fmt.Println("  >>  ", base64.StdEncoding.EncodeToString(memberKeyBytes), " >> ", base64.StdEncoding.EncodeToString(deviceKeyBytes))
	}
}

func mainLoop(invitation *group.Invitation, create bool) {
	//zaptest.Level(zapcore.DebugLevel)
	//config := zap.NewDevelopmentConfig()
	//config.OutputPaths = []string{"stdout"}
	//logger, _ := config.Build()
	//zap.ReplaceGlobals(logger)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cfg, err := createBuildConfig()
	if err != nil {
		panic(err)
	}

	api, err := ipfsutil.NewConfigurableCoreAPI(ctx, cfg, ipfsutil.OptionMDNSDiscovery)
	if err != nil {
		panic(err)
	}

	self, err := api.Key().Self(ctx)
	if err != nil {
		panic(err)
	}

	fmt.Println("My own peer ID is", self.ID().String())

	g, err := invitation.GetGroup()
	if err != nil {
		panic(err)
	}

	p := path.Join(os.TempDir(), base64.StdEncoding.EncodeToString(invitation.InvitationPrivKey))

	odb, err := orbitutil.NewBertyOrbitDB(ctx, api, &orbitdb.NewOrbitDBOptions{Directory: &p})
	if err != nil {
		panic(err)
	}

	ownMemberDevice, err := group.NewOwnMemberDevice()
	if err != nil {
		panic(err)
	}

	groupContext := orbitutil.NewGroupContext(g, ownMemberDevice)

	if err := odb.InitStoresForGroup(ctx, groupContext, &orbitdb.CreateDBOptions{
		Directory: &p,
	}); err != nil {
		panic(err)
	}

	memberKeyBytes, err := groupContext.GetMemberPrivKey().GetPublic().Raw()
	if err != nil {
		panic(err)
	}

	deviceKeyBytes, err := groupContext.GetDevicePrivKey().GetPublic().Raw()
	if err != nil {
		panic(err)
	}

	inviterDevicePubKey, err := invitation.GetInviterDevicePublicKey()
	if err != nil {
		panic(err)
	}

	fmt.Println("")
	fmt.Println("Own member key:", base64.StdEncoding.EncodeToString(memberKeyBytes), "device key: ", base64.StdEncoding.EncodeToString(deviceKeyBytes))
	fmt.Println("Own derivation state:", base64.StdEncoding.EncodeToString(groupContext.GetDeviceSecret().DerivationState), "counter:", groupContext.GetDeviceSecret().Counter)

	ms := groupContext.GetMemberStore()
	scs := groupContext.GetSecretStore()

	if !create {
		fmt.Println("")
		fmt.Println("Waiting store replication")

		once := sync.Once{}
		wg := sync.WaitGroup{}
		wg.Add(1)

		go ms.Subscribe(ctx, func(evt events.Event) {
			switch evt.(type) {
			case *stores.EventReplicated, *stores.EventLoad, *stores.EventWrite, *stores.EventReady:
				fmt.Println("")
				fmt.Println("Replicated or ready")

				once.Do(func() {
					members, err := ms.ListMembers()
					if err != nil {
						panic(err)
					}

					listMembers(ms)

					for _, m := range members {
						if m.Device.Equals(inviterDevicePubKey) {
							fmt.Println("")
							fmt.Println("inviter found in store", base64.StdEncoding.EncodeToString(invitation.InviterDevicePubKey))
							wg.Done()
						}
					}
				})
			}
		})

		wg.Wait()

		fmt.Println("redeeming invitation issued by", base64.StdEncoding.EncodeToString(invitation.InviterDevicePubKey))
	}

	_, err = ms.RedeemInvitation(ctx, invitation)
	if err != nil {
		panic(err)
	}

	listMembers(ms)
	issueNewInvitation(groupContext.GetDevicePrivKey(), groupContext.GetGroup())

	members, err := ms.ListMembers()
	if err != nil {
		panic(err)
	}

	// Send secret to member already in the group
	for _, m := range members {
		if !m.Member.Equals(groupContext.GetMemberPrivKey().GetPublic()) {
			_, err = scs.SendSecret(ctx, m.Member)
			if err != nil {
				panic(err)
			}
			destMemberPubKeyBytes, err := m.Member.Raw()
			if err != nil {
				panic(err)
			}
			fmt.Println("")
			fmt.Println("Secret sent to member", base64.StdEncoding.EncodeToString(destMemberPubKeyBytes), ":\n",
				"derivation_state(", base64.StdEncoding.EncodeToString(groupContext.GetDeviceSecret().DerivationState), ")\n",
				"counter(", groupContext.GetDeviceSecret().Counter, ")")
		}
	}

	go scs.Subscribe(ctx, func(e events.Event) {
		switch e.(type) {
		case *storesecret.EventNewSecret:
			event, _ := e.(*storesecret.EventNewSecret)

			secret, err := scs.GetDeviceSecret(event.SenderDevicePubKey)
			if err != nil {
				panic(err)
			}

			senderMemberPubKey, err := ms.MemberForDevice(event.SenderDevicePubKey)
			if err != nil {
				panic(err)
			}

			senderDevicePubKeyBytes, err := event.SenderDevicePubKey.Raw()
			if err != nil {
				panic(err)
			}
			senderMemberPubKeyBytes, err := senderMemberPubKey.Raw()
			if err != nil {
				panic(err)
			}
			fmt.Println("")
			fmt.Println("Secret received from member", base64.StdEncoding.EncodeToString(senderMemberPubKeyBytes),
				"from device", base64.StdEncoding.EncodeToString(senderDevicePubKeyBytes), ":\n",
				"derivation_state(", base64.StdEncoding.EncodeToString(secret.DerivationState), ")\n",
				"counter(", secret.Counter, ")")

			// TODO: Fix logic of send back mechanism
			// _, err = scs.GetDeviceSecret(senderMemberPubKey, device.GetPublic())
			// if err == errcode.ErrGroupSecretEntryDoesNotExist {
			// 	_, err = scs.SendSecret(ctx, device, senderMemberPubKey, deviceSecret)
			// 	if err != nil {
			// 		panic(err)
			// 	}
			// 	fmt.Println("")
			// 	fmt.Println("Secret sent back to member", base64.StdEncoding.EncodeToString(senderMemberPubKeyBytes), ":\n",
			// 		"derivation_state(", base64.StdEncoding.EncodeToString(deviceSecret.DerivationState), ")\n",
			// 		"counter(", deviceSecret.Counter, ")")
			// } else if err != nil {
			// 	panic(err)
			// }
		}
	})

	ms.Subscribe(ctx, func(e events.Event) {
		switch e.(type) {
		case *stores.EventReplicated:
			fmt.Println("")
			fmt.Println("New member detected")
			listMembers(ms)
			issueNewInvitation(groupContext.GetDevicePrivKey(), groupContext.GetGroup())
			break
		}
	})

	<-ctx.Done()
}

func main() {
	var (
		i   *group.Invitation
		err error
	)

	create := len(os.Args) == 1

	if create {
		fmt.Println("Creating a new group")
		_, i, err = group.New()
		if err != nil {
			panic(err)
		}
	} else {
		fmt.Println("Joining an existing group")
		// Read invitation (as base64 on stdin)
		iB64, err := base64.StdEncoding.DecodeString(os.Args[1])
		if err != nil {
			panic(err)
		}

		i = &group.Invitation{}
		err = i.Unmarshal(iB64)
		if err != nil {
			panic(err)
		}
	}

	mainLoop(i, create)
}
