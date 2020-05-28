/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/light";

const $root = ($protobuf.roots["default"] || ($protobuf.roots["default"] = new $protobuf.Root()))
.addJSON({
  berty: {
    nested: {
      protocol: {
        options: {
          go_package: "berty.tech/berty/go/pkg/bertyprotocol"
        },
        nested: {
          ProtocolService: {
            methods: {
              InstanceExportData: {
                requestType: "types.InstanceExportData.Request",
                responseType: "types.InstanceExportData.Reply"
              },
              InstanceGetConfiguration: {
                requestType: "types.InstanceGetConfiguration.Request",
                responseType: "types.InstanceGetConfiguration.Reply"
              },
              ContactRequestReference: {
                requestType: "types.ContactRequestReference.Request",
                responseType: "types.ContactRequestReference.Reply"
              },
              ContactRequestDisable: {
                requestType: "types.ContactRequestDisable.Request",
                responseType: "types.ContactRequestDisable.Reply"
              },
              ContactRequestEnable: {
                requestType: "types.ContactRequestEnable.Request",
                responseType: "types.ContactRequestEnable.Reply"
              },
              ContactRequestResetReference: {
                requestType: "types.ContactRequestResetReference.Request",
                responseType: "types.ContactRequestResetReference.Reply"
              },
              ContactRequestSend: {
                requestType: "types.ContactRequestSend.Request",
                responseType: "types.ContactRequestSend.Reply"
              },
              ContactRequestAccept: {
                requestType: "types.ContactRequestAccept.Request",
                responseType: "types.ContactRequestAccept.Reply"
              },
              ContactRequestDiscard: {
                requestType: "types.ContactRequestDiscard.Request",
                responseType: "types.ContactRequestDiscard.Reply"
              },
              ContactBlock: {
                requestType: "types.ContactBlock.Request",
                responseType: "types.ContactBlock.Reply"
              },
              ContactUnblock: {
                requestType: "types.ContactUnblock.Request",
                responseType: "types.ContactUnblock.Reply"
              },
              ContactAliasKeySend: {
                requestType: "types.ContactAliasKeySend.Request",
                responseType: "types.ContactAliasKeySend.Reply"
              },
              MultiMemberGroupCreate: {
                requestType: "types.MultiMemberGroupCreate.Request",
                responseType: "types.MultiMemberGroupCreate.Reply"
              },
              MultiMemberGroupJoin: {
                requestType: "types.MultiMemberGroupJoin.Request",
                responseType: "types.MultiMemberGroupJoin.Reply"
              },
              MultiMemberGroupLeave: {
                requestType: "types.MultiMemberGroupLeave.Request",
                responseType: "types.MultiMemberGroupLeave.Reply"
              },
              MultiMemberGroupAliasResolverDisclose: {
                requestType: "types.MultiMemberGroupAliasResolverDisclose.Request",
                responseType: "types.MultiMemberGroupAliasResolverDisclose.Reply"
              },
              MultiMemberGroupAdminRoleGrant: {
                requestType: "types.MultiMemberGroupAdminRoleGrant.Request",
                responseType: "types.MultiMemberGroupAdminRoleGrant.Reply"
              },
              MultiMemberGroupInvitationCreate: {
                requestType: "types.MultiMemberGroupInvitationCreate.Request",
                responseType: "types.MultiMemberGroupInvitationCreate.Reply"
              },
              AppMetadataSend: {
                requestType: "types.AppMetadataSend.Request",
                responseType: "types.AppMetadataSend.Reply"
              },
              AppMessageSend: {
                requestType: "types.AppMessageSend.Request",
                responseType: "types.AppMessageSend.Reply"
              },
              GroupMetadataSubscribe: {
                requestType: "types.GroupMetadataSubscribe.Request",
                responseType: "types.GroupMetadataEvent",
                responseStream: true
              },
              GroupMessageSubscribe: {
                requestType: "types.GroupMessageSubscribe.Request",
                responseType: "types.GroupMessageEvent",
                responseStream: true
              },
              GroupMetadataList: {
                requestType: "types.GroupMetadataList.Request",
                responseType: "types.GroupMetadataEvent",
                responseStream: true
              },
              GroupMessageList: {
                requestType: "types.GroupMessageList.Request",
                responseType: "types.GroupMessageEvent",
                responseStream: true
              },
              GroupInfo: {
                requestType: "types.GroupInfo.Request",
                responseType: "types.GroupInfo.Reply"
              },
              ActivateGroup: {
                requestType: "types.ActivateGroup.Request",
                responseType: "types.ActivateGroup.Reply"
              },
              DeactivateGroup: {
                requestType: "types.DeactivateGroup.Request",
                responseType: "types.DeactivateGroup.Reply"
              },
              DebugListGroups: {
                requestType: "types.DebugListGroups.Request",
                responseType: "types.DebugListGroups.Reply",
                responseStream: true
              },
              DebugInspectGroupStore: {
                requestType: "types.DebugInspectGroupStore.Request",
                responseType: "types.DebugInspectGroupStore.Reply",
                responseStream: true
              }
            }
          }
        }
      },
      types: {
        options: {
          go_package: "berty.tech/berty/go/pkg/bertytypes",
          "(gogoproto.goproto_enum_prefix_all)": false,
          "(gogoproto.marshaler_all)": true,
          "(gogoproto.unmarshaler_all)": true,
          "(gogoproto.sizer_all)": true
        },
        nested: {
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
                  }
                }
              },
              Reply: {
                fields: {}
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
          GroupMetadataSubscribe: {
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
                  since: {
                    type: "bytes",
                    id: 2
                  },
                  until: {
                    type: "bytes",
                    id: 3
                  },
                  goBackwards: {
                    type: "bool",
                    id: 4
                  }
                }
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
                  }
                }
              }
            }
          },
          GroupMessageSubscribe: {
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
                  since: {
                    type: "bytes",
                    id: 2
                  },
                  until: {
                    type: "bytes",
                    id: 3
                  },
                  goBackwards: {
                    type: "bool",
                    id: 4
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
          }
        }
      },
      chat: {
        options: {
          go_package: "berty.tech/berty/go/pkg/bertychat"
        },
        nested: {
          ChatService: {
            methods: {
              InstanceShareableBertyID: {
                requestType: "InstanceShareableBertyID.Request",
                responseType: "InstanceShareableBertyID.Reply"
              },
              DevShareInstanceBertyID: {
                requestType: "DevShareInstanceBertyID.Request",
                responseType: "DevShareInstanceBertyID.Reply"
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
                  }
                }
              },
              Reply: {
                fields: {
                  bertyId: {
                    type: "string",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "BertyID"
                    }
                  },
                  deepLink: {
                    type: "string",
                    id: 2,
                    options: {
                      "(gogoproto.customname)": "DeepLink"
                    }
                  },
                  htmlUrl: {
                    type: "string",
                    id: 3,
                    options: {
                      "(gogoproto.customname)": "HTMLURL"
                    }
                  },
                  displayName: {
                    type: "string",
                    id: 4
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
        options: {
          go_package: "github.com/golang/protobuf/protoc-gen-go/descriptor;descriptor",
          java_package: "com.google.protobuf",
          java_outer_classname: "DescriptorProtos",
          csharp_namespace: "Google.Protobuf.Reflection",
          objc_class_prefix: "GPB",
          cc_enable_arenas: true,
          optimize_for: "SPEED"
        },
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
                  },
                  options: {
                    type: "ExtensionRangeOptions",
                    id: 3
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
          ExtensionRangeOptions: {
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
              },
              reservedRange: {
                rule: "repeated",
                type: "EnumReservedRange",
                id: 4
              },
              reservedName: {
                rule: "repeated",
                type: "string",
                id: 5
              }
            },
            nested: {
              EnumReservedRange: {
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
                id: 5,
                options: {
                  "default": false
                }
              },
              serverStreaming: {
                type: "bool",
                id: 6,
                options: {
                  "default": false
                }
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
                id: 10,
                options: {
                  "default": false
                }
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
                id: 27,
                options: {
                  "default": false
                }
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
                id: 16,
                options: {
                  "default": false
                }
              },
              javaGenericServices: {
                type: "bool",
                id: 17,
                options: {
                  "default": false
                }
              },
              pyGenericServices: {
                type: "bool",
                id: 18,
                options: {
                  "default": false
                }
              },
              phpGenericServices: {
                type: "bool",
                id: 42,
                options: {
                  "default": false
                }
              },
              deprecated: {
                type: "bool",
                id: 23,
                options: {
                  "default": false
                }
              },
              ccEnableArenas: {
                type: "bool",
                id: 31,
                options: {
                  "default": false
                }
              },
              objcClassPrefix: {
                type: "string",
                id: 36
              },
              csharpNamespace: {
                type: "string",
                id: 37
              },
              swiftPrefix: {
                type: "string",
                id: 39
              },
              phpClassPrefix: {
                type: "string",
                id: 40
              },
              phpNamespace: {
                type: "string",
                id: 41
              },
              phpMetadataNamespace: {
                type: "string",
                id: 44
              },
              rubyPackage: {
                type: "string",
                id: 45
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
                id: 1,
                options: {
                  "default": false
                }
              },
              noStandardDescriptorAccessor: {
                type: "bool",
                id: 2,
                options: {
                  "default": false
                }
              },
              deprecated: {
                type: "bool",
                id: 3,
                options: {
                  "default": false
                }
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
              ],
              [
                9,
                9
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
                id: 5,
                options: {
                  "default": false
                }
              },
              deprecated: {
                type: "bool",
                id: 3,
                options: {
                  "default": false
                }
              },
              weak: {
                type: "bool",
                id: 10,
                options: {
                  "default": false
                }
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
                id: 3,
                options: {
                  "default": false
                }
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
                5,
                5
              ]
            ]
          },
          EnumValueOptions: {
            fields: {
              deprecated: {
                type: "bool",
                id: 1,
                options: {
                  "default": false
                }
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
                id: 33,
                options: {
                  "default": false
                }
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
                id: 33,
                options: {
                  "default": false
                }
              },
              idempotencyLevel: {
                type: "IdempotencyLevel",
                id: 34,
                options: {
                  "default": "IDEMPOTENCY_UNKNOWN"
                }
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
            nested: {
              IdempotencyLevel: {
                values: {
                  IDEMPOTENCY_UNKNOWN: 0,
                  NO_SIDE_EFFECTS: 1,
                  IDEMPOTENT: 2
                }
              }
            }
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
