// source: bertymessenger.proto
/**
 * @fileoverview
 * @enhanceable
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!

var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

var gogoproto_gogo_pb = require('./gogoproto/gogo_pb.js');
goog.object.extend(proto, gogoproto_gogo_pb);
var bertytypes_pb = require('./bertytypes_pb.js');
goog.object.extend(proto, bertytypes_pb);
goog.exportSymbol('proto.berty.messenger.v1.Account', null, global);
goog.exportSymbol('proto.berty.messenger.v1.Account.State', null, global);
goog.exportSymbol('proto.berty.messenger.v1.AccountGet', null, global);
goog.exportSymbol('proto.berty.messenger.v1.AccountGet.Reply', null, global);
goog.exportSymbol('proto.berty.messenger.v1.AccountGet.Request', null, global);
goog.exportSymbol('proto.berty.messenger.v1.AccountUpdate', null, global);
goog.exportSymbol('proto.berty.messenger.v1.AccountUpdate.Reply', null, global);
goog.exportSymbol('proto.berty.messenger.v1.AccountUpdate.Request', null, global);
goog.exportSymbol('proto.berty.messenger.v1.AppMessage', null, global);
goog.exportSymbol('proto.berty.messenger.v1.AppMessage.Acknowledge', null, global);
goog.exportSymbol('proto.berty.messenger.v1.AppMessage.GroupInvitation', null, global);
goog.exportSymbol('proto.berty.messenger.v1.AppMessage.SetGroupName', null, global);
goog.exportSymbol('proto.berty.messenger.v1.AppMessage.SetUserName', null, global);
goog.exportSymbol('proto.berty.messenger.v1.AppMessage.Type', null, global);
goog.exportSymbol('proto.berty.messenger.v1.AppMessage.UserMessage', null, global);
goog.exportSymbol('proto.berty.messenger.v1.AppMessage.UserReaction', null, global);
goog.exportSymbol('proto.berty.messenger.v1.BertyGroup', null, global);
goog.exportSymbol('proto.berty.messenger.v1.BertyID', null, global);
goog.exportSymbol('proto.berty.messenger.v1.Contact', null, global);
goog.exportSymbol('proto.berty.messenger.v1.Contact.State', null, global);
goog.exportSymbol('proto.berty.messenger.v1.ContactAccept', null, global);
goog.exportSymbol('proto.berty.messenger.v1.ContactAccept.Reply', null, global);
goog.exportSymbol('proto.berty.messenger.v1.ContactAccept.Request', null, global);
goog.exportSymbol('proto.berty.messenger.v1.ContactMetadata', null, global);
goog.exportSymbol('proto.berty.messenger.v1.ContactRequest', null, global);
goog.exportSymbol('proto.berty.messenger.v1.ContactRequest.Reply', null, global);
goog.exportSymbol('proto.berty.messenger.v1.ContactRequest.Request', null, global);
goog.exportSymbol('proto.berty.messenger.v1.Conversation', null, global);
goog.exportSymbol('proto.berty.messenger.v1.ConversationCreate', null, global);
goog.exportSymbol('proto.berty.messenger.v1.ConversationCreate.Reply', null, global);
goog.exportSymbol('proto.berty.messenger.v1.ConversationCreate.Request', null, global);
goog.exportSymbol('proto.berty.messenger.v1.ConversationJoin', null, global);
goog.exportSymbol('proto.berty.messenger.v1.ConversationJoin.Reply', null, global);
goog.exportSymbol('proto.berty.messenger.v1.ConversationJoin.Request', null, global);
goog.exportSymbol('proto.berty.messenger.v1.ConversationStream', null, global);
goog.exportSymbol('proto.berty.messenger.v1.ConversationStream.Reply', null, global);
goog.exportSymbol('proto.berty.messenger.v1.ConversationStream.Request', null, global);
goog.exportSymbol('proto.berty.messenger.v1.DevShareInstanceBertyID', null, global);
goog.exportSymbol('proto.berty.messenger.v1.DevShareInstanceBertyID.Reply', null, global);
goog.exportSymbol('proto.berty.messenger.v1.DevShareInstanceBertyID.Request', null, global);
goog.exportSymbol('proto.berty.messenger.v1.Device', null, global);
goog.exportSymbol('proto.berty.messenger.v1.EchoTest', null, global);
goog.exportSymbol('proto.berty.messenger.v1.EchoTest.Reply', null, global);
goog.exportSymbol('proto.berty.messenger.v1.EchoTest.Request', null, global);
goog.exportSymbol('proto.berty.messenger.v1.EventStream', null, global);
goog.exportSymbol('proto.berty.messenger.v1.EventStream.Reply', null, global);
goog.exportSymbol('proto.berty.messenger.v1.EventStream.Request', null, global);
goog.exportSymbol('proto.berty.messenger.v1.InstanceShareableBertyID', null, global);
goog.exportSymbol('proto.berty.messenger.v1.InstanceShareableBertyID.Reply', null, global);
goog.exportSymbol('proto.berty.messenger.v1.InstanceShareableBertyID.Request', null, global);
goog.exportSymbol('proto.berty.messenger.v1.Interact', null, global);
goog.exportSymbol('proto.berty.messenger.v1.Interact.Reply', null, global);
goog.exportSymbol('proto.berty.messenger.v1.Interact.Request', null, global);
goog.exportSymbol('proto.berty.messenger.v1.Interaction', null, global);
goog.exportSymbol('proto.berty.messenger.v1.Member', null, global);
goog.exportSymbol('proto.berty.messenger.v1.ParseDeepLink', null, global);
goog.exportSymbol('proto.berty.messenger.v1.ParseDeepLink.Kind', null, global);
goog.exportSymbol('proto.berty.messenger.v1.ParseDeepLink.Reply', null, global);
goog.exportSymbol('proto.berty.messenger.v1.ParseDeepLink.Request', null, global);
goog.exportSymbol('proto.berty.messenger.v1.SendAck', null, global);
goog.exportSymbol('proto.berty.messenger.v1.SendAck.Reply', null, global);
goog.exportSymbol('proto.berty.messenger.v1.SendAck.Request', null, global);
goog.exportSymbol('proto.berty.messenger.v1.SendContactRequest', null, global);
goog.exportSymbol('proto.berty.messenger.v1.SendContactRequest.Reply', null, global);
goog.exportSymbol('proto.berty.messenger.v1.SendContactRequest.Request', null, global);
goog.exportSymbol('proto.berty.messenger.v1.SendMessage', null, global);
goog.exportSymbol('proto.berty.messenger.v1.SendMessage.Reply', null, global);
goog.exportSymbol('proto.berty.messenger.v1.SendMessage.Request', null, global);
goog.exportSymbol('proto.berty.messenger.v1.ShareableBertyGroup', null, global);
goog.exportSymbol('proto.berty.messenger.v1.ShareableBertyGroup.Reply', null, global);
goog.exportSymbol('proto.berty.messenger.v1.ShareableBertyGroup.Request', null, global);
goog.exportSymbol('proto.berty.messenger.v1.StreamEvent', null, global);
goog.exportSymbol('proto.berty.messenger.v1.StreamEvent.AccountUpdated', null, global);
goog.exportSymbol('proto.berty.messenger.v1.StreamEvent.ContactUpdated', null, global);
goog.exportSymbol('proto.berty.messenger.v1.StreamEvent.ConversationDeleted', null, global);
goog.exportSymbol('proto.berty.messenger.v1.StreamEvent.ConversationUpdated', null, global);
goog.exportSymbol('proto.berty.messenger.v1.StreamEvent.InteractionUpdated', null, global);
goog.exportSymbol('proto.berty.messenger.v1.StreamEvent.ListEnd', null, global);
goog.exportSymbol('proto.berty.messenger.v1.StreamEvent.Type', null, global);
goog.exportSymbol('proto.berty.messenger.v1.SystemInfo', null, global);
goog.exportSymbol('proto.berty.messenger.v1.SystemInfo.Reply', null, global);
goog.exportSymbol('proto.berty.messenger.v1.SystemInfo.Request', null, global);
goog.exportSymbol('proto.berty.messenger.v1.UserMessageAttachment', null, global);
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.EchoTest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.EchoTest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.EchoTest.displayName = 'proto.berty.messenger.v1.EchoTest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.EchoTest.Request = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.EchoTest.Request, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.EchoTest.Request.displayName = 'proto.berty.messenger.v1.EchoTest.Request';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.EchoTest.Reply = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.EchoTest.Reply, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.EchoTest.Reply.displayName = 'proto.berty.messenger.v1.EchoTest.Reply';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.InstanceShareableBertyID = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.InstanceShareableBertyID, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.InstanceShareableBertyID.displayName = 'proto.berty.messenger.v1.InstanceShareableBertyID';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Request = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.InstanceShareableBertyID.Request, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.InstanceShareableBertyID.Request.displayName = 'proto.berty.messenger.v1.InstanceShareableBertyID.Request';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Reply = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.InstanceShareableBertyID.Reply, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.InstanceShareableBertyID.Reply.displayName = 'proto.berty.messenger.v1.InstanceShareableBertyID.Reply';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.ShareableBertyGroup = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.ShareableBertyGroup, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.ShareableBertyGroup.displayName = 'proto.berty.messenger.v1.ShareableBertyGroup';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.ShareableBertyGroup.Request = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.ShareableBertyGroup.Request, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.ShareableBertyGroup.Request.displayName = 'proto.berty.messenger.v1.ShareableBertyGroup.Request';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.ShareableBertyGroup.Reply = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.ShareableBertyGroup.Reply, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.ShareableBertyGroup.Reply.displayName = 'proto.berty.messenger.v1.ShareableBertyGroup.Reply';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.DevShareInstanceBertyID = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.DevShareInstanceBertyID, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.DevShareInstanceBertyID.displayName = 'proto.berty.messenger.v1.DevShareInstanceBertyID';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.Request = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.DevShareInstanceBertyID.Request, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.DevShareInstanceBertyID.Request.displayName = 'proto.berty.messenger.v1.DevShareInstanceBertyID.Request';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.Reply = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.DevShareInstanceBertyID.Reply, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.DevShareInstanceBertyID.Reply.displayName = 'proto.berty.messenger.v1.DevShareInstanceBertyID.Reply';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.ParseDeepLink = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.ParseDeepLink, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.ParseDeepLink.displayName = 'proto.berty.messenger.v1.ParseDeepLink';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.ParseDeepLink.Request = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.ParseDeepLink.Request, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.ParseDeepLink.Request.displayName = 'proto.berty.messenger.v1.ParseDeepLink.Request';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.ParseDeepLink.Reply = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.ParseDeepLink.Reply, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.ParseDeepLink.Reply.displayName = 'proto.berty.messenger.v1.ParseDeepLink.Reply';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.SendContactRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.SendContactRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.SendContactRequest.displayName = 'proto.berty.messenger.v1.SendContactRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.SendContactRequest.Request = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.SendContactRequest.Request, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.SendContactRequest.Request.displayName = 'proto.berty.messenger.v1.SendContactRequest.Request';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.SendContactRequest.Reply = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.SendContactRequest.Reply, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.SendContactRequest.Reply.displayName = 'proto.berty.messenger.v1.SendContactRequest.Reply';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.SendAck = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.SendAck, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.SendAck.displayName = 'proto.berty.messenger.v1.SendAck';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.SendAck.Request = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.SendAck.Request, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.SendAck.Request.displayName = 'proto.berty.messenger.v1.SendAck.Request';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.SendAck.Reply = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.SendAck.Reply, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.SendAck.Reply.displayName = 'proto.berty.messenger.v1.SendAck.Reply';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.SendMessage = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.SendMessage, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.SendMessage.displayName = 'proto.berty.messenger.v1.SendMessage';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.SendMessage.Request = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.SendMessage.Request, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.SendMessage.Request.displayName = 'proto.berty.messenger.v1.SendMessage.Request';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.SendMessage.Reply = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.SendMessage.Reply, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.SendMessage.Reply.displayName = 'proto.berty.messenger.v1.SendMessage.Reply';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.BertyID = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.BertyID, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.BertyID.displayName = 'proto.berty.messenger.v1.BertyID';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.BertyGroup = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.BertyGroup, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.BertyGroup.displayName = 'proto.berty.messenger.v1.BertyGroup';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.UserMessageAttachment = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.UserMessageAttachment, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.UserMessageAttachment.displayName = 'proto.berty.messenger.v1.UserMessageAttachment';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.AppMessage = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.AppMessage, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.AppMessage.displayName = 'proto.berty.messenger.v1.AppMessage';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.AppMessage.UserMessage = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.berty.messenger.v1.AppMessage.UserMessage.repeatedFields_, null);
};
goog.inherits(proto.berty.messenger.v1.AppMessage.UserMessage, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.AppMessage.UserMessage.displayName = 'proto.berty.messenger.v1.AppMessage.UserMessage';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.AppMessage.UserReaction = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.AppMessage.UserReaction, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.AppMessage.UserReaction.displayName = 'proto.berty.messenger.v1.AppMessage.UserReaction';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.AppMessage.GroupInvitation = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.AppMessage.GroupInvitation, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.AppMessage.GroupInvitation.displayName = 'proto.berty.messenger.v1.AppMessage.GroupInvitation';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.AppMessage.SetGroupName = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.AppMessage.SetGroupName, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.AppMessage.SetGroupName.displayName = 'proto.berty.messenger.v1.AppMessage.SetGroupName';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.AppMessage.SetUserName = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.AppMessage.SetUserName, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.AppMessage.SetUserName.displayName = 'proto.berty.messenger.v1.AppMessage.SetUserName';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.AppMessage.Acknowledge = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.AppMessage.Acknowledge, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.AppMessage.Acknowledge.displayName = 'proto.berty.messenger.v1.AppMessage.Acknowledge';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.SystemInfo = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.SystemInfo, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.SystemInfo.displayName = 'proto.berty.messenger.v1.SystemInfo';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.SystemInfo.Request = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.SystemInfo.Request, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.SystemInfo.Request.displayName = 'proto.berty.messenger.v1.SystemInfo.Request';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.SystemInfo.Reply = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.SystemInfo.Reply, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.SystemInfo.Reply.displayName = 'proto.berty.messenger.v1.SystemInfo.Reply';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.ConversationJoin = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.ConversationJoin, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.ConversationJoin.displayName = 'proto.berty.messenger.v1.ConversationJoin';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.ConversationJoin.Request = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.ConversationJoin.Request, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.ConversationJoin.Request.displayName = 'proto.berty.messenger.v1.ConversationJoin.Request';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.ConversationJoin.Reply = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.ConversationJoin.Reply, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.ConversationJoin.Reply.displayName = 'proto.berty.messenger.v1.ConversationJoin.Reply';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.Account = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.Account, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.Account.displayName = 'proto.berty.messenger.v1.Account';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.Interaction = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.Interaction, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.Interaction.displayName = 'proto.berty.messenger.v1.Interaction';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.Contact = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.Contact, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.Contact.displayName = 'proto.berty.messenger.v1.Contact';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.Conversation = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.Conversation, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.Conversation.displayName = 'proto.berty.messenger.v1.Conversation';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.Member = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.Member, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.Member.displayName = 'proto.berty.messenger.v1.Member';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.Device = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.Device, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.Device.displayName = 'proto.berty.messenger.v1.Device';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.StreamEvent = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.StreamEvent, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.StreamEvent.displayName = 'proto.berty.messenger.v1.StreamEvent';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.StreamEvent.ConversationUpdated = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.StreamEvent.ConversationUpdated, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.StreamEvent.ConversationUpdated.displayName = 'proto.berty.messenger.v1.StreamEvent.ConversationUpdated';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.StreamEvent.ConversationDeleted = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.StreamEvent.ConversationDeleted, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.StreamEvent.ConversationDeleted.displayName = 'proto.berty.messenger.v1.StreamEvent.ConversationDeleted';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.StreamEvent.InteractionUpdated = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.StreamEvent.InteractionUpdated, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.StreamEvent.InteractionUpdated.displayName = 'proto.berty.messenger.v1.StreamEvent.InteractionUpdated';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.StreamEvent.ContactUpdated = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.StreamEvent.ContactUpdated, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.StreamEvent.ContactUpdated.displayName = 'proto.berty.messenger.v1.StreamEvent.ContactUpdated';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.StreamEvent.AccountUpdated = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.StreamEvent.AccountUpdated, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.StreamEvent.AccountUpdated.displayName = 'proto.berty.messenger.v1.StreamEvent.AccountUpdated';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.StreamEvent.ListEnd = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.StreamEvent.ListEnd, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.StreamEvent.ListEnd.displayName = 'proto.berty.messenger.v1.StreamEvent.ListEnd';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.ConversationStream = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.ConversationStream, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.ConversationStream.displayName = 'proto.berty.messenger.v1.ConversationStream';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.ConversationStream.Request = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.ConversationStream.Request, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.ConversationStream.Request.displayName = 'proto.berty.messenger.v1.ConversationStream.Request';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.ConversationStream.Reply = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.ConversationStream.Reply, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.ConversationStream.Reply.displayName = 'proto.berty.messenger.v1.ConversationStream.Reply';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.ConversationCreate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.ConversationCreate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.ConversationCreate.displayName = 'proto.berty.messenger.v1.ConversationCreate';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.ConversationCreate.Request = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.berty.messenger.v1.ConversationCreate.Request.repeatedFields_, null);
};
goog.inherits(proto.berty.messenger.v1.ConversationCreate.Request, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.ConversationCreate.Request.displayName = 'proto.berty.messenger.v1.ConversationCreate.Request';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.ConversationCreate.Reply = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.ConversationCreate.Reply, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.ConversationCreate.Reply.displayName = 'proto.berty.messenger.v1.ConversationCreate.Reply';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.AccountGet = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.AccountGet, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.AccountGet.displayName = 'proto.berty.messenger.v1.AccountGet';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.AccountGet.Request = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.AccountGet.Request, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.AccountGet.Request.displayName = 'proto.berty.messenger.v1.AccountGet.Request';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.AccountGet.Reply = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.AccountGet.Reply, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.AccountGet.Reply.displayName = 'proto.berty.messenger.v1.AccountGet.Reply';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.EventStream = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.EventStream, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.EventStream.displayName = 'proto.berty.messenger.v1.EventStream';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.EventStream.Request = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.EventStream.Request, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.EventStream.Request.displayName = 'proto.berty.messenger.v1.EventStream.Request';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.EventStream.Reply = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.EventStream.Reply, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.EventStream.Reply.displayName = 'proto.berty.messenger.v1.EventStream.Reply';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.ContactMetadata = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.ContactMetadata, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.ContactMetadata.displayName = 'proto.berty.messenger.v1.ContactMetadata';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.AccountUpdate = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.AccountUpdate, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.AccountUpdate.displayName = 'proto.berty.messenger.v1.AccountUpdate';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.AccountUpdate.Request = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.AccountUpdate.Request, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.AccountUpdate.Request.displayName = 'proto.berty.messenger.v1.AccountUpdate.Request';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.AccountUpdate.Reply = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.AccountUpdate.Reply, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.AccountUpdate.Reply.displayName = 'proto.berty.messenger.v1.AccountUpdate.Reply';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.ContactRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.ContactRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.ContactRequest.displayName = 'proto.berty.messenger.v1.ContactRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.ContactRequest.Request = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.ContactRequest.Request, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.ContactRequest.Request.displayName = 'proto.berty.messenger.v1.ContactRequest.Request';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.ContactRequest.Reply = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.ContactRequest.Reply, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.ContactRequest.Reply.displayName = 'proto.berty.messenger.v1.ContactRequest.Reply';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.ContactAccept = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.ContactAccept, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.ContactAccept.displayName = 'proto.berty.messenger.v1.ContactAccept';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.ContactAccept.Request = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.ContactAccept.Request, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.ContactAccept.Request.displayName = 'proto.berty.messenger.v1.ContactAccept.Request';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.ContactAccept.Reply = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.ContactAccept.Reply, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.ContactAccept.Reply.displayName = 'proto.berty.messenger.v1.ContactAccept.Reply';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.Interact = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.Interact, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.Interact.displayName = 'proto.berty.messenger.v1.Interact';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.Interact.Request = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.Interact.Request, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.Interact.Request.displayName = 'proto.berty.messenger.v1.Interact.Request';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.berty.messenger.v1.Interact.Reply = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.berty.messenger.v1.Interact.Reply, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.berty.messenger.v1.Interact.Reply.displayName = 'proto.berty.messenger.v1.Interact.Reply';
}



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.EchoTest.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.EchoTest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.EchoTest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.EchoTest.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.EchoTest}
 */
