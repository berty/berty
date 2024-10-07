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
              go_package: "berty.tech/berty/go/pkg/accounttypes"
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
                  ImportAccountWithProgress: {
                    requestType: "ImportAccountWithProgress.Request",
                    responseType: "ImportAccountWithProgress.Reply",
                    responseStream: true
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
                  },
                  LogfileList: {
                    requestType: "LogfileList.Request",
                    responseType: "LogfileList.Reply"
                  },
                  StreamLogfile: {
                    requestType: "StreamLogfile.Request",
                    responseType: "StreamLogfile.Reply",
                    responseStream: true
                  },
                  GetUsername: {
                    requestType: "GetUsername.Request",
                    responseType: "GetUsername.Reply"
                  },
                  NetworkConfigSet: {
                    requestType: "NetworkConfigSet.Request",
                    responseType: "NetworkConfigSet.Reply"
                  },
                  NetworkConfigGet: {
                    requestType: "NetworkConfigGet.Request",
                    responseType: "NetworkConfigGet.Reply"
                  },
                  NetworkConfigGetPreset: {
                    requestType: "NetworkConfigGetPreset.Request",
                    responseType: "NetworkConfigGetPreset.Reply"
                  },
                  PushReceive: {
                    requestType: "PushReceive.Request",
                    responseType: "PushReceive.Reply"
                  },
                  PushPlatformTokenRegister: {
                    requestType: "PushPlatformTokenRegister.Request",
                    responseType: "PushPlatformTokenRegister.Reply"
                  },
                  AppStoragePut: {
                    requestType: "AppStoragePut.Request",
                    responseType: "AppStoragePut.Reply"
                  },
                  AppStorageGet: {
                    requestType: "AppStorageGet.Request",
                    responseType: "AppStorageGet.Reply"
                  },
                  AppStorageRemove: {
                    requestType: "AppStorageRemove.Request",
                    responseType: "AppStorageRemove.Reply"
                  },
                  GetOpenedAccount: {
                    requestType: "GetOpenedAccount.Request",
                    responseType: "GetOpenedAccount.Reply"
                  }
                }
              },
              AppStoragePut: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      key: {
                        type: "string",
                        id: 1
                      },
                      value: {
                        type: "bytes",
                        id: 2
                      },
                      global: {
                        type: "bool",
                        id: 3
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              AppStorageGet: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      key: {
                        type: "string",
                        id: 1
                      },
                      global: {
                        type: "bool",
                        id: 2
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      value: {
                        type: "bytes",
                        id: 2
                      }
                    }
                  }
                }
              },
              AppStorageRemove: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      key: {
                        type: "string",
                        id: 1
                      },
                      global: {
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
              GetOpenedAccount: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      accountId: {
                        type: "string",
                        id: 1
                      },
                      listeners: {
                        rule: "repeated",
                        type: "string",
                        id: 2
                      }
                    }
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
                        id: 2
                      },
                      loggerFilters: {
                        type: "string",
                        id: 3
                      },
                      networkConfig: {
                        type: "NetworkConfig",
                        id: 4
                      },
                      sessionKind: {
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
                        id: 2
                      },
                      loggerFilters: {
                        type: "string",
                        id: 3
                      },
                      sessionKind: {
                        type: "string",
                        id: 4
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      progress: {
                        type: "weshnet.protocol.v1.Progress",
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
                        type: "weshnet.protocol.v1.Progress",
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
                    id: 1
                  },
                  name: {
                    type: "string",
                    id: 2
                  },
                  avatarCid: {
                    type: "string",
                    id: 3
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
                        id: 1
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
                        id: 1
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
                      },
                      networkConfig: {
                        type: "NetworkConfig",
                        id: 6
                      },
                      sessionKind: {
                        type: "string",
                        id: 7
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
              ImportAccountWithProgress: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      accountId: {
                        type: "string",
                        id: 1
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
                      },
                      networkConfig: {
                        type: "NetworkConfig",
                        id: 6
                      },
                      sessionKind: {
                        type: "string",
                        id: 7
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      progress: {
                        type: "weshnet.protocol.v1.Progress",
                        id: 1
                      },
                      accountMetadata: {
                        type: "AccountMetadata",
                        id: 2
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
                        id: 1
                      },
                      accountName: {
                        type: "string",
                        id: 2
                      },
                      networkConfig: {
                        type: "NetworkConfig",
                        id: 3
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
                        id: 1
                      },
                      accountName: {
                        type: "string",
                        id: 2
                      },
                      avatarCid: {
                        type: "string",
                        id: 3
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
              },
              LogfileList: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      entries: {
                        rule: "repeated",
                        type: "Logfile",
                        id: 1
                      }
                    },
                    nested: {
                      Logfile: {
                        fields: {
                          accountId: {
                            type: "string",
                            id: 1
                          },
                          name: {
                            type: "string",
                            id: 2
                          },
                          path: {
                            type: "string",
                            id: 3
                          },
                          size: {
                            type: "int64",
                            id: 4
                          },
                          kind: {
                            type: "string",
                            id: 5
                          },
                          time: {
                            type: "int64",
                            id: 6
                          },
                          latest: {
                            type: "bool",
                            id: 7
                          },
                          errs: {
                            type: "string",
                            id: 8
                          }
                        }
                      }
                    }
                  }
                }
              },
              StreamLogfile: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      accountId: {
                        type: "string",
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      line: {
                        type: "string",
                        id: 1
                      },
                      fileName: {
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
              NetworkConfig: {
                fields: {
                  bootstrap: {
                    rule: "repeated",
                    type: "string",
                    id: 1
                  },
                  rendezvous: {
                    rule: "repeated",
                    type: "string",
                    id: 2
                  },
                  staticRelay: {
                    rule: "repeated",
                    type: "string",
                    id: 3
                  },
                  dht: {
                    type: "DHTFlag",
                    id: 4
                  },
                  bluetoothLe: {
                    type: "Flag",
                    id: 5
                  },
                  appleMultipeerConnectivity: {
                    type: "Flag",
                    id: 6
                  },
                  androidNearby: {
                    type: "Flag",
                    id: 7
                  },
                  tor: {
                    type: "TorFlag",
                    id: 8
                  },
                  mdns: {
                    type: "Flag",
                    id: 9
                  },
                  showDefaultServices: {
                    type: "Flag",
                    id: 10
                  },
                  allowUnsecureGrpcConnections: {
                    type: "Flag",
                    id: 11
                  }
                },
                nested: {
                  Flag: {
                    values: {
                      Undefined: 0,
                      Disabled: 1,
                      Enabled: 2
                    }
                  },
                  TorFlag: {
                    values: {
                      TorUndefined: 0,
                      TorDisabled: 1,
                      TorOptional: 2,
                      TorRequired: 3
                    }
                  },
                  DHTFlag: {
                    values: {
                      DHTUndefined: 0,
                      DHTDisabled: 1,
                      DHTClient: 2,
                      DHTServer: 3,
                      DHTAuto: 4,
                      DHTAutoServer: 5
                    }
                  }
                }
              },
              NetworkConfigPreset: {
                values: {
                  Undefined: 0,
                  Performance: 1,
                  FullAnonymity: 2
                }
              },
              NetworkConfigSet: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      accountId: {
                        type: "string",
                        id: 1
                      },
                      config: {
                        type: "NetworkConfig",
                        id: 2
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              NetworkConfigGet: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      accountId: {
                        type: "string",
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      defaultConfig: {
                        type: "NetworkConfig",
                        id: 1
                      },
                      currentConfig: {
                        type: "NetworkConfig",
                        id: 2
                      },
                      customConfigExists: {
                        type: "bool",
                        id: 3
                      },
                      defaultBootstrap: {
                        rule: "repeated",
                        type: "string",
                        id: 4
                      },
                      defaultRendezvous: {
                        rule: "repeated",
                        type: "string",
                        id: 5
                      },
                      defaultStaticRelay: {
                        rule: "repeated",
                        type: "string",
                        id: 6
                      }
                    }
                  }
                }
              },
              NetworkConfigGetPreset: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      preset: {
                        type: "NetworkConfigPreset",
                        id: 1
                      },
                      hasBluetoothPermission: {
                        type: "bool",
                        id: 2
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      config: {
                        type: "NetworkConfig",
                        id: 1
                      }
                    }
                  }
                }
              },
              PushReceive: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      payload: {
                        type: "string",
                        id: 1
                      },
                      tokenType: {
                        type: "berty.push.v1.PushServiceTokenType",
                        id: 2
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      pushData: {
                        type: "berty.push.v1.DecryptedPush",
                        id: 1
                      },
                      push: {
                        type: "berty.push.v1.FormatedPush",
                        id: 2
                      }
                    }
                  }
                }
              },
              PushPlatformTokenRegister: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      receiver: {
                        type: "push.v1.PushServiceReceiver",
                        id: 1
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
      push: {
        nested: {
          v1: {
            options: {
              go_package: "berty.tech/berty/go/pkg/pushtypes"
            },
            nested: {
              PushService: {
                methods: {
                  ServerInfo: {
                    requestType: "PushServiceServerInfo.Request",
                    responseType: "PushServiceServerInfo.Reply"
                  },
                  Send: {
                    requestType: "PushServiceSend.Request",
                    responseType: "PushServiceSend.Reply"
                  }
                }
              },
              PushServiceReceiver: {
                fields: {
                  tokenType: {
                    type: "PushServiceTokenType",
                    id: 1
                  },
                  bundleId: {
                    type: "string",
                    id: 2
                  },
                  token: {
                    type: "bytes",
                    id: 3
                  },
                  recipientPublicKey: {
                    type: "bytes",
                    id: 4
                  }
                }
              },
              PushServiceServerInfo: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      publicKey: {
                        type: "bytes",
                        id: 1
                      },
                      supportedTokenTypes: {
                        rule: "repeated",
                        type: "PushServiceSupportedTokenType",
                        id: 2
                      }
                    }
                  }
                }
              },
              PushServiceSupportedTokenType: {
                fields: {
                  appBundleId: {
                    type: "string",
                    id: 1
                  },
                  tokenType: {
                    type: "PushServiceTokenType",
                    id: 2
                  }
                }
              },
              PushServiceTokenType: {
                values: {
                  PushTokenUndefined: 0,
                  PushTokenMQTT: 1,
                  PushTokenApplePushNotificationService: 2,
                  PushTokenFirebaseCloudMessaging: 3,
                  PushTokenWindowsPushNotificationService: 4,
                  PushTokenHuaweiPushKit: 5,
                  PushTokenAmazonDeviceMessaging: 6
                }
              },
              PushServiceSend: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      envelope: {
                        type: "bytes",
                        id: 1
                      },
                      priority: {
                        type: "PushServicePriority",
                        id: 2
                      },
                      receivers: {
                        rule: "repeated",
                        type: "PushServiceOpaqueReceiver",
                        id: 3
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              OutOfStoreExposedData: {
                fields: {
                  nonce: {
                    type: "bytes",
                    id: 1
                  },
                  box: {
                    type: "bytes",
                    id: 2
                  }
                }
              },
              PushServicePriority: {
                values: {
                  PushPriorityUndefined: 0,
                  PushPriorityLow: 1,
                  PushPriorityNormal: 2
                }
              },
              PushServiceOpaqueReceiver: {
                fields: {
                  opaqueToken: {
                    type: "bytes",
                    id: 1
                  },
                  serviceAddr: {
                    type: "string",
                    id: 2
                  }
                }
              },
              DecryptedPush: {
                fields: {
                  accountId: {
                    type: "string",
                    id: 1
                  },
                  accountName: {
                    type: "string",
                    id: 2
                  },
                  conversationPublicKey: {
                    type: "string",
                    id: 3
                  },
                  conversationDisplayName: {
                    type: "string",
                    id: 4
                  },
                  memberPublicKey: {
                    type: "string",
                    id: 5
                  },
                  memberDisplayName: {
                    type: "string",
                    id: 6
                  },
                  pushType: {
                    type: "PushType",
                    id: 7
                  },
                  payloadAttrsJson: {
                    type: "string",
                    id: 8
                  },
                  deepLink: {
                    type: "string",
                    id: 9
                  },
                  alreadyReceived: {
                    type: "bool",
                    id: 10
                  },
                  accountMuted: {
                    type: "bool",
                    id: 11
                  },
                  conversationMuted: {
                    type: "bool",
                    id: 12
                  },
                  hidePreview: {
                    type: "bool",
                    id: 13
                  }
                },
                nested: {
                  PushType: {
                    values: {
                      Unknown: 0,
                      Message: 1,
                      GroupInvitation: 7,
                      ConversationNameChanged: 8,
                      MemberNameChanged: 9,
                      MemberDetailsChanged: 11
                    },
                    reserved: [
                      [
                        2,
                        2
                      ],
                      [
                        3,
                        3
                      ],
                      [
                        4,
                        4
                      ],
                      [
                        5,
                        5
                      ],
                      [
                        6,
                        6
                      ],
                      [
                        10,
                        10
                      ]
                    ]
                  }
                }
              },
              FormatedPush: {
                fields: {
                  pushType: {
                    type: "DecryptedPush.PushType",
                    id: 1
                  },
                  title: {
                    type: "string",
                    id: 2
                  },
                  subtitle: {
                    type: "string",
                    id: 3
                  },
                  body: {
                    type: "string",
                    id: 4
                  },
                  deepLink: {
                    type: "string",
                    id: 5
                  },
                  muted: {
                    type: "bool",
                    id: 6
                  },
                  hidePreview: {
                    type: "bool",
                    id: 7
                  },
                  conversationIdentifier: {
                    type: "string",
                    id: 8
                  }
                }
              }
            }
          }
        }
      },
      bridge: {
        nested: {
          v1: {
            options: {
              go_package: "berty.tech/berty/go/pkg/bertybridge"
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
      errcode: {
        options: {
          go_package: "berty.tech/berty/go/pkg/errcode"
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
              ErrDBOpen: 124,
              ErrDBClose: 125,
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
              ErrIPFSAdd: 1050,
              ErrIPFSGet: 1051,
              ErrIPFSInit: 1052,
              ErrIPFSSetupConfig: 1053,
              ErrIPFSSetupRepo: 1054,
              ErrIPFSSetupHost: 1055,
              ErrEventListMetadata: 1400,
              ErrEventListMessage: 1401,
              ErrBridgeInterrupted: 1600,
              ErrBridgeNotRunning: 1601,
              ErrMessengerInvalidDeepLink: 2000,
              ErrMessengerDeepLinkRequiresPassphrase: 2001,
              ErrMessengerDeepLinkInvalidPassphrase: 2002,
              ErrMessengerStreamEvent: 2003,
              ErrMessengerContactMetadataUnmarshal: 2004,
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
              ErrProtocolEventUnmarshal: 2303,
              ErrProtocolGetGroupInfo: 2304,
              ErrTestEcho: 2401,
              ErrTestEchoRecv: 2402,
              ErrTestEchoSend: 2403,
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
              ErrCLINoTermcaps: 3001,
              ErrServicesDirectory: 4200,
              ErrServicesDirectoryInvalidVerifiedCredentialSubject: 4201,
              ErrServicesDirectoryExistingRecordNotFound: 4202,
              ErrServicesDirectoryRecordLockedAndCantBeReplaced: 4203,
              ErrServicesDirectoryExplicitReplaceFlagRequired: 4204,
              ErrServicesDirectoryInvalidVerifiedCredential: 4205,
              ErrServicesDirectoryExpiredVerifiedCredential: 4206,
              ErrServicesDirectoryInvalidVerifiedCredentialID: 4207,
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
              ErrBertyAccountUpdateFailed: 5017,
              ErrAppStorageNotSupported: 5018,
              ErrPush: 6000,
              ErrPushWrongAccount: 6001,
              ErrPushUnableToDecrypt: 6002,
              ErrPushInvalidPayload: 6003,
              ErrPushInvalidServerConfig: 6004,
              ErrPushMissingBundleID: 6005,
              ErrPushUnknownDestination: 6006,
              ErrPushProvider: 6007,
              ErrPushUnknownProvider: 6008,
              ErrNoProvidersConfigured: 6009,
              ErrInvalidPrivateKey: 6010,
              ErrPushServerNotFound: 6011
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
      messenger: {
        nested: {
          v1: {
            options: {
              go_package: "berty.tech/berty/go/pkg/messengertypes"
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
                  AccountPushConfigure: {
                    requestType: "AccountPushConfigure.Request",
                    responseType: "AccountPushConfigure.Reply"
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
                  ConversationMute: {
                    requestType: "ConversationMute.Request",
                    responseType: "ConversationMute.Reply"
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
                  InstanceExportData: {
                    requestType: "InstanceExportData.Request",
                    responseType: "InstanceExportData.Reply",
                    responseStream: true
                  },
                  MessageSearch: {
                    requestType: "MessageSearch.Request",
                    responseType: "MessageSearch.Reply"
                  },
                  ListMemberDevices: {
                    requestType: "ListMemberDevices.Request",
                    responseType: "ListMemberDevices.Reply",
                    responseStream: true
                  },
                  TyberHostSearch: {
                    requestType: "TyberHostSearch.Request",
                    responseType: "TyberHostSearch.Reply",
                    responseStream: true
                  },
                  TyberHostAttach: {
                    requestType: "TyberHostAttach.Request",
                    responseType: "TyberHostAttach.Reply"
                  },
                  DebugAuthServiceSetToken: {
                    requestType: "DebugAuthServiceSetToken.Request",
                    responseType: "DebugAuthServiceSetToken.Reply"
                  },
                  ServicesTokenList: {
                    requestType: "ServicesTokenList.Request",
                    responseType: "ServicesTokenList.Reply",
                    responseStream: true
                  },
                  AuthServiceInitFlow: {
                    requestType: "AuthServiceInitFlow.Request",
                    responseType: "AuthServiceInitFlow.Reply"
                  },
                  AuthServiceCompleteFlow: {
                    requestType: "AuthServiceCompleteFlow.Request",
                    responseType: "AuthServiceCompleteFlow.Reply"
                  },
                  PushSetAutoShare: {
                    requestType: "PushSetAutoShare.Request",
                    responseType: "PushSetAutoShare.Reply"
                  },
                  PushShareTokenForConversation: {
                    requestType: "PushShareTokenForConversation.Request",
                    responseType: "PushShareTokenForConversation.Reply"
                  },
                  PushTokenSharedForConversation: {
                    requestType: "PushTokenSharedForConversation.Request",
                    responseType: "PushTokenSharedForConversation.Reply",
                    responseStream: true
                  },
                  PushReceive: {
                    requestType: "PushReceive.Request",
                    responseType: "PushReceive.Reply"
                  },
                  PushSend: {
                    requestType: "PushSend.Request",
                    responseType: "PushSend.Reply"
                  },
                  PushSetDeviceToken: {
                    requestType: "PushSetDeviceToken.Request",
                    responseType: "PushSetDeviceToken.Reply"
                  },
                  PushSetServer: {
                    requestType: "PushSetServer.Request",
                    responseType: "PushSetServer.Reply"
                  },
                  DirectoryServiceRegister: {
                    requestType: "DirectoryServiceRegister.Request",
                    responseType: "DirectoryServiceRegister.Reply"
                  },
                  DirectoryServiceUnregister: {
                    requestType: "DirectoryServiceUnregister.Request",
                    responseType: "DirectoryServiceUnregister.Reply"
                  },
                  DirectoryServiceQuery: {
                    requestType: "DirectoryServiceQuery.Request",
                    responseType: "DirectoryServiceQuery.Reply",
                    responseStream: true
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
                    id: 2
                  },
                  conversationPk: {
                    type: "string",
                    id: 3
                  },
                  oldestToNewest: {
                    type: "bool",
                    id: 4
                  },
                  noBulk: {
                    type: "bool",
                    id: 6
                  }
                },
                reserved: [
                  [
                    5,
                    5
                  ]
                ]
              },
              ConversationOpen: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
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
              ConversationClose: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
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
              ConversationMute: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
                        type: "string",
                        id: 1
                      },
                      mutedUntil: {
                        type: "int64",
                        id: 2
                      },
                      unmute: {
                        type: "bool",
                        id: 3
                      },
                      muteForever: {
                        type: "bool",
                        id: 4
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
                        id: 2
                      },
                      webUrl: {
                        type: "string",
                        id: 3
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
                        id: 1
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
                        id: 2
                      },
                      webUrl: {
                        type: "string",
                        id: 3
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
                    id: 2
                  },
                  bertyGroup: {
                    type: "BertyGroup",
                    id: 3
                  },
                  bertyMessageRef: {
                    type: "BertyMessageRef",
                    id: 5
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
                        id: 11
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
                        type: "weshnet.protocol.v1.GroupType",
                        id: 23
                      },
                      groupSignPub: {
                        type: "bytes",
                        id: 24
                      },
                      groupLinkKeySig: {
                        type: "bytes",
                        id: 25
                      }
                    }
                  },
                  Kind: {
                    values: {
                      UnknownKind: 0,
                      ContactInviteV1Kind: 1,
                      GroupV1Kind: 2,
                      EncryptedV1Kind: 3,
                      MessageV1Kind: 4
                    }
                  },
                  BertyMessageRef: {
                    fields: {
                      accountId: {
                        type: "string",
                        id: 1
                      },
                      groupPk: {
                        type: "string",
                        id: 2
                      },
                      messageId: {
                        type: "string",
                        id: 3
                      }
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
                        id: 1
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
              BertyID: {
                fields: {
                  publicRendezvousSeed: {
                    type: "bytes",
                    id: 1
                  },
                  accountPk: {
                    type: "bytes",
                    id: 2
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
                    type: "weshnet.protocol.v1.Group",
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
                      json_name: "sentDate"
                    }
                  },
                  targetCid: {
                    type: "string",
                    id: 5
                  }
                },
                reserved: [
                  [
                    4,
                    4
                  ]
                ],
                nested: {
                  Type: {
                    values: {
                      Undefined: 0,
                      TypeUserMessage: 1,
                      TypeGroupInvitation: 3,
                      TypeSetGroupInfo: 4,
                      TypeSetUserInfo: 5,
                      TypeAcknowledge: 6,
                      TypeAccountDirectoryServiceRegistered: 8,
                      TypeAccountDirectoryServiceUnregistered: 9,
                      TypeServiceAddToken: 10,
                      TypeServiceRemoveToken: 11,
                      TypePushSetDeviceToken: 12,
                      TypePushSetServer: 13,
                      TypePushSetMemberToken: 14
                    },
                    reserved: [
                      [
                        2,
                        2
                      ],
                      [
                        7,
                        7
                      ]
                    ]
                  },
                  UserMessage: {
                    fields: {
                      body: {
                        type: "string",
                        id: 1
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
                      }
                    },
                    reserved: [
                      [
                        2,
                        2
                      ]
                    ]
                  },
                  SetUserInfo: {
                    fields: {
                      displayName: {
                        type: "string",
                        id: 1
                      }
                    },
                    reserved: [
                      [
                        2,
                        2
                      ]
                    ]
                  },
                  Acknowledge: {
                    fields: {}
                  },
                  AccountDirectoryServiceRegistered: {
                    fields: {
                      identifier: {
                        type: "string",
                        id: 1
                      },
                      identifierProofIssuer: {
                        type: "string",
                        id: 2
                      },
                      registrationDate: {
                        type: "int64",
                        id: 3
                      },
                      expirationDate: {
                        type: "int64",
                        id: 4
                      },
                      serverAddr: {
                        type: "string",
                        id: 5
                      },
                      directoryRecordToken: {
                        type: "string",
                        id: 6
                      },
                      directoryRecordUnregisterToken: {
                        type: "string",
                        id: 7
                      }
                    }
                  },
                  AccountDirectoryServiceUnregistered: {
                    fields: {
                      identifier: {
                        type: "string",
                        id: 1
                      },
                      identifierProofIssuer: {
                        type: "string",
                        id: 2
                      },
                      removalDate: {
                        type: "int64",
                        id: 3
                      },
                      serverAddr: {
                        type: "string",
                        id: 4
                      },
                      directoryRecordToken: {
                        type: "string",
                        id: 5
                      }
                    }
                  },
                  ServiceAddToken: {
                    fields: {
                      token: {
                        type: "string",
                        id: 1
                      },
                      supportedServices: {
                        rule: "repeated",
                        type: "ServiceTokenSupportedService",
                        id: 2
                      },
                      authenticationUrl: {
                        type: "string",
                        id: 3
                      },
                      expiration: {
                        type: "int64",
                        id: 4
                      }
                    }
                  },
                  ServiceRemoveToken: {
                    fields: {
                      tokenid: {
                        type: "string",
                        id: 2
                      }
                    }
                  },
                  PushSetDeviceToken: {
                    fields: {
                      deviceToken: {
                        type: "push.v1.PushServiceReceiver",
                        id: 1
                      }
                    }
                  },
                  PushSetServer: {
                    fields: {
                      server: {
                        type: "PushServer",
                        id: 1
                      }
                    }
                  },
                  PushSetMemberToken: {
                    fields: {
                      memberToken: {
                        type: "PushMemberTokenUpdate",
                        id: 1
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
                      protocol: {
                        type: "weshnet.protocol.v1.SystemInfo.Reply",
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
                        type: "weshnet.protocol.v1.SystemInfo.Process",
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
                        id: 4
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
                      serviceTokenSupportedServiceRecords: {
                        type: "int64",
                        id: 7
                      },
                      serviceTokens: {
                        type: "int64",
                        id: 8
                      },
                      conversationReplicationInfo: {
                        type: "int64",
                        id: 9
                      },
                      metadataEvents: {
                        type: "int64",
                        id: 10
                      },
                      pushMemberToken: {
                        type: "int64",
                        id: 12
                      },
                      accountVerifiedCredentials: {
                        type: "int64",
                        id: 13
                      },
                      accountDirectoryServiceRecord: {
                        type: "int64",
                        id: 14
                      },
                      pushDeviceToken: {
                        type: "int64",
                        id: 15
                      },
                      pushServerRecord: {
                        type: "int64",
                        id: 16
                      },
                      pushLocalDeviceSharedToken: {
                        type: "int64",
                        id: 17
                      }
                    },
                    reserved: [
                      [
                        11,
                        11
                      ]
                    ]
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
              DebugAuthServiceSetToken: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      token: {
                        type: "AuthExchangeResponse",
                        id: 1
                      },
                      authenticationUrl: {
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
              ServicesTokenList: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      service: {
                        type: "ServiceToken",
                        id: 2
                      }
                    }
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
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      tokenId: {
                        type: "string",
                        id: 1
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
                        id: 1
                      },
                      services: {
                        rule: "repeated",
                        type: "string",
                        id: 3
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      url: {
                        type: "string",
                        id: 1
                      },
                      secureUrl: {
                        type: "bool",
                        id: 2
                      }
                    }
                  }
                }
              },
              Account: {
                fields: {
                  publicKey: {
                    type: "string",
                    id: 1,
                    options: {
                      "(tagger.tags)": "gorm:primaryKey"
                    }
                  },
                  displayName: {
                    type: "string",
                    id: 2
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
                      "(tagger.tags)": "gorm:foreignKey:AccountPk"
                    }
                  },
                  replicateNewGroupsAutomatically: {
                    type: "bool",
                    id: 6,
                    options: {
                      "(tagger.tags)": "gorm:default:true"
                    }
                  },
                  autoSharePushTokenFlag: {
                    type: "bool",
                    id: 8
                  },
                  pushDeviceToken: {
                    type: "PushDeviceToken",
                    id: 9,
                    options: {
                      "(tagger.tags)": "gorm:foreignKey:AccountPk"
                    }
                  },
                  pushServerRecords: {
                    rule: "repeated",
                    type: "PushServerRecord",
                    id: 10,
                    options: {
                      "(tagger.tags)": "gorm:foreignKey:AccountPk"
                    }
                  },
                  mutedUntil: {
                    type: "int64",
                    id: 11
                  },
                  hideInAppNotifications: {
                    type: "bool",
                    id: 12
                  },
                  hidePushPreviews: {
                    type: "bool",
                    id: 13
                  },
                  verifiedCredentials: {
                    rule: "repeated",
                    type: "AccountVerifiedCredential",
                    id: 14,
                    options: {
                      "(tagger.tags)": "gorm:foreignKey:AccountPk"
                    }
                  },
                  directoryServiceRecords: {
                    rule: "repeated",
                    type: "AccountDirectoryServiceRecord",
                    id: 15,
                    options: {
                      "(tagger.tags)": "gorm:foreignKey:AccountPk"
                    }
                  }
                },
                reserved: [
                  [
                    7,
                    7
                  ]
                ]
              },
              ServiceTokenSupportedService: {
                fields: {
                  type: {
                    type: "string",
                    id: 2,
                    options: {
                      "(tagger.tags)": "gorm:primaryKey"
                    }
                  },
                  address: {
                    type: "string",
                    id: 3
                  }
                }
              },
              ServiceTokenSupportedServiceRecord: {
                fields: {
                  tokenId: {
                    type: "string",
                    id: 1,
                    options: {
                      "(tagger.tags)": "gorm:primaryKey"
                    }
                  },
                  type: {
                    type: "string",
                    id: 2,
                    options: {
                      "(tagger.tags)": "gorm:primaryKey"
                    }
                  },
                  address: {
                    type: "string",
                    id: 3
                  }
                }
              },
              ServiceToken: {
                fields: {
                  accountPk: {
                    type: "string",
                    id: 1
                  },
                  tokenId: {
                    type: "string",
                    id: 2,
                    options: {
                      "(tagger.tags)": "gorm:primaryKey"
                    }
                  },
                  token: {
                    type: "string",
                    id: 3
                  },
                  supportedServices: {
                    rule: "repeated",
                    type: "ServiceTokenSupportedServiceRecord",
                    id: 4,
                    options: {
                      "(tagger.tags)": "gorm:foreignKey:TokenId"
                    }
                  },
                  authenticationUrl: {
                    type: "string",
                    id: 5
                  },
                  expiration: {
                    type: "int64",
                    id: 6
                  }
                }
              },
              MetadataEvent: {
                fields: {
                  cid: {
                    type: "string",
                    id: 1,
                    options: {
                      "(tagger.tags)": "gorm:primaryKey;column:cid"
                    }
                  },
                  conversationPublicKey: {
                    type: "string",
                    id: 2,
                    options: {
                      "(tagger.tags)": "gorm:index"
                    }
                  },
                  metadataEventType: {
                    type: "weshnet.protocol.v1.EventType",
                    id: 3
                  },
                  payload: {
                    type: "bytes",
                    id: 4
                  }
                }
              },
              Interaction: {
                fields: {
                  cid: {
                    type: "string",
                    id: 1,
                    options: {
                      "(tagger.tags)": "gorm:primaryKey;column:cid"
                    }
                  },
                  type: {
                    type: "AppMessage.Type",
                    id: 2,
                    options: {
                      "(tagger.tags)": "gorm:index"
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
                      "(tagger.tags)": "gorm:foreignKey:PublicKey;references:MemberPublicKey"
                    }
                  },
                  conversationPublicKey: {
                    type: "string",
                    id: 3,
                    options: {
                      "(tagger.tags)": "gorm:index"
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
                      "(tagger.tags)": "gorm:index"
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
                      "(tagger.tags)": "gorm:index;column:target_cid"
                    }
                  },
                  outOfStoreMessage: {
                    type: "bool",
                    id: 17
                  }
                },
                reserved: [
                  [
                    15,
                    15
                  ],
                  [
                    16,
                    16
                  ]
                ]
              },
              Contact: {
                fields: {
                  publicKey: {
                    type: "string",
                    id: 1,
                    options: {
                      "(tagger.tags)": "gorm:primaryKey"
                    }
                  },
                  conversationPublicKey: {
                    type: "string",
                    id: 2,
                    options: {
                      "(tagger.tags)": "gorm:primaryKey"
                    }
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
                      "(tagger.tags)": "gorm:foreignKey:MemberPublicKey;references:PublicKey"
                    }
                  },
                  infoDate: {
                    type: "int64",
                    id: 10
                  }
                },
                reserved: [
                  [
                    9,
                    9
                  ]
                ],
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
                      "(tagger.tags)": "gorm:primaryKey"
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
                  replicationInfo: {
                    rule: "repeated",
                    type: "ConversationReplicationInfo",
                    id: 16,
                    options: {
                      "(tagger.tags)": "gorm:foreignKey:ConversationPublicKey"
                    }
                  },
                  infoDate: {
                    type: "int64",
                    id: 18
                  },
                  localMemberPublicKey: {
                    type: "string",
                    id: 19
                  },
                  mutedUntil: {
                    type: "int64",
                    id: 20
                  },
                  pushLocalDeviceSharedTokens: {
                    rule: "repeated",
                    type: "PushLocalDeviceSharedToken",
                    id: 21,
                    options: {
                      "(tagger.tags)": "gorm:foreignKey:ConversationPublicKey"
                    }
                  },
                  pushMemberTokens: {
                    rule: "repeated",
                    type: "PushMemberToken",
                    id: 22,
                    options: {
                      "(tagger.tags)": "gorm:foreignKey:ConversationPublicKey"
                    }
                  }
                },
                reserved: [
                  [
                    14,
                    14
                  ],
                  [
                    15,
                    15
                  ],
                  [
                    17,
                    17
                  ]
                ],
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
                      "(tagger.tags)": "gorm:primaryKey;column:cid"
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
                    id: 4
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
                      "(tagger.tags)": "gorm:primaryKey"
                    }
                  },
                  displayName: {
                    type: "string",
                    id: 2
                  },
                  conversationPublicKey: {
                    type: "string",
                    id: 3,
                    options: {
                      "(tagger.tags)": "gorm:primaryKey"
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
                      "(tagger.tags)": "gorm:foreignKey:MemberPublicKey;references:PublicKey"
                    }
                  }
                },
                reserved: [
                  [
                    6,
                    6
                  ]
                ]
              },
              Device: {
                fields: {
                  publicKey: {
                    type: "string",
                    id: 1,
                    options: {
                      "(tagger.tags)": "gorm:primaryKey"
                    }
                  },
                  memberPublicKey: {
                    type: "string",
                    id: 2,
                    options: {
                      "(tagger.tags)": "gorm:index"
                    }
                  }
                }
              },
              AccountVerifiedCredential: {
                fields: {
                  accountPk: {
                    type: "string",
                    id: 1
                  },
                  identifier: {
                    type: "string",
                    id: 2
                  },
                  registrationDate: {
                    type: "int64",
                    id: 3
                  },
                  expirationDate: {
                    type: "int64",
                    id: 4
                  },
                  issuer: {
                    type: "string",
                    id: 5
                  }
                }
              },
              AccountDirectoryServiceRecord: {
                fields: {
                  accountPk: {
                    type: "string",
                    id: 1
                  },
                  identifier: {
                    type: "string",
                    id: 2,
                    options: {
                      "(tagger.tags)": "gorm:primaryKey"
                    }
                  },
                  identifierProofIssuer: {
                    type: "string",
                    id: 3
                  },
                  serverAddr: {
                    type: "string",
                    id: 4,
                    options: {
                      "(tagger.tags)": "gorm:primaryKey"
                    }
                  },
                  registrationDate: {
                    type: "int64",
                    id: 5
                  },
                  expirationDate: {
                    type: "int64",
                    id: 6
                  },
                  revoked: {
                    type: "bool",
                    id: 7
                  },
                  directoryRecordToken: {
                    type: "string",
                    id: 8
                  },
                  directoryRecordUnregisterToken: {
                    type: "string",
                    id: 9
                  }
                }
              },
              PushDeviceToken: {
                fields: {
                  accountPk: {
                    type: "string",
                    id: 1,
                    options: {
                      "(tagger.tags)": "gorm:primaryKey"
                    }
                  },
                  tokenType: {
                    type: "push.v1.PushServiceTokenType",
                    id: 2
                  },
                  bundleId: {
                    type: "string",
                    id: 3
                  },
                  token: {
                    type: "bytes",
                    id: 4
                  },
                  publicKey: {
                    type: "bytes",
                    id: 5
                  }
                }
              },
              PushServerRecord: {
                fields: {
                  accountPk: {
                    type: "string",
                    id: 1,
                    options: {
                      "(tagger.tags)": "gorm:primaryKey"
                    }
                  },
                  serverAddr: {
                    type: "string",
                    id: 2,
                    options: {
                      "(tagger.tags)": "gorm:primaryKey"
                    }
                  },
                  serverKey: {
                    type: "bytes",
                    id: 3
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
                      TypeConversationPartialLoad: 12,
                      TypePeerStatusConnected: 13,
                      TypePeerStatusReconnecting: 14,
                      TypePeerStatusDisconnected: 15,
                      TypePeerStatusGroupAssociated: 16,
                      TypeServiceTokenAdded: 17
                    },
                    reserved: [
                      [
                        11,
                        11
                      ]
                    ]
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
                        id: 1
                      },
                      conversationPublicKey: {
                        type: "string",
                        id: 2
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
                  ConversationPartialLoad: {
                    fields: {
                      conversationPk: {
                        type: "string",
                        id: 1
                      },
                      interactions: {
                        rule: "repeated",
                        type: "Interaction",
                        id: 2
                      }
                    },
                    reserved: [
                      [
                        3,
                        3
                      ]
                    ]
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
                          TypeContactRequestReceived: 4,
                          TypeGroupInvitation: 5
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
                      },
                      GroupInvitation: {
                        fields: {
                          conversation: {
                            type: "Conversation",
                            id: 2
                          },
                          contact: {
                            type: "Contact",
                            id: 3
                          }
                        }
                      }
                    }
                  },
                  PeerStatusConnected: {
                    fields: {
                      peerId: {
                        type: "string",
                        id: 1
                      },
                      transport: {
                        type: "Transport",
                        id: 2
                      }
                    },
                    nested: {
                      Transport: {
                        values: {
                          Unknown: 0,
                          LAN: 1,
                          WAN: 2,
                          Proximity: 3
                        }
                      }
                    }
                  },
                  PeerStatusReconnecting: {
                    fields: {
                      peerId: {
                        type: "string",
                        id: 1
                      }
                    }
                  },
                  PeerStatusDisconnected: {
                    fields: {
                      peerId: {
                        type: "string",
                        id: 1
                      }
                    }
                  },
                  PeerStatusGroupAssociated: {
                    fields: {
                      peerId: {
                        type: "string",
                        id: 1
                      },
                      devicePk: {
                        type: "string",
                        id: 2
                      },
                      groupPk: {
                        type: "string",
                        id: 3
                      }
                    }
                  },
                  ServiceTokenAdded: {
                    fields: {
                      token: {
                        type: "ServiceToken",
                        id: 1
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
                    fields: {}
                  }
                }
              },
              AccountPushConfigure: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      mutedUntil: {
                        type: "int64",
                        id: 1
                      },
                      unmute: {
                        type: "bool",
                        id: 2
                      },
                      muteForever: {
                        type: "bool",
                        id: 3
                      },
                      hideInAppNotifications: {
                        type: "bool",
                        id: 4
                      },
                      hidePushPreviews: {
                        type: "bool",
                        id: 5
                      },
                      showInAppNotifications: {
                        type: "bool",
                        id: 6
                      },
                      showPushPreviews: {
                        type: "bool",
                        id: 7
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
                      targetCid: {
                        type: "string",
                        id: 5
                      },
                      metadata: {
                        type: "bool",
                        id: 6
                      }
                    },
                    reserved: [
                      [
                        4,
                        4
                      ]
                    ]
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
              ReplicationServiceRegisterGroup: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      tokenId: {
                        type: "string",
                        id: 1
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
                  },
                  autoSharePushTokenFlag: {
                    type: "bool",
                    id: 6
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
                        id: 5
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
              },
              TyberHostSearch: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      hostname: {
                        type: "string",
                        id: 1
                      },
                      ipv4: {
                        rule: "repeated",
                        type: "string",
                        id: 2
                      },
                      ipv6: {
                        rule: "repeated",
                        type: "string",
                        id: 3
                      }
                    }
                  }
                }
              },
              TyberHostAttach: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      addresses: {
                        rule: "repeated",
                        type: "string",
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      address: {
                        type: "string",
                        id: 1
                      }
                    }
                  }
                }
              },
              PushSetDeviceToken: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      receiver: {
                        type: "push.v1.PushServiceReceiver",
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              PushSetAutoShare: {
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
              PushReceivedData: {
                fields: {
                  protocolData: {
                    type: "weshnet.protocol.v1.OutOfStoreReceive.Reply",
                    id: 1
                  },
                  interaction: {
                    type: "Interaction",
                    id: 2
                  },
                  alreadyReceived: {
                    type: "bool",
                    id: 3
                  },
                  accountMuted: {
                    type: "bool",
                    id: 4
                  },
                  conversationMuted: {
                    type: "bool",
                    id: 5
                  },
                  hidePreview: {
                    type: "bool",
                    id: 6
                  }
                }
              },
              PushReceive: {
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
                    fields: {
                      data: {
                        type: "PushReceivedData",
                        id: 1
                      }
                    }
                  }
                }
              },
              ListMemberDevices: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      conversationPk: {
                        type: "string",
                        id: 1
                      },
                      memberPk: {
                        type: "string",
                        id: 2
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      device: {
                        type: "Device",
                        id: 1
                      }
                    }
                  }
                }
              },
              PushShareTokenForConversation: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      conversationPk: {
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
              PushTokenSharedForConversation: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      conversationPk: {
                        type: "string",
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      token: {
                        type: "PushMemberToken",
                        id: 1
                      }
                    }
                  }
                }
              },
              DirectoryServiceRegister: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      identifier: {
                        type: "string",
                        id: 1
                      },
                      proofIssuer: {
                        type: "string",
                        id: 2
                      },
                      serverAddr: {
                        type: "string",
                        id: 3
                      },
                      expirationDate: {
                        type: "int64",
                        id: 4
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      directoryRecordToken: {
                        type: "string",
                        id: 1
                      }
                    }
                  }
                }
              },
              DirectoryServiceUnregister: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      serverAddr: {
                        type: "string",
                        id: 1
                      },
                      directoryRecordToken: {
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
              DirectoryServiceQuery: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      serverAddr: {
                        type: "string",
                        id: 1
                      },
                      identifiers: {
                        rule: "repeated",
                        type: "string",
                        id: 2
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      directoryIdentifier: {
                        type: "string",
                        id: 1
                      },
                      expiresAt: {
                        type: "int64",
                        id: 2
                      },
                      accountUri: {
                        type: "string",
                        id: 3
                      },
                      verifiedCredential: {
                        type: "bytes",
                        id: 4
                      }
                    }
                  }
                }
              },
              PushServer: {
                fields: {
                  addr: {
                    type: "string",
                    id: 1
                  },
                  key: {
                    type: "bytes",
                    id: 2
                  }
                }
              },
              PushLocalDeviceSharedToken: {
                fields: {
                  tokenId: {
                    type: "string",
                    id: 1,
                    options: {
                      "(tagger.tags)": "gorm:primaryKey"
                    }
                  },
                  conversationPublicKey: {
                    type: "string",
                    id: 2
                  }
                }
              },
              PushMemberToken: {
                fields: {
                  tokenId: {
                    type: "string",
                    id: 1,
                    options: {
                      "(tagger.tags)": "gorm:primaryKey"
                    }
                  },
                  conversationPublicKey: {
                    type: "string",
                    id: 2
                  },
                  devicePk: {
                    type: "string",
                    id: 3
                  },
                  serverAddr: {
                    type: "string",
                    id: 4
                  },
                  serverKey: {
                    type: "bytes",
                    id: 5
                  },
                  token: {
                    type: "bytes",
                    id: 6
                  }
                }
              },
              PushMemberTokenUpdate: {
                fields: {
                  devicePk: {
                    type: "string",
                    id: 1
                  },
                  server: {
                    type: "PushServer",
                    id: 2
                  },
                  token: {
                    type: "bytes",
                    id: 3
                  }
                }
              },
              MemberWithDevices: {
                fields: {
                  memberPk: {
                    type: "string",
                    id: 1
                  },
                  devicesPks: {
                    rule: "repeated",
                    type: "string",
                    id: 2
                  }
                }
              },
              PushSend: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      cid: {
                        type: "bytes",
                        id: 1
                      },
                      groupPk: {
                        type: "string",
                        id: 2
                      },
                      groupMembers: {
                        rule: "repeated",
                        type: "MemberWithDevices",
                        id: 3
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      groupMembers: {
                        rule: "repeated",
                        type: "MemberWithDevices",
                        id: 1
                      }
                    }
                  }
                }
              },
              PushShareToken: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      devicePk: {
                        type: "string",
                        id: 1
                      },
                      groupPk: {
                        type: "string",
                        id: 2
                      },
                      server: {
                        type: "PushServer",
                        id: 3
                      },
                      receiver: {
                        type: "push.v1.PushServiceReceiver",
                        id: 4
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              PushSetServer: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      server: {
                        type: "PushServer",
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              AuthExchangeResponse: {
                fields: {
                  accessToken: {
                    type: "string",
                    id: 1
                  },
                  scope: {
                    type: "string",
                    id: 2
                  },
                  error: {
                    type: "string",
                    id: 3
                  },
                  errorDescription: {
                    type: "string",
                    id: 4
                  },
                  services: {
                    keyType: "string",
                    type: "string",
                    id: 5
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
                    id: 3
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  weshnet: {
    nested: {
      protocol: {
        nested: {
          v1: {
            options: {
              go_package: "berty.tech/weshnet/pkg/protocoltypes"
            },
            nested: {
              ProtocolService: {
                methods: {
                  ServiceExportData: {
                    requestType: "ServiceExportData.Request",
                    responseType: "ServiceExportData.Reply",
                    responseStream: true
                  },
                  ServiceGetConfiguration: {
                    requestType: "ServiceGetConfiguration.Request",
                    responseType: "ServiceGetConfiguration.Reply"
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
                  ShareContact: {
                    requestType: "ShareContact.Request",
                    responseType: "ShareContact.Reply"
                  },
                  DecodeContact: {
                    requestType: "DecodeContact.Request",
                    responseType: "DecodeContact.Reply"
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
                  GroupDeviceStatus: {
                    requestType: "GroupDeviceStatus.Request",
                    responseType: "GroupDeviceStatus.Reply",
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
                  CredentialVerificationServiceInitFlow: {
                    requestType: "CredentialVerificationServiceInitFlow.Request",
                    responseType: "CredentialVerificationServiceInitFlow.Reply"
                  },
                  CredentialVerificationServiceCompleteFlow: {
                    requestType: "CredentialVerificationServiceCompleteFlow.Request",
                    responseType: "CredentialVerificationServiceCompleteFlow.Reply"
                  },
                  VerifiedCredentialsList: {
                    requestType: "VerifiedCredentialsList.Request",
                    responseType: "VerifiedCredentialsList.Reply",
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
                  OutOfStoreReceive: {
                    requestType: "OutOfStoreReceive.Request",
                    responseType: "OutOfStoreReceive.Reply"
                  },
                  OutOfStoreSeal: {
                    requestType: "OutOfStoreSeal.Request",
                    responseType: "OutOfStoreSeal.Reply"
                  },
                  RefreshContactRequest: {
                    requestType: "RefreshContactRequest.Request",
                    responseType: "RefreshContactRequest.Reply"
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
                  EventTypeGroupDeviceChainKeyAdded: 2,
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
                  EventTypeGroupReplicating: 403,
                  EventTypeAccountVerifiedCredentialRegistered: 500,
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
                  linkKey: {
                    type: "bytes",
                    id: 6
                  },
                  linkKeySig: {
                    type: "bytes",
                    id: 7
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
                    id: 3
                  },
                  messagesHeadsCids: {
                    rule: "repeated",
                    type: "bytes",
                    id: 4
                  },
                  linkKey: {
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
                  }
                },
                reserved: [
                  [
                    3,
                    3
                  ]
                ]
              },
              MessageHeaders: {
                fields: {
                  counter: {
                    type: "uint64",
                    id: 1
                  },
                  devicePk: {
                    type: "bytes",
                    id: 2
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
                fields: {},
                reserved: [
                  [
                    1,
                    1
                  ]
                ]
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
                  }
                },
                reserved: [
                  [
                    4,
                    4
                  ]
                ]
              },
              EventContext: {
                fields: {
                  id: {
                    type: "bytes",
                    id: 1
                  },
                  parentIds: {
                    rule: "repeated",
                    type: "bytes",
                    id: 2
                  },
                  groupPk: {
                    type: "bytes",
                    id: 3
                  }
                },
                reserved: [
                  [
                    4,
                    4
                  ]
                ]
              },
              GroupMetadataPayloadSent: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1
                  },
                  message: {
                    type: "bytes",
                    id: 2
                  }
                }
              },
              ContactAliasKeyAdded: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1
                  },
                  aliasPk: {
                    type: "bytes",
                    id: 2
                  }
                }
              },
              GroupMemberDeviceAdded: {
                fields: {
                  memberPk: {
                    type: "bytes",
                    id: 1
                  },
                  devicePk: {
                    type: "bytes",
                    id: 2
                  },
                  memberSig: {
                    type: "bytes",
                    id: 3
                  }
                }
              },
              DeviceChainKey: {
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
              GroupDeviceChainKeyAdded: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1
                  },
                  destMemberPk: {
                    type: "bytes",
                    id: 2
                  },
                  payload: {
                    type: "bytes",
                    id: 3
                  }
                }
              },
              MultiMemberGroupAliasResolverAdded: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1
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
              MultiMemberGroupAdminRoleGranted: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1
                  },
                  granteeMemberPk: {
                    type: "bytes",
                    id: 2
                  }
                }
              },
              MultiMemberGroupInitialMemberAnnounced: {
                fields: {
                  memberPk: {
                    type: "bytes",
                    id: 1
                  }
                }
              },
              GroupAddAdditionalRendezvousSeed: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1
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
                    id: 1
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
                    id: 1
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
                    id: 1
                  },
                  groupPk: {
                    type: "bytes",
                    id: 2
                  }
                }
              },
              AccountContactRequestDisabled: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1
                  }
                }
              },
              AccountContactRequestEnabled: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1
                  }
                }
              },
              AccountContactRequestReferenceReset: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1
                  },
                  publicRendezvousSeed: {
                    type: "bytes",
                    id: 2
                  }
                }
              },
              AccountContactRequestOutgoingEnqueued: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1
                  },
                  groupPk: {
                    type: "bytes",
                    id: 2
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
              AccountContactRequestOutgoingSent: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1
                  },
                  contactPk: {
                    type: "bytes",
                    id: 2
                  }
                }
              },
              AccountContactRequestIncomingReceived: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1
                  },
                  contactPk: {
                    type: "bytes",
                    id: 2
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
              AccountContactRequestIncomingDiscarded: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1
                  },
                  contactPk: {
                    type: "bytes",
                    id: 2
                  }
                }
              },
              AccountContactRequestIncomingAccepted: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1
                  },
                  contactPk: {
                    type: "bytes",
                    id: 2
                  },
                  groupPk: {
                    type: "bytes",
                    id: 3
                  }
                }
              },
              AccountContactBlocked: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1
                  },
                  contactPk: {
                    type: "bytes",
                    id: 2
                  }
                }
              },
              AccountContactUnblocked: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1
                  },
                  contactPk: {
                    type: "bytes",
                    id: 2
                  }
                }
              },
              GroupReplicating: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1
                  },
                  authenticationUrl: {
                    type: "string",
                    id: 2
                  },
                  replicationServer: {
                    type: "string",
                    id: 3
                  }
                }
              },
              ServiceExportData: {
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
              ServiceGetConfiguration: {
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
                        id: 1
                      },
                      devicePk: {
                        type: "bytes",
                        id: 2
                      },
                      accountGroupPk: {
                        type: "bytes",
                        id: 3
                      },
                      peerId: {
                        type: "string",
                        id: 4
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
                        id: 1
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
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              ShareContact: {
                fields: {},
                nested: {
                  Request: {
                    fields: {}
                  },
                  Reply: {
                    fields: {
                      encodedContact: {
                        type: "bytes",
                        id: 1
                      }
                    }
                  }
                }
              },
              DecodeContact: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      encodedContact: {
                        type: "bytes",
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      contact: {
                        type: "ShareableContact",
                        id: 1
                      }
                    }
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
                      contactPk: {
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
              ContactAliasKeySend: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
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
                        id: 1
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
                        id: 1
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
                        id: 1
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
                        id: 1
                      },
                      memberPk: {
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
              MultiMemberGroupInvitationCreate: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      groupPk: {
                        type: "bytes",
                        id: 1
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
                        id: 1
                      },
                      payload: {
                        type: "bytes",
                        id: 2
                      }
                    },
                    reserved: [
                      [
                        3,
                        3
                      ]
                    ]
                  },
                  Reply: {
                    fields: {
                      cid: {
                        type: "bytes",
                        id: 1
                      }
                    }
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
                        id: 1
                      },
                      payload: {
                        type: "bytes",
                        id: 2
                      }
                    },
                    reserved: [
                      [
                        3,
                        3
                      ]
                    ]
                  },
                  Reply: {
                    fields: {
                      cid: {
                        type: "bytes",
                        id: 1
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
                        id: 1
                      },
                      sinceId: {
                        type: "bytes",
                        id: 2
                      },
                      sinceNow: {
                        type: "bool",
                        id: 3
                      },
                      untilId: {
                        type: "bytes",
                        id: 4
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
                        id: 1
                      },
                      sinceId: {
                        type: "bytes",
                        id: 2
                      },
                      sinceNow: {
                        type: "bool",
                        id: 3
                      },
                      untilId: {
                        type: "bytes",
                        id: 4
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
                        id: 1
                      },
                      contactPk: {
                        type: "bytes",
                        id: 2
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
                        id: 2
                      },
                      devicePk: {
                        type: "bytes",
                        id: 3
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
                        id: 1
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
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {}
                  }
                }
              },
              GroupDeviceStatus: {
                fields: {},
                nested: {
                  Type: {
                    values: {
                      TypeUnknown: 0,
                      TypePeerDisconnected: 1,
                      TypePeerConnected: 2,
                      TypePeerReconnecting: 3
                    }
                  },
                  Transport: {
                    values: {
                      TptUnknown: 0,
                      TptLAN: 1,
                      TptWAN: 2,
                      TptProximity: 3
                    }
                  },
                  Request: {
                    fields: {
                      groupPk: {
                        type: "bytes",
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      type: {
                        type: "Type",
                        id: 1
                      },
                      event: {
                        type: "bytes",
                        id: 2
                      }
                    },
                    nested: {
                      PeerConnected: {
                        fields: {
                          peerId: {
                            type: "string",
                            id: 1
                          },
                          devicePk: {
                            type: "bytes",
                            id: 2
                          },
                          transports: {
                            rule: "repeated",
                            type: "Transport",
                            id: 3
                          },
                          maddrs: {
                            rule: "repeated",
                            type: "string",
                            id: 4
                          }
                        }
                      },
                      PeerReconnecting: {
                        fields: {
                          peerId: {
                            type: "string",
                            id: 1
                          }
                        }
                      },
                      PeerDisconnected: {
                        fields: {
                          peerId: {
                            type: "string",
                            id: 1
                          }
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
                        id: 1
                      },
                      groupType: {
                        type: "GroupType",
                        id: 2
                      },
                      contactPk: {
                        type: "bytes",
                        id: 3
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
                        id: 1
                      },
                      logType: {
                        type: "DebugInspectGroupLogType",
                        id: 2
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      cid: {
                        type: "bytes",
                        id: 1
                      },
                      parentCids: {
                        rule: "repeated",
                        type: "bytes",
                        id: 2
                      },
                      metadataEventType: {
                        type: "EventType",
                        id: 3
                      },
                      devicePk: {
                        type: "bytes",
                        id: 4
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
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      peerIds: {
                        rule: "repeated",
                        type: "string",
                        id: 1
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
                    id: 1
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
                    id: 2
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
              CredentialVerificationServiceInitFlow: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      serviceUrl: {
                        type: "string",
                        id: 1
                      },
                      publicKey: {
                        type: "bytes",
                        id: 2
                      },
                      link: {
                        type: "string",
                        id: 3
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      url: {
                        type: "string",
                        id: 1
                      },
                      secureUrl: {
                        type: "bool",
                        id: 2
                      }
                    }
                  }
                }
              },
              CredentialVerificationServiceCompleteFlow: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      callbackUri: {
                        type: "string",
                        id: 1
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      identifier: {
                        type: "string",
                        id: 1
                      }
                    }
                  }
                }
              },
              VerifiedCredentialsList: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      filterIdentifier: {
                        type: "string",
                        id: 1
                      },
                      filterIssuer: {
                        type: "string",
                        id: 2
                      },
                      excludeExpired: {
                        type: "bool",
                        id: 3
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      credential: {
                        type: "AccountVerifiedCredentialRegistered",
                        id: 1
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
                      groupPk: {
                        type: "bytes",
                        id: 1
                      },
                      token: {
                        type: "string",
                        id: 2
                      },
                      authenticationUrl: {
                        type: "string",
                        id: 3
                      },
                      replicationServer: {
                        type: "string",
                        id: 4
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
                        id: 1
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
                        id: 2
                      },
                      orbitdb: {
                        type: "OrbitDB",
                        id: 3
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
                        id: 3
                      },
                      userCpuTimeMs: {
                        type: "int64",
                        id: 10
                      },
                      systemCpuTimeMs: {
                        type: "int64",
                        id: 11
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
                        id: 17
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
                        id: 23
                      },
                      ppid: {
                        type: "int64",
                        id: 24
                      },
                      priority: {
                        type: "int64",
                        id: 25
                      },
                      uid: {
                        type: "int64",
                        id: 26
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
                        id: 1
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
                        id: 1
                      }
                    }
                  },
                  Feature: {
                    values: {
                      UnknownFeature: 0,
                      WeshFeature: 1,
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
              },
              OutOfStoreMessage: {
                fields: {
                  cid: {
                    type: "bytes",
                    id: 1
                  },
                  devicePk: {
                    type: "bytes",
                    id: 2
                  },
                  counter: {
                    type: "fixed64",
                    id: 3
                  },
                  sig: {
                    type: "bytes",
                    id: 4
                  },
                  flags: {
                    type: "fixed32",
                    id: 5
                  },
                  encryptedPayload: {
                    type: "bytes",
                    id: 6
                  },
                  nonce: {
                    type: "bytes",
                    id: 7
                  }
                }
              },
              OutOfStoreMessageEnvelope: {
                fields: {
                  nonce: {
                    type: "bytes",
                    id: 1
                  },
                  box: {
                    type: "bytes",
                    id: 2
                  },
                  groupReference: {
                    type: "bytes",
                    id: 3
                  }
                }
              },
              OutOfStoreReceive: {
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
                    fields: {
                      message: {
                        type: "OutOfStoreMessage",
                        id: 1
                      },
                      cleartext: {
                        type: "bytes",
                        id: 2
                      },
                      groupPublicKey: {
                        type: "bytes",
                        id: 3
                      },
                      alreadyReceived: {
                        type: "bool",
                        id: 4
                      }
                    }
                  }
                }
              },
              OutOfStoreSeal: {
                fields: {},
                nested: {
                  Request: {
                    fields: {
                      cid: {
                        type: "bytes",
                        id: 1
                      },
                      groupPublicKey: {
                        type: "bytes",
                        id: 2
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      encrypted: {
                        type: "bytes",
                        id: 1
                      }
                    }
                  }
                }
              },
              AccountVerifiedCredentialRegistered: {
                fields: {
                  devicePk: {
                    type: "bytes",
                    id: 1
                  },
                  signedIdentityPublicKey: {
                    type: "bytes",
                    id: 2
                  },
                  verifiedCredential: {
                    type: "string",
                    id: 3
                  },
                  registrationDate: {
                    type: "int64",
                    id: 4
                  },
                  expirationDate: {
                    type: "int64",
                    id: 5
                  },
                  identifier: {
                    type: "string",
                    id: 6
                  },
                  issuer: {
                    type: "string",
                    id: 7
                  }
                }
              },
              FirstLastCounters: {
                fields: {
                  first: {
                    type: "uint64",
                    id: 1
                  },
                  last: {
                    type: "uint64",
                    id: 2
                  }
                }
              },
              OrbitDBMessageHeads: {
                fields: {
                  sealedBox: {
                    type: "bytes",
                    id: 2
                  },
                  rawRotation: {
                    type: "bytes",
                    id: 3
                  }
                },
                nested: {
                  Box: {
                    fields: {
                      address: {
                        type: "string",
                        id: 1
                      },
                      heads: {
                        type: "bytes",
                        id: 2
                      },
                      devicePk: {
                        type: "bytes",
                        id: 3
                      },
                      peerId: {
                        type: "bytes",
                        id: 4
                      }
                    }
                  }
                }
              },
              RefreshContactRequest: {
                fields: {},
                nested: {
                  Peer: {
                    fields: {
                      id: {
                        type: "string",
                        id: 1
                      },
                      addrs: {
                        rule: "repeated",
                        type: "string",
                        id: 2
                      }
                    }
                  },
                  Request: {
                    fields: {
                      contactPk: {
                        type: "bytes",
                        id: 1
                      },
                      timeout: {
                        type: "int64",
                        id: 2
                      }
                    }
                  },
                  Reply: {
                    fields: {
                      peersFound: {
                        rule: "repeated",
                        type: "Peer",
                        id: 1
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      errcode: {
        options: {
          go_package: "berty.tech/weshnet/pkg/errcode"
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
              ErrDBOpen: 124,
              ErrDBClose: 125,
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
              ErrGroupUnknown: 1310,
              ErrGroupOpen: 1311,
              ErrMessageKeyPersistencePut: 1500,
              ErrMessageKeyPersistenceGet: 1501,
              ErrServiceReplication: 4100,
              ErrServiceReplicationServer: 4101,
              ErrServiceReplicationMissingEndpoint: 4102,
              ErrServicesDirectory: 4200,
              ErrServicesDirectoryInvalidVerifiedCredentialSubject: 4201,
              ErrServicesDirectoryExistingRecordNotFound: 4202,
              ErrServicesDirectoryRecordLockedAndCantBeReplaced: 4203,
              ErrServicesDirectoryExplicitReplaceFlagRequired: 4204,
              ErrServicesDirectoryInvalidVerifiedCredential: 4205,
              ErrServicesDirectoryExpiredVerifiedCredential: 4206,
              ErrServicesDirectoryInvalidVerifiedCredentialID: 4207
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
      }
    }
  }
});

export { $root as default };
