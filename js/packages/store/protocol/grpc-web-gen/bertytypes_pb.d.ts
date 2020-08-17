// package: berty.types.v1
// file: bertytypes.proto

import * as jspb from "google-protobuf";
import * as gogoproto_gogo_pb from "./gogoproto/gogo_pb";

export class Account extends jspb.Message {
  hasGroup(): boolean;
  clearGroup(): void;
  getGroup(): Group | undefined;
  setGroup(value?: Group): void;

  getAccountPrivateKey(): Uint8Array | string;
  getAccountPrivateKey_asU8(): Uint8Array;
  getAccountPrivateKey_asB64(): string;
  setAccountPrivateKey(value: Uint8Array | string): void;

  getAliasPrivateKey(): Uint8Array | string;
  getAliasPrivateKey_asU8(): Uint8Array;
  getAliasPrivateKey_asB64(): string;
  setAliasPrivateKey(value: Uint8Array | string): void;

  getPublicRendezvousSeed(): Uint8Array | string;
  getPublicRendezvousSeed_asU8(): Uint8Array;
  getPublicRendezvousSeed_asB64(): string;
  setPublicRendezvousSeed(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Account.AsObject;
  static toObject(includeInstance: boolean, msg: Account): Account.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Account, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Account;
  static deserializeBinaryFromReader(message: Account, reader: jspb.BinaryReader): Account;
}

export namespace Account {
  export type AsObject = {
    group?: Group.AsObject,
    accountPrivateKey: Uint8Array | string,
    aliasPrivateKey: Uint8Array | string,
    publicRendezvousSeed: Uint8Array | string,
  }
}

export class Group extends jspb.Message {
  getPublicKey(): Uint8Array | string;
  getPublicKey_asU8(): Uint8Array;
  getPublicKey_asB64(): string;
  setPublicKey(value: Uint8Array | string): void;

  getSecret(): Uint8Array | string;
  getSecret_asU8(): Uint8Array;
  getSecret_asB64(): string;
  setSecret(value: Uint8Array | string): void;

  getSecretSig(): Uint8Array | string;
  getSecretSig_asU8(): Uint8Array;
  getSecretSig_asB64(): string;
  setSecretSig(value: Uint8Array | string): void;

