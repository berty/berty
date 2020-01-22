/*jest style test */

import * as chat from '..'
const { reducer } = chat.init()

var equality = function equality(result, nextState) {
      return JSON.stringify(result) === JSON.stringify(nextState);
    };
var actions = [
  {
    "action": {
      "type": "chat/account/command/open",
      "payload": {
        "id": 0
      }
    },
    "prevState": {
      "protocol": {
        "client": {
          "aggregates": {}
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
          "logs": {},
          "aggregates": {}
        },
        "contact": {
          "logs": {},
          "aggregates": {}
        },
        "conversation": {
          "logs": {},
          "aggregates": {}
        },
        "member": {
          "logs": {},
          "aggregates": {}
        },
        "message": {
          "logs": {},
          "aggregates": {}
        }
      }
    },
    "nextState": {
      "protocol": {
        "client": {
          "aggregates": {}
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
          "logs": {},
          "aggregates": {}
        },
        "contact": {
          "logs": {},
          "aggregates": {}
        },
        "conversation": {
          "logs": {},
          "aggregates": {}
        },
        "member": {
          "logs": {},
          "aggregates": {}
        },
        "message": {
          "logs": {},
          "aggregates": {}
        }
      }
    }
  },
  {
    "action": {
      "type": "protocol/client/command/start",
      "payload": {
        "id": 0
      }
    },
    "prevState": {
      "protocol": {
        "client": {
          "aggregates": {}
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
          "logs": {},
          "aggregates": {}
        },
        "contact": {
          "logs": {},
          "aggregates": {}
        },
        "conversation": {
          "logs": {},
          "aggregates": {}
        },
        "member": {
          "logs": {},
          "aggregates": {}
        },
        "message": {
          "logs": {},
          "aggregates": {}
        }
      }
    },
    "nextState": {
      "protocol": {
        "client": {
          "aggregates": {}
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
          "logs": {},
          "aggregates": {}
        },
        "contact": {
          "logs": {},
          "aggregates": {}
        },
        "conversation": {
          "logs": {},
          "aggregates": {}
        },
        "member": {
          "logs": {},
          "aggregates": {}
        },
        "message": {
          "logs": {},
          "aggregates": {}
        }
      }
    }
  },
  {
    "action": {
      "type": "protocol/client/event/started",
      "payload": {
        "aggregateId": 0
      }
    },
    "prevState": {
      "protocol": {
        "client": {
          "aggregates": {}
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
          "logs": {},
          "aggregates": {}
        },
        "contact": {
          "logs": {},
          "aggregates": {}
        },
        "conversation": {
          "logs": {},
          "aggregates": {}
        },
        "member": {
          "logs": {},
          "aggregates": {}
        },
        "message": {
          "logs": {},
          "aggregates": {}
        }
      }
    },
    "nextState": {
      "protocol": {
        "client": {
          "aggregates": {
            "0": {
              "id": 0
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
          "logs": {},
          "aggregates": {}
        },
        "contact": {
          "logs": {},
          "aggregates": {}
        },
        "conversation": {
          "logs": {},
          "aggregates": {}
        },
        "member": {
          "logs": {},
          "aggregates": {}
        },
        "message": {
          "logs": {},
          "aggregates": {}
        }
      }
    }
  },
  {
    "action": {
      "type": "protocol/client/command/accountSubscribe",
      "payload": {
        "id": 0
      }
    },
    "prevState": {
      "protocol": {
        "client": {
          "aggregates": {
            "0": {
              "id": 0
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
          "logs": {},
          "aggregates": {}
        },
        "contact": {
          "logs": {},
          "aggregates": {}
        },
        "conversation": {
          "logs": {},
          "aggregates": {}
        },
        "member": {
          "logs": {},
          "aggregates": {}
        },
        "message": {
          "logs": {},
          "aggregates": {}
        }
      }
    },
    "nextState": {
      "protocol": {
        "client": {
          "aggregates": {
            "0": {
              "id": 0
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
          "logs": {},
          "aggregates": {}
        },
        "contact": {
          "logs": {},
          "aggregates": {}
        },
        "conversation": {
          "logs": {},
          "aggregates": {}
        },
        "member": {
          "logs": {},
          "aggregates": {}
        },
        "message": {
          "logs": {},
          "aggregates": {}
        }
      }
    }
  },
  {
    "action": {
      "type": "chat/account/event/opened",
      "payload": {
        "aggregateId": 0
      }
    },
    "prevState": {
      "protocol": {
        "client": {
          "aggregates": {
            "0": {
              "id": 0
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
          "logs": {},
          "aggregates": {}
        },
        "contact": {
          "logs": {},
          "aggregates": {}
        },
        "conversation": {
          "logs": {},
          "aggregates": {}
        },
        "member": {
          "logs": {},
          "aggregates": {}
        },
        "message": {
          "logs": {},
          "aggregates": {}
        }
      }
    },
    "nextState": {
      "protocol": {
        "client": {
          "aggregates": {
            "0": {
              "id": 0
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
          "logs": {},
          "aggregates": {}
        },
        "contact": {
          "logs": {},
          "aggregates": {}
        },
        "conversation": {
          "logs": {},
          "aggregates": {}
        },
        "member": {
          "logs": {},
          "aggregates": {}
        },
        "message": {
          "logs": {},
          "aggregates": {}
        }
      }
    }
  }
];

test('chat/account/command/open (action index 0) should correctly update state', function() {
    var action = actions[0];
    var result = reducer(action.prevState, action.action);
    expect(equality(result, action.nextState)).toBe(true);
});

test('protocol/client/command/start (action index 1) should correctly update state', function() {
    var action = actions[1];
    var result = reducer(action.prevState, action.action);
    expect(equality(result, action.nextState)).toBe(true);
});

test('protocol/client/event/started (action index 2) should correctly update state', function() {
    var action = actions[2];
    var result = reducer(action.prevState, action.action);
    expect(equality(result, action.nextState)).toBe(true);
});

test('protocol/client/command/accountSubscribe (action index 3) should correctly update state', function() {
    var action = actions[3];
    var result = reducer(action.prevState, action.action);
    expect(equality(result, action.nextState)).toBe(true);
});

test('chat/account/event/opened (action index 4) should correctly update state', function() {
    var action = actions[4];
    var result = reducer(action.prevState, action.action);
    expect(equality(result, action.nextState)).toBe(true);
});


