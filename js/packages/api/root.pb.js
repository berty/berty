/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/light";

const $root = ($protobuf.roots["default"] || ($protobuf.roots["default"] = new $protobuf.Root()))
.addJSON({
  berty: {
    nested: {
      account: {
        nested: {
          v1: {
            options: {
              go_package: "berty.tech/berty/go/pkg/bertyaccount",
              "(gogoproto.marshaler_all)": true,
              "(gogoproto.unmarshaler_all)": true,
              "(gogoproto.sizer_all)": true
            },
            nested: {
              AccountService: {
                methods: {
                  OpenAccount: {
                    requestType: "OpenAccount.Request",
                    responseType: "OpenAccount.Reply"
                  },
                  OpenAccountWithProgress: {
                    requestType: "OpenAccountWithProgress.Request",
                    responseType: "OpenAccountWithProgress.Reply",
                    responseStream: true
                  },
                  CloseAccount: {
                    requestType: "CloseAccount.Request",
                    responseType: "CloseAccount.Reply"
                  },
                  CloseAccountWithProgress: {
                    requestType: "CloseAccountWithProgress.Request",
                    responseType: "CloseAccountWithProgress.Reply",
                    responseStream: true
                  },
                  ListAccounts: {
                    requestType: "ListAccounts.Request",
                    responseType: "ListAccounts.Reply"
                  },
                  DeleteAccount: {
                    requestType: "DeleteAccount.Request",
                    responseType: "DeleteAccount.Reply"
                  },
                  ImportAccount: {
                    requestType: "ImportAccount.Request",
                    responseType: "ImportAccount.Reply"
                  },
                  CreateAccount: {
                    requestType: "CreateAccount.Request",
                    responseType: "CreateAccount.Reply"
                  },
                  UpdateAccount: {
                    requestType: "UpdateAccount.Request",
                    responseType: "UpdateAccount.Reply"
                  },
                  GetGRPCListenerAddrs: {
                    requestType: "GetGRPCListenerAddrs.Request",
                    responseType: "GetGRPCListenerAddrs.Reply"
                  }
                }
              },
              OpenAccount: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      args: {
                        rule: "repeated",
                        type: "string",
                        id: 1
                      },
                      accountId: {
                        type: "string",
                        id: 2,
                        options: {
                          "(gogoproto.customname)": "AccountID"
                        }
                      },
                      loggerFilters: {
                        type: "string",
                        id: 3
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              OpenAccountWithProgress: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      args: {
                        rule: "repeated",
                        type: "string",
                        id: 1
                      },
                      accountId: {
                        type: "string",
                        id: 2,
                        options: {
                          "(gogoproto.customname)": "AccountID"
                        }
                      },
                      loggerFilters: {
                        type: "string",
                        id: 3
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      progress: {
                        type: "berty.protocol.v1.Progress",
                        id: 1
                      }
                    }
                  }
                }
              },
              CloseAccount: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              CloseAccountWithProgress: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      progress: {
                        type: "berty.protocol.v1.Progress",
                        id: 1
                      }
                    }
                  }
                }
              },
              AccountMetadata: {
                fields: {
                  accountId: {
                    type: "string",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "AccountID"
                    }
                  },
                  name: {
                    type: "string",
                    id: 2
                  },
                  avatarCid: {
                    type: "string",
                    id: 3,
                    options: {
                      "(gogoproto.customname)": "AvatarCID"
                    }
                  },
                  publicKey: {
                    type: "string",
                    id: 4
                  },
                  lastOpened: {
                    type: "int64",
                    id: 5
                  },
                  creationDate: {
                    type: "int64",
                    id: 6
                  },
                  error: {
                    type: "string",
                    id: 7
                  }
                }
              },
              ListAccounts: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      accounts: {
                        rule: "repeated",
                        type: "AccountMetadata",
                        id: 1
                      }
                    }
                  }
                }
              },
              DeleteAccount: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      accountId: {
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "AccountID"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              ImportAccount: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      accountId: {
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "AccountID"
                        }
                      },
                      accountName: {
                        type: "string",
                        id: 2
                      },
                      backupPath: {
                        type: "string",
                        id: 3
                      },
                      args: {
                        rule: "repeated",
                        type: "string",
                        id: 4
                      },
                      loggerFilters: {
                        type: "string",
                        id: 5
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      accountMetadata: {
                        type: "AccountMetadata",
                        id: 1
                      }
                    }
                  }
                }
              },
              CreateAccount: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      accountId: {
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "AccountID"
                        }
                      },
                      accountName: {
                        type: "string",
                        id: 2
                      },
                      args: {
                        rule: "repeated",
                        type: "string",
                        id: 3
                      },
                      loggerFilters: {
                        type: "string",
                        id: 4
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      accountMetadata: {
                        type: "AccountMetadata",
                        id: 1
                      }
                    }
                  }
                }
              },
              UpdateAccount: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      accountId: {
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "AccountID"
                        }
                      },
                      accountName: {
                        type: "string",
                        id: 2
                      },
                      avatarCid: {
                        type: "string",
                        id: 3,
                        options: {
                          "(gogoproto.customname)": "AvatarCID"
                        }
                      },
                      publicKey: {
                        type: "string",
                        id: 4
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      accountMetadata: {
                        type: "AccountMetadata",
                        id: 1
                      }
                    }
                  }
                }
              },
              GetGRPCListenerAddrs: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      entries: {
                        rule: "repeated",
                        type: "Entry",
                        id: 1
                      }
                    },
                    nested: {
                      Entry: {
                        fields: {
                          proto: {
                            type: "string",
                            id: 1
                          },
                          maddr: {
                            type: "string",
                            id: 2
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      protocol: {
        nested: {
          v1: {
            options: {
              go_package: "berty.tech/berty/go/pkg/protocoltypes",
              "(gogoproto.goproto_enum_prefix_all)": false,
              "(gogoproto.marshaler_all)": true,
              "(gogoproto.unmarshaler_all)": true,
              "(gogoproto.sizer_all)": true
            },
            nested: {
              ProtocolService: {
                methods: {
                  InstanceExportData: {
                    requestType: "InstanceExportData.Request",
                    responseType: "InstanceExportData.Reply",
                    responseStream: true
                  },
                  InstanceGetConfiguration: {
                    requestType: "InstanceGetConfiguration.Request",
                    responseType: "InstanceGetConfiguration.Reply"
                  },
                  ContactRequestReference: {
                    requestType: "ContactRequestReference.Request",
                    responseType: "ContactRequestReference.Reply"
                  },
                  ContactRequestDisable: {
                    requestType: "ContactRequestDisable.Request",
                    responseType: "ContactRequestDisable.Reply"
                  },
                  ContactRequestEnable: {
                    requestType: "ContactRequestEnable.Request",
                    responseType: "ContactRequestEnable.Reply"
                  },
                  ContactRequestResetReference: {
                    requestType: "ContactRequestResetReference.Request",
                    responseType: "ContactRequestResetReference.Reply"
                  },
                  ContactRequestSend: {
                    requestType: "ContactRequestSend.Request",
                    responseType: "ContactRequestSend.Reply"
                  },
                  ContactRequestAccept: {
                    requestType: "ContactRequestAccept.Request",
                    responseType: "ContactRequestAccept.Reply"
                  },
                  ContactRequestDiscard: {
                    requestType: "ContactRequestDiscard.Request",
                    responseType: "ContactRequestDiscard.Reply"
                  },
                  ContactBlock: {
                    requestType: "ContactBlock.Request",
                    responseType: "ContactBlock.Reply"
                  },
                  ContactUnblock: {
                    requestType: "ContactUnblock.Request",
                    responseType: "ContactUnblock.Reply"
                  },
                  ContactAliasKeySend: {
                    requestType: "ContactAliasKeySend.Request",
                    responseType: "ContactAliasKeySend.Reply"
                  },
                  MultiMemberGroupCreate: {
                    requestType: "MultiMemberGroupCreate.Request",
                    responseType: "MultiMemberGroupCreate.Reply"
                  },
                  MultiMemberGroupJoin: {
                    requestType: "MultiMemberGroupJoin.Request",
                    responseType: "MultiMemberGroupJoin.Reply"
                  },
                  MultiMemberGroupLeave: {
                    requestType: "MultiMemberGroupLeave.Request",
                    responseType: "MultiMemberGroupLeave.Reply"
                  },
                  MultiMemberGroupAliasResolverDisclose: {
                    requestType: "MultiMemberGroupAliasResolverDisclose.Request",
                    responseType: "MultiMemberGroupAliasResolverDisclose.Reply"
                  },
                  MultiMemberGroupAdminRoleGrant: {
                    requestType: "MultiMemberGroupAdminRoleGrant.Request",
                    responseType: "MultiMemberGroupAdminRoleGrant.Reply"
                  },
                  MultiMemberGroupInvitationCreate: {
                    requestType: "MultiMemberGroupInvitationCreate.Request",
                    responseType: "MultiMemberGroupInvitationCreate.Reply"
                  },
                  AppMetadataSend: {
                    requestType: "AppMetadataSend.Request",
                    responseType: "AppMetadataSend.Reply"
                  },
                  AppMessageSend: {
                    requestType: "AppMessageSend.Request",
                    responseType: "AppMessageSend.Reply"
                  },
                  GroupMetadataList: {
                    requestType: "GroupMetadataList.Request",
                    responseType: "GroupMetadataEvent",
                    responseStream: true
                  },
                  GroupMessageList: {
                    requestType: "GroupMessageList.Request",
                    responseType: "GroupMessageEvent",
                    responseStream: true
                  },
                  GroupInfo: {
                    requestType: "GroupInfo.Request",
                    responseType: "GroupInfo.Reply"
                  },
                  ActivateGroup: {
                    requestType: "ActivateGroup.Request",
                    responseType: "ActivateGroup.Reply"
                  },
                  DeactivateGroup: {
                    requestType: "DeactivateGroup.Request",
                    responseType: "DeactivateGroup.Reply"
                  },
                  MonitorGroup: {
                    requestType: "MonitorGroup.Request",
                    responseType: "MonitorGroup.Reply",
                    responseStream: true
                  },
                  DebugListGroups: {
                    requestType: "DebugListGroups.Request",
                    responseType: "DebugListGroups.Reply",
                    responseStream: true
                  },
                  DebugInspectGroupStore: {
                    requestType: "DebugInspectGroupStore.Request",
                    responseType: "DebugInspectGroupStore.Reply",
                    responseStream: true
                  },
                  DebugGroup: {
                    requestType: "DebugGroup.Request",
                    responseType: "DebugGroup.Reply"
                  },
                  SystemInfo: {
                    requestType: "SystemInfo.Request",
                    responseType: "SystemInfo.Reply"
                  },
                  AuthServiceInitFlow: {
                    requestType: "AuthServiceInitFlow.Request",
                    responseType: "AuthServiceInitFlow.Reply"
                  },
                  AuthServiceCompleteFlow: {
                    requestType: "AuthServiceCompleteFlow.Request",
                    responseType: "AuthServiceCompleteFlow.Reply"
                  },
                  ServicesTokenList: {
                    requestType: "ServicesTokenList.Request",
                    responseType: "ServicesTokenList.Reply",
                    responseStream: true
                  },
                  ReplicationServiceRegisterGroup: {
                    requestType: "ReplicationServiceRegisterGroup.Request",
                    responseType: "ReplicationServiceRegisterGroup.Reply"
                  },
                  PeerList: {
                    requestType: "PeerList.Request",
                    responseType: "PeerList.Reply"
                  },
                  AttachmentPrepare: {
                    requestType: "AttachmentPrepare.Request",
                    requestStream: true,
                    responseType: "AttachmentPrepare.Reply"
                  },
                  AttachmentRetrieve: {
                    requestType: "AttachmentRetrieve.Request",
                    responseType: "AttachmentRetrieve.Reply",
                    responseStream: true
                  }
                }
              },
              GroupType: {
                values: {
                  GroupTypeUndefined: 0,
                  GroupTypeAccount: 1,
                  GroupTypeContact: 2,
                  GroupTypeMultiMember: 3
                }
              },
              EventType: {
                values: {
                  EventTypeUndefined: 0,
                  EventTypeGroupMemberDeviceAdded: 1,
                  EventTypeGroupDeviceSecretAdded: 2,
                  EventTypeAccountGroupJoined: 101,
                  EventTypeAccountGroupLeft: 102,
                  EventTypeAccountContactRequestDisabled: 103,
                  EventTypeAccountContactRequestEnabled: 104,
                  EventTypeAccountContactRequestReferenceReset: 105,
                  EventTypeAccountContactRequestOutgoingEnqueued: 106,
                  EventTypeAccountContactRequestOutgoingSent: 107,
                  EventTypeAccountContactRequestIncomingReceived: 108,
                  EventTypeAccountContactRequestIncomingDiscarded: 109,
                  EventTypeAccountContactRequestIncomingAccepted: 110,
                  EventTypeAccountContactBlocked: 111,
                  EventTypeAccountContactUnblocked: 112,
                  EventTypeContactAliasKeyAdded: 201,
                  EventTypeMultiMemberGroupAliasResolverAdded: 301,
                  EventTypeMultiMemberGroupInitialMemberAnnounced: 302,
                  EventTypeMultiMemberGroupAdminRoleGranted: 303,
                  EventTypeAccountServiceTokenAdded: 401,
                  EventTypeAccountServiceTokenRemoved: 402,
                  EventTypeGroupReplicating: 403,
                  EventTypeGroupMetadataPayloadSent: 1001
                }
              },
              Account: {
                fields: {
                  group: {
                    type: "Group",
                    id: 1
                  },
                  accountPrivateKey: {
                    type: "bytes",
                    id: 2
                  },
                  aliasPrivateKey: {
                    type: "bytes",
                    id: 3
                  },
                  publicRendezvousSeed: {
                    type: "bytes",
                    id: 4
                  }
                }
              },
              Group: {
                fields: {
                  publicKey: {
                    type: "bytes",
                    id: 1
                  },
                  secret: {
                    type: "bytes",
                    id: 2
                  },
                  secretSig: {
                    type: "bytes",
                    id: 3
                  },
                  groupType: {
                    type: "GroupType",
                    id: 4
                  },
                  signPub: {
                    type: "bytes",
                    id: 5
                  },
                  updatesKey: {
                    type: "bytes",
                    id: 6
                  }
                }
              },
              GroupHeadsExport: {
                fields: {
                  publicKey: {
                    type: "bytes",
                    id: 1
                  },
                  signPub: {
                    type: "bytes",
                    id: 2
                  },
                  metadataHeadsCids: {
                    rule: "repeated",
                    type: "bytes",
                    id: 3,
                    options: {
                      "(gogoproto.customname)": "MetadataHeadsCIDs"
                    }
                  },
                  messagesHeadsCids: {
                    rule: "repeated",
                    type: "bytes",
                    id: 4,
                    options: {
                      "(gogoproto.customname)": "MessagesHeadsCIDs"
                    }
                  },
                  updatesKey: {
                    type: "bytes",
                    id: 5
                  }
                }
              },
              GroupMetadata: {
                fields: {
                  eventType: {
                    type: "EventType",
                    id: 1
                  },
                  payload: {
                    type: "bytes",
                    id: 2
                  },
                  sig: {
                    type: "bytes",
                    id: 3
                  },
                  protocolMetadata: {
                    type: "ProtocolMetadata",
                    id: 4
                  }
                }
              },
              GroupEnvelope: {
                fields: {
                  nonce: {
                    type: "bytes",
                    id: 1
                  },
                  event: {
                    type: "bytes",
                    id: 2
                  },
                  encryptedAttachmentCids: {
                    rule: "repeated",
                    type: "bytes",
                    id: 3,
                    options: {
                      "(gogoproto.customname)": "EncryptedAttachmentCIDs"
                    }
                  }
                }
              },
              MessageHeaders: {
                fields: {
                  counter: {
                    type: "uint64",
                    id: 1
                  },
                  devicePk: {
                    type: "bytes",
                    id: 2,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  },
                  sig: {
                    type: "bytes",
                    id: 3
                  },
                  metadata: {
                    keyType: "string",
                    type: "string",
                    id: 4
                  }
                }
              },
              ProtocolMetadata: {
                fields: {
                  attachmentsSecrets: {
                    rule: "repeated",
                    type: "bytes",
                    id: 1
                  }
                }
              },
              EncryptedMessage: {
                fields: {
                  plaintext: {
                    type: "bytes",
                    id: 1
                  },
                  protocolMetadata: {
                    type: "ProtocolMetadata",
                    id: 2
                  }
                }
              },
              MessageEnvelope: {
                fields: {
                  messageHeaders: {
                    type: "bytes",
                    id: 1
                  },
                  message: {
                    type: "bytes",
                    id: 2
                  },
                  nonce: {
                    type: "bytes",
                    id: 3
                  },
                  encryptedAttachmentCids: {
                    rule: "repeated",
                    type: "bytes",
                    id: 4,
                    options: {
                      "(gogoproto.customname)": "EncryptedAttachmentCIDs"
                    }
                  }
                }
              },
              EventContext: {
                fields: {
                  id: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  },
                  parentIds: {
                    rule: "repeated",
                    type: "bytes",
                    id: 2,
                    options: {
                      "(gogoproto.customname)": "ParentIDs"
                    }
                  },
                  groupPk: {
                    type: "bytes",
                    id: 3,
                    options: {
                      "(gogoproto.customname)": "GroupPK"
                    }
                  },
                  attachmentCids: {
                    rule: "repeated",
                    type: "bytes",
                    id: 4,
                    options: {
                      "(gogoproto.customname)": "AttachmentCIDs"
                    }
                  }
                }
              },
              AppMetadata: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  },
                  message: {
                    type: "bytes",
                    id: 2
                  }
                }
              },
              ContactAddAliasKey: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  },
                  aliasPk: {
                    type: "bytes",
                    id: 2,
                    options: {
                      "(gogoproto.customname)": "AliasPK"
                    }
                  }
                }
              },
              GroupAddMemberDevice: {
                fields: {
                  memberPk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "MemberPK"
                    }
                  },
                  devicePk: {
                    type: "bytes",
                    id: 2,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  },
                  memberSig: {
                    type: "bytes",
                    id: 3
                  }
                }
              },
              DeviceSecret: {
                fields: {
                  chainKey: {
                    type: "bytes",
                    id: 1
                  },
                  counter: {
                    type: "uint64",
                    id: 2
                  }
                }
              },
              GroupAddDeviceSecret: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  },
                  destMemberPk: {
                    type: "bytes",
                    id: 2,
                    options: {
                      "(gogoproto.customname)": "DestMemberPK"
                    }
                  },
                  payload: {
                    type: "bytes",
                    id: 3
                  }
                }
              },
              MultiMemberGroupAddAliasResolver: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  },
                  aliasResolver: {
                    type: "bytes",
                    id: 2
                  },
                  aliasProof: {
                    type: "bytes",
                    id: 3
                  }
                }
              },
              MultiMemberGrantAdminRole: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  },
                  granteeMemberPk: {
                    type: "bytes",
                    id: 2,
                    options: {
                      "(gogoproto.customname)": "GranteeMemberPK"
                    }
                  }
                }
              },
              MultiMemberInitialMember: {
                fields: {
                  memberPk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "MemberPK"
                    }
                  }
                }
              },
              GroupAddAdditionalRendezvousSeed: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  },
                  seed: {
                    type: "bytes",
                    id: 2
                  }
                }
              },
              GroupRemoveAdditionalRendezvousSeed: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  },
                  seed: {
                    type: "bytes",
                    id: 2
                  }
                }
              },
              AccountGroupJoined: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  },
                  group: {
                    type: "Group",
                    id: 2
                  }
                }
              },
              AccountGroupLeft: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  },
                  groupPk: {
                    type: "bytes",
                    id: 2,
                    options: {
                      "(gogoproto.customname)": "GroupPK"
                    }
                  }
                }
              },
              AccountContactRequestDisabled: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  }
                }
              },
              AccountContactRequestEnabled: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  }
                }
              },
              AccountContactRequestReferenceReset: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  },
                  publicRendezvousSeed: {
                    type: "bytes",
                    id: 2
                  }
                }
              },
              AccountContactRequestEnqueued: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  },
                  groupPk: {
                    type: "bytes",
                    id: 2,
                    options: {
                      "(gogoproto.customname)": "GroupPK"
                    }
                  },
                  contact: {
                    type: "ShareableContact",
                    id: 3
                  },
                  ownMetadata: {
                    type: "bytes",
                    id: 4
                  }
                }
              },
              AccountContactRequestSent: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  },
                  contactPk: {
                    type: "bytes",
                    id: 2,
                    options: {
                      "(gogoproto.customname)": "ContactPK"
                    }
                  }
                }
              },
              AccountContactRequestReceived: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  },
                  contactPk: {
                    type: "bytes",
                    id: 2,
                    options: {
                      "(gogoproto.customname)": "ContactPK"
                    }
                  },
                  contactRendezvousSeed: {
                    type: "bytes",
                    id: 3
                  },
                  contactMetadata: {
                    type: "bytes",
                    id: 4
                  }
                }
              },
              AccountContactRequestDiscarded: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  },
                  contactPk: {
                    type: "bytes",
                    id: 2,
                    options: {
                      "(gogoproto.customname)": "ContactPK"
                    }
                  }
                }
              },
              AccountContactRequestAccepted: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  },
                  contactPk: {
                    type: "bytes",
                    id: 2,
                    options: {
                      "(gogoproto.customname)": "ContactPK"
                    }
                  },
                  groupPk: {
                    type: "bytes",
                    id: 3,
                    options: {
                      "(gogoproto.customname)": "GroupPK"
                    }
                  }
                }
              },
              AccountContactBlocked: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  },
                  contactPk: {
                    type: "bytes",
                    id: 2,
                    options: {
                      "(gogoproto.customname)": "ContactPK"
                    }
                  }
                }
              },
              AccountContactUnblocked: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  },
                  contactPk: {
                    type: "bytes",
                    id: 2,
                    options: {
                      "(gogoproto.customname)": "ContactPK"
                    }
                  }
                }
              },
              AccountServiceTokenAdded: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  },
                  serviceToken: {
                    type: "ServiceToken",
                    id: 2
                  }
                }
              },
              AccountServiceTokenRemoved: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  },
                  tokenId: {
                    type: "string",
                    id: 2,
                    options: {
                      "(gogoproto.customname)": "TokenID"
                    }
                  }
                }
              },
              GroupReplicating: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "DevicePK"
                    }
                  },
                  authenticationUrl: {
                    type: "string",
                    id: 2,
                    options: {
                      "(gogoproto.customname)": "AuthenticationURL"
                    }
                  },
                  replicationServer: {
                    type: "string",
                    id: 3
                  }
                }
              },
              InstanceExportData: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      exportedData: {
                        type: "bytes",
                        id: 1
                      }
                    }
                  }
                }
              },
              InstanceGetConfiguration: {
                fields: {},
                nested: {
                  SettingState: {
                    values: {
                      Unknown: 0,
                      Enabled: 1,
                      Disabled: 2,
                      Unavailable: 3
                    }
                  },
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      accountPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "AccountPK"
                        }
                      },
                      devicePk: {
                        type: "bytes",
                        id: 2,
                        options: {
                          "(gogoproto.customname)": "DevicePK"
                        }
                      },
                      accountGroupPk: {
                        type: "bytes",
                        id: 3,
                        options: {
                          "(gogoproto.customname)": "AccountGroupPK"
                        }
                      },
                      peerId: {
                        type: "string",
                        id: 4,
                        options: {
                          "(gogoproto.customname)": "PeerID"
                        }
                      },
                      listeners: {
                        rule: "repeated",
                        type: "string",
                        id: 5
                      },
                      bleEnabled: {
                        type: "SettingState",
                        id: 6
                      },
                      wifiP2pEnabled: {
                        type: "SettingState",
                        id: 7
                      },
                      mdnsEnabled: {
                        type: "SettingState",
                        id: 8
                      },
                      relayEnabled: {
                        type: "SettingState",
                        id: 9
                      }
                    }
                  }
                }
              },
              ContactRequestReference: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      publicRendezvousSeed: {
                        type: "bytes",
                        id: 1
                      },
                      enabled: {
                        type: "bool",
                        id: 2
                      }
                    }
                  }
                }
              },
              ContactRequestDisable: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              ContactRequestEnable: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      publicRendezvousSeed: {
                        type: "bytes",
                        id: 1
                      }
                    }
                  }
                }
              },
              ContactRequestResetReference: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      publicRendezvousSeed: {
                        type: "bytes",
                        id: 1
                      }
                    }
                  }
                }
              },
              ContactRequestSend: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      contact: {
                        type: "ShareableContact",
                        id: 1
                      },
                      ownMetadata: {
                        type: "bytes",
                        id: 2
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              ContactRequestAccept: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      contactPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "ContactPK"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              ContactRequestDiscard: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      contactPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "ContactPK"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              ContactBlock: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      contactPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "ContactPK"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              ContactUnblock: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      contactPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "ContactPK"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              ContactAliasKeySend: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              MultiMemberGroupCreate: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      groupPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      }
                    }
                  }
                }
              },
              MultiMemberGroupJoin: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      group: {
                        type: "Group",
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              MultiMemberGroupLeave: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              MultiMemberGroupAliasResolverDisclose: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              MultiMemberGroupAdminRoleGrant: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      },
                      memberPk: {
                        type: "bytes",
                        id: 2,
                        options: {
                          "(gogoproto.customname)": "MemberPK"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              MultiMemberGroupInvitationCreate: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      group: {
                        type: "Group",
                        id: 1
                      }
                    }
                  }
                }
              },
              AppMetadataSend: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      },
                      payload: {
                        type: "bytes",
                        id: 2
                      },
                      attachmentCids: {
                        rule: "repeated",
                        type: "bytes",
                        id: 3,
                        options: {
                          "(gogoproto.customname)": "AttachmentCIDs"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              AppMessageSend: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      },
                      payload: {
                        type: "bytes",
                        id: 2
                      },
                      attachmentCids: {
                        rule: "repeated",
                        type: "bytes",
                        id: 3,
                        options: {
                          "(gogoproto.customname)": "AttachmentCIDs"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      cid: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "CID"
                        }
                      }
                    }
                  }
                }
              },
              GroupMetadataEvent: {
                fields: {
                  eventContext: {
                    type: "EventContext",
                    id: 1
                  },
                  metadata: {
                    type: "GroupMetadata",
                    id: 2
                  },
                  event: {
                    type: "bytes",
                    id: 3
                  }
                }
              },
              GroupMessageEvent: {
                fields: {
                  eventContext: {
                    type: "EventContext",
                    id: 1
                  },
                  headers: {
                    type: "MessageHeaders",
                    id: 2
                  },
                  message: {
                    type: "bytes",
                    id: 3
                  }
                }
              },
              GroupMetadataList: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      },
                      sinceId: {
                        type: "bytes",
                        id: 2,
                        options: {
                          "(gogoproto.customname)": "SinceID"
                        }
                      },
                      sinceNow: {
                        type: "bool",
                        id: 3
                      },
                      untilId: {
                        type: "bytes",
                        id: 4,
                        options: {
                          "(gogoproto.customname)": "UntilID"
                        }
                      },
                      untilNow: {
                        type: "bool",
                        id: 5
                      },
                      reverseOrder: {
                        type: "bool",
                        id: 6
                      }
                    }
                  }
                }
              },
              GroupMessageList: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      },
                      sinceId: {
                        type: "bytes",
                        id: 2,
                        options: {
                          "(gogoproto.customname)": "SinceID"
                        }
                      },
                      sinceNow: {
                        type: "bool",
                        id: 3
                      },
                      untilId: {
                        type: "bytes",
                        id: 4,
                        options: {
                          "(gogoproto.customname)": "UntilID"
                        }
                      },
                      untilNow: {
                        type: "bool",
                        id: 5
                      },
                      reverseOrder: {
                        type: "bool",
                        id: 6
                      }
                    }
                  }
                }
              },
              GroupInfo: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      },
                      contactPk: {
                        type: "bytes",
                        id: 2,
                        options: {
                          "(gogoproto.customname)": "ContactPK"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      group: {
                        type: "Group",
                        id: 1
                      },
                      memberPk: {
                        type: "bytes",
                        id: 2,
                        options: {
                          "(gogoproto.customname)": "MemberPK"
                        }
                      },
                      devicePk: {
                        type: "bytes",
                        id: 3,
                        options: {
                          "(gogoproto.customname)": "DevicePK"
                        }
                      }
                    }
                  }
                }
              },
              ActivateGroup: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      },
                      localOnly: {
                        type: "bool",
                        id: 2
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              DeactivateGroup: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              MonitorGroup: {
                fields: {},
                nested: {
                  TypeEventMonitor: {
                    values: {
                      TypeEventMonitorUndefined: 0,
                      TypeEventMonitorAdvertiseGroup: 1,
                      TypeEventMonitorPeerFound: 2,
                      TypeEventMonitorPeerJoin: 3,
                      TypeEventMonitorPeerLeave: 4
                    }
                  },
                  EventMonitorAdvertiseGroup: {
                    fields: {
                      peerId: {
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "PeerID"
                        }
                      },
                      maddrs: {
                        rule: "repeated",
                        type: "string",
                        id: 2
                      },
                      driverName: {
                        type: "string",
                        id: 3
                      },
                      topic: {
                        type: "string",
                        id: 4
                      }
                    }
                  },
                  EventMonitorPeerFound: {
                    fields: {
                      peerId: {
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "PeerID"
                        }
                      },
                      maddrs: {
                        rule: "repeated",
                        type: "string",
                        id: 2
                      },
                      driverName: {
                        type: "string",
                        id: 3
                      },
                      topic: {
                        type: "string",
                        id: 4
                      }
                    }
                  },
                  EventMonitorPeerJoin: {
                    fields: {
                      peerId: {
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "PeerID"
                        }
                      },
                      maddrs: {
                        rule: "repeated",
                        type: "string",
                        id: 2
                      },
                      topic: {
                        type: "string",
                        id: 3
                      },
                      isSelf: {
                        type: "bool",
                        id: 4
                      }
                    }
                  },
                  EventMonitorPeerLeave: {
                    fields: {
                      peerId: {
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "PeerID"
                        }
                      },
                      topic: {
                        type: "string",
                        id: 3
                      },
                      isSelf: {
                        type: "bool",
                        id: 4
                      }
                    }
                  },
                  EventMonitor: {
                    fields: {
                      type: {
                        type: "TypeEventMonitor",
                        id: 1
                      },
                      advertiseGroup: {
                        type: "EventMonitorAdvertiseGroup",
                        id: 2
                      },
                      peerFound: {
                        type: "EventMonitorPeerFound",
                        id: 3
                      },
                      peerJoin: {
                        type: "EventMonitorPeerJoin",
                        id: 4
                      },
                      peerLeave: {
                        type: "EventMonitorPeerLeave",
                        id: 5
                      }
                    }
                  },
                  Request: {
                    fields: {
                      groupPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      event: {
                        type: "EventMonitor",
                        id: 1
                      },
                      groupPk: {
                        type: "bytes",
                        id: 2,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      }
                    }
                  }
                }
              },
              DebugListGroups: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      groupPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      },
                      groupType: {
                        type: "GroupType",
                        id: 2,
                        options: {
                          "(gogoproto.customname)": "GroupType"
                        }
                      },
                      contactPk: {
                        type: "bytes",
                        id: 3,
                        options: {
                          "(gogoproto.customname)": "ContactPK"
                        }
                      }
                    }
                  }
                }
              },
              DebugInspectGroupStore: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      },
                      logType: {
                        type: "DebugInspectGroupLogType",
                        id: 2,
                        options: {
                          "(gogoproto.customname)": "LogType"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      cid: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "CID"
                        }
                      },
                      parentCids: {
                        rule: "repeated",
                        type: "bytes",
                        id: 2,
                        options: {
                          "(gogoproto.customname)": "ParentCIDs"
                        }
                      },
                      metadataEventType: {
                        type: "EventType",
                        id: 3
                      },
                      devicePk: {
                        type: "bytes",
                        id: 4,
                        options: {
                          "(gogoproto.customname)": "DevicePK"
                        }
                      },
                      payload: {
                        type: "bytes",
                        id: 6
                      }
                    }
                  }
                }
              },
              DebugGroup: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      peerIds: {
                        rule: "repeated",
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "PeerIDs"
                        }
                      }
                    }
                  }
                }
              },
              DebugInspectGroupLogType: {
                values: {
                  DebugInspectGroupLogTypeUndefined: 0,
                  DebugInspectGroupLogTypeMessage: 1,
                  DebugInspectGroupLogTypeMetadata: 2
                }
              },
              ContactState: {
                values: {
                  ContactStateUndefined: 0,
                  ContactStateToRequest: 1,
                  ContactStateReceived: 2,
                  ContactStateAdded: 3,
                  ContactStateRemoved: 4,
                  ContactStateDiscarded: 5,
                  ContactStateBlocked: 6
                }
              },
              ShareableContact: {
                fields: {
                  pk: {
                    type: "bytes",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "PK"
                    }
                  },
                  publicRendezvousSeed: {
                    type: "bytes",
                    id: 2
                  },
                  metadata: {
                    type: "bytes",
                    id: 3
                  }
                }
              },
              ServiceTokenSupportedService: {
                fields: {
                  serviceType: {
                    type: "string",
                    id: 1
                  },
                  serviceEndpoint: {
                    type: "string",
                    id: 2
                  }
                }
              },
              ServiceToken: {
                fields: {
                  token: {
                    type: "string",
                    id: 1
                  },
                  authenticationUrl: {
                    type: "string",
                    id: 2,
                    options: {
                      "(gogoproto.customname)": "AuthenticationURL"
                    }
                  },
                  supportedServices: {
                    rule: "repeated",
                    type: "ServiceTokenSupportedService",
                    id: 3
                  },
                  expiration: {
                    type: "int64",
                    id: 4
                  }
                }
              },
              AuthServiceCompleteFlow: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      callbackUrl: {
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "CallbackURL"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      tokenId: {
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "TokenID"
                        }
                      }
                    }
                  }
                }
              },
              AuthServiceInitFlow: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      authUrl: {
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "AuthURL"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      url: {
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "URL"
                        }
                      },
                      secureUrl: {
                        type: "bool",
                        id: 2,
                        options: {
                          "(gogoproto.customname)": "SecureURL"
                        }
                      }
                    }
                  }
                }
              },
              ServicesTokenList: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      tokenId: {
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "TokenID"
                        }
                      },
                      service: {
                        type: "ServiceToken",
                        id: 2
                      }
                    }
                  }
                }
              },
              ServicesTokenCode: {
                fields: {
                  services: {
                    rule: "repeated",
                    type: "string",
                    id: 1
                  },
                  codeChallenge: {
                    type: "string",
                    id: 2
                  },
                  tokenId: {
                    type: "string",
                    id: 3,
                    options: {
                      "(gogoproto.customname)": "TokenID"
                    }
                  }
                }
              },
              ReplicationServiceRegisterGroup: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      tokenId: {
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "TokenID"
                        }
                      },
                      groupPk: {
                        type: "bytes",
                        id: 2,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              ReplicationServiceReplicateGroup: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      group: {
                        type: "Group",
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      ok: {
                        type: "bool",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "OK"
                        }
                      }
                    }
                  }
                }
              },
              SystemInfo: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      process: {
                        type: "Process",
                        id: 1
                      },
                      p2p: {
                        type: "P2P",
                        id: 2,
                        options: {
                          "(gogoproto.customname)": "P2P"
                        }
                      },
                      orbitdb: {
                        type: "OrbitDB",
                        id: 3,
                        options: {
                          "(gogoproto.customname)": "OrbitDB"
                        }
                      },
                      warns: {
                        rule: "repeated",
                        type: "string",
                        id: 4
                      }
                    }
                  },
                  OrbitDB: {
                    fields: {
                      accountMetadata: {
                        type: "ReplicationStatus",
                        id: 1
                      }
                    },
                    nested: {
                      ReplicationStatus: {
                        fields: {
                          progress: {
                            type: "int64",
                            id: 1
                          },
                          maximum: {
                            type: "int64",
                            id: 2
                          },
                          buffered: {
                            type: "int64",
                            id: 3
                          },
                          queued: {
                            type: "int64",
                            id: 4
                          }
                        }
                      }
                    }
                  },
                  P2P: {
                    fields: {
                      connectedPeers: {
                        type: "int64",
                        id: 1
                      }
                    }
                  },
                  Process: {
                    fields: {
                      version: {
                        type: "string",
                        id: 1
                      },
                      vcsRef: {
                        type: "string",
                        id: 2
                      },
                      uptimeMs: {
                        type: "int64",
                        id: 3,
                        options: {
                          "(gogoproto.customname)": "UptimeMS"
                        }
                      },
                      userCpuTimeMs: {
                        type: "int64",
                        id: 10,
                        options: {
                          "(gogoproto.customname)": "UserCPUTimeMS"
                        }
                      },
                      systemCpuTimeMs: {
                        type: "int64",
                        id: 11,
                        options: {
                          "(gogoproto.customname)": "SystemCPUTimeMS"
                        }
                      },
                      startedAt: {
                        type: "int64",
                        id: 12
                      },
                      rlimitCur: {
                        type: "uint64",
                        id: 13
                      },
                      numGoroutine: {
                        type: "int64",
                        id: 14
                      },
                      nofile: {
                        type: "int64",
                        id: 15
                      },
                      tooManyOpenFiles: {
                        type: "bool",
                        id: 16
                      },
                      numCpu: {
                        type: "int64",
                        id: 17,
                        options: {
                          "(gogoproto.customname)": "NumCPU"
                        }
                      },
                      goVersion: {
                        type: "string",
                        id: 18
                      },
                      operatingSystem: {
                        type: "string",
                        id: 19
                      },
                      hostName: {
                        type: "string",
                        id: 20
                      },
                      arch: {
                        type: "string",
                        id: 21
                      },
                      rlimitMax: {
                        type: "uint64",
                        id: 22
                      },
                      pid: {
                        type: "int64",
                        id: 23,
                        options: {
                          "(gogoproto.customname)": "PID"
                        }
                      },
                      ppid: {
                        type: "int64",
                        id: 24,
                        options: {
                          "(gogoproto.customname)": "PPID"
                        }
                      },
                      priority: {
                        type: "int64",
                        id: 25
                      },
                      uid: {
                        type: "int64",
                        id: 26,
                        options: {
                          "(gogoproto.customname)": "UID"
                        }
                      },
                      workingDir: {
                        type: "string",
                        id: 27
                      },
                      systemUsername: {
                        type: "string",
                        id: 28
                      }
                    }
                  }
                }
              },
              PeerList: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      peers: {
                        rule: "repeated",
                        type: "Peer",
                        id: 1
                      }
                    }
                  },
                  Peer: {
                    fields: {
                      id: {
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "ID"
                        }
                      },
                      routes: {
                        rule: "repeated",
                        type: "Route",
                        id: 2
                      },
                      errors: {
                        rule: "repeated",
                        type: "string",
                        id: 3
                      },
                      features: {
                        rule: "repeated",
                        type: "Feature",
                        id: 4
                      },
                      minLatency: {
                        type: "int64",
                        id: 5
                      },
                      isActive: {
                        type: "bool",
                        id: 6
                      },
                      direction: {
                        type: "Direction",
                        id: 7
                      }
                    }
                  },
                  Route: {
                    fields: {
                      isActive: {
                        type: "bool",
                        id: 1
                      },
                      address: {
                        type: "string",
                        id: 2
                      },
                      direction: {
                        type: "Direction",
                        id: 3
                      },
                      latency: {
                        type: "int64",
                        id: 4
                      },
                      streams: {
                        rule: "repeated",
                        type: "Stream",
                        id: 5
                      }
                    }
                  },
                  Stream: {
                    fields: {
                      id: {
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "ID"
                        }
                      }
                    }
                  },
                  Feature: {
                    values: {
                      UnknownFeature: 0,
                      BertyFeature: 1,
                      BLEFeature: 2,
                      LocalFeature: 3,
                      TorFeature: 4,
                      QuicFeature: 5
                    }
                  }
                }
              },
              Direction: {
                values: {
                  UnknownDir: 0,
                  InboundDir: 1,
                  OutboundDir: 2,
                  BiDir: 3
                }
              },
              AttachmentPrepare: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      block: {
                        type: "bytes",
                        id: 1
                      },
                      disableEncryption: {
                        type: "bool",
                        id: 2
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      attachmentCid: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "AttachmentCID"
                        }
                      }
                    }
                  }
                }
              },
              AttachmentRetrieve: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      attachmentCid: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "AttachmentCID"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      block: {
                        type: "bytes",
                        id: 2
                      }
                    }
                  }
                }
              },
              Progress: {
                fields: {
                  state: {
                    type: "string",
                    id: 1
                  },
                  doing: {
                    type: "string",
                    id: 2
                  },
                  progress: {
                    type: "float",
                    id: 3
                  },
                  completed: {
                    type: "uint64",
                    id: 4
                  },
                  total: {
                    type: "uint64",
                    id: 5
                  },
                  delay: {
                    type: "uint64",
                    id: 6
                  }
                }
              }
            }
          }
        }
      },
      errcode: {
        options: {
          go_package: "berty.tech/berty/go/pkg/errcode",
          "(gogoproto.goproto_enum_prefix_all)": false,
          "(gogoproto.marshaler_all)": true,
          "(gogoproto.unmarshaler_all)": true,
          "(gogoproto.sizer_all)": true
        },
        nested: {
          ErrCode: {
            values: {
              Undefined: 0,
              TODO: 666,
              ErrNotImplemented: 777,
              ErrInternal: 888,
              ErrInvalidInput: 100,
              ErrInvalidRange: 101,
              ErrMissingInput: 102,
              ErrSerialization: 103,
              ErrDeserialization: 104,
              ErrStreamRead: 105,
              ErrStreamWrite: 106,
              ErrStreamTransform: 110,
              ErrStreamSendAndClose: 111,
              ErrStreamHeaderWrite: 112,
              ErrStreamHeaderRead: 115,
              ErrStreamSink: 113,
              ErrStreamCloseAndRecv: 114,
              ErrMissingMapKey: 107,
              ErrDBWrite: 108,
              ErrDBRead: 109,
              ErrDBDestroy: 120,
              ErrDBMigrate: 121,
              ErrDBReplay: 122,
              ErrDBRestore: 123,
              ErrCryptoRandomGeneration: 200,
              ErrCryptoKeyGeneration: 201,
              ErrCryptoNonceGeneration: 202,
              ErrCryptoSignature: 203,
              ErrCryptoSignatureVerification: 204,
              ErrCryptoDecrypt: 205,
              ErrCryptoDecryptPayload: 206,
              ErrCryptoEncrypt: 207,
              ErrCryptoKeyConversion: 208,
              ErrCryptoCipherInit: 209,
              ErrCryptoKeyDerivation: 210,
              ErrMap: 300,
              ErrForEach: 301,
              ErrKeystoreGet: 400,
              ErrKeystorePut: 401,
              ErrNotFound: 404,
              ErrOrbitDBInit: 1000,
              ErrOrbitDBOpen: 1001,
              ErrOrbitDBAppend: 1002,
              ErrOrbitDBDeserialization: 1003,
              ErrOrbitDBStoreCast: 1004,
              ErrIPFSAdd: 1050,
              ErrIPFSGet: 1051,
              ErrIPFSInit: 1052,
              ErrIPFSSetupConfig: 1053,
              ErrIPFSSetupRepo: 1054,
              ErrIPFSSetupHost: 1055,
              ErrHandshakeOwnEphemeralKeyGenSend: 1100,
              ErrHandshakePeerEphemeralKeyRecv: 1101,
              ErrHandshakeRequesterAuthenticateBoxKeyGen: 1102,
              ErrHandshakeResponderAcceptBoxKeyGen: 1103,
              ErrHandshakeRequesterHello: 1104,
              ErrHandshakeResponderHello: 1105,
              ErrHandshakeRequesterAuthenticate: 1106,
              ErrHandshakeResponderAccept: 1107,
              ErrHandshakeRequesterAcknowledge: 1108,
              ErrContactRequestSameAccount: 1200,
              ErrContactRequestContactAlreadyAdded: 1201,
              ErrContactRequestContactBlocked: 1202,
              ErrContactRequestContactUndefined: 1203,
              ErrContactRequestIncomingAlreadyReceived: 1204,
              ErrGroupMemberLogEventOpen: 1300,
              ErrGroupMemberLogEventSignature: 1301,
              ErrGroupMemberUnknownGroupID: 1302,
              ErrGroupSecretOtherDestMember: 1303,
              ErrGroupSecretAlreadySentToMember: 1304,
              ErrGroupInvalidType: 1305,
              ErrGroupMissing: 1306,
              ErrGroupActivate: 1307,
              ErrGroupDeactivate: 1308,
              ErrGroupInfo: 1309,
              ErrEventListMetadata: 1400,
              ErrEventListMessage: 1401,
              ErrMessageKeyPersistencePut: 1500,
              ErrMessageKeyPersistenceGet: 1501,
              ErrBridgeInterrupted: 1600,
              ErrBridgeNotRunning: 1601,
              ErrMessengerInvalidDeepLink: 2000,
              ErrMessengerDeepLinkRequiresPassphrase: 2001,
              ErrMessengerDeepLinkInvalidPassphrase: 2002,
              ErrMessengerStreamEvent: 2003,
              ErrDBEntryAlreadyExists: 2100,
              ErrDBAddConversation: 2101,
              ErrDBAddContactRequestOutgoingSent: 2102,
              ErrDBAddContactRequestOutgoingEnqueud: 2103,
              ErrDBAddContactRequestIncomingReceived: 2104,
              ErrDBAddContactRequestIncomingAccepted: 2105,
              ErrDBAddGroupMemberDeviceAdded: 2106,
              ErrDBMultipleRecords: 2107,
              ErrReplayProcessGroupMetadata: 2200,
              ErrReplayProcessGroupMessage: 2201,
              ErrAttachmentPrepare: 2300,
              ErrAttachmentRetrieve: 2301,
              ErrProtocolSend: 2302,
              ErrTestEcho: 2401,
              ErrTestEchoRecv: 2402,
              ErrTestEchoSend: 2403,
              ErrCLINoTermcaps: 3001,
              ErrServicesAuth: 4000,
              ErrServicesAuthNotInitialized: 4001,
              ErrServicesAuthWrongState: 4002,
              ErrServicesAuthInvalidResponse: 4003,
              ErrServicesAuthServer: 4004,
              ErrServicesAuthCodeChallenge: 4005,
              ErrServicesAuthServiceInvalidToken: 4006,
              ErrServicesAuthServiceNotSupported: 4007,
              ErrServicesAuthUnknownToken: 4008,
              ErrServicesAuthInvalidURL: 4009,
              ErrServiceReplication: 4100,
              ErrServiceReplicationServer: 4101,
              ErrServiceReplicationMissingEndpoint: 4102,
              ErrBertyAccount: 5000,
              ErrBertyAccountNoIDSpecified: 5001,
              ErrBertyAccountAlreadyOpened: 5002,
              ErrBertyAccountInvalidIDFormat: 5003,
              ErrBertyAccountLoggerDecorator: 5004,
              ErrBertyAccountGRPCClient: 5005,
              ErrBertyAccountOpenAccount: 5006,
              ErrBertyAccountDataNotFound: 5007,
              ErrBertyAccountMetadataUpdate: 5008,
              ErrBertyAccountManagerOpen: 5009,
              ErrBertyAccountManagerClose: 5010,
              ErrBertyAccountInvalidCLIArgs: 5011,
              ErrBertyAccountFSError: 5012,
              ErrBertyAccountAlreadyExists: 5013,
              ErrBertyAccountNoBackupSpecified: 5014,
              ErrBertyAccountIDGenFailed: 5015,
              ErrBertyAccountCreationFailed: 5016,
              ErrBertyAccountUpdateFailed: 5017
            }
          },
          ErrDetails: {
            fields: {
              codes: {
                rule: "repeated",
                type: "ErrCode",
                id: 1
              }
            }
          }
        }
      },
      bridge: {
        nested: {
          v1: {
            options: {
              go_package: "berty.tech/berty/go/pkg/bertybridge",
              "(gogoproto.marshaler_all)": true,
              "(gogoproto.unmarshaler_all)": true,
              "(gogoproto.sizer_all)": true
            },
            nested: {
              BridgeService: {
                methods: {
                  ClientInvokeUnary: {
                    requestType: "ClientInvokeUnary.Request",
                    responseType: "ClientInvokeUnary.Reply"
                  },
                  CreateClientStream: {
                    requestType: "ClientCreateStream.Request",
                    responseType: "ClientCreateStream.Reply"
                  },
                  ClientStreamSend: {
                    requestType: "ClientStreamSend.Request",
                    responseType: "ClientStreamSend.Reply"
                  },
                  ClientStreamRecv: {
                    requestType: "ClientStreamRecv.Request",
                    responseType: "ClientStreamRecv.Reply"
                  },
                  ClientStreamClose: {
                    requestType: "ClientStreamClose.Request",
                    responseType: "ClientStreamClose.Reply"
                  },
                  ClientStreamCloseAndRecv: {
                    requestType: "ClientStreamCloseAndRecv.Request",
                    responseType: "ClientStreamCloseAndRecv.Reply"
                  }
                }
              },
              ClientInvokeUnary: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      methodDesc: {
                        type: "MethodDesc",
                        id: 2
                      },
                      payload: {
                        type: "bytes",
                        id: 3
                      },
                      header: {
                        rule: "repeated",
                        type: "Metadata",
                        id: 4
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      payload: {
                        type: "bytes",
                        id: 2
                      },
                      trailer: {
                        rule: "repeated",
                        type: "Metadata",
                        id: 3
                      },
                      error: {
                        type: "Error",
                        id: 4
                      }
                    }
                  }
                }
              },
              ClientCreateStream: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      methodDesc: {
                        type: "MethodDesc",
                        id: 2
                      },
                      payload: {
                        type: "bytes",
                        id: 3
                      },
                      header: {
                        rule: "repeated",
                        type: "Metadata",
                        id: 4
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      streamId: {
                        type: "string",
                        id: 1
                      },
                      trailer: {
                        rule: "repeated",
                        type: "Metadata",
                        id: 2
                      },
                      error: {
                        type: "Error",
                        id: 3
                      }
                    }
                  }
                }
              },
              ClientStreamSend: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      streamId: {
                        type: "string",
                        id: 1
                      },
                      payload: {
                        type: "bytes",
                        id: 2
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      streamId: {
                        type: "string",
                        id: 1
                      },
                      trailer: {
                        rule: "repeated",
                        type: "Metadata",
                        id: 2
                      },
                      error: {
                        type: "Error",
                        id: 3
                      }
                    }
                  }
                }
              },
              ClientStreamRecv: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      streamId: {
                        type: "string",
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      streamId: {
                        type: "string",
                        id: 1
                      },
                      payload: {
                        type: "bytes",
                        id: 2
                      },
                      trailer: {
                        rule: "repeated",
                        type: "Metadata",
                        id: 3
                      },
                      error: {
                        type: "Error",
                        id: 4
                      }
                    }
                  }
                }
              },
              ClientStreamClose: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      streamId: {
                        type: "string",
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      streamId: {
                        type: "string",
                        id: 1
                      },
                      trailer: {
                        rule: "repeated",
                        type: "Metadata",
                        id: 2
                      },
                      error: {
                        type: "Error",
                        id: 3
                      }
                    }
                  }
                }
              },
              ClientStreamCloseAndRecv: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      streamId: {
                        type: "string",
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      streamId: {
                        type: "string",
                        id: 1
                      },
                      payload: {
                        type: "bytes",
                        id: 2
                      },
                      trailer: {
                        rule: "repeated",
                        type: "Metadata",
                        id: 3
                      },
                      error: {
                        type: "Error",
                        id: 4
                      }
                    }
                  }
                }
              },
              MethodDesc: {
                fields: {
                  name: {
                    type: "string",
                    id: 1
                  },
                  isClientStream: {
                    type: "bool",
                    id: 2
                  },
                  isServerStream: {
                    type: "bool",
                    id: 3
                  }
                }
              },
              Metadata: {
                fields: {
                  key: {
                    type: "string",
                    id: 1
                  },
                  values: {
                    rule: "repeated",
                    type: "string",
                    id: 2
                  }
                }
              },
              Error: {
                fields: {
                  grpcErrorCode: {
                    type: "GRPCErrCode",
                    id: 1
                  },
                  errorCode: {
                    type: "errcode.ErrCode",
                    id: 2
                  },
                  message: {
                    type: "string",
                    id: 3
                  },
                  errorDetails: {
                    type: "errcode.ErrDetails",
                    id: 4
                  }
                }
              },
              GRPCErrCode: {
                values: {
                  OK: 0,
                  CANCELED: 1,
                  UNKNOWN: 2,
                  INVALID_ARGUMENT: 3,
                  DEADLINE_EXCEEDED: 4,
                  NOT_FOUND: 5,
                  ALREADY_EXISTS: 6,
                  PERMISSION_DENIED: 7,
                  RESOURCE_EXHAUSTED: 8,
                  FAILED_PRECONDITION: 9,
                  ABORTED: 10,
                  OUT_OF_RANGE: 11,
                  UNIMPLEMENTED: 12,
                  INTERNAL: 13,
                  UNAVAILABLE: 14,
                  DATA_LOSS: 15,
                  UNAUTHENTICATED: 16
                }
              }
            }
          }
        }
      },
      messenger: {
        nested: {
          v1: {
            options: {
              go_package: "berty.tech/berty/go/pkg/messengertypes",
              "(gogoproto.goproto_unkeyed_all)": false,
              "(gogoproto.goproto_unrecognized_all)": false,
              "(gogoproto.goproto_sizecache_all)": false
            },
            nested: {
              MessengerService: {
                methods: {
                  InstanceShareableBertyID: {
                    requestType: "InstanceShareableBertyID.Request",
                    responseType: "InstanceShareableBertyID.Reply"
                  },
                  ShareableBertyGroup: {
                    requestType: "ShareableBertyGroup.Request",
                    responseType: "ShareableBertyGroup.Reply"
                  },
                  DevShareInstanceBertyID: {
                    requestType: "DevShareInstanceBertyID.Request",
                    responseType: "DevShareInstanceBertyID.Reply"
                  },
                  DevStreamLogs: {
                    requestType: "DevStreamLogs.Request",
                    responseType: "DevStreamLogs.Reply",
                    responseStream: true
                  },
                  ParseDeepLink: {
                    requestType: "ParseDeepLink.Request",
                    responseType: "ParseDeepLink.Reply"
                  },
                  SendContactRequest: {
                    requestType: "SendContactRequest.Request",
                    responseType: "SendContactRequest.Reply"
                  },
                  SendReplyOptions: {
                    requestType: "SendReplyOptions.Request",
                    responseType: "SendReplyOptions.Reply"
                  },
                  SendAck: {
                    requestType: "SendAck.Request",
                    responseType: "SendAck.Reply"
                  },
                  SystemInfo: {
                    requestType: "SystemInfo.Request",
                    responseType: "SystemInfo.Reply"
                  },
                  EchoTest: {
                    requestType: "EchoTest.Request",
                    responseType: "EchoTest.Reply",
                    responseStream: true
                  },
                  EchoDuplexTest: {
                    requestType: "EchoDuplexTest.Request",
                    requestStream: true,
                    responseType: "EchoDuplexTest.Reply",
                    responseStream: true
                  },
                  ConversationStream: {
                    requestType: "ConversationStream.Request",
                    responseType: "ConversationStream.Reply",
                    responseStream: true
                  },
                  EventStream: {
                    requestType: "EventStream.Request",
                    responseType: "EventStream.Reply",
                    responseStream: true
                  },
                  ConversationCreate: {
                    requestType: "ConversationCreate.Request",
                    responseType: "ConversationCreate.Reply"
                  },
                  ConversationJoin: {
                    requestType: "ConversationJoin.Request",
                    responseType: "ConversationJoin.Reply"
                  },
                  AccountGet: {
                    requestType: "AccountGet.Request",
                    responseType: "AccountGet.Reply"
                  },
                  AccountUpdate: {
                    requestType: "AccountUpdate.Request",
                    responseType: "AccountUpdate.Reply"
                  },
                  ContactRequest: {
                    requestType: "ContactRequest.Request",
                    responseType: "ContactRequest.Reply"
                  },
                  ContactAccept: {
                    requestType: "ContactAccept.Request",
                    responseType: "ContactAccept.Reply"
                  },
                  Interact: {
                    requestType: "Interact.Request",
                    responseType: "Interact.Reply"
                  },
                  ConversationOpen: {
                    requestType: "ConversationOpen.Request",
                    responseType: "ConversationOpen.Reply"
                  },
                  ConversationClose: {
                    requestType: "ConversationClose.Request",
                    responseType: "ConversationClose.Reply"
                  },
                  ConversationLoad: {
                    requestType: "ConversationLoad.Request",
                    responseType: "ConversationLoad.Reply"
                  },
                  ServicesTokenList: {
                    requestType: "protocol.v1.ServicesTokenList.Request",
                    responseType: "protocol.v1.ServicesTokenList.Reply",
                    responseStream: true
                  },
                  ReplicationServiceRegisterGroup: {
                    requestType: "ReplicationServiceRegisterGroup.Request",
                    responseType: "ReplicationServiceRegisterGroup.Reply"
                  },
                  ReplicationSetAutoEnable: {
                    requestType: "ReplicationSetAutoEnable.Request",
                    responseType: "ReplicationSetAutoEnable.Reply"
                  },
                  BannerQuote: {
                    requestType: "BannerQuote.Request",
                    responseType: "BannerQuote.Reply"
                  },
                  GetUsername: {
                    requestType: "GetUsername.Request",
                    responseType: "GetUsername.Reply"
                  },
                  InstanceExportData: {
                    requestType: "InstanceExportData.Request",
                    responseType: "InstanceExportData.Reply",
                    responseStream: true
                  },
                  MediaPrepare: {
                    requestType: "MediaPrepare.Request",
                    requestStream: true,
                    responseType: "MediaPrepare.Reply"
                  },
                  MediaRetrieve: {
                    requestType: "MediaRetrieve.Request",
                    responseType: "MediaRetrieve.Reply",
                    responseStream: true
                  },
                  MediaGetRelated: {
                    requestType: "MediaGetRelated.Request",
                    responseType: "MediaGetRelated.Reply"
                  },
                  MessageSearch: {
                    requestType: "MessageSearch.Request",
                    responseType: "MessageSearch.Reply"
                  }
                }
              },
              PaginatedInteractionsOptions: {
                fields: {
                  amount: {
                    type: "int32",
                    id: 1
                  },
                  refCid: {
                    type: "string",
                    id: 2,
                    options: {
                      "(gogoproto.customname)": "RefCID"
                    }
                  },
                  conversationPk: {
                    type: "string",
                    id: 3,
                    options: {
                      "(gogoproto.customname)": "ConversationPK"
                    }
                  },
                  oldestToNewest: {
                    type: "bool",
                    id: 4
                  },
                  excludeMedias: {
                    type: "bool",
                    id: 5
                  },
                  noBulk: {
                    type: "bool",
                    id: 6
                  }
                }
              },
              ConversationOpen: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              ConversationClose: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              ConversationLoad: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      options: {
                        type: "PaginatedInteractionsOptions",
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              EchoTest: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      delay: {
                        type: "uint64",
                        id: 1
                      },
                      echo: {
                        type: "string",
                        id: 2
                      },
                      triggerError: {
                        type: "bool",
                        id: 3
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      echo: {
                        type: "string",
                        id: 1
                      }
                    }
                  }
                }
              },
              EchoDuplexTest: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      echo: {
                        type: "string",
                        id: 2
                      },
                      triggerError: {
                        type: "bool",
                        id: 3
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      echo: {
                        type: "string",
                        id: 1
                      }
                    }
                  }
                }
              },
              InstanceShareableBertyID: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      reset: {
                        type: "bool",
                        id: 1
                      },
                      displayName: {
                        type: "string",
                        id: 2
                      },
                      passphrase: {
                        type: "bytes",
                        id: 3
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      link: {
                        type: "BertyLink",
                        id: 1
                      },
                      internalUrl: {
                        type: "string",
                        id: 2,
                        options: {
                          "(gogoproto.customname)": "InternalURL"
                        }
                      },
                      webUrl: {
                        type: "string",
                        id: 3,
                        options: {
                          "(gogoproto.customname)": "WebURL"
                        }
                      }
                    }
                  }
                }
              },
              ShareableBertyGroup: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      },
                      groupName: {
                        type: "string",
                        id: 2
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      link: {
                        type: "BertyLink",
                        id: 1
                      },
                      internalUrl: {
                        type: "string",
                        id: 2,
                        options: {
                          "(gogoproto.customname)": "InternalURL"
                        }
                      },
                      webUrl: {
                        type: "string",
                        id: 3,
                        options: {
                          "(gogoproto.customname)": "WebURL"
                        }
                      }
                    }
                  }
                }
              },
              DevShareInstanceBertyID: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      reset: {
                        type: "bool",
                        id: 1
                      },
                      displayName: {
                        type: "string",
                        id: 2
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              DevStreamLogs: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      line: {
                        type: "string",
                        id: 1
                      }
                    }
                  }
                }
              },
              ParseDeepLink: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      link: {
                        type: "string",
                        id: 1
                      },
                      passphrase: {
                        type: "bytes",
                        id: 2
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      link: {
                        type: "BertyLink",
                        id: 1
                      }
                    }
                  }
                }
              },
              BertyLink: {
                fields: {
                  kind: {
                    type: "Kind",
                    id: 1
                  },
                  bertyId: {
                    type: "BertyID",
                    id: 2,
                    options: {
                      "(gogoproto.customname)": "BertyID"
                    }
                  },
                  bertyGroup: {
                    type: "BertyGroup",
                    id: 3
                  },
                  encrypted: {
                    type: "Encrypted",
                    id: 4
                  }
                },
                nested: {
                  Encrypted: {
                    fields: {
                      kind: {
                        type: "Kind",
                        id: 1
                      },
                      nonce: {
                        type: "bytes",
                        id: 2
                      },
                      displayName: {
                        type: "string",
                        id: 3
                      },
                      checksum: {
                        type: "bytes",
                        id: 4
                      },
                      contactPublicRendezvousSeed: {
                        type: "bytes",
                        id: 10
                      },
                      contactAccountPk: {
                        type: "bytes",
                        id: 11,
                        options: {
                          "(gogoproto.customname)": "ContactAccountPK"
                        }
                      },
                      groupPublicKey: {
                        type: "bytes",
                        id: 20
                      },
                      groupSecret: {
                        type: "bytes",
                        id: 21
                      },
                      groupSecretSig: {
                        type: "bytes",
                        id: 22
                      },
                      groupType: {
                        type: "berty.protocol.v1.GroupType",
                        id: 23
                      },
                      groupSignPub: {
                        type: "bytes",
                        id: 24
                      }
                    }
                  },
                  Kind: {
                    values: {
                      UnknownKind: 0,
                      ContactInviteV1Kind: 1,
                      GroupV1Kind: 2,
                      EncryptedV1Kind: 3
                    }
                  }
                }
              },
              SendContactRequest: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      bertyId: {
                        type: "BertyID",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "BertyID"
                        }
                      },
                      metadata: {
                        type: "bytes",
                        id: 2
                      },
                      ownMetadata: {
                        type: "bytes",
                        id: 3
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              SendAck: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      },
                      messageId: {
                        type: "bytes",
                        id: 2,
                        options: {
                          "(gogoproto.customname)": "MessageID"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              SendReplyOptions: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
                        type: "bytes",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "GroupPK"
                        }
                      },
                      options: {
                        type: "AppMessage.ReplyOptions",
                        id: 2
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              BertyID: {
                fields: {
                  publicRendezvousSeed: {
                    type: "bytes",
                    id: 1
                  },
                  accountPk: {
                    type: "bytes",
                    id: 2,
                    options: {
                      "(gogoproto.customname)": "AccountPK"
                    }
                  },
                  displayName: {
                    type: "string",
                    id: 3
                  }
                }
              },
              BertyGroup: {
                fields: {
                  group: {
                    type: "berty.protocol.v1.Group",
                    id: 1
                  },
                  displayName: {
                    type: "string",
                    id: 2
                  }
                }
              },
              AppMessage: {
                fields: {
                  type: {
                    type: "Type",
                    id: 1
                  },
                  payload: {
                    type: "bytes",
                    id: 2
                  },
                  sentDate: {
                    type: "int64",
                    id: 3,
                    options: {
                      "(gogoproto.jsontag)": "sentDate"
                    }
                  },
                  medias: {
                    rule: "repeated",
                    type: "Media",
                    id: 4
                  },
                  targetCid: {
                    type: "string",
                    id: 5,
                    options: {
                      "(gogoproto.customname)": "TargetCID"
                    }
                  }
                },
                nested: {
                  Type: {
                    values: {
                      Undefined: 0,
                      TypeUserMessage: 1,
                      TypeUserReaction: 2,
                      TypeGroupInvitation: 3,
                      TypeSetGroupInfo: 4,
                      TypeSetUserInfo: 5,
                      TypeAcknowledge: 6,
                      TypeReplyOptions: 7,
                      TypeMonitorMetadata: 100
                    }
                  },
                  UserMessage: {
                    fields: {
                      body: {
                        type: "string",
                        id: 1
                      }
                    }
                  },
                  UserReaction: {
                    fields: {
                      state: {
                        type: "bool",
                        id: 1
                      },
                      emoji: {
                        type: "string",
                        id: 2
                      }
                    }
                  },
                  GroupInvitation: {
                    fields: {
                      link: {
                        type: "string",
                        id: 2
                      }
                    }
                  },
                  SetGroupInfo: {
                    fields: {
                      displayName: {
                        type: "string",
                        id: 1
                      },
                      avatarCid: {
                        type: "string",
                        id: 2
                      }
                    }
                  },
                  SetUserInfo: {
                    fields: {
                      displayName: {
                        type: "string",
                        id: 1
                      },
                      avatarCid: {
                        type: "string",
                        id: 2,
                        options: {
                          "(gogoproto.customname)": "AvatarCID"
                        }
                      }
                    }
                  },
                  Acknowledge: {
                    fields: {}
                  },
                  ReplyOptions: {
                    fields: {
                      options: {
                        rule: "repeated",
                        type: "ReplyOption",
                        id: 1
                      }
                    }
                  },
                  MonitorMetadata: {
                    fields: {
                      event: {
                        type: "berty.protocol.v1.MonitorGroup.EventMonitor",
                        id: 1
                      }
                    }
                  }
                }
              },
              ReplyOption: {
                fields: {
                  display: {
                    type: "string",
                    id: 1
                  },
                  payload: {
                    type: "string",
                    id: 2
                  }
                }
              },
              SystemInfo: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      protocol: {
                        type: "berty.protocol.v1.SystemInfo.Reply",
                        id: 1
                      },
                      messenger: {
                        type: "Messenger",
                        id: 2
                      }
                    }
                  },
                  Messenger: {
                    fields: {
                      process: {
                        type: "berty.protocol.v1.SystemInfo.Process",
                        id: 1
                      },
                      warns: {
                        rule: "repeated",
                        type: "string",
                        id: 2
                      },
                      protocolInSameProcess: {
                        type: "bool",
                        id: 3
                      },
                      db: {
                        type: "DB",
                        id: 4,
                        options: {
                          "(gogoproto.customname)": "DB"
                        }
                      }
                    }
                  },
                  DB: {
                    fields: {
                      accounts: {
                        type: "int64",
                        id: 1
                      },
                      contacts: {
                        type: "int64",
                        id: 2
                      },
                      conversations: {
                        type: "int64",
                        id: 3
                      },
                      interactions: {
                        type: "int64",
                        id: 4
                      },
                      members: {
                        type: "int64",
                        id: 5
                      },
                      devices: {
                        type: "int64",
                        id: 6
                      },
                      serviceTokens: {
                        type: "int64",
                        id: 7
                      },
                      conversationReplicationInfo: {
                        type: "int64",
                        id: 8
                      },
                      reactions: {
                        type: "int64",
                        id: 9
                      }
                    }
                  }
                }
              },
              ConversationJoin: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      link: {
                        type: "string",
                        id: 1
                      },
                      passphrase: {
                        type: "bytes",
                        id: 2
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              Account: {
                fields: {
                  publicKey: {
                    type: "string",
                    id: 1,
                    options: {
                      "(gogoproto.moretags)": "gorm:primaryKey"
                    }
                  },
                  displayName: {
                    type: "string",
                    id: 2
                  },
                  avatarCid: {
                    type: "string",
                    id: 7,
                    options: {
                      "(gogoproto.moretags)": "gorm:column:avatar_cid",
                      "(gogoproto.customname)": "AvatarCID"
                    }
                  },
                  link: {
                    type: "string",
                    id: 3
                  },
                  serviceTokens: {
                    rule: "repeated",
                    type: "ServiceToken",
                    id: 5,
                    options: {
                      "(gogoproto.moretags)": "gorm:foreignKey:AccountPK"
                    }
                  },
                  replicateNewGroupsAutomatically: {
                    type: "bool",
                    id: 6,
                    options: {
                      "(gogoproto.moretags)": "gorm:default:true"
                    }
                  }
                }
              },
              ServiceToken: {
                fields: {
                  accountPk: {
                    type: "string",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "AccountPK"
                    }
                  },
                  tokenId: {
                    type: "string",
                    id: 2,
                    options: {
                      "(gogoproto.moretags)": "gorm:primaryKey",
                      "(gogoproto.customname)": "TokenID"
                    }
                  },
                  serviceType: {
                    type: "string",
                    id: 3,
                    options: {
                      "(gogoproto.moretags)": "gorm:primaryKey",
                      "(gogoproto.customname)": "ServiceType"
                    }
                  },
                  authenticationUrl: {
                    type: "string",
                    id: 4,
                    options: {
                      "(gogoproto.customname)": "AuthenticationURL"
                    }
                  },
                  expiration: {
                    type: "int64",
                    id: 5
                  }
                }
              },
              Interaction: {
                fields: {
                  cid: {
                    type: "string",
                    id: 1,
                    options: {
                      "(gogoproto.moretags)": "gorm:primaryKey;column:cid",
                      "(gogoproto.customname)": "CID"
                    }
                  },
                  type: {
                    type: "AppMessage.Type",
                    id: 2,
                    options: {
                      "(gogoproto.moretags)": "gorm:index"
                    }
                  },
                  memberPublicKey: {
                    type: "string",
                    id: 7
                  },
                  devicePublicKey: {
                    type: "string",
                    id: 12
                  },
                  member: {
                    type: "Member",
                    id: 8,
                    options: {
                      "(gogoproto.moretags)": "gorm:foreignKey:PublicKey;references:MemberPublicKey"
                    }
                  },
                  conversationPublicKey: {
                    type: "string",
                    id: 3,
                    options: {
                      "(gogoproto.moretags)": "gorm:index"
                    }
                  },
                  conversation: {
                    type: "Conversation",
                    id: 4
                  },
                  payload: {
                    type: "bytes",
                    id: 5
                  },
                  isMine: {
                    type: "bool",
                    id: 6
                  },
                  sentDate: {
                    type: "int64",
                    id: 9,
                    options: {
                      "(gogoproto.moretags)": "gorm:index"
                    }
                  },
                  acknowledged: {
                    type: "bool",
                    id: 10
                  },
                  targetCid: {
                    type: "string",
                    id: 13,
                    options: {
                      "(gogoproto.moretags)": "gorm:index;column:target_cid",
                      "(gogoproto.customname)": "TargetCID"
                    }
                  },
                  medias: {
                    rule: "repeated",
                    type: "Media",
                    id: 15
                  },
                  reactions: {
                    rule: "repeated",
                    type: "ReactionView",
                    id: 16,
                    options: {
                      "(gogoproto.moretags)": "gorm:-"
                    }
                  }
                },
                nested: {
                  ReactionView: {
                    fields: {
                      emoji: {
                        type: "string",
                        id: 1
                      },
                      ownState: {
                        type: "bool",
                        id: 2
                      },
                      count: {
                        type: "uint64",
                        id: 3
                      }
                    }
                  }
                }
              },
              Media: {
                fields: {
                  cid: {
                    type: "string",
                    id: 1,
                    options: {
                      "(gogoproto.moretags)": "gorm:primaryKey;column:cid",
                      "(gogoproto.customname)": "CID"
                    }
                  },
                  mimeType: {
                    type: "string",
                    id: 2
                  },
                  filename: {
                    type: "string",
                    id: 3
                  },
                  displayName: {
                    type: "string",
                    id: 4
                  },
                  metadataBytes: {
                    type: "bytes",
                    id: 6
                  },
                  interactionCid: {
                    type: "string",
                    id: 100,
                    options: {
                      "(gogoproto.moretags)": "gorm:index;column:interaction_cid",
                      "(gogoproto.customname)": "InteractionCID"
                    }
                  },
                  state: {
                    type: "State",
                    id: 103
                  }
                },
                nested: {
                  State: {
                    values: {
                      StateUnknown: 0,
                      StateNeverDownloaded: 1,
                      StatePartiallyDownloaded: 2,
                      StateDownloaded: 3,
                      StateInCache: 4,
                      StateInvalidCrypto: 5,
                      StatePrepared: 100,
                      StateAttached: 101
                    }
                  }
                }
              },
              Contact: {
                fields: {
                  publicKey: {
                    type: "string",
                    id: 1,
                    options: {
                      "(gogoproto.moretags)": "gorm:primaryKey"
                    }
                  },
                  conversationPublicKey: {
                    type: "string",
                    id: 2
                  },
                  conversation: {
                    type: "Conversation",
                    id: 3
                  },
                  state: {
                    type: "State",
                    id: 4
                  },
                  displayName: {
                    type: "string",
                    id: 5
                  },
                  avatarCid: {
                    type: "string",
                    id: 9,
                    options: {
                      "(gogoproto.moretags)": "gorm:column:avatar_cid",
                      "(gogoproto.customname)": "AvatarCID"
                    }
                  },
                  createdDate: {
                    type: "int64",
                    id: 7
                  },
                  sentDate: {
                    type: "int64",
                    id: 8
                  },
                  devices: {
                    rule: "repeated",
                    type: "Device",
                    id: 6,
                    options: {
                      "(gogoproto.moretags)": "gorm:foreignKey:MemberPublicKey"
                    }
                  },
                  infoDate: {
                    type: "int64",
                    id: 10
                  }
                },
                nested: {
                  State: {
                    values: {
                      Undefined: 0,
                      IncomingRequest: 1,
                      OutgoingRequestEnqueued: 2,
                      OutgoingRequestSent: 3,
                      Accepted: 4
                    }
                  }
                }
              },
              Conversation: {
                fields: {
                  publicKey: {
                    type: "string",
                    id: 1,
                    options: {
                      "(gogoproto.moretags)": "gorm:primaryKey"
                    }
                  },
                  type: {
                    type: "Type",
                    id: 2
                  },
                  isOpen: {
                    type: "bool",
                    id: 3
                  },
                  displayName: {
                    type: "string",
                    id: 4
                  },
                  avatarCid: {
                    type: "string",
                    id: 17,
                    options: {
                      "(gogoproto.moretags)": "gorm:column:avatar_cid",
                      "(gogoproto.customname)": "AvatarCID"
                    }
                  },
                  link: {
                    type: "string",
                    id: 5
                  },
                  unreadCount: {
                    type: "int32",
                    id: 6
                  },
                  lastUpdate: {
                    type: "int64",
                    id: 7
                  },
                  contactPublicKey: {
                    type: "string",
                    id: 8
                  },
                  contact: {
                    type: "Contact",
                    id: 9
                  },
                  members: {
                    rule: "repeated",
                    type: "Member",
                    id: 10
                  },
                  accountMemberPublicKey: {
                    type: "string",
                    id: 11
                  },
                  localDevicePublicKey: {
                    type: "string",
                    id: 12
                  },
                  createdDate: {
                    type: "int64",
                    id: 13
                  },
                  replyOptionsCid: {
                    type: "string",
                    id: 14,
                    options: {
                      "(gogoproto.moretags)": "gorm:column:reply_options_cid",
                      "(gogoproto.customname)": "ReplyOptionsCID"
                    }
                  },
                  replyOptions: {
                    type: "Interaction",
                    id: 15,
                    options: {
                      "(gogoproto.customname)": "ReplyOptions"
                    }
                  },
                  replicationInfo: {
                    rule: "repeated",
                    type: "ConversationReplicationInfo",
                    id: 16,
                    options: {
                      "(gogoproto.moretags)": "gorm:foreignKey:ConversationPublicKey"
                    }
                  },
                  infoDate: {
                    type: "int64",
                    id: 18
                  }
                },
                nested: {
                  Type: {
                    values: {
                      Undefined: 0,
                      AccountType: 1,
                      ContactType: 2,
                      MultiMemberType: 3
                    }
                  }
                }
              },
              ConversationReplicationInfo: {
                fields: {
                  cid: {
                    type: "string",
                    id: 1,
                    options: {
                      "(gogoproto.moretags)": "gorm:primaryKey;column:cid",
                      "(gogoproto.customname)": "CID"
                    }
                  },
                  conversationPublicKey: {
                    type: "string",
                    id: 2
                  },
                  memberPublicKey: {
                    type: "string",
                    id: 3
                  },
                  authenticationUrl: {
                    type: "string",
                    id: 4,
                    options: {
                      "(gogoproto.customname)": "AuthenticationURL"
                    }
                  },
                  replicationServer: {
                    type: "string",
                    id: 5
                  }
                }
              },
              Member: {
                fields: {
                  publicKey: {
                    type: "string",
                    id: 1,
                    options: {
                      "(gogoproto.moretags)": "gorm:primaryKey"
                    }
                  },
                  displayName: {
                    type: "string",
                    id: 2
                  },
                  avatarCid: {
                    type: "string",
                    id: 6,
                    options: {
                      "(gogoproto.moretags)": "gorm:column:avatar_cid",
                      "(gogoproto.customname)": "AvatarCID"
                    }
                  },
                  conversationPublicKey: {
                    type: "string",
                    id: 3,
                    options: {
                      "(gogoproto.moretags)": "gorm:primaryKey"
                    }
                  },
                  isMe: {
                    type: "bool",
                    id: 9
                  },
                  isCreator: {
                    type: "bool",
                    id: 8
                  },
                  infoDate: {
                    type: "int64",
                    id: 7
                  },
                  conversation: {
                    type: "Conversation",
                    id: 4
                  },
                  devices: {
                    rule: "repeated",
                    type: "Device",
                    id: 5,
                    options: {
                      "(gogoproto.moretags)": "gorm:foreignKey:MemberPublicKey;references:PublicKey"
                    }
                  }
                }
              },
              Device: {
                fields: {
                  publicKey: {
                    type: "string",
                    id: 1,
                    options: {
                      "(gogoproto.moretags)": "gorm:primaryKey"
                    }
                  },
                  memberPublicKey: {
                    type: "string",
                    id: 2,
                    options: {
                      "(gogoproto.moretags)": "gorm:index"
                    }
                  }
                }
              },
              ContactMetadata: {
                fields: {
                  displayName: {
                    type: "string",
                    id: 1
                  }
                }
              },
              StreamEvent: {
                fields: {
                  type: {
                    type: "Type",
                    id: 1
                  },
                  payload: {
                    type: "bytes",
                    id: 2
                  },
                  isNew: {
                    type: "bool",
                    id: 3
                  }
                },
                nested: {
                  Type: {
                    values: {
                      Undefined: 0,
                      TypeListEnded: 1,
                      TypeConversationUpdated: 2,
                      TypeConversationDeleted: 3,
                      TypeInteractionUpdated: 4,
                      TypeInteractionDeleted: 5,
                      TypeContactUpdated: 6,
                      TypeAccountUpdated: 7,
                      TypeMemberUpdated: 8,
                      TypeDeviceUpdated: 9,
                      TypeNotified: 10,
                      TypeMediaUpdated: 11,
                      TypeConversationPartialLoad: 12
                    }
                  },
                  ConversationUpdated: {
                    fields: {
                      conversation: {
                        type: "Conversation",
                        id: 1
                      }
                    }
                  },
                  ConversationDeleted: {
                    fields: {
                      publicKey: {
                        type: "string",
                        id: 1
                      }
                    }
                  },
                  InteractionUpdated: {
                    fields: {
                      interaction: {
                        type: "Interaction",
                        id: 1
                      }
                    }
                  },
                  InteractionDeleted: {
                    fields: {
                      cid: {
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "CID"
                        }
                      }
                    }
                  },
                  ContactUpdated: {
                    fields: {
                      contact: {
                        type: "Contact",
                        id: 1
                      }
                    }
                  },
                  AccountUpdated: {
                    fields: {
                      account: {
                        type: "Account",
                        id: 1
                      }
                    }
                  },
                  MemberUpdated: {
                    fields: {
                      member: {
                        type: "Member",
                        id: 1
                      }
                    }
                  },
                  DeviceUpdated: {
                    fields: {
                      device: {
                        type: "Device",
                        id: 1
                      }
                    }
                  },
                  ListEnded: {
                    fields: {}
                  },
                  MediaUpdated: {
                    fields: {
                      media: {
                        type: "Media",
                        id: 1
                      }
                    }
                  },
                  ConversationPartialLoad: {
                    fields: {
                      conversationPk: {
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "ConversationPK"
                        }
                      },
                      interactions: {
                        rule: "repeated",
                        type: "Interaction",
                        id: 2
                      },
                      medias: {
                        rule: "repeated",
                        type: "Media",
                        id: 3
                      }
                    }
                  },
                  Notified: {
                    fields: {
                      type: {
                        type: "Type",
                        id: 1
                      },
                      title: {
                        type: "string",
                        id: 3
                      },
                      body: {
                        type: "string",
                        id: 4
                      },
                      payload: {
                        type: "bytes",
                        id: 5
                      }
                    },
                    nested: {
                      Type: {
                        values: {
                          Unknown: 0,
                          TypeBasic: 1,
                          TypeMessageReceived: 2,
                          TypeContactRequestSent: 3,
                          TypeContactRequestReceived: 4
                        }
                      },
                      Basic: {
                        fields: {}
                      },
                      MessageReceived: {
                        fields: {
                          interaction: {
                            type: "Interaction",
                            id: 1
                          },
                          conversation: {
                            type: "Conversation",
                            id: 2
                          },
                          contact: {
                            type: "Contact",
                            id: 3
                          }
                        }
                      },
                      ContactRequestSent: {
                        fields: {
                          contact: {
                            type: "Contact",
                            id: 3
                          }
                        }
                      },
                      ContactRequestReceived: {
                        fields: {
                          contact: {
                            type: "Contact",
                            id: 3
                          }
                        }
                      }
                    }
                  }
                }
              },
              ConversationStream: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      count: {
                        type: "uint64",
                        id: 1
                      },
                      page: {
                        type: "uint64",
                        id: 2
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      conversation: {
                        type: "Conversation",
                        id: 1
                      }
                    }
                  }
                }
              },
              ConversationCreate: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      displayName: {
                        type: "string",
                        id: 1
                      },
                      contactsToInvite: {
                        rule: "repeated",
                        type: "string",
                        id: 2
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      publicKey: {
                        type: "string",
                        id: 1
                      }
                    }
                  }
                }
              },
              AccountGet: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      account: {
                        type: "Account",
                        id: 1
                      }
                    }
                  }
                }
              },
              EventStream: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      shallowAmount: {
                        type: "int32",
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      event: {
                        type: "StreamEvent",
                        id: 1
                      }
                    }
                  }
                }
              },
              AccountUpdate: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      displayName: {
                        type: "string",
                        id: 1
                      },
                      avatarCid: {
                        type: "string",
                        id: 2,
                        options: {
                          "(gogoproto.moretags)": "gorm:column:avatar_cid",
                          "(gogoproto.customname)": "AvatarCID"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              ContactRequest: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      link: {
                        type: "string",
                        id: 1
                      },
                      passphrase: {
                        type: "bytes",
                        id: 2
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              ContactAccept: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      publicKey: {
                        type: "string",
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              Interact: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      type: {
                        type: "AppMessage.Type",
                        id: 1
                      },
                      payload: {
                        type: "bytes",
                        id: 2
                      },
                      conversationPublicKey: {
                        type: "string",
                        id: 3
                      },
                      mediaCids: {
                        rule: "repeated",
                        type: "string",
                        id: 4
                      },
                      targetCid: {
                        type: "string",
                        id: 5,
                        options: {
                          "(gogoproto.customname)": "TargetCID"
                        }
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      cid: {
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "CID"
                        }
                      }
                    }
                  }
                }
              },
              ReplicationServiceRegisterGroup: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      tokenId: {
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "TokenID"
                        }
                      },
                      conversationPublicKey: {
                        type: "string",
                        id: 2
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              ReplicationSetAutoEnable: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      enabled: {
                        type: "bool",
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              BannerQuote: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      random: {
                        type: "bool",
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      quote: {
                        type: "string",
                        id: 1
                      },
                      author: {
                        type: "string",
                        id: 2
                      }
                    }
                  }
                }
              },
              GetUsername: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      username: {
                        type: "string",
                        id: 1
                      }
                    }
                  }
                }
              },
              InstanceExportData: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      exportedData: {
                        type: "bytes",
                        id: 1
                      }
                    }
                  }
                }
              },
              LocalDatabaseState: {
                fields: {
                  publicKey: {
                    type: "string",
                    id: 1
                  },
                  displayName: {
                    type: "string",
                    id: 2
                  },
                  replicateFlag: {
                    type: "bool",
                    id: 3
                  },
                  localConversationsState: {
                    rule: "repeated",
                    type: "LocalConversationState",
                    id: 4
                  },
                  accountLink: {
                    type: "string",
                    id: 5
                  }
                }
              },
              LocalConversationState: {
                fields: {
                  publicKey: {
                    type: "string",
                    id: 1
                  },
                  unreadCount: {
                    type: "int32",
                    id: 2
                  },
                  isOpen: {
                    type: "bool",
                    id: 3
                  },
                  type: {
                    type: "Conversation.Type",
                    id: 4
                  }
                }
              },
              MediaPrepare: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      block: {
                        type: "bytes",
                        id: 1
                      },
                      info: {
                        type: "Media",
                        id: 2
                      },
                      uri: {
                        type: "string",
                        id: 3
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      cid: {
                        type: "string",
                        id: 1
                      }
                    }
                  }
                }
              },
              MediaRetrieve: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      cid: {
                        type: "string",
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      block: {
                        type: "bytes",
                        id: 1
                      },
                      info: {
                        type: "Media",
                        id: 2
                      }
                    }
                  }
                }
              },
              MediaGetRelated: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      cid: {
                        type: "string",
                        id: 1,
                        options: {
                          "(gogoproto.customname)": "CID"
                        }
                      },
                      mimeTypes: {
                        rule: "repeated",
                        type: "string",
                        id: 3
                      },
                      fileNames: {
                        rule: "repeated",
                        type: "string",
                        id: 4
                      }
                    },
                    reserved: [
                      [
                        2,
                        2
                      ]
                    ]
                  },
                  Reply: {
                    fields: {
                      media: {
                        type: "Media",
                        id: 1
                      },
                      end: {
                        type: "bool",
                        id: 2
                      }
                    }
                  }
                }
              },
              MediaMetadataType: {
                values: {
                  MetadataUnknown: 0,
                  MetadataKeyValue: 1,
                  MetadataAudioPreview: 2
                }
              },
              MediaMetadata: {
                fields: {
                  items: {
                    rule: "repeated",
                    type: "MediaMetadataItem",
                    id: 1
                  }
                }
              },
              MediaMetadataItem: {
                fields: {
                  metadataType: {
                    type: "MediaMetadataType",
                    id: 1
                  },
                  payload: {
                    type: "bytes",
                    id: 2
                  }
                }
              },
              MediaMetadataKV: {
                fields: {
                  key: {
                    type: "string",
                    id: 1
                  },
                  value: {
                    type: "string",
                    id: 2
                  }
                }
              },
              AudioPreview: {
                fields: {
                  volumeIntensities: {
                    rule: "repeated",
                    type: "uint32",
                    id: 1
                  },
                  durationMs: {
                    type: "uint32",
                    id: 2
                  },
                  format: {
                    type: "string",
                    id: 3
                  },
                  bitrate: {
                    type: "uint32",
                    id: 4
                  },
                  samplingRate: {
                    type: "uint32",
                    id: 5
                  }
                }
              },
              Reaction: {
                fields: {
                  targetCid: {
                    type: "string",
                    id: 2,
                    options: {
                      "(gogoproto.moretags)": "gorm:column:target_cid;primaryKey",
                      "(gogoproto.customname)": "TargetCID"
                    }
                  },
                  memberPublicKey: {
                    type: "string",
                    id: 3,
                    options: {
                      "(gogoproto.moretags)": "gorm:primaryKey"
                    }
                  },
                  emoji: {
                    type: "string",
                    id: 4,
                    options: {
                      "(gogoproto.moretags)": "gorm:primaryKey"
                    }
                  },
                  isMine: {
                    type: "bool",
                    id: 5
                  },
                  state: {
                    type: "bool",
                    id: 6
                  },
                  stateDate: {
                    type: "int64",
                    id: 7
                  }
                }
              },
              MessageSearch: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      query: {
                        type: "string",
                        id: 1
                      },
                      beforeDate: {
                        type: "int64",
                        id: 2
                      },
                      afterDate: {
                        type: "int64",
                        id: 3
                      },
                      limit: {
                        type: "int32",
                        id: 4
                      },
                      refCid: {
                        type: "string",
                        id: 5,
                        options: {
                          "(gogoproto.customname)": "RefCID"
                        }
                      },
                      oldestToNewest: {
                        type: "bool",
                        id: 6
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      results: {
                        rule: "repeated",
                        type: "Interaction",
                        id: 1
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  gogoproto: {
    options: {
      java_package: "com.google.protobuf",
      java_outer_classname: "GoGoProtos",
      go_package: "github.com/gogo/protobuf/gogoproto"
    },
    nested: {
      goprotoEnumPrefix: {
        type: "bool",
        id: 62001,
        extend: "google.protobuf.EnumOptions"
      },
      goprotoEnumStringer: {
        type: "bool",
        id: 62021,
        extend: "google.protobuf.EnumOptions"
      },
      enumStringer: {
        type: "bool",
        id: 62022,
        extend: "google.protobuf.EnumOptions"
      },
      enumCustomname: {
        type: "string",
        id: 62023,
        extend: "google.protobuf.EnumOptions"
      },
      enumdecl: {
        type: "bool",
        id: 62024,
        extend: "google.protobuf.EnumOptions"
      },
      enumvalueCustomname: {
        type: "string",
        id: 66001,
        extend: "google.protobuf.EnumValueOptions"
      },
      goprotoGettersAll: {
        type: "bool",
        id: 63001,
        extend: "google.protobuf.FileOptions"
      },
      goprotoEnumPrefixAll: {
        type: "bool",
        id: 63002,
        extend: "google.protobuf.FileOptions"
      },
      goprotoStringerAll: {
        type: "bool",
        id: 63003,
        extend: "google.protobuf.FileOptions"
      },
      verboseEqualAll: {
        type: "bool",
        id: 63004,
        extend: "google.protobuf.FileOptions"
      },
      faceAll: {
        type: "bool",
        id: 63005,
        extend: "google.protobuf.FileOptions"
      },
      gostringAll: {
        type: "bool",
        id: 63006,
        extend: "google.protobuf.FileOptions"
      },
      populateAll: {
        type: "bool",
        id: 63007,
        extend: "google.protobuf.FileOptions"
      },
      stringerAll: {
        type: "bool",
        id: 63008,
        extend: "google.protobuf.FileOptions"
      },
      onlyoneAll: {
        type: "bool",
        id: 63009,
        extend: "google.protobuf.FileOptions"
      },
      equalAll: {
        type: "bool",
        id: 63013,
        extend: "google.protobuf.FileOptions"
      },
      descriptionAll: {
        type: "bool",
        id: 63014,
        extend: "google.protobuf.FileOptions"
      },
      testgenAll: {
        type: "bool",
        id: 63015,
        extend: "google.protobuf.FileOptions"
      },
      benchgenAll: {
        type: "bool",
        id: 63016,
        extend: "google.protobuf.FileOptions"
      },
      marshalerAll: {
        type: "bool",
        id: 63017,
        extend: "google.protobuf.FileOptions"
      },
      unmarshalerAll: {
        type: "bool",
        id: 63018,
        extend: "google.protobuf.FileOptions"
      },
      stableMarshalerAll: {
        type: "bool",
        id: 63019,
        extend: "google.protobuf.FileOptions"
      },
      sizerAll: {
        type: "bool",
        id: 63020,
        extend: "google.protobuf.FileOptions"
      },
      goprotoEnumStringerAll: {
        type: "bool",
        id: 63021,
        extend: "google.protobuf.FileOptions"
      },
      enumStringerAll: {
        type: "bool",
        id: 63022,
        extend: "google.protobuf.FileOptions"
      },
      unsafeMarshalerAll: {
        type: "bool",
        id: 63023,
        extend: "google.protobuf.FileOptions"
      },
      unsafeUnmarshalerAll: {
        type: "bool",
        id: 63024,
        extend: "google.protobuf.FileOptions"
      },
      goprotoExtensionsMapAll: {
        type: "bool",
        id: 63025,
        extend: "google.protobuf.FileOptions"
      },
      goprotoUnrecognizedAll: {
        type: "bool",
        id: 63026,
        extend: "google.protobuf.FileOptions"
      },
      gogoprotoImport: {
        type: "bool",
        id: 63027,
        extend: "google.protobuf.FileOptions"
      },
      protosizerAll: {
        type: "bool",
        id: 63028,
        extend: "google.protobuf.FileOptions"
      },
      compareAll: {
        type: "bool",
        id: 63029,
        extend: "google.protobuf.FileOptions"
      },
      typedeclAll: {
        type: "bool",
        id: 63030,
        extend: "google.protobuf.FileOptions"
      },
      enumdeclAll: {
        type: "bool",
        id: 63031,
        extend: "google.protobuf.FileOptions"
      },
      goprotoRegistration: {
        type: "bool",
        id: 63032,
        extend: "google.protobuf.FileOptions"
      },
      messagenameAll: {
        type: "bool",
        id: 63033,
        extend: "google.protobuf.FileOptions"
      },
      goprotoSizecacheAll: {
        type: "bool",
        id: 63034,
        extend: "google.protobuf.FileOptions"
      },
      goprotoUnkeyedAll: {
        type: "bool",
        id: 63035,
        extend: "google.protobuf.FileOptions"
      },
      goprotoGetters: {
        type: "bool",
        id: 64001,
        extend: "google.protobuf.MessageOptions"
      },
      goprotoStringer: {
        type: "bool",
        id: 64003,
        extend: "google.protobuf.MessageOptions"
      },
      verboseEqual: {
        type: "bool",
        id: 64004,
        extend: "google.protobuf.MessageOptions"
      },
      face: {
        type: "bool",
        id: 64005,
        extend: "google.protobuf.MessageOptions"
      },
      gostring: {
        type: "bool",
        id: 64006,
        extend: "google.protobuf.MessageOptions"
      },
      populate: {
        type: "bool",
        id: 64007,
        extend: "google.protobuf.MessageOptions"
      },
      stringer: {
        type: "bool",
        id: 67008,
        extend: "google.protobuf.MessageOptions"
      },
      onlyone: {
        type: "bool",
        id: 64009,
        extend: "google.protobuf.MessageOptions"
      },
      equal: {
        type: "bool",
        id: 64013,
        extend: "google.protobuf.MessageOptions"
      },
      description: {
        type: "bool",
        id: 64014,
        extend: "google.protobuf.MessageOptions"
      },
      testgen: {
        type: "bool",
        id: 64015,
        extend: "google.protobuf.MessageOptions"
      },
      benchgen: {
        type: "bool",
        id: 64016,
        extend: "google.protobuf.MessageOptions"
      },
      marshaler: {
        type: "bool",
        id: 64017,
        extend: "google.protobuf.MessageOptions"
      },
      unmarshaler: {
        type: "bool",
        id: 64018,
        extend: "google.protobuf.MessageOptions"
      },
      stableMarshaler: {
        type: "bool",
        id: 64019,
        extend: "google.protobuf.MessageOptions"
      },
      sizer: {
        type: "bool",
        id: 64020,
        extend: "google.protobuf.MessageOptions"
      },
      unsafeMarshaler: {
        type: "bool",
        id: 64023,
        extend: "google.protobuf.MessageOptions"
      },
      unsafeUnmarshaler: {
        type: "bool",
        id: 64024,
        extend: "google.protobuf.MessageOptions"
      },
      goprotoExtensionsMap: {
        type: "bool",
        id: 64025,
        extend: "google.protobuf.MessageOptions"
      },
      goprotoUnrecognized: {
        type: "bool",
        id: 64026,
        extend: "google.protobuf.MessageOptions"
      },
      protosizer: {
        type: "bool",
        id: 64028,
        extend: "google.protobuf.MessageOptions"
      },
      compare: {
        type: "bool",
        id: 64029,
        extend: "google.protobuf.MessageOptions"
      },
      typedecl: {
        type: "bool",
        id: 64030,
        extend: "google.protobuf.MessageOptions"
      },
      messagename: {
        type: "bool",
        id: 64033,
        extend: "google.protobuf.MessageOptions"
      },
      goprotoSizecache: {
        type: "bool",
        id: 64034,
        extend: "google.protobuf.MessageOptions"
      },
      goprotoUnkeyed: {
        type: "bool",
        id: 64035,
        extend: "google.protobuf.MessageOptions"
      },
      nullable: {
        type: "bool",
        id: 65001,
        extend: "google.protobuf.FieldOptions"
      },
      embed: {
        type: "bool",
        id: 65002,
        extend: "google.protobuf.FieldOptions"
      },
      customtype: {
        type: "string",
        id: 65003,
        extend: "google.protobuf.FieldOptions"
      },
      customname: {
        type: "string",
        id: 65004,
        extend: "google.protobuf.FieldOptions"
      },
      jsontag: {
        type: "string",
        id: 65005,
        extend: "google.protobuf.FieldOptions"
      },
      moretags: {
        type: "string",
        id: 65006,
        extend: "google.protobuf.FieldOptions"
      },
      casttype: {
        type: "string",
        id: 65007,
        extend: "google.protobuf.FieldOptions"
      },
      castkey: {
        type: "string",
        id: 65008,
        extend: "google.protobuf.FieldOptions"
      },
      castvalue: {
        type: "string",
        id: 65009,
        extend: "google.protobuf.FieldOptions"
      },
      stdtime: {
        type: "bool",
        id: 65010,
        extend: "google.protobuf.FieldOptions"
      },
      stdduration: {
        type: "bool",
        id: 65011,
        extend: "google.protobuf.FieldOptions"
      },
      wktpointer: {
        type: "bool",
        id: 65012,
        extend: "google.protobuf.FieldOptions"
      }
    }
  },
  google: {
    nested: {
      protobuf: {
        nested: {
          FileDescriptorSet: {
            fields: {
              file: {
                rule: "repeated",
                type: "FileDescriptorProto",
                id: 1
              }
            }
          },
          FileDescriptorProto: {
            fields: {
              name: {
                type: "string",
                id: 1
              },
              "package": {
                type: "string",
                id: 2
              },
              dependency: {
                rule: "repeated",
                type: "string",
                id: 3
              },
              publicDependency: {
                rule: "repeated",
                type: "int32",
                id: 10,
                options: {
                  packed: false
                }
              },
              weakDependency: {
                rule: "repeated",
                type: "int32",
                id: 11,
                options: {
                  packed: false
                }
              },
              messageType: {
                rule: "repeated",
                type: "DescriptorProto",
                id: 4
              },
              enumType: {
                rule: "repeated",
                type: "EnumDescriptorProto",
                id: 5
              },
              service: {
                rule: "repeated",
                type: "ServiceDescriptorProto",
                id: 6
              },
              extension: {
                rule: "repeated",
                type: "FieldDescriptorProto",
                id: 7
              },
              options: {
                type: "FileOptions",
                id: 8
              },
              sourceCodeInfo: {
                type: "SourceCodeInfo",
                id: 9
              },
              syntax: {
                type: "string",
                id: 12
              }
            }
          },
          DescriptorProto: {
            fields: {
              name: {
                type: "string",
                id: 1
              },
              field: {
                rule: "repeated",
                type: "FieldDescriptorProto",
                id: 2
              },
              extension: {
                rule: "repeated",
                type: "FieldDescriptorProto",
                id: 6
              },
              nestedType: {
                rule: "repeated",
                type: "DescriptorProto",
                id: 3
              },
              enumType: {
                rule: "repeated",
                type: "EnumDescriptorProto",
                id: 4
              },
              extensionRange: {
                rule: "repeated",
                type: "ExtensionRange",
                id: 5
              },
              oneofDecl: {
                rule: "repeated",
                type: "OneofDescriptorProto",
                id: 8
              },
              options: {
                type: "MessageOptions",
                id: 7
              },
              reservedRange: {
                rule: "repeated",
                type: "ReservedRange",
                id: 9
              },
              reservedName: {
                rule: "repeated",
                type: "string",
                id: 10
              }
            },
            nested: {
              ExtensionRange: {
                fields: {
                  start: {
                    type: "int32",
                    id: 1
                  },
                  end: {
                    type: "int32",
                    id: 2
                  }
                }
              },
              ReservedRange: {
                fields: {
                  start: {
                    type: "int32",
                    id: 1
                  },
                  end: {
                    type: "int32",
                    id: 2
                  }
                }
              }
            }
          },
          FieldDescriptorProto: {
            fields: {
              name: {
                type: "string",
                id: 1
              },
              number: {
                type: "int32",
                id: 3
              },
              label: {
                type: "Label",
                id: 4
              },
              type: {
                type: "Type",
                id: 5
              },
              typeName: {
                type: "string",
                id: 6
              },
              extendee: {
                type: "string",
                id: 2
              },
              defaultValue: {
                type: "string",
                id: 7
              },
              oneofIndex: {
                type: "int32",
                id: 9
              },
              jsonName: {
                type: "string",
                id: 10
              },
              options: {
                type: "FieldOptions",
                id: 8
              }
            },
            nested: {
              Type: {
                values: {
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
                  TYPE_SINT64: 18
                }
              },
              Label: {
                values: {
                  LABEL_OPTIONAL: 1,
                  LABEL_REQUIRED: 2,
                  LABEL_REPEATED: 3
                }
              }
            }
          },
          OneofDescriptorProto: {
            fields: {
              name: {
                type: "string",
                id: 1
              },
              options: {
                type: "OneofOptions",
                id: 2
              }
            }
          },
          EnumDescriptorProto: {
            fields: {
              name: {
                type: "string",
                id: 1
              },
              value: {
                rule: "repeated",
                type: "EnumValueDescriptorProto",
                id: 2
              },
              options: {
                type: "EnumOptions",
                id: 3
              }
            }
          },
          EnumValueDescriptorProto: {
            fields: {
              name: {
                type: "string",
                id: 1
              },
              number: {
                type: "int32",
                id: 2
              },
              options: {
                type: "EnumValueOptions",
                id: 3
              }
            }
          },
          ServiceDescriptorProto: {
            fields: {
              name: {
                type: "string",
                id: 1
              },
              method: {
                rule: "repeated",
                type: "MethodDescriptorProto",
                id: 2
              },
              options: {
                type: "ServiceOptions",
                id: 3
              }
            }
          },
          MethodDescriptorProto: {
            fields: {
              name: {
                type: "string",
                id: 1
              },
              inputType: {
                type: "string",
                id: 2
              },
              outputType: {
                type: "string",
                id: 3
              },
              options: {
                type: "MethodOptions",
                id: 4
              },
              clientStreaming: {
                type: "bool",
                id: 5
              },
              serverStreaming: {
                type: "bool",
                id: 6
              }
            }
          },
          FileOptions: {
            fields: {
              javaPackage: {
                type: "string",
                id: 1
              },
              javaOuterClassname: {
                type: "string",
                id: 8
              },
              javaMultipleFiles: {
                type: "bool",
                id: 10
              },
              javaGenerateEqualsAndHash: {
                type: "bool",
                id: 20,
                options: {
                  deprecated: true
                }
              },
              javaStringCheckUtf8: {
                type: "bool",
                id: 27
              },
              optimizeFor: {
                type: "OptimizeMode",
                id: 9,
                options: {
                  "default": "SPEED"
                }
              },
              goPackage: {
                type: "string",
                id: 11
              },
              ccGenericServices: {
                type: "bool",
                id: 16
              },
              javaGenericServices: {
                type: "bool",
                id: 17
              },
              pyGenericServices: {
                type: "bool",
                id: 18
              },
              deprecated: {
                type: "bool",
                id: 23
              },
              ccEnableArenas: {
                type: "bool",
                id: 31
              },
              objcClassPrefix: {
                type: "string",
                id: 36
              },
              csharpNamespace: {
                type: "string",
                id: 37
              },
              uninterpretedOption: {
                rule: "repeated",
                type: "UninterpretedOption",
                id: 999
              }
            },
            extensions: [
              [
                1000,
                536870911
              ]
            ],
            reserved: [
              [
                38,
                38
              ]
            ],
            nested: {
              OptimizeMode: {
                values: {
                  SPEED: 1,
                  CODE_SIZE: 2,
                  LITE_RUNTIME: 3
                }
              }
            }
          },
          MessageOptions: {
            fields: {
              messageSetWireFormat: {
                type: "bool",
                id: 1
              },
              noStandardDescriptorAccessor: {
                type: "bool",
                id: 2
              },
              deprecated: {
                type: "bool",
                id: 3
              },
              mapEntry: {
                type: "bool",
                id: 7
              },
              uninterpretedOption: {
                rule: "repeated",
                type: "UninterpretedOption",
                id: 999
              }
            },
            extensions: [
              [
                1000,
                536870911
              ]
            ],
            reserved: [
              [
                8,
                8
              ]
            ]
          },
          FieldOptions: {
            fields: {
              ctype: {
                type: "CType",
                id: 1,
                options: {
                  "default": "STRING"
                }
              },
              packed: {
                type: "bool",
                id: 2
              },
              jstype: {
                type: "JSType",
                id: 6,
                options: {
                  "default": "JS_NORMAL"
                }
              },
              lazy: {
                type: "bool",
                id: 5
              },
              deprecated: {
                type: "bool",
                id: 3
              },
              weak: {
                type: "bool",
                id: 10
              },
              uninterpretedOption: {
                rule: "repeated",
                type: "UninterpretedOption",
                id: 999
              }
            },
            extensions: [
              [
                1000,
                536870911
              ]
            ],
            reserved: [
              [
                4,
                4
              ]
            ],
            nested: {
              CType: {
                values: {
                  STRING: 0,
                  CORD: 1,
                  STRING_PIECE: 2
                }
              },
              JSType: {
                values: {
                  JS_NORMAL: 0,
                  JS_STRING: 1,
                  JS_NUMBER: 2
                }
              }
            }
          },
          OneofOptions: {
            fields: {
              uninterpretedOption: {
                rule: "repeated",
                type: "UninterpretedOption",
                id: 999
              }
            },
            extensions: [
              [
                1000,
                536870911
              ]
            ]
          },
          EnumOptions: {
            fields: {
              allowAlias: {
                type: "bool",
                id: 2
              },
              deprecated: {
                type: "bool",
                id: 3
              },
              uninterpretedOption: {
                rule: "repeated",
                type: "UninterpretedOption",
                id: 999
              }
            },
            extensions: [
              [
                1000,
                536870911
              ]
            ]
          },
          EnumValueOptions: {
            fields: {
              deprecated: {
                type: "bool",
                id: 1
              },
              uninterpretedOption: {
                rule: "repeated",
                type: "UninterpretedOption",
                id: 999
              }
            },
            extensions: [
              [
                1000,
                536870911
              ]
            ]
          },
          ServiceOptions: {
            fields: {
              deprecated: {
                type: "bool",
                id: 33
              },
              uninterpretedOption: {
                rule: "repeated",
                type: "UninterpretedOption",
                id: 999
              }
            },
            extensions: [
              [
                1000,
                536870911
              ]
            ]
          },
          MethodOptions: {
            fields: {
              deprecated: {
                type: "bool",
                id: 33
              },
              uninterpretedOption: {
                rule: "repeated",
                type: "UninterpretedOption",
                id: 999
              }
            },
            extensions: [
              [
                1000,
                536870911
              ]
            ]
          },
          UninterpretedOption: {
            fields: {
              name: {
                rule: "repeated",
                type: "NamePart",
                id: 2
              },
              identifierValue: {
                type: "string",
                id: 3
              },
              positiveIntValue: {
                type: "uint64",
                id: 4
              },
              negativeIntValue: {
                type: "int64",
                id: 5
              },
              doubleValue: {
                type: "double",
                id: 6
              },
              stringValue: {
                type: "bytes",
                id: 7
              },
              aggregateValue: {
                type: "string",
                id: 8
              }
            },
            nested: {
              NamePart: {
                fields: {
                  namePart: {
                    rule: "required",
                    type: "string",
                    id: 1
                  },
                  isExtension: {
                    rule: "required",
                    type: "bool",
                    id: 2
                  }
                }
              }
            }
          },
          SourceCodeInfo: {
            fields: {
              location: {
                rule: "repeated",
                type: "Location",
                id: 1
              }
            },
            nested: {
              Location: {
                fields: {
                  path: {
                    rule: "repeated",
                    type: "int32",
                    id: 1
                  },
                  span: {
                    rule: "repeated",
                    type: "int32",
                    id: 2
                  },
                  leadingComments: {
                    type: "string",
                    id: 3
                  },
                  trailingComments: {
                    type: "string",
                    id: 4
                  },
                  leadingDetachedComments: {
                    rule: "repeated",
                    type: "string",
                    id: 6
                  }
                }
              }
            }
          },
          GeneratedCodeInfo: {
            fields: {
              annotation: {
                rule: "repeated",
                type: "Annotation",
                id: 1
              }
            },
            nested: {
              Annotation: {
                fields: {
                  path: {
                    rule: "repeated",
                    type: "int32",
                    id: 1
                  },
                  sourceFile: {
                    type: "string",
                    id: 2
                  },
                  begin: {
                    type: "int32",
                    id: 3
                  },
                  end: {
                    type: "int32",
                    id: 4
                  }
                }
              }
            }
          }
        }
      }
    }
  }
});

export { $root as default };
