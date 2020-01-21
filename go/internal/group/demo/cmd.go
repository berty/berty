package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"os"
	"path"
	"time"

	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/events"
	"berty.tech/go-orbit-db/stores"
	"github.com/LK4D4/trylock"
	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/internal/ipfsutil"
	"berty.tech/berty/go/internal/orbitutil"
	"berty.tech/berty/go/pkg/bertyprotocol"
	"berty.tech/berty/go/pkg/errcode"
)

func isMemberMineOrGroup(member crypto.PubKey, groupContext orbitutil.GroupContext) string {
	if member.Equals(groupContext.GetMemberPrivKey().GetPublic()) {
		return "(Own member)"
	} else if member.Equals(groupContext.GetGroup().PubKey) {
		return "(Group)"
	}
	return ""
}

func isDeviceMine(device crypto.PubKey, groupContext orbitutil.GroupContext) string {
	if device.Equals(groupContext.GetDevicePrivKey().GetPublic()) {
		return "(Own device)"
	}
	return ""
}

func sendSecretToMember(ctx context.Context, member crypto.PubKey, groupContext orbitutil.GroupContext, back bool) {
	_, err := groupContext.GetMetadataStore().SendSecret(ctx, member)
	if err == errcode.ErrGroupSecretAlreadySentToMember {
		return
	} else if err != nil {
		panic(err)
	}

	destMemberPubKeyBytes, err := member.Raw()
	if err != nil {
		panic(err)
	}

	if back {
		fmt.Println("Send back secret to member:", base64.StdEncoding.EncodeToString(destMemberPubKeyBytes), isMemberMineOrGroup(member, groupContext))
	} else {
		fmt.Println("\tTo member:", base64.StdEncoding.EncodeToString(destMemberPubKeyBytes), isMemberMineOrGroup(member, groupContext))
	}
}

func listMembers(groupContext orbitutil.GroupContext) {
	members := groupContext.GetMetadataStore().ListMembers()

	fmt.Println("")
	fmt.Println("Printing list of", len(members), "members:")

	for i, member := range members {
		memberDevices, err := groupContext.GetMetadataStore().GetDevicesForMember(member)
		if err != nil {
			panic(err)
		}

		memberKeyBytes, err := memberDevices[0].Raw()
		if err != nil {
			panic(err)
		}
		memberKeyStr := base64.StdEncoding.EncodeToString(memberKeyBytes)

		devices := ""
		for _, device := range memberDevices {
			deviceKeyBytes, err := device.Raw()
			if err != nil {
				panic(err)
			}
			devices += base64.StdEncoding.EncodeToString(deviceKeyBytes)

			if own := isDeviceMine(device, groupContext); own != "" {
				devices += " " + own
			}
		}

		fmt.Println("Member", i, "\b: {")
		fmt.Println("\tMember:", memberKeyStr, isMemberMineOrGroup(member, groupContext))
		fmt.Println("\tDevice(s):", "["+devices+"]")

		if i != len(members)-1 {
			fmt.Println("},")
		} else {
			fmt.Println("}")
		}
	}
}

