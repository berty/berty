// package: berty.messenger.v1
// file: bertymessenger.proto

var bertymessenger_pb = require("./bertymessenger_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var MessengerService = (function () {
  function MessengerService() {}
  MessengerService.serviceName = "berty.messenger.v1.MessengerService";
  return MessengerService;
}());

MessengerService.InstanceShareableBertyID = {
  methodName: "InstanceShareableBertyID",
  service: MessengerService,
  requestStream: false,
  responseStream: false,
  requestType: bertymessenger_pb.InstanceShareableBertyID.Request,
  responseType: bertymessenger_pb.InstanceShareableBertyID.Reply
};

MessengerService.ShareableBertyGroup = {
  methodName: "ShareableBertyGroup",
  service: MessengerService,
  requestStream: false,
  responseStream: false,
  requestType: bertymessenger_pb.ShareableBertyGroup.Request,
  responseType: bertymessenger_pb.ShareableBertyGroup.Reply
};

MessengerService.DevShareInstanceBertyID = {
  methodName: "DevShareInstanceBertyID",
  service: MessengerService,
  requestStream: false,
  responseStream: false,
  requestType: bertymessenger_pb.DevShareInstanceBertyID.Request,
  responseType: bertymessenger_pb.DevShareInstanceBertyID.Reply
};

MessengerService.ParseDeepLink = {
  methodName: "ParseDeepLink",
  service: MessengerService,
  requestStream: false,
  responseStream: false,
  requestType: bertymessenger_pb.ParseDeepLink.Request,
  responseType: bertymessenger_pb.ParseDeepLink.Reply
};

MessengerService.SendContactRequest = {
  methodName: "SendContactRequest",
  service: MessengerService,
  requestStream: false,
  responseStream: false,
  requestType: bertymessenger_pb.SendContactRequest.Request,
  responseType: bertymessenger_pb.SendContactRequest.Reply
};

MessengerService.SendMessage = {
  methodName: "SendMessage",
  service: MessengerService,
  requestStream: false,
  responseStream: false,
  requestType: bertymessenger_pb.SendMessage.Request,
  responseType: bertymessenger_pb.SendMessage.Reply
};

MessengerService.SendAck = {
  methodName: "SendAck",
  service: MessengerService,
  requestStream: false,
  responseStream: false,
  requestType: bertymessenger_pb.SendAck.Request,
  responseType: bertymessenger_pb.SendAck.Reply
};

MessengerService.SystemInfo = {
  methodName: "SystemInfo",
  service: MessengerService,
  requestStream: false,
  responseStream: false,
  requestType: bertymessenger_pb.SystemInfo.Request,
  responseType: bertymessenger_pb.SystemInfo.Reply
};

MessengerService.EchoTest = {
  methodName: "EchoTest",
  service: MessengerService,
  requestStream: false,
  responseStream: true,
  requestType: bertymessenger_pb.EchoTest.Request,
  responseType: bertymessenger_pb.EchoTest.Reply
};

MessengerService.ConversationStream = {
  methodName: "ConversationStream",
  service: MessengerService,
  requestStream: false,
  responseStream: true,
  requestType: bertymessenger_pb.ConversationStream.Request,
  responseType: bertymessenger_pb.ConversationStream.Reply
};

MessengerService.EventStream = {
  methodName: "EventStream",
  service: MessengerService,
  requestStream: false,
  responseStream: true,
  requestType: bertymessenger_pb.EventStream.Request,
  responseType: bertymessenger_pb.EventStream.Reply
};

MessengerService.ConversationCreate = {
  methodName: "ConversationCreate",
  service: MessengerService,
  requestStream: false,
  responseStream: false,
  requestType: bertymessenger_pb.ConversationCreate.Request,
  responseType: bertymessenger_pb.ConversationCreate.Reply
};

MessengerService.ConversationJoin = {
  methodName: "ConversationJoin",
  service: MessengerService,
  requestStream: false,
  responseStream: false,
  requestType: bertymessenger_pb.ConversationJoin.Request,
  responseType: bertymessenger_pb.ConversationJoin.Reply
};

