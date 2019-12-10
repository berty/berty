package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"os"
	"path"
	"time"

	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/internal/ipfsutil"
	"berty.tech/berty/go/internal/orbitutil"
	"berty.tech/berty/go/internal/orbitutil/storesecret"
	"berty.tech/berty/go/pkg/errcode"
	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/events"
	"berty.tech/go-orbit-db/stores"
	"github.com/LK4D4/trylock"
	"github.com/libp2p/go-libp2p-core/crypto"
)

func issueNewInvitation(member crypto.PrivKey, g *group.Group) {
	newI, err := group.NewInvitation(member, g)
	if err != nil {
		panic(err)
	}

	newIB64, err := newI.Marshal()
	if err != nil {
		panic(err)
	}

	fmt.Println("")
	fmt.Println("New invitation:", base64.StdEncoding.EncodeToString(newIB64))
}

func isMemberMineOrGroup(member crypto.PubKey, groupContext *orbitutil.GroupContext) string {
	if member.Equals(groupContext.GetMemberPrivKey().GetPublic()) {
		return "(Own member)"
	} else if member.Equals(groupContext.GetGroup().PubKey) {
		return "(Group)"
	}
	return ""
}

func isDeviceMine(device crypto.PubKey, groupContext *orbitutil.GroupContext) string {
	if device.Equals(groupContext.GetDevicePrivKey().GetPublic()) {
		return "(Own device)"
	}
	return ""
}

func sendSecretToMember(ctx context.Context, member crypto.PubKey, groupContext *orbitutil.GroupContext, back bool) {
	_, err := groupContext.GetSecretStore().SendSecret(ctx, member)
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

func listMembers(groupContext *orbitutil.GroupContext) {
	members, err := groupContext.GetMemberStore().ListMembers()
	if err != nil {
		panic(err)
	}

	fmt.Println("")
	fmt.Println("Printing list of", len(members), "members:")

	for i, member := range members {

		memberEntry, err := groupContext.GetMemberStore().GetEntryByMember(member)
		if err != nil {
			panic(err)
		}

		memberKeyBytes, err := memberEntry.Member.Raw()
		if err != nil {
			panic(err)
		}
		memberKeyStr := base64.StdEncoding.EncodeToString(memberKeyBytes)

		inviters := ""
		for j, inviter := range memberEntry.Inviters {
			inviterKeyBytes, err := inviter.Raw()
			if err != nil {
				panic(err)
			}
			inviters += base64.StdEncoding.EncodeToString(inviterKeyBytes)

			if own := isMemberMineOrGroup(inviter, groupContext); own != "" {
				inviters += " " + own
			}

			if j != len(memberEntry.Inviters)-1 {
				inviters += ", "
			}
		}

		devices := ""
		for j, device := range memberEntry.Devices {
			deviceKeyBytes, err := device.Raw()
			if err != nil {
				panic(err)
			}
			devices += base64.StdEncoding.EncodeToString(deviceKeyBytes)

			if own := isDeviceMine(device, groupContext); own != "" {
				devices += " " + own
			}

			if j != len(memberEntry.Devices)-1 {
				inviters += ", "
			}
		}

		fmt.Println("Member", i, "\b: {")
		fmt.Println("\tMember:", memberKeyStr, isMemberMineOrGroup(member, groupContext))
		fmt.Println("\tDevice(s):", "["+devices+"]")
		fmt.Println("\tInviter(s):", "["+inviters+"]")

		if i != len(members)-1 {
			fmt.Println("},")
		} else {
			fmt.Println("}")
		}
	}
}

func mainLoop(invitation *group.Invitation, create bool) {
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

	fmt.Println("")
	fmt.Println("PeerID:", self.ID().String())
	fmt.Println("GroupID:", base64.StdEncoding.EncodeToString(invitation.GroupPubKey))
	fmt.Println("Member key:", base64.StdEncoding.EncodeToString(memberKeyBytes))
	fmt.Println("Device key:", base64.StdEncoding.EncodeToString(deviceKeyBytes))
	fmt.Println("Derivation state:", base64.StdEncoding.EncodeToString(groupContext.GetDeviceSecret().DerivationState))
	fmt.Println("Counter:", groupContext.GetDeviceSecret().Counter)

	ms := groupContext.GetMemberStore()
	scs := groupContext.GetSecretStore()

	debounce := &trylock.Mutex{}

	go scs.Subscribe(ctx, func(e events.Event) {
		switch e.(type) {
		case *storesecret.EventNewSecret:
			event, _ := e.(*storesecret.EventNewSecret)

			secret, err := scs.GetDeviceSecret(event.SenderDevicePubKey)
			if err != nil {
				panic(err)
			}

			memberEntry, err := ms.GetEntryByDevice(event.SenderDevicePubKey)
			if err != nil {
				panic(err)
			}

			senderDevicePubKeyBytes, err := event.SenderDevicePubKey.Raw()
			if err != nil {
				panic(err)
			}
			senderMemberPubKeyBytes, err := memberEntry.Member.Raw()
			if err != nil {
				panic(err)
			}
			fmt.Println("")
			fmt.Println("Secret received from: {")
			fmt.Println("\tMember:", base64.StdEncoding.EncodeToString(senderMemberPubKeyBytes), isMemberMineOrGroup(memberEntry.Member, groupContext))
			fmt.Println("\tDevice:", base64.StdEncoding.EncodeToString(senderDevicePubKeyBytes), isDeviceMine(event.SenderDevicePubKey, groupContext))
			fmt.Println("\tDerivation state:", base64.StdEncoding.EncodeToString(secret.DerivationState))
			fmt.Println("\tCounter:", secret.Counter)
			fmt.Println("}")

			sendSecretToMember(ctx, memberEntry.Member, groupContext, true)

			// Debounces listing members / issuing new invitation
			go func() {
				if debounce.TryLock() {
					time.Sleep(500 * time.Millisecond)
					listMembers(groupContext)
					issueNewInvitation(groupContext.GetMemberPrivKey(), groupContext.GetGroup())
					debounce.Unlock()
				}
			}()
		}
	})

	fmt.Println("")
	if !create {
		fmt.Println("Waiting for store replication")

		replicated := false
		waitCtx, cancel := context.WithTimeout(ctx, 10*time.Second)

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

	inviterPubKey, err := crypto.UnmarshalEd25519PublicKey(invitation.InviterMemberPubKey)
	if err != nil {
		panic(err)
	}

	fmt.Println("Redeeming invitation issued by:", base64.StdEncoding.EncodeToString(invitation.InviterMemberPubKey), isMemberMineOrGroup(inviterPubKey, groupContext))

	_, err = ms.RedeemInvitation(ctx, invitation)
	if err != nil {
		panic(err)
	}

	fmt.Println("Sending secret to members already in the group")

	members, err := ms.ListMembers()
	if err != nil {
		panic(err)
	}

	for _, member := range members {
		sendSecretToMember(ctx, member, groupContext, false)
	}

	if create {
		issueNewInvitation(groupContext.GetMemberPrivKey(), groupContext.GetGroup())
	}

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
