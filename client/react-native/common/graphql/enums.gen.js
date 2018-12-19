// GENERATED CODE -- DO NOT EDIT!

export const GoogleProtobufFieldDescriptorProtoInputType = {
  TYPE_DOUBLE: 1,
  TYPE_FLOAT: 2,
  TYPE_INT64: 3,
  TYPE_UINT64: 4,
  TYPE_INT32: 5,
  TYPE_FIXED64: 6,
  TYPE_FIXED32: 7,
  TYPE_BOOL: 8,
  TYPE_STRING: 9,
  TYPE_GROUP: 10,
  TYPE_MESSAGE: 11,
  TYPE_BYTES: 12,
  TYPE_UINT32: 13,
  TYPE_ENUM: 14,
  TYPE_SFIXED32: 15,
  TYPE_SFIXED64: 16,
  TYPE_SINT32: 17,
  TYPE_SINT64: 18,
}

export const ValueGoogleProtobufFieldDescriptorProtoInputType = {
  1: 'TYPE_DOUBLE',
  2: 'TYPE_FLOAT',
  3: 'TYPE_INT64',
  4: 'TYPE_UINT64',
  5: 'TYPE_INT32',
  6: 'TYPE_FIXED64',
  7: 'TYPE_FIXED32',
  8: 'TYPE_BOOL',
  9: 'TYPE_STRING',
  10: 'TYPE_GROUP',
  11: 'TYPE_MESSAGE',
  12: 'TYPE_BYTES',
  13: 'TYPE_UINT32',
  14: 'TYPE_ENUM',
  15: 'TYPE_SFIXED32',
  16: 'TYPE_SFIXED64',
  17: 'TYPE_SINT32',
  18: 'TYPE_SINT64',
}

export const GoogleProtobufFieldDescriptorProtoInputLabel = {
  LABEL_OPTIONAL: 1,
  LABEL_REQUIRED: 2,
  LABEL_REPEATED: 3,
}

export const ValueGoogleProtobufFieldDescriptorProtoInputLabel = {
  1: 'LABEL_OPTIONAL',
  2: 'LABEL_REQUIRED',
  3: 'LABEL_REPEATED',
}

export const GoogleProtobufFileOptionsInputOptimizeMode = {
  SPEED: 1,
  CODE_SIZE: 2,
  LITE_RUNTIME: 3,
}

export const ValueGoogleProtobufFileOptionsInputOptimizeMode = {
  1: 'SPEED',
  2: 'CODE_SIZE',
  3: 'LITE_RUNTIME',
}

export const GoogleProtobufFieldOptionsInputCType = {
  STRING: 0,
  CORD: 1,
  STRING_PIECE: 2,
}

export const ValueGoogleProtobufFieldOptionsInputCType = {
  0: 'STRING',
  1: 'CORD',
  2: 'STRING_PIECE',
}

export const GoogleProtobufFieldOptionsInputJSType = {
  JS_NORMAL: 0,
  JS_STRING: 1,
  JS_NUMBER: 2,
}

export const ValueGoogleProtobufFieldOptionsInputJSType = {
  0: 'JS_NORMAL',
  1: 'JS_STRING',
  2: 'JS_NUMBER',
}

export const GoogleProtobufMethodOptionsInputIdempotencyLevel = {
  IDEMPOTENCY_UNKNOWN: 0,
  NO_SIDE_EFFECTS: 1,
  IDEMPOTENT: 2,
}

export const ValueGoogleProtobufMethodOptionsInputIdempotencyLevel = {
  0: 'IDEMPOTENCY_UNKNOWN',
  1: 'NO_SIDE_EFFECTS',
  2: 'IDEMPOTENT',
}

export const BertyEntityDeviceInputStatus = {
  Unknown: 0,
  Connected: 1,
  Disconnected: 2,
  Available: 3,
  Myself: 42,
}

export const ValueBertyEntityDeviceInputStatus = {
  0: 'Unknown',
  1: 'Connected',
  2: 'Disconnected',
  3: 'Available',
  42: 'Myself',
}

export const BertyEntityContactInputStatus = {
  Unknown: 0,
  IsFriend: 1,
  IsTrustedFriend: 2,
  IsRequested: 3,
  RequestedMe: 4,
  IsBlocked: 5,
  Myself: 42,
}

