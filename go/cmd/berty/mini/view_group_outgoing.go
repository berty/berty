package mini

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"strings"

	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"github.com/gogo/protobuf/proto"
	cid "github.com/ipfs/go-cid"
	qrterminal "github.com/mdp/qrterminal/v3"
)

type command struct {
	title     string
	help      string
	cmd       func(ctx context.Context, v *groupView, cmd string) error
	hideInLog bool
}

func stringAsQR(data string) []string {
	qrOut := new(bytes.Buffer)
	qrterminal.GenerateWithConfig(data, qrterminal.Config{
		Writer:         qrOut,
		Level:          qrterminal.L,
		HalfBlocks:     true,
		BlackChar:      qrterminal.BLACK_BLACK,
		WhiteBlackChar: qrterminal.WHITE_BLACK,
		WhiteChar:      qrterminal.WHITE_WHITE,
		BlackWhiteChar: qrterminal.BLACK_WHITE,
		QuietZone:      qrterminal.QUIET_ZONE,
	})

	return strings.Split(qrOut.String(), "\n")
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
			title: "group share qr",
			help:  "Displays an invite QR Code for the current group",
			cmd:   groupInviteCommand(renderQR),
		},
		{
			title: "group share",
			help:  "Displays a invite Link for the current group",
			cmd:   groupInviteCommand(renderText),
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
			title: "contact accept all",
			help:  "Accepts all pending contact requests",
			cmd:   contactAcceptAllCommand,
		},
		{
			title: "contact accept",
			help:  "Accepts a contact requests, a contact id must be supplied",
			cmd:   contactAcceptCommand,
		},
		{
			title: "contact discard all",
			help:  "Ignores all pending contact requests",
			cmd:   contactDiscardAllCommand,
		},
		{
			title: "contact discard",
			help:  "Ignores a contact requests, a contact id must be supplied",
			cmd:   contactDiscardCommand,
		},
		{
			title: "contact share qr",
			help:  "Output a shareable contact QR Code",
			cmd:   contactShareCommand(renderQR),
		},
		{
			title: "contact share",
			help:  "Output a shareable contact URL",
			cmd:   contactShareCommand(renderText),
		},
		{
			title: "contact request",
			help:  "Sends a contact request, a shareable contact must be supplied",
			cmd:   contactRequestCommand,
		},
		{
			title: "name",
			help:  "Changes your display name used in contact request URLs and outgoing contact requests",
			cmd:   setDisplayName,
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
			title: "debug ipfs",
			help:  "Shows IPFS debug information",
			cmd:   debugIPFSCommand,
		},
		{
			title: "debug system",
			help:  "Shows system debug information",
			cmd:   debugSystemCommand,
		},
		{
			title: "debug groups",
			help:  "List groups for current account",
			cmd:   debugListGroupsCommand,
		},
		{
			title: "debug group",
			help:  "Shows group debug information",
			cmd:   debugListGroupCommand,
		},
		{
			title: "debug store",
			help:  "Inspect a group store",
			cmd:   debugInspectStoreCommand,
		},
		{
			title:     "/",
			help:      "",
			cmd:       newSlashMessageCommand,
			hideInLog: true,
		},
	}
}

func setDisplayName(_ context.Context, v *groupView, cmd string) error {
	v.v.lock.Lock()
	v.v.displayName = cmd
	v.v.lock.Unlock()

	v.syncMessages <- &historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("display name changed to \"%s\"", cmd)),
	}

	return nil
}

func debugIPFSCommand(ctx context.Context, v *groupView, _ string) error {
	config, err := v.v.client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
	if err != nil {
		return err
	}

	v.messages.Append(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("peerid: %s", config.PeerID)),
	})

	for i, listener := range config.Listeners {
		msg := fmt.Sprintf("listener [#%d]: %s", i, listener)
		v.messages.Append(&historyMessage{
			messageType: messageTypeMeta,
			payload:     []byte(msg),
		})
	}

	return nil
}

func debugSystemCommand(ctx context.Context, v *groupView, _ string) error {
	config, err := v.v.messenger.SystemInfo(ctx, &bertymessenger.SystemInfo_Request{})
	if err != nil {
		return err
	}

	for k, val := range map[string]interface{}{
		"StartedAt      ": config.StartedAt,
		"NumCPU         ": config.NumCPU,
		"GoVersion      ": config.GoVersion,
		"NumGoroutine   ": config.NumGoroutine,
		"OperatingSystem": config.OperatingSystem,
		"HostName       ": config.HostName,
		"Arch           ": config.Arch,
		"Version        ": config.Version,
		"VcsRef         ": config.VcsRef,
		"BuildTime      ": config.BuildTime,
	} {
		v.messages.Append(&historyMessage{
			messageType: messageTypeMeta,
			payload:     []byte(fmt.Sprintf("%s: %v", k, val)),
		})
	}

	return nil
}

func contactDiscardAllCommand(ctx context.Context, v *groupView, cmd string) error {
	v.v.lock.Lock()
	toAdd := [][]byte(nil)

	for id, contactState := range v.v.contactStates {
		if contactState != bertytypes.ContactStateReceived {
			continue
		}

		toAdd = append(toAdd, []byte(id))
	}
	v.v.lock.Unlock()

	for _, id := range toAdd {
		if err := contactDiscardCommand(ctx, v, base64.StdEncoding.EncodeToString(id)); err != nil {
			return err
		}
	}

	return nil
}

