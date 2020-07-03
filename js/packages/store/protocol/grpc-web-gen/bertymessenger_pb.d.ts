// package: berty.messenger.v1
// file: bertymessenger.proto

import * as jspb from "google-protobuf";
import * as github_com_gogo_protobuf_gogoproto_gogo_pb from "./github.com/gogo/protobuf/gogoproto/gogo_pb";
import * as bertytypes_pb from "./bertytypes_pb";

export class InstanceShareableBertyID extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InstanceShareableBertyID.AsObject;
  static toObject(includeInstance: boolean, msg: InstanceShareableBertyID): InstanceShareableBertyID.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: InstanceShareableBertyID, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InstanceShareableBertyID;
  static deserializeBinaryFromReader(message: InstanceShareableBertyID, reader: jspb.BinaryReader): InstanceShareableBertyID;
}

export namespace InstanceShareableBertyID {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getReset(): boolean;
    setReset(value: boolean): void;

    getDisplayName(): string;
    setDisplayName(value: string): void;

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
      reset: boolean,
      displayName: string,
    }
  }

  export class Reply extends jspb.Message {
    hasBertyId(): boolean;
    clearBertyId(): void;
    getBertyId(): BertyID | undefined;
    setBertyId(value?: BertyID): void;

    getBertyIdPayload(): string;
    setBertyIdPayload(value: string): void;

    getDeepLink(): string;
    setDeepLink(value: string): void;

    getHtmlUrl(): string;
    setHtmlUrl(value: string): void;

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
      bertyId?: BertyID.AsObject,
      bertyIdPayload: string,
      deepLink: string,
      htmlUrl: string,
    }
  }
}

export class ShareableBertyGroup extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ShareableBertyGroup.AsObject;
  static toObject(includeInstance: boolean, msg: ShareableBertyGroup): ShareableBertyGroup.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ShareableBertyGroup, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ShareableBertyGroup;
  static deserializeBinaryFromReader(message: ShareableBertyGroup, reader: jspb.BinaryReader): ShareableBertyGroup;
}

export namespace ShareableBertyGroup {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getGroupPk(): Uint8Array | string;
    getGroupPk_asU8(): Uint8Array;
    getGroupPk_asB64(): string;
    setGroupPk(value: Uint8Array | string): void;

    getGroupName(): string;
    setGroupName(value: string): void;

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
      groupName: string,
    }
  }

  export class Reply extends jspb.Message {
    hasBertyGroup(): boolean;
    clearBertyGroup(): void;
    getBertyGroup(): BertyGroup | undefined;
    setBertyGroup(value?: BertyGroup): void;

    getBertyGroupPayload(): string;
    setBertyGroupPayload(value: string): void;

    getDeepLink(): string;
    setDeepLink(value: string): void;

    getHtmlUrl(): string;
    setHtmlUrl(value: string): void;

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
      bertyGroup?: BertyGroup.AsObject,
      bertyGroupPayload: string,
      deepLink: string,
      htmlUrl: string,
    }
  }
}

export class DevShareInstanceBertyID extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DevShareInstanceBertyID.AsObject;
  static toObject(includeInstance: boolean, msg: DevShareInstanceBertyID): DevShareInstanceBertyID.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DevShareInstanceBertyID, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DevShareInstanceBertyID;
  static deserializeBinaryFromReader(message: DevShareInstanceBertyID, reader: jspb.BinaryReader): DevShareInstanceBertyID;
}

export namespace DevShareInstanceBertyID {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getReset(): boolean;
    setReset(value: boolean): void;

    getDisplayName(): string;
    setDisplayName(value: string): void;

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
      reset: boolean,
      displayName: string,
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

export class ParseDeepLink extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ParseDeepLink.AsObject;
  static toObject(includeInstance: boolean, msg: ParseDeepLink): ParseDeepLink.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ParseDeepLink, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ParseDeepLink;
  static deserializeBinaryFromReader(message: ParseDeepLink, reader: jspb.BinaryReader): ParseDeepLink;
}

