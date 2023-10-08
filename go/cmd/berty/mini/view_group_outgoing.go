package mini

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	"github.com/atotto/clipboard"
	"github.com/gdamore/tcell"
	"github.com/golang/protobuf/proto" // nolint:staticcheck // cannot use the new protobuf API while keeping gogoproto
	"github.com/ipfs/go-cid"
	"github.com/mdp/qrterminal/v3"
	"moul.io/godev"

	"berty.tech/berty/v2/go/pkg/bertylinks"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/weshnet/pkg/netmanager"
	"berty.tech/weshnet/pkg/protocoltypes"
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
			title: "keyboard",
			help:  "Lists keyboard shortcuts",
			cmd:   cmdKeyboard,
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
			title: "contact refresh",
			help:  "refresh contact request",
			cmd:   refreshCommand,
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
			title: "export",
			help:  `Saves an export of the current instance to the specified path`,
			cmd:   exportAccount,
		},
		{
			title: "services credential init",
			help:  `Inits a credential verification flow`,
			cmd:   credentialVerificationInit,
		},
		{
			title: "services credential complete",
			help:  `Completes a credential verification flow`,
			cmd:   credentialVerificationComplete,
		},
		{
			title: "services credential list",
			help:  `Lists verified credentials`,
			cmd:   credentialVerificationList,
		},
		{
			title: "services directory register",
			help:  `Registers a verified credential on a directory service`,
			cmd:   directoryServiceRegister,
		},
		{
			title: "services directory unregister",
			help:  `Unregisters an announced verified credential`,
			cmd:   directoryServiceUnregister,
		},
		{
			title: "services directory list",
			help:  `Lists announced verified credential`,
			cmd:   directoryServiceList,
		},
		{
			title: "services directory query",
			help:  `Queries a directory service for specified identifiers`,
			cmd:   directoryServiceQuery,
		},
		{
			title: "dd",
			help:  `special debug messenger command`,
			cmd:   newDebugMessengerCommand,
		},
		{
			title: "netmanager get",
			help:  `Get a netmanager state`,
			cmd:   newDebugNetManagerGetCommand,
		},
		{
			title: "netmanager set",
			help:  `Set a netmanager state`,
			cmd:   newDebugNetManagerSetCommand,
		},
		{
			title:     "/",
			help:      "",
			cmd:       newSlashMessageCommand,
			hideInLog: true,
		},
	}
}

func directoryServiceRegister(ctx context.Context, v *groupView, cmd string) error {
	cmdTokens := strings.Split(cmd, " ")
	if len(cmdTokens) != 2 && len(cmdTokens) != 3 {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("expected 2 or 3 parameters (server addr, identifier, proof issuer)"))
	}

	serverAddr := cmdTokens[0]
	identifier := cmdTokens[1]
	proofIssuer := ""
	if len(cmdTokens) == 3 {
		proofIssuer = cmdTokens[2]
	}

	_, err := v.v.messenger.DirectoryServiceRegister(ctx, &messengertypes.DirectoryServiceRegister_Request{
		Identifier:  identifier,
		ProofIssuer: proofIssuer,
		ServerAddr:  serverAddr,
	})
	if err != nil {
		return err
	}

	return nil
}

func directoryServiceUnregister(ctx context.Context, v *groupView, cmd string) error {
	cmdTokens := strings.Split(cmd, " ")
	if len(cmdTokens) < 2 {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("expected 2 or 3 parameters"))
	}

	serverAddr := cmdTokens[0]
	directoryRecordToken := cmdTokens[1]

	_, err := v.v.messenger.DirectoryServiceUnregister(ctx, &messengertypes.DirectoryServiceUnregister_Request{
		ServerAddr:           serverAddr,
		DirectoryRecordToken: directoryRecordToken,
	})
	if err != nil {
		return err
	}

	return nil
}

func directoryServiceList(ctx context.Context, v *groupView, cmd string) error {
	acc, err := v.v.messenger.AccountGet(ctx, &messengertypes.AccountGet_Request{})
	if err != nil {
		return err
	}

	for _, dsRecord := range acc.Account.DirectoryServiceRecords {
		revokedPrefix := " "
		if dsRecord.Revoked {
			revokedPrefix = "⨯"
		}

		v.messages.Append(&historyMessage{
			messageType: messageTypeMeta,
			payload:     []byte(fmt.Sprintf("%s %s (%s): %s - %d", revokedPrefix, dsRecord.Identifier, dsRecord.DirectoryRecordToken, dsRecord.ServerAddr, dsRecord.ExpirationDate)),
		})
	}

	return nil
}