proto.berty.messenger.v1.EchoTest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.EchoTest;
  return proto.berty.messenger.v1.EchoTest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.EchoTest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.EchoTest}
 */
proto.berty.messenger.v1.EchoTest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.EchoTest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.EchoTest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.EchoTest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.EchoTest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.EchoTest.Request.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.EchoTest.Request.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.EchoTest.Request} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.EchoTest.Request.toObject = function(includeInstance, msg) {
  var f, obj = {
    delay: jspb.Message.getFieldWithDefault(msg, 1, 0),
    echo: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.EchoTest.Request}
 */
proto.berty.messenger.v1.EchoTest.Request.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.EchoTest.Request;
  return proto.berty.messenger.v1.EchoTest.Request.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.EchoTest.Request} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.EchoTest.Request}
 */
proto.berty.messenger.v1.EchoTest.Request.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readUint64());
      msg.setDelay(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setEcho(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.EchoTest.Request.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.EchoTest.Request.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.EchoTest.Request} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.EchoTest.Request.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDelay();
  if (f !== 0) {
    writer.writeUint64(
      1,
      f
    );
  }
  f = message.getEcho();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional uint64 delay = 1;
 * @return {number}
 */
proto.berty.messenger.v1.EchoTest.Request.prototype.getDelay = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.berty.messenger.v1.EchoTest.Request} returns this
 */
proto.berty.messenger.v1.EchoTest.Request.prototype.setDelay = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional string echo = 2;
 * @return {string}
 */
proto.berty.messenger.v1.EchoTest.Request.prototype.getEcho = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.EchoTest.Request} returns this
 */
proto.berty.messenger.v1.EchoTest.Request.prototype.setEcho = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.EchoTest.Reply.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.EchoTest.Reply.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.EchoTest.Reply} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.EchoTest.Reply.toObject = function(includeInstance, msg) {
  var f, obj = {
    echo: jspb.Message.getFieldWithDefault(msg, 1, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.EchoTest.Reply}
 */
proto.berty.messenger.v1.EchoTest.Reply.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.EchoTest.Reply;
  return proto.berty.messenger.v1.EchoTest.Reply.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.EchoTest.Reply} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.EchoTest.Reply}
 */
proto.berty.messenger.v1.EchoTest.Reply.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setEcho(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.EchoTest.Reply.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.EchoTest.Reply.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.EchoTest.Reply} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.EchoTest.Reply.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getEcho();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string echo = 1;
 * @return {string}
 */
proto.berty.messenger.v1.EchoTest.Reply.prototype.getEcho = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.EchoTest.Reply} returns this
 */
proto.berty.messenger.v1.EchoTest.Reply.prototype.setEcho = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.InstanceShareableBertyID.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.InstanceShareableBertyID.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.InstanceShareableBertyID} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.InstanceShareableBertyID.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.InstanceShareableBertyID}
 */
proto.berty.messenger.v1.InstanceShareableBertyID.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.InstanceShareableBertyID;
  return proto.berty.messenger.v1.InstanceShareableBertyID.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.InstanceShareableBertyID} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.InstanceShareableBertyID}
 */
proto.berty.messenger.v1.InstanceShareableBertyID.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.InstanceShareableBertyID.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.InstanceShareableBertyID.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.InstanceShareableBertyID} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.InstanceShareableBertyID.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Request.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.InstanceShareableBertyID.Request.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.InstanceShareableBertyID.Request} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Request.toObject = function(includeInstance, msg) {
  var f, obj = {
    reset: jspb.Message.getBooleanFieldWithDefault(msg, 1, false),
    displayName: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.InstanceShareableBertyID.Request}
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Request.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.InstanceShareableBertyID.Request;
  return proto.berty.messenger.v1.InstanceShareableBertyID.Request.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.InstanceShareableBertyID.Request} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.InstanceShareableBertyID.Request}
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Request.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setReset(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setDisplayName(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Request.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.InstanceShareableBertyID.Request.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.InstanceShareableBertyID.Request} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Request.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getReset();
  if (f) {
    writer.writeBool(
      1,
      f
    );
  }
  f = message.getDisplayName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional bool reset = 1;
 * @return {boolean}
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Request.prototype.getReset = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 1, false));
};


/**
 * @param {boolean} value
 * @return {!proto.berty.messenger.v1.InstanceShareableBertyID.Request} returns this
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Request.prototype.setReset = function(value) {
  return jspb.Message.setProto3BooleanField(this, 1, value);
};


/**
 * optional string display_name = 2;
 * @return {string}
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Request.prototype.getDisplayName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.InstanceShareableBertyID.Request} returns this
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Request.prototype.setDisplayName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Reply.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.InstanceShareableBertyID.Reply.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.InstanceShareableBertyID.Reply} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Reply.toObject = function(includeInstance, msg) {
  var f, obj = {
    bertyId: (f = msg.getBertyId()) && proto.berty.messenger.v1.BertyID.toObject(includeInstance, f),
    bertyIdPayload: jspb.Message.getFieldWithDefault(msg, 2, ""),
    deepLink: jspb.Message.getFieldWithDefault(msg, 3, ""),
    htmlUrl: jspb.Message.getFieldWithDefault(msg, 4, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.InstanceShareableBertyID.Reply}
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Reply.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.InstanceShareableBertyID.Reply;
  return proto.berty.messenger.v1.InstanceShareableBertyID.Reply.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.InstanceShareableBertyID.Reply} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.InstanceShareableBertyID.Reply}
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Reply.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.berty.messenger.v1.BertyID;
      reader.readMessage(value,proto.berty.messenger.v1.BertyID.deserializeBinaryFromReader);
      msg.setBertyId(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setBertyIdPayload(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setDeepLink(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setHtmlUrl(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Reply.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.InstanceShareableBertyID.Reply.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.InstanceShareableBertyID.Reply} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Reply.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBertyId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.berty.messenger.v1.BertyID.serializeBinaryToWriter
    );
  }
  f = message.getBertyIdPayload();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getDeepLink();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getHtmlUrl();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
};


/**
 * optional BertyID berty_id = 1;
 * @return {?proto.berty.messenger.v1.BertyID}
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Reply.prototype.getBertyId = function() {
  return /** @type{?proto.berty.messenger.v1.BertyID} */ (
    jspb.Message.getWrapperField(this, proto.berty.messenger.v1.BertyID, 1));
};


/**
 * @param {?proto.berty.messenger.v1.BertyID|undefined} value
 * @return {!proto.berty.messenger.v1.InstanceShareableBertyID.Reply} returns this
*/
proto.berty.messenger.v1.InstanceShareableBertyID.Reply.prototype.setBertyId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.berty.messenger.v1.InstanceShareableBertyID.Reply} returns this
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Reply.prototype.clearBertyId = function() {
  return this.setBertyId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Reply.prototype.hasBertyId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string berty_id_payload = 2;
 * @return {string}
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Reply.prototype.getBertyIdPayload = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.InstanceShareableBertyID.Reply} returns this
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Reply.prototype.setBertyIdPayload = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string deep_link = 3;
 * @return {string}
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Reply.prototype.getDeepLink = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.InstanceShareableBertyID.Reply} returns this
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Reply.prototype.setDeepLink = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string html_url = 4;
 * @return {string}
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Reply.prototype.getHtmlUrl = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.InstanceShareableBertyID.Reply} returns this
 */
proto.berty.messenger.v1.InstanceShareableBertyID.Reply.prototype.setHtmlUrl = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.ShareableBertyGroup.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.ShareableBertyGroup.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.ShareableBertyGroup} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ShareableBertyGroup.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.ShareableBertyGroup}
 */
proto.berty.messenger.v1.ShareableBertyGroup.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.ShareableBertyGroup;
  return proto.berty.messenger.v1.ShareableBertyGroup.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.ShareableBertyGroup} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.ShareableBertyGroup}
 */
proto.berty.messenger.v1.ShareableBertyGroup.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.ShareableBertyGroup.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.ShareableBertyGroup.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.ShareableBertyGroup} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ShareableBertyGroup.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.ShareableBertyGroup.Request.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.ShareableBertyGroup.Request.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.ShareableBertyGroup.Request} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ShareableBertyGroup.Request.toObject = function(includeInstance, msg) {
  var f, obj = {
    groupPk: msg.getGroupPk_asB64(),
    groupName: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.ShareableBertyGroup.Request}
 */
proto.berty.messenger.v1.ShareableBertyGroup.Request.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.ShareableBertyGroup.Request;
  return proto.berty.messenger.v1.ShareableBertyGroup.Request.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.ShareableBertyGroup.Request} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.ShareableBertyGroup.Request}
 */
proto.berty.messenger.v1.ShareableBertyGroup.Request.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setGroupPk(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setGroupName(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.ShareableBertyGroup.Request.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.ShareableBertyGroup.Request.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.ShareableBertyGroup.Request} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ShareableBertyGroup.Request.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getGroupPk_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getGroupName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional bytes group_pk = 1;
 * @return {!(string|Uint8Array)}
 */
proto.berty.messenger.v1.ShareableBertyGroup.Request.prototype.getGroupPk = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes group_pk = 1;
 * This is a type-conversion wrapper around `getGroupPk()`
 * @return {string}
 */
proto.berty.messenger.v1.ShareableBertyGroup.Request.prototype.getGroupPk_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getGroupPk()));
};


/**
 * optional bytes group_pk = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getGroupPk()`
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.ShareableBertyGroup.Request.prototype.getGroupPk_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getGroupPk()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.berty.messenger.v1.ShareableBertyGroup.Request} returns this
 */
proto.berty.messenger.v1.ShareableBertyGroup.Request.prototype.setGroupPk = function(value) {
  return jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional string group_name = 2;
 * @return {string}
 */
proto.berty.messenger.v1.ShareableBertyGroup.Request.prototype.getGroupName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.ShareableBertyGroup.Request} returns this
 */
proto.berty.messenger.v1.ShareableBertyGroup.Request.prototype.setGroupName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.ShareableBertyGroup.Reply.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.ShareableBertyGroup.Reply.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.ShareableBertyGroup.Reply} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ShareableBertyGroup.Reply.toObject = function(includeInstance, msg) {
  var f, obj = {
    bertyGroup: (f = msg.getBertyGroup()) && proto.berty.messenger.v1.BertyGroup.toObject(includeInstance, f),
    bertyGroupPayload: jspb.Message.getFieldWithDefault(msg, 2, ""),
    deepLink: jspb.Message.getFieldWithDefault(msg, 3, ""),
    htmlUrl: jspb.Message.getFieldWithDefault(msg, 4, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.ShareableBertyGroup.Reply}
 */
proto.berty.messenger.v1.ShareableBertyGroup.Reply.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.ShareableBertyGroup.Reply;
  return proto.berty.messenger.v1.ShareableBertyGroup.Reply.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.ShareableBertyGroup.Reply} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.ShareableBertyGroup.Reply}
 */
proto.berty.messenger.v1.ShareableBertyGroup.Reply.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.berty.messenger.v1.BertyGroup;
      reader.readMessage(value,proto.berty.messenger.v1.BertyGroup.deserializeBinaryFromReader);
      msg.setBertyGroup(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setBertyGroupPayload(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setDeepLink(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setHtmlUrl(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.ShareableBertyGroup.Reply.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.ShareableBertyGroup.Reply.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.ShareableBertyGroup.Reply} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ShareableBertyGroup.Reply.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBertyGroup();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.berty.messenger.v1.BertyGroup.serializeBinaryToWriter
    );
  }
  f = message.getBertyGroupPayload();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getDeepLink();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getHtmlUrl();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
};


/**
 * optional BertyGroup berty_group = 1;
 * @return {?proto.berty.messenger.v1.BertyGroup}
 */
proto.berty.messenger.v1.ShareableBertyGroup.Reply.prototype.getBertyGroup = function() {
  return /** @type{?proto.berty.messenger.v1.BertyGroup} */ (
    jspb.Message.getWrapperField(this, proto.berty.messenger.v1.BertyGroup, 1));
};


/**
 * @param {?proto.berty.messenger.v1.BertyGroup|undefined} value
 * @return {!proto.berty.messenger.v1.ShareableBertyGroup.Reply} returns this
*/
proto.berty.messenger.v1.ShareableBertyGroup.Reply.prototype.setBertyGroup = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.berty.messenger.v1.ShareableBertyGroup.Reply} returns this
 */
proto.berty.messenger.v1.ShareableBertyGroup.Reply.prototype.clearBertyGroup = function() {
  return this.setBertyGroup(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.berty.messenger.v1.ShareableBertyGroup.Reply.prototype.hasBertyGroup = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string berty_group_payload = 2;
 * @return {string}
 */
proto.berty.messenger.v1.ShareableBertyGroup.Reply.prototype.getBertyGroupPayload = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.ShareableBertyGroup.Reply} returns this
 */
proto.berty.messenger.v1.ShareableBertyGroup.Reply.prototype.setBertyGroupPayload = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string deep_link = 3;
 * @return {string}
 */
proto.berty.messenger.v1.ShareableBertyGroup.Reply.prototype.getDeepLink = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.ShareableBertyGroup.Reply} returns this
 */
proto.berty.messenger.v1.ShareableBertyGroup.Reply.prototype.setDeepLink = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string html_url = 4;
 * @return {string}
 */
proto.berty.messenger.v1.ShareableBertyGroup.Reply.prototype.getHtmlUrl = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.ShareableBertyGroup.Reply} returns this
 */