  getGroupType(): GroupTypeMap[keyof GroupTypeMap];
  setGroupType(value: GroupTypeMap[keyof GroupTypeMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Group.AsObject;
  static toObject(includeInstance: boolean, msg: Group): Group.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Group, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Group;
  static deserializeBinaryFromReader(message: Group, reader: jspb.BinaryReader): Group;
}

export namespace Group {
  export type AsObject = {
    publicKey: Uint8Array | string,
    secret: Uint8Array | string,
    secretSig: Uint8Array | string,
    groupType: GroupTypeMap[keyof GroupTypeMap],
  }
}

export class GroupMetadata extends jspb.Message {
  getEventType(): EventTypeMap[keyof EventTypeMap];
  setEventType(value: EventTypeMap[keyof EventTypeMap]): void;

  getPayload(): Uint8Array | string;
  getPayload_asU8(): Uint8Array;
  getPayload_asB64(): string;
  setPayload(value: Uint8Array | string): void;

  getSig(): Uint8Array | string;
  getSig_asU8(): Uint8Array;
  getSig_asB64(): string;
  setSig(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupMetadata.AsObject;
  static toObject(includeInstance: boolean, msg: GroupMetadata): GroupMetadata.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupMetadata, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupMetadata;
  static deserializeBinaryFromReader(message: GroupMetadata, reader: jspb.BinaryReader): GroupMetadata;
}

export namespace GroupMetadata {
  export type AsObject = {
    eventType: EventTypeMap[keyof EventTypeMap],
    payload: Uint8Array | string,
    sig: Uint8Array | string,
  }
}

export class GroupEnvelope extends jspb.Message {
  getNonce(): Uint8Array | string;
  getNonce_asU8(): Uint8Array;
  getNonce_asB64(): string;
  setNonce(value: Uint8Array | string): void;

  getEvent(): Uint8Array | string;
  getEvent_asU8(): Uint8Array;
  getEvent_asB64(): string;
  setEvent(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupEnvelope.AsObject;
  static toObject(includeInstance: boolean, msg: GroupEnvelope): GroupEnvelope.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupEnvelope, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupEnvelope;
  static deserializeBinaryFromReader(message: GroupEnvelope, reader: jspb.BinaryReader): GroupEnvelope;
}

export namespace GroupEnvelope {
  export type AsObject = {
    nonce: Uint8Array | string,
    event: Uint8Array | string,
  }
}

export class MessageHeaders extends jspb.Message {
  getCounter(): number;
  setCounter(value: number): void;

  getDevicePk(): Uint8Array | string;
  getDevicePk_asU8(): Uint8Array;
  getDevicePk_asB64(): string;
  setDevicePk(value: Uint8Array | string): void;

  getSig(): Uint8Array | string;
  getSig_asU8(): Uint8Array;
  getSig_asB64(): string;
  setSig(value: Uint8Array | string): void;

  getMetadataMap(): jspb.Map<string, string>;
  clearMetadataMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessageHeaders.AsObject;
  static toObject(includeInstance: boolean, msg: MessageHeaders): MessageHeaders.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessageHeaders, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessageHeaders;
  static deserializeBinaryFromReader(message: MessageHeaders, reader: jspb.BinaryReader): MessageHeaders;
}

export namespace MessageHeaders {
  export type AsObject = {
    counter: number,
    devicePk: Uint8Array | string,
    sig: Uint8Array | string,
    metadataMap: Array<[string, string]>,
  }
}

export class MessageEnvelope extends jspb.Message {
  getMessageHeaders(): Uint8Array | string;
  getMessageHeaders_asU8(): Uint8Array;
  getMessageHeaders_asB64(): string;
  setMessageHeaders(value: Uint8Array | string): void;

  getMessage(): Uint8Array | string;
  getMessage_asU8(): Uint8Array;
  getMessage_asB64(): string;
  setMessage(value: Uint8Array | string): void;

  getNonce(): Uint8Array | string;
  getNonce_asU8(): Uint8Array;
  getNonce_asB64(): string;
  setNonce(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessageEnvelope.AsObject;
  static toObject(includeInstance: boolean, msg: MessageEnvelope): MessageEnvelope.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MessageEnvelope, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessageEnvelope;
  static deserializeBinaryFromReader(message: MessageEnvelope, reader: jspb.BinaryReader): MessageEnvelope;
}

export namespace MessageEnvelope {
  export type AsObject = {
    messageHeaders: Uint8Array | string,
    message: Uint8Array | string,
    nonce: Uint8Array | string,
  }
}

export class EventContext extends jspb.Message {
  getId(): Uint8Array | string;
  getId_asU8(): Uint8Array;
  getId_asB64(): string;
  setId(value: Uint8Array | string): void;

  clearParentIdsList(): void;
  getParentIdsList(): Array<Uint8Array | string>;
  getParentIdsList_asU8(): Array<Uint8Array>;
  getParentIdsList_asB64(): Array<string>;
  setParentIdsList(value: Array<Uint8Array | string>): void;
  addParentIds(value: Uint8Array | string, index?: number): Uint8Array | string;

  getGroupPk(): Uint8Array | string;
  getGroupPk_asU8(): Uint8Array;
  getGroupPk_asB64(): string;
  setGroupPk(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EventContext.AsObject;
  static toObject(includeInstance: boolean, msg: EventContext): EventContext.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EventContext, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EventContext;
  static deserializeBinaryFromReader(message: EventContext, reader: jspb.BinaryReader): EventContext;
}

export namespace EventContext {
  export type AsObject = {
    id: Uint8Array | string,
    parentIdsList: Array<Uint8Array | string>,
    groupPk: Uint8Array | string,
  }
}

export class AppMetadata extends jspb.Message {
  getDevicePk(): Uint8Array | string;
  getDevicePk_asU8(): Uint8Array;
  getDevicePk_asB64(): string;
  setDevicePk(value: Uint8Array | string): void;

  getMessage(): Uint8Array | string;
  getMessage_asU8(): Uint8Array;
  getMessage_asB64(): string;
  setMessage(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AppMetadata.AsObject;
  static toObject(includeInstance: boolean, msg: AppMetadata): AppMetadata.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AppMetadata, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AppMetadata;
  static deserializeBinaryFromReader(message: AppMetadata, reader: jspb.BinaryReader): AppMetadata;
}

export namespace AppMetadata {
  export type AsObject = {
    devicePk: Uint8Array | string,
    message: Uint8Array | string,
  }
}

export class ContactAddAliasKey extends jspb.Message {
  getDevicePk(): Uint8Array | string;
  getDevicePk_asU8(): Uint8Array;
  getDevicePk_asB64(): string;
  setDevicePk(value: Uint8Array | string): void;

  getAliasPk(): Uint8Array | string;
  getAliasPk_asU8(): Uint8Array;
  getAliasPk_asB64(): string;
  setAliasPk(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactAddAliasKey.AsObject;
  static toObject(includeInstance: boolean, msg: ContactAddAliasKey): ContactAddAliasKey.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactAddAliasKey, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactAddAliasKey;
  static deserializeBinaryFromReader(message: ContactAddAliasKey, reader: jspb.BinaryReader): ContactAddAliasKey;
}

export namespace ContactAddAliasKey {
  export type AsObject = {
    devicePk: Uint8Array | string,
    aliasPk: Uint8Array | string,
  }
}

export class GroupAddMemberDevice extends jspb.Message {
  getMemberPk(): Uint8Array | string;
  getMemberPk_asU8(): Uint8Array;
  getMemberPk_asB64(): string;
  setMemberPk(value: Uint8Array | string): void;

  getDevicePk(): Uint8Array | string;
  getDevicePk_asU8(): Uint8Array;
  getDevicePk_asB64(): string;
  setDevicePk(value: Uint8Array | string): void;

  getMemberSig(): Uint8Array | string;
  getMemberSig_asU8(): Uint8Array;
  getMemberSig_asB64(): string;
  setMemberSig(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupAddMemberDevice.AsObject;
  static toObject(includeInstance: boolean, msg: GroupAddMemberDevice): GroupAddMemberDevice.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupAddMemberDevice, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupAddMemberDevice;
  static deserializeBinaryFromReader(message: GroupAddMemberDevice, reader: jspb.BinaryReader): GroupAddMemberDevice;
}

export namespace GroupAddMemberDevice {
  export type AsObject = {
    memberPk: Uint8Array | string,
    devicePk: Uint8Array | string,
    memberSig: Uint8Array | string,
  }
}

export class DeviceSecret extends jspb.Message {
  getChainKey(): Uint8Array | string;
  getChainKey_asU8(): Uint8Array;
  getChainKey_asB64(): string;
  setChainKey(value: Uint8Array | string): void;

  getCounter(): number;
  setCounter(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeviceSecret.AsObject;
  static toObject(includeInstance: boolean, msg: DeviceSecret): DeviceSecret.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DeviceSecret, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeviceSecret;
  static deserializeBinaryFromReader(message: DeviceSecret, reader: jspb.BinaryReader): DeviceSecret;
}

export namespace DeviceSecret {
  export type AsObject = {
    chainKey: Uint8Array | string,
    counter: number,
  }
}

export class GroupAddDeviceSecret extends jspb.Message {
  getDevicePk(): Uint8Array | string;
  getDevicePk_asU8(): Uint8Array;
  getDevicePk_asB64(): string;
  setDevicePk(value: Uint8Array | string): void;

  getDestMemberPk(): Uint8Array | string;
  getDestMemberPk_asU8(): Uint8Array;
  getDestMemberPk_asB64(): string;
  setDestMemberPk(value: Uint8Array | string): void;

  getPayload(): Uint8Array | string;
  getPayload_asU8(): Uint8Array;
  getPayload_asB64(): string;
  setPayload(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupAddDeviceSecret.AsObject;
  static toObject(includeInstance: boolean, msg: GroupAddDeviceSecret): GroupAddDeviceSecret.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupAddDeviceSecret, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupAddDeviceSecret;
  static deserializeBinaryFromReader(message: GroupAddDeviceSecret, reader: jspb.BinaryReader): GroupAddDeviceSecret;
}

export namespace GroupAddDeviceSecret {
  export type AsObject = {
    devicePk: Uint8Array | string,
    destMemberPk: Uint8Array | string,
    payload: Uint8Array | string,
  }
}

export class MultiMemberGroupAddAliasResolver extends jspb.Message {
  getDevicePk(): Uint8Array | string;
  getDevicePk_asU8(): Uint8Array;
  getDevicePk_asB64(): string;
  setDevicePk(value: Uint8Array | string): void;

  getAliasResolver(): Uint8Array | string;
  getAliasResolver_asU8(): Uint8Array;
  getAliasResolver_asB64(): string;
  setAliasResolver(value: Uint8Array | string): void;

  getAliasProof(): Uint8Array | string;
  getAliasProof_asU8(): Uint8Array;
  getAliasProof_asB64(): string;
  setAliasProof(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MultiMemberGroupAddAliasResolver.AsObject;
  static toObject(includeInstance: boolean, msg: MultiMemberGroupAddAliasResolver): MultiMemberGroupAddAliasResolver.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MultiMemberGroupAddAliasResolver, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MultiMemberGroupAddAliasResolver;
  static deserializeBinaryFromReader(message: MultiMemberGroupAddAliasResolver, reader: jspb.BinaryReader): MultiMemberGroupAddAliasResolver;
}

export namespace MultiMemberGroupAddAliasResolver {
  export type AsObject = {
    devicePk: Uint8Array | string,
    aliasResolver: Uint8Array | string,
    aliasProof: Uint8Array | string,
  }
}

export class MultiMemberGrantAdminRole extends jspb.Message {
  getDevicePk(): Uint8Array | string;
  getDevicePk_asU8(): Uint8Array;
  getDevicePk_asB64(): string;
  setDevicePk(value: Uint8Array | string): void;

  getGranteeMemberPk(): Uint8Array | string;
  getGranteeMemberPk_asU8(): Uint8Array;
  getGranteeMemberPk_asB64(): string;
  setGranteeMemberPk(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MultiMemberGrantAdminRole.AsObject;
  static toObject(includeInstance: boolean, msg: MultiMemberGrantAdminRole): MultiMemberGrantAdminRole.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MultiMemberGrantAdminRole, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MultiMemberGrantAdminRole;
  static deserializeBinaryFromReader(message: MultiMemberGrantAdminRole, reader: jspb.BinaryReader): MultiMemberGrantAdminRole;
}

export namespace MultiMemberGrantAdminRole {
  export type AsObject = {
    devicePk: Uint8Array | string,
    granteeMemberPk: Uint8Array | string,
  }
}

export class MultiMemberInitialMember extends jspb.Message {
  getMemberPk(): Uint8Array | string;
  getMemberPk_asU8(): Uint8Array;
  getMemberPk_asB64(): string;
  setMemberPk(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MultiMemberInitialMember.AsObject;
  static toObject(includeInstance: boolean, msg: MultiMemberInitialMember): MultiMemberInitialMember.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MultiMemberInitialMember, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MultiMemberInitialMember;
  static deserializeBinaryFromReader(message: MultiMemberInitialMember, reader: jspb.BinaryReader): MultiMemberInitialMember;
}

export namespace MultiMemberInitialMember {
  export type AsObject = {
    memberPk: Uint8Array | string,
  }
}

export class GroupAddAdditionalRendezvousSeed extends jspb.Message {
  getDevicePk(): Uint8Array | string;
  getDevicePk_asU8(): Uint8Array;
  getDevicePk_asB64(): string;
  setDevicePk(value: Uint8Array | string): void;

  getSeed(): Uint8Array | string;
  getSeed_asU8(): Uint8Array;
  getSeed_asB64(): string;
  setSeed(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupAddAdditionalRendezvousSeed.AsObject;
  static toObject(includeInstance: boolean, msg: GroupAddAdditionalRendezvousSeed): GroupAddAdditionalRendezvousSeed.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupAddAdditionalRendezvousSeed, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupAddAdditionalRendezvousSeed;
  static deserializeBinaryFromReader(message: GroupAddAdditionalRendezvousSeed, reader: jspb.BinaryReader): GroupAddAdditionalRendezvousSeed;
}

export namespace GroupAddAdditionalRendezvousSeed {
  export type AsObject = {
    devicePk: Uint8Array | string,
    seed: Uint8Array | string,
  }
}

export class GroupRemoveAdditionalRendezvousSeed extends jspb.Message {
  getDevicePk(): Uint8Array | string;
  getDevicePk_asU8(): Uint8Array;
  getDevicePk_asB64(): string;
  setDevicePk(value: Uint8Array | string): void;

  getSeed(): Uint8Array | string;
  getSeed_asU8(): Uint8Array;
  getSeed_asB64(): string;
  setSeed(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupRemoveAdditionalRendezvousSeed.AsObject;
  static toObject(includeInstance: boolean, msg: GroupRemoveAdditionalRendezvousSeed): GroupRemoveAdditionalRendezvousSeed.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupRemoveAdditionalRendezvousSeed, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupRemoveAdditionalRendezvousSeed;
  static deserializeBinaryFromReader(message: GroupRemoveAdditionalRendezvousSeed, reader: jspb.BinaryReader): GroupRemoveAdditionalRendezvousSeed;
}

export namespace GroupRemoveAdditionalRendezvousSeed {
  export type AsObject = {
    devicePk: Uint8Array | string,
    seed: Uint8Array | string,
  }
}

export class AccountGroupJoined extends jspb.Message {
  getDevicePk(): Uint8Array | string;
  getDevicePk_asU8(): Uint8Array;
  getDevicePk_asB64(): string;
  setDevicePk(value: Uint8Array | string): void;

  hasGroup(): boolean;
  clearGroup(): void;
  getGroup(): Group | undefined;
  setGroup(value?: Group): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountGroupJoined.AsObject;
  static toObject(includeInstance: boolean, msg: AccountGroupJoined): AccountGroupJoined.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountGroupJoined, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountGroupJoined;
  static deserializeBinaryFromReader(message: AccountGroupJoined, reader: jspb.BinaryReader): AccountGroupJoined;
}

export namespace AccountGroupJoined {
  export type AsObject = {
    devicePk: Uint8Array | string,
    group?: Group.AsObject,
  }
}

export class AccountGroupLeft extends jspb.Message {
  getDevicePk(): Uint8Array | string;
  getDevicePk_asU8(): Uint8Array;
  getDevicePk_asB64(): string;
  setDevicePk(value: Uint8Array | string): void;

  getGroupPk(): Uint8Array | string;
  getGroupPk_asU8(): Uint8Array;
  getGroupPk_asB64(): string;
  setGroupPk(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountGroupLeft.AsObject;
  static toObject(includeInstance: boolean, msg: AccountGroupLeft): AccountGroupLeft.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountGroupLeft, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountGroupLeft;
  static deserializeBinaryFromReader(message: AccountGroupLeft, reader: jspb.BinaryReader): AccountGroupLeft;
}

export namespace AccountGroupLeft {
  export type AsObject = {
    devicePk: Uint8Array | string,
    groupPk: Uint8Array | string,
  }
}

export class AccountContactRequestDisabled extends jspb.Message {
  getDevicePk(): Uint8Array | string;
  getDevicePk_asU8(): Uint8Array;
  getDevicePk_asB64(): string;
  setDevicePk(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountContactRequestDisabled.AsObject;
  static toObject(includeInstance: boolean, msg: AccountContactRequestDisabled): AccountContactRequestDisabled.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountContactRequestDisabled, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountContactRequestDisabled;
  static deserializeBinaryFromReader(message: AccountContactRequestDisabled, reader: jspb.BinaryReader): AccountContactRequestDisabled;
}

export namespace AccountContactRequestDisabled {
  export type AsObject = {
    devicePk: Uint8Array | string,
  }
}

export class AccountContactRequestEnabled extends jspb.Message {
  getDevicePk(): Uint8Array | string;
  getDevicePk_asU8(): Uint8Array;
  getDevicePk_asB64(): string;
  setDevicePk(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountContactRequestEnabled.AsObject;
  static toObject(includeInstance: boolean, msg: AccountContactRequestEnabled): AccountContactRequestEnabled.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountContactRequestEnabled, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountContactRequestEnabled;
  static deserializeBinaryFromReader(message: AccountContactRequestEnabled, reader: jspb.BinaryReader): AccountContactRequestEnabled;
}

export namespace AccountContactRequestEnabled {
  export type AsObject = {
    devicePk: Uint8Array | string,
  }
}

export class AccountContactRequestReferenceReset extends jspb.Message {
  getDevicePk(): Uint8Array | string;
  getDevicePk_asU8(): Uint8Array;
  getDevicePk_asB64(): string;
  setDevicePk(value: Uint8Array | string): void;

  getPublicRendezvousSeed(): Uint8Array | string;
  getPublicRendezvousSeed_asU8(): Uint8Array;
  getPublicRendezvousSeed_asB64(): string;
  setPublicRendezvousSeed(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountContactRequestReferenceReset.AsObject;
  static toObject(includeInstance: boolean, msg: AccountContactRequestReferenceReset): AccountContactRequestReferenceReset.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountContactRequestReferenceReset, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountContactRequestReferenceReset;
  static deserializeBinaryFromReader(message: AccountContactRequestReferenceReset, reader: jspb.BinaryReader): AccountContactRequestReferenceReset;
}

export namespace AccountContactRequestReferenceReset {
  export type AsObject = {
    devicePk: Uint8Array | string,
    publicRendezvousSeed: Uint8Array | string,
  }
}

export class AccountContactRequestEnqueued extends jspb.Message {
  getDevicePk(): Uint8Array | string;
  getDevicePk_asU8(): Uint8Array;
  getDevicePk_asB64(): string;
  setDevicePk(value: Uint8Array | string): void;

  getGroupPk(): Uint8Array | string;
  getGroupPk_asU8(): Uint8Array;
  getGroupPk_asB64(): string;
  setGroupPk(value: Uint8Array | string): void;

  hasContact(): boolean;
  clearContact(): void;
  getContact(): ShareableContact | undefined;
  setContact(value?: ShareableContact): void;

  getOwnMetadata(): Uint8Array | string;
  getOwnMetadata_asU8(): Uint8Array;
  getOwnMetadata_asB64(): string;
  setOwnMetadata(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountContactRequestEnqueued.AsObject;
  static toObject(includeInstance: boolean, msg: AccountContactRequestEnqueued): AccountContactRequestEnqueued.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountContactRequestEnqueued, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountContactRequestEnqueued;
  static deserializeBinaryFromReader(message: AccountContactRequestEnqueued, reader: jspb.BinaryReader): AccountContactRequestEnqueued;
}

export namespace AccountContactRequestEnqueued {
  export type AsObject = {
    devicePk: Uint8Array | string,
    groupPk: Uint8Array | string,
    contact?: ShareableContact.AsObject,
    ownMetadata: Uint8Array | string,
  }
}

export class AccountContactRequestSent extends jspb.Message {
  getDevicePk(): Uint8Array | string;
  getDevicePk_asU8(): Uint8Array;
  getDevicePk_asB64(): string;
  setDevicePk(value: Uint8Array | string): void;

  getContactPk(): Uint8Array | string;
  getContactPk_asU8(): Uint8Array;
  getContactPk_asB64(): string;
  setContactPk(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountContactRequestSent.AsObject;
  static toObject(includeInstance: boolean, msg: AccountContactRequestSent): AccountContactRequestSent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountContactRequestSent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountContactRequestSent;
  static deserializeBinaryFromReader(message: AccountContactRequestSent, reader: jspb.BinaryReader): AccountContactRequestSent;
}

export namespace AccountContactRequestSent {
  export type AsObject = {
    devicePk: Uint8Array | string,
    contactPk: Uint8Array | string,
  }
}

export class AccountContactRequestReceived extends jspb.Message {
  getDevicePk(): Uint8Array | string;
  getDevicePk_asU8(): Uint8Array;
  getDevicePk_asB64(): string;
  setDevicePk(value: Uint8Array | string): void;

  getContactPk(): Uint8Array | string;
  getContactPk_asU8(): Uint8Array;
  getContactPk_asB64(): string;
  setContactPk(value: Uint8Array | string): void;

  getContactRendezvousSeed(): Uint8Array | string;
  getContactRendezvousSeed_asU8(): Uint8Array;
  getContactRendezvousSeed_asB64(): string;
  setContactRendezvousSeed(value: Uint8Array | string): void;

  getContactMetadata(): Uint8Array | string;
  getContactMetadata_asU8(): Uint8Array;
  getContactMetadata_asB64(): string;
  setContactMetadata(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountContactRequestReceived.AsObject;
  static toObject(includeInstance: boolean, msg: AccountContactRequestReceived): AccountContactRequestReceived.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountContactRequestReceived, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountContactRequestReceived;
  static deserializeBinaryFromReader(message: AccountContactRequestReceived, reader: jspb.BinaryReader): AccountContactRequestReceived;
}

export namespace AccountContactRequestReceived {
  export type AsObject = {
    devicePk: Uint8Array | string,
    contactPk: Uint8Array | string,
    contactRendezvousSeed: Uint8Array | string,
    contactMetadata: Uint8Array | string,
  }
}

export class AccountContactRequestDiscarded extends jspb.Message {
  getDevicePk(): Uint8Array | string;
  getDevicePk_asU8(): Uint8Array;
  getDevicePk_asB64(): string;
  setDevicePk(value: Uint8Array | string): void;

  getContactPk(): Uint8Array | string;
  getContactPk_asU8(): Uint8Array;
  getContactPk_asB64(): string;
  setContactPk(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountContactRequestDiscarded.AsObject;
  static toObject(includeInstance: boolean, msg: AccountContactRequestDiscarded): AccountContactRequestDiscarded.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountContactRequestDiscarded, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountContactRequestDiscarded;
  static deserializeBinaryFromReader(message: AccountContactRequestDiscarded, reader: jspb.BinaryReader): AccountContactRequestDiscarded;
}

export namespace AccountContactRequestDiscarded {
  export type AsObject = {
    devicePk: Uint8Array | string,
    contactPk: Uint8Array | string,
  }
}

export class AccountContactRequestAccepted extends jspb.Message {
  getDevicePk(): Uint8Array | string;
  getDevicePk_asU8(): Uint8Array;
  getDevicePk_asB64(): string;
  setDevicePk(value: Uint8Array | string): void;

  getContactPk(): Uint8Array | string;
  getContactPk_asU8(): Uint8Array;
  getContactPk_asB64(): string;
  setContactPk(value: Uint8Array | string): void;

  getGroupPk(): Uint8Array | string;
  getGroupPk_asU8(): Uint8Array;
  getGroupPk_asB64(): string;
  setGroupPk(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountContactRequestAccepted.AsObject;
  static toObject(includeInstance: boolean, msg: AccountContactRequestAccepted): AccountContactRequestAccepted.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountContactRequestAccepted, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountContactRequestAccepted;
  static deserializeBinaryFromReader(message: AccountContactRequestAccepted, reader: jspb.BinaryReader): AccountContactRequestAccepted;
}

export namespace AccountContactRequestAccepted {
  export type AsObject = {
    devicePk: Uint8Array | string,
    contactPk: Uint8Array | string,
    groupPk: Uint8Array | string,
  }
}

export class AccountContactBlocked extends jspb.Message {
  getDevicePk(): Uint8Array | string;
  getDevicePk_asU8(): Uint8Array;
  getDevicePk_asB64(): string;
  setDevicePk(value: Uint8Array | string): void;

  getContactPk(): Uint8Array | string;
  getContactPk_asU8(): Uint8Array;
  getContactPk_asB64(): string;
  setContactPk(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountContactBlocked.AsObject;
  static toObject(includeInstance: boolean, msg: AccountContactBlocked): AccountContactBlocked.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountContactBlocked, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountContactBlocked;
  static deserializeBinaryFromReader(message: AccountContactBlocked, reader: jspb.BinaryReader): AccountContactBlocked;
}

export namespace AccountContactBlocked {
  export type AsObject = {
    devicePk: Uint8Array | string,
    contactPk: Uint8Array | string,
  }
}

export class AccountContactUnblocked extends jspb.Message {
  getDevicePk(): Uint8Array | string;
  getDevicePk_asU8(): Uint8Array;
  getDevicePk_asB64(): string;
  setDevicePk(value: Uint8Array | string): void;

  getContactPk(): Uint8Array | string;
  getContactPk_asU8(): Uint8Array;
  getContactPk_asB64(): string;
  setContactPk(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountContactUnblocked.AsObject;
  static toObject(includeInstance: boolean, msg: AccountContactUnblocked): AccountContactUnblocked.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountContactUnblocked, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountContactUnblocked;
  static deserializeBinaryFromReader(message: AccountContactUnblocked, reader: jspb.BinaryReader): AccountContactUnblocked;
}

export namespace AccountContactUnblocked {
  export type AsObject = {
    devicePk: Uint8Array | string,
    contactPk: Uint8Array | string,
  }
}

export class InstanceExportData extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InstanceExportData.AsObject;
  static toObject(includeInstance: boolean, msg: InstanceExportData): InstanceExportData.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InstanceExportData, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InstanceExportData;
  static deserializeBinaryFromReader(message: InstanceExportData, reader: jspb.BinaryReader): InstanceExportData;
}

export namespace InstanceExportData {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
    }
  }

  export class Reply extends jspb.Message {
    getExportedData(): Uint8Array | string;
    getExportedData_asU8(): Uint8Array;
    getExportedData_asB64(): string;
    setExportedData(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
      exportedData: Uint8Array | string,
    }
  }
}

export class InstanceGetConfiguration extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InstanceGetConfiguration.AsObject;
  static toObject(includeInstance: boolean, msg: InstanceGetConfiguration): InstanceGetConfiguration.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InstanceGetConfiguration, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InstanceGetConfiguration;
  static deserializeBinaryFromReader(message: InstanceGetConfiguration, reader: jspb.BinaryReader): InstanceGetConfiguration;
}

export namespace InstanceGetConfiguration {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
    }
  }

  export class Reply extends jspb.Message {
    getAccountPk(): Uint8Array | string;
    getAccountPk_asU8(): Uint8Array;
    getAccountPk_asB64(): string;
    setAccountPk(value: Uint8Array | string): void;

    getDevicePk(): Uint8Array | string;
    getDevicePk_asU8(): Uint8Array;
    getDevicePk_asB64(): string;
    setDevicePk(value: Uint8Array | string): void;

    getAccountGroupPk(): Uint8Array | string;
    getAccountGroupPk_asU8(): Uint8Array;
    getAccountGroupPk_asB64(): string;
    setAccountGroupPk(value: Uint8Array | string): void;

    getPeerId(): string;
    setPeerId(value: string): void;

    clearListenersList(): void;
    getListenersList(): Array<string>;
    setListenersList(value: Array<string>): void;
    addListeners(value: string, index?: number): string;

    getBleEnabled(): InstanceGetConfiguration.SettingStateMap[keyof InstanceGetConfiguration.SettingStateMap];
    setBleEnabled(value: InstanceGetConfiguration.SettingStateMap[keyof InstanceGetConfiguration.SettingStateMap]): void;

    getWifiP2pEnabled(): InstanceGetConfiguration.SettingStateMap[keyof InstanceGetConfiguration.SettingStateMap];
    setWifiP2pEnabled(value: InstanceGetConfiguration.SettingStateMap[keyof InstanceGetConfiguration.SettingStateMap]): void;

    getMdnsEnabled(): InstanceGetConfiguration.SettingStateMap[keyof InstanceGetConfiguration.SettingStateMap];
    setMdnsEnabled(value: InstanceGetConfiguration.SettingStateMap[keyof InstanceGetConfiguration.SettingStateMap]): void;

    getRelayEnabled(): InstanceGetConfiguration.SettingStateMap[keyof InstanceGetConfiguration.SettingStateMap];
    setRelayEnabled(value: InstanceGetConfiguration.SettingStateMap[keyof InstanceGetConfiguration.SettingStateMap]): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
      accountPk: Uint8Array | string,
      devicePk: Uint8Array | string,
      accountGroupPk: Uint8Array | string,
      peerId: string,
      listenersList: Array<string>,
      bleEnabled: InstanceGetConfiguration.SettingStateMap[keyof InstanceGetConfiguration.SettingStateMap],
      wifiP2pEnabled: InstanceGetConfiguration.SettingStateMap[keyof InstanceGetConfiguration.SettingStateMap],
      mdnsEnabled: InstanceGetConfiguration.SettingStateMap[keyof InstanceGetConfiguration.SettingStateMap],
      relayEnabled: InstanceGetConfiguration.SettingStateMap[keyof InstanceGetConfiguration.SettingStateMap],
    }
  }

  export interface SettingStateMap {
    UNKNOWN: 0;
    ENABLED: 1;
    DISABLED: 2;
    UNAVAILABLE: 3;
  }

  export const SettingState: SettingStateMap;
}

export class ContactRequestReference extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactRequestReference.AsObject;
  static toObject(includeInstance: boolean, msg: ContactRequestReference): ContactRequestReference.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactRequestReference, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactRequestReference;
  static deserializeBinaryFromReader(message: ContactRequestReference, reader: jspb.BinaryReader): ContactRequestReference;
}

export namespace ContactRequestReference {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
    }
  }

  export class Reply extends jspb.Message {
    getPublicRendezvousSeed(): Uint8Array | string;
    getPublicRendezvousSeed_asU8(): Uint8Array;
    getPublicRendezvousSeed_asB64(): string;
    setPublicRendezvousSeed(value: Uint8Array | string): void;

    getEnabled(): boolean;
    setEnabled(value: boolean): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
      publicRendezvousSeed: Uint8Array | string,
      enabled: boolean,
    }
  }
}

export class ContactRequestDisable extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactRequestDisable.AsObject;
  static toObject(includeInstance: boolean, msg: ContactRequestDisable): ContactRequestDisable.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactRequestDisable, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactRequestDisable;
  static deserializeBinaryFromReader(message: ContactRequestDisable, reader: jspb.BinaryReader): ContactRequestDisable;
}

export namespace ContactRequestDisable {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
    }
  }

  export class Reply extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
    }
  }
}

export class ContactRequestEnable extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactRequestEnable.AsObject;
  static toObject(includeInstance: boolean, msg: ContactRequestEnable): ContactRequestEnable.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactRequestEnable, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactRequestEnable;
  static deserializeBinaryFromReader(message: ContactRequestEnable, reader: jspb.BinaryReader): ContactRequestEnable;
}

export namespace ContactRequestEnable {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
    }
  }

  export class Reply extends jspb.Message {
    getPublicRendezvousSeed(): Uint8Array | string;
    getPublicRendezvousSeed_asU8(): Uint8Array;
    getPublicRendezvousSeed_asB64(): string;
    setPublicRendezvousSeed(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
      publicRendezvousSeed: Uint8Array | string,
    }
  }
}

export class ContactRequestResetReference extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactRequestResetReference.AsObject;
  static toObject(includeInstance: boolean, msg: ContactRequestResetReference): ContactRequestResetReference.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactRequestResetReference, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactRequestResetReference;
  static deserializeBinaryFromReader(message: ContactRequestResetReference, reader: jspb.BinaryReader): ContactRequestResetReference;
}

export namespace ContactRequestResetReference {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
    }
  }

  export class Reply extends jspb.Message {
    getPublicRendezvousSeed(): Uint8Array | string;
    getPublicRendezvousSeed_asU8(): Uint8Array;
    getPublicRendezvousSeed_asB64(): string;
    setPublicRendezvousSeed(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
      publicRendezvousSeed: Uint8Array | string,
    }
  }
}

export class ContactRequestSend extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactRequestSend.AsObject;
  static toObject(includeInstance: boolean, msg: ContactRequestSend): ContactRequestSend.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactRequestSend, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactRequestSend;
  static deserializeBinaryFromReader(message: ContactRequestSend, reader: jspb.BinaryReader): ContactRequestSend;
}

export namespace ContactRequestSend {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    hasContact(): boolean;
    clearContact(): void;
    getContact(): ShareableContact | undefined;
    setContact(value?: ShareableContact): void;

    getOwnMetadata(): Uint8Array | string;
    getOwnMetadata_asU8(): Uint8Array;
    getOwnMetadata_asB64(): string;
    setOwnMetadata(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
      contact?: ShareableContact.AsObject,
      ownMetadata: Uint8Array | string,
    }
  }

  export class Reply extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
    }
  }
}

export class ContactRequestAccept extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactRequestAccept.AsObject;
  static toObject(includeInstance: boolean, msg: ContactRequestAccept): ContactRequestAccept.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactRequestAccept, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactRequestAccept;
  static deserializeBinaryFromReader(message: ContactRequestAccept, reader: jspb.BinaryReader): ContactRequestAccept;
}

export namespace ContactRequestAccept {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getContactPk(): Uint8Array | string;
    getContactPk_asU8(): Uint8Array;
    getContactPk_asB64(): string;
    setContactPk(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
      contactPk: Uint8Array | string,
    }
  }

