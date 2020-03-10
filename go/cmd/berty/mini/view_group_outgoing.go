package mini

import (
	"context"
	"encoding/base64"
	"fmt"
	"strings"

	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/pkg/errors"

	"berty.tech/berty/go/pkg/bertyprotocol"
)

type command struct {
	title string
	help  string
	cmd   func(ctx context.Context, v *groupView, cmd string) error
}

func commandList() []*command {
	return []*command{
		{
			title: "help",
			help:  "Displays this message",
			cmd:   cmdHelp,
		},
		{
			title: "group new",
			help:  "Creates a new group",
			cmd:   groupNewCommand,
		},
		{
			title: "group invite",
			help:  "Displays a invite for the current group",
			cmd:   groupInviteCommand,
		},
		{
			title: "group join",
			help:  "Creates joins an existing group, a group invite must be supplied",
			cmd:   groupJoinCommand,
		},
		{
			title: "contact received",
			help:  "Fakes an incoming contact request, a shareable contact must be supplied",
			cmd:   contactReceivedCommand,
		},
		{
			title: "contact accept",
			help:  "Accepts a contact requests, a contact id must be supplied",
			cmd:   contactAcceptCommand,
		},
		{
			title: "contact discard",
			help:  "Ignores a contact requests, a contact id must be supplied",
			cmd:   contactDiscardCommand,
		},
		{
			title: "contact share",
			help:  "Output a shareable contact",
			cmd:   contactShareCommand,
		},
		{
			title: "contact request",
			help:  "Sends a contact request, a shareable contact must be supplied",
			cmd:   contactRequestCommand,
		},
		{
			title: "alias send",
			help:  "Sends own alias key to a contact",
			cmd:   aliasSendCommand,
		},
		// {
		// 	title: "alias prove",
		// 	help:  "Sends an alias proof to a group",
		// 	cmd:   aliasProveCommand,
		// },
		{
			title: "ref reset",
			help:  "Resets the contact request seed",
			cmd:   contactRequestsReferenceResetCommand,
		},
		{
			title: "ref off",
			help:  "Disables incoming contact request",
			cmd:   contactRequestsOffCommand,
		},
		{
			title: "ref on",
			help:  "Enable incoming contact requests",
			cmd:   contactRequestsOnCommand,
		},
		{
			title: "/",
			help:  "",
			cmd:   newSlashMessageCommand,
		},
	}
}

// func aliasProveCommand(ctx context.Context, v *groupView, cmd string) error {
// 	if _, err := v.cg.MetadataStore().SendAliasProof(ctx); err != nil {
// 		return err
// 	}
//
// 	return nil
// }

func aliasSendCommand(ctx context.Context, v *groupView, cmd string) error {
	if _, err := v.cg.MetadataStore().ContactSendAliasKey(ctx); err != nil {
		return err
	}

	return nil
}

func groupInviteCommand(ctx context.Context, v *groupView, _ string) error {
	if v.cg.Group().GroupType != bertyprotocol.GroupTypeMultiMember {
		return errors.New("unsupported group type")
	}

	protoBytes, err := v.cg.Group().Marshal()
	if err != nil {
		return err
	}

	v.syncMessages <- &historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(base64.StdEncoding.EncodeToString(protoBytes)),
	}

	return nil
}

func cmdHelp(ctx context.Context, v *groupView, cmd string) error {
	longestCmd := 0

	for _, cmd := range commandList() {
		if cmd.help == "" {
			continue
		}

		if len(cmd.title) > longestCmd {
			longestCmd = len(cmd.title)
		}
	}

	for _, cmd := range commandList() {
		if cmd.help == "" {
			continue
		}

		padding := longestCmd - len(cmd.title)

		v.syncMessages <- &historyMessage{
			payload: []byte(fmt.Sprintf("/%s%s  %s", cmd.title, strings.Repeat(" ", padding), cmd.help)),
		}
	}

	return nil
}

func newSlashMessageCommand(ctx context.Context, v *groupView, cmd string) error {
	return newMessageCommand(ctx, v, strings.TrimPrefix(cmd, "/"))
}

func contactReceivedCommand(ctx context.Context, v *groupView, cmd string) error {
	contactBytes, err := base64.StdEncoding.DecodeString(cmd)
	if err != nil {
		return err
	}

	contact := &bertyprotocol.ShareableContact{}
	if err := contact.Unmarshal(contactBytes); err != nil {
		return err
	}

	_, err = crypto.UnmarshalEd25519PublicKey(contact.PK)
	if err != nil {
		return err
	}

	if _, err = v.cg.MetadataStore().ContactRequestIncomingReceived(ctx, contact); err != nil {
		return err
	}

	return nil
}

