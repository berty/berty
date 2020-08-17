// package: berty.messenger.v1
// file: bertymessenger.proto

import * as jspb from "google-protobuf";
import * as github_com_gogo_protobuf_gogoproto_gogo_pb from "./github.com/gogo/protobuf/gogoproto/gogo_pb";
import * as bertytypes_pb from "./bertytypes_pb";

export class EchoTest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EchoTest.AsObject;
  static toObject(includeInstance: boolean, msg: EchoTest): EchoTest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EchoTest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EchoTest;
  static deserializeBinaryFromReader(message: EchoTest, reader: jspb.BinaryReader): EchoTest;
}

export namespace EchoTest {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getDelay(): number;
    setDelay(value: number): void;

    getEcho(): string;
    setEcho(value: string): void;

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
      delay: number,
      echo: string,
    }
  }

  export class Reply extends jspb.Message {
    getEcho(): string;
    setEcho(value: string): void;

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
      echo: string,
    }
  }
}

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

export class UserMessageAttachment extends jspb.Message {
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
    uri: string,
  }
}

export class AppMessage extends jspb.Message {
  getType(): AppMessage.TypeMap[keyof AppMessage.TypeMap];
  setType(value: AppMessage.TypeMap[keyof AppMessage.TypeMap]): void;

  getPayload(): Uint8Array | string;
  getPayload_asU8(): Uint8Array;
  getPayload_asB64(): string;
  setPayload(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AppMessage.AsObject;
  static toObject(includeInstance: boolean, msg: AppMessage): AppMessage.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AppMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AppMessage;
  static deserializeBinaryFromReader(message: AppMessage, reader: jspb.BinaryReader): AppMessage;
}

export namespace AppMessage {
  export type AsObject = {
    type: AppMessage.TypeMap[keyof AppMessage.TypeMap],
    payload: Uint8Array | string,
  }

  export class UserMessage extends jspb.Message {
    getBody(): string;
    setBody(value: string): void;

    clearAttachmentsList(): void;
    getAttachmentsList(): Array<UserMessageAttachment>;
    setAttachmentsList(value: Array<UserMessageAttachment>): void;
    addAttachments(value?: UserMessageAttachment, index?: number): UserMessageAttachment;

    getSentDate(): number;
    setSentDate(value: number): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UserMessage.AsObject;
    static toObject(includeInstance: boolean, msg: UserMessage): UserMessage.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UserMessage, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UserMessage;
    static deserializeBinaryFromReader(message: UserMessage, reader: jspb.BinaryReader): UserMessage;
  }

  export namespace UserMessage {
    export type AsObject = {
      body: string,
      attachmentsList: Array<UserMessageAttachment.AsObject>,
      sentDate: number,
    }
  }

  export class UserReaction extends jspb.Message {
    getEmoji(): string;
    setEmoji(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): UserReaction.AsObject;
    static toObject(includeInstance: boolean, msg: UserReaction): UserReaction.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: UserReaction, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): UserReaction;
    static deserializeBinaryFromReader(message: UserReaction, reader: jspb.BinaryReader): UserReaction;
  }

  export namespace UserReaction {
    export type AsObject = {
      emoji: string,
    }
  }