  export class Reply extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
    }
  }
}

export class ContactRequestDiscard extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactRequestDiscard.AsObject;
  static toObject(includeInstance: boolean, msg: ContactRequestDiscard): ContactRequestDiscard.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactRequestDiscard, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactRequestDiscard;
  static deserializeBinaryFromReader(message: ContactRequestDiscard, reader: jspb.BinaryReader): ContactRequestDiscard;
}

export namespace ContactRequestDiscard {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getContactPk(): Uint8Array | string;
    getContactPk_asU8(): Uint8Array;
    getContactPk_asB64(): string;
    setContactPk(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
      contactPk: Uint8Array | string,
    }
  }

  export class Reply extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
    }
  }
}

export class ContactBlock extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactBlock.AsObject;
  static toObject(includeInstance: boolean, msg: ContactBlock): ContactBlock.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactBlock, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactBlock;
  static deserializeBinaryFromReader(message: ContactBlock, reader: jspb.BinaryReader): ContactBlock;
}

export namespace ContactBlock {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getContactPk(): Uint8Array | string;
    getContactPk_asU8(): Uint8Array;
    getContactPk_asB64(): string;
    setContactPk(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
      contactPk: Uint8Array | string,
    }
  }

  export class Reply extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
    }
  }
}

