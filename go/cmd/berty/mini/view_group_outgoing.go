package mini

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"strings"
	"time"

	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"github.com/gogo/protobuf/proto"
	"github.com/ipfs/go-cid"
	qrterminal "github.com/mdp/qrterminal/v3"
	"github.com/pkg/errors"
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
		// {
		// 	title: "contact received",
		// 	help:  "Fakes an incoming contact request, a shareable contact must be supplied",
		// 	cmd:   contactReceivedCommand,
		// },
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
			title: "debug groups",
			help:  "List groups for current account",
			cmd:   debugListGroupsCommand,
		},
		{
			title: "debug store",
			help:  "Inspect a group store",
			cmd:   debugInspectStoreCommand,
		},
		{
			title: "/",
			help:  "",
			cmd:   newSlashMessageCommand,
		},
	}
}

func debugInspectStoreCommand(ctx context.Context, v *groupView, cmd string) error {
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	args := strings.Split(cmd, " ")
	if len(args) != 2 {
		return fmt.Errorf("invalid args, expected: group_pk {message,metadata}")
	}

	groupPK, err := base64.StdEncoding.DecodeString(args[0])
	if err != nil {
		return err
	}

	var logType bertytypes.DebugInspectGroupLogType

	switch args[1] {
	case "message":
		logType = bertytypes.DebugInspectGroupLogTypeMessage
	case "metadata":
		logType = bertytypes.DebugInspectGroupLogTypeMetadata
	default:
		return fmt.Errorf("invalid args, expected: group_pk {message,metadata}")
	}

	sub, err := v.v.client.DebugInspectGroupStore(ctx, &bertytypes.DebugInspectGroupStore_Request{
		GroupPK: groupPK,
		LogType: logType,
	})
	if err != nil {
		return err
	}

	for {
		e, err := sub.Recv()
		if err == io.EOF {
			v.v.accountGroupView.syncMessages <- &historyMessage{
				messageType: 0,
				payload:     []byte(fmt.Sprintf("listed events for group %s and store %s, most recent first", args[0], args[1])),
			}

			return nil
		} else if err != nil {
			return err
		}

		v.v.accountGroupView.syncMessages <- &historyMessage{
			messageType: 0,
			payload:     formatDebugInspectGroupStoreReply(e, logType),
		}
	}
}

func formatDebugInspectGroupStoreReply(rep *bertytypes.DebugInspectGroupStore_Reply, storeType bertytypes.DebugInspectGroupLogType) []byte {
	data := []string(nil)

	if rep.CID != nil {
		c, err := cid.Parse(rep.CID)
		if err == nil {
			data = append(data, fmt.Sprintf("cid: %s", c.String()))
		}
	}

	if len(rep.ParentCIDs) != 0 {
		parents := make([]string, len(rep.ParentCIDs))
		for i, p := range rep.ParentCIDs {
			c, err := cid.Parse(p)
			if err == nil {
				parents[i] = c.String()
			}
		}

		data = append(data, fmt.Sprintf("parents: %s", strings.Join(parents, "-")))
	}

	if rep.MetadataEventType != 0 {
		data = append(data, fmt.Sprintf("evt type: %s", rep.MetadataEventType.String()))
	}

	if len(rep.DevicePK) != 0 {
		data = append(data, fmt.Sprintf("device: %s", base64.StdEncoding.EncodeToString(rep.DevicePK)))
	}

	if storeType == bertytypes.DebugInspectGroupLogTypeMessage && len(rep.Payload) > 0 {
		data = append(data, fmt.Sprintf("payload: %s", string(rep.Payload)))
	}

	return []byte(strings.Join(data, ", "))
}

func formatDebugListGroupsReply(rep *bertytypes.DebugListGroups_Reply) []byte {
	if rep.GroupType == bertytypes.GroupTypeContact {
		return []byte(fmt.Sprintf("%s: %s (contact: %s)", rep.GroupType.String(), base64.StdEncoding.EncodeToString(rep.GroupPK), base64.StdEncoding.EncodeToString(rep.ContactPK)))
	}

	return []byte(fmt.Sprintf("%s: %s", rep.GroupType.String(), base64.StdEncoding.EncodeToString(rep.GroupPK)))
}