func contactAcceptAllCommand(ctx context.Context, v *groupView, cmd string) error {
	v.v.lock.Lock()
	toAdd := [][]byte(nil)

	for id, contactState := range v.v.contactStates {
		if contactState != bertytypes.ContactStateReceived {
			continue
		}

		toAdd = append(toAdd, []byte(id))
	}
	v.v.lock.Unlock()

	for _, id := range toAdd {
		if err := contactAcceptCommand(ctx, v, base64.StdEncoding.EncodeToString(id)); err != nil {
			return err
		}
	}

	return nil
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
		return fmt.Errorf("invalid args, expected: group_pk {message,metadata} (%w)", err)
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

func debugListGroupCommand(ctx context.Context, v *groupView, cmd string) error {
	v.messages.Append(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("group pk:     %s", base64.StdEncoding.EncodeToString(v.g.PublicKey))),
	})

	v.messages.Append(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("group secret: %s", base64.StdEncoding.EncodeToString(v.g.Secret))),
	})

	v.messages.Append(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("group type:   %s", v.g.GroupType.String())),
	})

	v.messages.Append(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("member pk:    %s", base64.StdEncoding.EncodeToString(v.memberPK))),
	})

	v.messages.Append(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("device pk:    %s", base64.StdEncoding.EncodeToString(v.devicePK))),
	})

	if v.g.GroupType == bertytypes.GroupTypeMultiMember {
		v.muAggregates.Lock()

		v.messages.Append(&historyMessage{
			messageType: messageTypeMeta,
			payload:     []byte("devices:"),
		})

		for _, device := range v.devices {
			v.messages.Append(&historyMessage{
				messageType: messageTypeMeta,
				payload:     []byte(fmt.Sprintf(" - member: %s - device: %s", base64.StdEncoding.EncodeToString(device.MemberPK), base64.StdEncoding.EncodeToString(device.DevicePK))),
			})
		}

		v.messages.Append(&historyMessage{
			messageType: messageTypeMeta,
			payload:     []byte("secrets:"),
		})

		for _, secret := range v.secrets {
			v.messages.Append(&historyMessage{
				messageType: messageTypeMeta,
				payload:     []byte(fmt.Sprintf(" - secret: %s for %s", base64.StdEncoding.EncodeToString(secret.DevicePK), base64.StdEncoding.EncodeToString(secret.DestMemberPK))),
			})
		}

		v.muAggregates.Unlock()
	}

	groupDebug, err := v.v.client.DebugGroup(ctx, &bertytypes.DebugGroup_Request{
		GroupPK: v.g.PublicKey,
	})

	if err != nil {
		return err
	}

	if len(groupDebug.PeerIDs) > 0 {
		v.messages.Append(&historyMessage{
			messageType: messageTypeMeta,
			payload:     []byte("Peers connected on topic:"),
		})

		for _, p := range groupDebug.PeerIDs {
			v.messages.Append(&historyMessage{
				messageType: messageTypeMeta,
				payload:     []byte(fmt.Sprintf(" - %s", p)),
			})
		}
	} else {
		v.messages.Append(&historyMessage{
			messageType: messageTypeMeta,
			payload:     []byte("No peers connected on topic found"),
		})
	}

	return nil
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

func groupInviteCommand(renderFunc func(*groupView, string)) func(ctx context.Context, v *groupView, cmd string) error {
	return func(ctx context.Context, v *groupView, cmd string) error {
		res, err := v.v.messenger.ShareableBertyGroup(ctx, &bertymessenger.ShareableBertyGroup_Request{
			GroupPK:   v.g.PublicKey,
			GroupName: "some group",
		})

		if err != nil {
			return err
		}

		renderFunc(v, res.DeepLink)

		return nil
	}
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
	v.v.lock.Lock()
	displayName := v.v.displayName
	v.v.lock.Unlock()

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
		Contact:     contact,
		OwnMetadata: []byte(displayName),
	})

	return err
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

	_, err := v.v.messenger.SendMessage(ctx, &bertymessenger.SendMessage_Request{
		GroupPK: v.g.PublicKey,
		Message: cmd,
	})

	return err
}

func contactShareCommand(displayFunc func(*groupView, string)) func(ctx context.Context, v *groupView, cmd string) error {
	return func(ctx context.Context, v *groupView, cmd string) error {
		v.v.lock.Lock()
		displayName := v.v.displayName
		v.v.lock.Unlock()

		res, err := v.v.messenger.InstanceShareableBertyID(ctx, &bertymessenger.InstanceShareableBertyID_Request{
			DisplayName: displayName,
		})
		if err != nil {
			return err
		}

		displayFunc(v, res.DeepLink)

		return nil
	}
}

func renderQR(v *groupView, url string) {
	for _, l := range stringAsQR(url) {
		v.syncMessages <- &historyMessage{
			messageType: messageTypeMeta,
			payload:     []byte(l),
		}
	}
}

func renderText(v *groupView, url string) {
	v.syncMessages <- &historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(url),
	}
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