export class ContactUnblock extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactUnblock.AsObject;
  static toObject(includeInstance: boolean, msg: ContactUnblock): ContactUnblock.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactUnblock, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactUnblock;
  static deserializeBinaryFromReader(message: ContactUnblock, reader: jspb.BinaryReader): ContactUnblock;
}

export namespace ContactUnblock {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getContactPk(): Uint8Array | string;
    getContactPk_asU8(): Uint8Array;
    getContactPk_asB64(): string;
    setContactPk(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
      contactPk: Uint8Array | string,
    }
  }

  export class Reply extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
    }
  }
}

export class ContactAliasKeySend extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactAliasKeySend.AsObject;
  static toObject(includeInstance: boolean, msg: ContactAliasKeySend): ContactAliasKeySend.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactAliasKeySend, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactAliasKeySend;
  static deserializeBinaryFromReader(message: ContactAliasKeySend, reader: jspb.BinaryReader): ContactAliasKeySend;
}

export namespace ContactAliasKeySend {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getGroupPk(): Uint8Array | string;
    getGroupPk_asU8(): Uint8Array;
    getGroupPk_asB64(): string;
    setGroupPk(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
      groupPk: Uint8Array | string,
    }
  }

  export class Reply extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
    }
  }
}

export class MultiMemberGroupCreate extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MultiMemberGroupCreate.AsObject;
  static toObject(includeInstance: boolean, msg: MultiMemberGroupCreate): MultiMemberGroupCreate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MultiMemberGroupCreate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MultiMemberGroupCreate;
  static deserializeBinaryFromReader(message: MultiMemberGroupCreate, reader: jspb.BinaryReader): MultiMemberGroupCreate;
}

