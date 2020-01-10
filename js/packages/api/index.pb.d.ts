import * as $protobuf from "protobufjs";
export namespace berty {

    namespace protocol {

        class DemoService extends $protobuf.rpc.Service {

            public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): DemoService;
            public addKey(request: berty.protocol.AddKey.IRequest, callback: berty.protocol.DemoService.AddKeyCallback): void;
            public addKey(request: berty.protocol.AddKey.IRequest): Promise<berty.protocol.AddKey.Reply>;
            public log(request: berty.protocol.Log.IRequest, callback: berty.protocol.DemoService.LogCallback): void;
            public log(request: berty.protocol.Log.IRequest): Promise<berty.protocol.Log.Reply>;
            public logAdd(request: berty.protocol.LogAdd.IRequest, callback: berty.protocol.DemoService.LogAddCallback): void;
            public logAdd(request: berty.protocol.LogAdd.IRequest): Promise<berty.protocol.LogAdd.Reply>;
            public logGet(request: berty.protocol.LogGet.IRequest, callback: berty.protocol.DemoService.LogGetCallback): void;
            public logGet(request: berty.protocol.LogGet.IRequest): Promise<berty.protocol.LogGet.Reply>;
            public logStream(request: berty.protocol.LogStream.IRequest, callback: berty.protocol.DemoService.LogStreamCallback): void;
            public logStream(request: berty.protocol.LogStream.IRequest): Promise<berty.protocol.Log.Operation>;
            public logList(request: berty.protocol.LogList.IRequest, callback: berty.protocol.DemoService.LogListCallback): void;
            public logList(request: berty.protocol.LogList.IRequest): Promise<berty.protocol.LogList.Reply>;
        }

        namespace DemoService {

            type AddKeyCallback = (error: (Error|null), response?: berty.protocol.AddKey.Reply) => void;

            type LogCallback = (error: (Error|null), response?: berty.protocol.Log.Reply) => void;

            type LogAddCallback = (error: (Error|null), response?: berty.protocol.LogAdd.Reply) => void;

            type LogGetCallback = (error: (Error|null), response?: berty.protocol.LogGet.Reply) => void;

            type LogStreamCallback = (error: (Error|null), response?: berty.protocol.Log.Operation) => void;

            type LogListCallback = (error: (Error|null), response?: berty.protocol.LogList.Reply) => void;
        }

        interface IAddKey {
        }

        class AddKey implements IAddKey {