export namespace ParseDeepLink {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getLink(): string;
    setLink(value: string): void;

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
      link: string,
    }
  }

  export class Reply extends jspb.Message {
    getKind(): ParseDeepLink.KindMap[keyof ParseDeepLink.KindMap];
    setKind(value: ParseDeepLink.KindMap[keyof ParseDeepLink.KindMap]): void;

    hasBertyId(): boolean;
    clearBertyId(): void;
    getBertyId(): BertyID | undefined;
    setBertyId(value?: BertyID): void;

    hasBertyGroup(): boolean;
    clearBertyGroup(): void;
    getBertyGroup(): BertyGroup | undefined;
    setBertyGroup(value?: BertyGroup): void;

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
      kind: ParseDeepLink.KindMap[keyof ParseDeepLink.KindMap],
      bertyId?: BertyID.AsObject,
      bertyGroup?: BertyGroup.AsObject,
    }
  }

  export interface KindMap {
    UNKNOWNKIND: 0;
    BERTYID: 1;
    BERTYGROUP: 2;
  }

  export const Kind: KindMap;
}

export class SendContactRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendContactRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SendContactRequest): SendContactRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SendContactRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendContactRequest;
  static deserializeBinaryFromReader(message: SendContactRequest, reader: jspb.BinaryReader): SendContactRequest;
}

export namespace SendContactRequest {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    hasBertyId(): boolean;
    clearBertyId(): void;
    getBertyId(): BertyID | undefined;
    setBertyId(value?: BertyID): void;

    getMetadata(): Uint8Array | string;
    getMetadata_asU8(): Uint8Array;
    getMetadata_asB64(): string;
    setMetadata(value: Uint8Array | string): void;

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
      bertyId?: BertyID.AsObject,
      metadata: Uint8Array | string,
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

export class SendAck extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendAck.AsObject;
  static toObject(includeInstance: boolean, msg: SendAck): SendAck.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SendAck, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendAck;
  static deserializeBinaryFromReader(message: SendAck, reader: jspb.BinaryReader): SendAck;
}

export namespace SendAck {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getGroupPk(): Uint8Array | string;
    getGroupPk_asU8(): Uint8Array;
    getGroupPk_asB64(): string;
    setGroupPk(value: Uint8Array | string): void;

    getMessageId(): Uint8Array | string;
    getMessageId_asU8(): Uint8Array;
    getMessageId_asB64(): string;
    setMessageId(value: Uint8Array | string): void;

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
      messageId: Uint8Array | string,
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

export class SendMessage extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendMessage.AsObject;
  static toObject(includeInstance: boolean, msg: SendMessage): SendMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SendMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendMessage;
  static deserializeBinaryFromReader(message: SendMessage, reader: jspb.BinaryReader): SendMessage;
}

export namespace SendMessage {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getGroupPk(): Uint8Array | string;
    getGroupPk_asU8(): Uint8Array;
    getGroupPk_asB64(): string;
    setGroupPk(value: Uint8Array | string): void;

    getMessage(): string;
    setMessage(value: string): void;

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
      message: string,
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

export class BertyID extends jspb.Message {
  getPublicRendezvousSeed(): Uint8Array | string;
  getPublicRendezvousSeed_asU8(): Uint8Array;
  getPublicRendezvousSeed_asB64(): string;
  setPublicRendezvousSeed(value: Uint8Array | string): void;

  getAccountPk(): Uint8Array | string;
  getAccountPk_asU8(): Uint8Array;
  getAccountPk_asB64(): string;
  setAccountPk(value: Uint8Array | string): void;

  getDisplayName(): string;
  setDisplayName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BertyID.AsObject;
  static toObject(includeInstance: boolean, msg: BertyID): BertyID.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BertyID, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BertyID;
  static deserializeBinaryFromReader(message: BertyID, reader: jspb.BinaryReader): BertyID;
}

export namespace BertyID {
  export type AsObject = {
    publicRendezvousSeed: Uint8Array | string,
    accountPk: Uint8Array | string,
    displayName: string,
  }
}

export class BertyGroup extends jspb.Message {
  hasGroup(): boolean;
  clearGroup(): void;
  getGroup(): bertytypes_pb.Group | undefined;
  setGroup(value?: bertytypes_pb.Group): void;