proto.berty.messenger.v1.ShareableBertyGroup.Reply.prototype.setHtmlUrl = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.DevShareInstanceBertyID.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.DevShareInstanceBertyID} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.DevShareInstanceBertyID}
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.DevShareInstanceBertyID;
  return proto.berty.messenger.v1.DevShareInstanceBertyID.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.DevShareInstanceBertyID} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.DevShareInstanceBertyID}
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.DevShareInstanceBertyID.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.DevShareInstanceBertyID} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.Request.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.DevShareInstanceBertyID.Request.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.DevShareInstanceBertyID.Request} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.Request.toObject = function(includeInstance, msg) {
  var f, obj = {
    reset: jspb.Message.getBooleanFieldWithDefault(msg, 1, false),
    displayName: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.DevShareInstanceBertyID.Request}
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.Request.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.DevShareInstanceBertyID.Request;
  return proto.berty.messenger.v1.DevShareInstanceBertyID.Request.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.DevShareInstanceBertyID.Request} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.DevShareInstanceBertyID.Request}
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.Request.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setReset(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setDisplayName(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.Request.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.DevShareInstanceBertyID.Request.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.DevShareInstanceBertyID.Request} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.Request.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getReset();
  if (f) {
    writer.writeBool(
      1,
      f
    );
  }
  f = message.getDisplayName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional bool reset = 1;
 * @return {boolean}
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.Request.prototype.getReset = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 1, false));
};


/**
 * @param {boolean} value
 * @return {!proto.berty.messenger.v1.DevShareInstanceBertyID.Request} returns this
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.Request.prototype.setReset = function(value) {
  return jspb.Message.setProto3BooleanField(this, 1, value);
};


/**
 * optional string display_name = 2;
 * @return {string}
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.Request.prototype.getDisplayName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.DevShareInstanceBertyID.Request} returns this
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.Request.prototype.setDisplayName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.Reply.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.DevShareInstanceBertyID.Reply.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.DevShareInstanceBertyID.Reply} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.Reply.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.DevShareInstanceBertyID.Reply}
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.Reply.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.DevShareInstanceBertyID.Reply;
  return proto.berty.messenger.v1.DevShareInstanceBertyID.Reply.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.DevShareInstanceBertyID.Reply} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.DevShareInstanceBertyID.Reply}
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.Reply.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.Reply.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.DevShareInstanceBertyID.Reply.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.DevShareInstanceBertyID.Reply} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.DevShareInstanceBertyID.Reply.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.ParseDeepLink.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.ParseDeepLink.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.ParseDeepLink} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ParseDeepLink.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.ParseDeepLink}
 */
proto.berty.messenger.v1.ParseDeepLink.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.ParseDeepLink;
  return proto.berty.messenger.v1.ParseDeepLink.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.ParseDeepLink} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.ParseDeepLink}
 */
proto.berty.messenger.v1.ParseDeepLink.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.ParseDeepLink.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.ParseDeepLink.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.ParseDeepLink} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ParseDeepLink.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};


/**
 * @enum {number}
 */
proto.berty.messenger.v1.ParseDeepLink.Kind = {
  UNKNOWNKIND: 0,
  BERTYID: 1,
  BERTYGROUP: 2
};




if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.ParseDeepLink.Request.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.ParseDeepLink.Request.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.ParseDeepLink.Request} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ParseDeepLink.Request.toObject = function(includeInstance, msg) {
  var f, obj = {
    link: jspb.Message.getFieldWithDefault(msg, 1, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.ParseDeepLink.Request}
 */
proto.berty.messenger.v1.ParseDeepLink.Request.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.ParseDeepLink.Request;
  return proto.berty.messenger.v1.ParseDeepLink.Request.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.ParseDeepLink.Request} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.ParseDeepLink.Request}
 */
proto.berty.messenger.v1.ParseDeepLink.Request.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setLink(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.ParseDeepLink.Request.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.ParseDeepLink.Request.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.ParseDeepLink.Request} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ParseDeepLink.Request.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getLink();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string link = 1;
 * @return {string}
 */
proto.berty.messenger.v1.ParseDeepLink.Request.prototype.getLink = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.ParseDeepLink.Request} returns this
 */
proto.berty.messenger.v1.ParseDeepLink.Request.prototype.setLink = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.ParseDeepLink.Reply.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.ParseDeepLink.Reply.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.ParseDeepLink.Reply} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ParseDeepLink.Reply.toObject = function(includeInstance, msg) {
  var f, obj = {
    kind: jspb.Message.getFieldWithDefault(msg, 1, 0),
    bertyId: (f = msg.getBertyId()) && proto.berty.messenger.v1.BertyID.toObject(includeInstance, f),
    bertyGroup: (f = msg.getBertyGroup()) && proto.berty.messenger.v1.BertyGroup.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.ParseDeepLink.Reply}
 */
proto.berty.messenger.v1.ParseDeepLink.Reply.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.ParseDeepLink.Reply;
  return proto.berty.messenger.v1.ParseDeepLink.Reply.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.ParseDeepLink.Reply} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.ParseDeepLink.Reply}
 */
proto.berty.messenger.v1.ParseDeepLink.Reply.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.berty.messenger.v1.ParseDeepLink.Kind} */ (reader.readEnum());
      msg.setKind(value);
      break;
    case 3:
      var value = new proto.berty.messenger.v1.BertyID;
      reader.readMessage(value,proto.berty.messenger.v1.BertyID.deserializeBinaryFromReader);
      msg.setBertyId(value);
      break;
    case 4:
      var value = new proto.berty.messenger.v1.BertyGroup;
      reader.readMessage(value,proto.berty.messenger.v1.BertyGroup.deserializeBinaryFromReader);
      msg.setBertyGroup(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.ParseDeepLink.Reply.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.ParseDeepLink.Reply.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.ParseDeepLink.Reply} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ParseDeepLink.Reply.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getKind();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getBertyId();
  if (f != null) {
    writer.writeMessage(
      3,
      f,
      proto.berty.messenger.v1.BertyID.serializeBinaryToWriter
    );
  }
  f = message.getBertyGroup();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.berty.messenger.v1.BertyGroup.serializeBinaryToWriter
    );
  }
};


/**
 * optional Kind kind = 1;
 * @return {!proto.berty.messenger.v1.ParseDeepLink.Kind}
 */
proto.berty.messenger.v1.ParseDeepLink.Reply.prototype.getKind = function() {
  return /** @type {!proto.berty.messenger.v1.ParseDeepLink.Kind} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {!proto.berty.messenger.v1.ParseDeepLink.Kind} value
 * @return {!proto.berty.messenger.v1.ParseDeepLink.Reply} returns this
 */
proto.berty.messenger.v1.ParseDeepLink.Reply.prototype.setKind = function(value) {
  return jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * optional BertyID berty_id = 3;
 * @return {?proto.berty.messenger.v1.BertyID}
 */
proto.berty.messenger.v1.ParseDeepLink.Reply.prototype.getBertyId = function() {
  return /** @type{?proto.berty.messenger.v1.BertyID} */ (
    jspb.Message.getWrapperField(this, proto.berty.messenger.v1.BertyID, 3));
};


/**
 * @param {?proto.berty.messenger.v1.BertyID|undefined} value
 * @return {!proto.berty.messenger.v1.ParseDeepLink.Reply} returns this
*/
proto.berty.messenger.v1.ParseDeepLink.Reply.prototype.setBertyId = function(value) {
  return jspb.Message.setWrapperField(this, 3, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.berty.messenger.v1.ParseDeepLink.Reply} returns this
 */
proto.berty.messenger.v1.ParseDeepLink.Reply.prototype.clearBertyId = function() {
  return this.setBertyId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.berty.messenger.v1.ParseDeepLink.Reply.prototype.hasBertyId = function() {
  return jspb.Message.getField(this, 3) != null;
};


/**
 * optional BertyGroup berty_group = 4;
 * @return {?proto.berty.messenger.v1.BertyGroup}
 */
proto.berty.messenger.v1.ParseDeepLink.Reply.prototype.getBertyGroup = function() {
  return /** @type{?proto.berty.messenger.v1.BertyGroup} */ (
    jspb.Message.getWrapperField(this, proto.berty.messenger.v1.BertyGroup, 4));
};


/**
 * @param {?proto.berty.messenger.v1.BertyGroup|undefined} value
 * @return {!proto.berty.messenger.v1.ParseDeepLink.Reply} returns this
*/
proto.berty.messenger.v1.ParseDeepLink.Reply.prototype.setBertyGroup = function(value) {
  return jspb.Message.setWrapperField(this, 4, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.berty.messenger.v1.ParseDeepLink.Reply} returns this
 */
proto.berty.messenger.v1.ParseDeepLink.Reply.prototype.clearBertyGroup = function() {
  return this.setBertyGroup(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.berty.messenger.v1.ParseDeepLink.Reply.prototype.hasBertyGroup = function() {
  return jspb.Message.getField(this, 4) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.SendContactRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.SendContactRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.SendContactRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SendContactRequest.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.SendContactRequest}
 */
proto.berty.messenger.v1.SendContactRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.SendContactRequest;
  return proto.berty.messenger.v1.SendContactRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.SendContactRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.SendContactRequest}
 */
proto.berty.messenger.v1.SendContactRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.SendContactRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.SendContactRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.SendContactRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SendContactRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.SendContactRequest.Request.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.SendContactRequest.Request.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.SendContactRequest.Request} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SendContactRequest.Request.toObject = function(includeInstance, msg) {
  var f, obj = {
    bertyId: (f = msg.getBertyId()) && proto.berty.messenger.v1.BertyID.toObject(includeInstance, f),
    metadata: msg.getMetadata_asB64(),
    ownMetadata: msg.getOwnMetadata_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.SendContactRequest.Request}
 */
proto.berty.messenger.v1.SendContactRequest.Request.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.SendContactRequest.Request;
  return proto.berty.messenger.v1.SendContactRequest.Request.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.SendContactRequest.Request} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.SendContactRequest.Request}
 */
proto.berty.messenger.v1.SendContactRequest.Request.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.berty.messenger.v1.BertyID;
      reader.readMessage(value,proto.berty.messenger.v1.BertyID.deserializeBinaryFromReader);
      msg.setBertyId(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setMetadata(value);
      break;
    case 3:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setOwnMetadata(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.SendContactRequest.Request.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.SendContactRequest.Request.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.SendContactRequest.Request} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SendContactRequest.Request.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBertyId();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.berty.messenger.v1.BertyID.serializeBinaryToWriter
    );
  }
  f = message.getMetadata_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
  f = message.getOwnMetadata_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      3,
      f
    );
  }
};


/**
 * optional BertyID berty_id = 1;
 * @return {?proto.berty.messenger.v1.BertyID}
 */
proto.berty.messenger.v1.SendContactRequest.Request.prototype.getBertyId = function() {
  return /** @type{?proto.berty.messenger.v1.BertyID} */ (
    jspb.Message.getWrapperField(this, proto.berty.messenger.v1.BertyID, 1));
};


/**
 * @param {?proto.berty.messenger.v1.BertyID|undefined} value
 * @return {!proto.berty.messenger.v1.SendContactRequest.Request} returns this
*/
proto.berty.messenger.v1.SendContactRequest.Request.prototype.setBertyId = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.berty.messenger.v1.SendContactRequest.Request} returns this
 */
proto.berty.messenger.v1.SendContactRequest.Request.prototype.clearBertyId = function() {
  return this.setBertyId(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.berty.messenger.v1.SendContactRequest.Request.prototype.hasBertyId = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional bytes metadata = 2;
 * @return {!(string|Uint8Array)}
 */
proto.berty.messenger.v1.SendContactRequest.Request.prototype.getMetadata = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes metadata = 2;
 * This is a type-conversion wrapper around `getMetadata()`
 * @return {string}
 */
proto.berty.messenger.v1.SendContactRequest.Request.prototype.getMetadata_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getMetadata()));
};


/**
 * optional bytes metadata = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getMetadata()`
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.SendContactRequest.Request.prototype.getMetadata_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getMetadata()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.berty.messenger.v1.SendContactRequest.Request} returns this
 */
proto.berty.messenger.v1.SendContactRequest.Request.prototype.setMetadata = function(value) {
  return jspb.Message.setProto3BytesField(this, 2, value);
};


/**
 * optional bytes own_metadata = 3;
 * @return {!(string|Uint8Array)}
 */
proto.berty.messenger.v1.SendContactRequest.Request.prototype.getOwnMetadata = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * optional bytes own_metadata = 3;
 * This is a type-conversion wrapper around `getOwnMetadata()`
 * @return {string}
 */
proto.berty.messenger.v1.SendContactRequest.Request.prototype.getOwnMetadata_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getOwnMetadata()));
};


/**
 * optional bytes own_metadata = 3;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getOwnMetadata()`
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.SendContactRequest.Request.prototype.getOwnMetadata_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getOwnMetadata()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.berty.messenger.v1.SendContactRequest.Request} returns this
 */
proto.berty.messenger.v1.SendContactRequest.Request.prototype.setOwnMetadata = function(value) {
  return jspb.Message.setProto3BytesField(this, 3, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.SendContactRequest.Reply.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.SendContactRequest.Reply.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.SendContactRequest.Reply} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SendContactRequest.Reply.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.SendContactRequest.Reply}
 */
proto.berty.messenger.v1.SendContactRequest.Reply.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.SendContactRequest.Reply;
  return proto.berty.messenger.v1.SendContactRequest.Reply.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.SendContactRequest.Reply} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.SendContactRequest.Reply}
 */
proto.berty.messenger.v1.SendContactRequest.Reply.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.SendContactRequest.Reply.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.SendContactRequest.Reply.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.SendContactRequest.Reply} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SendContactRequest.Reply.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.SendAck.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.SendAck.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.SendAck} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SendAck.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.SendAck}
 */
proto.berty.messenger.v1.SendAck.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.SendAck;
  return proto.berty.messenger.v1.SendAck.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.SendAck} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.SendAck}
 */
proto.berty.messenger.v1.SendAck.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.SendAck.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.SendAck.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.SendAck} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SendAck.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.SendAck.Request.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.SendAck.Request.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.SendAck.Request} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SendAck.Request.toObject = function(includeInstance, msg) {
  var f, obj = {
    groupPk: msg.getGroupPk_asB64(),
    messageId: msg.getMessageId_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.SendAck.Request}
 */
proto.berty.messenger.v1.SendAck.Request.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.SendAck.Request;
  return proto.berty.messenger.v1.SendAck.Request.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.SendAck.Request} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.SendAck.Request}
 */
proto.berty.messenger.v1.SendAck.Request.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setGroupPk(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setMessageId(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.SendAck.Request.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.SendAck.Request.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.SendAck.Request} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SendAck.Request.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getGroupPk_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getMessageId_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
};


/**
 * optional bytes group_pk = 1;
 * @return {!(string|Uint8Array)}
 */
proto.berty.messenger.v1.SendAck.Request.prototype.getGroupPk = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes group_pk = 1;
 * This is a type-conversion wrapper around `getGroupPk()`
 * @return {string}
 */
proto.berty.messenger.v1.SendAck.Request.prototype.getGroupPk_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getGroupPk()));
};


/**
 * optional bytes group_pk = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getGroupPk()`
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.SendAck.Request.prototype.getGroupPk_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getGroupPk()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.berty.messenger.v1.SendAck.Request} returns this
 */
proto.berty.messenger.v1.SendAck.Request.prototype.setGroupPk = function(value) {
  return jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional bytes message_id = 2;
 * @return {!(string|Uint8Array)}
 */
proto.berty.messenger.v1.SendAck.Request.prototype.getMessageId = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes message_id = 2;
 * This is a type-conversion wrapper around `getMessageId()`
 * @return {string}
 */
proto.berty.messenger.v1.SendAck.Request.prototype.getMessageId_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getMessageId()));
};


/**
 * optional bytes message_id = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getMessageId()`
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.SendAck.Request.prototype.getMessageId_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getMessageId()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.berty.messenger.v1.SendAck.Request} returns this
 */
proto.berty.messenger.v1.SendAck.Request.prototype.setMessageId = function(value) {
  return jspb.Message.setProto3BytesField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.SendAck.Reply.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.SendAck.Reply.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.SendAck.Reply} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SendAck.Reply.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.SendAck.Reply}
 */
proto.berty.messenger.v1.SendAck.Reply.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.SendAck.Reply;
  return proto.berty.messenger.v1.SendAck.Reply.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.SendAck.Reply} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.SendAck.Reply}
 */
proto.berty.messenger.v1.SendAck.Reply.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.SendAck.Reply.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.SendAck.Reply.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.SendAck.Reply} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SendAck.Reply.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.SendMessage.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.SendMessage.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.SendMessage} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SendMessage.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.SendMessage}
 */
proto.berty.messenger.v1.SendMessage.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.SendMessage;
  return proto.berty.messenger.v1.SendMessage.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.SendMessage} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.SendMessage}
 */
proto.berty.messenger.v1.SendMessage.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.SendMessage.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.SendMessage.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.SendMessage} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SendMessage.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.SendMessage.Request.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.SendMessage.Request.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.SendMessage.Request} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SendMessage.Request.toObject = function(includeInstance, msg) {
  var f, obj = {
    groupPk: msg.getGroupPk_asB64(),
    message: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.SendMessage.Request}
 */
proto.berty.messenger.v1.SendMessage.Request.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.SendMessage.Request;
  return proto.berty.messenger.v1.SendMessage.Request.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.SendMessage.Request} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.SendMessage.Request}
 */