export namespace MultiMemberGroupCreate {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
    }
  }

  export class Reply extends jspb.Message {
    getGroupPk(): Uint8Array | string;
    getGroupPk_asU8(): Uint8Array;
    getGroupPk_asB64(): string;
    setGroupPk(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
      groupPk: Uint8Array | string,
    }
  }
}

export class MultiMemberGroupJoin extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MultiMemberGroupJoin.AsObject;
  static toObject(includeInstance: boolean, msg: MultiMemberGroupJoin): MultiMemberGroupJoin.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MultiMemberGroupJoin, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MultiMemberGroupJoin;
  static deserializeBinaryFromReader(message: MultiMemberGroupJoin, reader: jspb.BinaryReader): MultiMemberGroupJoin;
}

export namespace MultiMemberGroupJoin {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    hasGroup(): boolean;
    clearGroup(): void;
    getGroup(): Group | undefined;
    setGroup(value?: Group): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
      group?: Group.AsObject,
    }
  }

  export class Reply extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
    }
  }
}

export class MultiMemberGroupLeave extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MultiMemberGroupLeave.AsObject;
  static toObject(includeInstance: boolean, msg: MultiMemberGroupLeave): MultiMemberGroupLeave.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MultiMemberGroupLeave, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MultiMemberGroupLeave;
  static deserializeBinaryFromReader(message: MultiMemberGroupLeave, reader: jspb.BinaryReader): MultiMemberGroupLeave;
}