  export class GroupInvitation extends jspb.Message {
    getLink(): string;
    setLink(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): GroupInvitation.AsObject;
    static toObject(includeInstance: boolean, msg: GroupInvitation): GroupInvitation.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: GroupInvitation, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): GroupInvitation;
    static deserializeBinaryFromReader(message: GroupInvitation, reader: jspb.BinaryReader): GroupInvitation;
  }

  export namespace GroupInvitation {
    export type AsObject = {
      link: string,
    }
  }

  export class SetGroupName extends jspb.Message {
    getName(): string;
    setName(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SetGroupName.AsObject;
    static toObject(includeInstance: boolean, msg: SetGroupName): SetGroupName.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SetGroupName, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SetGroupName;
    static deserializeBinaryFromReader(message: SetGroupName, reader: jspb.BinaryReader): SetGroupName;
  }

  export namespace SetGroupName {
    export type AsObject = {
      name: string,
    }
  }

  export class SetUserName extends jspb.Message {
    getName(): string;
    setName(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): SetUserName.AsObject;
    static toObject(includeInstance: boolean, msg: SetUserName): SetUserName.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: SetUserName, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): SetUserName;
    static deserializeBinaryFromReader(message: SetUserName, reader: jspb.BinaryReader): SetUserName;
  }

  export namespace SetUserName {
    export type AsObject = {
      name: string,
    }
  }

  export class Acknowledge extends jspb.Message {
    getTarget(): string;
    setTarget(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Acknowledge.AsObject;
    static toObject(includeInstance: boolean, msg: Acknowledge): Acknowledge.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Acknowledge, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Acknowledge;
    static deserializeBinaryFromReader(message: Acknowledge, reader: jspb.BinaryReader): Acknowledge;
  }

  export namespace Acknowledge {
    export type AsObject = {
      target: string,
    }
  }

  export interface TypeMap {
    TYPEUNDEFINED: 0;
    TYPEUSERMESSAGE: 1;
    TYPEUSERREACTION: 2;
    TYPEGROUPINVITATION: 3;
    TYPESETGROUPNAME: 4;
    TYPESETUSERNAME: 5;
    TYPEACKNOWLEDGE: 6;
  }

  export const Type: TypeMap;
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

    getTooManyOpenFiles(): boolean;
    setTooManyOpenFiles(value: boolean): void;

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
      tooManyOpenFiles: boolean,
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

export class ConversationJoin extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConversationJoin.AsObject;
  static toObject(includeInstance: boolean, msg: ConversationJoin): ConversationJoin.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ConversationJoin, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConversationJoin;
  static deserializeBinaryFromReader(message: ConversationJoin, reader: jspb.BinaryReader): ConversationJoin;
}

export namespace ConversationJoin {
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

export class Account extends jspb.Message {
  getPublicKey(): string;
  setPublicKey(value: string): void;

  getDisplayName(): string;
  setDisplayName(value: string): void;

  getLink(): string;
  setLink(value: string): void;

  getState(): Account.StateMap[keyof Account.StateMap];
  setState(value: Account.StateMap[keyof Account.StateMap]): void;

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
    publicKey: string,
    displayName: string,
    link: string,
    state: Account.StateMap[keyof Account.StateMap],
  }

  export interface StateMap {
    UNDEFINED: 0;
    NOTREADY: 1;
    READY: 2;
  }

  export const State: StateMap;
}

export class Interaction extends jspb.Message {
  getCid(): string;
  setCid(value: string): void;

  getType(): AppMessage.TypeMap[keyof AppMessage.TypeMap];
  setType(value: AppMessage.TypeMap[keyof AppMessage.TypeMap]): void;

  getConversationPublicKey(): string;
  setConversationPublicKey(value: string): void;

  hasConversation(): boolean;
  clearConversation(): void;
  getConversation(): Conversation | undefined;
  setConversation(value?: Conversation): void;

  getPayload(): Uint8Array | string;
  getPayload_asU8(): Uint8Array;
  getPayload_asB64(): string;
  setPayload(value: Uint8Array | string): void;

  getIsMe(): boolean;
  setIsMe(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Interaction.AsObject;
  static toObject(includeInstance: boolean, msg: Interaction): Interaction.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Interaction, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Interaction;
  static deserializeBinaryFromReader(message: Interaction, reader: jspb.BinaryReader): Interaction;
}

export namespace Interaction {
  export type AsObject = {
    cid: string,
    type: AppMessage.TypeMap[keyof AppMessage.TypeMap],
    conversationPublicKey: string,
    conversation?: Conversation.AsObject,
    payload: Uint8Array | string,
    isMe: boolean,
  }
}

export class Contact extends jspb.Message {
  getPublicKey(): string;
  setPublicKey(value: string): void;

  getDisplayName(): string;
  setDisplayName(value: string): void;

  getConversationPublicKey(): string;
  setConversationPublicKey(value: string): void;

  hasConversation(): boolean;
  clearConversation(): void;
  getConversation(): Conversation | undefined;
  setConversation(value?: Conversation): void;

