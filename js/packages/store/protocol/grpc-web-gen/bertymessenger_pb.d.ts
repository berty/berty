// package: berty.messenger
// file: bertymessenger.proto

import * as jspb from "google-protobuf";
import * as github_com_gogo_protobuf_gogoproto_gogo_pb from "./github.com/gogo/protobuf/gogoproto/gogo_pb";

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
    }
  }

  export interface KindMap {
    UNKNOWNKIND: 0;
    BERTYID: 1;
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

