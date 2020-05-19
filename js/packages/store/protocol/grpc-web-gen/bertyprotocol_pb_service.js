// package: berty.protocol
// file: bertyprotocol.proto

var bertyprotocol_pb = require("./bertyprotocol_pb");
var bertytypes_pb = require("./bertytypes_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var ProtocolService = (function () {
  function ProtocolService() {}
  ProtocolService.serviceName = "berty.protocol.ProtocolService";
  return ProtocolService;
}());

ProtocolService.InstanceExportData = {
  methodName: "InstanceExportData",
  service: ProtocolService,
  requestStream: false,
  responseStream: false,
  requestType: bertytypes_pb.InstanceExportData.Request,
  responseType: bertytypes_pb.InstanceExportData.Reply
};

ProtocolService.InstanceGetConfiguration = {
  methodName: "InstanceGetConfiguration",
  service: ProtocolService,
  requestStream: false,
  responseStream: false,
  requestType: bertytypes_pb.InstanceGetConfiguration.Request,
  responseType: bertytypes_pb.InstanceGetConfiguration.Reply
};

ProtocolService.ContactRequestReference = {
  methodName: "ContactRequestReference",
  service: ProtocolService,
  requestStream: false,
  responseStream: false,
  requestType: bertytypes_pb.ContactRequestReference.Request,
  responseType: bertytypes_pb.ContactRequestReference.Reply
};

ProtocolService.ContactRequestDisable = {
  methodName: "ContactRequestDisable",
  service: ProtocolService,
  requestStream: false,
  responseStream: false,
  requestType: bertytypes_pb.ContactRequestDisable.Request,
  responseType: bertytypes_pb.ContactRequestDisable.Reply
};

ProtocolService.ContactRequestEnable = {
  methodName: "ContactRequestEnable",
  service: ProtocolService,
  requestStream: false,
  responseStream: false,
  requestType: bertytypes_pb.ContactRequestEnable.Request,
  responseType: bertytypes_pb.ContactRequestEnable.Reply
};

ProtocolService.ContactRequestResetReference = {
  methodName: "ContactRequestResetReference",
  service: ProtocolService,
  requestStream: false,
  responseStream: false,
  requestType: bertytypes_pb.ContactRequestResetReference.Request,
  responseType: bertytypes_pb.ContactRequestResetReference.Reply
};

ProtocolService.ContactRequestSend = {
  methodName: "ContactRequestSend",
  service: ProtocolService,
  requestStream: false,
  responseStream: false,
  requestType: bertytypes_pb.ContactRequestSend.Request,
  responseType: bertytypes_pb.ContactRequestSend.Reply
};

ProtocolService.ContactRequestAccept = {
  methodName: "ContactRequestAccept",
  service: ProtocolService,
  requestStream: false,
  responseStream: false,
  requestType: bertytypes_pb.ContactRequestAccept.Request,
  responseType: bertytypes_pb.ContactRequestAccept.Reply
};

ProtocolService.ContactRequestDiscard = {
  methodName: "ContactRequestDiscard",
  service: ProtocolService,
  requestStream: false,
  responseStream: false,
  requestType: bertytypes_pb.ContactRequestDiscard.Request,
  responseType: bertytypes_pb.ContactRequestDiscard.Reply
};

ProtocolService.ContactBlock = {
  methodName: "ContactBlock",
  service: ProtocolService,
  requestStream: false,
  responseStream: false,
  requestType: bertytypes_pb.ContactBlock.Request,
  responseType: bertytypes_pb.ContactBlock.Reply
};

ProtocolService.ContactUnblock = {
  methodName: "ContactUnblock",
  service: ProtocolService,
  requestStream: false,
  responseStream: false,
  requestType: bertytypes_pb.ContactUnblock.Request,
  responseType: bertytypes_pb.ContactUnblock.Reply
};

ProtocolService.ContactAliasKeySend = {
  methodName: "ContactAliasKeySend",
  service: ProtocolService,
  requestStream: false,
  responseStream: false,
  requestType: bertytypes_pb.ContactAliasKeySend.Request,
  responseType: bertytypes_pb.ContactAliasKeySend.Reply
};

ProtocolService.MultiMemberGroupCreate = {
  methodName: "MultiMemberGroupCreate",
  service: ProtocolService,
  requestStream: false,
  responseStream: false,
  requestType: bertytypes_pb.MultiMemberGroupCreate.Request,
  responseType: bertytypes_pb.MultiMemberGroupCreate.Reply
};

ProtocolService.MultiMemberGroupJoin = {
  methodName: "MultiMemberGroupJoin",
  service: ProtocolService,
  requestStream: false,
  responseStream: false,
  requestType: bertytypes_pb.MultiMemberGroupJoin.Request,
  responseType: bertytypes_pb.MultiMemberGroupJoin.Reply
};