proto.berty.messenger.v1.SendMessage.Request.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setGroupPk(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setMessage(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.SendMessage.Request.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.SendMessage.Request.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.SendMessage.Request} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SendMessage.Request.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getGroupPk_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getMessage();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional bytes group_pk = 1;
 * @return {!(string|Uint8Array)}
 */
proto.berty.messenger.v1.SendMessage.Request.prototype.getGroupPk = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes group_pk = 1;
 * This is a type-conversion wrapper around `getGroupPk()`
 * @return {string}
 */
proto.berty.messenger.v1.SendMessage.Request.prototype.getGroupPk_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getGroupPk()));
};


/**
 * optional bytes group_pk = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getGroupPk()`
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.SendMessage.Request.prototype.getGroupPk_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getGroupPk()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.berty.messenger.v1.SendMessage.Request} returns this
 */
proto.berty.messenger.v1.SendMessage.Request.prototype.setGroupPk = function(value) {
  return jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional string message = 2;
 * @return {string}
 */
proto.berty.messenger.v1.SendMessage.Request.prototype.getMessage = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.SendMessage.Request} returns this
 */
proto.berty.messenger.v1.SendMessage.Request.prototype.setMessage = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.SendMessage.Reply.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.SendMessage.Reply.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.SendMessage.Reply} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SendMessage.Reply.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.SendMessage.Reply}
 */
proto.berty.messenger.v1.SendMessage.Reply.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.SendMessage.Reply;
  return proto.berty.messenger.v1.SendMessage.Reply.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.SendMessage.Reply} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.SendMessage.Reply}
 */
proto.berty.messenger.v1.SendMessage.Reply.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.SendMessage.Reply.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.SendMessage.Reply.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.SendMessage.Reply} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SendMessage.Reply.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.BertyID.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.BertyID.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.BertyID} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.BertyID.toObject = function(includeInstance, msg) {
  var f, obj = {
    publicRendezvousSeed: msg.getPublicRendezvousSeed_asB64(),
    accountPk: msg.getAccountPk_asB64(),
    displayName: jspb.Message.getFieldWithDefault(msg, 3, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.BertyID}
 */
proto.berty.messenger.v1.BertyID.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.BertyID;
  return proto.berty.messenger.v1.BertyID.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.BertyID} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.BertyID}
 */
proto.berty.messenger.v1.BertyID.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setPublicRendezvousSeed(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setAccountPk(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setDisplayName(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.BertyID.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.BertyID.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.BertyID} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.BertyID.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPublicRendezvousSeed_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      1,
      f
    );
  }
  f = message.getAccountPk_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
  f = message.getDisplayName();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
};


/**
 * optional bytes public_rendezvous_seed = 1;
 * @return {!(string|Uint8Array)}
 */
proto.berty.messenger.v1.BertyID.prototype.getPublicRendezvousSeed = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * optional bytes public_rendezvous_seed = 1;
 * This is a type-conversion wrapper around `getPublicRendezvousSeed()`
 * @return {string}
 */
proto.berty.messenger.v1.BertyID.prototype.getPublicRendezvousSeed_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getPublicRendezvousSeed()));
};


/**
 * optional bytes public_rendezvous_seed = 1;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getPublicRendezvousSeed()`
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.BertyID.prototype.getPublicRendezvousSeed_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getPublicRendezvousSeed()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.berty.messenger.v1.BertyID} returns this
 */
proto.berty.messenger.v1.BertyID.prototype.setPublicRendezvousSeed = function(value) {
  return jspb.Message.setProto3BytesField(this, 1, value);
};


/**
 * optional bytes account_pk = 2;
 * @return {!(string|Uint8Array)}
 */
proto.berty.messenger.v1.BertyID.prototype.getAccountPk = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes account_pk = 2;
 * This is a type-conversion wrapper around `getAccountPk()`
 * @return {string}
 */
proto.berty.messenger.v1.BertyID.prototype.getAccountPk_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getAccountPk()));
};


/**
 * optional bytes account_pk = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getAccountPk()`
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.BertyID.prototype.getAccountPk_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getAccountPk()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.berty.messenger.v1.BertyID} returns this
 */
proto.berty.messenger.v1.BertyID.prototype.setAccountPk = function(value) {
  return jspb.Message.setProto3BytesField(this, 2, value);
};


/**
 * optional string display_name = 3;
 * @return {string}
 */
proto.berty.messenger.v1.BertyID.prototype.getDisplayName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.BertyID} returns this
 */
proto.berty.messenger.v1.BertyID.prototype.setDisplayName = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.BertyGroup.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.BertyGroup.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.BertyGroup} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.BertyGroup.toObject = function(includeInstance, msg) {
  var f, obj = {
    group: (f = msg.getGroup()) && bertytypes_pb.Group.toObject(includeInstance, f),
    displayName: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.BertyGroup}
 */
proto.berty.messenger.v1.BertyGroup.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.BertyGroup;
  return proto.berty.messenger.v1.BertyGroup.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.BertyGroup} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.BertyGroup}
 */
proto.berty.messenger.v1.BertyGroup.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new bertytypes_pb.Group;
      reader.readMessage(value,bertytypes_pb.Group.deserializeBinaryFromReader);
      msg.setGroup(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setDisplayName(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.BertyGroup.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.BertyGroup.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.BertyGroup} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.BertyGroup.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getGroup();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      bertytypes_pb.Group.serializeBinaryToWriter
    );
  }
  f = message.getDisplayName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional berty.types.v1.Group group = 1;
 * @return {?proto.berty.types.v1.Group}
 */
proto.berty.messenger.v1.BertyGroup.prototype.getGroup = function() {
  return /** @type{?proto.berty.types.v1.Group} */ (
    jspb.Message.getWrapperField(this, bertytypes_pb.Group, 1));
};


/**
 * @param {?proto.berty.types.v1.Group|undefined} value
 * @return {!proto.berty.messenger.v1.BertyGroup} returns this
*/
proto.berty.messenger.v1.BertyGroup.prototype.setGroup = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.berty.messenger.v1.BertyGroup} returns this
 */
proto.berty.messenger.v1.BertyGroup.prototype.clearGroup = function() {
  return this.setGroup(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.berty.messenger.v1.BertyGroup.prototype.hasGroup = function() {
  return jspb.Message.getField(this, 1) != null;
};


/**
 * optional string display_name = 2;
 * @return {string}
 */
proto.berty.messenger.v1.BertyGroup.prototype.getDisplayName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.BertyGroup} returns this
 */
proto.berty.messenger.v1.BertyGroup.prototype.setDisplayName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.UserMessageAttachment.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.UserMessageAttachment.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.UserMessageAttachment} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.UserMessageAttachment.toObject = function(includeInstance, msg) {
  var f, obj = {
    uri: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.UserMessageAttachment}
 */
proto.berty.messenger.v1.UserMessageAttachment.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.UserMessageAttachment;
  return proto.berty.messenger.v1.UserMessageAttachment.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.UserMessageAttachment} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.UserMessageAttachment}
 */
proto.berty.messenger.v1.UserMessageAttachment.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setUri(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.UserMessageAttachment.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.UserMessageAttachment.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.UserMessageAttachment} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.UserMessageAttachment.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getUri();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional string uri = 2;
 * @return {string}
 */
proto.berty.messenger.v1.UserMessageAttachment.prototype.getUri = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.UserMessageAttachment} returns this
 */
proto.berty.messenger.v1.UserMessageAttachment.prototype.setUri = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.AppMessage.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.AppMessage.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.AppMessage} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AppMessage.toObject = function(includeInstance, msg) {
  var f, obj = {
    type: jspb.Message.getFieldWithDefault(msg, 1, 0),
    payload: msg.getPayload_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.AppMessage}
 */
proto.berty.messenger.v1.AppMessage.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.AppMessage;
  return proto.berty.messenger.v1.AppMessage.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.AppMessage} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.AppMessage}
 */
proto.berty.messenger.v1.AppMessage.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.berty.messenger.v1.AppMessage.Type} */ (reader.readEnum());
      msg.setType(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setPayload(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.AppMessage.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.AppMessage.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.AppMessage} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AppMessage.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getType();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getPayload_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
};


/**
 * @enum {number}
 */
proto.berty.messenger.v1.AppMessage.Type = {
  TYPEUNDEFINED: 0,
  TYPEUSERMESSAGE: 1,
  TYPEUSERREACTION: 2,
  TYPEGROUPINVITATION: 3,
  TYPESETGROUPNAME: 4,
  TYPESETUSERNAME: 5,
  TYPEACKNOWLEDGE: 6
};


/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.berty.messenger.v1.AppMessage.UserMessage.repeatedFields_ = [3];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.AppMessage.UserMessage.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.AppMessage.UserMessage.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.AppMessage.UserMessage} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AppMessage.UserMessage.toObject = function(includeInstance, msg) {
  var f, obj = {
    body: jspb.Message.getFieldWithDefault(msg, 2, ""),
    attachmentsList: jspb.Message.toObjectList(msg.getAttachmentsList(),
    proto.berty.messenger.v1.UserMessageAttachment.toObject, includeInstance),
    sentDate: jspb.Message.getFieldWithDefault(msg, 4, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.AppMessage.UserMessage}
 */
proto.berty.messenger.v1.AppMessage.UserMessage.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.AppMessage.UserMessage;
  return proto.berty.messenger.v1.AppMessage.UserMessage.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.AppMessage.UserMessage} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.AppMessage.UserMessage}
 */
proto.berty.messenger.v1.AppMessage.UserMessage.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setBody(value);
      break;
    case 3:
      var value = new proto.berty.messenger.v1.UserMessageAttachment;
      reader.readMessage(value,proto.berty.messenger.v1.UserMessageAttachment.deserializeBinaryFromReader);
      msg.addAttachments(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setSentDate(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.AppMessage.UserMessage.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.AppMessage.UserMessage.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.AppMessage.UserMessage} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AppMessage.UserMessage.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getBody();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getAttachmentsList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.berty.messenger.v1.UserMessageAttachment.serializeBinaryToWriter
    );
  }
  f = message.getSentDate();
  if (f !== 0) {
    writer.writeInt64(
      4,
      f
    );
  }
};


/**
 * optional string body = 2;
 * @return {string}
 */
proto.berty.messenger.v1.AppMessage.UserMessage.prototype.getBody = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.AppMessage.UserMessage} returns this
 */
proto.berty.messenger.v1.AppMessage.UserMessage.prototype.setBody = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * repeated UserMessageAttachment attachments = 3;
 * @return {!Array<!proto.berty.messenger.v1.UserMessageAttachment>}
 */
proto.berty.messenger.v1.AppMessage.UserMessage.prototype.getAttachmentsList = function() {
  return /** @type{!Array<!proto.berty.messenger.v1.UserMessageAttachment>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.berty.messenger.v1.UserMessageAttachment, 3));
};


/**
 * @param {!Array<!proto.berty.messenger.v1.UserMessageAttachment>} value
 * @return {!proto.berty.messenger.v1.AppMessage.UserMessage} returns this
*/
proto.berty.messenger.v1.AppMessage.UserMessage.prototype.setAttachmentsList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.berty.messenger.v1.UserMessageAttachment=} opt_value
 * @param {number=} opt_index
 * @return {!proto.berty.messenger.v1.UserMessageAttachment}
 */
proto.berty.messenger.v1.AppMessage.UserMessage.prototype.addAttachments = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.berty.messenger.v1.UserMessageAttachment, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.berty.messenger.v1.AppMessage.UserMessage} returns this
 */
proto.berty.messenger.v1.AppMessage.UserMessage.prototype.clearAttachmentsList = function() {
  return this.setAttachmentsList([]);
};


/**
 * optional int64 sent_date = 4;
 * @return {number}
 */
proto.berty.messenger.v1.AppMessage.UserMessage.prototype.getSentDate = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.berty.messenger.v1.AppMessage.UserMessage} returns this
 */
proto.berty.messenger.v1.AppMessage.UserMessage.prototype.setSentDate = function(value) {
  return jspb.Message.setProto3IntField(this, 4, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.AppMessage.UserReaction.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.AppMessage.UserReaction.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.AppMessage.UserReaction} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AppMessage.UserReaction.toObject = function(includeInstance, msg) {
  var f, obj = {
    emoji: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.AppMessage.UserReaction}
 */
proto.berty.messenger.v1.AppMessage.UserReaction.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.AppMessage.UserReaction;
  return proto.berty.messenger.v1.AppMessage.UserReaction.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.AppMessage.UserReaction} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.AppMessage.UserReaction}
 */
proto.berty.messenger.v1.AppMessage.UserReaction.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setEmoji(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.AppMessage.UserReaction.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.AppMessage.UserReaction.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.AppMessage.UserReaction} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AppMessage.UserReaction.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getEmoji();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional string emoji = 2;
 * @return {string}
 */
proto.berty.messenger.v1.AppMessage.UserReaction.prototype.getEmoji = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.AppMessage.UserReaction} returns this
 */
proto.berty.messenger.v1.AppMessage.UserReaction.prototype.setEmoji = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.AppMessage.GroupInvitation.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.AppMessage.GroupInvitation.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.AppMessage.GroupInvitation} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AppMessage.GroupInvitation.toObject = function(includeInstance, msg) {
  var f, obj = {
    link: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.AppMessage.GroupInvitation}
 */
proto.berty.messenger.v1.AppMessage.GroupInvitation.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.AppMessage.GroupInvitation;
  return proto.berty.messenger.v1.AppMessage.GroupInvitation.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.AppMessage.GroupInvitation} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.AppMessage.GroupInvitation}
 */
proto.berty.messenger.v1.AppMessage.GroupInvitation.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setLink(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.AppMessage.GroupInvitation.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.AppMessage.GroupInvitation.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.AppMessage.GroupInvitation} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AppMessage.GroupInvitation.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getLink();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional string link = 2;
 * @return {string}
 */
proto.berty.messenger.v1.AppMessage.GroupInvitation.prototype.getLink = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.AppMessage.GroupInvitation} returns this
 */
proto.berty.messenger.v1.AppMessage.GroupInvitation.prototype.setLink = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.AppMessage.SetGroupName.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.AppMessage.SetGroupName.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.AppMessage.SetGroupName} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AppMessage.SetGroupName.toObject = function(includeInstance, msg) {
  var f, obj = {
    name: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.AppMessage.SetGroupName}
 */
proto.berty.messenger.v1.AppMessage.SetGroupName.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.AppMessage.SetGroupName;
  return proto.berty.messenger.v1.AppMessage.SetGroupName.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.AppMessage.SetGroupName} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.AppMessage.SetGroupName}
 */
proto.berty.messenger.v1.AppMessage.SetGroupName.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.AppMessage.SetGroupName.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.AppMessage.SetGroupName.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.AppMessage.SetGroupName} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AppMessage.SetGroupName.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional string name = 2;
 * @return {string}
 */
proto.berty.messenger.v1.AppMessage.SetGroupName.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.AppMessage.SetGroupName} returns this
 */
proto.berty.messenger.v1.AppMessage.SetGroupName.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.AppMessage.SetUserName.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.AppMessage.SetUserName.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.AppMessage.SetUserName} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AppMessage.SetUserName.toObject = function(includeInstance, msg) {
  var f, obj = {
    name: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.AppMessage.SetUserName}
 */
proto.berty.messenger.v1.AppMessage.SetUserName.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.AppMessage.SetUserName;
  return proto.berty.messenger.v1.AppMessage.SetUserName.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.AppMessage.SetUserName} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.AppMessage.SetUserName}
 */
proto.berty.messenger.v1.AppMessage.SetUserName.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setName(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.AppMessage.SetUserName.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.AppMessage.SetUserName.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.AppMessage.SetUserName} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AppMessage.SetUserName.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional string name = 2;
 * @return {string}
 */
proto.berty.messenger.v1.AppMessage.SetUserName.prototype.getName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.AppMessage.SetUserName} returns this
 */
proto.berty.messenger.v1.AppMessage.SetUserName.prototype.setName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.AppMessage.Acknowledge.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.AppMessage.Acknowledge.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.AppMessage.Acknowledge} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AppMessage.Acknowledge.toObject = function(includeInstance, msg) {
  var f, obj = {
    target: jspb.Message.getFieldWithDefault(msg, 2, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.AppMessage.Acknowledge}
 */
proto.berty.messenger.v1.AppMessage.Acknowledge.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.AppMessage.Acknowledge;
  return proto.berty.messenger.v1.AppMessage.Acknowledge.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.AppMessage.Acknowledge} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.AppMessage.Acknowledge}
 */
proto.berty.messenger.v1.AppMessage.Acknowledge.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setTarget(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.AppMessage.Acknowledge.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.AppMessage.Acknowledge.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.AppMessage.Acknowledge} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AppMessage.Acknowledge.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTarget();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
};


/**
 * optional string target = 2;
 * @return {string}
 */
proto.berty.messenger.v1.AppMessage.Acknowledge.prototype.getTarget = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.AppMessage.Acknowledge} returns this
 */