func debugListGroupsCommand(ctx context.Context, v *groupView, cmd string) error {
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	sub, err := v.v.client.DebugListGroups(ctx, &bertytypes.DebugListGroups_Request{})
	if err != nil {
		return err
	}

	for {
		e, err := sub.Recv()
		if err == io.EOF {
			return nil
		} else if err != nil {
			return err
		}

		if e == nil {
			continue
		}

		v.v.accountGroupView.syncMessages <- &historyMessage{
			messageType: 0,
			payload:     formatDebugListGroupsReply(e),
		}
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
	if _, err := v.v.client.ContactAliasKeySend(ctx, &bertytypes.ContactAliasKeySend_Request{
		GroupPK: v.g.PublicKey,
	}); err != nil {
		return err
	}

	return nil
}

func groupInviteCommand(ctx context.Context, v *groupView, _ string) error {
	if v.g.GroupType != bertytypes.GroupTypeMultiMember {
		return errors.New("unsupported group type")
	}

	protoBytes, err := v.g.Marshal()
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

// func contactReceivedCommand(ctx context.Context, v *groupView, cmd string) error {
// 	contactBytes, err := base64.StdEncoding.DecodeString(cmd)
// 	if err != nil {
// 		return err
// 	}
//
// 	contact := &bertytypes.ShareableContact{}
// 	if err := contact.Unmarshal(contactBytes); err != nil {
// 		return err
// 	}
//
// 	_, err = crypto.UnmarshalEd25519PublicKey(contact.PK)
// 	if err != nil {
// 		return err
// 	}
//
// 	if _, err = v.cg.MetadataStore().ContactRequestIncomingReceived(ctx, contact); err != nil {
// 		return err
// 	}
//
// 	return nil
// }

func contactAcceptCommand(ctx context.Context, v *groupView, cmd string) error {
	pkBytes, err := base64.StdEncoding.DecodeString(cmd)
	if err != nil {
		return err
	}

	if _, err = v.v.client.ContactRequestAccept(ctx, &bertytypes.ContactRequestAccept_Request{
		ContactPK: pkBytes,
	}); err != nil {
		return err
	}

	return nil
}

func contactDiscardCommand(ctx context.Context, v *groupView, cmd string) error {
	pkBytes, err := base64.StdEncoding.DecodeString(cmd)
	if err != nil {
		return err
	}

	if _, err = v.v.client.ContactRequestDiscard(ctx, &bertytypes.ContactRequestDiscard_Request{
		ContactPK: pkBytes,
	}); err != nil {
		return err
	}

	return nil
}

func groupJoinCommand(ctx context.Context, v *groupView, cmd string) error {
	g, err := openGroupFromString(cmd)
	if err != nil {
		return fmt.Errorf("err: can't join group %w", err)
	}

	_, err = v.v.client.MultiMemberGroupJoin(ctx, &bertytypes.MultiMemberGroupJoin_Request{
		Group: g,
	})

	return err
}

func groupNewCommand(ctx context.Context, v *groupView, _ string) error {
	_, err := v.v.client.MultiMemberGroupCreate(ctx, &bertytypes.MultiMemberGroupCreate_Request{})

	return err
}

func contactRequestCommand(ctx context.Context, v *groupView, cmd string) error {
	res, err := v.v.messenger.ParseDeepLink(ctx, &bertymessenger.ParseDeepLink_Request{
		Link: cmd,
	})

	if err != nil {
		return err
	}

	contact := &bertytypes.ShareableContact{
		PK:                   res.BertyID.AccountPK,
		PublicRendezvousSeed: res.BertyID.PublicRendezvousSeed,
		Metadata:             []byte(res.BertyID.DisplayName),
	}

	_, err = v.v.client.ContactRequestSend(ctx, &bertytypes.ContactRequestSend_Request{
		Contact: contact,
	})

	return err
}

func payloadUserMessageFormatter(msg string) ([]byte, error) {
	return json.Marshal(&bertymessenger.PayloadUserMessage{
		Type:        bertymessenger.AppMessageType_UserMessage,
		Body:        msg,
		Attachments: nil,
		SentDate:    time.Now().UnixNano() / 1000000,
	})
}

type AppMessageTyped interface {
	proto.Message
	GetType() bertymessenger.AppMessageType
}

func payloadParser(data []byte) (AppMessageTyped, error) {
	res := &bertymessenger.AppMessageTyped{}

	err := json.Unmarshal(data, res)
	if err != nil {
		return nil, err
	}

	typesMapper := map[bertymessenger.AppMessageType]AppMessageTyped{
		bertymessenger.AppMessageType_UserMessage:     &bertymessenger.PayloadUserMessage{},
		bertymessenger.AppMessageType_UserReaction:    &bertymessenger.PayloadUserReaction{},
		bertymessenger.AppMessageType_GroupInvitation: &bertymessenger.PayloadGroupInvitation{},
		bertymessenger.AppMessageType_SetGroupName:    &bertymessenger.PayloadSetGroupName{},
		bertymessenger.AppMessageType_Acknowledge:     &bertymessenger.PayloadAcknowledge{},
	}

	message, ok := typesMapper[res.Type]
	if !ok {
		return nil, fmt.Errorf("unknown payload type")
	}

	if err := json.Unmarshal(data, message); err != nil {
		return nil, err
	}

	return message, nil
}

func newMessageCommand(ctx context.Context, v *groupView, cmd string) error {
	if cmd == "" {
		return nil
	}

	payload, err := payloadUserMessageFormatter(cmd)
	if err != nil {
		return err
	}

	_, err = v.v.client.AppMessageSend(ctx, &bertytypes.AppMessageSend_Request{
		GroupPK: v.g.PublicKey,
		Payload: payload,
	})

	return err
}

func contactShareCommand(ctx context.Context, v *groupView, cmd string) error {
	res, err := v.v.messenger.InstanceShareableBertyID(ctx, &bertymessenger.InstanceShareableBertyID_Request{})
	if err != nil {
		return err
	}

	if cmd == "qr" || cmd == "qrcode" {
		qrOut := new(bytes.Buffer)
		qrterminal.GenerateWithConfig(res.DeepLink, qrterminal.Config{
			Writer:    qrOut,
			Level:     qrterminal.L,
			BlackChar: qrterminal.BLACK_BLACK + qrterminal.BLACK_BLACK,
			WhiteChar: qrterminal.WHITE_WHITE + qrterminal.WHITE_WHITE,
			QuietZone: qrterminal.QUIET_ZONE,
		})

		lines := strings.Split(qrOut.String(), "\n")

		for _, l := range lines {
			v.syncMessages <- &historyMessage{
				messageType: messageTypeMeta,
				payload:     []byte(l),
			}
		}
	} else {
		v.syncMessages <- &historyMessage{
			messageType: messageTypeMeta,
			payload:     []byte(res.DeepLink),
		}
	}

	return nil
}

func contactRequestsOnCommand(ctx context.Context, v *groupView, cmd string) error {
	_, err := v.v.client.ContactRequestEnable(ctx, &bertytypes.ContactRequestEnable_Request{})

	return err
}

func contactRequestsOffCommand(ctx context.Context, v *groupView, cmd string) error {
	_, err := v.v.client.ContactRequestDisable(ctx, &bertytypes.ContactRequestDisable_Request{})

	return err
}

func contactRequestsReferenceResetCommand(ctx context.Context, v *groupView, cmd string) error {
	_, err := v.v.client.ContactRequestResetReference(ctx, &bertytypes.ContactRequestResetReference_Request{})

	return err
}