ProtocolService.MultiMemberGroupLeave = {
  methodName: "MultiMemberGroupLeave",
  service: ProtocolService,
  requestStream: false,
  responseStream: false,
  requestType: bertytypes_pb.MultiMemberGroupLeave.Request,
  responseType: bertytypes_pb.MultiMemberGroupLeave.Reply
};

ProtocolService.MultiMemberGroupAliasResolverDisclose = {
  methodName: "MultiMemberGroupAliasResolverDisclose",
  service: ProtocolService,
  requestStream: false,
  responseStream: false,
  requestType: bertytypes_pb.MultiMemberGroupAliasResolverDisclose.Request,
  responseType: bertytypes_pb.MultiMemberGroupAliasResolverDisclose.Reply
};

ProtocolService.MultiMemberGroupAdminRoleGrant = {
  methodName: "MultiMemberGroupAdminRoleGrant",
  service: ProtocolService,
  requestStream: false,
  responseStream: false,
  requestType: bertytypes_pb.MultiMemberGroupAdminRoleGrant.Request,
  responseType: bertytypes_pb.MultiMemberGroupAdminRoleGrant.Reply
};

ProtocolService.MultiMemberGroupInvitationCreate = {
  methodName: "MultiMemberGroupInvitationCreate",
  service: ProtocolService,
  requestStream: false,
  responseStream: false,
  requestType: bertytypes_pb.MultiMemberGroupInvitationCreate.Request,
  responseType: bertytypes_pb.MultiMemberGroupInvitationCreate.Reply
};

ProtocolService.AppMetadataSend = {
  methodName: "AppMetadataSend",
  service: ProtocolService,
  requestStream: false,
  responseStream: false,
  requestType: bertytypes_pb.AppMetadataSend.Request,
  responseType: bertytypes_pb.AppMetadataSend.Reply
};

ProtocolService.AppMessageSend = {
  methodName: "AppMessageSend",
  service: ProtocolService,
  requestStream: false,
  responseStream: false,
  requestType: bertytypes_pb.AppMessageSend.Request,
  responseType: bertytypes_pb.AppMessageSend.Reply
};

ProtocolService.GroupMetadataSubscribe = {
  methodName: "GroupMetadataSubscribe",
  service: ProtocolService,
  requestStream: false,
  responseStream: true,
  requestType: bertytypes_pb.GroupMetadataSubscribe.Request,
  responseType: bertytypes_pb.GroupMetadataEvent
};

ProtocolService.GroupMessageSubscribe = {
  methodName: "GroupMessageSubscribe",
  service: ProtocolService,
  requestStream: false,
  responseStream: true,
  requestType: bertytypes_pb.GroupMessageSubscribe.Request,
  responseType: bertytypes_pb.GroupMessageEvent
};

ProtocolService.GroupMetadataList = {
  methodName: "GroupMetadataList",
  service: ProtocolService,
  requestStream: false,
  responseStream: true,
  requestType: bertytypes_pb.GroupMetadataList.Request,
  responseType: bertytypes_pb.GroupMetadataEvent
};

ProtocolService.GroupMessageList = {
  methodName: "GroupMessageList",
  service: ProtocolService,
  requestStream: false,
  responseStream: true,
  requestType: bertytypes_pb.GroupMessageList.Request,
  responseType: bertytypes_pb.GroupMessageEvent
};

ProtocolService.GroupInfo = {
  methodName: "GroupInfo",
  service: ProtocolService,
  requestStream: false,
  responseStream: false,
  requestType: bertytypes_pb.GroupInfo.Request,
  responseType: bertytypes_pb.GroupInfo.Reply
};

ProtocolService.ActivateGroup = {
  methodName: "ActivateGroup",
  service: ProtocolService,
  requestStream: false,
  responseStream: false,
  requestType: bertytypes_pb.ActivateGroup.Request,
  responseType: bertytypes_pb.ActivateGroup.Reply
};

ProtocolService.DeactivateGroup = {
  methodName: "DeactivateGroup",
  service: ProtocolService,
  requestStream: false,
  responseStream: false,
  requestType: bertytypes_pb.DeactivateGroup.Request,
  responseType: bertytypes_pb.DeactivateGroup.Reply
};

ProtocolService.DebugListGroups = {
  methodName: "DebugListGroups",
  service: ProtocolService,
  requestStream: false,
  responseStream: true,
  requestType: bertytypes_pb.DebugListGroups.Request,
  responseType: bertytypes_pb.DebugListGroups.Reply
};