proto.berty.messenger.v1.AppMessage.Acknowledge.prototype.setTarget = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional Type type = 1;
 * @return {!proto.berty.messenger.v1.AppMessage.Type}
 */
proto.berty.messenger.v1.AppMessage.prototype.getType = function() {
  return /** @type {!proto.berty.messenger.v1.AppMessage.Type} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {!proto.berty.messenger.v1.AppMessage.Type} value
 * @return {!proto.berty.messenger.v1.AppMessage} returns this
 */
proto.berty.messenger.v1.AppMessage.prototype.setType = function(value) {
  return jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * optional bytes payload = 2;
 * @return {!(string|Uint8Array)}
 */
proto.berty.messenger.v1.AppMessage.prototype.getPayload = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes payload = 2;
 * This is a type-conversion wrapper around `getPayload()`
 * @return {string}
 */
proto.berty.messenger.v1.AppMessage.prototype.getPayload_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getPayload()));
};


/**
 * optional bytes payload = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getPayload()`
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.AppMessage.prototype.getPayload_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getPayload()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.berty.messenger.v1.AppMessage} returns this
 */
proto.berty.messenger.v1.AppMessage.prototype.setPayload = function(value) {
  return jspb.Message.setProto3BytesField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.SystemInfo.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.SystemInfo.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.SystemInfo} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SystemInfo.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.SystemInfo}
 */
proto.berty.messenger.v1.SystemInfo.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.SystemInfo;
  return proto.berty.messenger.v1.SystemInfo.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.SystemInfo} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.SystemInfo}
 */
proto.berty.messenger.v1.SystemInfo.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.SystemInfo.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.SystemInfo.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.SystemInfo} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SystemInfo.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.SystemInfo.Request.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.SystemInfo.Request.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.SystemInfo.Request} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SystemInfo.Request.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.SystemInfo.Request}
 */
proto.berty.messenger.v1.SystemInfo.Request.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.SystemInfo.Request;
  return proto.berty.messenger.v1.SystemInfo.Request.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.SystemInfo.Request} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.SystemInfo.Request}
 */
proto.berty.messenger.v1.SystemInfo.Request.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.SystemInfo.Request.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.SystemInfo.Request.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.SystemInfo.Request} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SystemInfo.Request.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.SystemInfo.Reply.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.SystemInfo.Reply} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SystemInfo.Reply.toObject = function(includeInstance, msg) {
  var f, obj = {
    rlimitCur: jspb.Message.getFieldWithDefault(msg, 1, 0),
    numGoroutine: jspb.Message.getFieldWithDefault(msg, 2, 0),
    connectedPeers: jspb.Message.getFieldWithDefault(msg, 3, 0),
    nofile: jspb.Message.getFieldWithDefault(msg, 4, 0),
    tooManyOpenFiles: jspb.Message.getBooleanFieldWithDefault(msg, 5, false),
    startedAt: jspb.Message.getFieldWithDefault(msg, 10, 0),
    numCpu: jspb.Message.getFieldWithDefault(msg, 11, 0),
    goVersion: jspb.Message.getFieldWithDefault(msg, 12, ""),
    operatingSystem: jspb.Message.getFieldWithDefault(msg, 13, ""),
    hostName: jspb.Message.getFieldWithDefault(msg, 14, ""),
    arch: jspb.Message.getFieldWithDefault(msg, 15, ""),
    version: jspb.Message.getFieldWithDefault(msg, 16, ""),
    vcsRef: jspb.Message.getFieldWithDefault(msg, 17, ""),
    buildTime: jspb.Message.getFieldWithDefault(msg, 18, 0),
    selfRusage: jspb.Message.getFieldWithDefault(msg, 19, ""),
    childrenRusage: jspb.Message.getFieldWithDefault(msg, 20, ""),
    rlimitMax: jspb.Message.getFieldWithDefault(msg, 21, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.SystemInfo.Reply}
 */
proto.berty.messenger.v1.SystemInfo.Reply.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.SystemInfo.Reply;
  return proto.berty.messenger.v1.SystemInfo.Reply.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.SystemInfo.Reply} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.SystemInfo.Reply}
 */
proto.berty.messenger.v1.SystemInfo.Reply.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readUint64());
      msg.setRlimitCur(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setNumGoroutine(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setConnectedPeers(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setNofile(value);
      break;
    case 5:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setTooManyOpenFiles(value);
      break;
    case 10:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setStartedAt(value);
      break;
    case 11:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setNumCpu(value);
      break;
    case 12:
      var value = /** @type {string} */ (reader.readString());
      msg.setGoVersion(value);
      break;
    case 13:
      var value = /** @type {string} */ (reader.readString());
      msg.setOperatingSystem(value);
      break;
    case 14:
      var value = /** @type {string} */ (reader.readString());
      msg.setHostName(value);
      break;
    case 15:
      var value = /** @type {string} */ (reader.readString());
      msg.setArch(value);
      break;
    case 16:
      var value = /** @type {string} */ (reader.readString());
      msg.setVersion(value);
      break;
    case 17:
      var value = /** @type {string} */ (reader.readString());
      msg.setVcsRef(value);
      break;
    case 18:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setBuildTime(value);
      break;
    case 19:
      var value = /** @type {string} */ (reader.readString());
      msg.setSelfRusage(value);
      break;
    case 20:
      var value = /** @type {string} */ (reader.readString());
      msg.setChildrenRusage(value);
      break;
    case 21:
      var value = /** @type {number} */ (reader.readUint64());
      msg.setRlimitMax(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.SystemInfo.Reply.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.SystemInfo.Reply} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.SystemInfo.Reply.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getRlimitCur();
  if (f !== 0) {
    writer.writeUint64(
      1,
      f
    );
  }
  f = message.getNumGoroutine();
  if (f !== 0) {
    writer.writeInt64(
      2,
      f
    );
  }
  f = message.getConnectedPeers();
  if (f !== 0) {
    writer.writeInt64(
      3,
      f
    );
  }
  f = message.getNofile();
  if (f !== 0) {
    writer.writeInt64(
      4,
      f
    );
  }
  f = message.getTooManyOpenFiles();
  if (f) {
    writer.writeBool(
      5,
      f
    );
  }
  f = message.getStartedAt();
  if (f !== 0) {
    writer.writeInt64(
      10,
      f
    );
  }
  f = message.getNumCpu();
  if (f !== 0) {
    writer.writeInt64(
      11,
      f
    );
  }
  f = message.getGoVersion();
  if (f.length > 0) {
    writer.writeString(
      12,
      f
    );
  }
  f = message.getOperatingSystem();
  if (f.length > 0) {
    writer.writeString(
      13,
      f
    );
  }
  f = message.getHostName();
  if (f.length > 0) {
    writer.writeString(
      14,
      f
    );
  }
  f = message.getArch();
  if (f.length > 0) {
    writer.writeString(
      15,
      f
    );
  }
  f = message.getVersion();
  if (f.length > 0) {
    writer.writeString(
      16,
      f
    );
  }
  f = message.getVcsRef();
  if (f.length > 0) {
    writer.writeString(
      17,
      f
    );
  }
  f = message.getBuildTime();
  if (f !== 0) {
    writer.writeInt64(
      18,
      f
    );
  }
  f = message.getSelfRusage();
  if (f.length > 0) {
    writer.writeString(
      19,
      f
    );
  }
  f = message.getChildrenRusage();
  if (f.length > 0) {
    writer.writeString(
      20,
      f
    );
  }
  f = message.getRlimitMax();
  if (f !== 0) {
    writer.writeUint64(
      21,
      f
    );
  }
};


/**
 * optional uint64 rlimit_cur = 1;
 * @return {number}
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.getRlimitCur = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.berty.messenger.v1.SystemInfo.Reply} returns this
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.setRlimitCur = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional int64 num_goroutine = 2;
 * @return {number}
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.getNumGoroutine = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.berty.messenger.v1.SystemInfo.Reply} returns this
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.setNumGoroutine = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional int64 connected_peers = 3;
 * @return {number}
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.getConnectedPeers = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.berty.messenger.v1.SystemInfo.Reply} returns this
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.setConnectedPeers = function(value) {
  return jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional int64 nofile = 4;
 * @return {number}
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.getNofile = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.berty.messenger.v1.SystemInfo.Reply} returns this
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.setNofile = function(value) {
  return jspb.Message.setProto3IntField(this, 4, value);
};


/**
 * optional bool too_many_open_files = 5;
 * @return {boolean}
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.getTooManyOpenFiles = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 5, false));
};


/**
 * @param {boolean} value
 * @return {!proto.berty.messenger.v1.SystemInfo.Reply} returns this
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.setTooManyOpenFiles = function(value) {
  return jspb.Message.setProto3BooleanField(this, 5, value);
};


/**
 * optional int64 started_at = 10;
 * @return {number}
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.getStartedAt = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 10, 0));
};


/**
 * @param {number} value
 * @return {!proto.berty.messenger.v1.SystemInfo.Reply} returns this
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.setStartedAt = function(value) {
  return jspb.Message.setProto3IntField(this, 10, value);
};


/**
 * optional int64 num_cpu = 11;
 * @return {number}
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.getNumCpu = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 11, 0));
};


/**
 * @param {number} value
 * @return {!proto.berty.messenger.v1.SystemInfo.Reply} returns this
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.setNumCpu = function(value) {
  return jspb.Message.setProto3IntField(this, 11, value);
};


/**
 * optional string go_version = 12;
 * @return {string}
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.getGoVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 12, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.SystemInfo.Reply} returns this
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.setGoVersion = function(value) {
  return jspb.Message.setProto3StringField(this, 12, value);
};


/**
 * optional string operating_system = 13;
 * @return {string}
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.getOperatingSystem = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 13, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.SystemInfo.Reply} returns this
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.setOperatingSystem = function(value) {
  return jspb.Message.setProto3StringField(this, 13, value);
};


/**
 * optional string host_name = 14;
 * @return {string}
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.getHostName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 14, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.SystemInfo.Reply} returns this
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.setHostName = function(value) {
  return jspb.Message.setProto3StringField(this, 14, value);
};


/**
 * optional string arch = 15;
 * @return {string}
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.getArch = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 15, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.SystemInfo.Reply} returns this
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.setArch = function(value) {
  return jspb.Message.setProto3StringField(this, 15, value);
};


/**
 * optional string version = 16;
 * @return {string}
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.getVersion = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 16, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.SystemInfo.Reply} returns this
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.setVersion = function(value) {
  return jspb.Message.setProto3StringField(this, 16, value);
};


/**
 * optional string vcs_ref = 17;
 * @return {string}
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.getVcsRef = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 17, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.SystemInfo.Reply} returns this
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.setVcsRef = function(value) {
  return jspb.Message.setProto3StringField(this, 17, value);
};


/**
 * optional int64 build_time = 18;
 * @return {number}
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.getBuildTime = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 18, 0));
};


/**
 * @param {number} value
 * @return {!proto.berty.messenger.v1.SystemInfo.Reply} returns this
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.setBuildTime = function(value) {
  return jspb.Message.setProto3IntField(this, 18, value);
};


/**
 * optional string self_rusage = 19;
 * @return {string}
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.getSelfRusage = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 19, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.SystemInfo.Reply} returns this
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.setSelfRusage = function(value) {
  return jspb.Message.setProto3StringField(this, 19, value);
};


/**
 * optional string children_rusage = 20;
 * @return {string}
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.getChildrenRusage = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 20, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.SystemInfo.Reply} returns this
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.setChildrenRusage = function(value) {
  return jspb.Message.setProto3StringField(this, 20, value);
};


/**
 * optional uint64 rlimit_max = 21;
 * @return {number}
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.getRlimitMax = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 21, 0));
};


/**
 * @param {number} value
 * @return {!proto.berty.messenger.v1.SystemInfo.Reply} returns this
 */
proto.berty.messenger.v1.SystemInfo.Reply.prototype.setRlimitMax = function(value) {
  return jspb.Message.setProto3IntField(this, 21, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.ConversationJoin.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.ConversationJoin.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.ConversationJoin} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ConversationJoin.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.ConversationJoin}
 */
proto.berty.messenger.v1.ConversationJoin.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.ConversationJoin;
  return proto.berty.messenger.v1.ConversationJoin.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.ConversationJoin} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.ConversationJoin}
 */
proto.berty.messenger.v1.ConversationJoin.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.ConversationJoin.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.ConversationJoin.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.ConversationJoin} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ConversationJoin.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.ConversationJoin.Request.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.ConversationJoin.Request.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.ConversationJoin.Request} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ConversationJoin.Request.toObject = function(includeInstance, msg) {
  var f, obj = {
    link: jspb.Message.getFieldWithDefault(msg, 1, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.ConversationJoin.Request}
 */
proto.berty.messenger.v1.ConversationJoin.Request.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.ConversationJoin.Request;
  return proto.berty.messenger.v1.ConversationJoin.Request.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.ConversationJoin.Request} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.ConversationJoin.Request}
 */
proto.berty.messenger.v1.ConversationJoin.Request.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setLink(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.ConversationJoin.Request.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.ConversationJoin.Request.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.ConversationJoin.Request} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ConversationJoin.Request.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getLink();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string link = 1;
 * @return {string}
 */
proto.berty.messenger.v1.ConversationJoin.Request.prototype.getLink = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.ConversationJoin.Request} returns this
 */
proto.berty.messenger.v1.ConversationJoin.Request.prototype.setLink = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.ConversationJoin.Reply.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.ConversationJoin.Reply.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.ConversationJoin.Reply} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ConversationJoin.Reply.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.ConversationJoin.Reply}
 */
proto.berty.messenger.v1.ConversationJoin.Reply.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.ConversationJoin.Reply;
  return proto.berty.messenger.v1.ConversationJoin.Reply.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.ConversationJoin.Reply} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.ConversationJoin.Reply}
 */
proto.berty.messenger.v1.ConversationJoin.Reply.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.ConversationJoin.Reply.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.ConversationJoin.Reply.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.ConversationJoin.Reply} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ConversationJoin.Reply.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.Account.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.Account.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.Account} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.Account.toObject = function(includeInstance, msg) {
  var f, obj = {
    publicKey: jspb.Message.getFieldWithDefault(msg, 1, ""),
    displayName: jspb.Message.getFieldWithDefault(msg, 2, ""),
    link: jspb.Message.getFieldWithDefault(msg, 3, ""),
    state: jspb.Message.getFieldWithDefault(msg, 4, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.Account}
 */
proto.berty.messenger.v1.Account.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.Account;
  return proto.berty.messenger.v1.Account.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.Account} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.Account}
 */
proto.berty.messenger.v1.Account.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setPublicKey(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setDisplayName(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setLink(value);
      break;
    case 4:
      var value = /** @type {!proto.berty.messenger.v1.Account.State} */ (reader.readEnum());
      msg.setState(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.Account.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.Account.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.Account} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.Account.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPublicKey();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getDisplayName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getLink();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getState();
  if (f !== 0.0) {
    writer.writeEnum(
      4,
      f
    );
  }
};


/**
 * @enum {number}
 */
proto.berty.messenger.v1.Account.State = {
  UNDEFINED: 0,
  NOTREADY: 1,
  READY: 2
};

/**
 * optional string public_key = 1;
 * @return {string}
 */
proto.berty.messenger.v1.Account.prototype.getPublicKey = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.Account} returns this
 */
proto.berty.messenger.v1.Account.prototype.setPublicKey = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string display_name = 2;
 * @return {string}
 */
proto.berty.messenger.v1.Account.prototype.getDisplayName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.Account} returns this
 */
proto.berty.messenger.v1.Account.prototype.setDisplayName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string link = 3;
 * @return {string}
 */
proto.berty.messenger.v1.Account.prototype.getLink = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.Account} returns this
 */
proto.berty.messenger.v1.Account.prototype.setLink = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional State state = 4;
 * @return {!proto.berty.messenger.v1.Account.State}
 */
proto.berty.messenger.v1.Account.prototype.getState = function() {
  return /** @type {!proto.berty.messenger.v1.Account.State} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {!proto.berty.messenger.v1.Account.State} value
 * @return {!proto.berty.messenger.v1.Account} returns this
 */
proto.berty.messenger.v1.Account.prototype.setState = function(value) {
  return jspb.Message.setProto3EnumField(this, 4, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.Interaction.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.Interaction.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.Interaction} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.Interaction.toObject = function(includeInstance, msg) {
  var f, obj = {
    cid: jspb.Message.getFieldWithDefault(msg, 1, ""),
    type: jspb.Message.getFieldWithDefault(msg, 2, 0),
    conversationPublicKey: jspb.Message.getFieldWithDefault(msg, 3, ""),
    conversation: (f = msg.getConversation()) && proto.berty.messenger.v1.Conversation.toObject(includeInstance, f),
    payload: msg.getPayload_asB64(),
    isMe: jspb.Message.getBooleanFieldWithDefault(msg, 6, false)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.Interaction}
 */
proto.berty.messenger.v1.Interaction.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.Interaction;
  return proto.berty.messenger.v1.Interaction.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.Interaction} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.Interaction}
 */
proto.berty.messenger.v1.Interaction.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setCid(value);
      break;
    case 2:
      var value = /** @type {!proto.berty.messenger.v1.AppMessage.Type} */ (reader.readEnum());
      msg.setType(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setConversationPublicKey(value);
      break;
    case 4:
      var value = new proto.berty.messenger.v1.Conversation;
      reader.readMessage(value,proto.berty.messenger.v1.Conversation.deserializeBinaryFromReader);
      msg.setConversation(value);
      break;
    case 5:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setPayload(value);
      break;
    case 6:
      var value = /** @type {boolean} */ (reader.readBool());
      msg.setIsMe(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.Interaction.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.Interaction.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.Interaction} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.Interaction.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getCid();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getType();
  if (f !== 0.0) {
    writer.writeEnum(
      2,
      f
    );
  }
  f = message.getConversationPublicKey();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getConversation();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.berty.messenger.v1.Conversation.serializeBinaryToWriter
    );
  }
  f = message.getPayload_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      5,
      f
    );
  }
  f = message.getIsMe();
  if (f) {
    writer.writeBool(
      6,
      f
    );
  }
};


