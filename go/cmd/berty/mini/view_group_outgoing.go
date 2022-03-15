package mini

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	"github.com/atotto/clipboard"
	// nolint:staticcheck // cannot use the new protobuf API while keeping gogoproto
	"github.com/golang/protobuf/proto"
	"github.com/ipfs/go-cid"
	"github.com/mdp/qrterminal/v3"
	"moul.io/godev"

	"berty.tech/berty/v2/go/internal/bertylinks"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
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
			title: "debug push",
			help:  "Resend the last message via push",
			cmd:   debugPushCommand,
		},
		{
			title: "services list",
			help:  "Lists registered services",
			cmd:   servicesList,
		},
		{
			title: "services auth init",
			help:  "Inits authentication with a service provider",
			cmd:   authInit,
		},
		{
			title: "services auth complete",
			help:  "Completes authentication with a service provider",
			cmd:   authComplete,
		},
		{
			title: "replicate group",
			help:  "Registers current group for replication using specified token",
			cmd:   replGroup,
		},
		{
			title: "reply-options",
			help:  `Sends a list of quick responses from JSON: [{"display": "Text offering a *yes* option", "payload": "yes"}]`,
			cmd:   sendReplyOptions,
		},
		{
			title: "export",
			help:  `Saves an export of the current instance to the specified path`,
			cmd:   exportAccount,
		},
		{
			title:     "/",
			help:      "",
			cmd:       newSlashMessageCommand,
			hideInLog: true,
		},
	}
}

func sendReplyOptions(ctx context.Context, v *groupView, cmd string) error {
	options := []*messengertypes.ReplyOption{}
	if err := json.Unmarshal([]byte(cmd), &options); err != nil {
		return err
	}

	_, err := v.v.messenger.SendReplyOptions(ctx, &messengertypes.SendReplyOptions_Request{
		GroupPK: v.g.PublicKey,
		Options: &messengertypes.AppMessage_ReplyOptions{
			Options: options,
		},
	})

	return err
}

func exportAccount(ctx context.Context, v *groupView, path string) error {
	path = strings.TrimSpace(path)

	f, err := os.Create(path)
	if err != nil {
		return err
	}

	defer func() { _ = f.Close() }()

	cl, err := v.v.messenger.InstanceExportData(ctx, &messengertypes.InstanceExportData_Request{})
	if err != nil {
		return err
	}

	for {
		chunk, err := cl.Recv()
		if err == io.EOF {
			v.messages.Append(&historyMessage{
				payload: []byte("Account exported"),
			})

			return nil
		} else if err != nil {
			return err
		}

		if _, err := f.Write(chunk.ExportedData); err != nil {
			return err
		}
	}
}

func authInit(ctx context.Context, v *groupView, cmd string) error {
	rep, err := v.v.protocol.AuthServiceInitFlow(ctx, &protocoltypes.AuthServiceInitFlow_Request{
		AuthURL: strings.TrimSpace(cmd),
	})
	if err != nil {
		return err
	}

	v.messages.Append(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("Auth URL: %s", rep.URL)),
	})

	copyToClipboard(v, rep.URL)

	if !rep.SecureURL {
		v.messages.Append(&historyMessage{
			messageType: messageTypeMeta,
			payload:     []byte("The supplied URL will not use a secure transport"),
		})
	}

	v.messages.Append(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("To complete authentication type `/services auth complete {redirect_url}`"),
	})

	return err
}

func authComplete(ctx context.Context, v *groupView, cmd string) error {
	_, err := v.v.protocol.AuthServiceCompleteFlow(ctx, &protocoltypes.AuthServiceCompleteFlow_Request{
		CallbackURL: strings.TrimSpace(cmd),
	})

	return err
}

func servicesList(ctx context.Context, v *groupView, _ string) error {
	cl, err := v.v.protocol.ServicesTokenList(ctx, &protocoltypes.ServicesTokenList_Request{})
	if err != nil {
		return err
	}

	for {
		item, err := cl.Recv()
		if err != nil {
			if err != io.EOF {
				return err
			}
			break
		}

		for _, service := range item.Service.SupportedServices {
			v.messages.Append(&historyMessage{
				messageType: messageTypeMeta,
				payload:     []byte(fmt.Sprintf("token: %s - service: %s, %s", item.TokenID, service.ServiceType, service.ServiceEndpoint)),
			})
		}
	}

	return nil
}