export namespace MultiMemberGroupLeave {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getGroupPk(): Uint8Array | string;
    getGroupPk_asU8(): Uint8Array;
    getGroupPk_asB64(): string;
    setGroupPk(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
      groupPk: Uint8Array | string,
    }
  }

  export class Reply extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
    }
  }
}

export class MultiMemberGroupAliasResolverDisclose extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MultiMemberGroupAliasResolverDisclose.AsObject;
  static toObject(includeInstance: boolean, msg: MultiMemberGroupAliasResolverDisclose): MultiMemberGroupAliasResolverDisclose.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MultiMemberGroupAliasResolverDisclose, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MultiMemberGroupAliasResolverDisclose;
  static deserializeBinaryFromReader(message: MultiMemberGroupAliasResolverDisclose, reader: jspb.BinaryReader): MultiMemberGroupAliasResolverDisclose;
}

export namespace MultiMemberGroupAliasResolverDisclose {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getGroupPk(): Uint8Array | string;
    getGroupPk_asU8(): Uint8Array;
    getGroupPk_asB64(): string;
    setGroupPk(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
      groupPk: Uint8Array | string,
    }
  }

  export class Reply extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
    }
  }
}

export class MultiMemberGroupAdminRoleGrant extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MultiMemberGroupAdminRoleGrant.AsObject;
  static toObject(includeInstance: boolean, msg: MultiMemberGroupAdminRoleGrant): MultiMemberGroupAdminRoleGrant.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MultiMemberGroupAdminRoleGrant, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MultiMemberGroupAdminRoleGrant;
  static deserializeBinaryFromReader(message: MultiMemberGroupAdminRoleGrant, reader: jspb.BinaryReader): MultiMemberGroupAdminRoleGrant;
}

export namespace MultiMemberGroupAdminRoleGrant {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getGroupPk(): Uint8Array | string;
    getGroupPk_asU8(): Uint8Array;
    getGroupPk_asB64(): string;
    setGroupPk(value: Uint8Array | string): void;

    getMemberPk(): Uint8Array | string;
    getMemberPk_asU8(): Uint8Array;
    getMemberPk_asB64(): string;
    setMemberPk(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
      groupPk: Uint8Array | string,
      memberPk: Uint8Array | string,
    }
  }

  export class Reply extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
    }
  }
}

export class MultiMemberGroupInvitationCreate extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MultiMemberGroupInvitationCreate.AsObject;
  static toObject(includeInstance: boolean, msg: MultiMemberGroupInvitationCreate): MultiMemberGroupInvitationCreate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MultiMemberGroupInvitationCreate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MultiMemberGroupInvitationCreate;
  static deserializeBinaryFromReader(message: MultiMemberGroupInvitationCreate, reader: jspb.BinaryReader): MultiMemberGroupInvitationCreate;
}

export namespace MultiMemberGroupInvitationCreate {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getGroupPk(): Uint8Array | string;
    getGroupPk_asU8(): Uint8Array;
    getGroupPk_asB64(): string;
    setGroupPk(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
      groupPk: Uint8Array | string,
    }
  }

  export class Reply extends jspb.Message {
    hasGroup(): boolean;
    clearGroup(): void;
    getGroup(): Group | undefined;
    setGroup(value?: Group): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
      group?: Group.AsObject,
    }
  }
}

export class AppMetadataSend extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AppMetadataSend.AsObject;
  static toObject(includeInstance: boolean, msg: AppMetadataSend): AppMetadataSend.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AppMetadataSend, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AppMetadataSend;
  static deserializeBinaryFromReader(message: AppMetadataSend, reader: jspb.BinaryReader): AppMetadataSend;
}

export namespace AppMetadataSend {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getGroupPk(): Uint8Array | string;
    getGroupPk_asU8(): Uint8Array;
    getGroupPk_asB64(): string;
    setGroupPk(value: Uint8Array | string): void;

    getPayload(): Uint8Array | string;
    getPayload_asU8(): Uint8Array;
    getPayload_asB64(): string;
    setPayload(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
      groupPk: Uint8Array | string,
      payload: Uint8Array | string,
    }
  }

  export class Reply extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
    }
  }
}

export class AppMessageSend extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AppMessageSend.AsObject;
  static toObject(includeInstance: boolean, msg: AppMessageSend): AppMessageSend.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AppMessageSend, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AppMessageSend;
  static deserializeBinaryFromReader(message: AppMessageSend, reader: jspb.BinaryReader): AppMessageSend;
}

export namespace AppMessageSend {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getGroupPk(): Uint8Array | string;
    getGroupPk_asU8(): Uint8Array;
    getGroupPk_asB64(): string;
    setGroupPk(value: Uint8Array | string): void;

    getPayload(): Uint8Array | string;
    getPayload_asU8(): Uint8Array;
    getPayload_asB64(): string;
    setPayload(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
      groupPk: Uint8Array | string,
      payload: Uint8Array | string,
    }
  }

  export class Reply extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
    }
  }
}

export class GroupMetadataEvent extends jspb.Message {
  hasEventContext(): boolean;
  clearEventContext(): void;
  getEventContext(): EventContext | undefined;
  setEventContext(value?: EventContext): void;

  hasMetadata(): boolean;
  clearMetadata(): void;
  getMetadata(): GroupMetadata | undefined;
  setMetadata(value?: GroupMetadata): void;

  getEvent(): Uint8Array | string;
  getEvent_asU8(): Uint8Array;
  getEvent_asB64(): string;
  setEvent(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupMetadataEvent.AsObject;
  static toObject(includeInstance: boolean, msg: GroupMetadataEvent): GroupMetadataEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupMetadataEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupMetadataEvent;
  static deserializeBinaryFromReader(message: GroupMetadataEvent, reader: jspb.BinaryReader): GroupMetadataEvent;
}

export namespace GroupMetadataEvent {
  export type AsObject = {
    eventContext?: EventContext.AsObject,
    metadata?: GroupMetadata.AsObject,
    event: Uint8Array | string,
  }
}

export class GroupMessageEvent extends jspb.Message {
  hasEventContext(): boolean;
  clearEventContext(): void;
  getEventContext(): EventContext | undefined;
  setEventContext(value?: EventContext): void;