/**
 * optional string cid = 1;
 * @return {string}
 */
proto.berty.messenger.v1.Interaction.prototype.getCid = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.Interaction} returns this
 */
proto.berty.messenger.v1.Interaction.prototype.setCid = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional AppMessage.Type type = 2;
 * @return {!proto.berty.messenger.v1.AppMessage.Type}
 */
proto.berty.messenger.v1.Interaction.prototype.getType = function() {
  return /** @type {!proto.berty.messenger.v1.AppMessage.Type} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {!proto.berty.messenger.v1.AppMessage.Type} value
 * @return {!proto.berty.messenger.v1.Interaction} returns this
 */
proto.berty.messenger.v1.Interaction.prototype.setType = function(value) {
  return jspb.Message.setProto3EnumField(this, 2, value);
};


/**
 * optional string conversation_public_key = 3;
 * @return {string}
 */
proto.berty.messenger.v1.Interaction.prototype.getConversationPublicKey = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.Interaction} returns this
 */
proto.berty.messenger.v1.Interaction.prototype.setConversationPublicKey = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional Conversation conversation = 4;
 * @return {?proto.berty.messenger.v1.Conversation}
 */
proto.berty.messenger.v1.Interaction.prototype.getConversation = function() {
  return /** @type{?proto.berty.messenger.v1.Conversation} */ (
    jspb.Message.getWrapperField(this, proto.berty.messenger.v1.Conversation, 4));
};


/**
 * @param {?proto.berty.messenger.v1.Conversation|undefined} value
 * @return {!proto.berty.messenger.v1.Interaction} returns this
*/
proto.berty.messenger.v1.Interaction.prototype.setConversation = function(value) {
  return jspb.Message.setWrapperField(this, 4, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.berty.messenger.v1.Interaction} returns this
 */
proto.berty.messenger.v1.Interaction.prototype.clearConversation = function() {
  return this.setConversation(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.berty.messenger.v1.Interaction.prototype.hasConversation = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional bytes payload = 5;
 * @return {!(string|Uint8Array)}
 */
proto.berty.messenger.v1.Interaction.prototype.getPayload = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * optional bytes payload = 5;
 * This is a type-conversion wrapper around `getPayload()`
 * @return {string}
 */
proto.berty.messenger.v1.Interaction.prototype.getPayload_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getPayload()));
};


/**
 * optional bytes payload = 5;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getPayload()`
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.Interaction.prototype.getPayload_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getPayload()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.berty.messenger.v1.Interaction} returns this
 */
proto.berty.messenger.v1.Interaction.prototype.setPayload = function(value) {
  return jspb.Message.setProto3BytesField(this, 5, value);
};


/**
 * optional bool is_me = 6;
 * @return {boolean}
 */
proto.berty.messenger.v1.Interaction.prototype.getIsMe = function() {
  return /** @type {boolean} */ (jspb.Message.getBooleanFieldWithDefault(this, 6, false));
};


/**
 * @param {boolean} value
 * @return {!proto.berty.messenger.v1.Interaction} returns this
 */
proto.berty.messenger.v1.Interaction.prototype.setIsMe = function(value) {
  return jspb.Message.setProto3BooleanField(this, 6, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.Contact.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.Contact.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.Contact} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.Contact.toObject = function(includeInstance, msg) {
  var f, obj = {
    publicKey: jspb.Message.getFieldWithDefault(msg, 1, ""),
    displayName: jspb.Message.getFieldWithDefault(msg, 2, ""),
    conversationPublicKey: jspb.Message.getFieldWithDefault(msg, 3, ""),
    conversation: (f = msg.getConversation()) && proto.berty.messenger.v1.Conversation.toObject(includeInstance, f),
    state: jspb.Message.getFieldWithDefault(msg, 5, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.Contact}
 */
proto.berty.messenger.v1.Contact.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.Contact;
  return proto.berty.messenger.v1.Contact.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.Contact} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.Contact}
 */
proto.berty.messenger.v1.Contact.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setPublicKey(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setDisplayName(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setConversationPublicKey(value);
      break;
    case 4:
      var value = new proto.berty.messenger.v1.Conversation;
      reader.readMessage(value,proto.berty.messenger.v1.Conversation.deserializeBinaryFromReader);
      msg.setConversation(value);
      break;
    case 5:
      var value = /** @type {!proto.berty.messenger.v1.Contact.State} */ (reader.readEnum());
      msg.setState(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.Contact.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.Contact.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.Contact} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.Contact.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPublicKey();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getDisplayName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getConversationPublicKey();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getConversation();
  if (f != null) {
    writer.writeMessage(
      4,
      f,
      proto.berty.messenger.v1.Conversation.serializeBinaryToWriter
    );
  }
  f = message.getState();
  if (f !== 0.0) {
    writer.writeEnum(
      5,
      f
    );
  }
};


/**
 * @enum {number}
 */
proto.berty.messenger.v1.Contact.State = {
  UNDEFINED: 0,
  INCOMINGREQUEST: 1,
  OUTGOINGREQUESTENQUEUED: 2,
  OUTGOINGREQUESTSENT: 3,
  ESTABLISHED: 4
};

/**
 * optional string public_key = 1;
 * @return {string}
 */
proto.berty.messenger.v1.Contact.prototype.getPublicKey = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.Contact} returns this
 */
proto.berty.messenger.v1.Contact.prototype.setPublicKey = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string display_name = 2;
 * @return {string}
 */
proto.berty.messenger.v1.Contact.prototype.getDisplayName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.Contact} returns this
 */
proto.berty.messenger.v1.Contact.prototype.setDisplayName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string conversation_public_key = 3;
 * @return {string}
 */
proto.berty.messenger.v1.Contact.prototype.getConversationPublicKey = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.Contact} returns this
 */
proto.berty.messenger.v1.Contact.prototype.setConversationPublicKey = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional Conversation conversation = 4;
 * @return {?proto.berty.messenger.v1.Conversation}
 */
proto.berty.messenger.v1.Contact.prototype.getConversation = function() {
  return /** @type{?proto.berty.messenger.v1.Conversation} */ (
    jspb.Message.getWrapperField(this, proto.berty.messenger.v1.Conversation, 4));
};


/**
 * @param {?proto.berty.messenger.v1.Conversation|undefined} value
 * @return {!proto.berty.messenger.v1.Contact} returns this
*/
proto.berty.messenger.v1.Contact.prototype.setConversation = function(value) {
  return jspb.Message.setWrapperField(this, 4, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.berty.messenger.v1.Contact} returns this
 */
proto.berty.messenger.v1.Contact.prototype.clearConversation = function() {
  return this.setConversation(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.berty.messenger.v1.Contact.prototype.hasConversation = function() {
  return jspb.Message.getField(this, 4) != null;
};


/**
 * optional State state = 5;
 * @return {!proto.berty.messenger.v1.Contact.State}
 */
proto.berty.messenger.v1.Contact.prototype.getState = function() {
  return /** @type {!proto.berty.messenger.v1.Contact.State} */ (jspb.Message.getFieldWithDefault(this, 5, 0));
};


/**
 * @param {!proto.berty.messenger.v1.Contact.State} value
 * @return {!proto.berty.messenger.v1.Contact} returns this
 */
proto.berty.messenger.v1.Contact.prototype.setState = function(value) {
  return jspb.Message.setProto3EnumField(this, 5, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.Conversation.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.Conversation.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.Conversation} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.Conversation.toObject = function(includeInstance, msg) {
  var f, obj = {
    publicKey: jspb.Message.getFieldWithDefault(msg, 1, ""),
    displayName: jspb.Message.getFieldWithDefault(msg, 2, ""),
    link: jspb.Message.getFieldWithDefault(msg, 3, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.Conversation}
 */
proto.berty.messenger.v1.Conversation.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.Conversation;
  return proto.berty.messenger.v1.Conversation.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.Conversation} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.Conversation}
 */
proto.berty.messenger.v1.Conversation.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setPublicKey(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setDisplayName(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setLink(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.Conversation.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.Conversation.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.Conversation} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.Conversation.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPublicKey();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getDisplayName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getLink();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
};


/**
 * optional string public_key = 1;
 * @return {string}
 */
proto.berty.messenger.v1.Conversation.prototype.getPublicKey = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.Conversation} returns this
 */
proto.berty.messenger.v1.Conversation.prototype.setPublicKey = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string display_name = 2;
 * @return {string}
 */
proto.berty.messenger.v1.Conversation.prototype.getDisplayName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.Conversation} returns this
 */
proto.berty.messenger.v1.Conversation.prototype.setDisplayName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string link = 3;
 * @return {string}
 */
proto.berty.messenger.v1.Conversation.prototype.getLink = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.Conversation} returns this
 */
proto.berty.messenger.v1.Conversation.prototype.setLink = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.Member.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.Member.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.Member} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.Member.toObject = function(includeInstance, msg) {
  var f, obj = {
    publicKey: jspb.Message.getFieldWithDefault(msg, 1, ""),
    displayName: jspb.Message.getFieldWithDefault(msg, 2, ""),
    givenName: jspb.Message.getFieldWithDefault(msg, 3, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.Member}
 */
proto.berty.messenger.v1.Member.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.Member;
  return proto.berty.messenger.v1.Member.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.Member} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.Member}
 */
proto.berty.messenger.v1.Member.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setPublicKey(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setDisplayName(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setGivenName(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.Member.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.Member.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.Member} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.Member.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPublicKey();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getDisplayName();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getGivenName();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
};


/**
 * optional string public_key = 1;
 * @return {string}
 */
proto.berty.messenger.v1.Member.prototype.getPublicKey = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.Member} returns this
 */
proto.berty.messenger.v1.Member.prototype.setPublicKey = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string display_name = 2;
 * @return {string}
 */
proto.berty.messenger.v1.Member.prototype.getDisplayName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.Member} returns this
 */
proto.berty.messenger.v1.Member.prototype.setDisplayName = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string given_name = 3;
 * @return {string}
 */
proto.berty.messenger.v1.Member.prototype.getGivenName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.Member} returns this
 */
proto.berty.messenger.v1.Member.prototype.setGivenName = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.Device.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.Device.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.Device} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.Device.toObject = function(includeInstance, msg) {
  var f, obj = {
    publicKey: jspb.Message.getFieldWithDefault(msg, 1, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.Device}
 */
proto.berty.messenger.v1.Device.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.Device;
  return proto.berty.messenger.v1.Device.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.Device} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.Device}
 */
proto.berty.messenger.v1.Device.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setPublicKey(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.Device.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.Device.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.Device} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.Device.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPublicKey();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string public_key = 1;
 * @return {string}
 */
proto.berty.messenger.v1.Device.prototype.getPublicKey = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.Device} returns this
 */
proto.berty.messenger.v1.Device.prototype.setPublicKey = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.StreamEvent.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.StreamEvent.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.StreamEvent} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.StreamEvent.toObject = function(includeInstance, msg) {
  var f, obj = {
    type: jspb.Message.getFieldWithDefault(msg, 1, 0),
    payload: msg.getPayload_asB64()
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.StreamEvent}
 */
proto.berty.messenger.v1.StreamEvent.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.StreamEvent;
  return proto.berty.messenger.v1.StreamEvent.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.StreamEvent} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.StreamEvent}
 */
proto.berty.messenger.v1.StreamEvent.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.berty.messenger.v1.StreamEvent.Type} */ (reader.readEnum());
      msg.setType(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setPayload(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.StreamEvent.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.StreamEvent.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.StreamEvent} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.StreamEvent.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getType();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getPayload_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
};


/**
 * @enum {number}
 */
proto.berty.messenger.v1.StreamEvent.Type = {
  TYPECONVERSATIONUPDATED: 0,
  TYPECONVERSATIONDELETED: 1,
  TYPEINTERACTIONUPDATED: 2,
  TYPECONTACTUPDATED: 3,
  TYPEACCOUNTUPDATED: 4,
  TYPELISTEND: 5
};




if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.StreamEvent.ConversationUpdated.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.StreamEvent.ConversationUpdated.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.StreamEvent.ConversationUpdated} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.StreamEvent.ConversationUpdated.toObject = function(includeInstance, msg) {
  var f, obj = {
    conversation: (f = msg.getConversation()) && proto.berty.messenger.v1.Conversation.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.StreamEvent.ConversationUpdated}
 */
proto.berty.messenger.v1.StreamEvent.ConversationUpdated.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.StreamEvent.ConversationUpdated;
  return proto.berty.messenger.v1.StreamEvent.ConversationUpdated.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.StreamEvent.ConversationUpdated} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.StreamEvent.ConversationUpdated}
 */
proto.berty.messenger.v1.StreamEvent.ConversationUpdated.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.berty.messenger.v1.Conversation;
      reader.readMessage(value,proto.berty.messenger.v1.Conversation.deserializeBinaryFromReader);
      msg.setConversation(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.StreamEvent.ConversationUpdated.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.StreamEvent.ConversationUpdated.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.StreamEvent.ConversationUpdated} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.StreamEvent.ConversationUpdated.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getConversation();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.berty.messenger.v1.Conversation.serializeBinaryToWriter
    );
  }
};


/**
 * optional Conversation conversation = 1;
 * @return {?proto.berty.messenger.v1.Conversation}
 */
proto.berty.messenger.v1.StreamEvent.ConversationUpdated.prototype.getConversation = function() {
  return /** @type{?proto.berty.messenger.v1.Conversation} */ (
    jspb.Message.getWrapperField(this, proto.berty.messenger.v1.Conversation, 1));
};


/**
 * @param {?proto.berty.messenger.v1.Conversation|undefined} value
 * @return {!proto.berty.messenger.v1.StreamEvent.ConversationUpdated} returns this
*/
proto.berty.messenger.v1.StreamEvent.ConversationUpdated.prototype.setConversation = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.berty.messenger.v1.StreamEvent.ConversationUpdated} returns this
 */
proto.berty.messenger.v1.StreamEvent.ConversationUpdated.prototype.clearConversation = function() {
  return this.setConversation(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.berty.messenger.v1.StreamEvent.ConversationUpdated.prototype.hasConversation = function() {
  return jspb.Message.getField(this, 1) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.StreamEvent.ConversationDeleted.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.StreamEvent.ConversationDeleted.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.StreamEvent.ConversationDeleted} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.StreamEvent.ConversationDeleted.toObject = function(includeInstance, msg) {
  var f, obj = {
    publicKey: jspb.Message.getFieldWithDefault(msg, 1, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.StreamEvent.ConversationDeleted}
 */
proto.berty.messenger.v1.StreamEvent.ConversationDeleted.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.StreamEvent.ConversationDeleted;
  return proto.berty.messenger.v1.StreamEvent.ConversationDeleted.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.StreamEvent.ConversationDeleted} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.StreamEvent.ConversationDeleted}
 */
proto.berty.messenger.v1.StreamEvent.ConversationDeleted.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setPublicKey(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.StreamEvent.ConversationDeleted.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.StreamEvent.ConversationDeleted.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.StreamEvent.ConversationDeleted} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.StreamEvent.ConversationDeleted.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPublicKey();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string public_key = 1;
 * @return {string}
 */
proto.berty.messenger.v1.StreamEvent.ConversationDeleted.prototype.getPublicKey = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.StreamEvent.ConversationDeleted} returns this
 */
proto.berty.messenger.v1.StreamEvent.ConversationDeleted.prototype.setPublicKey = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.StreamEvent.InteractionUpdated.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.StreamEvent.InteractionUpdated.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.StreamEvent.InteractionUpdated} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.StreamEvent.InteractionUpdated.toObject = function(includeInstance, msg) {
  var f, obj = {
    interaction: (f = msg.getInteraction()) && proto.berty.messenger.v1.Interaction.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.StreamEvent.InteractionUpdated}
 */
proto.berty.messenger.v1.StreamEvent.InteractionUpdated.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.StreamEvent.InteractionUpdated;
  return proto.berty.messenger.v1.StreamEvent.InteractionUpdated.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.StreamEvent.InteractionUpdated} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.StreamEvent.InteractionUpdated}
 */