export const ValueBertyEntityContactInputStatus = {
  0: 'Unknown',
  1: 'IsFriend',
  2: 'IsTrustedFriend',
  3: 'IsRequested',
  4: 'RequestedMe',
  5: 'IsBlocked',
  42: 'Myself',
}

export const BertyEntityConversationMemberInputStatus = {
  Unknown: 0,
  Owner: 1,
  Active: 2,
  Blocked: 3,
}

export const ValueBertyEntityConversationMemberInputStatus = {
  0: 'Unknown',
  1: 'Owner',
  2: 'Active',
  3: 'Blocked',
}

export const BertyEntitySenderAliasInputStatus = {
  UNKNOWN: 0,
  SENT: 1,
  SENT_AND_ACKED: 2,
  RECEIVED: 3,
}

export const ValueBertyEntitySenderAliasInputStatus = {
  0: 'UNKNOWN',
  1: 'SENT',
  2: 'SENT_AND_ACKED',
  3: 'RECEIVED',
}

export const BertyP2pKindInputKind = {
  Unknown: 0,
  Sent: 101,
  Ack: 102,
  Ping: 103,
  Seen: 104,
  ContactRequest: 201,
  ContactRequestAccepted: 202,
  ContactShareMe: 203,
  ContactShare: 204,
  ConversationInvite: 301,
  ConversationNewMessage: 302,
  ConversationRead: 303,
  DevtoolsMapset: 401,
  SenderAliasUpdate: 501,
  Node: 99,
}

export const ValueBertyP2pKindInputKind = {
  0: 'Unknown',
  101: 'Sent',
  102: 'Ack',
  103: 'Ping',
  104: 'Seen',
  201: 'ContactRequest',
  202: 'ContactRequestAccepted',
  203: 'ContactShareMe',
  204: 'ContactShare',
  301: 'ConversationInvite',
  302: 'ConversationNewMessage',
  303: 'ConversationRead',
  401: 'DevtoolsMapset',
  501: 'SenderAliasUpdate',
  99: 'Node',
}

export const BertyP2pEventInputDirection = {
  UnknownDirection: 0,
  Incoming: 1,
  Outgoing: 2,
  Node: 99,
}

export const ValueBertyP2pEventInputDirection = {
  0: 'UnknownDirection',
  1: 'Incoming',
  2: 'Outgoing',
  99: 'Node',
}

export const BertyNetworkMetricsTypeInputMetricsType = {
  PEER: 0,
  PROTOCOL: 1,
  GLOBAL: 2,
}

export const ValueBertyNetworkMetricsTypeInputMetricsType = {
  0: 'PEER',
  1: 'PROTOCOL',
  2: 'GLOBAL',
}

export const BertyNodeKindInputKind = {
  Unknown: 0,
  NodeStarted: 1,
  NodeStopped: 2,
  NodeIsAlive: 3,
  BackgroundError: 4,
  BackgroundWarn: 5,
  Debug: 6,
  Statistics: 7,
}

export const ValueBertyNodeKindInputKind = {
  0: 'Unknown',
  1: 'NodeStarted',
  2: 'NodeStopped',
  3: 'NodeIsAlive',
  4: 'BackgroundError',
  5: 'BackgroundWarn',
  6: 'Debug',
  7: 'Statistics',
}

export const BertyNetworkConnectionTypeInputConnectionType = {
  NOT_CONNECTED: 0,
  CONNECTED: 1,
  CAN_CONNECT: 2,
  CANNOT_CONNECT: 3,
}

export const ValueBertyNetworkConnectionTypeInputConnectionType = {
  0: 'NOT_CONNECTED',
  1: 'CONNECTED',
  2: 'CAN_CONNECT',
  3: 'CANNOT_CONNECT',
}

export const BertyPkgDeviceinfoTypeInputType = { Unknown: 0, Raw: 1, Json: 2 }

export const ValueBertyPkgDeviceinfoTypeInputType = {
  0: 'Unknown',
  1: 'Raw',
  2: 'Json',
}

export const BertyNodeCommitLogInputOperation = {
  Create: 0,
  Update: 1,
  Delete: 2,
}

export const ValueBertyNodeCommitLogInputOperation = {
  0: 'Create',
  1: 'Update',
  2: 'Delete',
}

export const BertyNodeNullableTrueFalseInputNullableTrueFalse = {
  Null: 0,
  True: 1,
  False: 2,
}

export const ValueBertyNodeNullableTrueFalseInputNullableTrueFalse = {
  0: 'Null',
  1: 'True',
  2: 'False',
}