  hasHeaders(): boolean;
  clearHeaders(): void;
  getHeaders(): MessageHeaders | undefined;
  setHeaders(value?: MessageHeaders): void;

  getMessage(): Uint8Array | string;
  getMessage_asU8(): Uint8Array;
  getMessage_asB64(): string;
  setMessage(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupMessageEvent.AsObject;
  static toObject(includeInstance: boolean, msg: GroupMessageEvent): GroupMessageEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupMessageEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupMessageEvent;
  static deserializeBinaryFromReader(message: GroupMessageEvent, reader: jspb.BinaryReader): GroupMessageEvent;
}

export namespace GroupMessageEvent {
  export type AsObject = {
    eventContext?: EventContext.AsObject,
    headers?: MessageHeaders.AsObject,
    message: Uint8Array | string,
  }
}

export class GroupMetadataSubscribe extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupMetadataSubscribe.AsObject;
  static toObject(includeInstance: boolean, msg: GroupMetadataSubscribe): GroupMetadataSubscribe.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupMetadataSubscribe, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupMetadataSubscribe;
  static deserializeBinaryFromReader(message: GroupMetadataSubscribe, reader: jspb.BinaryReader): GroupMetadataSubscribe;
}

export namespace GroupMetadataSubscribe {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getGroupPk(): Uint8Array | string;
    getGroupPk_asU8(): Uint8Array;
    getGroupPk_asB64(): string;
    setGroupPk(value: Uint8Array | string): void;

    getSince(): Uint8Array | string;
    getSince_asU8(): Uint8Array;
    getSince_asB64(): string;
    setSince(value: Uint8Array | string): void;

    getUntil(): Uint8Array | string;
    getUntil_asU8(): Uint8Array;
    getUntil_asB64(): string;
    setUntil(value: Uint8Array | string): void;

    getGoBackwards(): boolean;
    setGoBackwards(value: boolean): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
      groupPk: Uint8Array | string,
      since: Uint8Array | string,
      until: Uint8Array | string,
      goBackwards: boolean,
    }
  }
}

export class GroupMetadataList extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupMetadataList.AsObject;
  static toObject(includeInstance: boolean, msg: GroupMetadataList): GroupMetadataList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupMetadataList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupMetadataList;
  static deserializeBinaryFromReader(message: GroupMetadataList, reader: jspb.BinaryReader): GroupMetadataList;
}

export namespace GroupMetadataList {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getGroupPk(): Uint8Array | string;
    getGroupPk_asU8(): Uint8Array;
    getGroupPk_asB64(): string;
    setGroupPk(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
      groupPk: Uint8Array | string,
    }
  }
}

export class GroupMessageSubscribe extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupMessageSubscribe.AsObject;
  static toObject(includeInstance: boolean, msg: GroupMessageSubscribe): GroupMessageSubscribe.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupMessageSubscribe, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupMessageSubscribe;
  static deserializeBinaryFromReader(message: GroupMessageSubscribe, reader: jspb.BinaryReader): GroupMessageSubscribe;
}

export namespace GroupMessageSubscribe {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getGroupPk(): Uint8Array | string;
    getGroupPk_asU8(): Uint8Array;
    getGroupPk_asB64(): string;
    setGroupPk(value: Uint8Array | string): void;

    getSince(): Uint8Array | string;
    getSince_asU8(): Uint8Array;
    getSince_asB64(): string;
    setSince(value: Uint8Array | string): void;

    getUntil(): Uint8Array | string;
    getUntil_asU8(): Uint8Array;
    getUntil_asB64(): string;
    setUntil(value: Uint8Array | string): void;

    getGoBackwards(): boolean;
    setGoBackwards(value: boolean): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
      groupPk: Uint8Array | string,
      since: Uint8Array | string,
      until: Uint8Array | string,
      goBackwards: boolean,
    }
  }
}

export class GroupMessageList extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupMessageList.AsObject;
  static toObject(includeInstance: boolean, msg: GroupMessageList): GroupMessageList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupMessageList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupMessageList;
  static deserializeBinaryFromReader(message: GroupMessageList, reader: jspb.BinaryReader): GroupMessageList;
}

export namespace GroupMessageList {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getGroupPk(): Uint8Array | string;
    getGroupPk_asU8(): Uint8Array;
    getGroupPk_asB64(): string;
    setGroupPk(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
      groupPk: Uint8Array | string,
    }
  }
}

export class GroupInfo extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GroupInfo.AsObject;
  static toObject(includeInstance: boolean, msg: GroupInfo): GroupInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GroupInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GroupInfo;
  static deserializeBinaryFromReader(message: GroupInfo, reader: jspb.BinaryReader): GroupInfo;
}

export namespace GroupInfo {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getGroupPk(): Uint8Array | string;
    getGroupPk_asU8(): Uint8Array;
    getGroupPk_asB64(): string;
    setGroupPk(value: Uint8Array | string): void;

    getContactPk(): Uint8Array | string;
    getContactPk_asU8(): Uint8Array;
    getContactPk_asB64(): string;
    setContactPk(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
      groupPk: Uint8Array | string,
      contactPk: Uint8Array | string,
    }
  }

  export class Reply extends jspb.Message {
    hasGroup(): boolean;
    clearGroup(): void;
    getGroup(): Group | undefined;
    setGroup(value?: Group): void;

    getMemberPk(): Uint8Array | string;
    getMemberPk_asU8(): Uint8Array;
    getMemberPk_asB64(): string;
    setMemberPk(value: Uint8Array | string): void;

    getDevicePk(): Uint8Array | string;
    getDevicePk_asU8(): Uint8Array;
    getDevicePk_asB64(): string;
    setDevicePk(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
      group?: Group.AsObject,
      memberPk: Uint8Array | string,
      devicePk: Uint8Array | string,
    }
  }
}

export class ActivateGroup extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ActivateGroup.AsObject;
  static toObject(includeInstance: boolean, msg: ActivateGroup): ActivateGroup.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ActivateGroup, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ActivateGroup;
  static deserializeBinaryFromReader(message: ActivateGroup, reader: jspb.BinaryReader): ActivateGroup;
}

export namespace ActivateGroup {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getGroupPk(): Uint8Array | string;
    getGroupPk_asU8(): Uint8Array;
    getGroupPk_asB64(): string;
    setGroupPk(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
      groupPk: Uint8Array | string,
    }
  }

  export class Reply extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
    }
  }
}

export class DeactivateGroup extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeactivateGroup.AsObject;
  static toObject(includeInstance: boolean, msg: DeactivateGroup): DeactivateGroup.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DeactivateGroup, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeactivateGroup;
  static deserializeBinaryFromReader(message: DeactivateGroup, reader: jspb.BinaryReader): DeactivateGroup;
}

export namespace DeactivateGroup {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getGroupPk(): Uint8Array | string;
    getGroupPk_asU8(): Uint8Array;
    getGroupPk_asB64(): string;
    setGroupPk(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
      groupPk: Uint8Array | string,
    }
  }

  export class Reply extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
    }
  }
}

export class DebugListGroups extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DebugListGroups.AsObject;
  static toObject(includeInstance: boolean, msg: DebugListGroups): DebugListGroups.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DebugListGroups, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DebugListGroups;
  static deserializeBinaryFromReader(message: DebugListGroups, reader: jspb.BinaryReader): DebugListGroups;
}