proto.berty.messenger.v1.StreamEvent.InteractionUpdated.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.berty.messenger.v1.Interaction;
      reader.readMessage(value,proto.berty.messenger.v1.Interaction.deserializeBinaryFromReader);
      msg.setInteraction(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.StreamEvent.InteractionUpdated.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.StreamEvent.InteractionUpdated.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.StreamEvent.InteractionUpdated} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.StreamEvent.InteractionUpdated.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getInteraction();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.berty.messenger.v1.Interaction.serializeBinaryToWriter
    );
  }
};


/**
 * optional Interaction interaction = 1;
 * @return {?proto.berty.messenger.v1.Interaction}
 */
proto.berty.messenger.v1.StreamEvent.InteractionUpdated.prototype.getInteraction = function() {
  return /** @type{?proto.berty.messenger.v1.Interaction} */ (
    jspb.Message.getWrapperField(this, proto.berty.messenger.v1.Interaction, 1));
};


/**
 * @param {?proto.berty.messenger.v1.Interaction|undefined} value
 * @return {!proto.berty.messenger.v1.StreamEvent.InteractionUpdated} returns this
*/
proto.berty.messenger.v1.StreamEvent.InteractionUpdated.prototype.setInteraction = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.berty.messenger.v1.StreamEvent.InteractionUpdated} returns this
 */
proto.berty.messenger.v1.StreamEvent.InteractionUpdated.prototype.clearInteraction = function() {
  return this.setInteraction(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.berty.messenger.v1.StreamEvent.InteractionUpdated.prototype.hasInteraction = function() {
  return jspb.Message.getField(this, 1) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.StreamEvent.ContactUpdated.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.StreamEvent.ContactUpdated.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.StreamEvent.ContactUpdated} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.StreamEvent.ContactUpdated.toObject = function(includeInstance, msg) {
  var f, obj = {
    contact: (f = msg.getContact()) && proto.berty.messenger.v1.Contact.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.StreamEvent.ContactUpdated}
 */
proto.berty.messenger.v1.StreamEvent.ContactUpdated.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.StreamEvent.ContactUpdated;
  return proto.berty.messenger.v1.StreamEvent.ContactUpdated.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.StreamEvent.ContactUpdated} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.StreamEvent.ContactUpdated}
 */
proto.berty.messenger.v1.StreamEvent.ContactUpdated.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.berty.messenger.v1.Contact;
      reader.readMessage(value,proto.berty.messenger.v1.Contact.deserializeBinaryFromReader);
      msg.setContact(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.StreamEvent.ContactUpdated.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.StreamEvent.ContactUpdated.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.StreamEvent.ContactUpdated} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.StreamEvent.ContactUpdated.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getContact();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.berty.messenger.v1.Contact.serializeBinaryToWriter
    );
  }
};


/**
 * optional Contact contact = 1;
 * @return {?proto.berty.messenger.v1.Contact}
 */
proto.berty.messenger.v1.StreamEvent.ContactUpdated.prototype.getContact = function() {
  return /** @type{?proto.berty.messenger.v1.Contact} */ (
    jspb.Message.getWrapperField(this, proto.berty.messenger.v1.Contact, 1));
};


/**
 * @param {?proto.berty.messenger.v1.Contact|undefined} value
 * @return {!proto.berty.messenger.v1.StreamEvent.ContactUpdated} returns this
*/
proto.berty.messenger.v1.StreamEvent.ContactUpdated.prototype.setContact = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.berty.messenger.v1.StreamEvent.ContactUpdated} returns this
 */
proto.berty.messenger.v1.StreamEvent.ContactUpdated.prototype.clearContact = function() {
  return this.setContact(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.berty.messenger.v1.StreamEvent.ContactUpdated.prototype.hasContact = function() {
  return jspb.Message.getField(this, 1) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.StreamEvent.AccountUpdated.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.StreamEvent.AccountUpdated.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.StreamEvent.AccountUpdated} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.StreamEvent.AccountUpdated.toObject = function(includeInstance, msg) {
  var f, obj = {
    account: (f = msg.getAccount()) && proto.berty.messenger.v1.Account.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.StreamEvent.AccountUpdated}
 */
proto.berty.messenger.v1.StreamEvent.AccountUpdated.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.StreamEvent.AccountUpdated;
  return proto.berty.messenger.v1.StreamEvent.AccountUpdated.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.StreamEvent.AccountUpdated} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.StreamEvent.AccountUpdated}
 */
proto.berty.messenger.v1.StreamEvent.AccountUpdated.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.berty.messenger.v1.Account;
      reader.readMessage(value,proto.berty.messenger.v1.Account.deserializeBinaryFromReader);
      msg.setAccount(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.StreamEvent.AccountUpdated.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.StreamEvent.AccountUpdated.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.StreamEvent.AccountUpdated} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.StreamEvent.AccountUpdated.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAccount();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.berty.messenger.v1.Account.serializeBinaryToWriter
    );
  }
};


/**
 * optional Account account = 1;
 * @return {?proto.berty.messenger.v1.Account}
 */
proto.berty.messenger.v1.StreamEvent.AccountUpdated.prototype.getAccount = function() {
  return /** @type{?proto.berty.messenger.v1.Account} */ (
    jspb.Message.getWrapperField(this, proto.berty.messenger.v1.Account, 1));
};


/**
 * @param {?proto.berty.messenger.v1.Account|undefined} value
 * @return {!proto.berty.messenger.v1.StreamEvent.AccountUpdated} returns this
*/
proto.berty.messenger.v1.StreamEvent.AccountUpdated.prototype.setAccount = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.berty.messenger.v1.StreamEvent.AccountUpdated} returns this
 */
proto.berty.messenger.v1.StreamEvent.AccountUpdated.prototype.clearAccount = function() {
  return this.setAccount(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.berty.messenger.v1.StreamEvent.AccountUpdated.prototype.hasAccount = function() {
  return jspb.Message.getField(this, 1) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.StreamEvent.ListEnd.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.StreamEvent.ListEnd.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.StreamEvent.ListEnd} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.StreamEvent.ListEnd.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.StreamEvent.ListEnd}
 */
proto.berty.messenger.v1.StreamEvent.ListEnd.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.StreamEvent.ListEnd;
  return proto.berty.messenger.v1.StreamEvent.ListEnd.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.StreamEvent.ListEnd} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.StreamEvent.ListEnd}
 */
proto.berty.messenger.v1.StreamEvent.ListEnd.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.StreamEvent.ListEnd.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.StreamEvent.ListEnd.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.StreamEvent.ListEnd} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.StreamEvent.ListEnd.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};


/**
 * optional Type type = 1;
 * @return {!proto.berty.messenger.v1.StreamEvent.Type}
 */
proto.berty.messenger.v1.StreamEvent.prototype.getType = function() {
  return /** @type {!proto.berty.messenger.v1.StreamEvent.Type} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {!proto.berty.messenger.v1.StreamEvent.Type} value
 * @return {!proto.berty.messenger.v1.StreamEvent} returns this
 */
proto.berty.messenger.v1.StreamEvent.prototype.setType = function(value) {
  return jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * optional bytes payload = 2;
 * @return {!(string|Uint8Array)}
 */
proto.berty.messenger.v1.StreamEvent.prototype.getPayload = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes payload = 2;
 * This is a type-conversion wrapper around `getPayload()`
 * @return {string}
 */
proto.berty.messenger.v1.StreamEvent.prototype.getPayload_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getPayload()));
};


/**
 * optional bytes payload = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getPayload()`
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.StreamEvent.prototype.getPayload_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getPayload()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.berty.messenger.v1.StreamEvent} returns this
 */
proto.berty.messenger.v1.StreamEvent.prototype.setPayload = function(value) {
  return jspb.Message.setProto3BytesField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.ConversationStream.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.ConversationStream.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.ConversationStream} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ConversationStream.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.ConversationStream}
 */
proto.berty.messenger.v1.ConversationStream.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.ConversationStream;
  return proto.berty.messenger.v1.ConversationStream.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.ConversationStream} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.ConversationStream}
 */
proto.berty.messenger.v1.ConversationStream.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.ConversationStream.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.ConversationStream.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.ConversationStream} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ConversationStream.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.ConversationStream.Request.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.ConversationStream.Request.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.ConversationStream.Request} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ConversationStream.Request.toObject = function(includeInstance, msg) {
  var f, obj = {
    count: jspb.Message.getFieldWithDefault(msg, 1, 0),
    page: jspb.Message.getFieldWithDefault(msg, 2, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.ConversationStream.Request}
 */
proto.berty.messenger.v1.ConversationStream.Request.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.ConversationStream.Request;
  return proto.berty.messenger.v1.ConversationStream.Request.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.ConversationStream.Request} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.ConversationStream.Request}
 */
proto.berty.messenger.v1.ConversationStream.Request.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readUint64());
      msg.setCount(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint64());
      msg.setPage(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.ConversationStream.Request.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.ConversationStream.Request.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.ConversationStream.Request} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ConversationStream.Request.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getCount();
  if (f !== 0) {
    writer.writeUint64(
      1,
      f
    );
  }
  f = message.getPage();
  if (f !== 0) {
    writer.writeUint64(
      2,
      f
    );
  }
};


/**
 * optional uint64 count = 1;
 * @return {number}
 */
proto.berty.messenger.v1.ConversationStream.Request.prototype.getCount = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.berty.messenger.v1.ConversationStream.Request} returns this
 */
proto.berty.messenger.v1.ConversationStream.Request.prototype.setCount = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional uint64 page = 2;
 * @return {number}
 */
proto.berty.messenger.v1.ConversationStream.Request.prototype.getPage = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.berty.messenger.v1.ConversationStream.Request} returns this
 */
proto.berty.messenger.v1.ConversationStream.Request.prototype.setPage = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.ConversationStream.Reply.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.ConversationStream.Reply.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.ConversationStream.Reply} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ConversationStream.Reply.toObject = function(includeInstance, msg) {
  var f, obj = {
    conversation: (f = msg.getConversation()) && proto.berty.messenger.v1.Conversation.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.ConversationStream.Reply}
 */
proto.berty.messenger.v1.ConversationStream.Reply.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.ConversationStream.Reply;
  return proto.berty.messenger.v1.ConversationStream.Reply.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.ConversationStream.Reply} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.ConversationStream.Reply}
 */
proto.berty.messenger.v1.ConversationStream.Reply.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.berty.messenger.v1.Conversation;
      reader.readMessage(value,proto.berty.messenger.v1.Conversation.deserializeBinaryFromReader);
      msg.setConversation(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.ConversationStream.Reply.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.ConversationStream.Reply.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.ConversationStream.Reply} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ConversationStream.Reply.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getConversation();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.berty.messenger.v1.Conversation.serializeBinaryToWriter
    );
  }
};


/**
 * optional Conversation conversation = 1;
 * @return {?proto.berty.messenger.v1.Conversation}
 */
proto.berty.messenger.v1.ConversationStream.Reply.prototype.getConversation = function() {
  return /** @type{?proto.berty.messenger.v1.Conversation} */ (
    jspb.Message.getWrapperField(this, proto.berty.messenger.v1.Conversation, 1));
};


/**
 * @param {?proto.berty.messenger.v1.Conversation|undefined} value
 * @return {!proto.berty.messenger.v1.ConversationStream.Reply} returns this
*/
proto.berty.messenger.v1.ConversationStream.Reply.prototype.setConversation = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.berty.messenger.v1.ConversationStream.Reply} returns this
 */
proto.berty.messenger.v1.ConversationStream.Reply.prototype.clearConversation = function() {
  return this.setConversation(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.berty.messenger.v1.ConversationStream.Reply.prototype.hasConversation = function() {
  return jspb.Message.getField(this, 1) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.ConversationCreate.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.ConversationCreate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.ConversationCreate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ConversationCreate.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.ConversationCreate}
 */
proto.berty.messenger.v1.ConversationCreate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.ConversationCreate;
  return proto.berty.messenger.v1.ConversationCreate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.ConversationCreate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.ConversationCreate}
 */
proto.berty.messenger.v1.ConversationCreate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.ConversationCreate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.ConversationCreate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.ConversationCreate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ConversationCreate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.berty.messenger.v1.ConversationCreate.Request.repeatedFields_ = [2];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.ConversationCreate.Request.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.ConversationCreate.Request.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.ConversationCreate.Request} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ConversationCreate.Request.toObject = function(includeInstance, msg) {
  var f, obj = {
    displayName: jspb.Message.getFieldWithDefault(msg, 1, ""),
    contactsToInviteList: (f = jspb.Message.getRepeatedField(msg, 2)) == null ? undefined : f
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.ConversationCreate.Request}
 */
proto.berty.messenger.v1.ConversationCreate.Request.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.ConversationCreate.Request;
  return proto.berty.messenger.v1.ConversationCreate.Request.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.ConversationCreate.Request} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.ConversationCreate.Request}
 */
proto.berty.messenger.v1.ConversationCreate.Request.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setDisplayName(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.addContactsToInvite(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.ConversationCreate.Request.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.ConversationCreate.Request.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.ConversationCreate.Request} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ConversationCreate.Request.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDisplayName();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getContactsToInviteList();
  if (f.length > 0) {
    writer.writeRepeatedString(
      2,
      f
    );
  }
};


/**
 * optional string display_name = 1;
 * @return {string}
 */
proto.berty.messenger.v1.ConversationCreate.Request.prototype.getDisplayName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.ConversationCreate.Request} returns this
 */
proto.berty.messenger.v1.ConversationCreate.Request.prototype.setDisplayName = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * repeated string contacts_to_invite = 2;
 * @return {!Array<string>}
 */
proto.berty.messenger.v1.ConversationCreate.Request.prototype.getContactsToInviteList = function() {
  return /** @type {!Array<string>} */ (jspb.Message.getRepeatedField(this, 2));
};


/**
 * @param {!Array<string>} value
 * @return {!proto.berty.messenger.v1.ConversationCreate.Request} returns this
 */
proto.berty.messenger.v1.ConversationCreate.Request.prototype.setContactsToInviteList = function(value) {
  return jspb.Message.setField(this, 2, value || []);
};


/**
 * @param {string} value
 * @param {number=} opt_index
 * @return {!proto.berty.messenger.v1.ConversationCreate.Request} returns this
 */
proto.berty.messenger.v1.ConversationCreate.Request.prototype.addContactsToInvite = function(value, opt_index) {
  return jspb.Message.addToRepeatedField(this, 2, value, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.berty.messenger.v1.ConversationCreate.Request} returns this
 */
proto.berty.messenger.v1.ConversationCreate.Request.prototype.clearContactsToInviteList = function() {
  return this.setContactsToInviteList([]);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.ConversationCreate.Reply.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.ConversationCreate.Reply.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.ConversationCreate.Reply} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ConversationCreate.Reply.toObject = function(includeInstance, msg) {
  var f, obj = {
    publicKey: jspb.Message.getFieldWithDefault(msg, 1, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.ConversationCreate.Reply}
 */
proto.berty.messenger.v1.ConversationCreate.Reply.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.ConversationCreate.Reply;
  return proto.berty.messenger.v1.ConversationCreate.Reply.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.ConversationCreate.Reply} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.ConversationCreate.Reply}
 */
proto.berty.messenger.v1.ConversationCreate.Reply.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setPublicKey(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.ConversationCreate.Reply.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.ConversationCreate.Reply.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.ConversationCreate.Reply} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ConversationCreate.Reply.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPublicKey();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string public_key = 1;
 * @return {string}
 */
proto.berty.messenger.v1.ConversationCreate.Reply.prototype.getPublicKey = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.ConversationCreate.Reply} returns this
 */
proto.berty.messenger.v1.ConversationCreate.Reply.prototype.setPublicKey = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.AccountGet.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.AccountGet.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.AccountGet} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AccountGet.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.AccountGet}
 */
proto.berty.messenger.v1.AccountGet.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.AccountGet;
  return proto.berty.messenger.v1.AccountGet.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.AccountGet} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.AccountGet}
 */
proto.berty.messenger.v1.AccountGet.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.AccountGet.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.AccountGet.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.AccountGet} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AccountGet.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.AccountGet.Request.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.AccountGet.Request.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.AccountGet.Request} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AccountGet.Request.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.AccountGet.Request}
 */
proto.berty.messenger.v1.AccountGet.Request.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.AccountGet.Request;
  return proto.berty.messenger.v1.AccountGet.Request.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.AccountGet.Request} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.AccountGet.Request}
 */
proto.berty.messenger.v1.AccountGet.Request.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.AccountGet.Request.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.AccountGet.Request.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.AccountGet.Request} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AccountGet.Request.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.AccountGet.Reply.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.AccountGet.Reply.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.AccountGet.Reply} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AccountGet.Reply.toObject = function(includeInstance, msg) {
  var f, obj = {
    account: (f = msg.getAccount()) && proto.berty.messenger.v1.Account.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.AccountGet.Reply}
 */
proto.berty.messenger.v1.AccountGet.Reply.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.AccountGet.Reply;
  return proto.berty.messenger.v1.AccountGet.Reply.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.AccountGet.Reply} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.AccountGet.Reply}
 */
