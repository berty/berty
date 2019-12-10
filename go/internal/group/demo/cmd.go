package main

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"math"
	"math/big"
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
	secretstore "berty.tech/go/internal/orbitutil/storesecret"
	"berty.tech/go/pkg/errcode"
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

	println("\nNew invitation: ", base64.StdEncoding.EncodeToString(newIB64))

}

func listMembers(s orbitutilapi.MemberStore) {
	members, err := s.ListMembers()
	if err != nil {
		panic(err)
	}

	println(fmt.Sprintf("\nPrinting list of %d members", len(members)))

	for _, m := range members {
		memberKeyBytes, err := m.Member.Raw()
		if err != nil {
			panic(err)
		}

		deviceKeyBytes, err := m.Device.Raw()
		if err != nil {
			panic(err)
		}

		println("  >>  ", base64.StdEncoding.EncodeToString(memberKeyBytes), " >> ", base64.StdEncoding.EncodeToString(deviceKeyBytes))
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

	println("My own peer ID is", self.ID().String())

	g, err := invitation.GetGroup()
	if err != nil {
		panic(err)
	}

	p := path.Join(os.TempDir(), base64.StdEncoding.EncodeToString(invitation.InvitationPrivKey))

	odb, err := orbitutil.NewBertyOrbitDB(ctx, api, &orbitdb.NewOrbitDBOptions{Directory: &p})
	if err != nil {
		panic(err)
	}

	member, _, err := crypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		panic(err)
	}

	device, _, err := crypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		panic(err)
	}

	groupStores, err := odb.InitStoresForGroup(ctx, g, member, device, &orbitdb.CreateDBOptions{
		Directory: &p,
	})
	if err != nil {
		panic(err)
	}

	counter, err := rand.Int(rand.Reader, big.NewInt(0).SetUint64(math.MaxUint64))
	if err != nil {
		panic(err)
	}

	derivationState := make([]byte, 32)
	_, err = rand.Read(derivationState)
	if err != nil {
		panic(err)
	}

	deviceSecret := &group.DeviceSecret{
		DerivationState: derivationState,
		Counter:         counter.Uint64(),
	}

	memberKeyBytes, err := member.GetPublic().Raw()
	if err != nil {
		panic(err)
	}

	deviceKeyBytes, err := device.GetPublic().Raw()
	if err != nil {
		panic(err)
	}

	inviterDevicePubKey, err := invitation.GetInviterDevicePublicKey()
	if err != nil {
		panic(err)
	}

	println("\nOwn member key:", base64.StdEncoding.EncodeToString(memberKeyBytes), "device key: ", base64.StdEncoding.EncodeToString(deviceKeyBytes))
	println("Own derivation state:", base64.StdEncoding.EncodeToString(derivationState), "counter:", counter.Uint64())

	ms := groupStores.GetMemberStore()
	scs := groupStores.GetSecretStore()

	if !create {
		println("\nWaiting store replication")

		once := sync.Once{}
		wg := sync.WaitGroup{}
		wg.Add(1)

		go ms.Subscribe(ctx, func(evt events.Event) {
			switch evt.(type) {
			case *stores.EventReplicated, *stores.EventLoad, *stores.EventWrite, *stores.EventReady:
				println("\nReplicated or ready")

				once.Do(func() {
					members, err := ms.ListMembers()
					if err != nil {
						panic(err)
					}

					listMembers(ms)

					for _, m := range members {
						if m.Device.Equals(inviterDevicePubKey) {
							println("\ninviter found in store", base64.StdEncoding.EncodeToString(invitation.InviterDevicePubKey))
							wg.Done()
						}
					}
				})
			}
		})

		wg.Wait()

		println("redeeming invitation issued by", base64.StdEncoding.EncodeToString(invitation.InviterDevicePubKey))
	}

	_, err = ms.RedeemInvitation(ctx, member, device, invitation)
	if err != nil {
		panic(err)
	}

	listMembers(ms)
	issueNewInvitation(device, g)

	members, err := ms.ListMembers()
	if err != nil {
		panic(err)
	}

	// Send secret to member already in the group
	for _, m := range members {
		if !m.Member.Equals(member.GetPublic()) {
			_, err = scs.SendSecret(ctx, device, m.Member, deviceSecret)
			if err != nil {
				panic(err)
			}
			destMemberPubKeyBytes, err := m.Member.Raw()
			if err != nil {
				panic(err)
			}
			fmt.Println("\nSecret sent to member", base64.StdEncoding.EncodeToString(destMemberPubKeyBytes), ":",
				"\nderivation_state(", base64.StdEncoding.EncodeToString(deviceSecret.DerivationState), ") ",
				"\ncounter(", deviceSecret.Counter, ")")
		}
	}

	go scs.Subscribe(ctx, func(e events.Event) {
		switch e.(type) {
		case *secretstore.EventNewSecret:
			event, _ := e.(*secretstore.EventNewSecret)

			secret, err := scs.GetDeviceSecret(member.GetPublic(), event.SenderDevicePubKey)
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
			fmt.Println("\nSecret received from member", base64.StdEncoding.EncodeToString(senderMemberPubKeyBytes),
				"\nfrom device", base64.StdEncoding.EncodeToString(senderDevicePubKeyBytes), ":",
				"\nderivation_state(", base64.StdEncoding.EncodeToString(secret.DerivationState), ") ",
				"\ncounter(", secret.Counter, ")")

			_, err = scs.GetDeviceSecret(senderMemberPubKey, device.GetPublic())
			if err == errcode.ErrGroupSecretEntryDoesNotExist {
				_, err = scs.SendSecret(ctx, device, senderMemberPubKey, deviceSecret)
				if err != nil {
					panic(err)
				}
				fmt.Println("\nSecret sent back to member", base64.StdEncoding.EncodeToString(senderMemberPubKeyBytes), ":",
					"\nderivation_state(", base64.StdEncoding.EncodeToString(deviceSecret.DerivationState), ") ",
					"\ncounter(", deviceSecret.Counter, ")")
			} else if err != nil {
				panic(err)
			}
		}
	})

	ms.Subscribe(ctx, func(e events.Event) {
		switch e.(type) {
		case *stores.EventReplicated:
			println("\nNew member detected")
			listMembers(ms)
			issueNewInvitation(device, g)
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
		println("Creating a new group")
		_, i, err = group.New()
		if err != nil {
			panic(err)
		}
	} else {
		println("Joining an existing group")
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