func directoryServiceQuery(ctx context.Context, v *groupView, cmd string) error {
	cmdTokens := strings.Split(cmd, " ")
	if len(cmdTokens) != 2 {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("expected 2 parameters (server_addr, comma-separated list of identifiers)"))
	}

	serverAddr := cmdTokens[0]
	identifiers := strings.Split(cmdTokens[1], ",")

	results, err := v.v.messenger.DirectoryServiceQuery(ctx, &messengertypes.DirectoryServiceQuery_Request{
		ServerAddr:  serverAddr,
		Identifiers: identifiers,
	})
	if err != nil {
		return err
	}

	resultCount := 0
	for {
		result, err := results.Recv()
		if err != nil {
			break
		}

		if resultCount == 0 {
			v.messages.Append(&historyMessage{
				messageType: messageTypeMeta,
				payload:     []byte("Query results:"),
			})
		}

		resultCount++

		v.messages.Append(&historyMessage{
			messageType: messageTypeMeta,
			payload:     []byte(fmt.Sprintf("%d %s: %s", resultCount, result.DirectoryIdentifier, result.AccountURI)),
		})
	}

	if resultCount > 0 {
		v.messages.Append(&historyMessage{
			messageType: messageTypeMeta,
			payload:     []byte(strings.Repeat("-", 30)),
		})
	} else {
		v.messages.Append(&historyMessage{
			messageType: messageTypeMeta,
			payload:     []byte("No results found"),
		})
	}

	return nil
}

func credentialVerificationInit(ctx context.Context, v *groupView, service string) error {
	v.v.lock.Lock()
	displayName := v.v.displayName
	v.v.lock.Unlock()

	res, err := v.v.messenger.InstanceShareableBertyID(ctx, &messengertypes.InstanceShareableBertyID_Request{
		DisplayName: displayName,
	})
	if err != nil {
		return err
	}

	flowDetails, err := v.v.protocol.CredentialVerificationServiceInitFlow(ctx, &protocoltypes.CredentialVerificationServiceInitFlow_Request{
		ServiceURL: service,
		PublicKey:  res.Link.BertyID.AccountPK,
		Link:       res.WebURL,
	})
	if err != nil {
		return err
	}

	v.messages.Append(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("Auth URL: %s", flowDetails.URL)),
	})
	copyToClipboard(v, flowDetails.URL)

	return nil
}

func credentialVerificationComplete(ctx context.Context, v *groupView, callbackURI string) error {
	res, err := v.v.protocol.CredentialVerificationServiceCompleteFlow(ctx, &protocoltypes.CredentialVerificationServiceCompleteFlow_Request{
		CallbackURI: callbackURI,
	})
	if err != nil {
		return err
	}

	v.messages.Append(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("Completed authentication, associated identifier is <%s>", res.Identifier)),
	})

	return nil
}