MessengerService.AccountGet = {
  methodName: "AccountGet",
  service: MessengerService,
  requestStream: false,
  responseStream: false,
  requestType: bertymessenger_pb.AccountGet.Request,
  responseType: bertymessenger_pb.AccountGet.Reply
};

MessengerService.AccountUpdate = {
  methodName: "AccountUpdate",
  service: MessengerService,
  requestStream: false,
  responseStream: false,
  requestType: bertymessenger_pb.AccountUpdate.Request,
  responseType: bertymessenger_pb.AccountUpdate.Reply
};

MessengerService.ContactRequest = {
  methodName: "ContactRequest",
  service: MessengerService,
  requestStream: false,
  responseStream: false,
  requestType: bertymessenger_pb.ContactRequest.Request,
  responseType: bertymessenger_pb.ContactRequest.Reply
};

MessengerService.ContactAccept = {
  methodName: "ContactAccept",
  service: MessengerService,
  requestStream: false,
  responseStream: false,
  requestType: bertymessenger_pb.ContactAccept.Request,
  responseType: bertymessenger_pb.ContactAccept.Reply
};

MessengerService.Interact = {
  methodName: "Interact",
  service: MessengerService,
  requestStream: false,
  responseStream: false,
  requestType: bertymessenger_pb.Interact.Request,
  responseType: bertymessenger_pb.Interact.Reply
};

exports.MessengerService = MessengerService;

function MessengerServiceClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

MessengerServiceClient.prototype.instanceShareableBertyID = function instanceShareableBertyID(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(MessengerService.InstanceShareableBertyID, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

MessengerServiceClient.prototype.shareableBertyGroup = function shareableBertyGroup(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(MessengerService.ShareableBertyGroup, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

MessengerServiceClient.prototype.devShareInstanceBertyID = function devShareInstanceBertyID(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(MessengerService.DevShareInstanceBertyID, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

MessengerServiceClient.prototype.parseDeepLink = function parseDeepLink(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(MessengerService.ParseDeepLink, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

MessengerServiceClient.prototype.sendContactRequest = function sendContactRequest(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(MessengerService.SendContactRequest, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

MessengerServiceClient.prototype.sendMessage = function sendMessage(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(MessengerService.SendMessage, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

MessengerServiceClient.prototype.sendAck = function sendAck(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(MessengerService.SendAck, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

MessengerServiceClient.prototype.systemInfo = function systemInfo(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(MessengerService.SystemInfo, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

MessengerServiceClient.prototype.echoTest = function echoTest(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(MessengerService.EchoTest, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

MessengerServiceClient.prototype.conversationStream = function conversationStream(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(MessengerService.ConversationStream, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

MessengerServiceClient.prototype.eventStream = function eventStream(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(MessengerService.EventStream, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onMessage: function (responseMessage) {
      listeners.data.forEach(function (handler) {
        handler(responseMessage);
      });
    },
    onEnd: function (status, statusMessage, trailers) {
      listeners.status.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners.end.forEach(function (handler) {
        handler({ code: status, details: statusMessage, metadata: trailers });
      });
      listeners = null;
    }
  });
  return {
    on: function (type, handler) {
      listeners[type].push(handler);
      return this;
    },
    cancel: function () {
      listeners = null;
      client.close();
    }
  };
};

MessengerServiceClient.prototype.conversationCreate = function conversationCreate(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(MessengerService.ConversationCreate, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

MessengerServiceClient.prototype.conversationJoin = function conversationJoin(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(MessengerService.ConversationJoin, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

MessengerServiceClient.prototype.accountGet = function accountGet(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(MessengerService.AccountGet, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

MessengerServiceClient.prototype.accountUpdate = function accountUpdate(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(MessengerService.AccountUpdate, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

MessengerServiceClient.prototype.contactRequest = function contactRequest(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(MessengerService.ContactRequest, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

MessengerServiceClient.prototype.contactAccept = function contactAccept(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(MessengerService.ContactAccept, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

MessengerServiceClient.prototype.interact = function interact(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(MessengerService.Interact, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

exports.MessengerServiceClient = MessengerServiceClient;

