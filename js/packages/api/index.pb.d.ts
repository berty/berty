import * as $protobuf from "protobufjs";
export namespace berty {

    namespace protocol {

        class ProtocolService extends $protobuf.rpc.Service {

            public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): ProtocolService;
            public instanceExportData(request: berty.types.InstanceExportData.IRequest, callback: berty.protocol.ProtocolService.InstanceExportDataCallback): void;
            public instanceExportData(request: berty.types.InstanceExportData.IRequest): Promise<berty.types.InstanceExportData.Reply>;
            public instanceGetConfiguration(request: berty.types.InstanceGetConfiguration.IRequest, callback: berty.protocol.ProtocolService.InstanceGetConfigurationCallback): void;
            public instanceGetConfiguration(request: berty.types.InstanceGetConfiguration.IRequest): Promise<berty.types.InstanceGetConfiguration.Reply>;
            public contactRequestReference(request: berty.types.ContactRequestReference.IRequest, callback: berty.protocol.ProtocolService.ContactRequestReferenceCallback): void;
            public contactRequestReference(request: berty.types.ContactRequestReference.IRequest): Promise<berty.types.ContactRequestReference.Reply>;
            public contactRequestDisable(request: berty.types.ContactRequestDisable.IRequest, callback: berty.protocol.ProtocolService.ContactRequestDisableCallback): void;
            public contactRequestDisable(request: berty.types.ContactRequestDisable.IRequest): Promise<berty.types.ContactRequestDisable.Reply>;
            public contactRequestEnable(request: berty.types.ContactRequestEnable.IRequest, callback: berty.protocol.ProtocolService.ContactRequestEnableCallback): void;
            public contactRequestEnable(request: berty.types.ContactRequestEnable.IRequest): Promise<berty.types.ContactRequestEnable.Reply>;
            public contactRequestResetReference(request: berty.types.ContactRequestResetReference.IRequest, callback: berty.protocol.ProtocolService.ContactRequestResetReferenceCallback): void;
            public contactRequestResetReference(request: berty.types.ContactRequestResetReference.IRequest): Promise<berty.types.ContactRequestResetReference.Reply>;
            public contactRequestSend(request: berty.types.ContactRequestSend.IRequest, callback: berty.protocol.ProtocolService.ContactRequestSendCallback): void;
            public contactRequestSend(request: berty.types.ContactRequestSend.IRequest): Promise<berty.types.ContactRequestSend.Reply>;
            public contactRequestAccept(request: berty.types.ContactRequestAccept.IRequest, callback: berty.protocol.ProtocolService.ContactRequestAcceptCallback): void;
            public contactRequestAccept(request: berty.types.ContactRequestAccept.IRequest): Promise<berty.types.ContactRequestAccept.Reply>;
            public contactRequestDiscard(request: berty.types.ContactRequestDiscard.IRequest, callback: berty.protocol.ProtocolService.ContactRequestDiscardCallback): void;
            public contactRequestDiscard(request: berty.types.ContactRequestDiscard.IRequest): Promise<berty.types.ContactRequestDiscard.Reply>;
            public contactBlock(request: berty.types.ContactBlock.IRequest, callback: berty.protocol.ProtocolService.ContactBlockCallback): void;
            public contactBlock(request: berty.types.ContactBlock.IRequest): Promise<berty.types.ContactBlock.Reply>;
            public contactUnblock(request: berty.types.ContactUnblock.IRequest, callback: berty.protocol.ProtocolService.ContactUnblockCallback): void;
            public contactUnblock(request: berty.types.ContactUnblock.IRequest): Promise<berty.types.ContactUnblock.Reply>;
            public contactAliasKeySend(request: berty.types.ContactAliasKeySend.IRequest, callback: berty.protocol.ProtocolService.ContactAliasKeySendCallback): void;
            public contactAliasKeySend(request: berty.types.ContactAliasKeySend.IRequest): Promise<berty.types.ContactAliasKeySend.Reply>;
            public multiMemberGroupCreate(request: berty.types.MultiMemberGroupCreate.IRequest, callback: berty.protocol.ProtocolService.MultiMemberGroupCreateCallback): void;
            public multiMemberGroupCreate(request: berty.types.MultiMemberGroupCreate.IRequest): Promise<berty.types.MultiMemberGroupCreate.Reply>;
            public multiMemberGroupJoin(request: berty.types.MultiMemberGroupJoin.IRequest, callback: berty.protocol.ProtocolService.MultiMemberGroupJoinCallback): void;
            public multiMemberGroupJoin(request: berty.types.MultiMemberGroupJoin.IRequest): Promise<berty.types.MultiMemberGroupJoin.Reply>;
            public multiMemberGroupLeave(request: berty.types.MultiMemberGroupLeave.IRequest, callback: berty.protocol.ProtocolService.MultiMemberGroupLeaveCallback): void;
            public multiMemberGroupLeave(request: berty.types.MultiMemberGroupLeave.IRequest): Promise<berty.types.MultiMemberGroupLeave.Reply>;
            public multiMemberGroupAliasResolverDisclose(request: berty.types.MultiMemberGroupAliasResolverDisclose.IRequest, callback: berty.protocol.ProtocolService.MultiMemberGroupAliasResolverDiscloseCallback): void;
            public multiMemberGroupAliasResolverDisclose(request: berty.types.MultiMemberGroupAliasResolverDisclose.IRequest): Promise<berty.types.MultiMemberGroupAliasResolverDisclose.Reply>;
            public multiMemberGroupAdminRoleGrant(request: berty.types.MultiMemberGroupAdminRoleGrant.IRequest, callback: berty.protocol.ProtocolService.MultiMemberGroupAdminRoleGrantCallback): void;
            public multiMemberGroupAdminRoleGrant(request: berty.types.MultiMemberGroupAdminRoleGrant.IRequest): Promise<berty.types.MultiMemberGroupAdminRoleGrant.Reply>;
            public multiMemberGroupInvitationCreate(request: berty.types.MultiMemberGroupInvitationCreate.IRequest, callback: berty.protocol.ProtocolService.MultiMemberGroupInvitationCreateCallback): void;
            public multiMemberGroupInvitationCreate(request: berty.types.MultiMemberGroupInvitationCreate.IRequest): Promise<berty.types.MultiMemberGroupInvitationCreate.Reply>;
            public appMetadataSend(request: berty.types.AppMetadataSend.IRequest, callback: berty.protocol.ProtocolService.AppMetadataSendCallback): void;
            public appMetadataSend(request: berty.types.AppMetadataSend.IRequest): Promise<berty.types.AppMetadataSend.Reply>;
            public appMessageSend(request: berty.types.AppMessageSend.IRequest, callback: berty.protocol.ProtocolService.AppMessageSendCallback): void;
            public appMessageSend(request: berty.types.AppMessageSend.IRequest): Promise<berty.types.AppMessageSend.Reply>;
            public groupMetadataSubscribe(request: berty.types.GroupMetadataSubscribe.IRequest, callback: berty.protocol.ProtocolService.GroupMetadataSubscribeCallback): void;
            public groupMetadataSubscribe(request: berty.types.GroupMetadataSubscribe.IRequest): Promise<berty.types.GroupMetadataEvent>;
            public groupMessageSubscribe(request: berty.types.GroupMessageSubscribe.IRequest, callback: berty.protocol.ProtocolService.GroupMessageSubscribeCallback): void;
            public groupMessageSubscribe(request: berty.types.GroupMessageSubscribe.IRequest): Promise<berty.types.GroupMessageEvent>;
            public groupMetadataList(request: berty.types.GroupMetadataList.IRequest, callback: berty.protocol.ProtocolService.GroupMetadataListCallback): void;
            public groupMetadataList(request: berty.types.GroupMetadataList.IRequest): Promise<berty.types.GroupMetadataEvent>;
            public groupMessageList(request: berty.types.GroupMessageList.IRequest, callback: berty.protocol.ProtocolService.GroupMessageListCallback): void;
            public groupMessageList(request: berty.types.GroupMessageList.IRequest): Promise<berty.types.GroupMessageEvent>;
            public groupInfo(request: berty.types.GroupInfo.IRequest, callback: berty.protocol.ProtocolService.GroupInfoCallback): void;
            public groupInfo(request: berty.types.GroupInfo.IRequest): Promise<berty.types.GroupInfo.Reply>;
            public activateGroup(request: berty.types.ActivateGroup.IRequest, callback: berty.protocol.ProtocolService.ActivateGroupCallback): void;
            public activateGroup(request: berty.types.ActivateGroup.IRequest): Promise<berty.types.ActivateGroup.Reply>;
            public deactivateGroup(request: berty.types.DeactivateGroup.IRequest, callback: berty.protocol.ProtocolService.DeactivateGroupCallback): void;
            public deactivateGroup(request: berty.types.DeactivateGroup.IRequest): Promise<berty.types.DeactivateGroup.Reply>;
            public debugListGroups(request: berty.types.DebugListGroups.IRequest, callback: berty.protocol.ProtocolService.DebugListGroupsCallback): void;
            public debugListGroups(request: berty.types.DebugListGroups.IRequest): Promise<berty.types.DebugListGroups.Reply>;
            public debugInspectGroupStore(request: berty.types.DebugInspectGroupStore.IRequest, callback: berty.protocol.ProtocolService.DebugInspectGroupStoreCallback): void;
            public debugInspectGroupStore(request: berty.types.DebugInspectGroupStore.IRequest): Promise<berty.types.DebugInspectGroupStore.Reply>;
        }

        namespace ProtocolService {

            type InstanceExportDataCallback = (error: (Error|null), response?: berty.types.InstanceExportData.Reply) => void;

            type InstanceGetConfigurationCallback = (error: (Error|null), response?: berty.types.InstanceGetConfiguration.Reply) => void;

            type ContactRequestReferenceCallback = (error: (Error|null), response?: berty.types.ContactRequestReference.Reply) => void;

            type ContactRequestDisableCallback = (error: (Error|null), response?: berty.types.ContactRequestDisable.Reply) => void;

            type ContactRequestEnableCallback = (error: (Error|null), response?: berty.types.ContactRequestEnable.Reply) => void;

            type ContactRequestResetReferenceCallback = (error: (Error|null), response?: berty.types.ContactRequestResetReference.Reply) => void;

            type ContactRequestSendCallback = (error: (Error|null), response?: berty.types.ContactRequestSend.Reply) => void;

            type ContactRequestAcceptCallback = (error: (Error|null), response?: berty.types.ContactRequestAccept.Reply) => void;

            type ContactRequestDiscardCallback = (error: (Error|null), response?: berty.types.ContactRequestDiscard.Reply) => void;

            type ContactBlockCallback = (error: (Error|null), response?: berty.types.ContactBlock.Reply) => void;

            type ContactUnblockCallback = (error: (Error|null), response?: berty.types.ContactUnblock.Reply) => void;

            type ContactAliasKeySendCallback = (error: (Error|null), response?: berty.types.ContactAliasKeySend.Reply) => void;

            type MultiMemberGroupCreateCallback = (error: (Error|null), response?: berty.types.MultiMemberGroupCreate.Reply) => void;

            type MultiMemberGroupJoinCallback = (error: (Error|null), response?: berty.types.MultiMemberGroupJoin.Reply) => void;

            type MultiMemberGroupLeaveCallback = (error: (Error|null), response?: berty.types.MultiMemberGroupLeave.Reply) => void;

            type MultiMemberGroupAliasResolverDiscloseCallback = (error: (Error|null), response?: berty.types.MultiMemberGroupAliasResolverDisclose.Reply) => void;

            type MultiMemberGroupAdminRoleGrantCallback = (error: (Error|null), response?: berty.types.MultiMemberGroupAdminRoleGrant.Reply) => void;

            type MultiMemberGroupInvitationCreateCallback = (error: (Error|null), response?: berty.types.MultiMemberGroupInvitationCreate.Reply) => void;

            type AppMetadataSendCallback = (error: (Error|null), response?: berty.types.AppMetadataSend.Reply) => void;

            type AppMessageSendCallback = (error: (Error|null), response?: berty.types.AppMessageSend.Reply) => void;

            type GroupMetadataSubscribeCallback = (error: (Error|null), response?: berty.types.GroupMetadataEvent) => void;

            type GroupMessageSubscribeCallback = (error: (Error|null), response?: berty.types.GroupMessageEvent) => void;

            type GroupMetadataListCallback = (error: (Error|null), response?: berty.types.GroupMetadataEvent) => void;

            type GroupMessageListCallback = (error: (Error|null), response?: berty.types.GroupMessageEvent) => void;

            type GroupInfoCallback = (error: (Error|null), response?: berty.types.GroupInfo.Reply) => void;

            type ActivateGroupCallback = (error: (Error|null), response?: berty.types.ActivateGroup.Reply) => void;

            type DeactivateGroupCallback = (error: (Error|null), response?: berty.types.DeactivateGroup.Reply) => void;

            type DebugListGroupsCallback = (error: (Error|null), response?: berty.types.DebugListGroups.Reply) => void;