  getDisplayName(): string;
  setDisplayName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BertyGroup.AsObject;
  static toObject(includeInstance: boolean, msg: BertyGroup): BertyGroup.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BertyGroup, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BertyGroup;
  static deserializeBinaryFromReader(message: BertyGroup, reader: jspb.BinaryReader): BertyGroup;
}

export namespace BertyGroup {
  export type AsObject = {
    group?: bertytypes_pb.Group.AsObject,
    displayName: string,
  }
}

export class AppMessageTyped extends jspb.Message {
  getType(): AppMessageTypeMap[keyof AppMessageTypeMap];
  setType(value: AppMessageTypeMap[keyof AppMessageTypeMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AppMessageTyped.AsObject;
  static toObject(includeInstance: boolean, msg: AppMessageTyped): AppMessageTyped.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AppMessageTyped, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AppMessageTyped;
  static deserializeBinaryFromReader(message: AppMessageTyped, reader: jspb.BinaryReader): AppMessageTyped;
}

export namespace AppMessageTyped {
  export type AsObject = {
    type: AppMessageTypeMap[keyof AppMessageTypeMap],
  }
}

export class UserMessageAttachment extends jspb.Message {
  getType(): AppMessageTypeMap[keyof AppMessageTypeMap];
  setType(value: AppMessageTypeMap[keyof AppMessageTypeMap]): void;

  getUri(): string;
  setUri(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UserMessageAttachment.AsObject;
  static toObject(includeInstance: boolean, msg: UserMessageAttachment): UserMessageAttachment.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UserMessageAttachment, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UserMessageAttachment;
  static deserializeBinaryFromReader(message: UserMessageAttachment, reader: jspb.BinaryReader): UserMessageAttachment;
}

export namespace UserMessageAttachment {
  export type AsObject = {
    type: AppMessageTypeMap[keyof AppMessageTypeMap],
    uri: string,
  }
}

export class PayloadUserMessage extends jspb.Message {
  getType(): AppMessageTypeMap[keyof AppMessageTypeMap];
  setType(value: AppMessageTypeMap[keyof AppMessageTypeMap]): void;

  getBody(): string;
  setBody(value: string): void;

  clearAttachmentsList(): void;
  getAttachmentsList(): Array<UserMessageAttachment>;
  setAttachmentsList(value: Array<UserMessageAttachment>): void;
  addAttachments(value?: UserMessageAttachment, index?: number): UserMessageAttachment;

  getSentDate(): number;
  setSentDate(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PayloadUserMessage.AsObject;
  static toObject(includeInstance: boolean, msg: PayloadUserMessage): PayloadUserMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PayloadUserMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PayloadUserMessage;
  static deserializeBinaryFromReader(message: PayloadUserMessage, reader: jspb.BinaryReader): PayloadUserMessage;
}

export namespace PayloadUserMessage {
  export type AsObject = {
    type: AppMessageTypeMap[keyof AppMessageTypeMap],
    body: string,
    attachmentsList: Array<UserMessageAttachment.AsObject>,
    sentDate: number,
  }
}

export class PayloadUserReaction extends jspb.Message {
  getType(): AppMessageTypeMap[keyof AppMessageTypeMap];
  setType(value: AppMessageTypeMap[keyof AppMessageTypeMap]): void;

  getEmoji(): string;
  setEmoji(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PayloadUserReaction.AsObject;
  static toObject(includeInstance: boolean, msg: PayloadUserReaction): PayloadUserReaction.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PayloadUserReaction, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PayloadUserReaction;
  static deserializeBinaryFromReader(message: PayloadUserReaction, reader: jspb.BinaryReader): PayloadUserReaction;
}

export namespace PayloadUserReaction {
  export type AsObject = {
    type: AppMessageTypeMap[keyof AppMessageTypeMap],
    emoji: string,
  }
}

export class PayloadGroupInvitation extends jspb.Message {
  getType(): AppMessageTypeMap[keyof AppMessageTypeMap];
  setType(value: AppMessageTypeMap[keyof AppMessageTypeMap]): void;

  getGroupPk(): string;
  setGroupPk(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PayloadGroupInvitation.AsObject;
  static toObject(includeInstance: boolean, msg: PayloadGroupInvitation): PayloadGroupInvitation.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PayloadGroupInvitation, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PayloadGroupInvitation;
  static deserializeBinaryFromReader(message: PayloadGroupInvitation, reader: jspb.BinaryReader): PayloadGroupInvitation;
}

export namespace PayloadGroupInvitation {
  export type AsObject = {
    type: AppMessageTypeMap[keyof AppMessageTypeMap],
    groupPk: string,
  }
}

export class PayloadSetGroupName extends jspb.Message {
  getType(): AppMessageTypeMap[keyof AppMessageTypeMap];
  setType(value: AppMessageTypeMap[keyof AppMessageTypeMap]): void;

  getName(): string;
  setName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PayloadSetGroupName.AsObject;
  static toObject(includeInstance: boolean, msg: PayloadSetGroupName): PayloadSetGroupName.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PayloadSetGroupName, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PayloadSetGroupName;
  static deserializeBinaryFromReader(message: PayloadSetGroupName, reader: jspb.BinaryReader): PayloadSetGroupName;
}

export namespace PayloadSetGroupName {
  export type AsObject = {
    type: AppMessageTypeMap[keyof AppMessageTypeMap],
    name: string,
  }
}

export class PayloadAcknowledge extends jspb.Message {
  getType(): AppMessageTypeMap[keyof AppMessageTypeMap];
  setType(value: AppMessageTypeMap[keyof AppMessageTypeMap]): void;

  getTarget(): string;
  setTarget(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PayloadAcknowledge.AsObject;
  static toObject(includeInstance: boolean, msg: PayloadAcknowledge): PayloadAcknowledge.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PayloadAcknowledge, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PayloadAcknowledge;
  static deserializeBinaryFromReader(message: PayloadAcknowledge, reader: jspb.BinaryReader): PayloadAcknowledge;
}

export namespace PayloadAcknowledge {
  export type AsObject = {
    type: AppMessageTypeMap[keyof AppMessageTypeMap],
    target: string,
  }
}

export class SystemInfo extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemInfo.AsObject;
  static toObject(includeInstance: boolean, msg: SystemInfo): SystemInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SystemInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemInfo;
  static deserializeBinaryFromReader(message: SystemInfo, reader: jspb.BinaryReader): SystemInfo;
}

export namespace SystemInfo {
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
    getRlimitCur(): number;
    setRlimitCur(value: number): void;

    getNumGoroutine(): number;
    setNumGoroutine(value: number): void;

    getConnectedPeers(): number;
    setConnectedPeers(value: number): void;

    getNofile(): number;
    setNofile(value: number): void;

    getStartedAt(): number;
    setStartedAt(value: number): void;

    getNumCpu(): number;
    setNumCpu(value: number): void;

    getGoVersion(): string;
    setGoVersion(value: string): void;

    getOperatingSystem(): string;
    setOperatingSystem(value: string): void;

    getHostName(): string;
    setHostName(value: string): void;

    getArch(): string;
    setArch(value: string): void;

    getVersion(): string;
    setVersion(value: string): void;

    getVcsRef(): string;
    setVcsRef(value: string): void;

    getBuildTime(): number;
    setBuildTime(value: number): void;

    getSelfRusage(): string;
    setSelfRusage(value: string): void;

    getChildrenRusage(): string;
    setChildrenRusage(value: string): void;

    getRlimitMax(): number;
    setRlimitMax(value: number): void;

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
      rlimitCur: number,
      numGoroutine: number,
      connectedPeers: number,
      nofile: number,
      startedAt: number,
      numCpu: number,
      goVersion: string,
      operatingSystem: string,
      hostName: string,
      arch: string,
      version: string,
      vcsRef: string,
      buildTime: number,
      selfRusage: string,
      childrenRusage: string,
      rlimitMax: number,
    }
  }
}

export interface AppMessageTypeMap {
  UNDEFINED: 0;
  USERMESSAGE: 1;
  USERREACTION: 2;
  GROUPINVITATION: 3;
  SETGROUPNAME: 4;
  ACKNOWLEDGE: 5;
}

export const AppMessageType: AppMessageTypeMap;

