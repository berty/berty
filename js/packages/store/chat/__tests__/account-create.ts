/*jest style test */

import * as chat from '..'
const { reducer } = chat.init()

var equality = function equality(result, nextState) {
      return JSON.stringify(result) === JSON.stringify(nextState);
    };
var actions = [
  {
    "action": {
      "type": "chat/account/command/create",
      "payload": {
        "name": "Anonymous 1337"
      }
    },
    "prevState": {
      "protocol": {
        "client": {
          "events": [],
          "aggregates": {}
        }
      },
      "chat": {
        "account": {
          "events": [],
          "aggregates": {}
        },
        "request": {
          "events": [],
          "aggregates": {}
        },
        "contact": {
          "events": [],
          "aggregates": {}
        },
        "conversation": {
          "events": [],
          "aggregates": {}
        },
        "member": {
          "events": [],
          "aggregates": {}
        },
        "message": {
          "events": [],
          "aggregates": {}
        }
      }
    },
    "nextState": {
      "protocol": {
        "client": {
          "events": [],
          "aggregates": {}
        }
      },
      "chat": {
        "account": {
          "events": [],
          "aggregates": {}
        },
        "request": {
          "events": [],
          "aggregates": {}
        },
        "contact": {
          "events": [],
          "aggregates": {}
        },
        "conversation": {
          "events": [],
          "aggregates": {}
        },
        "member": {
          "events": [],
          "aggregates": {}
        },
        "message": {
          "events": [],
          "aggregates": {}
        }
      }
    }
  },
  {
    "action": {
      "type": "protocol/client/command/instanceInitiateNewAccount",
      "payload": {
        "id": 0
      }
    },
    "prevState": {
      "protocol": {
        "client": {
          "events": [],
          "aggregates": {}
        }
      },
      "chat": {
        "account": {
          "events": [],
          "aggregates": {}
        },
        "request": {
          "events": [],
          "aggregates": {}
        },
        "contact": {
          "events": [],
          "aggregates": {}
        },
        "conversation": {
          "events": [],
          "aggregates": {}
        },
        "member": {
          "events": [],
          "aggregates": {}
        },
        "message": {
          "events": [],
          "aggregates": {}
        }
      }
    },
    "nextState": {
      "protocol": {
        "client": {
          "events": [],
          "aggregates": {}
        }
      },
      "chat": {
        "account": {
          "events": [],
          "aggregates": {}
        },
        "request": {
          "events": [],
          "aggregates": {}
        },
        "contact": {
          "events": [],
          "aggregates": {}
        },
        "conversation": {
          "events": [],
          "aggregates": {}
        },
        "member": {
          "events": [],
          "aggregates": {}
        },
        "message": {
          "events": [],
          "aggregates": {}
        }
      }
    }
  },
  {
    "action": {
      "type": "protocol/client/event/instanceInitiatedNewAccount",
      "payload": {
        "aggregateId": 0,
        "accountGroupPk": "12f5641ba3838fd25df0f719064fbdef5097d808b5c316c65bc6ee19a25db12f3936fcfd76c42b1bc65ec6a939ee6370fd8fc081bf674faeb73ddd5c9cd519f4",
        "accountDevicePk": "0a1695a4aea94a9b5980f60f77015cd52093a16cc2ceda223a10490a41f9ca56b595333cf0566745cee4d8378d057b56ac57d320271a3e9779df7b48e4fe25a8"
      }
    },
    "prevState": {
      "protocol": {
        "client": {
          "events": [],
          "aggregates": {}
        }
      },
      "chat": {
        "account": {
          "events": [],
          "aggregates": {}
        },
        "request": {
          "events": [],
          "aggregates": {}
        },
        "contact": {
          "events": [],
          "aggregates": {}
        },
        "conversation": {
          "events": [],
          "aggregates": {}
        },
        "member": {
          "events": [],
          "aggregates": {}
        },
        "message": {
          "events": [],
          "aggregates": {}
        }
      }
    },
    "nextState": {
      "protocol": {
        "client": {
          "events": [],
          "aggregates": {
            "0": {
              "id": 0,
              "accountGroupPk": "12f5641ba3838fd25df0f719064fbdef5097d808b5c316c65bc6ee19a25db12f3936fcfd76c42b1bc65ec6a939ee6370fd8fc081bf674faeb73ddd5c9cd519f4",
              "accountDevicePk": "0a1695a4aea94a9b5980f60f77015cd52093a16cc2ceda223a10490a41f9ca56b595333cf0566745cee4d8378d057b56ac57d320271a3e9779df7b48e4fe25a8"
            }
          }
        }
      },
      "chat": {
        "account": {
          "events": [],
          "aggregates": {}
        },
        "request": {
          "events": [],
          "aggregates": {}
        },
        "contact": {
          "events": [],
          "aggregates": {}
        },
        "conversation": {
          "events": [],
          "aggregates": {}
        },
        "member": {
          "events": [],
          "aggregates": {}
        },
        "message": {
          "events": [],
          "aggregates": {}
        }
      }
    }
  },
  {
    "action": {
      "type": "chat/account/event/created",
      "payload": {
        "aggregateId": 0,
        "name": "Anonymous 1337"
      }
    },
    "prevState": {
      "protocol": {
        "client": {
          "events": [],
          "aggregates": {
            "0": {
              "id": 0,
              "accountGroupPk": "12f5641ba3838fd25df0f719064fbdef5097d808b5c316c65bc6ee19a25db12f3936fcfd76c42b1bc65ec6a939ee6370fd8fc081bf674faeb73ddd5c9cd519f4",
              "accountDevicePk": "0a1695a4aea94a9b5980f60f77015cd52093a16cc2ceda223a10490a41f9ca56b595333cf0566745cee4d8378d057b56ac57d320271a3e9779df7b48e4fe25a8"
            }
          }
        }
      },
      "chat": {
        "account": {
          "events": [],
          "aggregates": {}
        },
        "request": {
          "events": [],
          "aggregates": {}
        },
        "contact": {
          "events": [],
          "aggregates": {}
        },
        "conversation": {
          "events": [],
          "aggregates": {}
        },
        "member": {
          "events": [],
          "aggregates": {}
        },
        "message": {
          "events": [],
          "aggregates": {}
        }
      }
    },
    "nextState": {
      "protocol": {
        "client": {
          "events": [],
          "aggregates": {
            "0": {
              "id": 0,
              "accountGroupPk": "12f5641ba3838fd25df0f719064fbdef5097d808b5c316c65bc6ee19a25db12f3936fcfd76c42b1bc65ec6a939ee6370fd8fc081bf674faeb73ddd5c9cd519f4",
              "accountDevicePk": "0a1695a4aea94a9b5980f60f77015cd52093a16cc2ceda223a10490a41f9ca56b595333cf0566745cee4d8378d057b56ac57d320271a3e9779df7b48e4fe25a8"
            }
          }
        }
      },
      "chat": {
        "account": {
          "events": [],
          "aggregates": {
            "0": {
              "id": 0,
              "name": "Anonymous 1337",
              "requests": [],
              "conversations": [],
              "contacts": []
            }
          }
        },
        "request": {
          "events": [],
          "aggregates": {}
        },
        "contact": {
          "events": [],
          "aggregates": {}
        },
        "conversation": {
          "events": [],
          "aggregates": {}
        },
        "member": {
          "events": [],
          "aggregates": {}
        },
        "message": {
          "events": [],
          "aggregates": {}
        }
      }
    }
  }
];

test('chat/account/command/create (action index 0) should correctly update state', function() {
    var action = actions[0];
    var result = reducer(action.prevState, action.action);
    expect(equality(result, action.nextState)).toBe(true);
});

test('protocol/client/command/instanceInitiateNewAccount (action index 1) should correctly update state', function() {
    var action = actions[1];
    var result = reducer(action.prevState, action.action);
    expect(equality(result, action.nextState)).toBe(true);
});

test('protocol/client/event/instanceInitiatedNewAccount (action index 2) should correctly update state', function() {
    var action = actions[2];
    var result = reducer(action.prevState, action.action);
    expect(equality(result, action.nextState)).toBe(true);
});

test('chat/account/event/created (action index 3) should correctly update state', function() {
    var action = actions[3];
    var result = reducer(action.prevState, action.action);
    expect(equality(result, action.nextState)).toBe(true);
});