            type DebugInspectGroupStoreCallback = (error: (Error|null), response?: berty.types.DebugInspectGroupStore.Reply) => void;
        }
    }

    namespace types {

        enum GroupType {
            GroupTypeUndefined = 0,
            GroupTypeAccount = 1,
            GroupTypeContact = 2,
            GroupTypeMultiMember = 3
        }

        enum EventType {
            EventTypeUndefined = 0,
            EventTypeGroupMemberDeviceAdded = 1,
            EventTypeGroupDeviceSecretAdded = 2,
            EventTypeAccountGroupJoined = 101,
            EventTypeAccountGroupLeft = 102,
            EventTypeAccountContactRequestDisabled = 103,
            EventTypeAccountContactRequestEnabled = 104,
            EventTypeAccountContactRequestReferenceReset = 105,
            EventTypeAccountContactRequestOutgoingEnqueued = 106,
            EventTypeAccountContactRequestOutgoingSent = 107,
            EventTypeAccountContactRequestIncomingReceived = 108,
            EventTypeAccountContactRequestIncomingDiscarded = 109,
            EventTypeAccountContactRequestIncomingAccepted = 110,
            EventTypeAccountContactBlocked = 111,
            EventTypeAccountContactUnblocked = 112,
            EventTypeContactAliasKeyAdded = 201,
            EventTypeMultiMemberGroupAliasResolverAdded = 301,
            EventTypeMultiMemberGroupInitialMemberAnnounced = 302,
            EventTypeMultiMemberGroupAdminRoleGranted = 303,
            EventTypeGroupMetadataPayloadSent = 1001
        }

        interface IAccount {
            group?: (berty.types.IGroup|null);
            accountPrivateKey?: (Uint8Array|null);
            aliasPrivateKey?: (Uint8Array|null);
            publicRendezvousSeed?: (Uint8Array|null);
        }

        class Account implements IAccount {

            public group?: (berty.types.IGroup|null);
            public accountPrivateKey: Uint8Array;
            public aliasPrivateKey: Uint8Array;
            public publicRendezvousSeed: Uint8Array;
            public static create(properties?: berty.types.IAccount): berty.types.Account;
            public static encode(message: berty.types.IAccount, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccount, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.Account;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.Account;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.Account;
            public static toObject(message: berty.types.Account, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IGroup {
            publicKey?: (Uint8Array|null);
            secret?: (Uint8Array|null);
            secretSig?: (Uint8Array|null);
            groupType?: (berty.types.GroupType|null);
        }

        class Group implements IGroup {

            public publicKey: Uint8Array;
            public secret: Uint8Array;
            public secretSig: Uint8Array;
            public groupType: berty.types.GroupType;
            public static create(properties?: berty.types.IGroup): berty.types.Group;
            public static encode(message: berty.types.IGroup, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroup, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.Group;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.Group;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.Group;
            public static toObject(message: berty.types.Group, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IGroupMetadata {
            eventType?: (berty.types.EventType|null);
            payload?: (Uint8Array|null);
            sig?: (Uint8Array|null);
        }

        class GroupMetadata implements IGroupMetadata {

            public eventType: berty.types.EventType;
            public payload: Uint8Array;
            public sig: Uint8Array;
            public static create(properties?: berty.types.IGroupMetadata): berty.types.GroupMetadata;
            public static encode(message: berty.types.IGroupMetadata, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupMetadata, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupMetadata;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupMetadata;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupMetadata;
            public static toObject(message: berty.types.GroupMetadata, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IGroupEnvelope {
            nonce?: (Uint8Array|null);
            event?: (Uint8Array|null);
        }

        class GroupEnvelope implements IGroupEnvelope {

            public nonce: Uint8Array;
            public event: Uint8Array;
            public static create(properties?: berty.types.IGroupEnvelope): berty.types.GroupEnvelope;
            public static encode(message: berty.types.IGroupEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupEnvelope;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupEnvelope;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupEnvelope;
            public static toObject(message: berty.types.GroupEnvelope, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMessageHeaders {
            counter?: (number|Long|null);
            devicePk?: (Uint8Array|null);
            sig?: (Uint8Array|null);
            metadata?: ({ [k: string]: string }|null);
        }

        class MessageHeaders implements IMessageHeaders {

            public counter: (number|Long);
            public devicePk: Uint8Array;
            public sig: Uint8Array;
            public metadata: { [k: string]: string };
            public static create(properties?: berty.types.IMessageHeaders): berty.types.MessageHeaders;
            public static encode(message: berty.types.IMessageHeaders, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IMessageHeaders, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MessageHeaders;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MessageHeaders;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.MessageHeaders;
            public static toObject(message: berty.types.MessageHeaders, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMessageEnvelope {
            messageHeaders?: (Uint8Array|null);
            message?: (Uint8Array|null);
            nonce?: (Uint8Array|null);
        }

        class MessageEnvelope implements IMessageEnvelope {

            public messageHeaders: Uint8Array;
            public message: Uint8Array;
            public nonce: Uint8Array;
            public static create(properties?: berty.types.IMessageEnvelope): berty.types.MessageEnvelope;
            public static encode(message: berty.types.IMessageEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IMessageEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MessageEnvelope;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MessageEnvelope;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.MessageEnvelope;
            public static toObject(message: berty.types.MessageEnvelope, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IEventContext {
            id?: (Uint8Array|null);
            parentIds?: (Uint8Array[]|null);
            groupPk?: (Uint8Array|null);
        }

        class EventContext implements IEventContext {

            public id: Uint8Array;
            public parentIds: Uint8Array[];
            public groupPk: Uint8Array;
            public static create(properties?: berty.types.IEventContext): berty.types.EventContext;
            public static encode(message: berty.types.IEventContext, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IEventContext, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.EventContext;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.EventContext;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.EventContext;
            public static toObject(message: berty.types.EventContext, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAppMetadata {
            devicePk?: (Uint8Array|null);
            message?: (Uint8Array|null);
        }

        class AppMetadata implements IAppMetadata {

            public devicePk: Uint8Array;
            public message: Uint8Array;
            public static create(properties?: berty.types.IAppMetadata): berty.types.AppMetadata;
            public static encode(message: berty.types.IAppMetadata, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAppMetadata, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AppMetadata;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AppMetadata;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AppMetadata;
            public static toObject(message: berty.types.AppMetadata, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IContactAddAliasKey {
            devicePk?: (Uint8Array|null);
            aliasPk?: (Uint8Array|null);
        }

        class ContactAddAliasKey implements IContactAddAliasKey {

            public devicePk: Uint8Array;
            public aliasPk: Uint8Array;
            public static create(properties?: berty.types.IContactAddAliasKey): berty.types.ContactAddAliasKey;
            public static encode(message: berty.types.IContactAddAliasKey, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IContactAddAliasKey, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactAddAliasKey;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactAddAliasKey;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ContactAddAliasKey;
            public static toObject(message: berty.types.ContactAddAliasKey, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IGroupAddMemberDevice {
            memberPk?: (Uint8Array|null);
            devicePk?: (Uint8Array|null);
            memberSig?: (Uint8Array|null);
        }

        class GroupAddMemberDevice implements IGroupAddMemberDevice {

            public memberPk: Uint8Array;
            public devicePk: Uint8Array;
            public memberSig: Uint8Array;
            public static create(properties?: berty.types.IGroupAddMemberDevice): berty.types.GroupAddMemberDevice;
            public static encode(message: berty.types.IGroupAddMemberDevice, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupAddMemberDevice, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupAddMemberDevice;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupAddMemberDevice;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupAddMemberDevice;
            public static toObject(message: berty.types.GroupAddMemberDevice, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IDeviceSecret {
            chainKey?: (Uint8Array|null);
            counter?: (number|Long|null);
        }

        class DeviceSecret implements IDeviceSecret {

            public chainKey: Uint8Array;
            public counter: (number|Long);
            public static create(properties?: berty.types.IDeviceSecret): berty.types.DeviceSecret;
            public static encode(message: berty.types.IDeviceSecret, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IDeviceSecret, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.DeviceSecret;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.DeviceSecret;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.DeviceSecret;
            public static toObject(message: berty.types.DeviceSecret, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IGroupAddDeviceSecret {
            devicePk?: (Uint8Array|null);
            destMemberPk?: (Uint8Array|null);
            payload?: (Uint8Array|null);
        }

        class GroupAddDeviceSecret implements IGroupAddDeviceSecret {

            public devicePk: Uint8Array;
            public destMemberPk: Uint8Array;
            public payload: Uint8Array;
            public static create(properties?: berty.types.IGroupAddDeviceSecret): berty.types.GroupAddDeviceSecret;
            public static encode(message: berty.types.IGroupAddDeviceSecret, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupAddDeviceSecret, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupAddDeviceSecret;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupAddDeviceSecret;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupAddDeviceSecret;
            public static toObject(message: berty.types.GroupAddDeviceSecret, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMultiMemberGroupAddAliasResolver {
            devicePk?: (Uint8Array|null);
            aliasResolver?: (Uint8Array|null);
            aliasProof?: (Uint8Array|null);
        }

        class MultiMemberGroupAddAliasResolver implements IMultiMemberGroupAddAliasResolver {

            public devicePk: Uint8Array;
            public aliasResolver: Uint8Array;
            public aliasProof: Uint8Array;
            public static create(properties?: berty.types.IMultiMemberGroupAddAliasResolver): berty.types.MultiMemberGroupAddAliasResolver;
            public static encode(message: berty.types.IMultiMemberGroupAddAliasResolver, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IMultiMemberGroupAddAliasResolver, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupAddAliasResolver;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupAddAliasResolver;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupAddAliasResolver;
            public static toObject(message: berty.types.MultiMemberGroupAddAliasResolver, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMultiMemberGrantAdminRole {
            devicePk?: (Uint8Array|null);
            granteeMemberPk?: (Uint8Array|null);
        }

        class MultiMemberGrantAdminRole implements IMultiMemberGrantAdminRole {

            public devicePk: Uint8Array;
            public granteeMemberPk: Uint8Array;
            public static create(properties?: berty.types.IMultiMemberGrantAdminRole): berty.types.MultiMemberGrantAdminRole;
            public static encode(message: berty.types.IMultiMemberGrantAdminRole, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IMultiMemberGrantAdminRole, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGrantAdminRole;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGrantAdminRole;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGrantAdminRole;
            public static toObject(message: berty.types.MultiMemberGrantAdminRole, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMultiMemberInitialMember {
            memberPk?: (Uint8Array|null);
        }

        class MultiMemberInitialMember implements IMultiMemberInitialMember {

            public memberPk: Uint8Array;
            public static create(properties?: berty.types.IMultiMemberInitialMember): berty.types.MultiMemberInitialMember;
            public static encode(message: berty.types.IMultiMemberInitialMember, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IMultiMemberInitialMember, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberInitialMember;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberInitialMember;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberInitialMember;
            public static toObject(message: berty.types.MultiMemberInitialMember, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IGroupAddAdditionalRendezvousSeed {
            devicePk?: (Uint8Array|null);
            seed?: (Uint8Array|null);
        }

        class GroupAddAdditionalRendezvousSeed implements IGroupAddAdditionalRendezvousSeed {

            public devicePk: Uint8Array;
            public seed: Uint8Array;
            public static create(properties?: berty.types.IGroupAddAdditionalRendezvousSeed): berty.types.GroupAddAdditionalRendezvousSeed;
            public static encode(message: berty.types.IGroupAddAdditionalRendezvousSeed, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupAddAdditionalRendezvousSeed, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupAddAdditionalRendezvousSeed;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupAddAdditionalRendezvousSeed;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupAddAdditionalRendezvousSeed;
            public static toObject(message: berty.types.GroupAddAdditionalRendezvousSeed, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IGroupRemoveAdditionalRendezvousSeed {
            devicePk?: (Uint8Array|null);
            seed?: (Uint8Array|null);
        }

        class GroupRemoveAdditionalRendezvousSeed implements IGroupRemoveAdditionalRendezvousSeed {

            public devicePk: Uint8Array;
            public seed: Uint8Array;
            public static create(properties?: berty.types.IGroupRemoveAdditionalRendezvousSeed): berty.types.GroupRemoveAdditionalRendezvousSeed;
            public static encode(message: berty.types.IGroupRemoveAdditionalRendezvousSeed, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupRemoveAdditionalRendezvousSeed, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupRemoveAdditionalRendezvousSeed;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupRemoveAdditionalRendezvousSeed;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupRemoveAdditionalRendezvousSeed;
            public static toObject(message: berty.types.GroupRemoveAdditionalRendezvousSeed, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountGroupJoined {
            devicePk?: (Uint8Array|null);
            group?: (berty.types.IGroup|null);
        }

        class AccountGroupJoined implements IAccountGroupJoined {

            public devicePk: Uint8Array;
            public group?: (berty.types.IGroup|null);
            public static create(properties?: berty.types.IAccountGroupJoined): berty.types.AccountGroupJoined;
            public static encode(message: berty.types.IAccountGroupJoined, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountGroupJoined, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountGroupJoined;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountGroupJoined;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountGroupJoined;
            public static toObject(message: berty.types.AccountGroupJoined, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountGroupLeft {
            devicePk?: (Uint8Array|null);
            groupPk?: (Uint8Array|null);
        }

        class AccountGroupLeft implements IAccountGroupLeft {

            public devicePk: Uint8Array;
            public groupPk: Uint8Array;
            public static create(properties?: berty.types.IAccountGroupLeft): berty.types.AccountGroupLeft;
            public static encode(message: berty.types.IAccountGroupLeft, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountGroupLeft, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountGroupLeft;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountGroupLeft;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountGroupLeft;
            public static toObject(message: berty.types.AccountGroupLeft, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountContactRequestDisabled {
            devicePk?: (Uint8Array|null);
        }

        class AccountContactRequestDisabled implements IAccountContactRequestDisabled {

            public devicePk: Uint8Array;
            public static create(properties?: berty.types.IAccountContactRequestDisabled): berty.types.AccountContactRequestDisabled;
            public static encode(message: berty.types.IAccountContactRequestDisabled, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountContactRequestDisabled, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountContactRequestDisabled;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountContactRequestDisabled;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountContactRequestDisabled;
            public static toObject(message: berty.types.AccountContactRequestDisabled, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountContactRequestEnabled {
            devicePk?: (Uint8Array|null);
        }

        class AccountContactRequestEnabled implements IAccountContactRequestEnabled {

            public devicePk: Uint8Array;
            public static create(properties?: berty.types.IAccountContactRequestEnabled): berty.types.AccountContactRequestEnabled;
            public static encode(message: berty.types.IAccountContactRequestEnabled, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountContactRequestEnabled, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountContactRequestEnabled;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountContactRequestEnabled;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountContactRequestEnabled;
            public static toObject(message: berty.types.AccountContactRequestEnabled, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountContactRequestReferenceReset {
            devicePk?: (Uint8Array|null);
            publicRendezvousSeed?: (Uint8Array|null);
        }

        class AccountContactRequestReferenceReset implements IAccountContactRequestReferenceReset {

            public devicePk: Uint8Array;
            public publicRendezvousSeed: Uint8Array;
            public static create(properties?: berty.types.IAccountContactRequestReferenceReset): berty.types.AccountContactRequestReferenceReset;
            public static encode(message: berty.types.IAccountContactRequestReferenceReset, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountContactRequestReferenceReset, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountContactRequestReferenceReset;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountContactRequestReferenceReset;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountContactRequestReferenceReset;
            public static toObject(message: berty.types.AccountContactRequestReferenceReset, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountContactRequestEnqueued {
            devicePk?: (Uint8Array|null);
            groupPk?: (Uint8Array|null);
            contact?: (berty.types.IShareableContact|null);
            ownMetadata?: (Uint8Array|null);
        }

        class AccountContactRequestEnqueued implements IAccountContactRequestEnqueued {

            public devicePk: Uint8Array;
            public groupPk: Uint8Array;
            public contact?: (berty.types.IShareableContact|null);
            public ownMetadata: Uint8Array;
            public static create(properties?: berty.types.IAccountContactRequestEnqueued): berty.types.AccountContactRequestEnqueued;
            public static encode(message: berty.types.IAccountContactRequestEnqueued, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountContactRequestEnqueued, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountContactRequestEnqueued;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountContactRequestEnqueued;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountContactRequestEnqueued;
            public static toObject(message: berty.types.AccountContactRequestEnqueued, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountContactRequestSent {
            devicePk?: (Uint8Array|null);
            contactPk?: (Uint8Array|null);
        }

        class AccountContactRequestSent implements IAccountContactRequestSent {

            public devicePk: Uint8Array;
            public contactPk: Uint8Array;
            public static create(properties?: berty.types.IAccountContactRequestSent): berty.types.AccountContactRequestSent;
            public static encode(message: berty.types.IAccountContactRequestSent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountContactRequestSent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountContactRequestSent;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountContactRequestSent;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountContactRequestSent;
            public static toObject(message: berty.types.AccountContactRequestSent, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountContactRequestReceived {
            devicePk?: (Uint8Array|null);
            contactPk?: (Uint8Array|null);
            contactRendezvousSeed?: (Uint8Array|null);
            contactMetadata?: (Uint8Array|null);
        }

        class AccountContactRequestReceived implements IAccountContactRequestReceived {

            public devicePk: Uint8Array;
            public contactPk: Uint8Array;
            public contactRendezvousSeed: Uint8Array;
            public contactMetadata: Uint8Array;
            public static create(properties?: berty.types.IAccountContactRequestReceived): berty.types.AccountContactRequestReceived;
            public static encode(message: berty.types.IAccountContactRequestReceived, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountContactRequestReceived, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountContactRequestReceived;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountContactRequestReceived;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountContactRequestReceived;
            public static toObject(message: berty.types.AccountContactRequestReceived, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountContactRequestDiscarded {
            devicePk?: (Uint8Array|null);
            contactPk?: (Uint8Array|null);
        }

        class AccountContactRequestDiscarded implements IAccountContactRequestDiscarded {

            public devicePk: Uint8Array;
            public contactPk: Uint8Array;
            public static create(properties?: berty.types.IAccountContactRequestDiscarded): berty.types.AccountContactRequestDiscarded;
            public static encode(message: berty.types.IAccountContactRequestDiscarded, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountContactRequestDiscarded, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountContactRequestDiscarded;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountContactRequestDiscarded;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountContactRequestDiscarded;
            public static toObject(message: berty.types.AccountContactRequestDiscarded, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountContactRequestAccepted {
            devicePk?: (Uint8Array|null);
            contactPk?: (Uint8Array|null);
            groupPk?: (Uint8Array|null);
        }

        class AccountContactRequestAccepted implements IAccountContactRequestAccepted {

            public devicePk: Uint8Array;
            public contactPk: Uint8Array;
            public groupPk: Uint8Array;
            public static create(properties?: berty.types.IAccountContactRequestAccepted): berty.types.AccountContactRequestAccepted;
            public static encode(message: berty.types.IAccountContactRequestAccepted, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountContactRequestAccepted, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountContactRequestAccepted;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountContactRequestAccepted;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountContactRequestAccepted;
            public static toObject(message: berty.types.AccountContactRequestAccepted, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountContactBlocked {
            devicePk?: (Uint8Array|null);
            contactPk?: (Uint8Array|null);
        }

        class AccountContactBlocked implements IAccountContactBlocked {

            public devicePk: Uint8Array;
            public contactPk: Uint8Array;
            public static create(properties?: berty.types.IAccountContactBlocked): berty.types.AccountContactBlocked;
            public static encode(message: berty.types.IAccountContactBlocked, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountContactBlocked, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountContactBlocked;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountContactBlocked;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountContactBlocked;
            public static toObject(message: berty.types.AccountContactBlocked, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountContactUnblocked {
            devicePk?: (Uint8Array|null);
            contactPk?: (Uint8Array|null);
        }

        class AccountContactUnblocked implements IAccountContactUnblocked {

            public devicePk: Uint8Array;
            public contactPk: Uint8Array;
            public static create(properties?: berty.types.IAccountContactUnblocked): berty.types.AccountContactUnblocked;
            public static encode(message: berty.types.IAccountContactUnblocked, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountContactUnblocked, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountContactUnblocked;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountContactUnblocked;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountContactUnblocked;
            public static toObject(message: berty.types.AccountContactUnblocked, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IInstanceExportData {
        }

        class InstanceExportData implements IInstanceExportData {

            public static create(properties?: berty.types.IInstanceExportData): berty.types.InstanceExportData;
            public static encode(message: berty.types.IInstanceExportData, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IInstanceExportData, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.InstanceExportData;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.InstanceExportData;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.InstanceExportData;
            public static toObject(message: berty.types.InstanceExportData, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace InstanceExportData {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.types.InstanceExportData.IRequest): berty.types.InstanceExportData.Request;
                public static encode(message: berty.types.InstanceExportData.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.InstanceExportData.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.InstanceExportData.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.InstanceExportData.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.InstanceExportData.Request;
                public static toObject(message: berty.types.InstanceExportData.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                exportedData?: (Uint8Array|null);
            }

            class Reply implements IReply {

                public exportedData: Uint8Array;
                public static create(properties?: berty.types.InstanceExportData.IReply): berty.types.InstanceExportData.Reply;
                public static encode(message: berty.types.InstanceExportData.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.InstanceExportData.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.InstanceExportData.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.InstanceExportData.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.InstanceExportData.Reply;
                public static toObject(message: berty.types.InstanceExportData.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IInstanceGetConfiguration {
        }

        class InstanceGetConfiguration implements IInstanceGetConfiguration {

            public static create(properties?: berty.types.IInstanceGetConfiguration): berty.types.InstanceGetConfiguration;
            public static encode(message: berty.types.IInstanceGetConfiguration, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IInstanceGetConfiguration, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.InstanceGetConfiguration;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.InstanceGetConfiguration;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.InstanceGetConfiguration;
            public static toObject(message: berty.types.InstanceGetConfiguration, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace InstanceGetConfiguration {

            enum SettingState {
                Unknown = 0,
                Enabled = 1,
                Disabled = 2,
                Unavailable = 3
            }

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.types.InstanceGetConfiguration.IRequest): berty.types.InstanceGetConfiguration.Request;
                public static encode(message: berty.types.InstanceGetConfiguration.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.InstanceGetConfiguration.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.InstanceGetConfiguration.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.InstanceGetConfiguration.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.InstanceGetConfiguration.Request;
                public static toObject(message: berty.types.InstanceGetConfiguration.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                accountPk?: (Uint8Array|null);
                devicePk?: (Uint8Array|null);
                accountGroupPk?: (Uint8Array|null);
                peerId?: (string|null);
                listeners?: (string[]|null);
                bleEnabled?: (berty.types.InstanceGetConfiguration.SettingState|null);
                wifiP2pEnabled?: (berty.types.InstanceGetConfiguration.SettingState|null);
                mdnsEnabled?: (berty.types.InstanceGetConfiguration.SettingState|null);
                relayEnabled?: (berty.types.InstanceGetConfiguration.SettingState|null);
            }

            class Reply implements IReply {

                public accountPk: Uint8Array;
                public devicePk: Uint8Array;
                public accountGroupPk: Uint8Array;
                public peerId: string;
                public listeners: string[];
                public bleEnabled: berty.types.InstanceGetConfiguration.SettingState;
                public wifiP2pEnabled: berty.types.InstanceGetConfiguration.SettingState;
                public mdnsEnabled: berty.types.InstanceGetConfiguration.SettingState;
                public relayEnabled: berty.types.InstanceGetConfiguration.SettingState;
                public static create(properties?: berty.types.InstanceGetConfiguration.IReply): berty.types.InstanceGetConfiguration.Reply;
                public static encode(message: berty.types.InstanceGetConfiguration.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.InstanceGetConfiguration.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.InstanceGetConfiguration.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.InstanceGetConfiguration.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.InstanceGetConfiguration.Reply;
                public static toObject(message: berty.types.InstanceGetConfiguration.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRequestReference {
        }

        class ContactRequestReference implements IContactRequestReference {

            public static create(properties?: berty.types.IContactRequestReference): berty.types.ContactRequestReference;
            public static encode(message: berty.types.IContactRequestReference, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IContactRequestReference, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestReference;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestReference;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestReference;
            public static toObject(message: berty.types.ContactRequestReference, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRequestReference {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.types.ContactRequestReference.IRequest): berty.types.ContactRequestReference.Request;
                public static encode(message: berty.types.ContactRequestReference.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestReference.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestReference.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestReference.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestReference.Request;
                public static toObject(message: berty.types.ContactRequestReference.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                publicRendezvousSeed?: (Uint8Array|null);
                enabled?: (boolean|null);
            }

            class Reply implements IReply {

                public publicRendezvousSeed: Uint8Array;
                public enabled: boolean;
                public static create(properties?: berty.types.ContactRequestReference.IReply): berty.types.ContactRequestReference.Reply;
                public static encode(message: berty.types.ContactRequestReference.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestReference.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestReference.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestReference.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestReference.Reply;
                public static toObject(message: berty.types.ContactRequestReference.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRequestDisable {
        }

        class ContactRequestDisable implements IContactRequestDisable {

            public static create(properties?: berty.types.IContactRequestDisable): berty.types.ContactRequestDisable;
            public static encode(message: berty.types.IContactRequestDisable, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IContactRequestDisable, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestDisable;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestDisable;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestDisable;
            public static toObject(message: berty.types.ContactRequestDisable, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRequestDisable {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.types.ContactRequestDisable.IRequest): berty.types.ContactRequestDisable.Request;
                public static encode(message: berty.types.ContactRequestDisable.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestDisable.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestDisable.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestDisable.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestDisable.Request;
                public static toObject(message: berty.types.ContactRequestDisable.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.ContactRequestDisable.IReply): berty.types.ContactRequestDisable.Reply;
                public static encode(message: berty.types.ContactRequestDisable.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestDisable.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestDisable.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestDisable.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestDisable.Reply;
                public static toObject(message: berty.types.ContactRequestDisable.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRequestEnable {
        }

        class ContactRequestEnable implements IContactRequestEnable {

            public static create(properties?: berty.types.IContactRequestEnable): berty.types.ContactRequestEnable;
            public static encode(message: berty.types.IContactRequestEnable, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IContactRequestEnable, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestEnable;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestEnable;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestEnable;
            public static toObject(message: berty.types.ContactRequestEnable, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRequestEnable {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.types.ContactRequestEnable.IRequest): berty.types.ContactRequestEnable.Request;
                public static encode(message: berty.types.ContactRequestEnable.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestEnable.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestEnable.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestEnable.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestEnable.Request;
                public static toObject(message: berty.types.ContactRequestEnable.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                publicRendezvousSeed?: (Uint8Array|null);
            }

            class Reply implements IReply {

                public publicRendezvousSeed: Uint8Array;
                public static create(properties?: berty.types.ContactRequestEnable.IReply): berty.types.ContactRequestEnable.Reply;
                public static encode(message: berty.types.ContactRequestEnable.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestEnable.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestEnable.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestEnable.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestEnable.Reply;
                public static toObject(message: berty.types.ContactRequestEnable.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRequestResetReference {
        }

        class ContactRequestResetReference implements IContactRequestResetReference {

            public static create(properties?: berty.types.IContactRequestResetReference): berty.types.ContactRequestResetReference;
            public static encode(message: berty.types.IContactRequestResetReference, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IContactRequestResetReference, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestResetReference;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestResetReference;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestResetReference;
            public static toObject(message: berty.types.ContactRequestResetReference, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRequestResetReference {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.types.ContactRequestResetReference.IRequest): berty.types.ContactRequestResetReference.Request;
                public static encode(message: berty.types.ContactRequestResetReference.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestResetReference.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestResetReference.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestResetReference.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestResetReference.Request;
                public static toObject(message: berty.types.ContactRequestResetReference.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                publicRendezvousSeed?: (Uint8Array|null);
            }

            class Reply implements IReply {

                public publicRendezvousSeed: Uint8Array;
                public static create(properties?: berty.types.ContactRequestResetReference.IReply): berty.types.ContactRequestResetReference.Reply;
                public static encode(message: berty.types.ContactRequestResetReference.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestResetReference.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestResetReference.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestResetReference.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestResetReference.Reply;
                public static toObject(message: berty.types.ContactRequestResetReference.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRequestSend {
        }

        class ContactRequestSend implements IContactRequestSend {

            public static create(properties?: berty.types.IContactRequestSend): berty.types.ContactRequestSend;
            public static encode(message: berty.types.IContactRequestSend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IContactRequestSend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestSend;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestSend;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestSend;
            public static toObject(message: berty.types.ContactRequestSend, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRequestSend {

            interface IRequest {
                contact?: (berty.types.IShareableContact|null);
                ownMetadata?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public contact?: (berty.types.IShareableContact|null);
                public ownMetadata: Uint8Array;
                public static create(properties?: berty.types.ContactRequestSend.IRequest): berty.types.ContactRequestSend.Request;
                public static encode(message: berty.types.ContactRequestSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestSend.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestSend.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestSend.Request;
                public static toObject(message: berty.types.ContactRequestSend.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.ContactRequestSend.IReply): berty.types.ContactRequestSend.Reply;
                public static encode(message: berty.types.ContactRequestSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestSend.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestSend.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestSend.Reply;
                public static toObject(message: berty.types.ContactRequestSend.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRequestAccept {
        }

        class ContactRequestAccept implements IContactRequestAccept {

            public static create(properties?: berty.types.IContactRequestAccept): berty.types.ContactRequestAccept;
            public static encode(message: berty.types.IContactRequestAccept, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IContactRequestAccept, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestAccept;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestAccept;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestAccept;
            public static toObject(message: berty.types.ContactRequestAccept, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRequestAccept {

            interface IRequest {
                contactPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public contactPk: Uint8Array;
                public static create(properties?: berty.types.ContactRequestAccept.IRequest): berty.types.ContactRequestAccept.Request;
                public static encode(message: berty.types.ContactRequestAccept.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestAccept.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestAccept.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestAccept.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestAccept.Request;
                public static toObject(message: berty.types.ContactRequestAccept.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.ContactRequestAccept.IReply): berty.types.ContactRequestAccept.Reply;
                public static encode(message: berty.types.ContactRequestAccept.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestAccept.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestAccept.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestAccept.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestAccept.Reply;
                public static toObject(message: berty.types.ContactRequestAccept.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRequestDiscard {
        }

        class ContactRequestDiscard implements IContactRequestDiscard {

            public static create(properties?: berty.types.IContactRequestDiscard): berty.types.ContactRequestDiscard;
            public static encode(message: berty.types.IContactRequestDiscard, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IContactRequestDiscard, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestDiscard;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestDiscard;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestDiscard;
            public static toObject(message: berty.types.ContactRequestDiscard, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRequestDiscard {

            interface IRequest {
                contactPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public contactPk: Uint8Array;
                public static create(properties?: berty.types.ContactRequestDiscard.IRequest): berty.types.ContactRequestDiscard.Request;
                public static encode(message: berty.types.ContactRequestDiscard.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestDiscard.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestDiscard.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestDiscard.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestDiscard.Request;
                public static toObject(message: berty.types.ContactRequestDiscard.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.ContactRequestDiscard.IReply): berty.types.ContactRequestDiscard.Reply;
                public static encode(message: berty.types.ContactRequestDiscard.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestDiscard.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestDiscard.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestDiscard.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestDiscard.Reply;
                public static toObject(message: berty.types.ContactRequestDiscard.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactBlock {
        }

        class ContactBlock implements IContactBlock {

            public static create(properties?: berty.types.IContactBlock): berty.types.ContactBlock;
            public static encode(message: berty.types.IContactBlock, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IContactBlock, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactBlock;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactBlock;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ContactBlock;
            public static toObject(message: berty.types.ContactBlock, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactBlock {

            interface IRequest {
                contactPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public contactPk: Uint8Array;
                public static create(properties?: berty.types.ContactBlock.IRequest): berty.types.ContactBlock.Request;
                public static encode(message: berty.types.ContactBlock.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactBlock.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactBlock.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactBlock.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactBlock.Request;
                public static toObject(message: berty.types.ContactBlock.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.ContactBlock.IReply): berty.types.ContactBlock.Reply;
                public static encode(message: berty.types.ContactBlock.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactBlock.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactBlock.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactBlock.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactBlock.Reply;
                public static toObject(message: berty.types.ContactBlock.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactUnblock {
        }

        class ContactUnblock implements IContactUnblock {

            public static create(properties?: berty.types.IContactUnblock): berty.types.ContactUnblock;
            public static encode(message: berty.types.IContactUnblock, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IContactUnblock, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactUnblock;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactUnblock;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ContactUnblock;
            public static toObject(message: berty.types.ContactUnblock, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactUnblock {

            interface IRequest {
                contactPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public contactPk: Uint8Array;
                public static create(properties?: berty.types.ContactUnblock.IRequest): berty.types.ContactUnblock.Request;
                public static encode(message: berty.types.ContactUnblock.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactUnblock.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactUnblock.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactUnblock.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactUnblock.Request;
                public static toObject(message: berty.types.ContactUnblock.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.ContactUnblock.IReply): berty.types.ContactUnblock.Reply;
                public static encode(message: berty.types.ContactUnblock.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactUnblock.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactUnblock.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactUnblock.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactUnblock.Reply;
                public static toObject(message: berty.types.ContactUnblock.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactAliasKeySend {
        }

        class ContactAliasKeySend implements IContactAliasKeySend {

            public static create(properties?: berty.types.IContactAliasKeySend): berty.types.ContactAliasKeySend;
            public static encode(message: berty.types.IContactAliasKeySend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IContactAliasKeySend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactAliasKeySend;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactAliasKeySend;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ContactAliasKeySend;
            public static toObject(message: berty.types.ContactAliasKeySend, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactAliasKeySend {

            interface IRequest {
                groupPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public static create(properties?: berty.types.ContactAliasKeySend.IRequest): berty.types.ContactAliasKeySend.Request;
                public static encode(message: berty.types.ContactAliasKeySend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactAliasKeySend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactAliasKeySend.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactAliasKeySend.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactAliasKeySend.Request;
                public static toObject(message: berty.types.ContactAliasKeySend.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.ContactAliasKeySend.IReply): berty.types.ContactAliasKeySend.Reply;
                public static encode(message: berty.types.ContactAliasKeySend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactAliasKeySend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactAliasKeySend.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactAliasKeySend.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactAliasKeySend.Reply;
                public static toObject(message: berty.types.ContactAliasKeySend.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IMultiMemberGroupCreate {
        }

        class MultiMemberGroupCreate implements IMultiMemberGroupCreate {

            public static create(properties?: berty.types.IMultiMemberGroupCreate): berty.types.MultiMemberGroupCreate;
            public static encode(message: berty.types.IMultiMemberGroupCreate, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IMultiMemberGroupCreate, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupCreate;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupCreate;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupCreate;
            public static toObject(message: berty.types.MultiMemberGroupCreate, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MultiMemberGroupCreate {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.types.MultiMemberGroupCreate.IRequest): berty.types.MultiMemberGroupCreate.Request;
                public static encode(message: berty.types.MultiMemberGroupCreate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupCreate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupCreate.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupCreate.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupCreate.Request;
                public static toObject(message: berty.types.MultiMemberGroupCreate.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                groupPk?: (Uint8Array|null);
            }

            class Reply implements IReply {

                public groupPk: Uint8Array;
                public static create(properties?: berty.types.MultiMemberGroupCreate.IReply): berty.types.MultiMemberGroupCreate.Reply;
                public static encode(message: berty.types.MultiMemberGroupCreate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupCreate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupCreate.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupCreate.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupCreate.Reply;
                public static toObject(message: berty.types.MultiMemberGroupCreate.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IMultiMemberGroupJoin {
        }

        class MultiMemberGroupJoin implements IMultiMemberGroupJoin {

            public static create(properties?: berty.types.IMultiMemberGroupJoin): berty.types.MultiMemberGroupJoin;
            public static encode(message: berty.types.IMultiMemberGroupJoin, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IMultiMemberGroupJoin, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupJoin;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupJoin;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupJoin;
            public static toObject(message: berty.types.MultiMemberGroupJoin, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MultiMemberGroupJoin {

            interface IRequest {
                group?: (berty.types.IGroup|null);
            }

            class Request implements IRequest {

                public group?: (berty.types.IGroup|null);
                public static create(properties?: berty.types.MultiMemberGroupJoin.IRequest): berty.types.MultiMemberGroupJoin.Request;
                public static encode(message: berty.types.MultiMemberGroupJoin.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupJoin.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupJoin.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupJoin.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupJoin.Request;
                public static toObject(message: berty.types.MultiMemberGroupJoin.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.MultiMemberGroupJoin.IReply): berty.types.MultiMemberGroupJoin.Reply;
                public static encode(message: berty.types.MultiMemberGroupJoin.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupJoin.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupJoin.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupJoin.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupJoin.Reply;
                public static toObject(message: berty.types.MultiMemberGroupJoin.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IMultiMemberGroupLeave {
        }

        class MultiMemberGroupLeave implements IMultiMemberGroupLeave {

            public static create(properties?: berty.types.IMultiMemberGroupLeave): berty.types.MultiMemberGroupLeave;
            public static encode(message: berty.types.IMultiMemberGroupLeave, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IMultiMemberGroupLeave, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupLeave;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupLeave;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupLeave;
            public static toObject(message: berty.types.MultiMemberGroupLeave, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MultiMemberGroupLeave {

            interface IRequest {
                groupPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public static create(properties?: berty.types.MultiMemberGroupLeave.IRequest): berty.types.MultiMemberGroupLeave.Request;
                public static encode(message: berty.types.MultiMemberGroupLeave.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupLeave.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupLeave.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupLeave.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupLeave.Request;
                public static toObject(message: berty.types.MultiMemberGroupLeave.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.MultiMemberGroupLeave.IReply): berty.types.MultiMemberGroupLeave.Reply;
                public static encode(message: berty.types.MultiMemberGroupLeave.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupLeave.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupLeave.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupLeave.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupLeave.Reply;
                public static toObject(message: berty.types.MultiMemberGroupLeave.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IMultiMemberGroupAliasResolverDisclose {
        }

        class MultiMemberGroupAliasResolverDisclose implements IMultiMemberGroupAliasResolverDisclose {

            public static create(properties?: berty.types.IMultiMemberGroupAliasResolverDisclose): berty.types.MultiMemberGroupAliasResolverDisclose;
            public static encode(message: berty.types.IMultiMemberGroupAliasResolverDisclose, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IMultiMemberGroupAliasResolverDisclose, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupAliasResolverDisclose;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupAliasResolverDisclose;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupAliasResolverDisclose;
            public static toObject(message: berty.types.MultiMemberGroupAliasResolverDisclose, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MultiMemberGroupAliasResolverDisclose {

            interface IRequest {
                groupPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public static create(properties?: berty.types.MultiMemberGroupAliasResolverDisclose.IRequest): berty.types.MultiMemberGroupAliasResolverDisclose.Request;
                public static encode(message: berty.types.MultiMemberGroupAliasResolverDisclose.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupAliasResolverDisclose.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupAliasResolverDisclose.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupAliasResolverDisclose.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupAliasResolverDisclose.Request;
                public static toObject(message: berty.types.MultiMemberGroupAliasResolverDisclose.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.MultiMemberGroupAliasResolverDisclose.IReply): berty.types.MultiMemberGroupAliasResolverDisclose.Reply;
                public static encode(message: berty.types.MultiMemberGroupAliasResolverDisclose.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupAliasResolverDisclose.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupAliasResolverDisclose.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupAliasResolverDisclose.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupAliasResolverDisclose.Reply;
                public static toObject(message: berty.types.MultiMemberGroupAliasResolverDisclose.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IMultiMemberGroupAdminRoleGrant {
        }

        class MultiMemberGroupAdminRoleGrant implements IMultiMemberGroupAdminRoleGrant {

            public static create(properties?: berty.types.IMultiMemberGroupAdminRoleGrant): berty.types.MultiMemberGroupAdminRoleGrant;
            public static encode(message: berty.types.IMultiMemberGroupAdminRoleGrant, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IMultiMemberGroupAdminRoleGrant, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupAdminRoleGrant;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupAdminRoleGrant;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupAdminRoleGrant;
            public static toObject(message: berty.types.MultiMemberGroupAdminRoleGrant, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MultiMemberGroupAdminRoleGrant {

            interface IRequest {
                groupPk?: (Uint8Array|null);
                memberPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public memberPk: Uint8Array;
                public static create(properties?: berty.types.MultiMemberGroupAdminRoleGrant.IRequest): berty.types.MultiMemberGroupAdminRoleGrant.Request;
                public static encode(message: berty.types.MultiMemberGroupAdminRoleGrant.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupAdminRoleGrant.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupAdminRoleGrant.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupAdminRoleGrant.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupAdminRoleGrant.Request;
                public static toObject(message: berty.types.MultiMemberGroupAdminRoleGrant.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.MultiMemberGroupAdminRoleGrant.IReply): berty.types.MultiMemberGroupAdminRoleGrant.Reply;
                public static encode(message: berty.types.MultiMemberGroupAdminRoleGrant.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupAdminRoleGrant.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupAdminRoleGrant.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupAdminRoleGrant.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupAdminRoleGrant.Reply;
                public static toObject(message: berty.types.MultiMemberGroupAdminRoleGrant.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IMultiMemberGroupInvitationCreate {
        }

        class MultiMemberGroupInvitationCreate implements IMultiMemberGroupInvitationCreate {

            public static create(properties?: berty.types.IMultiMemberGroupInvitationCreate): berty.types.MultiMemberGroupInvitationCreate;
            public static encode(message: berty.types.IMultiMemberGroupInvitationCreate, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IMultiMemberGroupInvitationCreate, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupInvitationCreate;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupInvitationCreate;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupInvitationCreate;
            public static toObject(message: berty.types.MultiMemberGroupInvitationCreate, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MultiMemberGroupInvitationCreate {

            interface IRequest {
                groupPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public static create(properties?: berty.types.MultiMemberGroupInvitationCreate.IRequest): berty.types.MultiMemberGroupInvitationCreate.Request;
                public static encode(message: berty.types.MultiMemberGroupInvitationCreate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupInvitationCreate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupInvitationCreate.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupInvitationCreate.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupInvitationCreate.Request;
                public static toObject(message: berty.types.MultiMemberGroupInvitationCreate.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                group?: (berty.types.IGroup|null);
            }

            class Reply implements IReply {

                public group?: (berty.types.IGroup|null);
                public static create(properties?: berty.types.MultiMemberGroupInvitationCreate.IReply): berty.types.MultiMemberGroupInvitationCreate.Reply;
                public static encode(message: berty.types.MultiMemberGroupInvitationCreate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupInvitationCreate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupInvitationCreate.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupInvitationCreate.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupInvitationCreate.Reply;
                public static toObject(message: berty.types.MultiMemberGroupInvitationCreate.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IAppMetadataSend {
        }

        class AppMetadataSend implements IAppMetadataSend {

            public static create(properties?: berty.types.IAppMetadataSend): berty.types.AppMetadataSend;
            public static encode(message: berty.types.IAppMetadataSend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAppMetadataSend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AppMetadataSend;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AppMetadataSend;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AppMetadataSend;
            public static toObject(message: berty.types.AppMetadataSend, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace AppMetadataSend {

            interface IRequest {
                groupPk?: (Uint8Array|null);
                payload?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public payload: Uint8Array;
                public static create(properties?: berty.types.AppMetadataSend.IRequest): berty.types.AppMetadataSend.Request;
                public static encode(message: berty.types.AppMetadataSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.AppMetadataSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AppMetadataSend.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AppMetadataSend.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.AppMetadataSend.Request;
                public static toObject(message: berty.types.AppMetadataSend.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.AppMetadataSend.IReply): berty.types.AppMetadataSend.Reply;
                public static encode(message: berty.types.AppMetadataSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.AppMetadataSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AppMetadataSend.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AppMetadataSend.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.AppMetadataSend.Reply;
                public static toObject(message: berty.types.AppMetadataSend.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IAppMessageSend {
        }

        class AppMessageSend implements IAppMessageSend {

            public static create(properties?: berty.types.IAppMessageSend): berty.types.AppMessageSend;
            public static encode(message: berty.types.IAppMessageSend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAppMessageSend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AppMessageSend;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AppMessageSend;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AppMessageSend;
            public static toObject(message: berty.types.AppMessageSend, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace AppMessageSend {

            interface IRequest {
                groupPk?: (Uint8Array|null);
                payload?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public payload: Uint8Array;
                public static create(properties?: berty.types.AppMessageSend.IRequest): berty.types.AppMessageSend.Request;
                public static encode(message: berty.types.AppMessageSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.AppMessageSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AppMessageSend.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AppMessageSend.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.AppMessageSend.Request;
                public static toObject(message: berty.types.AppMessageSend.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.AppMessageSend.IReply): berty.types.AppMessageSend.Reply;
                public static encode(message: berty.types.AppMessageSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.AppMessageSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AppMessageSend.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AppMessageSend.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.AppMessageSend.Reply;
                public static toObject(message: berty.types.AppMessageSend.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IGroupMetadataEvent {
            eventContext?: (berty.types.IEventContext|null);
            metadata?: (berty.types.IGroupMetadata|null);
            event?: (Uint8Array|null);
        }

        class GroupMetadataEvent implements IGroupMetadataEvent {

            public eventContext?: (berty.types.IEventContext|null);
            public metadata?: (berty.types.IGroupMetadata|null);
            public event: Uint8Array;
            public static create(properties?: berty.types.IGroupMetadataEvent): berty.types.GroupMetadataEvent;
            public static encode(message: berty.types.IGroupMetadataEvent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupMetadataEvent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupMetadataEvent;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupMetadataEvent;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupMetadataEvent;
            public static toObject(message: berty.types.GroupMetadataEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IGroupMessageEvent {
            eventContext?: (berty.types.IEventContext|null);
            headers?: (berty.types.IMessageHeaders|null);
            message?: (Uint8Array|null);
        }

        class GroupMessageEvent implements IGroupMessageEvent {

            public eventContext?: (berty.types.IEventContext|null);
            public headers?: (berty.types.IMessageHeaders|null);
            public message: Uint8Array;
            public static create(properties?: berty.types.IGroupMessageEvent): berty.types.GroupMessageEvent;
            public static encode(message: berty.types.IGroupMessageEvent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupMessageEvent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupMessageEvent;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupMessageEvent;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupMessageEvent;
            public static toObject(message: berty.types.GroupMessageEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IGroupMetadataSubscribe {
        }

        class GroupMetadataSubscribe implements IGroupMetadataSubscribe {

            public static create(properties?: berty.types.IGroupMetadataSubscribe): berty.types.GroupMetadataSubscribe;
            public static encode(message: berty.types.IGroupMetadataSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupMetadataSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupMetadataSubscribe;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupMetadataSubscribe;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupMetadataSubscribe;
            public static toObject(message: berty.types.GroupMetadataSubscribe, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace GroupMetadataSubscribe {

            interface IRequest {
                groupPk?: (Uint8Array|null);
                since?: (Uint8Array|null);
                until?: (Uint8Array|null);
                goBackwards?: (boolean|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public since: Uint8Array;
                public until: Uint8Array;
                public goBackwards: boolean;
                public static create(properties?: berty.types.GroupMetadataSubscribe.IRequest): berty.types.GroupMetadataSubscribe.Request;
                public static encode(message: berty.types.GroupMetadataSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.GroupMetadataSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupMetadataSubscribe.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupMetadataSubscribe.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.GroupMetadataSubscribe.Request;
                public static toObject(message: berty.types.GroupMetadataSubscribe.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IGroupMetadataList {
        }

        class GroupMetadataList implements IGroupMetadataList {

            public static create(properties?: berty.types.IGroupMetadataList): berty.types.GroupMetadataList;
            public static encode(message: berty.types.IGroupMetadataList, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupMetadataList, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupMetadataList;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupMetadataList;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupMetadataList;
            public static toObject(message: berty.types.GroupMetadataList, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace GroupMetadataList {

            interface IRequest {
                groupPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public static create(properties?: berty.types.GroupMetadataList.IRequest): berty.types.GroupMetadataList.Request;
                public static encode(message: berty.types.GroupMetadataList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.GroupMetadataList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupMetadataList.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupMetadataList.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.GroupMetadataList.Request;
                public static toObject(message: berty.types.GroupMetadataList.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IGroupMessageSubscribe {
        }

        class GroupMessageSubscribe implements IGroupMessageSubscribe {

            public static create(properties?: berty.types.IGroupMessageSubscribe): berty.types.GroupMessageSubscribe;
            public static encode(message: berty.types.IGroupMessageSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupMessageSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupMessageSubscribe;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupMessageSubscribe;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupMessageSubscribe;
            public static toObject(message: berty.types.GroupMessageSubscribe, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace GroupMessageSubscribe {

            interface IRequest {
                groupPk?: (Uint8Array|null);
                since?: (Uint8Array|null);
                until?: (Uint8Array|null);
                goBackwards?: (boolean|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public since: Uint8Array;
                public until: Uint8Array;
                public goBackwards: boolean;
                public static create(properties?: berty.types.GroupMessageSubscribe.IRequest): berty.types.GroupMessageSubscribe.Request;
                public static encode(message: berty.types.GroupMessageSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.GroupMessageSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupMessageSubscribe.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupMessageSubscribe.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.GroupMessageSubscribe.Request;
                public static toObject(message: berty.types.GroupMessageSubscribe.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IGroupMessageList {
        }

        class GroupMessageList implements IGroupMessageList {

            public static create(properties?: berty.types.IGroupMessageList): berty.types.GroupMessageList;
            public static encode(message: berty.types.IGroupMessageList, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupMessageList, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupMessageList;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupMessageList;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupMessageList;
            public static toObject(message: berty.types.GroupMessageList, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace GroupMessageList {

            interface IRequest {
                groupPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public static create(properties?: berty.types.GroupMessageList.IRequest): berty.types.GroupMessageList.Request;
                public static encode(message: berty.types.GroupMessageList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.GroupMessageList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupMessageList.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupMessageList.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.GroupMessageList.Request;
                public static toObject(message: berty.types.GroupMessageList.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IGroupInfo {
        }

        class GroupInfo implements IGroupInfo {

            public static create(properties?: berty.types.IGroupInfo): berty.types.GroupInfo;
            public static encode(message: berty.types.IGroupInfo, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupInfo, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupInfo;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupInfo;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupInfo;
            public static toObject(message: berty.types.GroupInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace GroupInfo {

            interface IRequest {
                groupPk?: (Uint8Array|null);
                contactPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public contactPk: Uint8Array;
                public static create(properties?: berty.types.GroupInfo.IRequest): berty.types.GroupInfo.Request;
                public static encode(message: berty.types.GroupInfo.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.GroupInfo.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupInfo.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupInfo.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.GroupInfo.Request;
                public static toObject(message: berty.types.GroupInfo.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                group?: (berty.types.IGroup|null);
                memberPk?: (Uint8Array|null);
                devicePk?: (Uint8Array|null);
            }

            class Reply implements IReply {

                public group?: (berty.types.IGroup|null);
                public memberPk: Uint8Array;
                public devicePk: Uint8Array;
                public static create(properties?: berty.types.GroupInfo.IReply): berty.types.GroupInfo.Reply;
                public static encode(message: berty.types.GroupInfo.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.GroupInfo.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupInfo.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupInfo.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.GroupInfo.Reply;
                public static toObject(message: berty.types.GroupInfo.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IActivateGroup {
        }

        class ActivateGroup implements IActivateGroup {

            public static create(properties?: berty.types.IActivateGroup): berty.types.ActivateGroup;
            public static encode(message: berty.types.IActivateGroup, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IActivateGroup, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ActivateGroup;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ActivateGroup;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ActivateGroup;
            public static toObject(message: berty.types.ActivateGroup, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ActivateGroup {

            interface IRequest {
                groupPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public static create(properties?: berty.types.ActivateGroup.IRequest): berty.types.ActivateGroup.Request;
                public static encode(message: berty.types.ActivateGroup.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ActivateGroup.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ActivateGroup.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ActivateGroup.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ActivateGroup.Request;
                public static toObject(message: berty.types.ActivateGroup.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.ActivateGroup.IReply): berty.types.ActivateGroup.Reply;
                public static encode(message: berty.types.ActivateGroup.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ActivateGroup.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ActivateGroup.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ActivateGroup.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ActivateGroup.Reply;
                public static toObject(message: berty.types.ActivateGroup.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IDeactivateGroup {
        }

        class DeactivateGroup implements IDeactivateGroup {

            public static create(properties?: berty.types.IDeactivateGroup): berty.types.DeactivateGroup;
            public static encode(message: berty.types.IDeactivateGroup, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IDeactivateGroup, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.DeactivateGroup;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.DeactivateGroup;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.DeactivateGroup;
            public static toObject(message: berty.types.DeactivateGroup, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace DeactivateGroup {

            interface IRequest {
                groupPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public static create(properties?: berty.types.DeactivateGroup.IRequest): berty.types.DeactivateGroup.Request;
                public static encode(message: berty.types.DeactivateGroup.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.DeactivateGroup.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.DeactivateGroup.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.DeactivateGroup.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.DeactivateGroup.Request;
                public static toObject(message: berty.types.DeactivateGroup.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.DeactivateGroup.IReply): berty.types.DeactivateGroup.Reply;
                public static encode(message: berty.types.DeactivateGroup.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.DeactivateGroup.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.DeactivateGroup.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.DeactivateGroup.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.DeactivateGroup.Reply;
                public static toObject(message: berty.types.DeactivateGroup.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IDebugListGroups {
        }

        class DebugListGroups implements IDebugListGroups {

            public static create(properties?: berty.types.IDebugListGroups): berty.types.DebugListGroups;
            public static encode(message: berty.types.IDebugListGroups, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IDebugListGroups, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.DebugListGroups;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.DebugListGroups;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.DebugListGroups;
            public static toObject(message: berty.types.DebugListGroups, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace DebugListGroups {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.types.DebugListGroups.IRequest): berty.types.DebugListGroups.Request;
                public static encode(message: berty.types.DebugListGroups.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.DebugListGroups.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.DebugListGroups.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.DebugListGroups.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.DebugListGroups.Request;
                public static toObject(message: berty.types.DebugListGroups.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                groupPk?: (Uint8Array|null);
                groupType?: (berty.types.GroupType|null);
                contactPk?: (Uint8Array|null);
            }

            class Reply implements IReply {

                public groupPk: Uint8Array;
                public groupType: berty.types.GroupType;
                public contactPk: Uint8Array;
                public static create(properties?: berty.types.DebugListGroups.IReply): berty.types.DebugListGroups.Reply;
                public static encode(message: berty.types.DebugListGroups.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.DebugListGroups.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.DebugListGroups.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.DebugListGroups.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.DebugListGroups.Reply;
                public static toObject(message: berty.types.DebugListGroups.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IDebugInspectGroupStore {
        }

        class DebugInspectGroupStore implements IDebugInspectGroupStore {

            public static create(properties?: berty.types.IDebugInspectGroupStore): berty.types.DebugInspectGroupStore;
            public static encode(message: berty.types.IDebugInspectGroupStore, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IDebugInspectGroupStore, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.DebugInspectGroupStore;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.DebugInspectGroupStore;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.DebugInspectGroupStore;
            public static toObject(message: berty.types.DebugInspectGroupStore, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace DebugInspectGroupStore {

            interface IRequest {
                groupPk?: (Uint8Array|null);
                logType?: (berty.types.DebugInspectGroupLogType|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public logType: berty.types.DebugInspectGroupLogType;
                public static create(properties?: berty.types.DebugInspectGroupStore.IRequest): berty.types.DebugInspectGroupStore.Request;
                public static encode(message: berty.types.DebugInspectGroupStore.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.DebugInspectGroupStore.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.DebugInspectGroupStore.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.DebugInspectGroupStore.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.DebugInspectGroupStore.Request;
                public static toObject(message: berty.types.DebugInspectGroupStore.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                cid?: (Uint8Array|null);
                parentCids?: (Uint8Array[]|null);
                metadataEventType?: (berty.types.EventType|null);
                devicePk?: (Uint8Array|null);
                payload?: (Uint8Array|null);
            }

            class Reply implements IReply {

                public cid: Uint8Array;
                public parentCids: Uint8Array[];
                public metadataEventType: berty.types.EventType;
                public devicePk: Uint8Array;
                public payload: Uint8Array;
                public static create(properties?: berty.types.DebugInspectGroupStore.IReply): berty.types.DebugInspectGroupStore.Reply;
                public static encode(message: berty.types.DebugInspectGroupStore.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.DebugInspectGroupStore.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.DebugInspectGroupStore.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.DebugInspectGroupStore.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.DebugInspectGroupStore.Reply;
                public static toObject(message: berty.types.DebugInspectGroupStore.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        enum DebugInspectGroupLogType {
            DebugInspectGroupLogTypeUndefined = 0,
            DebugInspectGroupLogTypeMessage = 1,
            DebugInspectGroupLogTypeMetadata = 2
        }

        enum ContactState {
            ContactStateUndefined = 0,
            ContactStateToRequest = 1,
            ContactStateReceived = 2,
            ContactStateAdded = 3,
            ContactStateRemoved = 4,
            ContactStateDiscarded = 5,
            ContactStateBlocked = 6
        }

        interface IShareableContact {
            pk?: (Uint8Array|null);
            publicRendezvousSeed?: (Uint8Array|null);
            metadata?: (Uint8Array|null);
        }

        class ShareableContact implements IShareableContact {

            public pk: Uint8Array;
            public publicRendezvousSeed: Uint8Array;
            public metadata: Uint8Array;
            public static create(properties?: berty.types.IShareableContact): berty.types.ShareableContact;
            public static encode(message: berty.types.IShareableContact, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IShareableContact, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ShareableContact;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ShareableContact;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ShareableContact;
            public static toObject(message: berty.types.ShareableContact, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }
    }

    namespace messenger {

        class MessengerService extends $protobuf.rpc.Service {

            public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): MessengerService;
            public instanceShareableBertyID(request: berty.messenger.InstanceShareableBertyID.IRequest, callback: berty.messenger.MessengerService.InstanceShareableBertyIDCallback): void;
            public instanceShareableBertyID(request: berty.messenger.InstanceShareableBertyID.IRequest): Promise<berty.messenger.InstanceShareableBertyID.Reply>;
            public devShareInstanceBertyID(request: berty.messenger.DevShareInstanceBertyID.IRequest, callback: berty.messenger.MessengerService.DevShareInstanceBertyIDCallback): void;
            public devShareInstanceBertyID(request: berty.messenger.DevShareInstanceBertyID.IRequest): Promise<berty.messenger.DevShareInstanceBertyID.Reply>;
            public parseDeepLink(request: berty.messenger.ParseDeepLink.IRequest, callback: berty.messenger.MessengerService.ParseDeepLinkCallback): void;
            public parseDeepLink(request: berty.messenger.ParseDeepLink.IRequest): Promise<berty.messenger.ParseDeepLink.Reply>;
            public sendContactRequest(request: berty.messenger.SendContactRequest.IRequest, callback: berty.messenger.MessengerService.SendContactRequestCallback): void;
            public sendContactRequest(request: berty.messenger.SendContactRequest.IRequest): Promise<berty.messenger.SendContactRequest.Reply>;
        }

        namespace MessengerService {

            type InstanceShareableBertyIDCallback = (error: (Error|null), response?: berty.messenger.InstanceShareableBertyID.Reply) => void;

            type DevShareInstanceBertyIDCallback = (error: (Error|null), response?: berty.messenger.DevShareInstanceBertyID.Reply) => void;

            type ParseDeepLinkCallback = (error: (Error|null), response?: berty.messenger.ParseDeepLink.Reply) => void;

            type SendContactRequestCallback = (error: (Error|null), response?: berty.messenger.SendContactRequest.Reply) => void;
        }

        interface IInstanceShareableBertyID {
        }

        class InstanceShareableBertyID implements IInstanceShareableBertyID {

            public static create(properties?: berty.messenger.IInstanceShareableBertyID): berty.messenger.InstanceShareableBertyID;
            public static encode(message: berty.messenger.IInstanceShareableBertyID, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.messenger.IInstanceShareableBertyID, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.InstanceShareableBertyID;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.InstanceShareableBertyID;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.messenger.InstanceShareableBertyID;
            public static toObject(message: berty.messenger.InstanceShareableBertyID, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace InstanceShareableBertyID {

            interface IRequest {
                reset?: (boolean|null);
                displayName?: (string|null);
            }

            class Request implements IRequest {

                public reset: boolean;
                public displayName: string;
                public static create(properties?: berty.messenger.InstanceShareableBertyID.IRequest): berty.messenger.InstanceShareableBertyID.Request;
                public static encode(message: berty.messenger.InstanceShareableBertyID.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.InstanceShareableBertyID.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.InstanceShareableBertyID.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.InstanceShareableBertyID.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.InstanceShareableBertyID.Request;
                public static toObject(message: berty.messenger.InstanceShareableBertyID.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                bertyId?: (berty.messenger.IBertyID|null);
                bertyIdPayload?: (string|null);
                deepLink?: (string|null);
                htmlUrl?: (string|null);
            }

            class Reply implements IReply {

                public bertyId?: (berty.messenger.IBertyID|null);
                public bertyIdPayload: string;
                public deepLink: string;
                public htmlUrl: string;
                public static create(properties?: berty.messenger.InstanceShareableBertyID.IReply): berty.messenger.InstanceShareableBertyID.Reply;
                public static encode(message: berty.messenger.InstanceShareableBertyID.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.InstanceShareableBertyID.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.InstanceShareableBertyID.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.InstanceShareableBertyID.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.InstanceShareableBertyID.Reply;
                public static toObject(message: berty.messenger.InstanceShareableBertyID.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IDevShareInstanceBertyID {
        }

        class DevShareInstanceBertyID implements IDevShareInstanceBertyID {

            public static create(properties?: berty.messenger.IDevShareInstanceBertyID): berty.messenger.DevShareInstanceBertyID;
            public static encode(message: berty.messenger.IDevShareInstanceBertyID, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.messenger.IDevShareInstanceBertyID, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.DevShareInstanceBertyID;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.DevShareInstanceBertyID;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.messenger.DevShareInstanceBertyID;
            public static toObject(message: berty.messenger.DevShareInstanceBertyID, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace DevShareInstanceBertyID {

            interface IRequest {
                reset?: (boolean|null);
                displayName?: (string|null);
            }

            class Request implements IRequest {

                public reset: boolean;
                public displayName: string;
                public static create(properties?: berty.messenger.DevShareInstanceBertyID.IRequest): berty.messenger.DevShareInstanceBertyID.Request;
                public static encode(message: berty.messenger.DevShareInstanceBertyID.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.DevShareInstanceBertyID.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.DevShareInstanceBertyID.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.DevShareInstanceBertyID.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.DevShareInstanceBertyID.Request;
                public static toObject(message: berty.messenger.DevShareInstanceBertyID.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.messenger.DevShareInstanceBertyID.IReply): berty.messenger.DevShareInstanceBertyID.Reply;
                public static encode(message: berty.messenger.DevShareInstanceBertyID.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.DevShareInstanceBertyID.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.DevShareInstanceBertyID.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.DevShareInstanceBertyID.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.DevShareInstanceBertyID.Reply;
                public static toObject(message: berty.messenger.DevShareInstanceBertyID.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IParseDeepLink {
        }

        class ParseDeepLink implements IParseDeepLink {

            public static create(properties?: berty.messenger.IParseDeepLink): berty.messenger.ParseDeepLink;
            public static encode(message: berty.messenger.IParseDeepLink, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.messenger.IParseDeepLink, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.ParseDeepLink;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.ParseDeepLink;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.messenger.ParseDeepLink;
            public static toObject(message: berty.messenger.ParseDeepLink, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ParseDeepLink {

            interface IRequest {
                link?: (string|null);
            }

            class Request implements IRequest {

                public link: string;
                public static create(properties?: berty.messenger.ParseDeepLink.IRequest): berty.messenger.ParseDeepLink.Request;
                public static encode(message: berty.messenger.ParseDeepLink.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.ParseDeepLink.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.ParseDeepLink.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.ParseDeepLink.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.ParseDeepLink.Request;
                public static toObject(message: berty.messenger.ParseDeepLink.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                kind?: (berty.messenger.ParseDeepLink.Kind|null);
                bertyId?: (berty.messenger.IBertyID|null);
            }

            class Reply implements IReply {

                public kind: berty.messenger.ParseDeepLink.Kind;
                public bertyId?: (berty.messenger.IBertyID|null);
                public static create(properties?: berty.messenger.ParseDeepLink.IReply): berty.messenger.ParseDeepLink.Reply;
                public static encode(message: berty.messenger.ParseDeepLink.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.ParseDeepLink.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.ParseDeepLink.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.ParseDeepLink.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.ParseDeepLink.Reply;
                public static toObject(message: berty.messenger.ParseDeepLink.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            enum Kind {
                UnknownKind = 0,
                BertyID = 1
            }
        }

        interface ISendContactRequest {
        }

        class SendContactRequest implements ISendContactRequest {

            public static create(properties?: berty.messenger.ISendContactRequest): berty.messenger.SendContactRequest;
            public static encode(message: berty.messenger.ISendContactRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.messenger.ISendContactRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.SendContactRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.SendContactRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.messenger.SendContactRequest;
            public static toObject(message: berty.messenger.SendContactRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace SendContactRequest {

            interface IRequest {
                bertyId?: (berty.messenger.IBertyID|null);
                metadata?: (Uint8Array|null);
                ownMetadata?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public bertyId?: (berty.messenger.IBertyID|null);
                public metadata: Uint8Array;
                public ownMetadata: Uint8Array;
                public static create(properties?: berty.messenger.SendContactRequest.IRequest): berty.messenger.SendContactRequest.Request;
                public static encode(message: berty.messenger.SendContactRequest.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.SendContactRequest.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.SendContactRequest.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.SendContactRequest.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.SendContactRequest.Request;
                public static toObject(message: berty.messenger.SendContactRequest.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.messenger.SendContactRequest.IReply): berty.messenger.SendContactRequest.Reply;
                public static encode(message: berty.messenger.SendContactRequest.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.SendContactRequest.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.SendContactRequest.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.SendContactRequest.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.SendContactRequest.Reply;
                public static toObject(message: berty.messenger.SendContactRequest.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IBertyID {
            publicRendezvousSeed?: (Uint8Array|null);
            accountPk?: (Uint8Array|null);
            displayName?: (string|null);
        }

        class BertyID implements IBertyID {

            public publicRendezvousSeed: Uint8Array;
            public accountPk: Uint8Array;
            public displayName: string;
            public static create(properties?: berty.messenger.IBertyID): berty.messenger.BertyID;
            public static encode(message: berty.messenger.IBertyID, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.messenger.IBertyID, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.BertyID;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.BertyID;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.messenger.BertyID;
            public static toObject(message: berty.messenger.BertyID, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        enum AppMessageType {
            Undefined = 0,
            UserMessage = 1,
            UserReaction = 2,
            GroupInvitation = 3,
            SetGroupName = 4,
            Acknowledge = 5
        }

        interface IAppMessageTyped {
            type?: (berty.messenger.AppMessageType|null);
        }

        class AppMessageTyped implements IAppMessageTyped {

            public type: berty.messenger.AppMessageType;
            public static create(properties?: berty.messenger.IAppMessageTyped): berty.messenger.AppMessageTyped;
            public static encode(message: berty.messenger.IAppMessageTyped, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.messenger.IAppMessageTyped, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.AppMessageTyped;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.AppMessageTyped;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.messenger.AppMessageTyped;
            public static toObject(message: berty.messenger.AppMessageTyped, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IUserMessageAttachment {
            type?: (berty.messenger.AppMessageType|null);
            uri?: (string|null);
        }

        class UserMessageAttachment implements IUserMessageAttachment {

            public type: berty.messenger.AppMessageType;
            public uri: string;
            public static create(properties?: berty.messenger.IUserMessageAttachment): berty.messenger.UserMessageAttachment;
            public static encode(message: berty.messenger.IUserMessageAttachment, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.messenger.IUserMessageAttachment, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.UserMessageAttachment;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.UserMessageAttachment;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.messenger.UserMessageAttachment;
            public static toObject(message: berty.messenger.UserMessageAttachment, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IPayloadUserMessage {
            type?: (berty.messenger.AppMessageType|null);
            body?: (string|null);
            attachments?: (berty.messenger.IUserMessageAttachment[]|null);
            sentDate?: (number|Long|null);
        }

        class PayloadUserMessage implements IPayloadUserMessage {

            public type: berty.messenger.AppMessageType;
            public body: string;
            public attachments: berty.messenger.IUserMessageAttachment[];
            public sentDate: (number|Long);
            public static create(properties?: berty.messenger.IPayloadUserMessage): berty.messenger.PayloadUserMessage;
            public static encode(message: berty.messenger.IPayloadUserMessage, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.messenger.IPayloadUserMessage, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.PayloadUserMessage;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.PayloadUserMessage;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.messenger.PayloadUserMessage;
            public static toObject(message: berty.messenger.PayloadUserMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IPayloadUserReaction {
            type?: (berty.messenger.AppMessageType|null);
            emoji?: (string|null);
        }

        class PayloadUserReaction implements IPayloadUserReaction {

            public type: berty.messenger.AppMessageType;
            public emoji: string;
            public static create(properties?: berty.messenger.IPayloadUserReaction): berty.messenger.PayloadUserReaction;
            public static encode(message: berty.messenger.IPayloadUserReaction, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.messenger.IPayloadUserReaction, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.PayloadUserReaction;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.PayloadUserReaction;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.messenger.PayloadUserReaction;
            public static toObject(message: berty.messenger.PayloadUserReaction, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IPayloadGroupInvitation {
            type?: (berty.messenger.AppMessageType|null);
            groupPk?: (string|null);
        }

        class PayloadGroupInvitation implements IPayloadGroupInvitation {

            public type: berty.messenger.AppMessageType;
            public groupPk: string;
            public static create(properties?: berty.messenger.IPayloadGroupInvitation): berty.messenger.PayloadGroupInvitation;
            public static encode(message: berty.messenger.IPayloadGroupInvitation, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.messenger.IPayloadGroupInvitation, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.PayloadGroupInvitation;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.PayloadGroupInvitation;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.messenger.PayloadGroupInvitation;
            public static toObject(message: berty.messenger.PayloadGroupInvitation, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IPayloadSetGroupName {
            type?: (berty.messenger.AppMessageType|null);
            name?: (string|null);
        }

        class PayloadSetGroupName implements IPayloadSetGroupName {

            public type: berty.messenger.AppMessageType;
            public name: string;
            public static create(properties?: berty.messenger.IPayloadSetGroupName): berty.messenger.PayloadSetGroupName;
            public static encode(message: berty.messenger.IPayloadSetGroupName, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.messenger.IPayloadSetGroupName, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.PayloadSetGroupName;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.PayloadSetGroupName;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.messenger.PayloadSetGroupName;
            public static toObject(message: berty.messenger.PayloadSetGroupName, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IPayloadAcknowledge {
            type?: (berty.messenger.AppMessageType|null);
            target?: (string|null);
        }

        class PayloadAcknowledge implements IPayloadAcknowledge {

            public type: berty.messenger.AppMessageType;
            public target: string;
            public static create(properties?: berty.messenger.IPayloadAcknowledge): berty.messenger.PayloadAcknowledge;
            public static encode(message: berty.messenger.IPayloadAcknowledge, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.messenger.IPayloadAcknowledge, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.PayloadAcknowledge;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.PayloadAcknowledge;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.messenger.PayloadAcknowledge;
            public static toObject(message: berty.messenger.PayloadAcknowledge, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }
    }
}

export namespace google {

    namespace protobuf {

        interface IFileDescriptorSet {
            file?: (google.protobuf.IFileDescriptorProto[]|null);
        }

        class FileDescriptorSet implements IFileDescriptorSet {

            public file: google.protobuf.IFileDescriptorProto[];
            public static create(properties?: google.protobuf.IFileDescriptorSet): google.protobuf.FileDescriptorSet;
            public static encode(message: google.protobuf.IFileDescriptorSet, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IFileDescriptorSet, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FileDescriptorSet;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FileDescriptorSet;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.FileDescriptorSet;
            public static toObject(message: google.protobuf.FileDescriptorSet, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IFileDescriptorProto {
            name?: (string|null);
            "package"?: (string|null);
            dependency?: (string[]|null);
            publicDependency?: (number[]|null);
            weakDependency?: (number[]|null);
            messageType?: (google.protobuf.IDescriptorProto[]|null);
            enumType?: (google.protobuf.IEnumDescriptorProto[]|null);
            service?: (google.protobuf.IServiceDescriptorProto[]|null);
            extension?: (google.protobuf.IFieldDescriptorProto[]|null);
            options?: (google.protobuf.IFileOptions|null);
            sourceCodeInfo?: (google.protobuf.ISourceCodeInfo|null);
            syntax?: (string|null);
        }

        class FileDescriptorProto implements IFileDescriptorProto {

            public name: string;
            public package: string;
            public dependency: string[];
            public publicDependency: number[];
            public weakDependency: number[];
            public messageType: google.protobuf.IDescriptorProto[];
            public enumType: google.protobuf.IEnumDescriptorProto[];
            public service: google.protobuf.IServiceDescriptorProto[];
            public extension: google.protobuf.IFieldDescriptorProto[];
            public options?: (google.protobuf.IFileOptions|null);
            public sourceCodeInfo?: (google.protobuf.ISourceCodeInfo|null);
            public syntax: string;
            public static create(properties?: google.protobuf.IFileDescriptorProto): google.protobuf.FileDescriptorProto;
            public static encode(message: google.protobuf.IFileDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IFileDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FileDescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FileDescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.FileDescriptorProto;
            public static toObject(message: google.protobuf.FileDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IDescriptorProto {
            name?: (string|null);
            field?: (google.protobuf.IFieldDescriptorProto[]|null);
            extension?: (google.protobuf.IFieldDescriptorProto[]|null);
            nestedType?: (google.protobuf.IDescriptorProto[]|null);
            enumType?: (google.protobuf.IEnumDescriptorProto[]|null);
            extensionRange?: (google.protobuf.DescriptorProto.IExtensionRange[]|null);
            oneofDecl?: (google.protobuf.IOneofDescriptorProto[]|null);
            options?: (google.protobuf.IMessageOptions|null);
            reservedRange?: (google.protobuf.DescriptorProto.IReservedRange[]|null);
            reservedName?: (string[]|null);
        }

        class DescriptorProto implements IDescriptorProto {

            public name: string;
            public field: google.protobuf.IFieldDescriptorProto[];
            public extension: google.protobuf.IFieldDescriptorProto[];
            public nestedType: google.protobuf.IDescriptorProto[];
            public enumType: google.protobuf.IEnumDescriptorProto[];
            public extensionRange: google.protobuf.DescriptorProto.IExtensionRange[];
            public oneofDecl: google.protobuf.IOneofDescriptorProto[];
            public options?: (google.protobuf.IMessageOptions|null);
            public reservedRange: google.protobuf.DescriptorProto.IReservedRange[];
            public reservedName: string[];
            public static create(properties?: google.protobuf.IDescriptorProto): google.protobuf.DescriptorProto;
            public static encode(message: google.protobuf.IDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.DescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.DescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.DescriptorProto;
            public static toObject(message: google.protobuf.DescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace DescriptorProto {

            interface IExtensionRange {
                start?: (number|null);
                end?: (number|null);
                options?: (google.protobuf.IExtensionRangeOptions|null);
            }

            class ExtensionRange implements IExtensionRange {

                public start: number;
                public end: number;
                public options?: (google.protobuf.IExtensionRangeOptions|null);
                public static create(properties?: google.protobuf.DescriptorProto.IExtensionRange): google.protobuf.DescriptorProto.ExtensionRange;
                public static encode(message: google.protobuf.DescriptorProto.IExtensionRange, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: google.protobuf.DescriptorProto.IExtensionRange, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.DescriptorProto.ExtensionRange;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.DescriptorProto.ExtensionRange;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): google.protobuf.DescriptorProto.ExtensionRange;
                public static toObject(message: google.protobuf.DescriptorProto.ExtensionRange, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReservedRange {
                start?: (number|null);
                end?: (number|null);
            }

            class ReservedRange implements IReservedRange {

                public start: number;
                public end: number;
                public static create(properties?: google.protobuf.DescriptorProto.IReservedRange): google.protobuf.DescriptorProto.ReservedRange;
                public static encode(message: google.protobuf.DescriptorProto.IReservedRange, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: google.protobuf.DescriptorProto.IReservedRange, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.DescriptorProto.ReservedRange;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.DescriptorProto.ReservedRange;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): google.protobuf.DescriptorProto.ReservedRange;
                public static toObject(message: google.protobuf.DescriptorProto.ReservedRange, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IExtensionRangeOptions {
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
        }

        class ExtensionRangeOptions implements IExtensionRangeOptions {

            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IExtensionRangeOptions): google.protobuf.ExtensionRangeOptions;
            public static encode(message: google.protobuf.IExtensionRangeOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IExtensionRangeOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.ExtensionRangeOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.ExtensionRangeOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.ExtensionRangeOptions;
            public static toObject(message: google.protobuf.ExtensionRangeOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IFieldDescriptorProto {
            name?: (string|null);
            number?: (number|null);
            label?: (google.protobuf.FieldDescriptorProto.Label|null);
            type?: (google.protobuf.FieldDescriptorProto.Type|null);
            typeName?: (string|null);
            extendee?: (string|null);
            defaultValue?: (string|null);
            oneofIndex?: (number|null);
            jsonName?: (string|null);
            options?: (google.protobuf.IFieldOptions|null);
        }

        class FieldDescriptorProto implements IFieldDescriptorProto {

            public name: string;
            public number: number;
            public label: google.protobuf.FieldDescriptorProto.Label;
            public type: google.protobuf.FieldDescriptorProto.Type;
            public typeName: string;
            public extendee: string;
            public defaultValue: string;
            public oneofIndex: number;
            public jsonName: string;
            public options?: (google.protobuf.IFieldOptions|null);
            public static create(properties?: google.protobuf.IFieldDescriptorProto): google.protobuf.FieldDescriptorProto;
            public static encode(message: google.protobuf.IFieldDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IFieldDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FieldDescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FieldDescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.FieldDescriptorProto;
            public static toObject(message: google.protobuf.FieldDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace FieldDescriptorProto {

            enum Type {
                TYPE_DOUBLE = 1,
                TYPE_FLOAT = 2,
                TYPE_INT64 = 3,
                TYPE_UINT64 = 4,
                TYPE_INT32 = 5,
                TYPE_FIXED64 = 6,
                TYPE_FIXED32 = 7,
                TYPE_BOOL = 8,
                TYPE_STRING = 9,
                TYPE_GROUP = 10,
                TYPE_MESSAGE = 11,
                TYPE_BYTES = 12,
                TYPE_UINT32 = 13,
                TYPE_ENUM = 14,
                TYPE_SFIXED32 = 15,
                TYPE_SFIXED64 = 16,
                TYPE_SINT32 = 17,
                TYPE_SINT64 = 18
            }

            enum Label {
                LABEL_OPTIONAL = 1,
                LABEL_REQUIRED = 2,
                LABEL_REPEATED = 3
            }
        }

        interface IOneofDescriptorProto {
            name?: (string|null);
            options?: (google.protobuf.IOneofOptions|null);
        }

        class OneofDescriptorProto implements IOneofDescriptorProto {

            public name: string;
            public options?: (google.protobuf.IOneofOptions|null);
            public static create(properties?: google.protobuf.IOneofDescriptorProto): google.protobuf.OneofDescriptorProto;
            public static encode(message: google.protobuf.IOneofDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IOneofDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.OneofDescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.OneofDescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.OneofDescriptorProto;
            public static toObject(message: google.protobuf.OneofDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IEnumDescriptorProto {
            name?: (string|null);
            value?: (google.protobuf.IEnumValueDescriptorProto[]|null);
            options?: (google.protobuf.IEnumOptions|null);
            reservedRange?: (google.protobuf.EnumDescriptorProto.IEnumReservedRange[]|null);
            reservedName?: (string[]|null);
        }

        class EnumDescriptorProto implements IEnumDescriptorProto {

            public name: string;
            public value: google.protobuf.IEnumValueDescriptorProto[];
            public options?: (google.protobuf.IEnumOptions|null);
            public reservedRange: google.protobuf.EnumDescriptorProto.IEnumReservedRange[];
            public reservedName: string[];
            public static create(properties?: google.protobuf.IEnumDescriptorProto): google.protobuf.EnumDescriptorProto;
            public static encode(message: google.protobuf.IEnumDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IEnumDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumDescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumDescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumDescriptorProto;
            public static toObject(message: google.protobuf.EnumDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace EnumDescriptorProto {

            interface IEnumReservedRange {
                start?: (number|null);
                end?: (number|null);
            }

            class EnumReservedRange implements IEnumReservedRange {

                public start: number;
                public end: number;
                public static create(properties?: google.protobuf.EnumDescriptorProto.IEnumReservedRange): google.protobuf.EnumDescriptorProto.EnumReservedRange;
                public static encode(message: google.protobuf.EnumDescriptorProto.IEnumReservedRange, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: google.protobuf.EnumDescriptorProto.IEnumReservedRange, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumDescriptorProto.EnumReservedRange;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumDescriptorProto.EnumReservedRange;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): google.protobuf.EnumDescriptorProto.EnumReservedRange;
                public static toObject(message: google.protobuf.EnumDescriptorProto.EnumReservedRange, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IEnumValueDescriptorProto {
            name?: (string|null);
            number?: (number|null);
            options?: (google.protobuf.IEnumValueOptions|null);
        }

        class EnumValueDescriptorProto implements IEnumValueDescriptorProto {

            public name: string;
            public number: number;
            public options?: (google.protobuf.IEnumValueOptions|null);
            public static create(properties?: google.protobuf.IEnumValueDescriptorProto): google.protobuf.EnumValueDescriptorProto;
            public static encode(message: google.protobuf.IEnumValueDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IEnumValueDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumValueDescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumValueDescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumValueDescriptorProto;
            public static toObject(message: google.protobuf.EnumValueDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IServiceDescriptorProto {
            name?: (string|null);
            method?: (google.protobuf.IMethodDescriptorProto[]|null);
            options?: (google.protobuf.IServiceOptions|null);
        }

        class ServiceDescriptorProto implements IServiceDescriptorProto {

            public name: string;
            public method: google.protobuf.IMethodDescriptorProto[];
            public options?: (google.protobuf.IServiceOptions|null);
            public static create(properties?: google.protobuf.IServiceDescriptorProto): google.protobuf.ServiceDescriptorProto;
            public static encode(message: google.protobuf.IServiceDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IServiceDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.ServiceDescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.ServiceDescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.ServiceDescriptorProto;
            public static toObject(message: google.protobuf.ServiceDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMethodDescriptorProto {
            name?: (string|null);
            inputType?: (string|null);
            outputType?: (string|null);
            options?: (google.protobuf.IMethodOptions|null);
            clientStreaming?: (boolean|null);
            serverStreaming?: (boolean|null);
        }

        class MethodDescriptorProto implements IMethodDescriptorProto {

            public name: string;
            public inputType: string;
            public outputType: string;
            public options?: (google.protobuf.IMethodOptions|null);
            public clientStreaming: boolean;
            public serverStreaming: boolean;
            public static create(properties?: google.protobuf.IMethodDescriptorProto): google.protobuf.MethodDescriptorProto;
            public static encode(message: google.protobuf.IMethodDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IMethodDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.MethodDescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.MethodDescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.MethodDescriptorProto;
            public static toObject(message: google.protobuf.MethodDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IFileOptions {
            javaPackage?: (string|null);
            javaOuterClassname?: (string|null);
            javaMultipleFiles?: (boolean|null);
            javaGenerateEqualsAndHash?: (boolean|null);
            javaStringCheckUtf8?: (boolean|null);
            optimizeFor?: (google.protobuf.FileOptions.OptimizeMode|null);
            goPackage?: (string|null);
            ccGenericServices?: (boolean|null);
            javaGenericServices?: (boolean|null);
            pyGenericServices?: (boolean|null);
            phpGenericServices?: (boolean|null);
            deprecated?: (boolean|null);
            ccEnableArenas?: (boolean|null);
            objcClassPrefix?: (string|null);
            csharpNamespace?: (string|null);
            swiftPrefix?: (string|null);
            phpClassPrefix?: (string|null);
            phpNamespace?: (string|null);
            phpMetadataNamespace?: (string|null);
            rubyPackage?: (string|null);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
            ".gogoproto.goprotoGettersAll"?: (boolean|null);
            ".gogoproto.goprotoEnumPrefixAll"?: (boolean|null);
            ".gogoproto.goprotoStringerAll"?: (boolean|null);
            ".gogoproto.verboseEqualAll"?: (boolean|null);
            ".gogoproto.faceAll"?: (boolean|null);
            ".gogoproto.gostringAll"?: (boolean|null);
            ".gogoproto.populateAll"?: (boolean|null);
            ".gogoproto.stringerAll"?: (boolean|null);
            ".gogoproto.onlyoneAll"?: (boolean|null);
            ".gogoproto.equalAll"?: (boolean|null);
            ".gogoproto.descriptionAll"?: (boolean|null);
            ".gogoproto.testgenAll"?: (boolean|null);
            ".gogoproto.benchgenAll"?: (boolean|null);
            ".gogoproto.marshalerAll"?: (boolean|null);
            ".gogoproto.unmarshalerAll"?: (boolean|null);
            ".gogoproto.stableMarshalerAll"?: (boolean|null);
            ".gogoproto.sizerAll"?: (boolean|null);
            ".gogoproto.goprotoEnumStringerAll"?: (boolean|null);
            ".gogoproto.enumStringerAll"?: (boolean|null);
            ".gogoproto.unsafeMarshalerAll"?: (boolean|null);
            ".gogoproto.unsafeUnmarshalerAll"?: (boolean|null);
            ".gogoproto.goprotoExtensionsMapAll"?: (boolean|null);
            ".gogoproto.goprotoUnrecognizedAll"?: (boolean|null);
            ".gogoproto.gogoprotoImport"?: (boolean|null);
            ".gogoproto.protosizerAll"?: (boolean|null);
            ".gogoproto.compareAll"?: (boolean|null);
            ".gogoproto.typedeclAll"?: (boolean|null);
            ".gogoproto.enumdeclAll"?: (boolean|null);
            ".gogoproto.goprotoRegistration"?: (boolean|null);
            ".gogoproto.messagenameAll"?: (boolean|null);
            ".gogoproto.goprotoSizecacheAll"?: (boolean|null);
            ".gogoproto.goprotoUnkeyedAll"?: (boolean|null);
        }

        class FileOptions implements IFileOptions {

            public javaPackage: string;
            public javaOuterClassname: string;
            public javaMultipleFiles: boolean;
            public javaGenerateEqualsAndHash: boolean;
            public javaStringCheckUtf8: boolean;
            public optimizeFor: google.protobuf.FileOptions.OptimizeMode;
            public goPackage: string;
            public ccGenericServices: boolean;
            public javaGenericServices: boolean;
            public pyGenericServices: boolean;
            public phpGenericServices: boolean;
            public deprecated: boolean;
            public ccEnableArenas: boolean;
            public objcClassPrefix: string;
            public csharpNamespace: string;
            public swiftPrefix: string;
            public phpClassPrefix: string;
            public phpNamespace: string;
            public phpMetadataNamespace: string;
            public rubyPackage: string;
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IFileOptions): google.protobuf.FileOptions;
            public static encode(message: google.protobuf.IFileOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IFileOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FileOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FileOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.FileOptions;
            public static toObject(message: google.protobuf.FileOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace FileOptions {

            enum OptimizeMode {
                SPEED = 1,
                CODE_SIZE = 2,
                LITE_RUNTIME = 3
            }
        }

        interface IMessageOptions {
            messageSetWireFormat?: (boolean|null);
            noStandardDescriptorAccessor?: (boolean|null);
            deprecated?: (boolean|null);
            mapEntry?: (boolean|null);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
            ".gogoproto.goprotoGetters"?: (boolean|null);
            ".gogoproto.goprotoStringer"?: (boolean|null);
            ".gogoproto.verboseEqual"?: (boolean|null);
            ".gogoproto.face"?: (boolean|null);
            ".gogoproto.gostring"?: (boolean|null);
            ".gogoproto.populate"?: (boolean|null);
            ".gogoproto.stringer"?: (boolean|null);
            ".gogoproto.onlyone"?: (boolean|null);
            ".gogoproto.equal"?: (boolean|null);
            ".gogoproto.description"?: (boolean|null);
            ".gogoproto.testgen"?: (boolean|null);
            ".gogoproto.benchgen"?: (boolean|null);
            ".gogoproto.marshaler"?: (boolean|null);
            ".gogoproto.unmarshaler"?: (boolean|null);
            ".gogoproto.stableMarshaler"?: (boolean|null);
            ".gogoproto.sizer"?: (boolean|null);
            ".gogoproto.unsafeMarshaler"?: (boolean|null);
            ".gogoproto.unsafeUnmarshaler"?: (boolean|null);
            ".gogoproto.goprotoExtensionsMap"?: (boolean|null);
            ".gogoproto.goprotoUnrecognized"?: (boolean|null);
            ".gogoproto.protosizer"?: (boolean|null);
            ".gogoproto.compare"?: (boolean|null);
            ".gogoproto.typedecl"?: (boolean|null);
            ".gogoproto.messagename"?: (boolean|null);
            ".gogoproto.goprotoSizecache"?: (boolean|null);
            ".gogoproto.goprotoUnkeyed"?: (boolean|null);
        }

        class MessageOptions implements IMessageOptions {

            public messageSetWireFormat: boolean;
            public noStandardDescriptorAccessor: boolean;
            public deprecated: boolean;
            public mapEntry: boolean;
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IMessageOptions): google.protobuf.MessageOptions;
            public static encode(message: google.protobuf.IMessageOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IMessageOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.MessageOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.MessageOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.MessageOptions;
            public static toObject(message: google.protobuf.MessageOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IFieldOptions {
            ctype?: (google.protobuf.FieldOptions.CType|null);
            packed?: (boolean|null);
            jstype?: (google.protobuf.FieldOptions.JSType|null);
            lazy?: (boolean|null);
            deprecated?: (boolean|null);
            weak?: (boolean|null);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
            ".gogoproto.nullable"?: (boolean|null);
            ".gogoproto.embed"?: (boolean|null);
            ".gogoproto.customtype"?: (string|null);
            ".gogoproto.customname"?: (string|null);
            ".gogoproto.jsontag"?: (string|null);
            ".gogoproto.moretags"?: (string|null);
            ".gogoproto.casttype"?: (string|null);
            ".gogoproto.castkey"?: (string|null);
            ".gogoproto.castvalue"?: (string|null);
            ".gogoproto.stdtime"?: (boolean|null);
            ".gogoproto.stdduration"?: (boolean|null);
            ".gogoproto.wktpointer"?: (boolean|null);
        }

        class FieldOptions implements IFieldOptions {

            public ctype: google.protobuf.FieldOptions.CType;
            public packed: boolean;
            public jstype: google.protobuf.FieldOptions.JSType;
            public lazy: boolean;
            public deprecated: boolean;
            public weak: boolean;
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IFieldOptions): google.protobuf.FieldOptions;
            public static encode(message: google.protobuf.IFieldOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IFieldOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FieldOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FieldOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.FieldOptions;
            public static toObject(message: google.protobuf.FieldOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace FieldOptions {

            enum CType {
                STRING = 0,
                CORD = 1,
                STRING_PIECE = 2
            }

            enum JSType {
                JS_NORMAL = 0,
                JS_STRING = 1,
                JS_NUMBER = 2
            }
        }

        interface IOneofOptions {
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
        }

        class OneofOptions implements IOneofOptions {

            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IOneofOptions): google.protobuf.OneofOptions;
            public static encode(message: google.protobuf.IOneofOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IOneofOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.OneofOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.OneofOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.OneofOptions;
            public static toObject(message: google.protobuf.OneofOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IEnumOptions {
            allowAlias?: (boolean|null);
            deprecated?: (boolean|null);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
            ".gogoproto.goprotoEnumPrefix"?: (boolean|null);
            ".gogoproto.goprotoEnumStringer"?: (boolean|null);
            ".gogoproto.enumStringer"?: (boolean|null);
            ".gogoproto.enumCustomname"?: (string|null);
            ".gogoproto.enumdecl"?: (boolean|null);
        }

        class EnumOptions implements IEnumOptions {

            public allowAlias: boolean;
            public deprecated: boolean;
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IEnumOptions): google.protobuf.EnumOptions;
            public static encode(message: google.protobuf.IEnumOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IEnumOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumOptions;
            public static toObject(message: google.protobuf.EnumOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IEnumValueOptions {
            deprecated?: (boolean|null);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
            ".gogoproto.enumvalueCustomname"?: (string|null);
        }

        class EnumValueOptions implements IEnumValueOptions {

            public deprecated: boolean;
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IEnumValueOptions): google.protobuf.EnumValueOptions;
            public static encode(message: google.protobuf.IEnumValueOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IEnumValueOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumValueOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumValueOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumValueOptions;
            public static toObject(message: google.protobuf.EnumValueOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IServiceOptions {
            deprecated?: (boolean|null);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
        }

        class ServiceOptions implements IServiceOptions {

            public deprecated: boolean;
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IServiceOptions): google.protobuf.ServiceOptions;
            public static encode(message: google.protobuf.IServiceOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IServiceOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.ServiceOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.ServiceOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.ServiceOptions;
            public static toObject(message: google.protobuf.ServiceOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMethodOptions {
            deprecated?: (boolean|null);
            idempotencyLevel?: (google.protobuf.MethodOptions.IdempotencyLevel|null);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
        }

        class MethodOptions implements IMethodOptions {

            public deprecated: boolean;
            public idempotencyLevel: google.protobuf.MethodOptions.IdempotencyLevel;
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IMethodOptions): google.protobuf.MethodOptions;
            public static encode(message: google.protobuf.IMethodOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IMethodOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.MethodOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.MethodOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.MethodOptions;
            public static toObject(message: google.protobuf.MethodOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MethodOptions {

            enum IdempotencyLevel {
                IDEMPOTENCY_UNKNOWN = 0,
                NO_SIDE_EFFECTS = 1,
                IDEMPOTENT = 2
            }
        }

        interface IUninterpretedOption {
            name?: (google.protobuf.UninterpretedOption.INamePart[]|null);
            identifierValue?: (string|null);
            positiveIntValue?: (number|Long|null);
            negativeIntValue?: (number|Long|null);
            doubleValue?: (number|null);
            stringValue?: (Uint8Array|null);
            aggregateValue?: (string|null);
        }

        class UninterpretedOption implements IUninterpretedOption {

            public name: google.protobuf.UninterpretedOption.INamePart[];
            public identifierValue: string;
            public positiveIntValue: (number|Long);
            public negativeIntValue: (number|Long);
            public doubleValue: number;
            public stringValue: Uint8Array;
            public aggregateValue: string;
            public static create(properties?: google.protobuf.IUninterpretedOption): google.protobuf.UninterpretedOption;
            public static encode(message: google.protobuf.IUninterpretedOption, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IUninterpretedOption, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.UninterpretedOption;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.UninterpretedOption;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.UninterpretedOption;
            public static toObject(message: google.protobuf.UninterpretedOption, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace UninterpretedOption {

            interface INamePart {
                namePart: string;
                isExtension: boolean;
            }

            class NamePart implements INamePart {

                public namePart: string;
                public isExtension: boolean;
                public static create(properties?: google.protobuf.UninterpretedOption.INamePart): google.protobuf.UninterpretedOption.NamePart;
                public static encode(message: google.protobuf.UninterpretedOption.INamePart, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: google.protobuf.UninterpretedOption.INamePart, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.UninterpretedOption.NamePart;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.UninterpretedOption.NamePart;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): google.protobuf.UninterpretedOption.NamePart;
                public static toObject(message: google.protobuf.UninterpretedOption.NamePart, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface ISourceCodeInfo {
            location?: (google.protobuf.SourceCodeInfo.ILocation[]|null);
        }

        class SourceCodeInfo implements ISourceCodeInfo {

            public location: google.protobuf.SourceCodeInfo.ILocation[];
            public static create(properties?: google.protobuf.ISourceCodeInfo): google.protobuf.SourceCodeInfo;
            public static encode(message: google.protobuf.ISourceCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.ISourceCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.SourceCodeInfo;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.SourceCodeInfo;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.SourceCodeInfo;
            public static toObject(message: google.protobuf.SourceCodeInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace SourceCodeInfo {

            interface ILocation {
                path?: (number[]|null);
                span?: (number[]|null);
                leadingComments?: (string|null);
                trailingComments?: (string|null);
                leadingDetachedComments?: (string[]|null);
            }

            class Location implements ILocation {

                public path: number[];
                public span: number[];
                public leadingComments: string;
                public trailingComments: string;
                public leadingDetachedComments: string[];
                public static create(properties?: google.protobuf.SourceCodeInfo.ILocation): google.protobuf.SourceCodeInfo.Location;
                public static encode(message: google.protobuf.SourceCodeInfo.ILocation, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: google.protobuf.SourceCodeInfo.ILocation, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.SourceCodeInfo.Location;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.SourceCodeInfo.Location;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): google.protobuf.SourceCodeInfo.Location;
                public static toObject(message: google.protobuf.SourceCodeInfo.Location, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IGeneratedCodeInfo {
            annotation?: (google.protobuf.GeneratedCodeInfo.IAnnotation[]|null);
        }

        class GeneratedCodeInfo implements IGeneratedCodeInfo {

            public annotation: google.protobuf.GeneratedCodeInfo.IAnnotation[];
            public static create(properties?: google.protobuf.IGeneratedCodeInfo): google.protobuf.GeneratedCodeInfo;
            public static encode(message: google.protobuf.IGeneratedCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IGeneratedCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.GeneratedCodeInfo;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.GeneratedCodeInfo;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.GeneratedCodeInfo;
            public static toObject(message: google.protobuf.GeneratedCodeInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace GeneratedCodeInfo {

            interface IAnnotation {
                path?: (number[]|null);
                sourceFile?: (string|null);
                begin?: (number|null);
                end?: (number|null);
            }

            class Annotation implements IAnnotation {

                public path: number[];
                public sourceFile: string;
                public begin: number;
                public end: number;
                public static create(properties?: google.protobuf.GeneratedCodeInfo.IAnnotation): google.protobuf.GeneratedCodeInfo.Annotation;
                public static encode(message: google.protobuf.GeneratedCodeInfo.IAnnotation, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: google.protobuf.GeneratedCodeInfo.IAnnotation, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.GeneratedCodeInfo.Annotation;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.GeneratedCodeInfo.Annotation;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): google.protobuf.GeneratedCodeInfo.Annotation;
                public static toObject(message: google.protobuf.GeneratedCodeInfo.Annotation, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }
    }
}