  getState(): Contact.StateMap[keyof Contact.StateMap];
  setState(value: Contact.StateMap[keyof Contact.StateMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Contact.AsObject;
  static toObject(includeInstance: boolean, msg: Contact): Contact.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Contact, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Contact;
  static deserializeBinaryFromReader(message: Contact, reader: jspb.BinaryReader): Contact;
}

export namespace Contact {
  export type AsObject = {
    publicKey: string,
    displayName: string,
    conversationPublicKey: string,
    conversation?: Conversation.AsObject,
    state: Contact.StateMap[keyof Contact.StateMap],
  }

  export interface StateMap {
    UNDEFINED: 0;
    INCOMINGREQUEST: 1;
    OUTGOINGREQUESTENQUEUED: 2;
    OUTGOINGREQUESTSENT: 3;
    ESTABLISHED: 4;
  }

  export const State: StateMap;
}

export class Conversation extends jspb.Message {
  getPublicKey(): string;
  setPublicKey(value: string): void;

  getDisplayName(): string;
  setDisplayName(value: string): void;

  getLink(): string;
  setLink(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Conversation.AsObject;
  static toObject(includeInstance: boolean, msg: Conversation): Conversation.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Conversation, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Conversation;
  static deserializeBinaryFromReader(message: Conversation, reader: jspb.BinaryReader): Conversation;
}

export namespace Conversation {
  export type AsObject = {
    publicKey: string,
    displayName: string,
    link: string,
  }
}

export class Member extends jspb.Message {
  getPublicKey(): string;
  setPublicKey(value: string): void;

  getDisplayName(): string;
  setDisplayName(value: string): void;

  getGivenName(): string;
  setGivenName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Member.AsObject;
  static toObject(includeInstance: boolean, msg: Member): Member.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Member, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Member;
  static deserializeBinaryFromReader(message: Member, reader: jspb.BinaryReader): Member;
}

export namespace Member {
  export type AsObject = {
    publicKey: string,
    displayName: string,
    givenName: string,
  }
}

export class Device extends jspb.Message {
  getPublicKey(): string;
  setPublicKey(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Device.AsObject;
  static toObject(includeInstance: boolean, msg: Device): Device.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Device, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Device;
  static deserializeBinaryFromReader(message: Device, reader: jspb.BinaryReader): Device;
}

export namespace Device {
  export type AsObject = {
    publicKey: string,
  }
}

export class StreamEvent extends jspb.Message {
  getType(): StreamEvent.TypeMap[keyof StreamEvent.TypeMap];
  setType(value: StreamEvent.TypeMap[keyof StreamEvent.TypeMap]): void;

  getPayload(): Uint8Array | string;
  getPayload_asU8(): Uint8Array;
  getPayload_asB64(): string;
  setPayload(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamEvent.AsObject;
  static toObject(includeInstance: boolean, msg: StreamEvent): StreamEvent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StreamEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamEvent;
  static deserializeBinaryFromReader(message: StreamEvent, reader: jspb.BinaryReader): StreamEvent;
}

export namespace StreamEvent {
  export type AsObject = {
    type: StreamEvent.TypeMap[keyof StreamEvent.TypeMap],
    payload: Uint8Array | string,
  }

  export class ConversationUpdated extends jspb.Message {
    hasConversation(): boolean;
    clearConversation(): void;
    getConversation(): Conversation | undefined;
    setConversation(value?: Conversation): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ConversationUpdated.AsObject;
    static toObject(includeInstance: boolean, msg: ConversationUpdated): ConversationUpdated.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ConversationUpdated, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ConversationUpdated;
    static deserializeBinaryFromReader(message: ConversationUpdated, reader: jspb.BinaryReader): ConversationUpdated;
  }

  export namespace ConversationUpdated {
    export type AsObject = {
      conversation?: Conversation.AsObject,
    }
  }

  export class ConversationDeleted extends jspb.Message {
    getPublicKey(): string;
    setPublicKey(value: string): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ConversationDeleted.AsObject;
    static toObject(includeInstance: boolean, msg: ConversationDeleted): ConversationDeleted.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ConversationDeleted, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ConversationDeleted;
    static deserializeBinaryFromReader(message: ConversationDeleted, reader: jspb.BinaryReader): ConversationDeleted;
  }

  export namespace ConversationDeleted {
    export type AsObject = {
      publicKey: string,
    }
  }

  export class InteractionUpdated extends jspb.Message {
    hasInteraction(): boolean;
    clearInteraction(): void;
    getInteraction(): Interaction | undefined;
    setInteraction(value?: Interaction): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): InteractionUpdated.AsObject;
    static toObject(includeInstance: boolean, msg: InteractionUpdated): InteractionUpdated.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: InteractionUpdated, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): InteractionUpdated;
    static deserializeBinaryFromReader(message: InteractionUpdated, reader: jspb.BinaryReader): InteractionUpdated;
  }

  export namespace InteractionUpdated {
    export type AsObject = {
      interaction?: Interaction.AsObject,
    }
  }

  export class ContactUpdated extends jspb.Message {
    hasContact(): boolean;
    clearContact(): void;
    getContact(): Contact | undefined;
    setContact(value?: Contact): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ContactUpdated.AsObject;
    static toObject(includeInstance: boolean, msg: ContactUpdated): ContactUpdated.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ContactUpdated, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ContactUpdated;
    static deserializeBinaryFromReader(message: ContactUpdated, reader: jspb.BinaryReader): ContactUpdated;
  }

  export namespace ContactUpdated {
    export type AsObject = {
      contact?: Contact.AsObject,
    }
  }

  export class AccountUpdated extends jspb.Message {
    hasAccount(): boolean;
    clearAccount(): void;
    getAccount(): Account | undefined;
    setAccount(value?: Account): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AccountUpdated.AsObject;
    static toObject(includeInstance: boolean, msg: AccountUpdated): AccountUpdated.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AccountUpdated, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AccountUpdated;
    static deserializeBinaryFromReader(message: AccountUpdated, reader: jspb.BinaryReader): AccountUpdated;
  }

  export namespace AccountUpdated {
    export type AsObject = {
      account?: Account.AsObject,
    }
  }

  export class ListEnd extends jspb.Message {
    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListEnd.AsObject;
    static toObject(includeInstance: boolean, msg: ListEnd): ListEnd.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListEnd, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListEnd;
    static deserializeBinaryFromReader(message: ListEnd, reader: jspb.BinaryReader): ListEnd;
  }

  export namespace ListEnd {
    export type AsObject = {
    }
  }

  export interface TypeMap {
    TYPECONVERSATIONUPDATED: 0;
    TYPECONVERSATIONDELETED: 1;
    TYPEINTERACTIONUPDATED: 2;
    TYPECONTACTUPDATED: 3;
    TYPEACCOUNTUPDATED: 4;
    TYPELISTEND: 5;
  }

  export const Type: TypeMap;
}

export class ConversationStream extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConversationStream.AsObject;
  static toObject(includeInstance: boolean, msg: ConversationStream): ConversationStream.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ConversationStream, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConversationStream;
  static deserializeBinaryFromReader(message: ConversationStream, reader: jspb.BinaryReader): ConversationStream;
}

export namespace ConversationStream {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getCount(): number;
    setCount(value: number): void;

    getPage(): number;
    setPage(value: number): void;

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
      count: number,
      page: number,
    }
  }

