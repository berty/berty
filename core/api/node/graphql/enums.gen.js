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

export const BertyNetworkMetricMetricsTypeInputMetricsType = {
  GLOBAL: 0,
  PROTOCOL: 1,
  PEER: 2,
}

export const ValueBertyNetworkMetricMetricsTypeInputMetricsType = {
  0: 'GLOBAL',
  1: 'PROTOCOL',
  2: 'PEER',
}

export const BertyNodeKindInputKind = {
  Unknown: 0,
  NodeStarted: 1,
  NodeStopped: 2,
  NodeIsAlive: 3,
  BackgroundCritical: 4,
  BackgroundError: 5,
  BackgroundWarn: 6,
  BackgroundInfo: 7,
  Debug: 8,
  Statistics: 9,
}

export const ValueBertyNodeKindInputKind = {
  0: 'Unknown',
  1: 'NodeStarted',
  2: 'NodeStopped',
  3: 'NodeIsAlive',
  4: 'BackgroundCritical',
  5: 'BackgroundError',
  6: 'BackgroundWarn',
  7: 'BackgroundInfo',
  8: 'Debug',
  9: 'Statistics',
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

export const BertyEntityConversationInputKind = {
  Unknown: 0,
  OneToOne: 1,
  Group: 2,
}

export const ValueBertyEntityConversationInputKind = {
  0: 'Unknown',
  1: 'OneToOne',
  2: 'Group',
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

export const BertyPushDevicePushTypeInputDevicePushType = {
  UnknownDevicePushType: 0,
  APNS: 1,
  FCM: 2,
  MQTT: 3,
}

export const ValueBertyPushDevicePushTypeInputDevicePushType = {
  0: 'UnknownDevicePushType',
  1: 'APNS',
  2: 'FCM',
  3: 'MQTT',
}

export const BertyPushPriorityInputPriority = {
  UnknownPriority: 0,
  Low: 1,
  Normal: 2,
}

export const ValueBertyPushPriorityInputPriority = {
  0: 'UnknownPriority',
  1: 'Low',
  2: 'Normal',
}

export const BertyEntityKindInputKind = {
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
  ConversationUpdate: 304,
  ConversationMemberInvite: 701,
  ConversationMemberLeave: 702,
  ConversationMemberSetTitle: 703,
  ConversationMemberSetTopic: 704,
  ConversationMemberSetOwner: 705,
  ConversationMemberBlock: 706,
  ConversationMemberUnblock: 707,
  ConversationMemberRead: 708,
  ConversationMemberWrite: 709,
  DevtoolsMapset: 401,
  SenderAliasUpdate: 501,
  DeviceUpdatePushConfig: 601,
  DevicePushTo: 602,
  Node: 99,
}

export const ValueBertyEntityKindInputKind = {
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
  304: 'ConversationUpdate',
  701: 'ConversationMemberInvite',
  702: 'ConversationMemberLeave',
  703: 'ConversationMemberSetTitle',
  704: 'ConversationMemberSetTopic',
  705: 'ConversationMemberSetOwner',
  706: 'ConversationMemberBlock',
  707: 'ConversationMemberUnblock',
  708: 'ConversationMemberRead',
  709: 'ConversationMemberWrite',
  401: 'DevtoolsMapset',
  501: 'SenderAliasUpdate',
  601: 'DeviceUpdatePushConfig',
  602: 'DevicePushTo',
  99: 'Node',
}

export const BertyEntityEventInputAckStatus = {
  UnknownAckStatus: 0,
  NotAcked: 1,
  AckedAtLeastOnce: 2,
  AckedByAllContacts: 3,
  AckedByAllDevices: 4,
}

export const ValueBertyEntityEventInputAckStatus = {
  0: 'UnknownAckStatus',
  1: 'NotAcked',
  2: 'AckedAtLeastOnce',
  3: 'AckedByAllContacts',
  4: 'AckedByAllDevices',
}

export const BertyEntityEventInputSeenStatus = {
  UnknownSeenStatus: 0,
  NotSeen: 1,
  SeenAtLeastOnce: 2,
  SeenByAllContacts: 3,
}

export const ValueBertyEntityEventInputSeenStatus = {
  0: 'UnknownSeenStatus',
  1: 'NotSeen',
  2: 'SeenAtLeastOnce',
  3: 'SeenByAllContacts',
}

export const BertyEntityEventInputTargetType = {
  UnknownTargetType: 0,
  ToSpecificDevice: 1,
  ToSpecificContact: 2,
  ToAllContacts: 3,
  ToSpecificConversation: 4,
  ToSelf: 5,
}

export const ValueBertyEntityEventInputTargetType = {
  0: 'UnknownTargetType',
  1: 'ToSpecificDevice',
  2: 'ToSpecificContact',
  3: 'ToAllContacts',
  4: 'ToSpecificConversation',
  5: 'ToSelf',
}

export const BertyEntityEventInputDirection = {
  UnknownDirection: 0,
  Incoming: 1,
  Outgoing: 2,
  Node: 99,
}

export const ValueBertyEntityEventInputDirection = {
  0: 'UnknownDirection',
  1: 'Incoming',
  2: 'Outgoing',
  99: 'Node',
}

export const BertyEntityEventDispatchInputMedium = {
  UnknownMedium: 0,
  LocalNetwork: 1,
  BLE: 2,
  Relay: 3,
}

export const ValueBertyEntityEventDispatchInputMedium = {
  0: 'UnknownMedium',
  1: 'LocalNetwork',
  2: 'BLE',
  3: 'Relay',
}

export const BertyEntityDebugVerbosityInputDebugVerbosity = {
  VERBOSITY_LEVEL_NONE: 0,
  VERBOSITY_LEVEL_CRITICAL: 1,
  VERBOSITY_LEVEL_ERROR: 2,
  VERBOSITY_LEVEL_WARN: 3,
  VERBOSITY_LEVEL_INFO: 4,
  VERBOSITY_LEVEL_DEBUG: 5,
}

export const ValueBertyEntityDebugVerbosityInputDebugVerbosity = {
  0: 'VERBOSITY_LEVEL_NONE',
  1: 'VERBOSITY_LEVEL_CRITICAL',
  2: 'VERBOSITY_LEVEL_ERROR',
  3: 'VERBOSITY_LEVEL_WARN',
  4: 'VERBOSITY_LEVEL_INFO',
  5: 'VERBOSITY_LEVEL_DEBUG',
}

export const BertyNetworkMetricConnectionTypeInputConnectionType = {
  NOT_CONNECTED: 0,
  CONNECTED: 1,
  CAN_CONNECT: 2,
  CANNOT_CONNECT: 3,
}

export const ValueBertyNetworkMetricConnectionTypeInputConnectionType = {
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
