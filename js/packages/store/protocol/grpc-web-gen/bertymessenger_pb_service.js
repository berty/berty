// package: berty.messenger
// file: bertymessenger.proto

var bertymessenger_pb = require("./bertymessenger_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var MessengerService = (function () {
  function MessengerService() {}
  MessengerService.serviceName = "berty.messenger.MessengerService";
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

exports.MessengerServiceClient = MessengerServiceClient;