  export class Reply extends jspb.Message {
    hasConversation(): boolean;
    clearConversation(): void;
    getConversation(): Conversation | undefined;
    setConversation(value?: Conversation): void;

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
      conversation?: Conversation.AsObject,
    }
  }
}

export class ConversationCreate extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConversationCreate.AsObject;
  static toObject(includeInstance: boolean, msg: ConversationCreate): ConversationCreate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ConversationCreate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConversationCreate;
  static deserializeBinaryFromReader(message: ConversationCreate, reader: jspb.BinaryReader): ConversationCreate;
}

export namespace ConversationCreate {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getDisplayName(): string;
    setDisplayName(value: string): void;

    clearContactsToInviteList(): void;
    getContactsToInviteList(): Array<string>;
    setContactsToInviteList(value: Array<string>): void;
    addContactsToInvite(value: string, index?: number): string;

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
      displayName: string,
      contactsToInviteList: Array<string>,
    }
  }

  export class Reply extends jspb.Message {
    getPublicKey(): string;
    setPublicKey(value: string): void;

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
      publicKey: string,
    }
  }
}

export class AccountGet extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountGet.AsObject;
  static toObject(includeInstance: boolean, msg: AccountGet): AccountGet.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountGet, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountGet;
  static deserializeBinaryFromReader(message: AccountGet, reader: jspb.BinaryReader): AccountGet;
}