ProtocolService.DebugInspectGroupStore = {
  methodName: "DebugInspectGroupStore",
  service: ProtocolService,
  requestStream: false,
  responseStream: true,
  requestType: bertytypes_pb.DebugInspectGroupStore.Request,
  responseType: bertytypes_pb.DebugInspectGroupStore.Reply
};

exports.ProtocolService = ProtocolService;

function ProtocolServiceClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

ProtocolServiceClient.prototype.instanceExportData = function instanceExportData(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProtocolService.InstanceExportData, {
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

ProtocolServiceClient.prototype.instanceGetConfiguration = function instanceGetConfiguration(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProtocolService.InstanceGetConfiguration, {
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

ProtocolServiceClient.prototype.contactRequestReference = function contactRequestReference(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProtocolService.ContactRequestReference, {
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

ProtocolServiceClient.prototype.contactRequestDisable = function contactRequestDisable(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProtocolService.ContactRequestDisable, {
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

ProtocolServiceClient.prototype.contactRequestEnable = function contactRequestEnable(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProtocolService.ContactRequestEnable, {
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

ProtocolServiceClient.prototype.contactRequestResetReference = function contactRequestResetReference(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProtocolService.ContactRequestResetReference, {
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

ProtocolServiceClient.prototype.contactRequestSend = function contactRequestSend(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProtocolService.ContactRequestSend, {
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

ProtocolServiceClient.prototype.contactRequestAccept = function contactRequestAccept(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProtocolService.ContactRequestAccept, {
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

ProtocolServiceClient.prototype.contactRequestDiscard = function contactRequestDiscard(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProtocolService.ContactRequestDiscard, {
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

ProtocolServiceClient.prototype.contactBlock = function contactBlock(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProtocolService.ContactBlock, {
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

ProtocolServiceClient.prototype.contactUnblock = function contactUnblock(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProtocolService.ContactUnblock, {
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

ProtocolServiceClient.prototype.contactAliasKeySend = function contactAliasKeySend(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProtocolService.ContactAliasKeySend, {
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

ProtocolServiceClient.prototype.multiMemberGroupCreate = function multiMemberGroupCreate(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProtocolService.MultiMemberGroupCreate, {
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

ProtocolServiceClient.prototype.multiMemberGroupJoin = function multiMemberGroupJoin(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProtocolService.MultiMemberGroupJoin, {
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

ProtocolServiceClient.prototype.multiMemberGroupLeave = function multiMemberGroupLeave(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProtocolService.MultiMemberGroupLeave, {
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

ProtocolServiceClient.prototype.multiMemberGroupAliasResolverDisclose = function multiMemberGroupAliasResolverDisclose(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProtocolService.MultiMemberGroupAliasResolverDisclose, {
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

ProtocolServiceClient.prototype.multiMemberGroupAdminRoleGrant = function multiMemberGroupAdminRoleGrant(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProtocolService.MultiMemberGroupAdminRoleGrant, {
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

ProtocolServiceClient.prototype.multiMemberGroupInvitationCreate = function multiMemberGroupInvitationCreate(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProtocolService.MultiMemberGroupInvitationCreate, {
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

ProtocolServiceClient.prototype.appMetadataSend = function appMetadataSend(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProtocolService.AppMetadataSend, {
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

ProtocolServiceClient.prototype.appMessageSend = function appMessageSend(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProtocolService.AppMessageSend, {
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

ProtocolServiceClient.prototype.groupMetadataSubscribe = function groupMetadataSubscribe(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(ProtocolService.GroupMetadataSubscribe, {
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

ProtocolServiceClient.prototype.groupMessageSubscribe = function groupMessageSubscribe(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(ProtocolService.GroupMessageSubscribe, {
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

ProtocolServiceClient.prototype.groupMetadataList = function groupMetadataList(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(ProtocolService.GroupMetadataList, {
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

ProtocolServiceClient.prototype.groupMessageList = function groupMessageList(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(ProtocolService.GroupMessageList, {
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

ProtocolServiceClient.prototype.groupInfo = function groupInfo(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProtocolService.GroupInfo, {
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

ProtocolServiceClient.prototype.activateGroup = function activateGroup(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProtocolService.ActivateGroup, {
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

ProtocolServiceClient.prototype.deactivateGroup = function deactivateGroup(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(ProtocolService.DeactivateGroup, {
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

ProtocolServiceClient.prototype.debugListGroups = function debugListGroups(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(ProtocolService.DebugListGroups, {
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

ProtocolServiceClient.prototype.debugInspectGroupStore = function debugInspectGroupStore(requestMessage, metadata) {
  var listeners = {
    data: [],
    end: [],
    status: []
  };
  var client = grpc.invoke(ProtocolService.DebugInspectGroupStore, {
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

exports.ProtocolServiceClient = ProtocolServiceClient;