func contactAcceptCommand(ctx context.Context, v *groupView, cmd string) error {
	pkBytes, err := base64.StdEncoding.DecodeString(cmd)
	if err != nil {
		return err
	}

	pk, err := crypto.UnmarshalEd25519PublicKey(pkBytes)
	if err != nil {
		return err
	}

	if _, err = v.cg.MetadataStore().ContactRequestIncomingAccept(ctx, pk); err != nil {
		return err
	}

	return nil
}

func contactDiscardCommand(ctx context.Context, v *groupView, cmd string) error {
	pkBytes, err := base64.StdEncoding.DecodeString(cmd)
	if err != nil {
		return err
	}

	pk, err := crypto.UnmarshalEd25519PublicKey(pkBytes)
	if err != nil {
		return err
	}

	if _, err = v.cg.MetadataStore().ContactRequestIncomingDiscard(ctx, pk); err != nil {
		return err
	}

	return nil
}

func groupJoinCommand(ctx context.Context, v *groupView, cmd string) error {
	g, err := openGroupFromString(cmd)
	if err != nil {
		return errors.Wrap(err, "Can't join group")
	}

	_, err = v.cg.MetadataStore().GroupJoin(ctx, g)

	return err
}

func groupNewCommand(ctx context.Context, v *groupView, _ string) error {
	g, sk, err := bertyprotocol.NewGroupMultiMember()
	if err != nil {
		return errors.Wrap(err, "Can't create group")
	}

	if _, err = v.cg.MetadataStore().GroupJoin(ctx, g); err != nil {
		return errors.Wrap(err, "Can't create group")
	}

	cg, err := v.v.odb.OpenMultiMemberGroup(ctx, g, nil)
	if err != nil {
		return errors.Wrap(err, "Can't open group")
	}

	if _, err = cg.MetadataStore().ClaimGroupOwnership(ctx, sk); err != nil {
		return errors.Wrap(err, "Can't claim group ownership")
	}

	return nil
}

func contactRequestCommand(ctx context.Context, v *groupView, cmd string) error {
	contactBytes, err := base64.StdEncoding.DecodeString(cmd)
	if err != nil {
		return err
	}

	contact := &bertyprotocol.ShareableContact{}
	if err := contact.Unmarshal(contactBytes); err != nil {
		return err
	}

	pk, err := crypto.UnmarshalEd25519PublicKey(contact.PK)
	if err != nil {
		return err
	}

	if _, err = v.cg.MetadataStore().ContactRequestOutgoingEnqueue(ctx, contact); err != nil {
		return err
	}

	// TODO: remove, and replace with real handshake + request, this used to fake contact requests for now
	if _, err = v.cg.MetadataStore().ContactRequestOutgoingSent(ctx, pk); err != nil {
		return err
	}

	return nil
}

func newMessageCommand(ctx context.Context, v *groupView, cmd string) error {
	if cmd == "" {
		return nil
	}

	if _, err := v.cg.MessageStore().AddMessage(ctx, []byte(cmd)); err != nil {
		return errors.Wrap(err, "Can't send message")
	}

	return nil
}

func contactShareCommand(ctx context.Context, v *groupView, cmd string) error {
	enabled, shareableContact := v.cg.MetadataStore().GetIncomingContactRequestsStatus()
	if enabled {
		if shareableContact == nil {
			v.syncMessages <- &historyMessage{
				messageType: messageTypeMeta,
				payload:     []byte(fmt.Sprintf("contact request ref seed has not been generated")),
			}

		} else {
			contactBytes, err := shareableContact.Marshal()
			if err != nil {
				return err
			}

			v.syncMessages <- &historyMessage{
				messageType: messageTypeMeta,
				payload:     []byte(fmt.Sprintf("shareable contact: %s", base64.StdEncoding.EncodeToString(contactBytes))),
			}
		}
	} else {
		v.syncMessages <- &historyMessage{
			messageType: messageTypeError,
			payload:     []byte(fmt.Sprintf("contact request ref is disabled")),
		}
	}

	return nil
}

func contactRequestsOnCommand(ctx context.Context, v *groupView, cmd string) error {
	if _, err := v.cg.MetadataStore().ContactRequestEnable(ctx); err != nil {
		return err
	}

	return nil
}

func contactRequestsOffCommand(ctx context.Context, v *groupView, cmd string) error {
	if _, err := v.cg.MetadataStore().ContactRequestDisable(ctx); err != nil {
		return err
	}

	return nil
}

func contactRequestsReferenceResetCommand(ctx context.Context, v *groupView, cmd string) error {
	if _, err := v.cg.MetadataStore().ContactRequestReferenceReset(ctx); err != nil {
		return err
	}

	return nil
}
