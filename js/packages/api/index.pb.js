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
          DemoService: {
            methods: {
              AddKey: {
                requestType: "AddKey.Request",
                responseType: "AddKey.Reply"
              },
              Log: {
                requestType: "Log.Request",
                responseType: "Log.Reply"
              },
              LogAdd: {
                requestType: "LogAdd.Request",
                responseType: "LogAdd.Reply"
              },
              LogGet: {
                requestType: "LogGet.Request",
                responseType: "LogGet.Reply"
              },
              LogStream: {
                requestType: "LogStream.Request",
                responseType: "Log.Operation",
                responseStream: true
              },
              LogList: {
                requestType: "LogList.Request",
                responseType: "LogList.Reply"
              }
            }
          },
          AddKey: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  privKey: {
                    type: "bytes",
                    id: 1
                  }
                }
              },
              Reply: {
                fields: {}
              }
            }
          },
          Log: {
            fields: {},
            nested: {
              Operation: {
                fields: {
                  name: {
                    type: "string",
                    id: 1
                  },
                  value: {
                    type: "bytes",
                    id: 2
                  }
                }
              },
              StreamOptions: {
                fields: {
                  GT: {
                    type: "string",
                    id: 1
                  },
                  GTE: {
                    type: "string",
                    id: 2
                  },
                  LT: {
                    type: "string",
                    id: 3
                  },
                  LTE: {
                    type: "string",
                    id: 4
                  },
                  amount: {
                    type: "uint32",
                    id: 5
                  }
                }
              },
              ManifestEntry: {
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
              Request: {
                fields: {
                  address: {
                    type: "string",
                    id: 1
                  },
                  manifestType: {
                    type: "string",
                    id: 2
                  },
                  manifestAccess: {
                    rule: "repeated",
                    type: "ManifestEntry",
                    id: 3
                  },
                  identityType: {
                    type: "string",
                    id: 4
                  },
                  identityId: {
                    type: "string",
                    id: 5
                  }
                }
              },
              Reply: {
                fields: {
                  logHandle: {
                    type: "string",
                    id: 1
                  }
                }
              }
            }
          },
          LogAdd: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  logHandle: {
                    type: "string",
                    id: 1
                  },
                  data: {
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
          LogGet: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  logHandle: {
                    type: "string",
                    id: 1
                  },
                  cid: {
                    type: "string",
                    id: 2
                  }
                }
              },
              Reply: {
                fields: {
                  op: {
                    type: "Log.Operation",
                    id: 1
                  }
                }
              }
            }
          },
          LogStream: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  logHandle: {
                    type: "string",
                    id: 1
                  },
                  options: {
                    type: "Log.StreamOptions",
                    id: 2
                  }
                }
              }
            }
          },
          LogList: {
            fields: {},
            nested: {
              Operations: {
                fields: {
                  ops: {
                    rule: "repeated",
                    type: "Log.Operation",
                    id: 1
                  }
                }
              },
              Request: {
                fields: {
                  logHandle: {
                    type: "string",
                    id: 1
                  },
                  options: {
                    type: "Log.StreamOptions",
                    id: 2
                  }
                }
              },
              Reply: {
                fields: {
                  ops: {
                    type: "Operations",
                    id: 1
                  }
                }
              }
            }
          },
          ProtocolService: {
            methods: {
              InstanceExportData: {
                requestType: "InstanceExportData.Request",
                responseType: "InstanceExportData.Reply"
              },
              InstanceGetConfiguration: {
                requestType: "InstanceGetConfiguration.Request",
                responseType: "InstanceGetConfiguration.Reply"
              },
              GroupCreate: {
                requestType: "GroupCreate.Request",
                responseType: "GroupCreate.Reply"
              },
              GroupJoin: {
                requestType: "GroupJoin.Request",
                responseType: "GroupJoin.Reply"
              },
              GroupLeave: {
                requestType: "GroupLeave.Request",
                responseType: "GroupLeave.Reply"
              },
              GroupInvite: {
                requestType: "GroupInvite.Request",
                responseType: "GroupInvite.Reply"
              },
              DevicePair: {
                requestType: "DevicePair.Request",
                responseType: "DevicePair.Reply"
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
                requestType: "ContactRequestResetLink.Request",
                responseType: "ContactRequestResetLink.Reply"
              },
              ContactRequestEnqueue: {
                requestType: "ContactRequestEnqueue.Request",
                responseType: "ContactRequestEnqueue.Reply"
              },
              ContactRequestAccept: {
                requestType: "ContactRequestAccept.Request",
                responseType: "ContactRequestAccept.Reply"
              },
              ContactRemove: {
                requestType: "ContactRemove.Request",
                responseType: "ContactRemove.Reply"
              },
              ContactBlock: {
                requestType: "ContactBlock.Request",
                responseType: "ContactBlock.Reply"
              },
              ContactUnblock: {
                requestType: "ContactUnblock.Request",
                responseType: "ContactUnblock.Reply"
              },
              GroupSettingSetGroup: {
                requestType: "GroupSettingSetGroup.Request",
                responseType: "GroupSettingSetGroup.Reply"
              },
              GroupSettingSetMember: {
                requestType: "GroupSettingSetMember.Request",
                responseType: "GroupSettingSetMember.Reply"
              },
              GroupMessageSend: {
                requestType: "GroupMessageSend.Request",
                responseType: "GroupMessageSend.Reply"
              },
              AccountAppendAppSpecificEvent: {
                requestType: "AccountAppendAppSpecificEvent.Request",
                responseType: "AccountAppendAppSpecificEvent.Reply"
              },
              AccountSubscribe: {
                requestType: "AccountSubscribe.Request",
                responseType: "AccountSubscribe.Reply",
                responseStream: true
              },
              GroupSettingSubscribe: {
                requestType: "GroupSettingStoreSubscribe.Request",
                responseType: "GroupSettingStoreSubscribe.Reply",
                responseStream: true
              },
              GroupMessageSubscribe: {
                requestType: "GroupMessageSubscribe.Request",
                responseType: "GroupMessageSubscribe.Reply",
                responseStream: true
              },
              GroupMemberSubscribe: {
                requestType: "GroupMemberSubscribe.Request",
                responseType: "GroupMemberSubscribe.Reply",
                responseStream: true
              }
            }
          },
          AccountEventType: {
            values: {
              AccountEventType_Undefined: 0,
              AccountEventType_GroupJoined: 1,
              AccountEventType_GroupLeft: 2,
              AccountEventType_DevicePaired: 3,
              AccountEventType_ContactRequestDisabled: 4,
              AccountEventType_ContactRequestEnabled: 5,
              AccountEventType_ContactRequestReferenceReset: 6,
              AccountEventType_ContactRequestEnqueued: 7,
              AccountEventType_ContactRequested: 8,
              AccountEventType_ContactAccepted: 9,
              AccountEventType_ContactRemoved: 10,
              AccountEventType_ContactBlocked: 11,
              AccountEventType_ContactUnblocked: 12,
              AccountEventType_AppSpecified: 13
            }
          },
          GroupSettingStoreSettingType: {
            values: {
              Unknown: 0,
              Group: 1,
              Member: 2
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
                  peerId: {
                    type: "string",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "PeerID"
                    }
                  },
                  listeners: {
                    rule: "repeated",
                    type: "string",
                    id: 2
                  },
                  bleEnabled: {
                    type: "SettingState",
                    id: 3
                  },
                  wifiP2pEnabled: {
                    type: "SettingState",
                    id: 4
                  },
                  mdnsEnabled: {
                    type: "SettingState",
                    id: 5
                  },
                  relayEnabled: {
                    type: "SettingState",
                    id: 6
                  }
                }
              }
            }
          },
          GroupSettingSetMember: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  groupPubKey: {
                    type: "bytes",
                    id: 1
                  },
                  key: {
                    type: "string",
                    id: 2
                  },
                  value: {
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
          GroupSettingSetGroup: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  groupPubKey: {
                    type: "bytes",
                    id: 1
                  },
                  key: {
                    type: "string",
                    id: 2
                  },
                  value: {
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
          GroupSettingStoreSubscribe: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  groupPubKey: {
                    type: "bytes",
                    id: 1
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
              },
              Reply: {
                fields: {
                  event: {
                    type: "GroupSettingStoreEvent",
                    id: 1
                  }
                }
              }
            }
          },
          EventBase: {
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
              }
            }
          },
          GroupStoreEvent: {
            fields: {
              eventBase: {
                type: "EventBase",
                id: 1
              },
              groupPubKey: {
                type: "bytes",
                id: 2
              },
              groupMemberPubKey: {
                type: "bytes",
                id: 3
              },
              groupDevicePubKey: {
                type: "bytes",
                id: 4
              },
              accountPubKey: {
                type: "bytes",
                id: 5
              }
            }
          },
          GroupSettingStoreEvent: {
            fields: {
              groupStoreEvent: {
                type: "GroupStoreEvent",
                id: 1
              },
              settingType: {
                type: "GroupSettingStoreSettingType",
                id: 2
              },
              key: {
                type: "string",
                id: 3
              },
              value: {
                type: "bytes",
                id: 4
              }
            }
          },
          GroupMessageSend: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  groupPubKey: {
                    type: "bytes",
                    id: 1
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
          AccountAppendAppSpecificEvent: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  payload: {
                    type: "bytes",
                    id: 1
                  }
                }
              },
              Reply: {
                fields: {}
              }
            }
          },
          GroupMessageSubscribe: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  groupPubKey: {
                    type: "bytes",
                    id: 1
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
              },
              Reply: {
                fields: {
                  event: {
                    type: "GroupMessageStoreEvent",
                    id: 1
                  }
                }
              }
            }
          },
          GroupMessageStoreEvent: {
            fields: {
              groupStoreEvent: {
                type: "GroupStoreEvent",
                id: 1
              },
              payload: {
                type: "bytes",
                id: 2
              }
            }
          },
          GroupMemberSubscribe: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  groupPubKey: {
                    type: "bytes",
                    id: 1
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
              },
              Reply: {
                fields: {
                  event: {
                    type: "GroupMemberStoreEvent",
                    id: 1
                  }
                }
              }
            }
          },
          GroupMemberStoreEvent: {
            fields: {
              groupStoreEvent: {
                type: "GroupStoreEvent",
                id: 1
              }
            }
          },
          GroupCreate: {
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
          GroupJoin: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  reference: {
                    type: "bytes",
                    id: 1
                  },
                  meta: {
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
          GroupLeave: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  groupPubKey: {
                    type: "bytes",
                    id: 1
                  }
                }
              },
              Reply: {
                fields: {}
              }
            }
          },
          GroupInvite: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  groupPubKey: {
                    type: "bytes",
                    id: 1
                  }
                }
              },
              Reply: {
                fields: {
                  reference: {
                    type: "bytes",
                    id: 1
                  }
                }
              }
            }
          },
          DevicePair: {
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
          ContactRequestReference: {
            fields: {},
            nested: {
              Request: {
                fields: {}
              },
              Reply: {
                fields: {
                  reference: {
                    type: "bytes",
                    id: 1
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
                fields: {}
              }
            }
          },
          ContactRequestResetLink: {
            fields: {},
            nested: {
              Request: {
                fields: {}
              },
              Reply: {
                fields: {
                  reference: {
                    type: "bytes",
                    id: 1
                  }
                }
              }
            }
          },
          ContactRequestEnqueue: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  reference: {
                    type: "bytes",
                    id: 1
                  },
                  meta: {
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
          ContactRequestAccept: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  contactPubKey: {
                    type: "bytes",
                    id: 1
                  }
                }
              },
              Reply: {
                fields: {}
              }
            }
          },
          ContactRemove: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  contactPubKey: {
                    type: "bytes",
                    id: 1
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
                  contactPubKey: {
                    type: "bytes",
                    id: 1
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
                  contactPubKey: {
                    type: "bytes",
                    id: 1
                  }
                }
              },
              Reply: {
                fields: {}
              }
            }
          },
          AccountSubscribe: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  since: {
                    type: "bytes",
                    id: 1
                  },
                  until: {
                    type: "bytes",
                    id: 2
                  },
                  goBackwards: {
                    type: "bool",
                    id: 3
                  }
                }
              },
              Reply: {
                fields: {
                  event: {
                    type: "AccountStoreEvent",
                    id: 1
                  }
                }
              }
            }
          },
          AccountStoreEvent: {
            fields: {
              subjectPublicKeyBytes: {
                type: "bytes",
                id: 1
              },
              data: {
                type: "bytes",
                id: 2
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