func replGroup(ctx context.Context, v *groupView, cmd string) error {
	if _, err := v.v.messenger.ReplicationServiceRegisterGroup(ctx, &messengertypes.ReplicationServiceRegisterGroup_Request{
		TokenID:               strings.TrimSpace(cmd),
		ConversationPublicKey: base64.RawURLEncoding.EncodeToString(v.g.PublicKey),
	}); err != nil {
		return err
	}

	return nil
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
	config, err := v.v.protocol.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
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
	info, err := v.v.messenger.SystemInfo(ctx, &messengertypes.SystemInfo_Request{})
	if err != nil {
		return err
	}

	for k, val := range map[string]interface{}{
		"Protocol  Process  ": godev.JSONPB(info.Protocol.Process),
		"Protocol  P2P      ": godev.JSONPB(info.Protocol.P2P),
		"Protocol  ODB      ": godev.JSONPB(info.Protocol.OrbitDB),
		"Messenger Process  ": godev.JSONPB(info.Messenger.Process),
		"Messenger DB       ": godev.JSONPB(info.Messenger.DB),
	} {
		v.messages.Append(&historyMessage{
			messageType: messageTypeMeta,
			payload:     []byte(fmt.Sprintf("%s | %v", k, val)),
		})
	}

	return nil
}