func mainLoop(g *group.Group, groupSK crypto.PrivKey) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cfg, err := createBuildConfig()
	if err != nil {
		panic(err)
	}

	api, _, err := ipfsutil.NewConfigurableCoreAPI(ctx, cfg, ipfsutil.OptionMDNSDiscovery)
	if err != nil {
		panic(err)
	}

	self, err := api.Key().Self(ctx)
	if err != nil {
		panic(err)
	}

	p := path.Join(os.TempDir(), string(os.Getpid()))

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

	groupBytes, err := g.PubKey.Raw()
	if err != nil {
		panic(err)
	}

	fmt.Println("")
	fmt.Println("PeerID:", self.ID().String())
	fmt.Println("GroupID:", base64.StdEncoding.EncodeToString(groupBytes))
	fmt.Println("Member key:", base64.StdEncoding.EncodeToString(memberKeyBytes))
	fmt.Println("Device key:", base64.StdEncoding.EncodeToString(deviceKeyBytes))
	fmt.Println("Chain key:", base64.StdEncoding.EncodeToString(groupContext.GetDeviceSecret().ChainKey))
	fmt.Println("Counter:", groupContext.GetDeviceSecret().Counter)

	ms := groupContext.GetMetadataStore()

	debounce := &trylock.Mutex{}

	go ms.Subscribe(ctx, func(e events.Event) {
		switch e.(type) {
		case *bertyprotocol.GroupMetadataEvent:
			casted, _ := e.(*bertyprotocol.GroupMetadataEvent)
			if casted.Metadata.EventType != bertyprotocol.EventTypeGroupDeviceSecretAdded {
				return
			}

			event := &bertyprotocol.GroupAddDeviceSecret{}
			if err := event.Unmarshal(casted.Metadata.Payload); err != nil {
				// TODO: log
				return
			}

			senderDevicePubKey, err := crypto.UnmarshalEd25519PublicKey(event.DevicePK)
			if err != nil {
				panic(err)
			}

			secret, err := ms.GetDeviceSecret(senderDevicePubKey)
			if err != nil {
				panic(err)
			}

			memberEntry, err := ms.GetMemberByDevice(senderDevicePubKey)
			if err != nil {
				panic(err)
			}

			senderDevicePubKeyBytes := event.DevicePK
			senderMemberPubKeyBytes, err := memberEntry.Raw()
			if err != nil {
				panic(err)
			}
			fmt.Println("")
			fmt.Println("Secret received from: {")
			fmt.Println("\tMember:", base64.StdEncoding.EncodeToString(senderMemberPubKeyBytes), isMemberMineOrGroup(memberEntry, groupContext))
			fmt.Println("\tDevice:", base64.StdEncoding.EncodeToString(senderDevicePubKeyBytes), isDeviceMine(senderDevicePubKey, groupContext))
			fmt.Println("\tDerivation state:", base64.StdEncoding.EncodeToString(secret.ChainKey))
			fmt.Println("\tCounter:", secret.Counter)
			fmt.Println("}")

			sendSecretToMember(ctx, memberEntry, groupContext, true)

			// Debounces listing members / issuing new invitation
			go func() {
				if debounce.TryLock() {
					time.Sleep(500 * time.Millisecond)
					listMembers(groupContext)
					debounce.Unlock()
				}
			}()
		}
	})

	fmt.Println("")
	if groupSK == nil {
		fmt.Println("Waiting for store replication")

		replicated := false
		waitCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
		defer cancel()

		go ms.Subscribe(ctx, func(e events.Event) {
			switch e.(type) {
			case *stores.EventReplicated:
				replicated = true
				cancel()
			}
		})

		<-waitCtx.Done()

		if !replicated {
			panic("replication failed (timeout)")
		}
	}

	fmt.Println("Joining group")

	_, err = ms.JoinGroup(ctx)
	if err != nil {
		panic(err)
	}

	fmt.Println("Sending secret to members already in the group")

	members := ms.ListMembers()

	for _, member := range members {
		sendSecretToMember(ctx, member, groupContext, false)
	}

	if groupSK != nil {
		if _, err := ms.ClaimGroupOwnership(ctx, groupSK); err != nil {
			panic(err)
		}
	}

	<-ctx.Done()
}

func main() {
	var (
		g   *group.Group
		sk  crypto.PrivKey
		err error
	)

	create := len(os.Args) == 1

	if create {
		fmt.Println("Creating a new group")
		g, sk, err = group.New()
		if err != nil {
			panic(err)
		}

		pkB, err := g.PubKey.Raw()
		if err != nil {
			panic(err)
		}
		skB, err := g.SigningKey.Raw()
		if err != nil {
			panic(err)
		}
		skSig, err := sk.Sign(skB)
		if err != nil {
			panic(err)
		}

		gInv := bertyprotocol.Group{
			PublicKey: pkB,
			Secret:    skB,
			SecretSig: skSig,
			GroupType: bertyprotocol.GroupTypeMultiMember,
		}

		gInvB, err := gInv.Marshal()
		if err != nil {
			panic(err)
		}

		fmt.Printf("Group token: %s\n", base64.StdEncoding.EncodeToString(gInvB))
	} else {
		fmt.Println("Joining an existing group")
		// Read invitation (as base64 on stdin)
		iB64, err := base64.StdEncoding.DecodeString(os.Args[1])
		if err != nil {
			panic(err)
		}

		grp := &bertyprotocol.Group{}
		err = grp.Unmarshal(iB64)
		if err != nil {
			panic(err)
		}
	}

	mainLoop(g, sk)
}
