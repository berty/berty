/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/light";

const $root = ($protobuf.roots["default"] || ($protobuf.roots["default"] = new $protobuf.Root()))
.addJSON({
  berty: {
    nested: {
      chat: {
        nested: {
          ChatService: {
            methods: {
              Search: {
                requestType: "Search.Request",
                responseType: "Search.Reply",
                responseStream: true
              },
              EventSubscribe: {
                requestType: "EventSubscribe.Request",
                responseType: "EventSubscribe.Reply",
                responseStream: true
              },
              DevEventSubscribe: {
                requestType: "DevEventSubscribe.Request",
                responseType: "DevEventSubscribe.Reply",
                responseStream: true
              },
              ConversationList: {
                requestType: "ConversationList.Request",
                responseType: "ConversationList.Reply",
                responseStream: true
              },
              ConversationGet: {
                requestType: "ConversationGet.Request",
                responseType: "ConversationGet.Reply"
              },
              ConversationCreate: {
                requestType: "ConversationCreate.Request",
                responseType: "ConversationCreate.Reply"
              },
              ConversationUpdate: {
                requestType: "ConversationUpdate.Request",
                responseType: "ConversationUpdate.Reply"
              },
              ConversationMute: {
                requestType: "ConversationMute.Request",
                responseType: "ConversationMute.Reply"
              },
              ConversationLeave: {
                requestType: "ConversationLeave.Request",
                responseType: "ConversationLeave.Reply"
              },
              ConversationErase: {
                requestType: "ConversationErase.Request",
                responseType: "ConversationErase.Reply"
              },
              ConversationInvitationSend: {
                requestType: "ConversationInvitationSend.Request",
                responseType: "ConversationInvitationSend.Reply"
              },
              ConversationInvitationAccept: {
                requestType: "ConversationInvitationAccept.Request",
                responseType: "ConversationInvitationAccept.Reply"
              },
              ConversationInvitationDecline: {
                requestType: "ConversationInvitationDecline.Request",
                responseType: "ConversationInvitationDecline.Reply"
              },
              MessageList: {
                requestType: "MessageList.Request",
                responseType: "MessageList.Reply",
                responseStream: true
              },
              MessageGet: {
                requestType: "MessageGet.Request",
                responseType: "MessageGet.Reply"
              },
              MessageSend: {
                requestType: "MessageSend.Request",
                responseType: "MessageSend.Reply"
              },
              MessageEdit: {
                requestType: "MessageEdit.Request",
                responseType: "MessageEdit.Reply"
              },
              MessageHide: {
                requestType: "MessageHide.Request",
                responseType: "MessageHide.Reply"
              },
              MessageReact: {
                requestType: "MessageReact.Request",
                responseType: "MessageReact.Reply"
              },
              MessageRead: {
                requestType: "MessageRead.Request",
                responseType: "MessageRead.Reply"
              },
              MemberList: {
                requestType: "MemberList.Request",
                responseType: "MemberList.Reply",
                responseStream: true
              },
              MemberGet: {
                requestType: "MemberGet.Request",
                responseType: "MemberGet.Reply"
              },
              ContactList: {
                requestType: "ContactList.Request",
                responseType: "ContactList.Reply",
                responseStream: true
              },
              ContactGet: {
                requestType: "ContactGet.Request",
                responseType: "ContactGet.Reply"
              },
              ContactBlock: {
                requestType: "ContactBlock.Request",
                responseType: "ContactBlock.Reply"
              },
              ContactRemove: {
                requestType: "ContactRemove.Request",
                responseType: "ContactRemove.Reply"
              },
              ContactRequestSend: {
                requestType: "ContactRequestSend.Request",
                responseType: "ContactRequestSend.Reply"
              },
              ContactRequestAccept: {
                requestType: "ContactRequestAccept.Request",
                responseType: "ContactRequestAccept.Reply"
              },
              ContactRequestDecline: {
                requestType: "ContactRequestDecline.Request",
                responseType: "ContactRequestDecline.Reply"
              },
              AccountList: {
                requestType: "AccountList.Request",
                responseType: "AccountList.Reply",
                responseStream: true
              },
              AccountGet: {
                requestType: "AccountGet.Request",
                responseType: "AccountGet.Reply"
              },
              AccountCreate: {
                requestType: "AccountCreate.Request",
                responseType: "AccountCreate.Reply"
              },
              AccountUpdate: {
                requestType: "AccountUpdate.Request",
                responseType: "AccountUpdate.Reply"
              },
              AccountOpen: {
                requestType: "AccountOpen.Request",
                responseType: "AccountOpen.Reply"
              },
              AccountClose: {
                requestType: "AccountClose.Request",
                responseType: "AccountClose.Reply"
              },
              AccountRemove: {
                requestType: "AccountRemove.Request",
                responseType: "AccountRemove.Reply"
              },
              AccountPairingInvitationCreate: {
                requestType: "AccountPairingInvitationCreate.Request",
                responseType: "AccountPairingInvitationCreate.Reply"
              },
              AccountRenewIncomingContactRequestLink: {
                requestType: "AccountRenewIncomingContactRequestLink.Request",
                responseType: "AccountRenewIncomingContactRequestLink.Reply"
              }
            }
          },
          Search: {
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
          EventSubscribe: {
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
          DevEventSubscribe: {
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
          ConversationList: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  filter: {
                    type: "chatmodel.Conversation",
                    id: 1
                  },
                  not: {
                    type: "chatmodel.Conversation",
                    id: 2
                  }
                }
              },
              Reply: {
                fields: {
                  conversation: {
                    type: "chatmodel.Conversation",
                    id: 1
                  }
                }
              }
            }
          },
          ConversationGet: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  }
                }
              },
              Reply: {
                fields: {
                  conversation: {
                    type: "chatmodel.Conversation",
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
                  title: {
                    type: "string",
                    id: 1
                  },
                  topic: {
                    type: "string",
                    id: 2
                  },
                  avatarUri: {
                    type: "string",
                    id: 3,
                    options: {
                      "(gogoproto.customname)": "AvatarURI"
                    }
                  }
                }
              },
              Reply: {
                fields: {
                  conversation: {
                    type: "chatmodel.Conversation",
                    id: 1
                  }
                }
              }
            }
          },
          ConversationUpdate: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  },
                  title: {
                    type: "string",
                    id: 2
                  },
                  topic: {
                    type: "string",
                    id: 3
                  },
                  avatarUri: {
                    type: "string",
                    id: 4,
                    options: {
                      "(gogoproto.customname)": "AvatarURI"
                    }
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
                  policy: {
                    type: "chatmodel.Member.MutePolicy",
                    id: 1
                  }
                }
              },
              Reply: {
                fields: {}
              }
            }
          },
          ConversationLeave: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  }
                }
              },
              Reply: {
                fields: {}
              }
            }
          },
          ConversationErase: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  }
                }
              },
              Reply: {
                fields: {}
              }
            }
          },
          ConversationInvitationSend: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  },
                  contactId: {
                    type: "uint64",
                    id: 2,
                    options: {
                      "(gogoproto.customname)": "ContactID"
                    }
                  }
                }
              },
              Reply: {
                fields: {}
              }
            }
          },
          ConversationInvitationAccept: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  },
                  contactId: {
                    type: "uint64",
                    id: 2,
                    options: {
                      "(gogoproto.customname)": "ContactID"
                    }
                  }
                }
              },
              Reply: {
                fields: {}
              }
            }
          },
          ConversationInvitationDecline: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  conversationId: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ConversationID"
                    }
                  }
                }
              },
              Reply: {
                fields: {}
              }
            }
          },
          MessageList: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  filter: {
                    type: "chatmodel.Message",
                    id: 1
                  },
                  not: {
                    type: "chatmodel.Message",
                    id: 2
                  }
                }
              },
              Reply: {
                fields: {
                  message: {
                    type: "chatmodel.Message",
                    id: 1
                  }
                }
              }
            }
          },
          MessageGet: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  }
                }
              },
              Reply: {
                fields: {
                  message: {
                    type: "chatmodel.Message",
                    id: 1
                  }
                }
              }
            }
          },
          MessageSend: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  conversationId: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ConversationID"
                    }
                  },
                  kind: {
                    type: "chatmodel.Message.Kind",
                    id: 2
                  },
                  body: {
                    type: "chatmodel.Message.Body",
                    id: 3
                  },
                  attachments: {
                    rule: "repeated",
                    type: "chatmodel.Attachment",
                    id: 4
                  }
                }
              },
              Reply: {
                fields: {}
              }
            }
          },
          MessageEdit: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  },
                  body: {
                    type: "chatmodel.Message.Body",
                    id: 2
                  }
                }
              },
              Reply: {
                fields: {}
              }
            }
          },
          MessageHide: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  }
                }
              },
              Reply: {
                fields: {}
              }
            }
          },
          MessageReact: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  },
                  emoji: {
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
          MessageRead: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  }
                }
              },
              Reply: {
                fields: {}
              }
            }
          },
          MemberList: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  filter: {
                    type: "chatmodel.Member",
                    id: 1
                  },
                  not: {
                    type: "chatmodel.Member",
                    id: 2
                  }
                }
              },
              Reply: {
                fields: {
                  member: {
                    type: "chatmodel.Member",
                    id: 1
                  }
                }
              }
            }
          },
          MemberGet: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  }
                }
              },
              Reply: {
                fields: {
                  member: {
                    type: "chatmodel.Member",
                    id: 1
                  }
                }
              }
            }
          },
          ContactList: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  filter: {
                    type: "chatmodel.Contact",
                    id: 1
                  },
                  not: {
                    type: "chatmodel.Contact",
                    id: 2
                  }
                }
              },
              Reply: {
                fields: {
                  contact: {
                    type: "chatmodel.Contact",
                    id: 1
                  }
                }
              }
            }
          },
          ContactGet: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  }
                }
              },
              Reply: {
                fields: {
                  contact: {
                    type: "chatmodel.Contact",
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
                fields: {}
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
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  }
                }
              },
              Reply: {
                fields: {}
              }
            }
          },
          ContactRequestSend: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
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
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  }
                }
              },
              Reply: {
                fields: {}
              }
            }
          },
          ContactRequestDecline: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  }
                }
              },
              Reply: {
                fields: {}
              }
            }
          },
          AccountList: {
            fields: {},
            nested: {
              Request: {
                fields: {}
              },
              Reply: {
                fields: {
                  account: {
                    type: "chatmodel.Account",
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
                fields: {
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  }
                }
              },
              Reply: {
                fields: {
                  account: {
                    type: "chatmodel.Account",
                    id: 1
                  }
                }
              }
            }
          },
          AccountCreate: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  name: {
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
          AccountUpdate: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  },
                  name: {
                    type: "string",
                    id: 2
                  },
                  statusEmoji: {
                    type: "string",
                    id: 3
                  },
                  statusText: {
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
          AccountOpen: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  },
                  pin: {
                    type: "string",
                    id: 2
                  }
                }
              },
              Reply: {
                fields: {
                  token: {
                    type: "bytes",
                    id: 1
                  }
                }
              }
            }
          },
          AccountClose: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  }
                }
              },
              Reply: {
                fields: {}
              }
            }
          },
          AccountRemove: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  }
                }
              },
              Reply: {
                fields: {}
              }
            }
          },
          AccountPairingInvitationCreate: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  }
                }
              },
              Reply: {
                fields: {}
              }
            }
          },
          AccountRenewIncomingContactRequestLink: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  id: {
                    type: "uint64",
                    id: 1,
                    options: {
                      "(gogoproto.customname)": "ID"
                    }
                  }
                }
              },
              Reply: {
                fields: {}
              }
            }
          }
        }
      },
      chatmodel: {
        nested: {
          Contact: {
            fields: {
              id: {
                type: "uint64",
                id: 1,
                options: {
                  "(gogoproto.moretags)": "gorm:primary_key;auto_increment",
                  "(gogoproto.customname)": "ID"
                }
              },
              protocolId: {
                type: "string",
                id: 2,
                options: {
                  "(gogoproto.moretags)": "gorm:unique",
                  "(gogoproto.customname)": "ProtocolID"
                }
              },
              createdAt: {
                type: "google.protobuf.Timestamp",
                id: 3,
                options: {
                  "(gogoproto.stdtime)": true,
                  "(gogoproto.nullable)": false
                }
              },
              updatedAt: {
                type: "google.protobuf.Timestamp",
                id: 4,
                options: {
                  "(gogoproto.stdtime)": true,
                  "(gogoproto.nullable)": false
                }
              },
              seenAt: {
                type: "google.protobuf.Timestamp",
                id: 5,
                options: {
                  "(gogoproto.stdtime)": true,
                  "(gogoproto.nullable)": true
                }
              },
              name: {
                type: "string",
                id: 100
              },
              avatarUri: {
                type: "string",
                id: 101,
                options: {
                  "(gogoproto.customname)": "AvatarURI"
                }
              },
              statusEmoji: {
                type: "bytes",
                id: 102
              },
              statusText: {
                type: "string",
                id: 103
              },
              kind: {
                type: "Kind",
                id: 104
              },
              blocked: {
                type: "bool",
                id: 105
              },
              devices: {
                rule: "repeated",
                type: "Device",
                id: 200,
                options: {
                  "(gogoproto.moretags)": "gorm:PRELOAD:false"
                }
              }
            },
            nested: {
              Kind: {
                values: {
                  Unknown: 0,
                  PendingInc: 1,
                  PendingOut: 2,
                  Friend: 3,
                  Trusted: 4,
                  Myself: 42
                }
              }
            }
          },
          Device: {
            fields: {
              id: {
                type: "uint64",
                id: 1,
                options: {
                  "(gogoproto.moretags)": "gorm:primary_key;auto_increment",
                  "(gogoproto.customname)": "ID"
                }
              },
              protocolId: {
                type: "string",
                id: 2,
                options: {
                  "(gogoproto.moretags)": "gorm:unique",
                  "(gogoproto.customname)": "ProtocolID"
                }
              },
              createdAt: {
                type: "google.protobuf.Timestamp",
                id: 3,
                options: {
                  "(gogoproto.stdtime)": true,
                  "(gogoproto.nullable)": false
                }
              },
              updatedAt: {
                type: "google.protobuf.Timestamp",
                id: 4,
                options: {
                  "(gogoproto.stdtime)": true,
                  "(gogoproto.nullable)": false
                }
              },
              lastSeenAt: {
                type: "google.protobuf.Timestamp",
                id: 5,
                options: {
                  "(gogoproto.stdtime)": true,
                  "(gogoproto.nullable)": true
                }
              },
              kind: {
                type: "Kind",
                id: 100
              },
              canRelay: {
                type: "bool",
                id: 101
              },
              canBle: {
                type: "bool",
                id: 102
              },
              contactId: {
                type: "uint64",
                id: 200,
                options: {
                  "(gogoproto.customname)": "ContactID",
                  "(gogoproto.moretags)": "gorm:not null;index"
                }
              },
              contact: {
                type: "Contact",
                id: 201,
                options: {
                  "(gogoproto.moretags)": "gorm:PRELOAD:false"
                }
              }
            },
            nested: {
              Kind: {
                values: {
                  Unknown: 0,
                  Phone: 1,
                  Desktop: 2,
                  Laptop: 3
                }
              }
            }
          },
          Conversation: {
            fields: {
              id: {
                type: "uint64",
                id: 1,
                options: {
                  "(gogoproto.moretags)": "gorm:primary_key;auto_increment",
                  "(gogoproto.customname)": "ID"
                }
              },
              protocolId: {
                type: "string",
                id: 2,
                options: {
                  "(gogoproto.moretags)": "gorm:unique",
                  "(gogoproto.customname)": "ProtocolID"
                }
              },
              createdAt: {
                type: "google.protobuf.Timestamp",
                id: 3,
                options: {
                  "(gogoproto.stdtime)": true,
                  "(gogoproto.nullable)": false
                }
              },
              updatedAt: {
                type: "google.protobuf.Timestamp",
                id: 4,
                options: {
                  "(gogoproto.stdtime)": true,
                  "(gogoproto.nullable)": false
                }
              },
              title: {
                type: "string",
                id: 100
              },
              topic: {
                type: "string",
                id: 101
              },
              avatarUri: {
                type: "string",
                id: 102,
                options: {
                  "(gogoproto.customname)": "AvatarURI"
                }
              },
              kind: {
                type: "Kind",
                id: 103
              },
              badge: {
                type: "uint32",
                id: 105
              },
              messages: {
                rule: "repeated",
                type: "Message",
                id: 200,
                options: {
                  "(gogoproto.moretags)": "gorm:PRELOAD:false"
                }
              },
              members: {
                rule: "repeated",
                type: "Member",
                id: 201,
                options: {
                  "(gogoproto.moretags)": "gorm:PRELOAD:false"
                }
              },
              lastMessageId: {
                type: "uint64",
                id: 202
              },
              lastMessage: {
                type: "Message",
                id: 203,
                options: {
                  "(gogoproto.moretags)": "gorm:PRELOAD:false"
                }
              }
            },
            nested: {
              Kind: {
                values: {
                  Unknown: 0,
                  Self: 1,
                  OneToOne: 2,
                  PrivateGroup: 3
                }
              }
            }
          },
          Member: {
            fields: {
              id: {
                type: "uint64",
                id: 1,
                options: {
                  "(gogoproto.moretags)": "gorm:primary_key;auto_increment",
                  "(gogoproto.customname)": "ID"
                }
              },
              protocolId: {
                type: "string",
                id: 2,
                options: {
                  "(gogoproto.moretags)": "gorm:unique",
                  "(gogoproto.customname)": "ProtocolID"
                }
              },
              createdAt: {
                type: "google.protobuf.Timestamp",
                id: 3,
                options: {
                  "(gogoproto.stdtime)": true,
                  "(gogoproto.nullable)": false
                }
              },
              updatedAt: {
                type: "google.protobuf.Timestamp",
                id: 4,
                options: {
                  "(gogoproto.stdtime)": true,
                  "(gogoproto.nullable)": false
                }
              },
              readAt: {
                type: "google.protobuf.Timestamp",
                id: 5,
                options: {
                  "(gogoproto.stdtime)": true,
                  "(gogoproto.nullable)": false
                }
              },
              name: {
                type: "string",
                id: 100
              },
              avatarUri: {
                type: "string",
                id: 101,
                options: {
                  "(gogoproto.customname)": "AvatarURI"
                }
              },
              role: {
                type: "Role",
                id: 102
              },
              mutePolicy: {
                type: "MutePolicy",
                id: 103
              },
              conversationId: {
                type: "uint64",
                id: 200,
                options: {
                  "(gogoproto.customname)": "ConversationID",
                  "(gogoproto.moretags)": "gorm:not null;index"
                }
              },
              conversation: {
                type: "Conversation",
                id: 201,
                options: {
                  "(gogoproto.moretags)": "gorm:PRELOAD:false"
                }
              },
              contactId: {
                type: "uint64",
                id: 202,
                options: {
                  "(gogoproto.customname)": "ContactID",
                  "(gogoproto.moretags)": "gorm:not null;index"
                }
              },
              contact: {
                type: "Contact",
                id: 203,
                options: {
                  "(gogoproto.moretags)": "gorm:PRELOAD:false"
                }
              }
            },
            nested: {
              Role: {
                values: {
                  Unknown: 0,
                  Invited: 1,
                  Regular: 2,
                  Admin: 3,
                  Owner: 4
                }
              },
              MutePolicy: {
                values: {
                  Nothing: 0,
                  All: 1,
                  Notifications: 2
                }
              }
            }
          },
          Message: {
            fields: {
              id: {
                type: "uint64",
                id: 1,
                options: {
                  "(gogoproto.moretags)": "gorm:primary_key;auto_increment",
                  "(gogoproto.customname)": "ID"
                }
              },
              protocolId: {
                type: "string",
                id: 2,
                options: {
                  "(gogoproto.moretags)": "gorm:unique",
                  "(gogoproto.customname)": "ProtocolID"
                }
              },
              createdAt: {
                type: "google.protobuf.Timestamp",
                id: 3,
                options: {
                  "(gogoproto.stdtime)": true,
                  "(gogoproto.nullable)": false
                }
              },
              updatedAt: {
                type: "google.protobuf.Timestamp",
                id: 4,
                options: {
                  "(gogoproto.stdtime)": true,
                  "(gogoproto.nullable)": false
                }
              },
              sentAt: {
                type: "google.protobuf.Timestamp",
                id: 6,
                options: {
                  "(gogoproto.stdtime)": true,
                  "(gogoproto.nullable)": false
                }
              },
              editedAt: {
                type: "google.protobuf.Timestamp",
                id: 7,
                options: {
                  "(gogoproto.stdtime)": true,
                  "(gogoproto.nullable)": false
                }
              },
              kind: {
                type: "Kind",
                id: 100
              },
              body: {
                type: "Body",
                id: 101,
                options: {
                  "(gogoproto.moretags)": "gorm:embedded;embedded_prefix:body_"
                }
              },
              hidden: {
                type: "bool",
                id: 103
              },
              state: {
                type: "State",
                id: 104
              },
              conversationId: {
                type: "uint64",
                id: 200,
                options: {
                  "(gogoproto.customname)": "ConversationID",
                  "(gogoproto.moretags)": "gorm:not null;index"
                }
              },
              conversation: {
                type: "Conversation",
                id: 201,
                options: {
                  "(gogoproto.moretags)": "gorm:PRELOAD:false"
                }
              },
              memberId: {
                type: "uint64",
                id: 202,
                options: {
                  "(gogoproto.customname)": "MemberID",
                  "(gogoproto.moretags)": "gorm:not null;index"
                }
              },
              member: {
                type: "Member",
                id: 203,
                options: {
                  "(gogoproto.moretags)": "gorm:PRELOAD:false"
                }
              },
              attachments: {
                rule: "repeated",
                type: "Attachment",
                id: 204,
                options: {
                  "(gogoproto.moretags)": "gorm:PRELOAD:false"
                }
              },
              reactions: {
                rule: "repeated",
                type: "Reaction",
                id: 205,
                options: {
                  "(gogoproto.moretags)": "gorm:PRELOAD:false"
                }
              }
            },
            nested: {
              Kind: {
                values: {
                  Unknown: 0,
                  Text: 1,
                  MemberJoined: 2,
                  MemberLeave: 3,
                  MemberSetTitleTo: 4
                }
              },
              Body: {
                fields: {
                  text: {
                    type: "string",
                    id: 1
                  },
                  memberJoined: {
                    type: "uint64",
                    id: 2
                  },
                  memberLeft: {
                    type: "uint64",
                    id: 3
                  },
                  memberSetTitleTo: {
                    type: "string",
                    id: 4
                  }
                }
              },
              State: {
                values: {
                  Unsent: 0,
                  Sending: 1,
                  Failed: 2,
                  Retrying: 3,
                  Sent: 4
                }
              }
            }
          },
          Attachment: {
            fields: {
              id: {
                type: "uint64",
                id: 1,
                options: {
                  "(gogoproto.moretags)": "gorm:primary_key;auto_increment",
                  "(gogoproto.customname)": "ID"
                }
              },
              createdAt: {
                type: "google.protobuf.Timestamp",
                id: 3,
                options: {
                  "(gogoproto.stdtime)": true,
                  "(gogoproto.nullable)": false
                }
              },
              updatedAt: {
                type: "google.protobuf.Timestamp",
                id: 4,
                options: {
                  "(gogoproto.stdtime)": true,
                  "(gogoproto.nullable)": false
                }
              },
              uri: {
                type: "string",
                id: 100
              },
              contentType: {
                type: "string",
                id: 101
              },
              messageId: {
                type: "uint64",
                id: 200,
                options: {
                  "(gogoproto.customname)": "MessageID",
                  "(gogoproto.moretags)": "gorm:not null;index"
                }
              },
              message: {
                type: "Message",
                id: 201,
                options: {
                  "(gogoproto.moretags)": "gorm:PRELOAD:false"
                }
              }
            }
          },
          Reaction: {
            fields: {
              id: {
                type: "uint64",
                id: 1,
                options: {
                  "(gogoproto.moretags)": "gorm:primary_key;auto_increment",
                  "(gogoproto.customname)": "ID"
                }
              },
              createdAt: {
                type: "google.protobuf.Timestamp",
                id: 3,
                options: {
                  "(gogoproto.stdtime)": true,
                  "(gogoproto.nullable)": false
                }
              },
              updatedAt: {
                type: "google.protobuf.Timestamp",
                id: 4,
                options: {
                  "(gogoproto.stdtime)": true,
                  "(gogoproto.nullable)": false
                }
              },
              emoji: {
                type: "bytes",
                id: 100
              },
              messageId: {
                type: "uint64",
                id: 200,
                options: {
                  "(gogoproto.customname)": "MessageID",
                  "(gogoproto.moretags)": "gorm:not null;index"
                }
              },
              message: {
                type: "Message",
                id: 201,
                options: {
                  "(gogoproto.moretags)": "gorm:PRELOAD:false"
                }
              },
              memberId: {
                type: "uint64",
                id: 202,
                options: {
                  "(gogoproto.customname)": "MemberID",
                  "(gogoproto.moretags)": "gorm:not null;index"
                }
              },
              member: {
                type: "Member",
                id: 203,
                options: {
                  "(gogoproto.moretags)": "gorm:PRELOAD:false"
                }
              }
            }
          },
          Account: {
            fields: {
              id: {
                type: "uint64",
                id: 1,
                options: {
                  "(gogoproto.moretags)": "gorm:primary_key;auto_increment",
                  "(gogoproto.customname)": "ID"
                }
              },
              createdAt: {
                type: "google.protobuf.Timestamp",
                id: 3,
                options: {
                  "(gogoproto.stdtime)": true,
                  "(gogoproto.nullable)": false
                }
              },
              updatedAt: {
                type: "google.protobuf.Timestamp",
                id: 4,
                options: {
                  "(gogoproto.stdtime)": true,
                  "(gogoproto.nullable)": false
                }
              },
              contactId: {
                type: "uint64",
                id: 100,
                options: {
                  "(gogoproto.customname)": "ContactID",
                  "(gogoproto.moretags)": "gorm:not null;index"
                }
              },
              contact: {
                type: "chatmodel.Contact",
                id: 101
              },
              contactRequestsEnabled: {
                type: "bool",
                id: 102
              },
              contactRequestsLink: {
                type: "string",
                id: 103
              },
              hidden: {
                type: "bool",
                id: 104
              },
              locked: {
                type: "bool",
                id: 105
              }
            }
          }
        }
      },
      protocol: {
        options: {
          go_package: "berty.tech/berty/go/pkg/bertyprotocol"
        },
        nested: {
          DemoService: {
            methods: {
              LogToken: {
                requestType: "LogToken.Request",
                responseType: "LogToken.Reply"
              },
              LogAdd: {
                requestType: "LogAdd.Request",
                responseType: "LogAdd.Reply"
              },
              LogGet: {
                requestType: "LogGet.Request",
                responseType: "LogGet.Reply"
              },
              LogList: {
                requestType: "LogList.Request",
                responseType: "LogList.Reply"
              },
              LogStream: {
                requestType: "LogStream.Request",
                responseType: "LogOperation",
                responseStream: true
              }
            }
          },
          LogOperation: {
            fields: {
              name: {
                type: "string",
                id: 1
              },
              value: {
                type: "bytes",
                id: 2
              },
              cid: {
                type: "string",
                id: 3
              }
            }
          },
          LogStreamOptions: {
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
          LogToken: {
            fields: {},
            nested: {
              Request: {
                fields: {}
              },
              Reply: {
                fields: {
                  logToken: {
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
                  logToken: {
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
                fields: {
                  cid: {
                    type: "string",
                    id: 1
                  }
                }
              }
            }
          },
          LogGet: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  logToken: {
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
                  operation: {
                    type: "LogOperation",
                    id: 1
                  }
                }
              }
            }
          },
          LogList: {
            fields: {},
            nested: {
              Request: {
                fields: {
                  logToken: {
                    type: "string",
                    id: 1
                  },
                  options: {
                    type: "LogStreamOptions",
                    id: 2
                  }
                }
              },
              Reply: {
                fields: {
                  operations: {
                    rule: "repeated",
                    type: "LogOperation",
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
                  logToken: {
                    type: "string",
                    id: 1
                  },
                  options: {
                    type: "LogStreamOptions",
                    id: 2
                  }
                }
              }
            }
          },
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
      }
    }
  },
  google: {
    nested: {
      api: {
        options: {
          java_multiple_files: true,
          java_outer_classname: "HttpProto",
          java_package: "com.google.api",
          objc_class_prefix: "GAPI",
          cc_enable_arenas: true
        },
        nested: {
          http: {
            type: "HttpRule",
            id: 72295728,
            extend: "google.protobuf.MethodOptions"
          },
          Http: {
            fields: {
              rules: {
                rule: "repeated",
                type: "HttpRule",
                id: 1
              }
            }
          },
          HttpRule: {
            oneofs: {
              pattern: {
                oneof: [
                  "get",
                  "put",
                  "post",
                  "delete",
                  "patch",
                  "custom"
                ]
              }
            },
            fields: {
              selector: {
                type: "string",
                id: 1
              },
              get: {
                type: "string",
                id: 2
              },
              put: {
                type: "string",
                id: 3
              },
              post: {
                type: "string",
                id: 4
              },
              "delete": {
                type: "string",
                id: 5
              },
              patch: {
                type: "string",
                id: 6
              },
              custom: {
                type: "CustomHttpPattern",
                id: 8
              },
              body: {
                type: "string",
                id: 7
              },
              additionalBindings: {
                rule: "repeated",
                type: "HttpRule",
                id: 11
              }
            }
          },
          CustomHttpPattern: {
            fields: {
              kind: {
                type: "string",
                id: 1
              },
              path: {
                type: "string",
                id: 2
              }
            }
          }
        }
      },
      protobuf: {
        options: {
          go_package: "github.com/golang/protobuf/ptypes/timestamp",
          java_package: "com.google.protobuf",
          java_outer_classname: "TimestampProto",
          csharp_namespace: "Google.Protobuf.WellKnownTypes",
          objc_class_prefix: "GPB",
          cc_enable_arenas: true,
          optimize_for: "SPEED",
          java_multiple_files: true
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
          },
          Timestamp: {
            fields: {
              seconds: {
                type: "int64",
                id: 1
              },
              nanos: {
                type: "int32",
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
  }
});

export { $root as default };