export namespace AccountGet {
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
    hasAccount(): boolean;
    clearAccount(): void;
    getAccount(): Account | undefined;
    setAccount(value?: Account): void;

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
      account?: Account.AsObject,
    }
  }
}

export class EventStream extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EventStream.AsObject;
  static toObject(includeInstance: boolean, msg: EventStream): EventStream.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: EventStream, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EventStream;
  static deserializeBinaryFromReader(message: EventStream, reader: jspb.BinaryReader): EventStream;
}

export namespace EventStream {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getCount(): number;
    setCount(value: number): void;

    getPage(): number;
    setPage(value: number): void;

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
      count: number,
      page: number,
    }
  }

  export class Reply extends jspb.Message {
    hasEvent(): boolean;
    clearEvent(): void;
    getEvent(): StreamEvent | undefined;
    setEvent(value?: StreamEvent): void;

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
      event?: StreamEvent.AsObject,
    }
  }
}

export class ContactMetadata extends jspb.Message {
  getDisplayName(): string;
  setDisplayName(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactMetadata.AsObject;
  static toObject(includeInstance: boolean, msg: ContactMetadata): ContactMetadata.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactMetadata, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactMetadata;
  static deserializeBinaryFromReader(message: ContactMetadata, reader: jspb.BinaryReader): ContactMetadata;
}

export namespace ContactMetadata {
  export type AsObject = {
    displayName: string,
  }
}

export class AccountUpdate extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountUpdate.AsObject;
  static toObject(includeInstance: boolean, msg: AccountUpdate): AccountUpdate.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AccountUpdate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountUpdate;
  static deserializeBinaryFromReader(message: AccountUpdate, reader: jspb.BinaryReader): AccountUpdate;
}

export namespace AccountUpdate {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
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

export class ContactRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ContactRequest): ContactRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactRequest;
  static deserializeBinaryFromReader(message: ContactRequest, reader: jspb.BinaryReader): ContactRequest;
}

export namespace ContactRequest {
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

export class ContactAccept extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContactAccept.AsObject;
  static toObject(includeInstance: boolean, msg: ContactAccept): ContactAccept.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContactAccept, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContactAccept;
  static deserializeBinaryFromReader(message: ContactAccept, reader: jspb.BinaryReader): ContactAccept;
}

export namespace ContactAccept {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getPublicKey(): string;
    setPublicKey(value: string): void;

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
      publicKey: string,
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

export class Interact extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Interact.AsObject;
  static toObject(includeInstance: boolean, msg: Interact): Interact.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Interact, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Interact;
  static deserializeBinaryFromReader(message: Interact, reader: jspb.BinaryReader): Interact;
}

export namespace Interact {
  export type AsObject = {
  }

  export class Request extends jspb.Message {
    getType(): AppMessage.TypeMap[keyof AppMessage.TypeMap];
    setType(value: AppMessage.TypeMap[keyof AppMessage.TypeMap]): void;

    getPayload(): Uint8Array | string;
    getPayload_asU8(): Uint8Array;
    getPayload_asB64(): string;
    setPayload(value: Uint8Array | string): void;

    getConversationPublicKey(): string;
    setConversationPublicKey(value: string): void;

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
      type: AppMessage.TypeMap[keyof AppMessage.TypeMap],
      payload: Uint8Array | string,
      conversationPublicKey: string,
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

