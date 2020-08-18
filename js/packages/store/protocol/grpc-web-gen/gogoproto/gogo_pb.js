// source: gogoproto/gogo.proto
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

var google_protobuf_descriptor_pb = require('google-protobuf/google/protobuf/descriptor_pb.js');
goog.object.extend(proto, google_protobuf_descriptor_pb);
goog.exportSymbol('proto.gogoproto.benchgen', null, global);
goog.exportSymbol('proto.gogoproto.benchgenAll', null, global);
goog.exportSymbol('proto.gogoproto.castkey', null, global);
goog.exportSymbol('proto.gogoproto.casttype', null, global);
goog.exportSymbol('proto.gogoproto.castvalue', null, global);
goog.exportSymbol('proto.gogoproto.compare', null, global);
goog.exportSymbol('proto.gogoproto.compareAll', null, global);
goog.exportSymbol('proto.gogoproto.customname', null, global);
goog.exportSymbol('proto.gogoproto.customtype', null, global);
goog.exportSymbol('proto.gogoproto.description', null, global);
goog.exportSymbol('proto.gogoproto.descriptionAll', null, global);
goog.exportSymbol('proto.gogoproto.embed', null, global);
goog.exportSymbol('proto.gogoproto.enumCustomname', null, global);
goog.exportSymbol('proto.gogoproto.enumStringer', null, global);
goog.exportSymbol('proto.gogoproto.enumStringerAll', null, global);
goog.exportSymbol('proto.gogoproto.enumdecl', null, global);
goog.exportSymbol('proto.gogoproto.enumdeclAll', null, global);
goog.exportSymbol('proto.gogoproto.enumvalueCustomname', null, global);
goog.exportSymbol('proto.gogoproto.equal', null, global);
goog.exportSymbol('proto.gogoproto.equalAll', null, global);
goog.exportSymbol('proto.gogoproto.face', null, global);
goog.exportSymbol('proto.gogoproto.faceAll', null, global);
goog.exportSymbol('proto.gogoproto.gogoprotoImport', null, global);
goog.exportSymbol('proto.gogoproto.goprotoEnumPrefix', null, global);
goog.exportSymbol('proto.gogoproto.goprotoEnumPrefixAll', null, global);
goog.exportSymbol('proto.gogoproto.goprotoEnumStringer', null, global);
goog.exportSymbol('proto.gogoproto.goprotoEnumStringerAll', null, global);
goog.exportSymbol('proto.gogoproto.goprotoExtensionsMap', null, global);
goog.exportSymbol('proto.gogoproto.goprotoExtensionsMapAll', null, global);
goog.exportSymbol('proto.gogoproto.goprotoGetters', null, global);
goog.exportSymbol('proto.gogoproto.goprotoGettersAll', null, global);
goog.exportSymbol('proto.gogoproto.goprotoRegistration', null, global);
goog.exportSymbol('proto.gogoproto.goprotoSizecache', null, global);
goog.exportSymbol('proto.gogoproto.goprotoSizecacheAll', null, global);
goog.exportSymbol('proto.gogoproto.goprotoStringer', null, global);
goog.exportSymbol('proto.gogoproto.goprotoStringerAll', null, global);
goog.exportSymbol('proto.gogoproto.goprotoUnkeyed', null, global);
goog.exportSymbol('proto.gogoproto.goprotoUnkeyedAll', null, global);
goog.exportSymbol('proto.gogoproto.goprotoUnrecognized', null, global);
goog.exportSymbol('proto.gogoproto.goprotoUnrecognizedAll', null, global);
goog.exportSymbol('proto.gogoproto.gostring', null, global);
goog.exportSymbol('proto.gogoproto.gostringAll', null, global);
goog.exportSymbol('proto.gogoproto.jsontag', null, global);
goog.exportSymbol('proto.gogoproto.marshaler', null, global);
goog.exportSymbol('proto.gogoproto.marshalerAll', null, global);
goog.exportSymbol('proto.gogoproto.messagename', null, global);
goog.exportSymbol('proto.gogoproto.messagenameAll', null, global);
goog.exportSymbol('proto.gogoproto.moretags', null, global);
goog.exportSymbol('proto.gogoproto.nullable', null, global);
goog.exportSymbol('proto.gogoproto.onlyone', null, global);
goog.exportSymbol('proto.gogoproto.onlyoneAll', null, global);
goog.exportSymbol('proto.gogoproto.populate', null, global);
goog.exportSymbol('proto.gogoproto.populateAll', null, global);
goog.exportSymbol('proto.gogoproto.protosizer', null, global);
goog.exportSymbol('proto.gogoproto.protosizerAll', null, global);
goog.exportSymbol('proto.gogoproto.sizer', null, global);
goog.exportSymbol('proto.gogoproto.sizerAll', null, global);
goog.exportSymbol('proto.gogoproto.stableMarshaler', null, global);
goog.exportSymbol('proto.gogoproto.stableMarshalerAll', null, global);
goog.exportSymbol('proto.gogoproto.stdduration', null, global);
goog.exportSymbol('proto.gogoproto.stdtime', null, global);
goog.exportSymbol('proto.gogoproto.stringer', null, global);
goog.exportSymbol('proto.gogoproto.stringerAll', null, global);
goog.exportSymbol('proto.gogoproto.testgen', null, global);
goog.exportSymbol('proto.gogoproto.testgenAll', null, global);
goog.exportSymbol('proto.gogoproto.typedecl', null, global);
goog.exportSymbol('proto.gogoproto.typedeclAll', null, global);
goog.exportSymbol('proto.gogoproto.unmarshaler', null, global);
goog.exportSymbol('proto.gogoproto.unmarshalerAll', null, global);
goog.exportSymbol('proto.gogoproto.unsafeMarshaler', null, global);
goog.exportSymbol('proto.gogoproto.unsafeMarshalerAll', null, global);
goog.exportSymbol('proto.gogoproto.unsafeUnmarshaler', null, global);
goog.exportSymbol('proto.gogoproto.unsafeUnmarshalerAll', null, global);
goog.exportSymbol('proto.gogoproto.verboseEqual', null, global);
goog.exportSymbol('proto.gogoproto.verboseEqualAll', null, global);
goog.exportSymbol('proto.gogoproto.wktpointer', null, global);