func contactDiscardAllCommand(ctx context.Context, v *groupView, cmd string) error {
	v.v.lock.Lock()
	toAdd := [][]byte(nil)

	for id, contactState := range v.v.contactStates {
		if contactState != protocoltypes.ContactStateReceived {
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
		if contactState != protocoltypes.ContactStateReceived {
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

	var logType protocoltypes.DebugInspectGroupLogType

	switch args[1] {
	case "message":
		logType = protocoltypes.DebugInspectGroupLogTypeMessage
	case "metadata":
		logType = protocoltypes.DebugInspectGroupLogTypeMetadata
	default:
		return fmt.Errorf("invalid args, expected: group_pk {message,metadata}")
	}

	sub, err := v.v.protocol.DebugInspectGroupStore(ctx, &protocoltypes.DebugInspectGroupStore_Request{
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

func debugPushCommand(ctx context.Context, v *groupView, _ string) error {
	if v.lastSentCID == "" {
		return fmt.Errorf("last message is unknown")
	}

	c, err := cid.Parse(v.lastSentCID)
	if err != nil {
		return err
	}

	res, err := v.v.protocol.PushSend(ctx, &protocoltypes.PushSend_Request{
		CID:            c.Bytes(),
		GroupPublicKey: v.g.PublicKey,
	})
	if err != nil {
		return err
	}

	if len(res.GroupMembers) == 0 {
		return fmt.Errorf("no push targets found")
	}

	targets := []string(nil)
	for _, m := range res.GroupMembers {
		for _, d := range m.DevicePKs {
			targets = append(targets, pkAsShortID(d))
		}
	}

	v.syncMessages <- &historyMessage{
		receivedAt: time.Now(),
		payload:    []byte(fmt.Sprintf("push sent to %s", strings.Join(targets, ", "))),
	}

	return nil
}

func formatDebugInspectGroupStoreReply(rep *protocoltypes.DebugInspectGroupStore_Reply, storeType protocoltypes.DebugInspectGroupLogType) []byte {
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

	if storeType == protocoltypes.DebugInspectGroupLogTypeMessage && len(rep.Payload) > 0 {
		data = append(data, fmt.Sprintf("payload: %s", string(rep.Payload)))
	}

	return []byte(strings.Join(data, ", "))
}

func formatDebugListGroupsReply(rep *protocoltypes.DebugListGroups_Reply) []byte {
	if rep.GroupType == protocoltypes.GroupTypeContact {
		return []byte(fmt.Sprintf("%s: %s (contact: %s)", rep.GroupType.String(), base64.StdEncoding.EncodeToString(rep.GroupPK), base64.StdEncoding.EncodeToString(rep.ContactPK)))
	}

	return []byte(fmt.Sprintf("%s: %s", rep.GroupType.String(), base64.StdEncoding.EncodeToString(rep.GroupPK)))
}

func debugListGroupsCommand(ctx context.Context, v *groupView, cmd string) error {
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	sub, err := v.v.protocol.DebugListGroups(ctx, &protocoltypes.DebugListGroups_Request{})
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

	if v.g.GroupType == protocoltypes.GroupTypeMultiMember {
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

	groupDebug, err := v.v.protocol.DebugGroup(ctx, &protocoltypes.DebugGroup_Request{
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
	if _, err := v.v.protocol.ContactAliasKeySend(ctx, &protocoltypes.ContactAliasKeySend_Request{
		GroupPK: v.g.PublicKey,
	}); err != nil {
		return err
	}

	return nil
}

func groupInviteCommand(renderFunc func(*groupView, string)) func(ctx context.Context, v *groupView, cmd string) error {
	return func(ctx context.Context, v *groupView, cmd string) error {
		res, err := v.v.messenger.ShareableBertyGroup(ctx, &messengertypes.ShareableBertyGroup_Request{
			GroupPK:   v.g.PublicKey,
			GroupName: "some group",
		})
		if err != nil {
			return err
		}

		renderFunc(v, res.WebURL)

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

func contactAcceptCommand(ctx context.Context, v *groupView, cmd string) error {
	pkBytes, err := base64.StdEncoding.DecodeString(cmd)
	if err != nil {
		return err
	}

	if _, err = v.v.protocol.ContactRequestAccept(ctx, &protocoltypes.ContactRequestAccept_Request{
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

	if _, err = v.v.protocol.ContactRequestDiscard(ctx, &protocoltypes.ContactRequestDiscard_Request{
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

	_, err = v.v.protocol.MultiMemberGroupJoin(ctx, &protocoltypes.MultiMemberGroupJoin_Request{
		Group: g,
	})

	return err
}

func groupNewCommand(ctx context.Context, v *groupView, _ string) error {
	_, err := v.v.protocol.MultiMemberGroupCreate(ctx, &protocoltypes.MultiMemberGroupCreate_Request{})

	return err
}

func contactRequestCommand(ctx context.Context, v *groupView, cmd string) error {
	v.v.lock.Lock()
	displayName := v.v.displayName
	v.v.lock.Unlock()

	link, err := bertylinks.UnmarshalLink(cmd, nil) // FIXME: support passing an optional passphrase to decrypt the link
	if err != nil {
		return errcode.ErrInvalidInput.Wrap(err)
	}
	if !link.IsContact() {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("expected a contact URL, got %q instead", link.GetKind()))
	}

	contact := &protocoltypes.ShareableContact{
		PK:                   link.BertyID.AccountPK,
		PublicRendezvousSeed: link.BertyID.PublicRendezvousSeed,
		Metadata:             []byte(link.BertyID.DisplayName),
	}

	_, err = v.v.protocol.ContactRequestSend(ctx, &protocoltypes.ContactRequestSend_Request{
		Contact:     contact,
		OwnMetadata: []byte(displayName),
	})

	return err
}

func newMessageCommand(ctx context.Context, v *groupView, cmd string) error {
	if cmd == "" {
		return nil
	}

	payload, err := proto.Marshal(&messengertypes.AppMessage_UserMessage{
		Body: cmd,
	})
	if err != nil {
		return err
	}
	ret, err := v.v.messenger.Interact(ctx, &messengertypes.Interact_Request{
		Type:                  messengertypes.AppMessage_TypeUserMessage,
		Payload:               payload,
		ConversationPublicKey: base64.RawURLEncoding.EncodeToString(v.g.PublicKey),
	})
	if err != nil {
		return err
	}

	v.lastSentCID = ret.CID

	return nil
}

func contactShareCommand(displayFunc func(*groupView, string)) func(ctx context.Context, v *groupView, cmd string) error {
	return func(ctx context.Context, v *groupView, cmd string) error {
		v.v.lock.Lock()
		displayName := v.v.displayName
		v.v.lock.Unlock()

		res, err := v.v.messenger.InstanceShareableBertyID(ctx, &messengertypes.InstanceShareableBertyID_Request{
			DisplayName: displayName,
		})
		if err != nil {
			return err
		}

		displayFunc(v, res.WebURL)

		return nil
	}
}

func renderQR(v *groupView, url string) {
	qr := stringAsQR(url)
	for _, l := range qr {
		v.syncMessages <- &historyMessage{
			messageType: messageTypeMeta,
			payload:     []byte(l),
		}
	}

	copyToClipboard(v, strings.Join(qr, "\n"))
}

func renderText(v *groupView, url string) {
	v.syncMessages <- &historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(url),
	}

	copyToClipboard(v, url)
}

func copyToClipboard(v *groupView, txt string) {
	if clipboard.Unsupported {
		return
	}

	if err := clipboard.WriteAll(txt); err != nil {
		v.syncMessages <- &historyMessage{
			messageType: messageTypeError,
			payload:     []byte(fmt.Sprintf("(Copy to clipboard failed: %v)", err)),
		}
	} else {
		v.syncMessages <- &historyMessage{
			messageType: messageTypeMeta,
			payload:     []byte("(Copied to clipboard)"),
		}
	}
}

func contactRequestsOnCommand(ctx context.Context, v *groupView, cmd string) error {
	_, err := v.v.protocol.ContactRequestEnable(ctx, &protocoltypes.ContactRequestEnable_Request{})

	return err
}

func contactRequestsOffCommand(ctx context.Context, v *groupView, cmd string) error {
	_, err := v.v.protocol.ContactRequestDisable(ctx, &protocoltypes.ContactRequestDisable_Request{})

	return err
}

func contactRequestsReferenceResetCommand(ctx context.Context, v *groupView, cmd string) error {
	_, err := v.v.protocol.ContactRequestResetReference(ctx, &protocoltypes.ContactRequestResetReference_Request{})

	return err
}