            public static create(properties?: berty.protocol.IAddKey): berty.protocol.AddKey;
            public static encode(message: berty.protocol.IAddKey, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IAddKey, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.AddKey;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.AddKey;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.AddKey;
            public static toObject(message: berty.protocol.AddKey, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace AddKey {

            interface IRequest {
                privKey?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public privKey: Uint8Array;
                public static create(properties?: berty.protocol.AddKey.IRequest): berty.protocol.AddKey.Request;
                public static encode(message: berty.protocol.AddKey.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.AddKey.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.AddKey.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.AddKey.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.AddKey.Request;
                public static toObject(message: berty.protocol.AddKey.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.protocol.AddKey.IReply): berty.protocol.AddKey.Reply;
                public static encode(message: berty.protocol.AddKey.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.AddKey.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.AddKey.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.AddKey.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.AddKey.Reply;
                public static toObject(message: berty.protocol.AddKey.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface ILog {
        }

        class Log implements ILog {

            public static create(properties?: berty.protocol.ILog): berty.protocol.Log;
            public static encode(message: berty.protocol.ILog, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.ILog, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.Log;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.Log;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.Log;
            public static toObject(message: berty.protocol.Log, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace Log {

            interface IOperation {
                name?: (string|null);
                value?: (Uint8Array|null);
            }

            class Operation implements IOperation {

                public name: string;
                public value: Uint8Array;
                public static create(properties?: berty.protocol.Log.IOperation): berty.protocol.Log.Operation;
                public static encode(message: berty.protocol.Log.IOperation, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.Log.IOperation, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.Log.Operation;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.Log.Operation;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.Log.Operation;
                public static toObject(message: berty.protocol.Log.Operation, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IStreamOptions {
                GT?: (string|null);
                GTE?: (string|null);
                LT?: (string|null);
                LTE?: (string|null);
                amount?: (number|null);
            }

            class StreamOptions implements IStreamOptions {

                public GT: string;
                public GTE: string;
                public LT: string;
                public LTE: string;
                public amount: number;
                public static create(properties?: berty.protocol.Log.IStreamOptions): berty.protocol.Log.StreamOptions;
                public static encode(message: berty.protocol.Log.IStreamOptions, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.Log.IStreamOptions, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.Log.StreamOptions;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.Log.StreamOptions;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.Log.StreamOptions;
                public static toObject(message: berty.protocol.Log.StreamOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IManifestEntry {
                key?: (string|null);
                values?: (string[]|null);
            }

            class ManifestEntry implements IManifestEntry {

                public key: string;
                public values: string[];
                public static create(properties?: berty.protocol.Log.IManifestEntry): berty.protocol.Log.ManifestEntry;
                public static encode(message: berty.protocol.Log.IManifestEntry, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.Log.IManifestEntry, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.Log.ManifestEntry;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.Log.ManifestEntry;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.Log.ManifestEntry;
                public static toObject(message: berty.protocol.Log.ManifestEntry, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IRequest {
                address?: (string|null);
                manifestType?: (string|null);
                manifestAccess?: (berty.protocol.Log.IManifestEntry[]|null);
                identityType?: (string|null);
                identityId?: (string|null);
            }

            class Request implements IRequest {

                public address: string;
                public manifestType: string;
                public manifestAccess: berty.protocol.Log.IManifestEntry[];
                public identityType: string;
                public identityId: string;
                public static create(properties?: berty.protocol.Log.IRequest): berty.protocol.Log.Request;
                public static encode(message: berty.protocol.Log.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.Log.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.Log.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.Log.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.Log.Request;
                public static toObject(message: berty.protocol.Log.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                logHandle?: (string|null);
            }

            class Reply implements IReply {

                public logHandle: string;
                public static create(properties?: berty.protocol.Log.IReply): berty.protocol.Log.Reply;
                public static encode(message: berty.protocol.Log.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.Log.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.Log.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.Log.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.Log.Reply;
                public static toObject(message: berty.protocol.Log.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface ILogAdd {
        }

        class LogAdd implements ILogAdd {

            public static create(properties?: berty.protocol.ILogAdd): berty.protocol.LogAdd;
            public static encode(message: berty.protocol.ILogAdd, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.ILogAdd, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogAdd;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogAdd;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.LogAdd;
            public static toObject(message: berty.protocol.LogAdd, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace LogAdd {

            interface IRequest {
                logHandle?: (string|null);
                data?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public logHandle: string;
                public data: Uint8Array;
                public static create(properties?: berty.protocol.LogAdd.IRequest): berty.protocol.LogAdd.Request;
                public static encode(message: berty.protocol.LogAdd.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.LogAdd.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogAdd.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogAdd.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.LogAdd.Request;
                public static toObject(message: berty.protocol.LogAdd.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.protocol.LogAdd.IReply): berty.protocol.LogAdd.Reply;
                public static encode(message: berty.protocol.LogAdd.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.LogAdd.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogAdd.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogAdd.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.LogAdd.Reply;
                public static toObject(message: berty.protocol.LogAdd.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface ILogGet {
        }

        class LogGet implements ILogGet {

            public static create(properties?: berty.protocol.ILogGet): berty.protocol.LogGet;
            public static encode(message: berty.protocol.ILogGet, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.ILogGet, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogGet;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogGet;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.LogGet;
            public static toObject(message: berty.protocol.LogGet, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace LogGet {

            interface IRequest {
                logHandle?: (string|null);
                cid?: (string|null);
            }

            class Request implements IRequest {

                public logHandle: string;
                public cid: string;
                public static create(properties?: berty.protocol.LogGet.IRequest): berty.protocol.LogGet.Request;
                public static encode(message: berty.protocol.LogGet.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.LogGet.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogGet.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogGet.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.LogGet.Request;
                public static toObject(message: berty.protocol.LogGet.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                op?: (berty.protocol.Log.IOperation|null);
            }

            class Reply implements IReply {

                public op?: (berty.protocol.Log.IOperation|null);
                public static create(properties?: berty.protocol.LogGet.IReply): berty.protocol.LogGet.Reply;
                public static encode(message: berty.protocol.LogGet.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.LogGet.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogGet.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogGet.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.LogGet.Reply;
                public static toObject(message: berty.protocol.LogGet.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface ILogStream {
        }

        class LogStream implements ILogStream {

            public static create(properties?: berty.protocol.ILogStream): berty.protocol.LogStream;
            public static encode(message: berty.protocol.ILogStream, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.ILogStream, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogStream;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogStream;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.LogStream;
            public static toObject(message: berty.protocol.LogStream, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace LogStream {

            interface IRequest {
                logHandle?: (string|null);
                options?: (berty.protocol.Log.IStreamOptions|null);
            }

            class Request implements IRequest {

                public logHandle: string;
                public options?: (berty.protocol.Log.IStreamOptions|null);
                public static create(properties?: berty.protocol.LogStream.IRequest): berty.protocol.LogStream.Request;
                public static encode(message: berty.protocol.LogStream.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.LogStream.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogStream.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogStream.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.LogStream.Request;
                public static toObject(message: berty.protocol.LogStream.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface ILogList {
        }

        class LogList implements ILogList {

            public static create(properties?: berty.protocol.ILogList): berty.protocol.LogList;
            public static encode(message: berty.protocol.ILogList, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.ILogList, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogList;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogList;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.LogList;
            public static toObject(message: berty.protocol.LogList, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace LogList {

            interface IOperations {
                ops?: (berty.protocol.Log.IOperation[]|null);
            }

            class Operations implements IOperations {

                public ops: berty.protocol.Log.IOperation[];
                public static create(properties?: berty.protocol.LogList.IOperations): berty.protocol.LogList.Operations;
                public static encode(message: berty.protocol.LogList.IOperations, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.LogList.IOperations, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogList.Operations;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogList.Operations;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.LogList.Operations;
                public static toObject(message: berty.protocol.LogList.Operations, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IRequest {
                logHandle?: (string|null);
                options?: (berty.protocol.Log.IStreamOptions|null);
            }

            class Request implements IRequest {

                public logHandle: string;
                public options?: (berty.protocol.Log.IStreamOptions|null);
                public static create(properties?: berty.protocol.LogList.IRequest): berty.protocol.LogList.Request;
                public static encode(message: berty.protocol.LogList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.LogList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogList.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogList.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.LogList.Request;
                public static toObject(message: berty.protocol.LogList.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                ops?: (berty.protocol.LogList.IOperations|null);
            }

            class Reply implements IReply {

                public ops?: (berty.protocol.LogList.IOperations|null);
                public static create(properties?: berty.protocol.LogList.IReply): berty.protocol.LogList.Reply;
                public static encode(message: berty.protocol.LogList.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.LogList.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogList.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogList.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.LogList.Reply;
                public static toObject(message: berty.protocol.LogList.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        class ProtocolService extends $protobuf.rpc.Service {

            public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): ProtocolService;
            public instanceExportData(request: berty.protocol.InstanceExportData.IRequest, callback: berty.protocol.ProtocolService.InstanceExportDataCallback): void;
            public instanceExportData(request: berty.protocol.InstanceExportData.IRequest): Promise<berty.protocol.InstanceExportData.Reply>;
            public instanceGetConfiguration(request: berty.protocol.InstanceGetConfiguration.IRequest, callback: berty.protocol.ProtocolService.InstanceGetConfigurationCallback): void;
            public instanceGetConfiguration(request: berty.protocol.InstanceGetConfiguration.IRequest): Promise<berty.protocol.InstanceGetConfiguration.Reply>;
            public groupCreate(request: berty.protocol.GroupCreate.IRequest, callback: berty.protocol.ProtocolService.GroupCreateCallback): void;
            public groupCreate(request: berty.protocol.GroupCreate.IRequest): Promise<berty.protocol.GroupCreate.Reply>;
            public groupJoin(request: berty.protocol.GroupJoin.IRequest, callback: berty.protocol.ProtocolService.GroupJoinCallback): void;
            public groupJoin(request: berty.protocol.GroupJoin.IRequest): Promise<berty.protocol.GroupJoin.Reply>;
            public groupLeave(request: berty.protocol.GroupLeave.IRequest, callback: berty.protocol.ProtocolService.GroupLeaveCallback): void;
            public groupLeave(request: berty.protocol.GroupLeave.IRequest): Promise<berty.protocol.GroupLeave.Reply>;
            public groupInvite(request: berty.protocol.GroupInvite.IRequest, callback: berty.protocol.ProtocolService.GroupInviteCallback): void;
            public groupInvite(request: berty.protocol.GroupInvite.IRequest): Promise<berty.protocol.GroupInvite.Reply>;
            public devicePair(request: berty.protocol.DevicePair.IRequest, callback: berty.protocol.ProtocolService.DevicePairCallback): void;
            public devicePair(request: berty.protocol.DevicePair.IRequest): Promise<berty.protocol.DevicePair.Reply>;
            public contactRequestReference(request: berty.protocol.ContactRequestReference.IRequest, callback: berty.protocol.ProtocolService.ContactRequestReferenceCallback): void;
            public contactRequestReference(request: berty.protocol.ContactRequestReference.IRequest): Promise<berty.protocol.ContactRequestReference.Reply>;
            public contactRequestDisable(request: berty.protocol.ContactRequestDisable.IRequest, callback: berty.protocol.ProtocolService.ContactRequestDisableCallback): void;
            public contactRequestDisable(request: berty.protocol.ContactRequestDisable.IRequest): Promise<berty.protocol.ContactRequestDisable.Reply>;
            public contactRequestEnable(request: berty.protocol.ContactRequestEnable.IRequest, callback: berty.protocol.ProtocolService.ContactRequestEnableCallback): void;
            public contactRequestEnable(request: berty.protocol.ContactRequestEnable.IRequest): Promise<berty.protocol.ContactRequestEnable.Reply>;
            public contactRequestResetReference(request: berty.protocol.ContactRequestResetLink.IRequest, callback: berty.protocol.ProtocolService.ContactRequestResetReferenceCallback): void;
            public contactRequestResetReference(request: berty.protocol.ContactRequestResetLink.IRequest): Promise<berty.protocol.ContactRequestResetLink.Reply>;
            public contactRequestEnqueue(request: berty.protocol.ContactRequestEnqueue.IRequest, callback: berty.protocol.ProtocolService.ContactRequestEnqueueCallback): void;
            public contactRequestEnqueue(request: berty.protocol.ContactRequestEnqueue.IRequest): Promise<berty.protocol.ContactRequestEnqueue.Reply>;
            public contactRequestAccept(request: berty.protocol.ContactRequestAccept.IRequest, callback: berty.protocol.ProtocolService.ContactRequestAcceptCallback): void;
            public contactRequestAccept(request: berty.protocol.ContactRequestAccept.IRequest): Promise<berty.protocol.ContactRequestAccept.Reply>;
            public contactRemove(request: berty.protocol.ContactRemove.IRequest, callback: berty.protocol.ProtocolService.ContactRemoveCallback): void;
            public contactRemove(request: berty.protocol.ContactRemove.IRequest): Promise<berty.protocol.ContactRemove.Reply>;
            public contactBlock(request: berty.protocol.ContactBlock.IRequest, callback: berty.protocol.ProtocolService.ContactBlockCallback): void;
            public contactBlock(request: berty.protocol.ContactBlock.IRequest): Promise<berty.protocol.ContactBlock.Reply>;
            public contactUnblock(request: berty.protocol.ContactUnblock.IRequest, callback: berty.protocol.ProtocolService.ContactUnblockCallback): void;
            public contactUnblock(request: berty.protocol.ContactUnblock.IRequest): Promise<berty.protocol.ContactUnblock.Reply>;
            public groupSettingSetGroup(request: berty.protocol.GroupSettingSetGroup.IRequest, callback: berty.protocol.ProtocolService.GroupSettingSetGroupCallback): void;
            public groupSettingSetGroup(request: berty.protocol.GroupSettingSetGroup.IRequest): Promise<berty.protocol.GroupSettingSetGroup.Reply>;
            public groupSettingSetMember(request: berty.protocol.GroupSettingSetMember.IRequest, callback: berty.protocol.ProtocolService.GroupSettingSetMemberCallback): void;
            public groupSettingSetMember(request: berty.protocol.GroupSettingSetMember.IRequest): Promise<berty.protocol.GroupSettingSetMember.Reply>;
            public groupMessageSend(request: berty.protocol.GroupMessageSend.IRequest, callback: berty.protocol.ProtocolService.GroupMessageSendCallback): void;
            public groupMessageSend(request: berty.protocol.GroupMessageSend.IRequest): Promise<berty.protocol.GroupMessageSend.Reply>;
            public accountAppendAppSpecificEvent(request: berty.protocol.AccountAppendAppSpecificEvent.IRequest, callback: berty.protocol.ProtocolService.AccountAppendAppSpecificEventCallback): void;
            public accountAppendAppSpecificEvent(request: berty.protocol.AccountAppendAppSpecificEvent.IRequest): Promise<berty.protocol.AccountAppendAppSpecificEvent.Reply>;
            public accountSubscribe(request: berty.protocol.AccountSubscribe.IRequest, callback: berty.protocol.ProtocolService.AccountSubscribeCallback): void;
            public accountSubscribe(request: berty.protocol.AccountSubscribe.IRequest): Promise<berty.protocol.AccountSubscribe.Reply>;
            public groupSettingSubscribe(request: berty.protocol.GroupSettingStoreSubscribe.IRequest, callback: berty.protocol.ProtocolService.GroupSettingSubscribeCallback): void;
            public groupSettingSubscribe(request: berty.protocol.GroupSettingStoreSubscribe.IRequest): Promise<berty.protocol.GroupSettingStoreSubscribe.Reply>;
            public groupMessageSubscribe(request: berty.protocol.GroupMessageSubscribe.IRequest, callback: berty.protocol.ProtocolService.GroupMessageSubscribeCallback): void;
            public groupMessageSubscribe(request: berty.protocol.GroupMessageSubscribe.IRequest): Promise<berty.protocol.GroupMessageSubscribe.Reply>;
            public groupMemberSubscribe(request: berty.protocol.GroupMemberSubscribe.IRequest, callback: berty.protocol.ProtocolService.GroupMemberSubscribeCallback): void;
            public groupMemberSubscribe(request: berty.protocol.GroupMemberSubscribe.IRequest): Promise<berty.protocol.GroupMemberSubscribe.Reply>;
        }

        namespace ProtocolService {

            type InstanceExportDataCallback = (error: (Error|null), response?: berty.protocol.InstanceExportData.Reply) => void;

            type InstanceGetConfigurationCallback = (error: (Error|null), response?: berty.protocol.InstanceGetConfiguration.Reply) => void;

            type GroupCreateCallback = (error: (Error|null), response?: berty.protocol.GroupCreate.Reply) => void;

            type GroupJoinCallback = (error: (Error|null), response?: berty.protocol.GroupJoin.Reply) => void;

            type GroupLeaveCallback = (error: (Error|null), response?: berty.protocol.GroupLeave.Reply) => void;

            type GroupInviteCallback = (error: (Error|null), response?: berty.protocol.GroupInvite.Reply) => void;

            type DevicePairCallback = (error: (Error|null), response?: berty.protocol.DevicePair.Reply) => void;

            type ContactRequestReferenceCallback = (error: (Error|null), response?: berty.protocol.ContactRequestReference.Reply) => void;

            type ContactRequestDisableCallback = (error: (Error|null), response?: berty.protocol.ContactRequestDisable.Reply) => void;

            type ContactRequestEnableCallback = (error: (Error|null), response?: berty.protocol.ContactRequestEnable.Reply) => void;

            type ContactRequestResetReferenceCallback = (error: (Error|null), response?: berty.protocol.ContactRequestResetLink.Reply) => void;

            type ContactRequestEnqueueCallback = (error: (Error|null), response?: berty.protocol.ContactRequestEnqueue.Reply) => void;

            type ContactRequestAcceptCallback = (error: (Error|null), response?: berty.protocol.ContactRequestAccept.Reply) => void;

            type ContactRemoveCallback = (error: (Error|null), response?: berty.protocol.ContactRemove.Reply) => void;

            type ContactBlockCallback = (error: (Error|null), response?: berty.protocol.ContactBlock.Reply) => void;

            type ContactUnblockCallback = (error: (Error|null), response?: berty.protocol.ContactUnblock.Reply) => void;

            type GroupSettingSetGroupCallback = (error: (Error|null), response?: berty.protocol.GroupSettingSetGroup.Reply) => void;

            type GroupSettingSetMemberCallback = (error: (Error|null), response?: berty.protocol.GroupSettingSetMember.Reply) => void;

            type GroupMessageSendCallback = (error: (Error|null), response?: berty.protocol.GroupMessageSend.Reply) => void;

            type AccountAppendAppSpecificEventCallback = (error: (Error|null), response?: berty.protocol.AccountAppendAppSpecificEvent.Reply) => void;

            type AccountSubscribeCallback = (error: (Error|null), response?: berty.protocol.AccountSubscribe.Reply) => void;

            type GroupSettingSubscribeCallback = (error: (Error|null), response?: berty.protocol.GroupSettingStoreSubscribe.Reply) => void;

            type GroupMessageSubscribeCallback = (error: (Error|null), response?: berty.protocol.GroupMessageSubscribe.Reply) => void;

            type GroupMemberSubscribeCallback = (error: (Error|null), response?: berty.protocol.GroupMemberSubscribe.Reply) => void;
        }

        enum AccountEventType {
            AccountEventType_Undefined = 0,
            AccountEventType_GroupJoined = 1,
            AccountEventType_GroupLeft = 2,
            AccountEventType_DevicePaired = 3,
            AccountEventType_ContactRequestDisabled = 4,
            AccountEventType_ContactRequestEnabled = 5,
            AccountEventType_ContactRequestReferenceReset = 6,
            AccountEventType_ContactRequestEnqueued = 7,
            AccountEventType_ContactRequested = 8,
            AccountEventType_ContactAccepted = 9,
            AccountEventType_ContactRemoved = 10,
            AccountEventType_ContactBlocked = 11,
            AccountEventType_ContactUnblocked = 12,
            AccountEventType_AppSpecified = 13
        }

        enum GroupSettingStoreSettingType {
            Unknown = 0,
            Group = 1,
            Member = 2
        }

        interface IInstanceExportData {
        }

        class InstanceExportData implements IInstanceExportData {

            public static create(properties?: berty.protocol.IInstanceExportData): berty.protocol.InstanceExportData;
            public static encode(message: berty.protocol.IInstanceExportData, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IInstanceExportData, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.InstanceExportData;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.InstanceExportData;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.InstanceExportData;
            public static toObject(message: berty.protocol.InstanceExportData, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace InstanceExportData {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.protocol.InstanceExportData.IRequest): berty.protocol.InstanceExportData.Request;
                public static encode(message: berty.protocol.InstanceExportData.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.InstanceExportData.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.InstanceExportData.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.InstanceExportData.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.InstanceExportData.Request;
                public static toObject(message: berty.protocol.InstanceExportData.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                exportedData?: (Uint8Array|null);
            }

            class Reply implements IReply {

                public exportedData: Uint8Array;
                public static create(properties?: berty.protocol.InstanceExportData.IReply): berty.protocol.InstanceExportData.Reply;
                public static encode(message: berty.protocol.InstanceExportData.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.InstanceExportData.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.InstanceExportData.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.InstanceExportData.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.InstanceExportData.Reply;
                public static toObject(message: berty.protocol.InstanceExportData.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IInstanceGetConfiguration {
        }

        class InstanceGetConfiguration implements IInstanceGetConfiguration {

            public static create(properties?: berty.protocol.IInstanceGetConfiguration): berty.protocol.InstanceGetConfiguration;
            public static encode(message: berty.protocol.IInstanceGetConfiguration, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IInstanceGetConfiguration, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.InstanceGetConfiguration;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.InstanceGetConfiguration;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.InstanceGetConfiguration;
            public static toObject(message: berty.protocol.InstanceGetConfiguration, options?: $protobuf.IConversionOptions): { [k: string]: any };
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

                public static create(properties?: berty.protocol.InstanceGetConfiguration.IRequest): berty.protocol.InstanceGetConfiguration.Request;
                public static encode(message: berty.protocol.InstanceGetConfiguration.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.InstanceGetConfiguration.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.InstanceGetConfiguration.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.InstanceGetConfiguration.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.InstanceGetConfiguration.Request;
                public static toObject(message: berty.protocol.InstanceGetConfiguration.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                peerId?: (string|null);
                listeners?: (string[]|null);
                bleEnabled?: (berty.protocol.InstanceGetConfiguration.SettingState|null);
                wifiP2pEnabled?: (berty.protocol.InstanceGetConfiguration.SettingState|null);
                mdnsEnabled?: (berty.protocol.InstanceGetConfiguration.SettingState|null);
                relayEnabled?: (berty.protocol.InstanceGetConfiguration.SettingState|null);
            }

            class Reply implements IReply {

                public peerId: string;
                public listeners: string[];
                public bleEnabled: berty.protocol.InstanceGetConfiguration.SettingState;
                public wifiP2pEnabled: berty.protocol.InstanceGetConfiguration.SettingState;
                public mdnsEnabled: berty.protocol.InstanceGetConfiguration.SettingState;
                public relayEnabled: berty.protocol.InstanceGetConfiguration.SettingState;
                public static create(properties?: berty.protocol.InstanceGetConfiguration.IReply): berty.protocol.InstanceGetConfiguration.Reply;
                public static encode(message: berty.protocol.InstanceGetConfiguration.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.InstanceGetConfiguration.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.InstanceGetConfiguration.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.InstanceGetConfiguration.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.InstanceGetConfiguration.Reply;
                public static toObject(message: berty.protocol.InstanceGetConfiguration.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IGroupSettingSetMember {
        }

        class GroupSettingSetMember implements IGroupSettingSetMember {

            public static create(properties?: berty.protocol.IGroupSettingSetMember): berty.protocol.GroupSettingSetMember;
            public static encode(message: berty.protocol.IGroupSettingSetMember, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IGroupSettingSetMember, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupSettingSetMember;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupSettingSetMember;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.GroupSettingSetMember;
            public static toObject(message: berty.protocol.GroupSettingSetMember, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace GroupSettingSetMember {

            interface IRequest {
                groupPubKey?: (Uint8Array|null);
                key?: (string|null);
                value?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPubKey: Uint8Array;
                public key: string;
                public value: Uint8Array;
                public static create(properties?: berty.protocol.GroupSettingSetMember.IRequest): berty.protocol.GroupSettingSetMember.Request;
                public static encode(message: berty.protocol.GroupSettingSetMember.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.GroupSettingSetMember.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupSettingSetMember.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupSettingSetMember.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.GroupSettingSetMember.Request;
                public static toObject(message: berty.protocol.GroupSettingSetMember.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.protocol.GroupSettingSetMember.IReply): berty.protocol.GroupSettingSetMember.Reply;
                public static encode(message: berty.protocol.GroupSettingSetMember.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.GroupSettingSetMember.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupSettingSetMember.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupSettingSetMember.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.GroupSettingSetMember.Reply;
                public static toObject(message: berty.protocol.GroupSettingSetMember.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IGroupSettingSetGroup {
        }

        class GroupSettingSetGroup implements IGroupSettingSetGroup {

            public static create(properties?: berty.protocol.IGroupSettingSetGroup): berty.protocol.GroupSettingSetGroup;
            public static encode(message: berty.protocol.IGroupSettingSetGroup, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IGroupSettingSetGroup, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupSettingSetGroup;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupSettingSetGroup;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.GroupSettingSetGroup;
            public static toObject(message: berty.protocol.GroupSettingSetGroup, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace GroupSettingSetGroup {

            interface IRequest {
                groupPubKey?: (Uint8Array|null);
                key?: (string|null);
                value?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPubKey: Uint8Array;
                public key: string;
                public value: Uint8Array;
                public static create(properties?: berty.protocol.GroupSettingSetGroup.IRequest): berty.protocol.GroupSettingSetGroup.Request;
                public static encode(message: berty.protocol.GroupSettingSetGroup.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.GroupSettingSetGroup.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupSettingSetGroup.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupSettingSetGroup.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.GroupSettingSetGroup.Request;
                public static toObject(message: berty.protocol.GroupSettingSetGroup.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.protocol.GroupSettingSetGroup.IReply): berty.protocol.GroupSettingSetGroup.Reply;
                public static encode(message: berty.protocol.GroupSettingSetGroup.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.GroupSettingSetGroup.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupSettingSetGroup.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupSettingSetGroup.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.GroupSettingSetGroup.Reply;
                public static toObject(message: berty.protocol.GroupSettingSetGroup.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IGroupSettingStoreSubscribe {
        }

        class GroupSettingStoreSubscribe implements IGroupSettingStoreSubscribe {

            public static create(properties?: berty.protocol.IGroupSettingStoreSubscribe): berty.protocol.GroupSettingStoreSubscribe;
            public static encode(message: berty.protocol.IGroupSettingStoreSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IGroupSettingStoreSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupSettingStoreSubscribe;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupSettingStoreSubscribe;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.GroupSettingStoreSubscribe;
            public static toObject(message: berty.protocol.GroupSettingStoreSubscribe, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace GroupSettingStoreSubscribe {

            interface IRequest {
                groupPubKey?: (Uint8Array|null);
                since?: (Uint8Array|null);
                until?: (Uint8Array|null);
                goBackwards?: (boolean|null);
            }

            class Request implements IRequest {

                public groupPubKey: Uint8Array;
                public since: Uint8Array;
                public until: Uint8Array;
                public goBackwards: boolean;
                public static create(properties?: berty.protocol.GroupSettingStoreSubscribe.IRequest): berty.protocol.GroupSettingStoreSubscribe.Request;
                public static encode(message: berty.protocol.GroupSettingStoreSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.GroupSettingStoreSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupSettingStoreSubscribe.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupSettingStoreSubscribe.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.GroupSettingStoreSubscribe.Request;
                public static toObject(message: berty.protocol.GroupSettingStoreSubscribe.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                event?: (berty.protocol.IGroupSettingStoreEvent|null);
            }

            class Reply implements IReply {

                public event?: (berty.protocol.IGroupSettingStoreEvent|null);
                public static create(properties?: berty.protocol.GroupSettingStoreSubscribe.IReply): berty.protocol.GroupSettingStoreSubscribe.Reply;
                public static encode(message: berty.protocol.GroupSettingStoreSubscribe.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.GroupSettingStoreSubscribe.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupSettingStoreSubscribe.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupSettingStoreSubscribe.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.GroupSettingStoreSubscribe.Reply;
                public static toObject(message: berty.protocol.GroupSettingStoreSubscribe.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IEventBase {
            id?: (Uint8Array|null);
            parentIds?: (Uint8Array[]|null);
        }

        class EventBase implements IEventBase {

            public id: Uint8Array;
            public parentIds: Uint8Array[];
            public static create(properties?: berty.protocol.IEventBase): berty.protocol.EventBase;
            public static encode(message: berty.protocol.IEventBase, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IEventBase, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.EventBase;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.EventBase;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.EventBase;
            public static toObject(message: berty.protocol.EventBase, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IGroupStoreEvent {
            eventBase?: (berty.protocol.IEventBase|null);
            groupPubKey?: (Uint8Array|null);
            groupMemberPubKey?: (Uint8Array|null);
            groupDevicePubKey?: (Uint8Array|null);
            accountPubKey?: (Uint8Array|null);
        }

        class GroupStoreEvent implements IGroupStoreEvent {

            public eventBase?: (berty.protocol.IEventBase|null);
            public groupPubKey: Uint8Array;
            public groupMemberPubKey: Uint8Array;
            public groupDevicePubKey: Uint8Array;
            public accountPubKey: Uint8Array;
            public static create(properties?: berty.protocol.IGroupStoreEvent): berty.protocol.GroupStoreEvent;
            public static encode(message: berty.protocol.IGroupStoreEvent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IGroupStoreEvent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupStoreEvent;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupStoreEvent;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.GroupStoreEvent;
            public static toObject(message: berty.protocol.GroupStoreEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IGroupSettingStoreEvent {
            groupStoreEvent?: (berty.protocol.IGroupStoreEvent|null);
            settingType?: (berty.protocol.GroupSettingStoreSettingType|null);
            key?: (string|null);
            value?: (Uint8Array|null);
        }

        class GroupSettingStoreEvent implements IGroupSettingStoreEvent {

            public groupStoreEvent?: (berty.protocol.IGroupStoreEvent|null);
            public settingType: berty.protocol.GroupSettingStoreSettingType;
            public key: string;
            public value: Uint8Array;
            public static create(properties?: berty.protocol.IGroupSettingStoreEvent): berty.protocol.GroupSettingStoreEvent;
            public static encode(message: berty.protocol.IGroupSettingStoreEvent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IGroupSettingStoreEvent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupSettingStoreEvent;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupSettingStoreEvent;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.GroupSettingStoreEvent;
            public static toObject(message: berty.protocol.GroupSettingStoreEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IGroupMessageSend {
        }

        class GroupMessageSend implements IGroupMessageSend {

            public static create(properties?: berty.protocol.IGroupMessageSend): berty.protocol.GroupMessageSend;
            public static encode(message: berty.protocol.IGroupMessageSend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IGroupMessageSend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupMessageSend;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupMessageSend;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.GroupMessageSend;
            public static toObject(message: berty.protocol.GroupMessageSend, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace GroupMessageSend {

            interface IRequest {
                groupPubKey?: (Uint8Array|null);
                payload?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPubKey: Uint8Array;
                public payload: Uint8Array;
                public static create(properties?: berty.protocol.GroupMessageSend.IRequest): berty.protocol.GroupMessageSend.Request;
                public static encode(message: berty.protocol.GroupMessageSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.GroupMessageSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupMessageSend.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupMessageSend.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.GroupMessageSend.Request;
                public static toObject(message: berty.protocol.GroupMessageSend.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.protocol.GroupMessageSend.IReply): berty.protocol.GroupMessageSend.Reply;
                public static encode(message: berty.protocol.GroupMessageSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.GroupMessageSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupMessageSend.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupMessageSend.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.GroupMessageSend.Reply;
                public static toObject(message: berty.protocol.GroupMessageSend.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IAccountAppendAppSpecificEvent {
        }

        class AccountAppendAppSpecificEvent implements IAccountAppendAppSpecificEvent {

            public static create(properties?: berty.protocol.IAccountAppendAppSpecificEvent): berty.protocol.AccountAppendAppSpecificEvent;
            public static encode(message: berty.protocol.IAccountAppendAppSpecificEvent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IAccountAppendAppSpecificEvent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.AccountAppendAppSpecificEvent;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.AccountAppendAppSpecificEvent;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.AccountAppendAppSpecificEvent;
            public static toObject(message: berty.protocol.AccountAppendAppSpecificEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace AccountAppendAppSpecificEvent {

            interface IRequest {
                payload?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public payload: Uint8Array;
                public static create(properties?: berty.protocol.AccountAppendAppSpecificEvent.IRequest): berty.protocol.AccountAppendAppSpecificEvent.Request;
                public static encode(message: berty.protocol.AccountAppendAppSpecificEvent.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.AccountAppendAppSpecificEvent.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.AccountAppendAppSpecificEvent.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.AccountAppendAppSpecificEvent.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.AccountAppendAppSpecificEvent.Request;
                public static toObject(message: berty.protocol.AccountAppendAppSpecificEvent.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.protocol.AccountAppendAppSpecificEvent.IReply): berty.protocol.AccountAppendAppSpecificEvent.Reply;
                public static encode(message: berty.protocol.AccountAppendAppSpecificEvent.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.AccountAppendAppSpecificEvent.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.AccountAppendAppSpecificEvent.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.AccountAppendAppSpecificEvent.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.AccountAppendAppSpecificEvent.Reply;
                public static toObject(message: berty.protocol.AccountAppendAppSpecificEvent.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IGroupMessageSubscribe {
        }

        class GroupMessageSubscribe implements IGroupMessageSubscribe {

            public static create(properties?: berty.protocol.IGroupMessageSubscribe): berty.protocol.GroupMessageSubscribe;
            public static encode(message: berty.protocol.IGroupMessageSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IGroupMessageSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupMessageSubscribe;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupMessageSubscribe;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.GroupMessageSubscribe;
            public static toObject(message: berty.protocol.GroupMessageSubscribe, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace GroupMessageSubscribe {

            interface IRequest {
                groupPubKey?: (Uint8Array|null);
                since?: (Uint8Array|null);
                until?: (Uint8Array|null);
                goBackwards?: (boolean|null);
            }

            class Request implements IRequest {

                public groupPubKey: Uint8Array;
                public since: Uint8Array;
                public until: Uint8Array;
                public goBackwards: boolean;
                public static create(properties?: berty.protocol.GroupMessageSubscribe.IRequest): berty.protocol.GroupMessageSubscribe.Request;
                public static encode(message: berty.protocol.GroupMessageSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.GroupMessageSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupMessageSubscribe.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupMessageSubscribe.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.GroupMessageSubscribe.Request;
                public static toObject(message: berty.protocol.GroupMessageSubscribe.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                event?: (berty.protocol.IGroupMessageStoreEvent|null);
            }

            class Reply implements IReply {

                public event?: (berty.protocol.IGroupMessageStoreEvent|null);
                public static create(properties?: berty.protocol.GroupMessageSubscribe.IReply): berty.protocol.GroupMessageSubscribe.Reply;
                public static encode(message: berty.protocol.GroupMessageSubscribe.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.GroupMessageSubscribe.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupMessageSubscribe.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupMessageSubscribe.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.GroupMessageSubscribe.Reply;
                public static toObject(message: berty.protocol.GroupMessageSubscribe.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IGroupMessageStoreEvent {
            groupStoreEvent?: (berty.protocol.IGroupStoreEvent|null);
            payload?: (Uint8Array|null);
        }

        class GroupMessageStoreEvent implements IGroupMessageStoreEvent {

            public groupStoreEvent?: (berty.protocol.IGroupStoreEvent|null);
            public payload: Uint8Array;
            public static create(properties?: berty.protocol.IGroupMessageStoreEvent): berty.protocol.GroupMessageStoreEvent;
            public static encode(message: berty.protocol.IGroupMessageStoreEvent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IGroupMessageStoreEvent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupMessageStoreEvent;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupMessageStoreEvent;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.GroupMessageStoreEvent;
            public static toObject(message: berty.protocol.GroupMessageStoreEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IGroupMemberSubscribe {
        }

        class GroupMemberSubscribe implements IGroupMemberSubscribe {

            public static create(properties?: berty.protocol.IGroupMemberSubscribe): berty.protocol.GroupMemberSubscribe;
            public static encode(message: berty.protocol.IGroupMemberSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IGroupMemberSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupMemberSubscribe;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupMemberSubscribe;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.GroupMemberSubscribe;
            public static toObject(message: berty.protocol.GroupMemberSubscribe, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace GroupMemberSubscribe {

            interface IRequest {
                groupPubKey?: (Uint8Array|null);
                since?: (Uint8Array|null);
                until?: (Uint8Array|null);
                goBackwards?: (boolean|null);
            }

            class Request implements IRequest {

                public groupPubKey: Uint8Array;
                public since: Uint8Array;
                public until: Uint8Array;
                public goBackwards: boolean;
                public static create(properties?: berty.protocol.GroupMemberSubscribe.IRequest): berty.protocol.GroupMemberSubscribe.Request;
                public static encode(message: berty.protocol.GroupMemberSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.GroupMemberSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupMemberSubscribe.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupMemberSubscribe.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.GroupMemberSubscribe.Request;
                public static toObject(message: berty.protocol.GroupMemberSubscribe.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                event?: (berty.protocol.IGroupMemberStoreEvent|null);
            }

            class Reply implements IReply {

                public event?: (berty.protocol.IGroupMemberStoreEvent|null);
                public static create(properties?: berty.protocol.GroupMemberSubscribe.IReply): berty.protocol.GroupMemberSubscribe.Reply;
                public static encode(message: berty.protocol.GroupMemberSubscribe.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.GroupMemberSubscribe.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupMemberSubscribe.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupMemberSubscribe.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.GroupMemberSubscribe.Reply;
                public static toObject(message: berty.protocol.GroupMemberSubscribe.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IGroupMemberStoreEvent {
            groupStoreEvent?: (berty.protocol.IGroupStoreEvent|null);
        }

        class GroupMemberStoreEvent implements IGroupMemberStoreEvent {

            public groupStoreEvent?: (berty.protocol.IGroupStoreEvent|null);
            public static create(properties?: berty.protocol.IGroupMemberStoreEvent): berty.protocol.GroupMemberStoreEvent;
            public static encode(message: berty.protocol.IGroupMemberStoreEvent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IGroupMemberStoreEvent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupMemberStoreEvent;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupMemberStoreEvent;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.GroupMemberStoreEvent;
            public static toObject(message: berty.protocol.GroupMemberStoreEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IGroupCreate {
        }

        class GroupCreate implements IGroupCreate {

            public static create(properties?: berty.protocol.IGroupCreate): berty.protocol.GroupCreate;
            public static encode(message: berty.protocol.IGroupCreate, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IGroupCreate, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupCreate;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupCreate;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.GroupCreate;
            public static toObject(message: berty.protocol.GroupCreate, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace GroupCreate {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.protocol.GroupCreate.IRequest): berty.protocol.GroupCreate.Request;
                public static encode(message: berty.protocol.GroupCreate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.GroupCreate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupCreate.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupCreate.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.GroupCreate.Request;
                public static toObject(message: berty.protocol.GroupCreate.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.protocol.GroupCreate.IReply): berty.protocol.GroupCreate.Reply;
                public static encode(message: berty.protocol.GroupCreate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.GroupCreate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupCreate.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupCreate.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.GroupCreate.Reply;
                public static toObject(message: berty.protocol.GroupCreate.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IGroupJoin {
        }

        class GroupJoin implements IGroupJoin {

            public static create(properties?: berty.protocol.IGroupJoin): berty.protocol.GroupJoin;
            public static encode(message: berty.protocol.IGroupJoin, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IGroupJoin, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupJoin;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupJoin;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.GroupJoin;
            public static toObject(message: berty.protocol.GroupJoin, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace GroupJoin {

            interface IRequest {
                reference?: (Uint8Array|null);
                meta?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public reference: Uint8Array;
                public meta: Uint8Array;
                public static create(properties?: berty.protocol.GroupJoin.IRequest): berty.protocol.GroupJoin.Request;
                public static encode(message: berty.protocol.GroupJoin.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.GroupJoin.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupJoin.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupJoin.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.GroupJoin.Request;
                public static toObject(message: berty.protocol.GroupJoin.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.protocol.GroupJoin.IReply): berty.protocol.GroupJoin.Reply;
                public static encode(message: berty.protocol.GroupJoin.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.GroupJoin.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupJoin.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupJoin.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.GroupJoin.Reply;
                public static toObject(message: berty.protocol.GroupJoin.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IGroupLeave {
        }

        class GroupLeave implements IGroupLeave {

            public static create(properties?: berty.protocol.IGroupLeave): berty.protocol.GroupLeave;
            public static encode(message: berty.protocol.IGroupLeave, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IGroupLeave, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupLeave;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupLeave;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.GroupLeave;
            public static toObject(message: berty.protocol.GroupLeave, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace GroupLeave {

            interface IRequest {
                groupPubKey?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPubKey: Uint8Array;
                public static create(properties?: berty.protocol.GroupLeave.IRequest): berty.protocol.GroupLeave.Request;
                public static encode(message: berty.protocol.GroupLeave.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.GroupLeave.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupLeave.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupLeave.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.GroupLeave.Request;
                public static toObject(message: berty.protocol.GroupLeave.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.protocol.GroupLeave.IReply): berty.protocol.GroupLeave.Reply;
                public static encode(message: berty.protocol.GroupLeave.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.GroupLeave.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupLeave.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupLeave.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.GroupLeave.Reply;
                public static toObject(message: berty.protocol.GroupLeave.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IGroupInvite {
        }

        class GroupInvite implements IGroupInvite {

            public static create(properties?: berty.protocol.IGroupInvite): berty.protocol.GroupInvite;
            public static encode(message: berty.protocol.IGroupInvite, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IGroupInvite, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupInvite;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupInvite;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.GroupInvite;
            public static toObject(message: berty.protocol.GroupInvite, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace GroupInvite {

            interface IRequest {
                groupPubKey?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPubKey: Uint8Array;
                public static create(properties?: berty.protocol.GroupInvite.IRequest): berty.protocol.GroupInvite.Request;
                public static encode(message: berty.protocol.GroupInvite.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.GroupInvite.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupInvite.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupInvite.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.GroupInvite.Request;
                public static toObject(message: berty.protocol.GroupInvite.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                reference?: (Uint8Array|null);
            }

            class Reply implements IReply {

                public reference: Uint8Array;
                public static create(properties?: berty.protocol.GroupInvite.IReply): berty.protocol.GroupInvite.Reply;
                public static encode(message: berty.protocol.GroupInvite.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.GroupInvite.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.GroupInvite.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.GroupInvite.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.GroupInvite.Reply;
                public static toObject(message: berty.protocol.GroupInvite.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IDevicePair {
        }

        class DevicePair implements IDevicePair {

            public static create(properties?: berty.protocol.IDevicePair): berty.protocol.DevicePair;
            public static encode(message: berty.protocol.IDevicePair, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IDevicePair, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.DevicePair;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.DevicePair;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.DevicePair;
            public static toObject(message: berty.protocol.DevicePair, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace DevicePair {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.protocol.DevicePair.IRequest): berty.protocol.DevicePair.Request;
                public static encode(message: berty.protocol.DevicePair.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.DevicePair.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.DevicePair.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.DevicePair.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.DevicePair.Request;
                public static toObject(message: berty.protocol.DevicePair.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.protocol.DevicePair.IReply): berty.protocol.DevicePair.Reply;
                public static encode(message: berty.protocol.DevicePair.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.DevicePair.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.DevicePair.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.DevicePair.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.DevicePair.Reply;
                public static toObject(message: berty.protocol.DevicePair.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRequestReference {
        }

        class ContactRequestReference implements IContactRequestReference {

            public static create(properties?: berty.protocol.IContactRequestReference): berty.protocol.ContactRequestReference;
            public static encode(message: berty.protocol.IContactRequestReference, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IContactRequestReference, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactRequestReference;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactRequestReference;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.ContactRequestReference;
            public static toObject(message: berty.protocol.ContactRequestReference, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRequestReference {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.protocol.ContactRequestReference.IRequest): berty.protocol.ContactRequestReference.Request;
                public static encode(message: berty.protocol.ContactRequestReference.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.ContactRequestReference.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactRequestReference.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactRequestReference.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.ContactRequestReference.Request;
                public static toObject(message: berty.protocol.ContactRequestReference.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                reference?: (Uint8Array|null);
            }

            class Reply implements IReply {

                public reference: Uint8Array;
                public static create(properties?: berty.protocol.ContactRequestReference.IReply): berty.protocol.ContactRequestReference.Reply;
                public static encode(message: berty.protocol.ContactRequestReference.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.ContactRequestReference.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactRequestReference.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactRequestReference.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.ContactRequestReference.Reply;
                public static toObject(message: berty.protocol.ContactRequestReference.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRequestDisable {
        }

        class ContactRequestDisable implements IContactRequestDisable {

            public static create(properties?: berty.protocol.IContactRequestDisable): berty.protocol.ContactRequestDisable;
            public static encode(message: berty.protocol.IContactRequestDisable, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IContactRequestDisable, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactRequestDisable;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactRequestDisable;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.ContactRequestDisable;
            public static toObject(message: berty.protocol.ContactRequestDisable, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRequestDisable {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.protocol.ContactRequestDisable.IRequest): berty.protocol.ContactRequestDisable.Request;
                public static encode(message: berty.protocol.ContactRequestDisable.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.ContactRequestDisable.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactRequestDisable.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactRequestDisable.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.ContactRequestDisable.Request;
                public static toObject(message: berty.protocol.ContactRequestDisable.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.protocol.ContactRequestDisable.IReply): berty.protocol.ContactRequestDisable.Reply;
                public static encode(message: berty.protocol.ContactRequestDisable.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.ContactRequestDisable.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactRequestDisable.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactRequestDisable.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.ContactRequestDisable.Reply;
                public static toObject(message: berty.protocol.ContactRequestDisable.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRequestEnable {
        }

        class ContactRequestEnable implements IContactRequestEnable {

            public static create(properties?: berty.protocol.IContactRequestEnable): berty.protocol.ContactRequestEnable;
            public static encode(message: berty.protocol.IContactRequestEnable, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IContactRequestEnable, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactRequestEnable;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactRequestEnable;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.ContactRequestEnable;
            public static toObject(message: berty.protocol.ContactRequestEnable, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRequestEnable {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.protocol.ContactRequestEnable.IRequest): berty.protocol.ContactRequestEnable.Request;
                public static encode(message: berty.protocol.ContactRequestEnable.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.ContactRequestEnable.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactRequestEnable.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactRequestEnable.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.ContactRequestEnable.Request;
                public static toObject(message: berty.protocol.ContactRequestEnable.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.protocol.ContactRequestEnable.IReply): berty.protocol.ContactRequestEnable.Reply;
                public static encode(message: berty.protocol.ContactRequestEnable.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.ContactRequestEnable.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactRequestEnable.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactRequestEnable.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.ContactRequestEnable.Reply;
                public static toObject(message: berty.protocol.ContactRequestEnable.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRequestResetLink {
        }

        class ContactRequestResetLink implements IContactRequestResetLink {

            public static create(properties?: berty.protocol.IContactRequestResetLink): berty.protocol.ContactRequestResetLink;
            public static encode(message: berty.protocol.IContactRequestResetLink, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IContactRequestResetLink, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactRequestResetLink;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactRequestResetLink;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.ContactRequestResetLink;
            public static toObject(message: berty.protocol.ContactRequestResetLink, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRequestResetLink {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.protocol.ContactRequestResetLink.IRequest): berty.protocol.ContactRequestResetLink.Request;
                public static encode(message: berty.protocol.ContactRequestResetLink.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.ContactRequestResetLink.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactRequestResetLink.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactRequestResetLink.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.ContactRequestResetLink.Request;
                public static toObject(message: berty.protocol.ContactRequestResetLink.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                reference?: (Uint8Array|null);
            }

            class Reply implements IReply {

                public reference: Uint8Array;
                public static create(properties?: berty.protocol.ContactRequestResetLink.IReply): berty.protocol.ContactRequestResetLink.Reply;
                public static encode(message: berty.protocol.ContactRequestResetLink.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.ContactRequestResetLink.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactRequestResetLink.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactRequestResetLink.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.ContactRequestResetLink.Reply;
                public static toObject(message: berty.protocol.ContactRequestResetLink.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRequestEnqueue {
        }

        class ContactRequestEnqueue implements IContactRequestEnqueue {

            public static create(properties?: berty.protocol.IContactRequestEnqueue): berty.protocol.ContactRequestEnqueue;
            public static encode(message: berty.protocol.IContactRequestEnqueue, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IContactRequestEnqueue, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactRequestEnqueue;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactRequestEnqueue;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.ContactRequestEnqueue;
            public static toObject(message: berty.protocol.ContactRequestEnqueue, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRequestEnqueue {

            interface IRequest {
                reference?: (Uint8Array|null);
                meta?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public reference: Uint8Array;
                public meta: Uint8Array;
                public static create(properties?: berty.protocol.ContactRequestEnqueue.IRequest): berty.protocol.ContactRequestEnqueue.Request;
                public static encode(message: berty.protocol.ContactRequestEnqueue.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.ContactRequestEnqueue.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactRequestEnqueue.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactRequestEnqueue.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.ContactRequestEnqueue.Request;
                public static toObject(message: berty.protocol.ContactRequestEnqueue.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.protocol.ContactRequestEnqueue.IReply): berty.protocol.ContactRequestEnqueue.Reply;
                public static encode(message: berty.protocol.ContactRequestEnqueue.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.ContactRequestEnqueue.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactRequestEnqueue.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactRequestEnqueue.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.ContactRequestEnqueue.Reply;
                public static toObject(message: berty.protocol.ContactRequestEnqueue.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRequestAccept {
        }

        class ContactRequestAccept implements IContactRequestAccept {

            public static create(properties?: berty.protocol.IContactRequestAccept): berty.protocol.ContactRequestAccept;
            public static encode(message: berty.protocol.IContactRequestAccept, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IContactRequestAccept, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactRequestAccept;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactRequestAccept;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.ContactRequestAccept;
            public static toObject(message: berty.protocol.ContactRequestAccept, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRequestAccept {

            interface IRequest {
                contactPubKey?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public contactPubKey: Uint8Array;
                public static create(properties?: berty.protocol.ContactRequestAccept.IRequest): berty.protocol.ContactRequestAccept.Request;
                public static encode(message: berty.protocol.ContactRequestAccept.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.ContactRequestAccept.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactRequestAccept.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactRequestAccept.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.ContactRequestAccept.Request;
                public static toObject(message: berty.protocol.ContactRequestAccept.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.protocol.ContactRequestAccept.IReply): berty.protocol.ContactRequestAccept.Reply;
                public static encode(message: berty.protocol.ContactRequestAccept.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.ContactRequestAccept.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactRequestAccept.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactRequestAccept.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.ContactRequestAccept.Reply;
                public static toObject(message: berty.protocol.ContactRequestAccept.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRemove {
        }

        class ContactRemove implements IContactRemove {

            public static create(properties?: berty.protocol.IContactRemove): berty.protocol.ContactRemove;
            public static encode(message: berty.protocol.IContactRemove, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IContactRemove, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactRemove;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactRemove;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.ContactRemove;
            public static toObject(message: berty.protocol.ContactRemove, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRemove {

            interface IRequest {
                contactPubKey?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public contactPubKey: Uint8Array;
                public static create(properties?: berty.protocol.ContactRemove.IRequest): berty.protocol.ContactRemove.Request;
                public static encode(message: berty.protocol.ContactRemove.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.ContactRemove.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactRemove.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactRemove.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.ContactRemove.Request;
                public static toObject(message: berty.protocol.ContactRemove.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.protocol.ContactRemove.IReply): berty.protocol.ContactRemove.Reply;
                public static encode(message: berty.protocol.ContactRemove.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.ContactRemove.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactRemove.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactRemove.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.ContactRemove.Reply;
                public static toObject(message: berty.protocol.ContactRemove.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactBlock {
        }

        class ContactBlock implements IContactBlock {

            public static create(properties?: berty.protocol.IContactBlock): berty.protocol.ContactBlock;
            public static encode(message: berty.protocol.IContactBlock, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IContactBlock, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactBlock;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactBlock;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.ContactBlock;
            public static toObject(message: berty.protocol.ContactBlock, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactBlock {

            interface IRequest {
                contactPubKey?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public contactPubKey: Uint8Array;
                public static create(properties?: berty.protocol.ContactBlock.IRequest): berty.protocol.ContactBlock.Request;
                public static encode(message: berty.protocol.ContactBlock.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.ContactBlock.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactBlock.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactBlock.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.ContactBlock.Request;
                public static toObject(message: berty.protocol.ContactBlock.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.protocol.ContactBlock.IReply): berty.protocol.ContactBlock.Reply;
                public static encode(message: berty.protocol.ContactBlock.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.ContactBlock.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactBlock.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactBlock.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.ContactBlock.Reply;
                public static toObject(message: berty.protocol.ContactBlock.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactUnblock {
        }

        class ContactUnblock implements IContactUnblock {

            public static create(properties?: berty.protocol.IContactUnblock): berty.protocol.ContactUnblock;
            public static encode(message: berty.protocol.IContactUnblock, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IContactUnblock, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactUnblock;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactUnblock;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.ContactUnblock;
            public static toObject(message: berty.protocol.ContactUnblock, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactUnblock {

            interface IRequest {
                contactPubKey?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public contactPubKey: Uint8Array;
                public static create(properties?: berty.protocol.ContactUnblock.IRequest): berty.protocol.ContactUnblock.Request;
                public static encode(message: berty.protocol.ContactUnblock.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.ContactUnblock.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactUnblock.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactUnblock.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.ContactUnblock.Request;
                public static toObject(message: berty.protocol.ContactUnblock.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.protocol.ContactUnblock.IReply): berty.protocol.ContactUnblock.Reply;
                public static encode(message: berty.protocol.ContactUnblock.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.ContactUnblock.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.ContactUnblock.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.ContactUnblock.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.ContactUnblock.Reply;
                public static toObject(message: berty.protocol.ContactUnblock.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IAccountSubscribe {
        }

        class AccountSubscribe implements IAccountSubscribe {

            public static create(properties?: berty.protocol.IAccountSubscribe): berty.protocol.AccountSubscribe;
            public static encode(message: berty.protocol.IAccountSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IAccountSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.AccountSubscribe;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.AccountSubscribe;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.AccountSubscribe;
            public static toObject(message: berty.protocol.AccountSubscribe, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace AccountSubscribe {

            interface IRequest {
                since?: (Uint8Array|null);
                until?: (Uint8Array|null);
                goBackwards?: (boolean|null);
            }

            class Request implements IRequest {

                public since: Uint8Array;
                public until: Uint8Array;
                public goBackwards: boolean;
                public static create(properties?: berty.protocol.AccountSubscribe.IRequest): berty.protocol.AccountSubscribe.Request;
                public static encode(message: berty.protocol.AccountSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.AccountSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.AccountSubscribe.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.AccountSubscribe.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.AccountSubscribe.Request;
                public static toObject(message: berty.protocol.AccountSubscribe.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                event?: (berty.protocol.IAccountStoreEvent|null);
            }

            class Reply implements IReply {

                public event?: (berty.protocol.IAccountStoreEvent|null);
                public static create(properties?: berty.protocol.AccountSubscribe.IReply): berty.protocol.AccountSubscribe.Reply;
                public static encode(message: berty.protocol.AccountSubscribe.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.AccountSubscribe.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.AccountSubscribe.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.AccountSubscribe.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.AccountSubscribe.Reply;
                public static toObject(message: berty.protocol.AccountSubscribe.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IAccountStoreEvent {
            subjectPublicKeyBytes?: (Uint8Array|null);
            data?: (Uint8Array|null);
        }

        class AccountStoreEvent implements IAccountStoreEvent {

            public subjectPublicKeyBytes: Uint8Array;
            public data: Uint8Array;
            public static create(properties?: berty.protocol.IAccountStoreEvent): berty.protocol.AccountStoreEvent;
            public static encode(message: berty.protocol.IAccountStoreEvent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.IAccountStoreEvent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.AccountStoreEvent;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.AccountStoreEvent;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.AccountStoreEvent;
            public static toObject(message: berty.protocol.AccountStoreEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };
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