/**
 * A tuple of {field number, class constructor} for the extension
 * field named `goprotoEnumPrefix`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.goprotoEnumPrefix = new jspb.ExtensionFieldInfo(
    62001,
    {goprotoEnumPrefix: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.EnumOptions.extensionsBinary[62001] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.goprotoEnumPrefix,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.EnumOptions.extensions[62001] = proto.gogoproto.goprotoEnumPrefix;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `goprotoEnumStringer`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.goprotoEnumStringer = new jspb.ExtensionFieldInfo(
    62021,
    {goprotoEnumStringer: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.EnumOptions.extensionsBinary[62021] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.goprotoEnumStringer,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.EnumOptions.extensions[62021] = proto.gogoproto.goprotoEnumStringer;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `enumStringer`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.enumStringer = new jspb.ExtensionFieldInfo(
    62022,
    {enumStringer: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.EnumOptions.extensionsBinary[62022] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.enumStringer,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.EnumOptions.extensions[62022] = proto.gogoproto.enumStringer;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `enumCustomname`.
 * @type {!jspb.ExtensionFieldInfo<string>}
 */
proto.gogoproto.enumCustomname = new jspb.ExtensionFieldInfo(
    62023,
    {enumCustomname: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.EnumOptions.extensionsBinary[62023] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.enumCustomname,
    jspb.BinaryReader.prototype.readString,
    jspb.BinaryWriter.prototype.writeString,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.EnumOptions.extensions[62023] = proto.gogoproto.enumCustomname;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `enumdecl`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.enumdecl = new jspb.ExtensionFieldInfo(
    62024,
    {enumdecl: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.EnumOptions.extensionsBinary[62024] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.enumdecl,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.EnumOptions.extensions[62024] = proto.gogoproto.enumdecl;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `enumvalueCustomname`.
 * @type {!jspb.ExtensionFieldInfo<string>}
 */
proto.gogoproto.enumvalueCustomname = new jspb.ExtensionFieldInfo(
    66001,
    {enumvalueCustomname: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.EnumValueOptions.extensionsBinary[66001] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.enumvalueCustomname,
    jspb.BinaryReader.prototype.readString,
    jspb.BinaryWriter.prototype.writeString,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.EnumValueOptions.extensions[66001] = proto.gogoproto.enumvalueCustomname;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `goprotoGettersAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.goprotoGettersAll = new jspb.ExtensionFieldInfo(
    63001,
    {goprotoGettersAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63001] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.goprotoGettersAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63001] = proto.gogoproto.goprotoGettersAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `goprotoEnumPrefixAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.goprotoEnumPrefixAll = new jspb.ExtensionFieldInfo(
    63002,
    {goprotoEnumPrefixAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63002] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.goprotoEnumPrefixAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63002] = proto.gogoproto.goprotoEnumPrefixAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `goprotoStringerAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.goprotoStringerAll = new jspb.ExtensionFieldInfo(
    63003,
    {goprotoStringerAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63003] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.goprotoStringerAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63003] = proto.gogoproto.goprotoStringerAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `verboseEqualAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.verboseEqualAll = new jspb.ExtensionFieldInfo(
    63004,
    {verboseEqualAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63004] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.verboseEqualAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63004] = proto.gogoproto.verboseEqualAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `faceAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.faceAll = new jspb.ExtensionFieldInfo(
    63005,
    {faceAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63005] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.faceAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63005] = proto.gogoproto.faceAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `gostringAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.gostringAll = new jspb.ExtensionFieldInfo(
    63006,
    {gostringAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63006] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.gostringAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63006] = proto.gogoproto.gostringAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `populateAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.populateAll = new jspb.ExtensionFieldInfo(
    63007,
    {populateAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63007] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.populateAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63007] = proto.gogoproto.populateAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `stringerAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.stringerAll = new jspb.ExtensionFieldInfo(
    63008,
    {stringerAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63008] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.stringerAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63008] = proto.gogoproto.stringerAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `onlyoneAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.onlyoneAll = new jspb.ExtensionFieldInfo(
    63009,
    {onlyoneAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63009] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.onlyoneAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63009] = proto.gogoproto.onlyoneAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `equalAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.equalAll = new jspb.ExtensionFieldInfo(
    63013,
    {equalAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63013] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.equalAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63013] = proto.gogoproto.equalAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `descriptionAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.descriptionAll = new jspb.ExtensionFieldInfo(
    63014,
    {descriptionAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63014] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.descriptionAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63014] = proto.gogoproto.descriptionAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `testgenAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.testgenAll = new jspb.ExtensionFieldInfo(
    63015,
    {testgenAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63015] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.testgenAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63015] = proto.gogoproto.testgenAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `benchgenAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.benchgenAll = new jspb.ExtensionFieldInfo(
    63016,
    {benchgenAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63016] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.benchgenAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63016] = proto.gogoproto.benchgenAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `marshalerAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.marshalerAll = new jspb.ExtensionFieldInfo(
    63017,
    {marshalerAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63017] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.marshalerAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63017] = proto.gogoproto.marshalerAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `unmarshalerAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.unmarshalerAll = new jspb.ExtensionFieldInfo(
    63018,
    {unmarshalerAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63018] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.unmarshalerAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63018] = proto.gogoproto.unmarshalerAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `stableMarshalerAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.stableMarshalerAll = new jspb.ExtensionFieldInfo(
    63019,
    {stableMarshalerAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63019] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.stableMarshalerAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63019] = proto.gogoproto.stableMarshalerAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `sizerAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.sizerAll = new jspb.ExtensionFieldInfo(
    63020,
    {sizerAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63020] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.sizerAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63020] = proto.gogoproto.sizerAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `goprotoEnumStringerAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.goprotoEnumStringerAll = new jspb.ExtensionFieldInfo(
    63021,
    {goprotoEnumStringerAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63021] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.goprotoEnumStringerAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63021] = proto.gogoproto.goprotoEnumStringerAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `enumStringerAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.enumStringerAll = new jspb.ExtensionFieldInfo(
    63022,
    {enumStringerAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63022] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.enumStringerAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63022] = proto.gogoproto.enumStringerAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `unsafeMarshalerAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.unsafeMarshalerAll = new jspb.ExtensionFieldInfo(
    63023,
    {unsafeMarshalerAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63023] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.unsafeMarshalerAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63023] = proto.gogoproto.unsafeMarshalerAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `unsafeUnmarshalerAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.unsafeUnmarshalerAll = new jspb.ExtensionFieldInfo(
    63024,
    {unsafeUnmarshalerAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63024] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.unsafeUnmarshalerAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63024] = proto.gogoproto.unsafeUnmarshalerAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `goprotoExtensionsMapAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.goprotoExtensionsMapAll = new jspb.ExtensionFieldInfo(
    63025,
    {goprotoExtensionsMapAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63025] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.goprotoExtensionsMapAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63025] = proto.gogoproto.goprotoExtensionsMapAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `goprotoUnrecognizedAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.goprotoUnrecognizedAll = new jspb.ExtensionFieldInfo(
    63026,
    {goprotoUnrecognizedAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63026] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.goprotoUnrecognizedAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63026] = proto.gogoproto.goprotoUnrecognizedAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `gogoprotoImport`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.gogoprotoImport = new jspb.ExtensionFieldInfo(
    63027,
    {gogoprotoImport: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63027] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.gogoprotoImport,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63027] = proto.gogoproto.gogoprotoImport;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `protosizerAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.protosizerAll = new jspb.ExtensionFieldInfo(
    63028,
    {protosizerAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63028] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.protosizerAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63028] = proto.gogoproto.protosizerAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `compareAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.compareAll = new jspb.ExtensionFieldInfo(
    63029,
    {compareAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63029] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.compareAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63029] = proto.gogoproto.compareAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `typedeclAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.typedeclAll = new jspb.ExtensionFieldInfo(
    63030,
    {typedeclAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63030] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.typedeclAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63030] = proto.gogoproto.typedeclAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `enumdeclAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.enumdeclAll = new jspb.ExtensionFieldInfo(
    63031,
    {enumdeclAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63031] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.enumdeclAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63031] = proto.gogoproto.enumdeclAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `goprotoRegistration`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.goprotoRegistration = new jspb.ExtensionFieldInfo(
    63032,
    {goprotoRegistration: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63032] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.goprotoRegistration,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63032] = proto.gogoproto.goprotoRegistration;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `messagenameAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.messagenameAll = new jspb.ExtensionFieldInfo(
    63033,
    {messagenameAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63033] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.messagenameAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63033] = proto.gogoproto.messagenameAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `goprotoSizecacheAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.goprotoSizecacheAll = new jspb.ExtensionFieldInfo(
    63034,
    {goprotoSizecacheAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63034] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.goprotoSizecacheAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63034] = proto.gogoproto.goprotoSizecacheAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `goprotoUnkeyedAll`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.goprotoUnkeyedAll = new jspb.ExtensionFieldInfo(
    63035,
    {goprotoUnkeyedAll: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FileOptions.extensionsBinary[63035] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.goprotoUnkeyedAll,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FileOptions.extensions[63035] = proto.gogoproto.goprotoUnkeyedAll;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `goprotoGetters`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.goprotoGetters = new jspb.ExtensionFieldInfo(
    64001,
    {goprotoGetters: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64001] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.goprotoGetters,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64001] = proto.gogoproto.goprotoGetters;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `goprotoStringer`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.goprotoStringer = new jspb.ExtensionFieldInfo(
    64003,
    {goprotoStringer: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64003] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.goprotoStringer,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64003] = proto.gogoproto.goprotoStringer;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `verboseEqual`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.verboseEqual = new jspb.ExtensionFieldInfo(
    64004,
    {verboseEqual: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64004] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.verboseEqual,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64004] = proto.gogoproto.verboseEqual;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `face`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.face = new jspb.ExtensionFieldInfo(
    64005,
    {face: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64005] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.face,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64005] = proto.gogoproto.face;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `gostring`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.gostring = new jspb.ExtensionFieldInfo(
    64006,
    {gostring: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64006] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.gostring,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64006] = proto.gogoproto.gostring;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `populate`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.populate = new jspb.ExtensionFieldInfo(
    64007,
    {populate: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64007] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.populate,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64007] = proto.gogoproto.populate;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `stringer`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.stringer = new jspb.ExtensionFieldInfo(
    67008,
    {stringer: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[67008] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.stringer,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[67008] = proto.gogoproto.stringer;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `onlyone`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.onlyone = new jspb.ExtensionFieldInfo(
    64009,
    {onlyone: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64009] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.onlyone,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64009] = proto.gogoproto.onlyone;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `equal`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.equal = new jspb.ExtensionFieldInfo(
    64013,
    {equal: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64013] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.equal,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64013] = proto.gogoproto.equal;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `description`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.description = new jspb.ExtensionFieldInfo(
    64014,
    {description: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64014] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.description,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64014] = proto.gogoproto.description;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `testgen`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.testgen = new jspb.ExtensionFieldInfo(
    64015,
    {testgen: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64015] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.testgen,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64015] = proto.gogoproto.testgen;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `benchgen`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.benchgen = new jspb.ExtensionFieldInfo(
    64016,
    {benchgen: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64016] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.benchgen,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64016] = proto.gogoproto.benchgen;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `marshaler`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.marshaler = new jspb.ExtensionFieldInfo(
    64017,
    {marshaler: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64017] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.marshaler,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64017] = proto.gogoproto.marshaler;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `unmarshaler`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.unmarshaler = new jspb.ExtensionFieldInfo(
    64018,
    {unmarshaler: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64018] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.unmarshaler,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64018] = proto.gogoproto.unmarshaler;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `stableMarshaler`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.stableMarshaler = new jspb.ExtensionFieldInfo(
    64019,
    {stableMarshaler: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64019] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.stableMarshaler,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64019] = proto.gogoproto.stableMarshaler;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `sizer`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.sizer = new jspb.ExtensionFieldInfo(
    64020,
    {sizer: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64020] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.sizer,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64020] = proto.gogoproto.sizer;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `unsafeMarshaler`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.unsafeMarshaler = new jspb.ExtensionFieldInfo(
    64023,
    {unsafeMarshaler: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64023] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.unsafeMarshaler,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64023] = proto.gogoproto.unsafeMarshaler;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `unsafeUnmarshaler`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.unsafeUnmarshaler = new jspb.ExtensionFieldInfo(
    64024,
    {unsafeUnmarshaler: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64024] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.unsafeUnmarshaler,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64024] = proto.gogoproto.unsafeUnmarshaler;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `goprotoExtensionsMap`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.goprotoExtensionsMap = new jspb.ExtensionFieldInfo(
    64025,
    {goprotoExtensionsMap: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64025] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.goprotoExtensionsMap,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64025] = proto.gogoproto.goprotoExtensionsMap;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `goprotoUnrecognized`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.goprotoUnrecognized = new jspb.ExtensionFieldInfo(
    64026,
    {goprotoUnrecognized: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64026] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.goprotoUnrecognized,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64026] = proto.gogoproto.goprotoUnrecognized;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `protosizer`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.protosizer = new jspb.ExtensionFieldInfo(
    64028,
    {protosizer: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64028] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.protosizer,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64028] = proto.gogoproto.protosizer;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `compare`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.compare = new jspb.ExtensionFieldInfo(
    64029,
    {compare: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64029] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.compare,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64029] = proto.gogoproto.compare;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `typedecl`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.typedecl = new jspb.ExtensionFieldInfo(
    64030,
    {typedecl: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64030] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.typedecl,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64030] = proto.gogoproto.typedecl;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `messagename`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.messagename = new jspb.ExtensionFieldInfo(
    64033,
    {messagename: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64033] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.messagename,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64033] = proto.gogoproto.messagename;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `goprotoSizecache`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.goprotoSizecache = new jspb.ExtensionFieldInfo(
    64034,
    {goprotoSizecache: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64034] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.goprotoSizecache,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64034] = proto.gogoproto.goprotoSizecache;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `goprotoUnkeyed`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.goprotoUnkeyed = new jspb.ExtensionFieldInfo(
    64035,
    {goprotoUnkeyed: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.MessageOptions.extensionsBinary[64035] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.goprotoUnkeyed,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.MessageOptions.extensions[64035] = proto.gogoproto.goprotoUnkeyed;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `nullable`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.nullable = new jspb.ExtensionFieldInfo(
    65001,
    {nullable: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FieldOptions.extensionsBinary[65001] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.nullable,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FieldOptions.extensions[65001] = proto.gogoproto.nullable;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `embed`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.embed = new jspb.ExtensionFieldInfo(
    65002,
    {embed: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FieldOptions.extensionsBinary[65002] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.embed,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FieldOptions.extensions[65002] = proto.gogoproto.embed;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `customtype`.
 * @type {!jspb.ExtensionFieldInfo<string>}
 */
proto.gogoproto.customtype = new jspb.ExtensionFieldInfo(
    65003,
    {customtype: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FieldOptions.extensionsBinary[65003] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.customtype,
    jspb.BinaryReader.prototype.readString,
    jspb.BinaryWriter.prototype.writeString,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FieldOptions.extensions[65003] = proto.gogoproto.customtype;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `customname`.
 * @type {!jspb.ExtensionFieldInfo<string>}
 */
proto.gogoproto.customname = new jspb.ExtensionFieldInfo(
    65004,
    {customname: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FieldOptions.extensionsBinary[65004] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.customname,
    jspb.BinaryReader.prototype.readString,
    jspb.BinaryWriter.prototype.writeString,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FieldOptions.extensions[65004] = proto.gogoproto.customname;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `jsontag`.
 * @type {!jspb.ExtensionFieldInfo<string>}
 */
proto.gogoproto.jsontag = new jspb.ExtensionFieldInfo(
    65005,
    {jsontag: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FieldOptions.extensionsBinary[65005] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.jsontag,
    jspb.BinaryReader.prototype.readString,
    jspb.BinaryWriter.prototype.writeString,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FieldOptions.extensions[65005] = proto.gogoproto.jsontag;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `moretags`.
 * @type {!jspb.ExtensionFieldInfo<string>}
 */
proto.gogoproto.moretags = new jspb.ExtensionFieldInfo(
    65006,
    {moretags: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FieldOptions.extensionsBinary[65006] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.moretags,
    jspb.BinaryReader.prototype.readString,
    jspb.BinaryWriter.prototype.writeString,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FieldOptions.extensions[65006] = proto.gogoproto.moretags;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `casttype`.
 * @type {!jspb.ExtensionFieldInfo<string>}
 */
proto.gogoproto.casttype = new jspb.ExtensionFieldInfo(
    65007,
    {casttype: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FieldOptions.extensionsBinary[65007] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.casttype,
    jspb.BinaryReader.prototype.readString,
    jspb.BinaryWriter.prototype.writeString,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FieldOptions.extensions[65007] = proto.gogoproto.casttype;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `castkey`.
 * @type {!jspb.ExtensionFieldInfo<string>}
 */
proto.gogoproto.castkey = new jspb.ExtensionFieldInfo(
    65008,
    {castkey: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FieldOptions.extensionsBinary[65008] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.castkey,
    jspb.BinaryReader.prototype.readString,
    jspb.BinaryWriter.prototype.writeString,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FieldOptions.extensions[65008] = proto.gogoproto.castkey;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `castvalue`.
 * @type {!jspb.ExtensionFieldInfo<string>}
 */
proto.gogoproto.castvalue = new jspb.ExtensionFieldInfo(
    65009,
    {castvalue: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FieldOptions.extensionsBinary[65009] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.castvalue,
    jspb.BinaryReader.prototype.readString,
    jspb.BinaryWriter.prototype.writeString,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FieldOptions.extensions[65009] = proto.gogoproto.castvalue;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `stdtime`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.stdtime = new jspb.ExtensionFieldInfo(
    65010,
    {stdtime: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FieldOptions.extensionsBinary[65010] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.stdtime,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FieldOptions.extensions[65010] = proto.gogoproto.stdtime;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `stdduration`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.stdduration = new jspb.ExtensionFieldInfo(
    65011,
    {stdduration: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FieldOptions.extensionsBinary[65011] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.stdduration,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FieldOptions.extensions[65011] = proto.gogoproto.stdduration;


/**
 * A tuple of {field number, class constructor} for the extension
 * field named `wktpointer`.
 * @type {!jspb.ExtensionFieldInfo<boolean>}
 */
proto.gogoproto.wktpointer = new jspb.ExtensionFieldInfo(
    65012,
    {wktpointer: 0},
    null,
     /** @type {?function((boolean|undefined),!jspb.Message=): !Object} */ (
         null),
    0);

google_protobuf_descriptor_pb.FieldOptions.extensionsBinary[65012] = new jspb.ExtensionFieldBinaryInfo(
    proto.gogoproto.wktpointer,
    jspb.BinaryReader.prototype.readBool,
    jspb.BinaryWriter.prototype.writeBool,
    undefined,
    undefined,
    false);
// This registers the extension field with the extended class, so that
// toObject() will function correctly.
google_protobuf_descriptor_pb.FieldOptions.extensions[65012] = proto.gogoproto.wktpointer;

goog.object.extend(exports, proto.gogoproto);