proto.berty.messenger.v1.AccountGet.Reply.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.berty.messenger.v1.Account;
      reader.readMessage(value,proto.berty.messenger.v1.Account.deserializeBinaryFromReader);
      msg.setAccount(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.AccountGet.Reply.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.AccountGet.Reply.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.AccountGet.Reply} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AccountGet.Reply.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getAccount();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.berty.messenger.v1.Account.serializeBinaryToWriter
    );
  }
};


/**
 * optional Account account = 1;
 * @return {?proto.berty.messenger.v1.Account}
 */
proto.berty.messenger.v1.AccountGet.Reply.prototype.getAccount = function() {
  return /** @type{?proto.berty.messenger.v1.Account} */ (
    jspb.Message.getWrapperField(this, proto.berty.messenger.v1.Account, 1));
};


/**
 * @param {?proto.berty.messenger.v1.Account|undefined} value
 * @return {!proto.berty.messenger.v1.AccountGet.Reply} returns this
*/
proto.berty.messenger.v1.AccountGet.Reply.prototype.setAccount = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.berty.messenger.v1.AccountGet.Reply} returns this
 */
proto.berty.messenger.v1.AccountGet.Reply.prototype.clearAccount = function() {
  return this.setAccount(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.berty.messenger.v1.AccountGet.Reply.prototype.hasAccount = function() {
  return jspb.Message.getField(this, 1) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.EventStream.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.EventStream.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.EventStream} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.EventStream.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.EventStream}
 */
proto.berty.messenger.v1.EventStream.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.EventStream;
  return proto.berty.messenger.v1.EventStream.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.EventStream} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.EventStream}
 */
proto.berty.messenger.v1.EventStream.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.EventStream.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.EventStream.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.EventStream} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.EventStream.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.EventStream.Request.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.EventStream.Request.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.EventStream.Request} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.EventStream.Request.toObject = function(includeInstance, msg) {
  var f, obj = {
    count: jspb.Message.getFieldWithDefault(msg, 1, 0),
    page: jspb.Message.getFieldWithDefault(msg, 2, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.EventStream.Request}
 */
proto.berty.messenger.v1.EventStream.Request.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.EventStream.Request;
  return proto.berty.messenger.v1.EventStream.Request.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.EventStream.Request} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.EventStream.Request}
 */
proto.berty.messenger.v1.EventStream.Request.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {number} */ (reader.readUint64());
      msg.setCount(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readUint64());
      msg.setPage(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.EventStream.Request.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.EventStream.Request.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.EventStream.Request} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.EventStream.Request.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getCount();
  if (f !== 0) {
    writer.writeUint64(
      1,
      f
    );
  }
  f = message.getPage();
  if (f !== 0) {
    writer.writeUint64(
      2,
      f
    );
  }
};


/**
 * optional uint64 count = 1;
 * @return {number}
 */
proto.berty.messenger.v1.EventStream.Request.prototype.getCount = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {number} value
 * @return {!proto.berty.messenger.v1.EventStream.Request} returns this
 */
proto.berty.messenger.v1.EventStream.Request.prototype.setCount = function(value) {
  return jspb.Message.setProto3IntField(this, 1, value);
};


/**
 * optional uint64 page = 2;
 * @return {number}
 */
proto.berty.messenger.v1.EventStream.Request.prototype.getPage = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.berty.messenger.v1.EventStream.Request} returns this
 */
proto.berty.messenger.v1.EventStream.Request.prototype.setPage = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.EventStream.Reply.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.EventStream.Reply.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.EventStream.Reply} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.EventStream.Reply.toObject = function(includeInstance, msg) {
  var f, obj = {
    event: (f = msg.getEvent()) && proto.berty.messenger.v1.StreamEvent.toObject(includeInstance, f)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.EventStream.Reply}
 */
proto.berty.messenger.v1.EventStream.Reply.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.EventStream.Reply;
  return proto.berty.messenger.v1.EventStream.Reply.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.EventStream.Reply} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.EventStream.Reply}
 */
proto.berty.messenger.v1.EventStream.Reply.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = new proto.berty.messenger.v1.StreamEvent;
      reader.readMessage(value,proto.berty.messenger.v1.StreamEvent.deserializeBinaryFromReader);
      msg.setEvent(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.EventStream.Reply.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.EventStream.Reply.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.EventStream.Reply} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.EventStream.Reply.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getEvent();
  if (f != null) {
    writer.writeMessage(
      1,
      f,
      proto.berty.messenger.v1.StreamEvent.serializeBinaryToWriter
    );
  }
};


/**
 * optional StreamEvent event = 1;
 * @return {?proto.berty.messenger.v1.StreamEvent}
 */
proto.berty.messenger.v1.EventStream.Reply.prototype.getEvent = function() {
  return /** @type{?proto.berty.messenger.v1.StreamEvent} */ (
    jspb.Message.getWrapperField(this, proto.berty.messenger.v1.StreamEvent, 1));
};


/**
 * @param {?proto.berty.messenger.v1.StreamEvent|undefined} value
 * @return {!proto.berty.messenger.v1.EventStream.Reply} returns this
*/
proto.berty.messenger.v1.EventStream.Reply.prototype.setEvent = function(value) {
  return jspb.Message.setWrapperField(this, 1, value);
};


/**
 * Clears the message field making it undefined.
 * @return {!proto.berty.messenger.v1.EventStream.Reply} returns this
 */
proto.berty.messenger.v1.EventStream.Reply.prototype.clearEvent = function() {
  return this.setEvent(undefined);
};


/**
 * Returns whether this field is set.
 * @return {boolean}
 */
proto.berty.messenger.v1.EventStream.Reply.prototype.hasEvent = function() {
  return jspb.Message.getField(this, 1) != null;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.ContactMetadata.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.ContactMetadata.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.ContactMetadata} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ContactMetadata.toObject = function(includeInstance, msg) {
  var f, obj = {
    displayName: jspb.Message.getFieldWithDefault(msg, 1, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.ContactMetadata}
 */
proto.berty.messenger.v1.ContactMetadata.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.ContactMetadata;
  return proto.berty.messenger.v1.ContactMetadata.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.ContactMetadata} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.ContactMetadata}
 */
proto.berty.messenger.v1.ContactMetadata.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setDisplayName(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.ContactMetadata.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.ContactMetadata.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.ContactMetadata} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ContactMetadata.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDisplayName();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string display_name = 1;
 * @return {string}
 */
proto.berty.messenger.v1.ContactMetadata.prototype.getDisplayName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.ContactMetadata} returns this
 */
proto.berty.messenger.v1.ContactMetadata.prototype.setDisplayName = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.AccountUpdate.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.AccountUpdate.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.AccountUpdate} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AccountUpdate.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.AccountUpdate}
 */
proto.berty.messenger.v1.AccountUpdate.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.AccountUpdate;
  return proto.berty.messenger.v1.AccountUpdate.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.AccountUpdate} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.AccountUpdate}
 */
proto.berty.messenger.v1.AccountUpdate.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.AccountUpdate.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.AccountUpdate.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.AccountUpdate} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AccountUpdate.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.AccountUpdate.Request.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.AccountUpdate.Request.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.AccountUpdate.Request} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AccountUpdate.Request.toObject = function(includeInstance, msg) {
  var f, obj = {
    displayName: jspb.Message.getFieldWithDefault(msg, 1, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.AccountUpdate.Request}
 */
proto.berty.messenger.v1.AccountUpdate.Request.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.AccountUpdate.Request;
  return proto.berty.messenger.v1.AccountUpdate.Request.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.AccountUpdate.Request} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.AccountUpdate.Request}
 */
proto.berty.messenger.v1.AccountUpdate.Request.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setDisplayName(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.AccountUpdate.Request.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.AccountUpdate.Request.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.AccountUpdate.Request} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AccountUpdate.Request.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getDisplayName();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string display_name = 1;
 * @return {string}
 */
proto.berty.messenger.v1.AccountUpdate.Request.prototype.getDisplayName = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.AccountUpdate.Request} returns this
 */
proto.berty.messenger.v1.AccountUpdate.Request.prototype.setDisplayName = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.AccountUpdate.Reply.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.AccountUpdate.Reply.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.AccountUpdate.Reply} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AccountUpdate.Reply.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.AccountUpdate.Reply}
 */
proto.berty.messenger.v1.AccountUpdate.Reply.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.AccountUpdate.Reply;
  return proto.berty.messenger.v1.AccountUpdate.Reply.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.AccountUpdate.Reply} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.AccountUpdate.Reply}
 */
proto.berty.messenger.v1.AccountUpdate.Reply.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.AccountUpdate.Reply.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.AccountUpdate.Reply.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.AccountUpdate.Reply} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.AccountUpdate.Reply.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.ContactRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.ContactRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.ContactRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ContactRequest.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.ContactRequest}
 */
proto.berty.messenger.v1.ContactRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.ContactRequest;
  return proto.berty.messenger.v1.ContactRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.ContactRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.ContactRequest}
 */
proto.berty.messenger.v1.ContactRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.ContactRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.ContactRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.ContactRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ContactRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.ContactRequest.Request.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.ContactRequest.Request.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.ContactRequest.Request} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ContactRequest.Request.toObject = function(includeInstance, msg) {
  var f, obj = {
    link: jspb.Message.getFieldWithDefault(msg, 1, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.ContactRequest.Request}
 */
proto.berty.messenger.v1.ContactRequest.Request.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.ContactRequest.Request;
  return proto.berty.messenger.v1.ContactRequest.Request.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.ContactRequest.Request} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.ContactRequest.Request}
 */
proto.berty.messenger.v1.ContactRequest.Request.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setLink(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.ContactRequest.Request.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.ContactRequest.Request.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.ContactRequest.Request} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ContactRequest.Request.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getLink();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string link = 1;
 * @return {string}
 */
proto.berty.messenger.v1.ContactRequest.Request.prototype.getLink = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.ContactRequest.Request} returns this
 */
proto.berty.messenger.v1.ContactRequest.Request.prototype.setLink = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.ContactRequest.Reply.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.ContactRequest.Reply.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.ContactRequest.Reply} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ContactRequest.Reply.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.ContactRequest.Reply}
 */
proto.berty.messenger.v1.ContactRequest.Reply.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.ContactRequest.Reply;
  return proto.berty.messenger.v1.ContactRequest.Reply.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.ContactRequest.Reply} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.ContactRequest.Reply}
 */
proto.berty.messenger.v1.ContactRequest.Reply.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.ContactRequest.Reply.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.ContactRequest.Reply.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.ContactRequest.Reply} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ContactRequest.Reply.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.ContactAccept.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.ContactAccept.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.ContactAccept} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ContactAccept.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.ContactAccept}
 */
proto.berty.messenger.v1.ContactAccept.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.ContactAccept;
  return proto.berty.messenger.v1.ContactAccept.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.ContactAccept} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.ContactAccept}
 */
proto.berty.messenger.v1.ContactAccept.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.ContactAccept.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.ContactAccept.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.ContactAccept} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ContactAccept.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.ContactAccept.Request.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.ContactAccept.Request.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.ContactAccept.Request} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ContactAccept.Request.toObject = function(includeInstance, msg) {
  var f, obj = {
    publicKey: jspb.Message.getFieldWithDefault(msg, 1, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.ContactAccept.Request}
 */
proto.berty.messenger.v1.ContactAccept.Request.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.ContactAccept.Request;
  return proto.berty.messenger.v1.ContactAccept.Request.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.ContactAccept.Request} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.ContactAccept.Request}
 */
proto.berty.messenger.v1.ContactAccept.Request.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setPublicKey(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.ContactAccept.Request.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.ContactAccept.Request.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.ContactAccept.Request} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ContactAccept.Request.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getPublicKey();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string public_key = 1;
 * @return {string}
 */
proto.berty.messenger.v1.ContactAccept.Request.prototype.getPublicKey = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.ContactAccept.Request} returns this
 */
proto.berty.messenger.v1.ContactAccept.Request.prototype.setPublicKey = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.ContactAccept.Reply.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.ContactAccept.Reply.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.ContactAccept.Reply} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ContactAccept.Reply.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.ContactAccept.Reply}
 */
proto.berty.messenger.v1.ContactAccept.Reply.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.ContactAccept.Reply;
  return proto.berty.messenger.v1.ContactAccept.Reply.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.ContactAccept.Reply} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.ContactAccept.Reply}
 */
proto.berty.messenger.v1.ContactAccept.Reply.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.ContactAccept.Reply.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.ContactAccept.Reply.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.ContactAccept.Reply} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.ContactAccept.Reply.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.Interact.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.Interact.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.Interact} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.Interact.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.Interact}
 */
proto.berty.messenger.v1.Interact.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.Interact;
  return proto.berty.messenger.v1.Interact.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.Interact} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.Interact}
 */
proto.berty.messenger.v1.Interact.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.Interact.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.Interact.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.Interact} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.Interact.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.Interact.Request.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.Interact.Request.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.Interact.Request} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.Interact.Request.toObject = function(includeInstance, msg) {
  var f, obj = {
    type: jspb.Message.getFieldWithDefault(msg, 1, 0),
    payload: msg.getPayload_asB64(),
    conversationPublicKey: jspb.Message.getFieldWithDefault(msg, 3, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.Interact.Request}
 */
proto.berty.messenger.v1.Interact.Request.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.Interact.Request;
  return proto.berty.messenger.v1.Interact.Request.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.Interact.Request} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.Interact.Request}
 */
proto.berty.messenger.v1.Interact.Request.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {!proto.berty.messenger.v1.AppMessage.Type} */ (reader.readEnum());
      msg.setType(value);
      break;
    case 2:
      var value = /** @type {!Uint8Array} */ (reader.readBytes());
      msg.setPayload(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setConversationPublicKey(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.Interact.Request.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.Interact.Request.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.Interact.Request} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.Interact.Request.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getType();
  if (f !== 0.0) {
    writer.writeEnum(
      1,
      f
    );
  }
  f = message.getPayload_asU8();
  if (f.length > 0) {
    writer.writeBytes(
      2,
      f
    );
  }
  f = message.getConversationPublicKey();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
};


/**
 * optional AppMessage.Type type = 1;
 * @return {!proto.berty.messenger.v1.AppMessage.Type}
 */
proto.berty.messenger.v1.Interact.Request.prototype.getType = function() {
  return /** @type {!proto.berty.messenger.v1.AppMessage.Type} */ (jspb.Message.getFieldWithDefault(this, 1, 0));
};


/**
 * @param {!proto.berty.messenger.v1.AppMessage.Type} value
 * @return {!proto.berty.messenger.v1.Interact.Request} returns this
 */
proto.berty.messenger.v1.Interact.Request.prototype.setType = function(value) {
  return jspb.Message.setProto3EnumField(this, 1, value);
};


/**
 * optional bytes payload = 2;
 * @return {!(string|Uint8Array)}
 */
proto.berty.messenger.v1.Interact.Request.prototype.getPayload = function() {
  return /** @type {!(string|Uint8Array)} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * optional bytes payload = 2;
 * This is a type-conversion wrapper around `getPayload()`
 * @return {string}
 */
proto.berty.messenger.v1.Interact.Request.prototype.getPayload_asB64 = function() {
  return /** @type {string} */ (jspb.Message.bytesAsB64(
      this.getPayload()));
};


/**
 * optional bytes payload = 2;
 * Note that Uint8Array is not supported on all browsers.
 * @see http://caniuse.com/Uint8Array
 * This is a type-conversion wrapper around `getPayload()`
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.Interact.Request.prototype.getPayload_asU8 = function() {
  return /** @type {!Uint8Array} */ (jspb.Message.bytesAsU8(
      this.getPayload()));
};


/**
 * @param {!(string|Uint8Array)} value
 * @return {!proto.berty.messenger.v1.Interact.Request} returns this
 */
proto.berty.messenger.v1.Interact.Request.prototype.setPayload = function(value) {
  return jspb.Message.setProto3BytesField(this, 2, value);
};


/**
 * optional string conversation_public_key = 3;
 * @return {string}
 */
proto.berty.messenger.v1.Interact.Request.prototype.getConversationPublicKey = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.berty.messenger.v1.Interact.Request} returns this
 */
proto.berty.messenger.v1.Interact.Request.prototype.setConversationPublicKey = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.berty.messenger.v1.Interact.Reply.prototype.toObject = function(opt_includeInstance) {
  return proto.berty.messenger.v1.Interact.Reply.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.berty.messenger.v1.Interact.Reply} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.Interact.Reply.toObject = function(includeInstance, msg) {
  var f, obj = {

  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.berty.messenger.v1.Interact.Reply}
 */
proto.berty.messenger.v1.Interact.Reply.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.berty.messenger.v1.Interact.Reply;
  return proto.berty.messenger.v1.Interact.Reply.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.berty.messenger.v1.Interact.Reply} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.berty.messenger.v1.Interact.Reply}
 */
proto.berty.messenger.v1.Interact.Reply.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.berty.messenger.v1.Interact.Reply.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.berty.messenger.v1.Interact.Reply.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.berty.messenger.v1.Interact.Reply} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.berty.messenger.v1.Interact.Reply.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
};


goog.object.extend(exports, proto.berty.messenger.v1);