func credentialVerificationList(ctx context.Context, v *groupView, _ string) error {
	resSrv, err := v.v.protocol.VerifiedCredentialsList(ctx, &protocoltypes.VerifiedCredentialsList_Request{})
	if err != nil {
		return err
	}

	for {
		cred, err := resSrv.Recv()
		if err != nil {
			if err != io.EOF {
				v.messages.AppendErr(err)
			}

			break
		}

		v.messages.Append(&historyMessage{
			messageType: messageTypeMeta,
			payload:     []byte(fmt.Sprintf("> <%s> %s", cred.Credential.Identifier, time.Unix(0, cred.Credential.ExpirationDate).String())),
		})
	}

	return nil
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
	config, err := v.v.protocol.ServiceGetConfiguration(ctx, &protocoltypes.ServiceGetConfiguration_Request{})
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
	// if v.lastSentCID == "" {
	// 	return fmt.Errorf("last message is unknown")
	// }

	// c, err := cid.Parse(v.lastSentCID)
	// if err != nil {
	// 	return err
	// }

	// res, err := v.v.protocol.PushSend(ctx, &protocoltypes.PushSend_Request{
	// 	CID:            c.Bytes(),
	// 	GroupPublicKey: v.g.PublicKey,
	// })
	// if err != nil {
	// 	return err
	// }

	// if len(res.GroupMembers) == 0 {
	// 	return fmt.Errorf("no push targets found")
	// }

	// targets := []string(nil)
	// for _, m := range res.GroupMembers {
	// 	for _, d := range m.DevicePKs {
	// 		targets = append(targets, pkAsShortID(d))
	// 	}
	// }

	// v.syncMessages <- &historyMessage{
	// 	receivedAt: time.Now(),
	// 	payload:    []byte(fmt.Sprintf("push sent to %s", strings.Join(targets, ", "))),
	// }

	// FIXME(push):
	return fmt.Errorf("unimplemented")
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

func refreshCommand(ctx context.Context, v *groupView, cmd string) error {
	contactspk := [][]byte{}
	v.v.lock.Lock()
	for k, state := range v.v.contactStates {
		switch state {
		case protocoltypes.ContactStateToRequest, protocoltypes.ContactStateAdded:
			contactspk = append(contactspk, []byte(k))
		default:
		}
	}
	v.v.lock.Unlock()

	for _, pk := range contactspk {
		go func(pk []byte) {
			ctx, cancel := context.WithTimeout(ctx, time.Second*20)
			defer cancel()

			v.syncMessages <- &historyMessage{
				messageType: messageTypeMeta,
				payload:     []byte("refreshing..."),
			}

			res, err := v.v.protocol.RefreshContactRequest(ctx, &protocoltypes.RefreshContactRequest_Request{
				ContactPK: pk,
			})

			switch {
			case err != nil:
				emsg := fmt.Sprintf("refresh: unable to connect to peer: %s", err.Error())
				v.syncMessages <- &historyMessage{
					messageType: messageTypeError,
					payload:     []byte(emsg),
				}

			case len(res.PeersFound) == 0:
				v.syncMessages <- &historyMessage{
					messageType: messageTypeError,
					payload:     []byte("refresh: no peers found"),
				}

			default:
				for _, p := range res.PeersFound {
					msg := fmt.Sprintf("refresh: succefully connected to peer: %s", p.ID)
					v.syncMessages <- &historyMessage{
						messageType: messageTypeMeta,
						payload:     []byte(msg),
					}
				}
			}
		}(pk)
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

func cmdKeyboard(ctx context.Context, v *groupView, cmd string) error {
	longestHint := 0
	help := [][]string(nil)

	for _, command := range keyboardCommands() {
		for _, shortcut := range command.shortcuts {
			eventKey := tcell.NewEventKey(shortcut.key, 0, shortcut.modifier)
			eventKeyName := eventKey.Name()

			if len(eventKeyName) > longestHint {
				longestHint = len(eventKeyName)
			}

			help = append(help, []string{
				eventKeyName,
				command.help,
			})
		}
	}

	lastItemCommandHelp := ""
	sameLabel := "(same)"
	for _, helpItem := range help {
		commandHelp := helpItem[1]
		if commandHelp == lastItemCommandHelp {
			center := len(commandHelp)/2 - len(sameLabel)/2
			if center < 0 {
				center = 0
			}

			commandHelp = fmt.Sprintf("%s%s", strings.Repeat(" ", center), sameLabel)
		} else {
			lastItemCommandHelp = commandHelp
		}

		v.syncMessages <- &historyMessage{
			payload: []byte(fmt.Sprintf(
				"%s%s  %s",
				helpItem[0],
				strings.Repeat(" ", longestHint-len(helpItem[0])),
				commandHelp,
			)),
		}
	}

	return nil
}

func newSlashMessageCommand(ctx context.Context, v *groupView, cmd string) error {
	return newMessageCommand(ctx, v, fmt.Sprintf("/%s", cmd))
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

func newDebugMessengerCommand(ctx context.Context, v *groupView, cmd string) error {
	return newMessageCommand(ctx, v, fmt.Sprintf("/dd %s", cmd))
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

func newDebugNetManagerGetCommand(ctx context.Context, v *groupView, cmd string) error {
	if cmd != "" {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("expected no argument"))
	}

	v.syncMessages <- &historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(v.v.netmanager.GetCurrentState().String()),
	}

	return nil
}

func newDebugNetManagerSetCommand(ctx context.Context, v *groupView, cmd string) error {
	if cmd == "" {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("expected arguments ex: `/netmanager set bluetooth=on nettype=mobile`"))
	}

	newConnectivityState := v.v.netmanager.GetCurrentState()

	for _, opt := range strings.Split(cmd, " ") {
		opt = strings.TrimSpace(opt)
		if opt == "" {
			continue
		}

		parts := strings.Split(opt, "=")
		if len(parts) != 2 {
			return errcode.ErrInvalidInput.Wrap(fmt.Errorf("expected a key=value arguments"))
		}

		switch strings.ToLower(parts[0]) {
		case "state":
			state, err := netmanager.ParseConnectivityState(parts[1])
			if err != nil {
				return errcode.ErrInvalidInput.Wrap(err)
			}
			newConnectivityState.State = state
		case "metering":
			metering, err := netmanager.ParseConnectivityState(parts[1])
			if err != nil {
				return errcode.ErrInvalidInput.Wrap(err)
			}
			newConnectivityState.Metering = metering
		case "bluetooth":
			bluetooth, err := netmanager.ParseConnectivityState(parts[1])
			if err != nil {
				return errcode.ErrInvalidInput.Wrap(err)
			}
			newConnectivityState.Bluetooth = bluetooth
		case "nettype":
			nettype, err := netmanager.ParseConnectivityNetType(parts[1])
			if err != nil {
				return errcode.ErrInvalidInput.Wrap(err)
			}
			newConnectivityState.NetType = nettype
		case "cellulartype":
			cellulartype, err := netmanager.ParseConnectivityCellularType(parts[1])
			if err != nil {
				return errcode.ErrInvalidInput.Wrap(err)
			}
			newConnectivityState.CellularType = cellulartype
		default:
			return errcode.ErrInvalidInput.Wrap(fmt.Errorf("unknown option %q", parts[0]))
		}
	}

	v.v.netmanager.UpdateState(newConnectivityState)

	v.syncMessages <- &historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(v.v.netmanager.GetCurrentState().String()),
	}

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