export namespace DebugListGroups {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
    }
  }

  export class Reply extends jspb.Message {
    getGroupPk(): Uint8Array | string;
    getGroupPk_asU8(): Uint8Array;
    getGroupPk_asB64(): string;
    setGroupPk(value: Uint8Array | string): void;

    getGroupType(): GroupTypeMap[keyof GroupTypeMap];
    setGroupType(value: GroupTypeMap[keyof GroupTypeMap]): void;

    getContactPk(): Uint8Array | string;
    getContactPk_asU8(): Uint8Array;
    getContactPk_asB64(): string;
    setContactPk(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
      groupPk: Uint8Array | string,
      groupType: GroupTypeMap[keyof GroupTypeMap],
      contactPk: Uint8Array | string,
    }
  }
}

export class DebugInspectGroupStore extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DebugInspectGroupStore.AsObject;
  static toObject(includeInstance: boolean, msg: DebugInspectGroupStore): DebugInspectGroupStore.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DebugInspectGroupStore, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DebugInspectGroupStore;
  static deserializeBinaryFromReader(message: DebugInspectGroupStore, reader: jspb.BinaryReader): DebugInspectGroupStore;
}

export namespace DebugInspectGroupStore {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getGroupPk(): Uint8Array | string;
    getGroupPk_asU8(): Uint8Array;
    getGroupPk_asB64(): string;
    setGroupPk(value: Uint8Array | string): void;

    getLogType(): DebugInspectGroupLogTypeMap[keyof DebugInspectGroupLogTypeMap];
    setLogType(value: DebugInspectGroupLogTypeMap[keyof DebugInspectGroupLogTypeMap]): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
      groupPk: Uint8Array | string,
      logType: DebugInspectGroupLogTypeMap[keyof DebugInspectGroupLogTypeMap],
    }
  }

  export class Reply extends jspb.Message {
    getCid(): Uint8Array | string;
    getCid_asU8(): Uint8Array;
    getCid_asB64(): string;
    setCid(value: Uint8Array | string): void;

    clearParentCidsList(): void;
    getParentCidsList(): Array<Uint8Array | string>;
    getParentCidsList_asU8(): Array<Uint8Array>;
    getParentCidsList_asB64(): Array<string>;
    setParentCidsList(value: Array<Uint8Array | string>): void;
    addParentCids(value: Uint8Array | string, index?: number): Uint8Array | string;

    getMetadataEventType(): EventTypeMap[keyof EventTypeMap];
    setMetadataEventType(value: EventTypeMap[keyof EventTypeMap]): void;

    getDevicePk(): Uint8Array | string;
    getDevicePk_asU8(): Uint8Array;
    getDevicePk_asB64(): string;
    setDevicePk(value: Uint8Array | string): void;

    getPayload(): Uint8Array | string;
    getPayload_asU8(): Uint8Array;
    getPayload_asB64(): string;
    setPayload(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
      cid: Uint8Array | string,
      parentCidsList: Array<Uint8Array | string>,
      metadataEventType: EventTypeMap[keyof EventTypeMap],
      devicePk: Uint8Array | string,
      payload: Uint8Array | string,
    }
  }
}

export class DebugGroup extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DebugGroup.AsObject;
  static toObject(includeInstance: boolean, msg: DebugGroup): DebugGroup.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DebugGroup, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DebugGroup;
  static deserializeBinaryFromReader(message: DebugGroup, reader: jspb.BinaryReader): DebugGroup;
}

export namespace DebugGroup {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getGroupPk(): Uint8Array | string;
    getGroupPk_asU8(): Uint8Array;
    getGroupPk_asB64(): string;
    setGroupPk(value: Uint8Array | string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Request.AsObject;
    static toObject(includeInstance: boolean, msg: Request): Request.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Request, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Request;
    static deserializeBinaryFromReader(message: Request, reader: jspb.BinaryReader): Request;
  }

  export namespace Request {
    export type AsObject = {
      groupPk: Uint8Array | string,
    }
  }

  export class Reply extends jspb.Message {
    clearPeerIdsList(): void;
    getPeerIdsList(): Array<string>;
    setPeerIdsList(value: Array<string>): void;
    addPeerIds(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Reply.AsObject;
    static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Reply;
    static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
  }

  export namespace Reply {
    export type AsObject = {
      peerIdsList: Array<string>,
    }
  }
}

export class ShareableContact extends jspb.Message {
  getPk(): Uint8Array | string;
  getPk_asU8(): Uint8Array;
  getPk_asB64(): string;
  setPk(value: Uint8Array | string): void;

  getPublicRendezvousSeed(): Uint8Array | string;
  getPublicRendezvousSeed_asU8(): Uint8Array;
  getPublicRendezvousSeed_asB64(): string;
  setPublicRendezvousSeed(value: Uint8Array | string): void;

  getMetadata(): Uint8Array | string;
  getMetadata_asU8(): Uint8Array;
  getMetadata_asB64(): string;
  setMetadata(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ShareableContact.AsObject;
  static toObject(includeInstance: boolean, msg: ShareableContact): ShareableContact.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ShareableContact, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ShareableContact;
  static deserializeBinaryFromReader(message: ShareableContact, reader: jspb.BinaryReader): ShareableContact;
}

export namespace ShareableContact {
  export type AsObject = {
    pk: Uint8Array | string,
    publicRendezvousSeed: Uint8Array | string,
    metadata: Uint8Array | string,
  }
}

export interface GroupTypeMap {
  GROUPTYPEUNDEFINED: 0;
  GROUPTYPEACCOUNT: 1;
  GROUPTYPECONTACT: 2;
  GROUPTYPEMULTIMEMBER: 3;
}

export const GroupType: GroupTypeMap;

export interface EventTypeMap {
  EVENTTYPEUNDEFINED: 0;
  EVENTTYPEGROUPMEMBERDEVICEADDED: 1;
  EVENTTYPEGROUPDEVICESECRETADDED: 2;
  EVENTTYPEACCOUNTGROUPJOINED: 101;
  EVENTTYPEACCOUNTGROUPLEFT: 102;
  EVENTTYPEACCOUNTCONTACTREQUESTDISABLED: 103;
  EVENTTYPEACCOUNTCONTACTREQUESTENABLED: 104;
  EVENTTYPEACCOUNTCONTACTREQUESTREFERENCERESET: 105;
  EVENTTYPEACCOUNTCONTACTREQUESTOUTGOINGENQUEUED: 106;
  EVENTTYPEACCOUNTCONTACTREQUESTOUTGOINGSENT: 107;
  EVENTTYPEACCOUNTCONTACTREQUESTINCOMINGRECEIVED: 108;
  EVENTTYPEACCOUNTCONTACTREQUESTINCOMINGDISCARDED: 109;
  EVENTTYPEACCOUNTCONTACTREQUESTINCOMINGACCEPTED: 110;
  EVENTTYPEACCOUNTCONTACTBLOCKED: 111;
  EVENTTYPEACCOUNTCONTACTUNBLOCKED: 112;
  EVENTTYPECONTACTALIASKEYADDED: 201;
  EVENTTYPEMULTIMEMBERGROUPALIASRESOLVERADDED: 301;
  EVENTTYPEMULTIMEMBERGROUPINITIALMEMBERANNOUNCED: 302;
  EVENTTYPEMULTIMEMBERGROUPADMINROLEGRANTED: 303;
  EVENTTYPEGROUPMETADATAPAYLOADSENT: 1001;
}

export const EventType: EventTypeMap;

export interface DebugInspectGroupLogTypeMap {
  DEBUGINSPECTGROUPLOGTYPEUNDEFINED: 0;
  DEBUGINSPECTGROUPLOGTYPEMESSAGE: 1;
  DEBUGINSPECTGROUPLOGTYPEMETADATA: 2;
}

export const DebugInspectGroupLogType: DebugInspectGroupLogTypeMap;

export interface ContactStateMap {
  CONTACTSTATEUNDEFINED: 0;
  CONTACTSTATETOREQUEST: 1;
  CONTACTSTATERECEIVED: 2;
  CONTACTSTATEADDED: 3;
  CONTACTSTATEREMOVED: 4;
  CONTACTSTATEDISCARDED: 5;
  CONTACTSTATEBLOCKED: 6;
}

export const ContactState: ContactStateMap;

