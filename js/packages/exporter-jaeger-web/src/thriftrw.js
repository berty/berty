(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.thriftrw = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var TYPE = Object.create(null);
TYPE.STOP = 0;
TYPE.VOID = 1;
TYPE.BOOL = 2;
TYPE.BYTE = 3;
TYPE.I8 = 3;
TYPE.DOUBLE = 4;
TYPE.I16 = 6;
TYPE.I32 = 8;
TYPE.I64 = 10;
TYPE.STRING = 11;
TYPE.STRUCT = 12;
TYPE.MAP = 13;
TYPE.SET = 14;
TYPE.LIST = 15;

module.exports = TYPE;

},{}],2:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of self software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and self permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint max-params:[1, 10] */
'use strict';

var none = {};

module.exports.Program = Program;
function Program(headers, definitions) {
    this.type = 'Program';
    this.headers = headers;
    this.definitions = definitions;
}

module.exports.Identifier = Identifier;
function Identifier(name, line, column) {
    this.type = 'Identifier';
    this.name = name;
    this.line = line;
    this.column = column;
    this.as = null;
}

module.exports.Include = Include;
function Include(id, namespace, line, column) {
    this.type = 'Include';
    this.id = id;
    this.namespace = namespace;
    this.line = line;
    this.column = column;
}

module.exports.Namespace = Namespace;
function Namespace(id, scope) {
    this.type = 'Namespace';
    this.id = id;
    this.scope = scope;
}

module.exports.Typedef = Typedef;
function Typedef(type, id, annotations) {
    this.type = 'Typedef';
    this.valueType = type;
    this.id = id;
    this.annotations = annotations || none;
}

module.exports.BaseType = BaseType;
function BaseType(type, annotations) {
    this.type = 'BaseType';
    this.baseType = type;
    this.annotations = annotations || none;
}

module.exports.Enum = Enum;
function Enum(id, definitions, annotations) {
    this.type = 'Enum';
    this.id = id;
    this.definitions = definitions;
    this.annotations = annotations || none;
}

module.exports.EnumDefinition = EnumDefinition;
function EnumDefinition(id, value, annotations) {
    this.type = 'EnumDefinition';
    this.fieldType = new BaseType('i32');
    this.id = id;
    this.value = value;
    this.annotations = annotations || none;
}

module.exports.Senum = Senum;
function Senum(id, definitions, annotations) {
    this.type = 'Senum';
    this.id = id;
    this.senumDefinitions = definitions;
    this.annotations = annotations || none;
}

module.exports.Const = Const;
function Const(id, fieldType, value) {
    this.type = 'Const';
    this.id = id;
    this.fieldType = fieldType;
    this.value = value;
}

module.exports.ConstList = ConstList;
function ConstList(values) {
    this.type = 'ConstList';
    this.values = values;
}

module.exports.ConstMap = ConstMap;
function ConstMap(entries) {
    this.type = 'ConstMap';
    this.entries = entries;
}

module.exports.ConstEntry = ConstEntry;
function ConstEntry(key, value) {
    this.type = 'ConstEntry';
    this.key = key;
    this.value = value;
}

module.exports.Struct = Struct;
function Struct(id, fields, annotations) {
    this.type = 'Struct';
    this.id = id;
    this.fields = fields;
    this.isArgument = false;
    this.isResult = false;
    this.annotations = annotations || none;
}

module.exports.Union = Union;
function Union(id, fields, annotations) {
    this.type = 'Union';
    this.id = id;
    this.fields = fields;
    this.annotations = annotations || none;
}

module.exports.Exception = Exception;
function Exception(id, fields, annotations) {
    this.type = 'Exception';
    this.id = id;
    this.fields = fields;
    this.annotations = annotations || none;
}

module.exports.Service = Service;
function Service(id, functions, annotations, baseService) {
    this.type = 'Service';
    this.id = id;
    this.functions = functions;
    this.baseService = baseService;
    this.annotations = annotations || none;
}

module.exports.FunctionDefinition = FunctionDefinition;
function FunctionDefinition(id, fields, ft, _throws, annotations, oneway) {
    this.type = 'Function';
    this.id = id;
    this.returns = ft;
    this.fields = fields;
    this.fields.isArgument = true;
    this.throws = _throws;
    this.oneway = oneway;
    this.annotations = annotations || none;
}

module.exports.Field = Field;
function Field(id, ft, name, req, fv, annotations) {
    this.type = 'Field';
    this.id = id;
    this.name = name;
    this.valueType = ft;
    this.required = req === 'required';
    this.optional = req === 'optional';
    this.defaultValue = fv;
    this.annotations = annotations || none;
}

module.exports.FieldIdentifier = FieldIdentifier;
function FieldIdentifier(value, line, column) {
    this.type = 'FieldIdentifier';
    this.value = value;
    this.line = line;
    this.column = column;
}

module.exports.MapType = MapType;
function MapType(keyType, valueType, annotations) {
    this.type = 'Map';
    this.keyType = keyType;
    this.valueType = valueType;
    this.annotations = annotations || none;
}

module.exports.SetType = SetType;
function SetType(valueType, annotations) {
    this.type = 'Set';
    this.valueType = valueType;
    this.annotations = annotations || none;
}

module.exports.ListType = ListType;
function ListType(valueType, annotations) {
    this.type = 'List';
    this.valueType = valueType;
    this.annotations = annotations || none;
}

module.exports.TypeAnnotation = TypeAnnotation;
function TypeAnnotation(name, value) {
    this.type = 'TypeAnnotation';
    this.name = name;
    this.value = value;
}

module.exports.Comment = Comment;
function Comment(value) {
    this.type = 'Comment';
    this.value = value;
}

module.exports.Literal = Literal;
function Literal(value) {
    this.type = 'Literal';
    this.value = value;
}

},{}],3:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var Buffer = _dereq_('buffer').Buffer;
var bufrw = _dereq_('bufrw');
var TYPE = _dereq_('./TYPE');

var BinaryRW = new bufrw.VariableBuffer(bufrw.Int32BE);

function ThriftBinary(annotations) {
    this.annotations = annotations;
}

ThriftBinary.prototype.rw = BinaryRW;
ThriftBinary.prototype.name = 'binary';
ThriftBinary.prototype.typeid = TYPE.STRING;
ThriftBinary.prototype.surface = Buffer;
ThriftBinary.prototype.models = 'type';

module.exports.BinaryRW = BinaryRW;
module.exports.ThriftBinary = ThriftBinary;

},{"./TYPE":1,"buffer":31,"bufrw":38}],4:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var bufrw = _dereq_('bufrw');
var errors = _dereq_('bufrw/errors');
var TYPE = _dereq_('./TYPE');

var BooleanRW = bufrw.Base(
    booleanByteLength,
    readTBooleanFrom,
    writeTBooleanInto,
    true);

function booleanByteLength(destResult) {
    return destResult.reset(null, bufrw.UInt8.width);
}

function readTBooleanFrom(destResult, buffer, offset) {
    var res = bufrw.UInt8.poolReadFrom(destResult, buffer, offset);
    // istanbul ignore else
    if (!res.err) {
        res.value = Boolean(res.value);
    }
    return res;
}

function writeTBooleanInto(destResult, bool, buffer, offset) {
    if (typeof bool !== 'boolean') {
        return destResult.reset(errors.expected(bool, 'a boolean'), offset);
    }
    return bufrw.UInt8.poolWriteInto(destResult, Number(bool), buffer, offset);
}

function ThriftBoolean(annotations) {
    this.annotations = annotations;
}

ThriftBoolean.prototype.rw = BooleanRW;
ThriftBoolean.prototype.name = 'boolean';
ThriftBoolean.prototype.typeid = TYPE.BOOL;
ThriftBoolean.prototype.surface = Boolean;
ThriftBoolean.prototype.models = 'type';

module.exports.BooleanRW = BooleanRW;
module.exports.ThriftBoolean = ThriftBoolean;

},{"./TYPE":1,"bufrw":38,"bufrw/errors":36}],5:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

module.exports.ThriftByte = _dereq_('./i8').ThriftI8;
module.exports.ByteRW = _dereq_('./i8').I8RW;

},{"./i8":13}],6:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

function ThriftConst(def) {
    this.name = def.id.name;
    this.valueDefinition = def.value;
    this.defined = false;
    this.value = null;
    this.surface = null;
}

ThriftConst.prototype.models = 'value';

ThriftConst.prototype.link = function link(model) {
    if (!this.defined) {
        this.defined = true;
        this.value = model.resolveValue(this.valueDefinition);
        this.surface = this.value;
        model.consts[this.name] = this.value;

        // Alias if first character is not lower-case
        if (!/^[a-z]/.test(this.name)) {
            model[this.name] = this.value;
        }
    }
    return this;
};

module.exports.ThriftConst = ThriftConst;

},{}],7:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var bufrw = _dereq_('bufrw');
var TYPE = _dereq_('./TYPE');

var DoubleRW = bufrw.DoubleBE;

function ThriftDouble(annotations) {
    this.annotations = annotations;
}

ThriftDouble.prototype.rw = DoubleRW;
ThriftDouble.prototype.name = 'double';
ThriftDouble.prototype.typeid = TYPE.DOUBLE;
ThriftDouble.prototype.surface = Number;
ThriftDouble.prototype.models = 'type';

module.exports.DoubleRW = DoubleRW;
module.exports.ThriftDouble = ThriftDouble;

},{"./TYPE":1,"bufrw":38}],8:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var assert = _dereq_('assert');
var bufrw = _dereq_('bufrw');
var TYPE = _dereq_('./TYPE');
var errors = _dereq_('./errors');
var ThriftConst = _dereq_('./const').ThriftConst;
var ast = _dereq_('./ast');
var inherits = _dereq_('util').inherits;

var LengthResult = bufrw.LengthResult;

function ThriftEnum() {
    this.namesToValues = Object.create(null);
    this.valuesToNames = Object.create(null);
    // "Interned" names
    this.namesToNames = Object.create(null);
    this.namesToAnnotations = Object.create(null);
    this.surface = this.namesToNames;
    this.annotations = null;
    this.rw = new EnumRW(this);
    this.linked = false;
}

ThriftEnum.prototype.typeid = TYPE.I32;
ThriftEnum.prototype.models = 'type';

ThriftEnum.prototype.compile = function compile(def, model) {
    this.name = def.id.name;

    var value = 0;
    var enumDefs = def.definitions;
    for (var index = 0; index < enumDefs.length; index++) {
        var enumDef = enumDefs[index];
        var name = enumDef.id.name;
        var valueDef = enumDef.value;
        if (valueDef && valueDef.value !== undefined) {
            value = valueDef.value;
        }

        assert(this.namesToValues[name] === undefined,
            'duplicate name in enum ' + this.name +
            ' at ' + def.id.line + ':' + def.id.column);
        assert(value <= 0x7fffffff,
            'overflow in value in enum ' + this.name +
            ' at ' + def.id.line + ':' + def.id.column);

        var fullName = this.name + '.' + name;
        var constDef = new ast.Const(
            new ast.Identifier(name),
            null, // TODO infer type for default value validation
            new ast.Literal(name)
        );
        var constModel = new ThriftConst(constDef);
        model.consts[fullName] = constModel;
        model.define(fullName, enumDef.id, constModel);
        this.namesToValues[name] = value;
        this.namesToNames[name] = name;
        this.valuesToNames[value] = name;
        this.namesToAnnotations[name] = enumDef.annotations;
        value++;
    }

    this.annotations = def.annotations;
};

ThriftEnum.prototype.link = function link(model) {
    if (this.linked) {
        return this;
    }
    this.linked = true;

    model.enums[this.name] = this.namesToNames;

    // Alias if first character is not lower-case
    // istanbul ignore else
    if (!/^[a-z]/.test(this.name)) {
        model[this.name] = this.surface;
    }

    return this;
};

function EnumRW(model) {
    this.model = model;
    bufrw.Base.call(this);
}

inherits(EnumRW, bufrw.Base);

EnumRW.prototype.lengthResult = new LengthResult(null, bufrw.Int32BE.width);

EnumRW.prototype.poolByteLength = function poolByteLength(destResult) {
    return destResult.reset(null, bufrw.Int32BE.width);
};

EnumRW.prototype.poolWriteInto = function poolWriteInto(destResult, name, buffer, offset) {
    if (typeof name !== 'string') {
        return destResult.reset(errors.InvalidEnumerationTypeError({
            enumName: this.model.name,
            name: name,
            nameType: typeof name
        }), null);
    }
    var value = this.model.namesToValues[name];
    // istanbul ignore if
    if (value === undefined) {
        return destResult.reset(errors.InvalidEnumerationNameError({
            enumName: this.model.name,
            name: name
        }), null);
    }
    return bufrw.Int32BE.poolWriteInto(destResult, value, buffer, offset);
};

EnumRW.prototype.poolReadFrom = function poolReadFrom(destResult, buffer, offset) {
    var result;
    result = bufrw.Int32BE.poolReadFrom(destResult, buffer, offset);
    // istanbul ignore if
    if (result.err) {
        return result;
    }
    offset = result.offset;
    var value = result.value;
    var name = this.model.valuesToNames[value];
    if (!name) {
        return destResult.reset(errors.InvalidEnumerationValueError({
            enumName: this.model.name,
            value: value
        }), offset, null);
    }
    return destResult.reset(null, offset, name);
};

module.exports.ThriftEnum = ThriftEnum;

},{"./TYPE":1,"./ast":2,"./const":6,"./errors":9,"assert":24,"bufrw":38,"util":93}],9:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var TypedError = _dereq_('error/typed');

module.exports.TypeIdMismatch = TypedError({
    type: 'thrift-typeid-mismatch',
    message: 'encoded {what} typeid {encoded} doesn\'t match ' +
        'expected type "{expected}" (id: {expectedId})',
    encoded: null,
    expected: null,
    expectedId: null,
    what: null
});

module.exports.MapKeyTypeIdMismatch = TypedError({
    type: 'thrift-map-key-typeid-mismatch',
    message: 'encoded map key typeid {encoded} doesn\'t match ' +
        'expected type "{expected}" (id: {expectedId})',
    encoded: null,
    expected: null,
    expectedId: null
});

module.exports.MapValTypeIdMismatch = TypedError({
    type: 'thrift-map-val-typeid-mismatch',
    message: 'encoded map value typeid {encoded} doesn\'t match ' +
        'expected type "{expected}" (id: {expectedId})',
    encoded: null,
    expected: null,
    expectedId: null
});

module.exports.InvalidSizeError = TypedError({
    type: 'thrift-invalid-size',
    message: 'invalid size {size} of {what}; expects non-negative number',
    size: null,
    what: null
});

module.exports.InvalidTypeidError = TypedError({
    type: 'thrift-invalid-typeid',
    message: 'invalid typeid {typeid} of {what}' +
        '; expects one of the values in TYPE',
    typeid: null,
    what: null
});

module.exports.UnexpectedFieldValueTypeidError = TypedError({
    type: 'thrift-unexpected-field-value-typeid',
    message: 'unexpected typeid {typeid} ({typeName}) for field "{fieldName}"' +
        ' with id {fieldId} on {structName};' +
        ' expected {expectedTypeid} ({expectedTypeName})',
    typeid: null,
    typeName: null,
    expectedTypeid: null,
    expectedTypeName: null,
    fieldName: null,
    fieldId: null,
    structName: null
});

module.exports.FieldRequiredError = TypedError({
    type: 'thrift-required-field',
    message: 'missing required field "{name}" with id {id} on {structName}',
    name: null,
    id: null,
    structName: null
});

module.exports.UnexpectedMapTypeAnnotation = TypedError({
    type: 'thrift-unexpected-map-type-annotation',
    message: 'unexpected map js.type annotation "{mapType}"',
    mapType: null
});

module.exports.InvalidEnumerationTypeError = TypedError({
    type: 'thrift-invalid-enumeration-type',
    message: 'name must be a string for enumeration {enumName}, got: {name} ({nameType})',
    enumName: null,
    name: null,
    nameType: null
});

module.exports.InvalidEnumerationNameError = TypedError({
    type: 'thrift-invalid-enumeration-name',
    message: 'name must be a valid member of enumeration {enumName}, got: {name}',
    enumName: null,
    name: null
});

module.exports.InvalidEnumerationValueError = TypedError({
    type: 'thrift-invalid-enumeration-value',
    message: 'value must be a valid member of enumeration {enumName}, got: {value}',
    enumName: null,
    value: null
});

// Thrift Message Envelope

module.exports.UnrecognizedMessageEnvelopeVersion = TypedError({
    type: 'thrift-unrecognized-message-envelope-version',
    message: 'unrecognized Thrift message envelope version: {version}',
    version: null
});

module.exports.UnrecognizedMessageEnvelopeType = TypedError({
    type: 'thrift-unrecognized-message-envelope-type',
    message: 'unrecognized Thrift message envelope type: {value}',
    value: null
});

module.exports.InvalidMessageEnvelopeTypeName = TypedError({
    type: 'thrift-invalid-message-envelope-type-name',
    message: 'invalid Thrift message envelope type name: {name}',
    name: null
});

},{"error/typed":54}],10:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var bufrw = _dereq_('bufrw');
var ebufrw = _dereq_('bufrw/errors');
var util = _dereq_('util');
var TYPE = _dereq_('./TYPE');
var errors = _dereq_('./errors');

function I16RW() {
}

util.inherits(I16RW, bufrw.Base);

I16RW.prototype.name = 'i16';
I16RW.prototype.width = 2;
I16RW.prototype.min = -0x7fff - 1;
I16RW.prototype.max = 0x7fff;

I16RW.prototype.poolReadFrom = function poolReadFrom(result, buffer, offset) {
    var remain = buffer.length - offset;
    if (remain < this.width) {
        return result.reset(ebufrw.ShortRead({
            remaining: remain,
            buffer: buffer,
            offset: offset,
        }), offset);
    }
    var value = buffer.readInt16BE(offset);
    return result.reset(null, offset + this.width, value);
};

I16RW.prototype.poolWriteInto = function poolWriteInto(result, value, buffer, offset) {
    var coerced = +value;
    if ((typeof value !== 'string' && typeof value !== 'number') || !isFinite(coerced)) {
        return result.reset(new ebufrw.InvalidArgument({
            expected: 'a number'
        }));
    }

    var remain = buffer.length - offset;
    // istanbul ignore if
    if (remain < this.width) {
        return bufrw.WriteResult.poolShortError(result, this.width, remain, offset);
    }

    if (value < this.min || value > this.max) {
        return result.reset(new ebufrw.RangeError({
            value: coerced,
            min: this.min,
            max: this.max
        }));
    }

    buffer.writeInt16BE(coerced, offset);
    return result.reset(null, offset + this.width);
};

I16RW.prototype.poolByteLength = function poolByteLength(result, value) {
    return result.reset(null, this.width);
};

function ThriftI16(annotations) {
    this.annotations = annotations;
}

ThriftI16.prototype.rw = new I16RW();
ThriftI16.prototype.name = 'i16';
ThriftI16.prototype.typeid = TYPE.I16;
ThriftI16.prototype.surface = Number;
ThriftI16.prototype.models = 'type';

module.exports.I16RW = I16RW;
module.exports.ThriftI16 = ThriftI16;

},{"./TYPE":1,"./errors":9,"bufrw":38,"bufrw/errors":36,"util":93}],11:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var bufrw = _dereq_('bufrw');
var ebufrw = _dereq_('bufrw/errors');
var util = _dereq_('util');
var TYPE = _dereq_('./TYPE');
var errors = _dereq_('./errors');

function I32RW() {
}

util.inherits(I32RW, bufrw.Base);

I32RW.prototype.name = 'i32';
I32RW.prototype.width = 4;
I32RW.prototype.min = -0x7fffffff - 1;
I32RW.prototype.max = 0x7fffffff;

I32RW.prototype.poolReadFrom = function poolReadFrom(result, buffer, offset) {
    var remain = buffer.length - offset;
    if (remain < this.width) {
        return result.reset(ebufrw.ShortRead({
            remaining: remain,
            buffer: buffer,
            offset: offset,
        }), offset);
    }
    var value = buffer.readInt32BE(offset);
    return result.reset(null, offset + this.width, value);
};

I32RW.prototype.poolWriteInto = function poolWriteInto(result, value, buffer, offset) {
    var coerced = +value;
    if ((typeof value !== 'string' && typeof value !== 'number') || !isFinite(coerced)) {
        return result.reset(new ebufrw.InvalidArgument({
            expected: 'a number'
        }));
    }

    var remain = buffer.length - offset;
    // istanbul ignore if
    if (remain < this.width) {
        return bufrw.WriteResult.poolShortError(result, this.width, remain, offset);
    }

    if (value < this.min || value > this.max) {
        return result.reset(new ebufrw.RangeError({
            value: coerced,
            min: this.min,
            max: this.max
        }));
    }

    buffer.writeInt32BE(coerced, offset);
    return result.reset(null, offset + this.width);
};

I32RW.prototype.poolByteLength = function poolByteLength(result, value) {
    return result.reset(null, this.width);
};

function ThriftI32(annotations) {
    this.annotations = annotations;
}

ThriftI32.prototype.rw = new I32RW();
ThriftI32.prototype.name = 'i32';
ThriftI32.prototype.typeid = TYPE.I32;
ThriftI32.prototype.surface = Number;
ThriftI32.prototype.models = 'type';

module.exports.I32RW = I32RW;
module.exports.ThriftI32 = ThriftI32;

},{"./TYPE":1,"./errors":9,"bufrw":38,"bufrw/errors":36,"util":93}],12:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint no-self-compare: [0] */
'use strict';

var Buffer = _dereq_('buffer').Buffer;
var util = _dereq_('util');
var bufrw = _dereq_('bufrw');
var Long = _dereq_('long');
var TYPE = _dereq_('./TYPE');
var errors = _dereq_('bufrw/errors');

// istanbul ignore next
function I64RW() {
    bufrw.Base.call(this);
}

util.inherits(I64RW, bufrw.Base);

I64RW.prototype.width = 8;

I64RW.prototype.lengthResult = bufrw.LengthResult.just(8);

I64RW.prototype.poolByteLength = function poolByteLength(destResult, value) {
    return destResult.reset(null, 8);
};

I64RW.prototype.poolWriteInto = function poolWriteInto(destResult, value, buffer, offset) {
    if (Buffer.isBuffer(value)) {
        return this.writeBufferInt64Into(destResult, value, buffer, offset);
    } else if (typeof value === 'number') {
        var number = Long.fromNumber(value);
        buffer.writeInt32BE(number.high, offset);
        buffer.writeInt32BE(number.low, offset + 4);
        return destResult.reset(null, offset + 8);
    } else if (Array.isArray(value)) {
        return this.writeArrayInt64Into(destResult, value, buffer, offset);
    } else if (typeof value === 'string') {
        return this.writeStringInt64Into(destResult, value, buffer, offset);
    } else if (value && typeof value === 'object') {
        return this.writeObjectInt64Into(destResult, value, buffer, offset);
    } else {
        return destResult.reset(errors.expected(value, 'i64 representation'));
    }
};

I64RW.prototype.writeBufferInt64Into = function writeBufferInt64Into(destResult, value, buffer, offset) {
    value.copy(buffer, offset, 0, 8);
    return destResult.reset(null, offset + 8);
};

I64RW.prototype.writeObjectInt64Into =
function writeObjectInt64Into(destResult, value, buffer, offset) {
    if (typeof value.high !== 'number' && typeof value.hi !== 'number') {
        return destResult.reset(errors.expected(value,
            '{hi[gh], lo[w]} with high bits, or other i64 representation'), null);
    }
    if (typeof value.low !== 'number' && typeof value.lo !== 'number') {
        return destResult.reset(errors.expected(value,
            '{hi[gh], lo[w]} with low bits, or other i64 representation'), null);
    }
    var remain = buffer.length - offset;
    if (remain < this.width) {
        return bufrw.WriteResult.poolShortError(destResult, this.width, remain, offset);
    }

    buffer.writeInt32BE(value.high || value.hi || 0, offset);
    buffer.writeInt32BE(value.low || value.lo || 0, offset + 4);
    return destResult.reset(null, offset + 8);
};

I64RW.prototype.writeArrayInt64Into =
function writeArrayInt64Into(destResult, value, buffer, offset) {
    if (value.length !== 8) {
        return destResult.reset(errors.expected(value,
            'an array of 8 bytes, or other i64 representation'), null);
    }
    // Does not validate individual byte values, particularly allowing unsigned
    // or signed byte values without discrimination.
    for (var index = 0; index < 8; index++) {
        buffer[offset + index] = value[index] & 0xFF;
    }
    return destResult.reset(null, offset + 8);
};

I64RW.prototype.writeStringInt64Into =
function writeStringInt64Into(destResult, value, buffer, offset) {
    if (value.length !== 16) {
        return destResult.reset(errors.expected(value,
            'a string of 16 hex characters, or other i64 representation'), null);
    }

    var hi = parseInt(value.slice(0, 8), 16);
    if (hi !== hi) { // NaN
        return destResult.reset(errors.expected(value,
            'a string of hex characters, or other i64 representation'), null);
    }
    var lo = parseInt(value.slice(8, 16), 16);
    if (lo !== lo) { // NaN
        return destResult.reset(errors.expected(value,
            'a string of hex characters, or other i64 representation'), null);
    }

    buffer.writeInt32BE(hi, offset);
    buffer.writeInt32BE(lo, offset + 4);
    return destResult.reset(null, offset + 8);
};

function I64LongRW() {}

util.inherits(I64LongRW, I64RW);

I64LongRW.prototype.poolReadFrom = function poolReadFrom(destResult, buffer, offset) {
    var value = Long.fromBits(
        buffer.readInt32BE(offset + 4, 4),
        buffer.readInt32BE(offset, 4)
    );
    return destResult.reset(null, offset + 8, value);
};

var i64LongRW = new I64LongRW();

function I64DateRW() {}

util.inherits(I64DateRW, I64RW);

I64DateRW.prototype.poolReadFrom = function poolReadFrom(destResult, buffer, offset) {
    var remain = buffer.length - offset;
    if (remain < this.width) {
        return destResult.reset(errors.ShortRead({
            remaining: remain,
            offset: offset,
            buffer: buffer,
        }), offset);
    }

    var long = Long.fromBits(
        buffer.readInt32BE(offset + 4, 4),
        buffer.readInt32BE(offset + 0, 4)
    );
    var ms = long.toNumber();
    var value = new Date(ms);
    return destResult.reset(null, offset + 8, value);
};

I64DateRW.prototype.poolWriteInto = function poolWriteInto(destResult, value, buffer, offset) {
    if (Buffer.isBuffer(value)) {
	console.log("date is instance of buffer")
        return this.writeBufferInt64Into(destResult, value, buffer, offset);
    }
    if (Array.isArray(value)) {
        return this.writeArrayInt64Into(destResult, value, buffer, offset);
    }
    if (typeof value === 'string') {
        value = Date.parse(value);
    }
    value = Long.fromNumber(+value);
    return this.writeObjectInt64Into(destResult, value, buffer, offset);
};

var i64DateRW = new I64DateRW();

function I64BufferRW() {}

util.inherits(I64BufferRW, I64RW);

I64BufferRW.prototype.poolReadFrom = function poolReadTInt64From(destResult, buffer, offset) {
    // The following branches right only on legacy versions of Node.js
    // istanbul ignore next
    var value = (Buffer.alloc || Buffer)(8);
    buffer.copy(value, 0, offset, offset + 8);
    return destResult.reset(null, offset + 8, value);
};

var i64BufferRW = new I64BufferRW();

function ThriftI64(annotations) {
    if (annotations && annotations['js.type'] === 'Long') {
        this.rw = i64LongRW;
        this.surface = Long;
    } else if (annotations && annotations['js.type'] === 'Date') {
        this.rw = i64DateRW;
        this.surface = Date;
    } else {
        this.rw = i64BufferRW;
        this.surface = Buffer;
    }
    this.annotations = annotations;
}

ThriftI64.prototype.name = 'i64';
ThriftI64.prototype.typeid = TYPE.I64;
ThriftI64.prototype.models = 'type';

module.exports.I64RW = I64RW;
module.exports.I64BufferRW = I64BufferRW;
module.exports.I64LongRW = I64LongRW;
module.exports.I64DateRW = I64DateRW;
module.exports.ThriftI64 = ThriftI64;

},{"./TYPE":1,"buffer":31,"bufrw":38,"bufrw/errors":36,"long":66,"util":93}],13:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var bufrw = _dereq_('bufrw');
var ebufrw = _dereq_('bufrw/errors');
var util = _dereq_('util');
var TYPE = _dereq_('./TYPE');
var errors = _dereq_('./errors');

function I8RW() {
}

util.inherits(I8RW, bufrw.Base);

I8RW.prototype.name = 'i8';
I8RW.prototype.width = 1;
I8RW.prototype.min = -0x7f - 1;
I8RW.prototype.max = 0x7f;

I8RW.prototype.poolReadFrom = function poolReadFrom(result, buffer, offset) {
    var remain = buffer.length - offset;
    if (remain < this.width) {
        return result.reset(ebufrw.ShortRead({
            remaining: remain,
            buffer: buffer,
            offset: offset,
        }), offset);
    }
    var value = buffer[offset];
    return result.reset(null, offset + this.width, value);
};

I8RW.prototype.poolWriteInto = function poolWriteInto(result, value, buffer, offset) {
    var coerced = +value;
    if ((typeof value !== 'string' && typeof value !== 'number') || !isFinite(coerced)) {
        return result.reset(new ebufrw.InvalidArgument({
            expected: 'a number'
        }));
    }

    var remain = buffer.length - offset;
    if (remain < this.width) {
        return bufrw.WriteResult.poolShortError(result, this.width, remain, offset);
    }

    if (value < this.min || value > this.max) {
        return result.reset(new ebufrw.RangeError({
            value: coerced,
            min: this.min,
            max: this.max
        }));
    }

    buffer[offset] = coerced;
    return result.reset(null, offset + this.width);
};

I8RW.prototype.poolByteLength = function poolByteLength(result, value) {
    return result.reset(null, this.width);
};


function ThriftI8(annotations) {
    this.annotations = annotations;
}

ThriftI8.prototype.rw = new I8RW();
ThriftI8.prototype.name = 'i8';
ThriftI8.prototype.typeid = TYPE.I8;
ThriftI8.prototype.surface = Number;
ThriftI8.prototype.models = 'type';

module.exports.I8RW = I8RW;
module.exports.ThriftI8 = ThriftI8;

},{"./TYPE":1,"./errors":9,"bufrw":38,"bufrw/errors":36,"util":93}],14:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var TYPE = _dereq_('./TYPE');
var bufrw = _dereq_('bufrw');
var tmap = _dereq_('./tmap');
var tlist = _dereq_('./tlist');
var tstruct = _dereq_('./tstruct');

module.exports.TYPE = TYPE;

var ttypes = Object.create(null);
ttypes[TYPE.BOOL] = bufrw.Int8;
ttypes[TYPE.BYTE] = bufrw.Int8;
ttypes[TYPE.DOUBLE] = bufrw.DoubleBE;
ttypes[TYPE.I16] = bufrw.Int16BE;
ttypes[TYPE.I32] = bufrw.Int32BE;
ttypes[TYPE.I64] = bufrw.FixedWidth(8);
ttypes[TYPE.STRING] = bufrw.VariableBuffer(bufrw.Int32BE);
ttypes[TYPE.MAP] = tmap.TMapRW({ttypes: ttypes});
ttypes[TYPE.LIST] = tlist.TListRW({ttypes: ttypes});
ttypes[TYPE.SET] = tlist.TListRW({ttypes: ttypes});
ttypes[TYPE.STRUCT] = tstruct.TStructRW({ttypes: ttypes});

module.exports.TPair = tmap.TPair;
module.exports.TMap = tmap.TMap;
module.exports.TMapRW = ttypes[TYPE.MAP];

module.exports.TList = tlist.TList;
module.exports.TListRW = ttypes[TYPE.LIST];

module.exports.TField = tstruct.TField;
module.exports.TStruct = tstruct.TStruct;
module.exports.TStructRW = ttypes[TYPE.STRUCT];

module.exports.BinaryRW = _dereq_('./binary').BinaryRW;
module.exports.ThriftBinary = _dereq_('./binary').ThriftBinary;

module.exports.BooleanRW = _dereq_('./boolean').BooleanRW;
module.exports.ThriftBoolean = _dereq_('./boolean').ThriftBoolean;

module.exports.ByteRW = _dereq_('./byte').ByteRW;
module.exports.ThriftByte = _dereq_('./byte').ThriftByte;

module.exports.DoubleRW = _dereq_('./double').DoubleRW;
module.exports.ThriftDouble = _dereq_('./double').ThriftDouble;

module.exports.I8RW = _dereq_('./i8').I8RW;
module.exports.ThriftI8 = _dereq_('./i8').ThriftI8;

module.exports.I16RW = _dereq_('./i16').I16RW;
module.exports.ThriftI16 = _dereq_('./i16').ThriftI16;

module.exports.I32RW = _dereq_('./i32').I32RW;
module.exports.ThriftI32 = _dereq_('./i32').ThriftI32;

module.exports.I64RW = _dereq_('./i64').I64RW;
module.exports.ThriftI64 = _dereq_('./i64').ThriftI64;

module.exports.ListRW = _dereq_('./list').ListRW;
module.exports.ThriftList = _dereq_('./list').ThriftList;
module.exports.ThriftSet = _dereq_('./set').ThriftSet;

module.exports.MapObjectRW = _dereq_('./map-object').MapObjectRW;
module.exports.MapEntriesRW = _dereq_('./map-entries').MapEntriesRW;

module.exports.StringRW = _dereq_('./string').StringRW;
module.exports.ThriftString = _dereq_('./string').ThriftString;

module.exports.VoidRW = _dereq_('./void').VoidRW;
module.exports.ThriftVoid = _dereq_('./void').ThriftVoid;

module.exports.Thrift = _dereq_('./thrift').Thrift;

},{"./TYPE":1,"./binary":3,"./boolean":4,"./byte":5,"./double":7,"./i16":10,"./i32":11,"./i64":12,"./i8":13,"./list":17,"./map-entries":18,"./map-object":19,"./set":99,"./string":101,"./thrift":104,"./tlist":105,"./tmap":106,"./tstruct":107,"./void":111,"bufrw":38}],15:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

// Inspired by the eachOf function of the async package.
// Calls the callback 'cb' once all elements in the iterator have been processed
// by the 'handle' function. An error will be passed as agument in case 'handle'
// fails for some element of the iterator.

function handleCb(sharedData, cb) {
    var handleCbCalled = false;
    return function (err) {
        if (sharedData.done) {
            return;
        }
        if (err) {
            sharedData.done = true;
            return cb(err);
        }

        if (handleCbCalled) {
            sharedData.done = true;
            return cb(Error('Called asyncEach handle argument twice'));
        }
        handleCbCalled = true;

        sharedData.count--;
        if (sharedData.count === 0) {
            sharedData.done = true;
            cb(undefined);
        }
    };
}

function asyncEach(iterator, handle, cb) {
    if (iterator.length === 0) {
        return cb(undefined);
    }
    var sharedData = {done: false, count: iterator.length};
    for (var index = 0; index < iterator.length; index++) {
        if (sharedData.done) {
            return;
        }
        handle(iterator[index], handleCb(sharedData, cb));
    }
}

module.exports = asyncEach;

},{}],16:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

function lengthOfCommonPrefix(strings) {
    if (strings.length === 0) {
        return Infinity;
    }
    var longest = strings[0];
    var length = longest.length;
    for (var i = 1; i < strings.length; i++) {
        var string = strings[i];
        for (var j = 0; j < Math.min(length, string.length); j++) {
            if (string[j] !== longest[j]) {
                break;
            }
        }
        length = j;
    }
    return length;
}

function longestCommonPath(paths) {
    var length = lengthOfCommonPrefix(paths);
    var end = paths[0].lastIndexOf('/', length - 1);
    return paths[0].slice(0, end + 1);
}

module.exports.lengthOfCommonPrefix = lengthOfCommonPrefix;
module.exports.longestCommonPath = longestCommonPath;

},{}],17:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint max-statements:[1, 30] */
'use strict';

var bufrw = _dereq_('bufrw');
var assert = _dereq_('assert');
var TYPE = _dereq_('./TYPE');
var errors = _dereq_('./errors');
var util = _dereq_('util');

function ThriftList(valueType, annotations) {
    this.valueType = valueType;
    this.rw = new ListRW(valueType, this);
    this.annotations = annotations;
}

ThriftList.prototype.name = 'list';
ThriftList.prototype.typeid = TYPE.LIST;
ThriftList.prototype.surface = Array;
ThriftList.prototype.models = 'type';

function ListRW(valueType, model) {
    this.valueType = valueType;
    this.model = model;

    bufrw.Base.call(this);
}

util.inherits(ListRW, bufrw.Base);

ListRW.prototype.headerRW = bufrw.Series([bufrw.Int8, bufrw.Int32BE]);

ListRW.prototype.form = {
    create: function create() {
        return [];
    },
    add: function add(array, value) {
        array.push(value);
    },
    toArray: function toArray(array) {
        assert(Array.isArray(array), 'list must be expressed as an array');
        return array;
    }
};

ListRW.prototype.poolByteLength = function poolByteLength(destResult, list) {
    var valueType = this.valueType;

    list = this.form.toArray(list);

    var length = 5; // header length
    var t;
    for (var i = 0; i < list.length; i++) {
        t = valueType.rw.poolByteLength(destResult, list[i]);
        // istanbul ignore if
        if (t.err) {
            return t;
        }
        length += t.length;
    }
    return destResult.reset(null, length);
};

ListRW.prototype.poolWriteInto = function poolWriteInto(destResult, list, buffer, offset) {
    var valueType = this.valueType;

    list = this.form.toArray(list);

    var t = this.headerRW.poolWriteInto(destResult, [valueType.typeid, list.length],
        buffer, offset);
    // istanbul ignore if
    if (t.err) {
        return t;
    }
    offset = t.offset;

    for (var i = 0; i < list.length; i++) {
        t = valueType.rw.poolWriteInto(destResult, list[i], buffer, offset);
        // istanbul ignore if
        if (t.err) {
            return t;
        }
        offset = t.offset;
    }
    return destResult.reset(null, offset);
};

ListRW.prototype.poolReadFrom = function poolReadFrom(destResult, buffer, offset) {
    var valueType = this.valueType;

    var t = this.headerRW.poolReadFrom(destResult, buffer, offset);
    // istanbul ignore if
    if (t.err) {
        return t;
    }
    offset = t.offset;
    var valueTypeid = t.value[0];
    var size = t.value[1];

    if (valueTypeid !== valueType.typeid) {
        return destResult.reset(errors.TypeIdMismatch({
            encoded: valueTypeid,
            expectedId: valueType.typeid,
            expected: valueType.name,
            what: this.model.name
        }), offset, null);
    }
    if (size < 0) {
        return destResult.reset(errors.InvalidSizeError({
            size: size,
            what: this.model.name
        }), offset, null);
    }

    var list = this.form.create();

    for (var i = 0; i < size; i++) {
        t = valueType.rw.poolReadFrom(destResult, buffer, offset);
        // istanbul ignore if
        if (t.err) {
            return t;
        }
        offset = t.offset;
        this.form.add(list, t.value);
    }
    return destResult.reset(null, offset, list);
};

module.exports.ListRW = ListRW;
module.exports.ThriftList = ThriftList;

},{"./TYPE":1,"./errors":9,"assert":24,"bufrw":38,"util":93}],18:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint max-statements:[0, 99] */
'use strict';

var bufrw = _dereq_('bufrw');
var inherits = _dereq_('util').inherits;
var errors = _dereq_('./errors');

// RW a thrift map to an array of [k, v] entries

// ktype:1 vtype:1 length:4 (k... v...){length}

function MapEntriesRW(ktype, vtype) {
    this.ktype = ktype;
    this.vtype = vtype;

    if (this.ktype.rw.width && this.vtype.rw.width) {
        this.poolByteLength = this.mapFixFixbyteLength;
    } else if (this.ktype.rw.width) {
        this.poolByteLength = this.mapFixVarbyteLength;
    } else if (this.vtype.rw.width) {
        this.poolByteLength = this.mapVarFixbyteLength;
    }

    bufrw.Base.call(this);
}
inherits(MapEntriesRW, bufrw.Base);

MapEntriesRW.prototype.poolByteLength =
function mapVarVarByteLength(destResult, entries) {
    var len = 6; // static overhead

    for (var i = 0; i < entries.length; i++) {
        var res = this.ktype.rw.poolByteLength(destResult, entries[i][0]);
        // istanbul ignore if
        if (res.err) return res;
        len += res.length;

        res = this.vtype.rw.poolByteLength(destResult, entries[i][1]);
        // istanbul ignore if
        if (res.err) return res;
        len += res.length;
    }

    return destResult.reset(null, len);
};

MapEntriesRW.prototype.mapVarFixbyteLength =
function mapVarFixByteLength(destResult, entries) {
    var len = 6 + entries.length * this.vtype.rw.width;
    for (var i = 0; i < entries.length; i++) {
        var res = this.ktype.rw.poolByteLength(destResult, entries[i][0]);
        // istanbul ignore if
        if (res.err) return res;
        len += res.length;
    }
    return destResult.reset(null, len);
};

MapEntriesRW.prototype.mapFixVarbyteLength =
function mapFixVarByteLength(destResult, entries) {
    var len = 6 + entries.length * this.ktype.rw.width;
    for (var i = 0; i < entries.length; i++) {
        var res = this.vtype.rw.poolByteLength(destResult, entries[i][1]);
        // istanbul ignore if
        if (res.err) return res;
        len += res.length;
    }
    return destResult.reset(null, len);
};

MapEntriesRW.prototype.mapFixFixbyteLength =
function mapFixFixByteLength(destResult, entries) {
    var len = 6 +
        entries.length * this.ktype.rw.width +
        entries.length * this.vtype.rw.width;
    return destResult.reset(null, len);
};

MapEntriesRW.prototype.poolWriteInto =
function poolWriteInto(destResult, entries, buffer, offset) {
    // ktype:1
    var res = bufrw.UInt8.poolWriteInto(destResult, this.ktype.typeid, buffer, offset);
    // istanbul ignore if
    if (res.err) return res;
    offset = res.offset;

    // vtype:1
    res = bufrw.UInt8.poolWriteInto(destResult, this.vtype.typeid, buffer, offset);
    // istanbul ignore if
    if (res.err) return res;
    offset = res.offset;

    // length:4
    res = bufrw.UInt32BE.poolWriteInto(destResult, entries.length, buffer, offset);
    // istanbul ignore if
    if (res.err) return res;
    offset = res.offset;

    // (k... v...){length}
    for (var i = 0; i < entries.length; i++) {
        var pair = entries[i];

        // k...
        res = this.ktype.rw.poolWriteInto(destResult, pair[0], buffer, offset);
        // istanbul ignore if
        if (res.err) return res;
        offset = res.offset;

        // v...
        res = this.vtype.rw.poolWriteInto(destResult, pair[1], buffer, offset);
        // istanbul ignore if
        if (res.err) return res;
        offset = res.offset;
    }

    return destResult.reset(null, offset);
};

MapEntriesRW.prototype.poolReadFrom = function poolReadFrom(destResult, buffer, offset) {
    // ktype:1
    var res = bufrw.UInt8.poolReadFrom(destResult, buffer, offset);
    // istanbul ignore if
    if (res.err) return res;
    offset = res.offset;
    var ktypeid = res.value;

    if (ktypeid !== this.ktype.typeid) {
        return destResult.reset(errors.MapKeyTypeIdMismatch({
            encoded: ktypeid,
            expected: this.ktype.name,
            expectedId: this.ktype.typeid
        }), offset);
    }

    // vtype:1
    res = bufrw.UInt8.poolReadFrom(destResult, buffer, offset);
    // istanbul ignore if
    if (res.err) return res;
    offset = res.offset;
    var vtypeid = res.value;

    if (vtypeid !== this.vtype.typeid) {
        return destResult.reset(errors.MapValTypeIdMismatch({
            encoded: vtypeid,
            expected: this.vtype.name,
            expectedId: this.vtype.typeid
        }), offset);
    }

    // length:4
    res = bufrw.UInt32BE.poolReadFrom(destResult, buffer, offset);
    // istanbul ignore if
    if (res.err) return res;
    offset = res.offset;
    var length = res.value;

    // (k... v...){length}
    var entries = [];
    for (var i = 0; i < length; i++) {

        // k...
        res = this.ktype.rw.poolReadFrom(destResult, buffer, offset);
        // istanbul ignore if
        if (res.err) return res;
        offset = res.offset;
        var key = res.value;

        // v...
        res = this.vtype.rw.poolReadFrom(destResult, buffer, offset);
        // istanbul ignore if
        if (res.err) return res;
        offset = res.offset;
        var val = res.value;

        entries.push([key, val]);
    }

    return destResult.reset(null, offset, entries);
};

module.exports.MapEntriesRW = MapEntriesRW;

},{"./errors":9,"bufrw":38,"util":93}],19:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint max-statements:[0, 99] */
'use strict';

var bufrw = _dereq_('bufrw');
var inherits = _dereq_('util').inherits;
var errors = _dereq_('./errors');

// RW a thrift map to an Object

// ktype:1 vtype:1 length:4 (k... v...){length}

function MapObjectRW(ktype, vtype) {
    this.ktype = ktype;
    this.vtype = vtype;

    if (this.vtype.rw.width) {
        this.poolByteLength = this.mapVarFixbyteLength;
    }

    bufrw.Base.call(this);
}
inherits(MapObjectRW, bufrw.Base);

MapObjectRW.prototype.poolByteLength = function mapVarVarByteLength(destResult, obj) {
    var keys = obj && Object.keys(obj);
    var len = 6; // static overhead

    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = obj[key];
        var res = this.ktype.rw.poolByteLength(destResult, key);
        // istanbul ignore if
        if (res.err) return res;
        len += res.length;

        res = this.vtype.rw.poolByteLength(destResult, value);
        // istanbul ignore if
        if (res.err) return res;
        len += res.length;
    }

    return destResult.reset(null, len);
};

MapObjectRW.prototype.mapVarFixbyteLength = function mapVarFixByteLength(destResult, obj) {
    var keys = obj && Object.keys(obj);
    var len = 6 + keys.length * this.vtype.rw.width;

    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var res = this.ktype.rw.poolByteLength(destResult, key);
        // istanbul ignore if
        if (res.err) return res;
        len += res.length;
    }

    return destResult.reset(null, len);
};

MapObjectRW.prototype.poolWriteInto = function poolWriteInto(destResult, obj, buffer, offset) {
    // ktype:1
    var res = bufrw.UInt8.poolWriteInto(destResult, this.ktype.typeid, buffer, offset);
    // istanbul ignore if
    if (res.err) return res;
    offset = res.offset;

    // vtype:1
    res = bufrw.UInt8.poolWriteInto(destResult, this.vtype.typeid, buffer, offset);
    // istanbul ignore if
    if (res.err) return res;
    offset = res.offset;

    // length:4
    var keys = obj && Object.keys(obj);
    res = bufrw.UInt32BE.poolWriteInto(destResult, keys.length, buffer, offset);
    // istanbul ignore if
    if (res.err) return res;
    offset = res.offset;

    // (k... v...){length}
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = obj[key];

        // k...
        res = this.ktype.rw.poolWriteInto(destResult, key, buffer, offset);
        // istanbul ignore if
        if (res.err) return res;
        offset = res.offset;

        // v...
        res = this.vtype.rw.poolWriteInto(destResult, value, buffer, offset);
        // istanbul ignore if
        if (res.err) return res;
        offset = res.offset;
    }

    return destResult.reset(null, offset);
};

MapObjectRW.prototype.poolReadFrom = function poolReadFrom(destResult, buffer, offset) {
    // ktype:1
    var res = bufrw.UInt8.poolReadFrom(destResult, buffer, offset);
    // istanbul ignore if
    if (res.err) return res;
    offset = res.offset;
    var ktypeid = res.value;

    if (ktypeid !== this.ktype.typeid) {
        return destResult.reset(errors.MapKeyTypeIdMismatch({
            encoded: ktypeid,
            expected: this.ktype.name,
            expectedId: this.ktype.typeid
        }), offset);
    }

    // vtype:1
    res = bufrw.UInt8.poolReadFrom(destResult, buffer, offset);
    // istanbul ignore if
    if (res.err) return res;
    offset = res.offset;
    var vtypeid = res.value;

    if (vtypeid !== this.vtype.typeid) {
        return destResult.reset(errors.MapValTypeIdMismatch({
            encoded: vtypeid,
            expected: this.vtype.name,
            expectedId: this.vtype.typeid
        }), offset);
    }

    // length:4
    res = bufrw.UInt32BE.poolReadFrom(destResult, buffer, offset);
    // istanbul ignore if
    if (res.err) return res;
    offset = res.offset;
    var length = res.value;

    // (k... v...){length}
    var obj = {};
    for (var i = 0; i < length; i++) {

        // k...
        res = this.ktype.rw.poolReadFrom(destResult, buffer, offset);
        // istanbul ignore if
        if (res.err) return res;
        offset = res.offset;
        var key = res.value;

        // v...
        res = this.vtype.rw.poolReadFrom(destResult, buffer, offset);
        // istanbul ignore if
        if (res.err) return res;
        offset = res.offset;
        var val = res.value;

        obj[key] = val;
    }

    return destResult.reset(null, offset, obj);
};

module.exports.MapObjectRW = MapObjectRW;

},{"./errors":9,"bufrw":38,"util":93}],20:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var TYPE = _dereq_('./TYPE');
var MapObjectRW = _dereq_('./map-object').MapObjectRW;
var MapEntriesRW = _dereq_('./map-entries').MapEntriesRW;
var errors = _dereq_('./errors');

function ThriftMap(keyType, valueType, annotations) {
    this.rw = null;
    this.surface = null;

    var type = annotations['js.type'] || 'object';

    if (type === 'object') {
        this.rw = new MapObjectRW(keyType, valueType);
        this.surface = Object;
    } else if (type === 'entries') {
        this.rw = new MapEntriesRW(keyType, valueType);
        this.surface = Array;
    } else {
        throw errors.UnexpectedMapTypeAnnotation({
            mapType: type
        });
    }

    this.annotations = annotations;
}

ThriftMap.prototype.name = 'map';
ThriftMap.prototype.typeid = TYPE.MAP;
ThriftMap.prototype.models = 'type';

module.exports.ThriftMap = ThriftMap;

},{"./TYPE":1,"./errors":9,"./map-entries":18,"./map-object":19}],21:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

// reverse engineered TBinaryProtocol message envelope spec
// http://slackhappy.github.io/thriftfiddle/tbinaryspec.html

var RW = _dereq_('./rw');
var util = _dereq_('util');
var Struct = _dereq_('./struct').Struct;
var errors = _dereq_('./errors');

var EMPTY_OBJECT = {};

var types = {
    CALL: 1,
    REPLY: 2,
    EXCEPTION: 3,
    ONEWAY: 4
};
// <-> inverse
var typeNames = {
    1: 'CALL',
    2: 'REPLY',
    3: 'EXCEPTION',
    4: 'ONEWAY'
};

// These are elided syntax trees, to avoid IDL parsing at start time.

var exceptionTypesDef = {
    type: 'Enum',
    id: {name: 'ThriftMessageEnvelopeExceptionType'},
    definitions: [
        {id: {name: 'UNKNOWN'},                 value: {value: 0}},
        {id: {name: 'UNKNOWN_METHOD'},          value: {value: 1}},
        {id: {name: 'INVALID_MESSAGE_TYPE'},    value: {value: 2}},
        {id: {name: 'WRONG_METHOD_NAME'},       value: {value: 3}},
        {id: {name: 'BAD_SEQUENCE_ID'},         value: {value: 4}},
        {id: {name: 'MISSING_RESULT'},          value: {value: 5}},
        {id: {name: 'INTERNAL_ERROR'},          value: {value: 6}},
        {id: {name: 'PROTOCOL_ERROR'},          value: {value: 7}},
        {id: {name: 'INVALID_TRANSFORM'},       value: {value: 8}},
        {id: {name: 'INVALID_PROTOCOL'},        value: {value: 9}},
        {id: {name: 'UNSUPPORTED_CLIENT_TYPE'}, value: {value: 10}}
    ]
};

// AST for the implicit exception struct
var exceptionDef = {
    type: 'Struct',
    id: {name: 'ThriftMessageEnvelopeException'},
    fields: [
        {
            id: {value: 1},
            name: 'message',
            valueType: {
                type: 'BaseType',
                baseType: 'string'
            },
            optional: true,
            required: false
        },
        {
            id: {value: 2},
            name: 'type',
            valueType: {
                type: 'Identifier',
                name: 'ThriftMessageEnvelopeExceptionType'
            },
            optional: true,
            required: false
        }
    ]
};

function Message(message) {
    message = message || EMPTY_OBJECT;
    this.id = message.id;
    this.name = message.name;
    this.body = message.body;
    this.type = message.type;
    this.version = message.version || 0; // >0 implies strict
}

function MessageRW(body, exception) {
    this.body = body;
    this.exception = exception;
    RW.call(this);
}
util.inherits(MessageRW, RW);

MessageRW.prototype.poolByteLength = function poolByteLength(result, message) {
    // header
    var length = message.name.length;
    // names must be half-ascii, so ucs2 length === byte length
    if (message.version > 0) { // strict
        // version:2 type:2 name~4 id:4
        length += 12;
    } else { // legacy non-strict message header
        // name~4 type:1 id:4
        length += 9;
    }

    if (message.type === 'EXCEPTION') {
        result = this.exception.poolByteLength(result, message.body);
        if (result.err) {
            return result;
        }
        length += result.length;
        return result.reset(null, length);
    }

    // body
    result = this.body.poolByteLength(result, message.body);
    if (result.err) {
        return result;
    }
    length += result.length;

    return result.reset(null, length);
};

MessageRW.prototype.poolWriteInto = function poolWriteInto(result, message, buffer, offset) {
    if (message.version > 0) {
        result = this.poolStrictWriteInto(result, message, buffer, offset);
    } else {
        result = this.poolLegacyWriteInto(result, message, buffer, offset);
    }
    if (result.err) {
        return result;
    }
    offset = result.offset;

    if (message.type === 'EXCEPTION') {
        return this.exception.poolWriteInto(result, message.body, buffer, offset);
    }

    // write body
    return this.body.poolWriteInto(result, message.body, buffer, offset);
};

MessageRW.prototype.poolStrictWriteInto = function poolStrictWriteInto(result, message, buffer, offset) {
    // version:2 type:2 name~4 id:4

    // version:2 (with MSB set)
    buffer.writeUInt16BE(message.version | 0x8000, offset);
    offset += 2;

    // type:2
    var type = types[message.type];
    if (type == null) {
        return result.reset(new errors.InvalidMessageEnvelopeTypeName({
            name: message.type
        }));
    }
    buffer.writeUInt16BE(type, offset);
    offset += 2;

    // name.length:4
    buffer.writeUInt32BE(message.name.length, offset);
    offset += 4;

    // name:name.length
    buffer.write(message.name, offset, 'ascii');
    offset += message.name.length;

    // id:4
    buffer.writeUInt32BE(message.id, offset);
    offset += 4;

    return result.reset(null, offset);
};

MessageRW.prototype.poolLegacyWriteInto = function poolLegacyWriteInto(result, message, buffer, offset) {
    // name~4 type:1 id:4

    // name.length:4
    buffer.writeUInt32BE(message.name.length, offset);
    offset += 4;

    // name:name.length
    buffer.write(message.name, offset, 'ascii');
    offset += message.name.length;

    // type:1
    var type = types[message.type];
    if (type == null) {
        return result.reset(new errors.InvalidMessageEnvelopeTypeName({
            name: message.type
        }));
    }
    buffer.writeUInt8(type, offset);
    offset += 1;

    // id:4
    buffer.writeUInt32BE(message.id, offset);
    offset += 4;

    return result.reset(null, offset);
};

MessageRW.prototype.poolReadFrom = function poolReadFrom(result, buffer, offset) {
    var msb = buffer.readInt8(offset);
    if (msb < 0) {
        result = this.poolStrictReadFrom(result, buffer, offset);
    } else {
        result = this.poolLegacyReadFrom(result, buffer, offset);
    }
    if (result.err) {
        return result;
    }
    var message = result.value;
    offset = result.offset;

    if (message.type === 'EXCEPTION') {
        result = this.exception.poolReadFrom(result, buffer, offset);
        if (result.err) {
            return result;
        }
        message.body = result.value;
        // Decode the enumeration
        offset += result.offset;
        return result.reset(message.body, offset, message);
    }

    // body
    result = this.body.poolReadFrom(result, buffer, offset);
    if (result.err) {
        return result;
    }
    message.body = result.value;
    offset = result.offset;

    return result.reset(null, offset, message);
};

MessageRW.prototype.poolStrictReadFrom = function poolStrictReadFrom(result, buffer, offset) {
    // the first two bytes might be "flag" and "version", or just "version"
    // with the MSB flipped to make strict distinguishable.
    // The type only needs the lesser byte of the available two.
    // version:2 type:2 name~4 id:4

    var message = new Message();
    message.version = buffer.readUInt16BE(offset) & ~0x8000; // mask out MSB
    offset += 2;

    if (message.version !== 1) {
        return result.reset(new errors.UnrecognizedMessageEnvelopeVersion({
            version: message.version
        }));
    }

    // type:2
    var type = buffer.readUInt16BE(offset) & 0xFF;
    offset += 2;

    message.type = typeNames[type];
    if (message.type == null) {
        return result.reset(new errors.UnrecognizedMessageEnvelopeType({
            value: type
        }));
    }

    // name.length:4
    var length = buffer.readUInt32BE(offset);
    offset += 4;

    // name:name.length
    message.name = buffer.toString('ascii', offset, offset + length, true);
    offset += length;

    // id:4
    message.id = buffer.readUInt32BE(offset);
    offset += 4;

    return result.reset(null, offset, message);
};

MessageRW.prototype.poolLegacyReadFrom = function poolLegacyReadFrom(result, buffer, offset) {
    // name~4 type:1 id:4
    var message = new Message();

    // name.length
    var length = buffer.readUInt32BE(offset);
    offset += 4;

    // name:name.length
    message.name = buffer.toString('ascii', offset, offset + length, true);
    offset += length;

    // type:2
    var type = buffer.readUInt8(offset);
    offset += 1;

    // id:4
    message.id = buffer.readUInt32BE(offset);
    offset += 4;

    message.type = typeNames[type];
    if (message.type == null) {
        return result.reset(new errors.UnrecognizedMessageEnvelopeType({
            value: type
        }));
    }

    return result.reset(null, offset, message);
};

module.exports.Message = Message;
module.exports.MessageRW = MessageRW;
module.exports.types = types;
module.exports.typeNames = typeNames;
module.exports.exceptionDef = exceptionDef;
module.exports.exceptionTypesDef = exceptionTypesDef;

},{"./errors":9,"./rw":97,"./struct":102,"util":93}],22:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var TYPE = _dereq_('./TYPE');

var tnames = Object.create(null);
tnames[TYPE.BOOL] = 'BOOL';
tnames[TYPE.VOID] = 'VOID';
tnames[TYPE.BYTE] = 'BYTE';
tnames[TYPE.DOUBLE] = 'DOUBLE';
tnames[TYPE.I16] = 'I16';
tnames[TYPE.I32] = 'I32';
tnames[TYPE.I64] = 'I64';
tnames[TYPE.STRING] = 'STRING';
tnames[TYPE.MAP] = 'MAP';
tnames[TYPE.LIST] = 'LIST';
tnames[TYPE.SET] = 'SET';
tnames[TYPE.STRUCT] = 'STRUCT';

module.exports = tnames;

},{"./TYPE":1}],23:[function(_dereq_,module,exports){
// ANSI color code outputs for strings

var ANSI_CODES = {
  "off": 0,
  "bold": 1,
  "italic": 3,
  "underline": 4,
  "blink": 5,
  "inverse": 7,
  "hidden": 8,
  "black": 30,
  "red": 31,
  "green": 32,
  "yellow": 33,
  "blue": 34,
  "magenta": 35,
  "cyan": 36,
  "white": 37,
  "black_bg": 40,
  "red_bg": 41,
  "green_bg": 42,
  "yellow_bg": 43,
  "blue_bg": 44,
  "magenta_bg": 45,
  "cyan_bg": 46,
  "white_bg": 47
};

exports.set = function(str, color) {
  if(!color) return str;

  var color_attrs = color.split("+");
  var ansi_str = "";
  for(var i=0, attr; attr = color_attrs[i]; i++) {
    ansi_str += "\033[" + ANSI_CODES[attr] + "m";
  }
  ansi_str += str + "\033[" + ANSI_CODES["off"] + "m";
  return ansi_str;
};
},{}],24:[function(_dereq_,module,exports){
(function (global){
'use strict';

var objectAssign = _dereq_('object-assign');

// compare and isBuffer taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
function isBuffer(b) {
  if (global.Buffer && typeof global.Buffer.isBuffer === 'function') {
    return global.Buffer.isBuffer(b);
  }
  return !!(b != null && b._isBuffer);
}

// based on node assert, original notice:
// NB: The URL to the CommonJS spec is kept just for tradition.
//     node-assert has evolved a lot since then, both in API and behavior.

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = _dereq_('util/');
var hasOwn = Object.prototype.hasOwnProperty;
var pSlice = Array.prototype.slice;
var functionsHaveNames = (function () {
  return function foo() {}.name === 'foo';
}());
function pToString (obj) {
  return Object.prototype.toString.call(obj);
}
function isView(arrbuf) {
  if (isBuffer(arrbuf)) {
    return false;
  }
  if (typeof global.ArrayBuffer !== 'function') {
    return false;
  }
  if (typeof ArrayBuffer.isView === 'function') {
    return ArrayBuffer.isView(arrbuf);
  }
  if (!arrbuf) {
    return false;
  }
  if (arrbuf instanceof DataView) {
    return true;
  }
  if (arrbuf.buffer && arrbuf.buffer instanceof ArrayBuffer) {
    return true;
  }
  return false;
}
// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

var regex = /\s*function\s+([^\(\s]*)\s*/;
// based on https://github.com/ljharb/function.prototype.name/blob/adeeeec8bfcc6068b187d7d9fb3d5bb1d3a30899/implementation.js
function getName(func) {
  if (!util.isFunction(func)) {
    return;
  }
  if (functionsHaveNames) {
    return func.name;
  }
  var str = func.toString();
  var match = str.match(regex);
  return match && match[1];
}
assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  } else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = getName(stackStartFunction);
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (typeof s === 'string') {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}
function inspect(something) {
  if (functionsHaveNames || !util.isFunction(something)) {
    return util.inspect(something);
  }
  var rawname = getName(something);
  var name = rawname ? ': ' + rawname : '';
  return '[Function' +  name + ']';
}
function getMessage(self) {
  return truncate(inspect(self.actual), 128) + ' ' +
         self.operator + ' ' +
         truncate(inspect(self.expected), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
  }
};

function _deepEqual(actual, expected, strict, memos) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  } else if (isBuffer(actual) && isBuffer(expected)) {
    return compare(actual, expected) === 0;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if ((actual === null || typeof actual !== 'object') &&
             (expected === null || typeof expected !== 'object')) {
    return strict ? actual === expected : actual == expected;

  // If both values are instances of typed arrays, wrap their underlying
  // ArrayBuffers in a Buffer each to increase performance
  // This optimization requires the arrays to have the same type as checked by
  // Object.prototype.toString (aka pToString). Never perform binary
  // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
  // bit patterns are not identical.
  } else if (isView(actual) && isView(expected) &&
             pToString(actual) === pToString(expected) &&
             !(actual instanceof Float32Array ||
               actual instanceof Float64Array)) {
    return compare(new Uint8Array(actual.buffer),
                   new Uint8Array(expected.buffer)) === 0;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else if (isBuffer(actual) !== isBuffer(expected)) {
    return false;
  } else {
    memos = memos || {actual: [], expected: []};

    var actualIndex = memos.actual.indexOf(actual);
    if (actualIndex !== -1) {
      if (actualIndex === memos.expected.indexOf(expected)) {
        return true;
      }
    }

    memos.actual.push(actual);
    memos.expected.push(expected);

    return objEquiv(actual, expected, strict, memos);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, strict, actualVisitedObjects) {
  if (a === null || a === undefined || b === null || b === undefined)
    return false;
  // if one is a primitive, the other must be same
  if (util.isPrimitive(a) || util.isPrimitive(b))
    return a === b;
  if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
    return false;
  var aIsArgs = isArguments(a);
  var bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, strict);
  }
  var ka = objectKeys(a);
  var kb = objectKeys(b);
  var key, i;
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length !== kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
      return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, false)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (_deepEqual(actual, expected, true)) {
    fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
  }
}


// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  }

  try {
    if (actual instanceof expected) {
      return true;
    }
  } catch (e) {
    // Ignore.  The instanceof check doesn't work for arrow functions.
  }

  if (Error.isPrototypeOf(expected)) {
    return false;
  }

  return expected.call({}, actual) === true;
}

function _tryBlock(block) {
  var error;
  try {
    block();
  } catch (e) {
    error = e;
  }
  return error;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (typeof block !== 'function') {
    throw new TypeError('"block" argument must be a function');
  }

  if (typeof expected === 'string') {
    message = expected;
    expected = null;
  }

  actual = _tryBlock(block);

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  var userProvidedMessage = typeof message === 'string';
  var isUnwantedException = !shouldThrow && util.isError(actual);
  var isUnexpectedException = !shouldThrow && actual && !expected;

  if ((isUnwantedException &&
      userProvidedMessage &&
      expectedException(actual, expected)) ||
      isUnexpectedException) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws(true, block, error, message);
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
  _throws(false, block, error, message);
};

assert.ifError = function(err) { if (err) throw err; };

// Expose a strict only variant of assert
function strict(value, message) {
  if (!value) fail(value, true, message, '==', strict);
}
assert.strict = objectAssign(strict, assert, {
  equal: assert.strictEqual,
  deepEqual: assert.deepStrictEqual,
  notEqual: assert.notStrictEqual,
  notDeepEqual: assert.notDeepStrictEqual
});
assert.strict.strict = assert.strict;

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"object-assign":67,"util/":27}],25:[function(_dereq_,module,exports){
module.exports = _dereq_('util').inherits

},{"util":93}],26:[function(_dereq_,module,exports){
(function (Buffer){
module.exports = function isBuffer(arg) {
  return arg instanceof Buffer;
}

}).call(this,_dereq_("buffer").Buffer)
},{"buffer":31}],27:[function(_dereq_,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = _dereq_('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = _dereq_('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,_dereq_('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":26,"_process":30,"inherits":25}],28:[function(_dereq_,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],29:[function(_dereq_,module,exports){

},{}],30:[function(_dereq_,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],31:[function(_dereq_,module,exports){
(function (Buffer){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = _dereq_('base64-js')
var ieee754 = _dereq_('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this,_dereq_("buffer").Buffer)
},{"base64-js":28,"buffer":31,"ieee754":61}],32:[function(_dereq_,module,exports){
(function (Buffer){
// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var hex = _dereq_('hexer');

var color = _dereq_('ansi-color').set;
var stripColor = _dereq_('./lib/strip_color.js');
var extend = _dereq_('xtend');
var inspect = _dereq_('util').inspect;

function AnnotatedBuffer(buffer) {
    this.buffer = buffer;
    this.annotations = [];
}

Object.defineProperty(AnnotatedBuffer.prototype, 'length', {
    enumerable: true,
    get: function getLength() {
        return this.buffer.length;
    }
});

// -- strings

AnnotatedBuffer.prototype.toString = function toString(encoding, start, end) {
    var value = this.buffer.toString(encoding, start, end);
    this.annotations.push({
        kind: 'read',
        name: 'string',
        value: value,
        encoding: encoding,
        start: start,
        end: end
    });
    return value;
};

// -- bytes

// istanbul ignore next
AnnotatedBuffer.prototype.copy = function copy(targetBuffer, targetStart, sourceStart, sourceEnd) {
    var copied = this.buffer.copy(targetBuffer, targetStart, sourceStart, sourceEnd);
    // istanbul ignore next
    var start = sourceStart || 0;
    var end = sourceEnd || start + copied;
    this.annotations.push({
        kind: 'read',
        name: 'copy',
        value: this.buffer.slice(start, end),
        start: start,
        end: end
    });
    return copied;
};

// istanbul ignore next
AnnotatedBuffer.prototype.slice = function slice(start, end) {
    var value = this.buffer.slice(start, end);
    this.annotations.push({
        kind: 'read',
        name: 'slice',
        value: value,
        start: start,
        end: end
    });
    return value;
};

// -- atom readers

// istanbul ignore next
AnnotatedBuffer.prototype.readInt8 = function readInt8(offset, noAssert) {
    var value = this.buffer.readInt8(offset, noAssert);
    this.annotations.push({
        kind: 'read',
        name: 'Int8',
        value: value,
        start: offset,
        end: offset + 1
    });
    return value;
};

AnnotatedBuffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
    var value = this.buffer.readUInt8(offset, noAssert);
    this.annotations.push({
        kind: 'read',
        name: 'UInt8',
        value: value,
        start: offset,
        end: offset + 1
    });
    return value;
};

// istanbul ignore next
AnnotatedBuffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
    var value = this.buffer.readUInt16LE(offset, noAssert);
    this.annotations.push({
        kind: 'read',
        name: 'UInt16LE',
        value: value,
        start: offset,
        end: offset + 2
    });
    return value;
};

AnnotatedBuffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
    var value = this.buffer.readUInt16BE(offset, noAssert);
    this.annotations.push({
        kind: 'read',
        name: 'UInt16BE',
        value: value,
        start: offset,
        end: offset + 2
    });
    return value;
};

// istanbul ignore next
AnnotatedBuffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
    var value = this.buffer.readUInt32LE(offset, noAssert);
    this.annotations.push({
        kind: 'read',
        name: 'UInt32LE',
        value: value,
        start: offset,
        end: offset + 4
    });
    return value;
};

// istanbul ignore next
AnnotatedBuffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
    var value = this.buffer.readUInt32BE(offset, noAssert);
    this.annotations.push({
        kind: 'read',
        name: 'UInt32BE',
        value: value,
        start: offset,
        end: offset + 4
    });
    return value;
};

// istanbul ignore next
AnnotatedBuffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
    var value = this.buffer.readInt16LE(offset, noAssert);
    this.annotations.push({
        kind: 'read',
        name: 'Int16LE',
        value: value,
        start: offset,
        end: offset + 2
    });
    return value;
};

// istanbul ignore next
AnnotatedBuffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
    var value = this.buffer.readInt16BE(offset, noAssert);
    this.annotations.push({
        kind: 'read',
        name: 'Int16BE',
        value: value,
        start: offset,
        end: offset + 2
    });
    return value;
};

// istanbul ignore next
AnnotatedBuffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
    var value = this.buffer.readInt32LE(offset, noAssert);
    this.annotations.push({
        kind: 'read',
        name: 'Int32LE',
        value: value,
        start: offset,
        end: offset + 4
    });
    return value;
};

// istanbul ignore next
AnnotatedBuffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
    var value = this.buffer.readInt32BE(offset, noAssert);
    this.annotations.push({
        kind: 'read',
        name: 'Int32BE',
        value: value,
        start: offset,
        end: offset + 4
    });
    return value;
};

// istanbul ignore next
AnnotatedBuffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
    var value = this.buffer.readFloatLE(offset, noAssert);
    this.annotations.push({
        kind: 'read',
        name: 'FloatLE',
        value: value,
        start: offset,
        end: offset + 4
    });
    return value;
};

// istanbul ignore next
AnnotatedBuffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
    var value = this.buffer.readFloatBE(offset, noAssert);
    this.annotations.push({
        kind: 'read',
        name: 'FloatBE',
        value: value,
        start: offset,
        end: offset + 4
    });
    return value;
};

// istanbul ignore next
AnnotatedBuffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
    var value = this.buffer.readDoubleLE(offset, noAssert);
    this.annotations.push({
        kind: 'read',
        name: 'DoubleLE',
        value: value,
        start: offset,
        end: offset + 8
    });
    return value;
};

// istanbul ignore next
AnnotatedBuffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
    var value = this.buffer.readDoubleBE(offset, noAssert);
    this.annotations.push({
        kind: 'read',
        name: 'DoubleBE',
        value: value,
        start: offset,
        end: offset + 8
    });
    return value;
};

// -- extras

// istanbul ignore next
AnnotatedBuffer.prototype.hexdump = function hexdump(options) {
    var self = this;

    options = extend(options, {
        emptyHuman: ' ',
        annotateLine: annotateLine
    });
    if (options.boldStart === undefined) options.boldStart = true;
    options.decorateHexen = colorRegions;
    options.decorateHuman = colorRegions;
    var colors = options.colors || ['magenta', 'cyan', 'yellow', 'green'];
    var colorI = 0;
    var annI = 0;
    var last = 0;
    return hex(this.buffer, options);

    function annotateLine(start, end) {
        var parts = [];
        for (var i = last; i <= annI; i++) {
            var ann = self.annotations[i];
            if (ann && ann.start >= start && ann.start < end) {
                if (options.colored) {
                    ann.color = colors[i % colors.length];
                }
                parts.push(ann);
                last = i + 1;
            }
        }
        return '  ' + parts.map(function(part) {
            var desc = part.name;
            if (typeof part.value !== 'string' &&
                !Buffer.isBuffer(part.value)) {
                desc += '(' + inspect(part.value) + ')';
            }
            if (part.color) {
                desc = color(desc, part.color);
            } else if (part.start === part.end) {
                desc += '@' + part.start.toString(16);
            } else {
                desc += '@[' + part.start.toString(16) + ',' +
                               part.end.toString(16) + ']';
            }
            if (options.highlight) {
                desc = options.highlight(part.start, 0, desc);
            }
            return desc;
        }).join(' ');
    }

    function colorRegions(i, j, str) {
        var ann = self.annotations[annI];
        while (ann && i >= ann.end) {
            ann = self.annotations[++annI];
            colorI = (colorI + 1) % colors.length;
        }

        if (ann && options.colored &&
            i >= ann.start &&
            i < ann.end) {
            str = stripColor(str);
            str = color(str, colors[colorI]);
            if (i === ann.start && options.boldStart) str = color(str, 'bold');
        }

        if (options.highlight) {
            str = options.highlight(i, j, str);
        }

        return str;
    }
};

module.exports = AnnotatedBuffer;

}).call(this,{"isBuffer":_dereq_("../is-buffer/index.js")})
},{"../is-buffer/index.js":64,"./lib/strip_color.js":40,"ansi-color":23,"hexer":59,"util":93,"xtend":94}],33:[function(_dereq_,module,exports){
// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var inherits = _dereq_('util').inherits;

var WriteResult = _dereq_('./base').WriteResult;
var ReadResult = _dereq_('./base').ReadResult;
var BufferRW = _dereq_('./base').BufferRW;
var errors = _dereq_('./errors');

function AtomRW(width, readAtomFrom, writeAtomInto) {
    if (!(this instanceof AtomRW)) {
        return new AtomRW(width, readAtomFrom, writeAtomInto);
    }
    this.width = width;
    this.readAtomFrom = readAtomFrom;
    this.writeAtomInto = writeAtomInto;
    BufferRW.call(this);
}
inherits(AtomRW, BufferRW);

AtomRW.prototype.poolByteLength = function byteLength(destResult) {
    return destResult.reset(null, this.width);
};

AtomRW.prototype.poolReadFrom = function readFrom(destResult, buffer, offset) {
    var remain = buffer.length - offset;
    if (remain < this.width) {
        return ReadResult.poolShortError(destResult, this.width, remain, offset);
    }
    return this.readAtomFrom(destResult, buffer, offset);
};

AtomRW.prototype.poolWriteInto = function writeInto(destResult, value, buffer, offset) {
    var remain = buffer.length - offset;
    // istanbul ignore next
    if (remain < this.width) {
        WriteResult.poolShortError(destResult, this.width, remain, offset);
    }
    return this.writeAtomInto(destResult, value, buffer, offset);
};

// jshint maxparams:5
function IntegerRW(width, min, max, readAtomFrom, writeAtomInto) {
    if (!(this instanceof IntegerRW)) {
        return new IntegerRW(width, min, max, readAtomFrom, writeAtomInto);
    }
    AtomRW.call(this, width, readAtomFrom, writeAtomInto);
    this.min = min;
    this.max = max;
}
inherits(IntegerRW, AtomRW);

IntegerRW.prototype.poolWriteInto = function poolWriteInto(destResult, value, buffer, offset) {
    if (typeof value !== 'number') {
        return destResult.reset(errors.expected(value, 'a number'));
    }
    if (value < this.min || value > this.max) {
        return destResult.reset(errors.RangeError({
            value: value,
            min: this.min,
            max: this.max
        }), offset);
    }
    var remain = buffer.length - offset;
    if (remain < this.width) {
        return WriteResult.poolShortError(destResult, this.width, remain, offset);
    }
    return this.writeAtomInto(destResult, value, buffer, offset);
};

var Int8 = IntegerRW(1, -0x80, 0x7f,
    function readInt8From(destResult, buffer, offset) {
        var value = buffer.readInt8(offset, true);
        return destResult.reset(null, offset + 1, value);
    },
    function writeInt8Into(destResult, value, buffer, offset) {
        buffer.writeInt8(value, offset, true);
        return destResult.reset(null, offset + 1);
    });

var Int16BE = IntegerRW(2, -0x8000, 0x7fff,
    function readInt16BEFrom(destResult, buffer, offset) {
        var value = buffer.readInt16BE(offset, true);
        return destResult.reset(null, offset + 2, value);
    },
    function writeInt16BEInto(destResult, value, buffer, offset) {
        buffer.writeInt16BE(value, offset, true);
        return destResult.reset(null, offset + 2);
    });

var Int32BE = IntegerRW(4, -0x80000000, 0x7fffffff,
    function readInt32BEFrom(destResult, buffer, offset) {
        var value = buffer.readInt32BE(offset, true);
        return destResult.reset(null, offset + 4, value);
    },
    function writeInt32BEInto(destResult, value, buffer, offset) {
        buffer.writeInt32BE(value, offset, true);
        return destResult.reset(null, offset + 4);
    });

var Int16LE = IntegerRW(2, -0x8000, 0x7fff,
    function readInt16LEFrom(destResult, buffer, offset) {
        var value = buffer.readInt16LE(offset, true);
        return destResult.reset(null, offset + 2, value);
    },
    function writeInt16LEInto(destResult, value, buffer, offset) {
        buffer.writeInt16LE(value, offset, true);
        return destResult.reset(null, offset + 2);
    });

var Int32LE = IntegerRW(4, -0x80000000, 0x7fffffff,
    function readInt32LEFrom(destResult, buffer, offset) {
        var value = buffer.readInt32LE(offset, true);
        return destResult.reset(null, offset + 4, value);
    },
    function writeInt32LEInto(destResult, value, buffer, offset) {
        buffer.writeInt32LE(value, offset, true);
        return destResult.reset(null, offset + 4);
    });

var UInt8 = IntegerRW(1, 0, 0xff,
    function readUInt8From(destResult, buffer, offset) {
        var value = buffer.readUInt8(offset, true);
        return destResult.reset(null, offset + 1, value);
    },
    function writeUInt8Into(destResult, value, buffer, offset) {
        buffer.writeUInt8(value, offset, true);
        return destResult.reset(null, offset + 1);
    });

var UInt16BE = IntegerRW(2, 0, 0xffff,
    function readUInt16BEFrom(destResult, buffer, offset) {
        var value = buffer.readUInt16BE(offset, true);
        return destResult.reset(null, offset + 2, value);
    },
    function writeUInt16BEInto(destResult, value, buffer, offset) {
        buffer.writeUInt16BE(value, offset, true);
        return destResult.reset(null, offset + 2);
    });

var UInt32BE = IntegerRW(4, 0, 0xffffffff,
    function readUInt32BEFrom(destResult, buffer, offset) {
        var value = buffer.readUInt32BE(offset, true);
        return destResult.reset(null, offset + 4, value);
    },
    function writeUInt32BEInto(destResult, value, buffer, offset) {
        buffer.writeUInt32BE(value, offset, true);
        return destResult.reset(null, offset + 4);
    });

var UInt16LE = IntegerRW(2, 0, 0xffff,
    function readUInt16LEFrom(destResult, buffer, offset) {
        var value = buffer.readUInt16LE(offset, true);
        return destResult.reset(null, offset + 2, value);
    },
    function writeUInt16LEInto(destResult, value, buffer, offset) {
        buffer.writeUInt16LE(value, offset, true);
        return destResult.reset(null, offset + 2);
    });

var UInt32LE = IntegerRW(4, 0, 0xffffffff,
    function readUInt32LEFrom(destResult, buffer, offset) {
        var value = buffer.readUInt32LE(offset, true);
        return destResult.reset(null, offset + 4, value);
    },
    function writeUInt32LEInto(destResult, value, buffer, offset) {
        buffer.writeUInt32LE(value, offset, true);
        return destResult.reset(null, offset + 4);
    });

var FloatLE = AtomRW(4,
    function readFloatLEFrom(destResult, buffer, offset) {
        var value = buffer.readFloatLE(offset, true);
        return destResult.reset(null, offset + 4, value);
    },
    function writeFloatLEInto(destResult, value, buffer, offset) {
        // istanbul ignore if
        if (typeof value !== 'number') {
            return destResult.reset(errors.expected(value, 'a number'), null);
        } else {
            buffer.writeFloatLE(value, offset);
            return destResult.reset(null, offset + 4);
        }
    });

var FloatBE = AtomRW(4,
    function readFloatBEFrom(destResult, buffer, offset) {
        var value = buffer.readFloatBE(offset, true);
        return destResult.reset(null, offset + 4, value);
    },
    function writeFloatBEInto(destResult, value, buffer, offset) {
        // istanbul ignore if
        if (typeof value !== 'number') {
            return destResult.reset(errors.expected(value, 'a number'), null);
        } else {
            buffer.writeFloatBE(value, offset);
            return destResult.reset(null, offset + 4);
        }
    });

var DoubleLE = AtomRW(8,
    function readDoubleLEFrom(destResult, buffer, offset) {
        var value = buffer.readDoubleLE(offset, true);
        return destResult.reset(null, offset + 8, value);
    },
    function writeDoubleLEInto(destResult, value, buffer, offset) {
        // istanbul ignore if
        if (typeof value !== 'number') {
            return destResult.reset(errors.expected(value, 'a number'), null);
        } else {
            buffer.writeDoubleLE(value, offset);
            return destResult.reset(null, offset + 8);
        }
    });

var DoubleBE = AtomRW(8,
    function readDoubleBEFrom(destResult, buffer, offset) {
        var value = buffer.readDoubleBE(offset, true);
        return destResult.reset(null, offset + 8, value);
    },
    function writeDoubleBEInto(destResult, value, buffer, offset) {
        // istanbul ignore if
        if (typeof value !== 'number') {
            return destResult.reset(errors.expected(value, 'a number'), null);
        } else {
            buffer.writeDoubleBE(value, offset);
            return destResult.reset(null, offset + 8);
        }
    });

module.exports.AtomRW = AtomRW;
module.exports.Int8 = Int8;
module.exports.Int16BE = Int16BE;
module.exports.Int32BE = Int32BE;
module.exports.Int16LE = Int16LE;
module.exports.Int32LE = Int32LE;
module.exports.UInt8 = UInt8;
module.exports.UInt16BE = UInt16BE;
module.exports.UInt32BE = UInt32BE;
module.exports.UInt16LE = UInt16LE;
module.exports.UInt32LE = UInt32LE;
module.exports.FloatLE = FloatLE;
module.exports.FloatBE = FloatBE;
module.exports.DoubleLE = DoubleLE;
module.exports.DoubleBE = DoubleBE;

},{"./base":34,"./errors":36,"util":93}],34:[function(_dereq_,module,exports){
// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
'use strict';

var assert = _dereq_('assert');

var errors = _dereq_('./errors');

module.exports.BufferRW = BufferRW;
module.exports.LengthResult = LengthResult;
module.exports.WriteResult = WriteResult;
module.exports.ReadResult = ReadResult;

function BufferRW(byteLength, readFrom, writeInto, isPooled) {
    if (!(this instanceof BufferRW)) {
        return new BufferRW(byteLength, readFrom, writeInto, isPooled);
    }

    // istanbul ignore else
    if (byteLength && readFrom && writeInto) {
        assert(typeof byteLength === 'function', 'expected byteLength to be function');
        assert(typeof readFrom === 'function', 'expected readFrom to be function');
        assert(typeof writeInto === 'function', 'expected writeInto to be function');
        // istanbul ignore else
        if (isPooled) {
            this.poolByteLength = byteLength;
            this.poolReadFrom = readFrom;
            this.poolWriteInto = writeInto;
        } else {
            this.byteLength = byteLength;
            this.readFrom = readFrom;
            this.writeInto = writeInto;
        }
    } else {
        // Args weren't specified. Expect either pool methods or regular
        // methods to be overriden.

        assert(
            this.poolReadFrom !== BufferRW.prototype.poolReadFrom ||
            this.readFrom !== BufferRW.prototype.readFrom,
            'expected either poolReadFrom or readFrom to be overriden'
        );
        assert(
            this.poolWriteInto !== BufferRW.prototype.poolWriteInto ||
            this.writeInto !== BufferRW.prototype.writeInto,
            'expected either poolWriteInto or writeInto to be overriden'
        );
        assert(
            this.poolByteLength !== BufferRW.prototype.poolByteLength ||
            this.byteLength !== BufferRW.prototype.byteLength,
            'expected either poolByteLength or byteLength to be overriden'
        );
    }
}

BufferRW.prototype.readFrom = function readFrom(arg1, arg2, arg3) {
    assert(this.poolReadFrom !== BufferRW.prototype.poolReadFrom, 'poolReadFrom is overridden');
    var readResult = new ReadResult();
    this.poolReadFrom(readResult, arg1, arg2, arg3);
    return readResult;
};

BufferRW.prototype.writeInto = function writeInto(value, buffer, offset) {
    assert(this.poolWriteInto !== BufferRW.prototype.poolWriteInto, 'poolWriteInto is overridden');
    var writeResult = new WriteResult();
    this.poolWriteInto(writeResult, value, buffer, offset);
    return writeResult;
};

BufferRW.prototype.byteLength = function byteLength(arg1, arg2, arg3) {
    assert(this.poolbyteLength !== BufferRW.prototype.poolByteLength, 'poolByteLength is overridden');
    var lengthResult = new LengthResult();
    this.poolByteLength(lengthResult, arg1, arg2, arg3);
    return lengthResult;
};

// istanbul ignore next
BufferRW.prototype.poolReadFrom = function poolReadFrom(destResult, arg1, arg2, arg3) {
    var res = this.readFrom(arg1, arg2, arg3);
    return destResult.copyFrom(res);
};

// istanbul ignore next
BufferRW.prototype.poolWriteInto = function poolWriteInto(destResult, value, buffer, offset) {
    var res = this.writeInto(value, buffer, offset);
    return destResult.copyFrom(res);
};

// istanbul ignore next
BufferRW.prototype.poolByteLength = function poolByteLength(destResult, arg1, arg2, arg3) {
    var res = this.byteLength(arg1, arg2, arg3);
    return destResult.copyFrom(res);
};

function LengthResult(err, length) {
    this.err = err || null;
    this.length = length || 0;
}

LengthResult.prototype.reset = function reset(err, length) {
    this.err = err;
    this.length = length;
    return this;
};

// istanbul ignore next
LengthResult.prototype.copyFrom = function copyFrom(srcRes) {
    this.err = srcRes.err;
    this.length = srcRes.length;
    return this;
};

// istanbul ignore next
LengthResult.error = function error(err, length) {
    return new LengthResult(err, length);
};

// istanbul ignore next
LengthResult.just = function just(length) {
    return new LengthResult(null, length);
};

function WriteResult(err, offset) {
    this.err = err || null;
    this.offset = offset || 0;
}

WriteResult.prototype.reset = function reset(err, offset) {
    this.err = err;
    this.offset = offset;
    return this;
};

// istanbul ignore next
WriteResult.prototype.copyFrom = function copyFrom(srcResult) {
    this.err = srcResult.err;
    this.offset = srcResult.offset;
};

// istanbul ignore next
WriteResult.error = function error(err, offset) {
    return new WriteResult(err, offset);
};

// istanbul ignore next
/*jshint maxparams:6*/
WriteResult.poolRangedError = function poolRangedError(destResult, err, start, end, value) {
    assert(typeof destResult === 'object' && destResult.constructor.name === 'WriteResult');

    err.offest = start;
    err.endOffset = end;
    return destResult.reset(err, start, value);
};

// istanbul ignore next
WriteResult.rangedError = function rangedError(err, start, end, value) {
    return WriteResult.poolRangedError(new WriteResult(), start, end, value);
};

// istanbul ignore next
WriteResult.just = function just(offset) {
    return new WriteResult(null, offset);
};


// istanbul ignore next
WriteResult.shortError = function shortError(expected, actual, offset) {
    return WriteResult.poolShortError(new WriteResult(), expected, actual, offset);
};

// istanbul ignore next
WriteResult.poolShortError = function poolShortError(destResult, expected, actual, offset) {
    assert(typeof destResult === 'object' && destResult.constructor.name === 'WriteResult');

    return destResult.reset(new errors.ShortBuffer({
        expected: expected,
        actual: actual,
        offset: offset
    }), offset);
};

function ReadResult(err, offset, value) {
    this.err = err || null;
    this.offset = offset || 0;
    // istanbul ignore next
    this.value = value === undefined ? null : value;
}

// istanbul ignore next
ReadResult.prototype.copyFrom = function copyFrom(srcResult) {
    this.err = srcResult.err;
    this.offset = srcResult.offset;
    this.value = srcResult.value;
    return this;
};

// istanbul ignore next
ReadResult.prototype.reset = function reset(err, offset, value) {
    this.err = err;
    this.offset = offset;
    this.value = value;
    return this;
};

// istanbul ignore next
ReadResult.error = function error(err, offset, value) {
    return new ReadResult(err, offset, value);
};

// istanbul ignore next
ReadResult.poolRangedError = function poolRangedError(destResult, err, start, end, value) {
    assert(typeof destResult === 'object' && destResult.constructor.name === 'ReadResult');

    err.offest = start;
    err.endOffset = end;
    return destResult.reset(err, start, value);
};

// istanbul ignore next
ReadResult.rangedError = function rangedError(err, start, end, value) {
    return ReadResult.poolRangedError(new ReadResult(), err, start, end, value);
};

// istanbul ignore next
ReadResult.just = function just(offset, value) {
    return new ReadResult(null, offset, value);
};

// istanbul ignore next
ReadResult.shortError = function shortError(destResult, expected, actual, offset, endOffset) {
    return ReadResult.poolShortError(new ReadResult(), expected, actual, offset, endOffset);
};

ReadResult.poolShortError = function poolShortError(destResult, expected, actual, offset, endOffset) {
    assert(typeof destResult === 'object' && destResult.constructor.name === 'ReadResult');
    var err;

    if (endOffset === undefined) {
        err = new errors.ShortBuffer({
            expected: expected,
            actual: actual,
            offset: offset
        }); 
    } else {
        err = new errors.ShortBufferRanged({
            expected: expected,
            actual: actual,
            offset: offset,
            endOffset: endOffset
        });
    }

    return destResult.reset(err, offset);
};

},{"./errors":36,"assert":24}],35:[function(_dereq_,module,exports){
// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var color = _dereq_('ansi-color').set;
var stripColor = _dereq_('./lib/strip_color.js');

module.exports = errorHighlighter;

// istanbul ignore next
function errorHighlighter(err, options) {
    options = options || {};
    var errColor = colorer(options.errorColor || 'red+bold');

    var hasOffset = !(err.offset === undefined || err.offset === null);
    var hasEnd = !(err.endOffset === undefined || err.endOffset === null);
    var within = false;

    if (!hasOffset) return null;
    if (hasEnd) {
        return decorateRangedError;
    } else {
        return decorateError;
    }

    function decorateRangedError(totalOffset, screenOffset, str) {
        if (totalOffset === err.offset) {
            within = totalOffset !== err.endOffset-1;
            return errColor(stripColor(str));
        } else if (totalOffset === err.endOffset-1) {
            within = false;
            return errColor(stripColor(str));
        } else if (within) {
            return errColor(stripColor(str));
        } else {
            return str;
        }
    }

    function decorateError(totalOffset, screenOffset, str) {
        if (totalOffset === err.offset) {
            return errColor(stripColor(str));
        } else {
            return str;
        }
    }
}

// istanbul ignore next
function colorer(col) {
    if (typeof col === 'function') return col;
    return function colorIt(str) {
        return color(str, col);
    };
}

},{"./lib/strip_color.js":40,"ansi-color":23}],36:[function(_dereq_,module,exports){
// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var TypedError = _dereq_('error/typed');
var WrappedError = _dereq_('error/wrapped');

module.exports.expected = function expected(got, descr) {
    return module.exports.InvalidArgument({
        expected: descr,
        argType: typeof got,
        argConstructor: got && got.constructor.name
    });
};

module.exports.BrokenReaderState = TypedError({
    type: 'bufrw.broken-reader-state',
    message: 'reader in invalid state {state} expecting {expecting} avail {aval}',
    state: null,
    expecting: null,
    avail: null
});

module.exports.FixedLengthMismatch = TypedError({
    type: 'bufrw.fixed-length-mismatch',
    message: 'supplied length {got} mismatches fixed length {expected}',
    expected: null,
    got: null
});

module.exports.RangeError = TypedError({
    type: 'bufrw.range-error',
    message: 'value {value} out of range, min: {min} max: {max}',
    value: null,
    min: null,
    max: null
});

module.exports.InvalidArgument = TypedError({
    type: 'bufrw.invalid-argument',
    message: 'invalid argument, expected {expected}',
    expected: null,
    argType: null,
    argConstructor: null
});

module.exports.ReadInvalidSwitchValue = TypedError({
    type: 'bufrw.read.invalid-switch-value',
    message: 'read invalid switch value {value}',
    value: null
});

module.exports.WriteInvalidSwitchValue = TypedError({
    type: 'bufrw.write.invalid-switch-value',
    message: 'write invalid switch value {value}',
    value: null
});

module.exports.MissingStructField = TypedError({
    type: 'bufrw.missing.struct-field',
    message: 'missing field {field} on {struct}',
    field: null,
    struct: null
});

module.exports.ShortBuffer = TypedError({
    type: 'bufrw.short-buffer',
    message: 'expected at least {expected} bytes, only have {actual} @{offset}',
    expected: null,
    actual: null,
    buffer: null,
    offset: null
});

module.exports.ShortBufferRanged = TypedError({
    type: 'bufrw.short-buffer',
    message: 'expected at least {expected} bytes, only have {actual} @[{offset}:{endOffset}]',
    expected: null,
    actual: null,
    offset: null,
    endOffset: null
});

module.exports.ShortRead = TypedError({
    type: 'bufrw.short-read',
    message: 'short read, {remaining} byte left over after consuming {offset}',
    remaining: null,
    buffer: null,
    offset: null
});

module.exports.ShortWrite = TypedError({
    type: 'bufrw.short-write',
    message: 'short write, {remaining} byte left over after writing {offset}',
    remaining: null,
    buffer: null,
    offset: null
});

module.exports.TruncatedRead = TypedError({
    type: 'bufrw.truncated-read',
    message: 'read truncated by end of stream with {length} bytes in buffer',
    length: null,
    buffer: null,
    state: null,
    expecting: null
});

module.exports.UnstableRW = WrappedError({
    type: 'bufrw.unstable-rw',
    message: 'Unstable RW error: {origMessage} (other: {otherMessage})',
    otherMessage: null
});

module.exports.ZeroLengthChunk = TypedError({
    type: 'bufrw.zero-length-chunk',
    message: 'zero length chunk encountered'
});

module.exports.classify = classify;

function classify(err) {
    switch (err.type) {
        case 'bufrw.broken-reader-state':
        case 'bufrw.unstable-rw':
            return 'Internal';

        case 'bufrw.invalid-argument':
        case 'bufrw.read.invalid-switch-value':
        case 'bufrw.short-buffer':
        case 'bufrw.short-read':
        case 'bufrw.truncated-read':
        case 'bufrw.zero-length-chunk':
            return 'Read';

        case 'bufrw.fixed-length-mismatch':
        case 'bufrw.missing.struct-field':
        case 'bufrw.range-error':
        case 'bufrw.short-write':
        case 'bufrw.write.invalid-switch-value':
            return 'Write';

        // istanbul ignore next
        default:
            return null;
    }
}

},{"error/typed":41,"error/wrapped":42}],37:[function(_dereq_,module,exports){
// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
'use strict';

module.exports = FixedWidthRW;

var inherits = _dereq_('util').inherits;

var ReadResult = _dereq_('./base').ReadResult;
var BufferRW = _dereq_('./base').BufferRW;
var errors = _dereq_('./errors');

function FixedWidthRW(length, readFrom, writeInto) {
    if (!(this instanceof FixedWidthRW)) {
        return new FixedWidthRW(length, readFrom, writeInto);
    }
    this.length = length;

   // BufferRW.call(this);
}
inherits(FixedWidthRW, BufferRW);

FixedWidthRW.prototype.poolByteLength = function poolByteLength(destResult, slice) {
    if (slice.length !== this.length) {
        return destResult.reset(errors.FixedLengthMismatch({
            expected: this.length,
            got: slice.length
        }), null);
    } else {
        return destResult.reset(null, this.length);
    }
};

FixedWidthRW.prototype.poolWriteInto = function poolWriteInto(destResult, slice, buffer, offset) {
    if (slice.length !== this.length) {
        return destResult.reset(errors.FixedLengthMismatch({
            expected: this.length,
            got: slice.length
        }), offset);
    }
    slice.copy(buffer, offset);
    //return new WriteResult(null, offset + this.length);
    return destResult.reset(null, offset + this.length);
};

FixedWidthRW.prototype.poolReadFrom = function poolReadFrom(destResult, buffer, offset) {
    var end = offset + this.length;
    if (end > buffer.length) {
        return ReadResult.poolShortError(destResult, this.length, buffer.length - offset, offset);
    } else {
        //var res = new ReadResult(null, end, buffer.slice(offset, end));
        return destResult.reset(null, end, buffer.slice(offset, end));
    }
};

},{"./base":34,"./errors":36,"util":93}],38:[function(_dereq_,module,exports){
// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

module.exports.fromBuffer = _dereq_('./interface').fromBuffer;
module.exports.byteLength = _dereq_('./interface').byteLength;
module.exports.toBuffer = _dereq_('./interface').toBuffer;
module.exports.intoBuffer = _dereq_('./interface').intoBuffer;

module.exports.fromBufferTuple = _dereq_('./interface').fromBufferTuple;
module.exports.byteLengthTuple = _dereq_('./interface').byteLengthTuple;
module.exports.toBufferTuple = _dereq_('./interface').toBufferTuple;
module.exports.intoBufferTuple = _dereq_('./interface').intoBufferTuple;

module.exports.fromBufferResult = _dereq_('./interface').fromBufferResult;
module.exports.byteLengthResult = _dereq_('./interface').byteLengthResult;
module.exports.toBufferResult = _dereq_('./interface').toBufferResult;
module.exports.intoBufferResult = _dereq_('./interface').intoBufferResult;

module.exports.formatError = _dereq_('./interface').formatError;

module.exports.Base = _dereq_('./base').BufferRW; // TODO: align names
module.exports.LengthResult = _dereq_('./base').LengthResult;
module.exports.WriteResult = _dereq_('./base').WriteResult;
module.exports.ReadResult = _dereq_('./base').ReadResult;

var atoms = _dereq_('./atoms');

module.exports.AtomRW = atoms.AtomRW;
module.exports.Int8 = atoms.Int8;
module.exports.Int16BE = atoms.Int16BE;
module.exports.Int32BE = atoms.Int32BE;
module.exports.Int16LE = atoms.Int16LE;
module.exports.Int32LE = atoms.Int32LE;
module.exports.UInt8 = atoms.UInt8;
module.exports.UInt16BE = atoms.UInt16BE;
module.exports.UInt32BE = atoms.UInt32BE;
module.exports.UInt16LE = atoms.UInt16LE;
module.exports.UInt32LE = atoms.UInt32LE;
module.exports.FloatLE = atoms.FloatLE;
module.exports.FloatBE = atoms.FloatBE;
module.exports.DoubleLE = atoms.DoubleLE;
module.exports.DoubleBE = atoms.DoubleBE;

module.exports.Null = _dereq_('./null');
module.exports.FixedWidth = _dereq_('./fixed_width_rw');

var VariableBuffer = _dereq_('./variable_buffer_rw');
var buf1 = VariableBuffer(atoms.UInt8);
var buf2 = VariableBuffer(atoms.UInt16BE);
module.exports.buf1 = buf1;
module.exports.buf2 = buf2;
module.exports.VariableBuffer = VariableBuffer;

var StringRW = _dereq_('./string_rw');
var varint = _dereq_('./varint');
var str1 = StringRW(atoms.UInt8, 'utf8');
var str2 = StringRW(atoms.UInt16BE, 'utf8');
var strn = StringRW(varint.unsigned, 'utf8');

module.exports.str1 = str1;
module.exports.str2 = str2;
module.exports.strn = strn;
module.exports.String = StringRW;

module.exports.varint = varint;

module.exports.Series = _dereq_('./series');
module.exports.Struct = _dereq_('./struct');
module.exports.Switch = _dereq_('./switch');
module.exports.Repeat = _dereq_('./repeat');
module.exports.Skip = _dereq_('./skip');

},{"./atoms":33,"./base":34,"./fixed_width_rw":37,"./interface":39,"./null":43,"./repeat":44,"./series":46,"./skip":47,"./string_rw":48,"./struct":49,"./switch":50,"./variable_buffer_rw":51,"./varint":52}],39:[function(_dereq_,module,exports){
(function (Buffer){
// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var hex = _dereq_('hexer');

var util = _dereq_('util');
var Result = _dereq_('./result');
var errors = _dereq_('./errors');

var AnnotatedBuffer = _dereq_('./annotated_buffer');
var errorHighlighter = _dereq_('./error_highlighter');

function makeAnnotatedBuffer(buffer, start, clear) {
    // istanbul ignore if
    if (start > 0) buffer = buffer.slice(start);
    // istanbul ignore if
    if (clear) buffer.fill(0);
    return new AnnotatedBuffer(buffer);
}

function annotateError(res1, res2, start, annBuf) {
    // istanbul ignore if
    if (!res2.err ||
        res2.offset !== res1.offset - start ||
        res2.err.type !== res1.err.type ||
        res2.err.message !== res1.err.message) {
        res1.err = errors.UnstableRW(res1.err, {
            otherMessage: res2.err && res2.err.message
        });
    } else {
        res1.err.buffer = annBuf;
    }
}

var emptyBuffer = Buffer(0);

function fromBuffer(rw, buffer, offset) {
    return fromBufferResult(rw, buffer, offset).toValue();
}

function byteLength(rw, value) {
    return byteLengthResult(rw, value).toValue();
}

function toBuffer(rw, value) {
    return toBufferResult(rw, value).toValue();
}

function intoBuffer(rw, buffer, value) {
    return intoBufferResult(rw, buffer, value).toValue();
}

// The "Tuple" methods are deprecated

/* istanbul ignore next */
function fromBufferTuple(rw, buffer, offset) {
    return fromBufferResult(rw, buffer, offset).toTuple();
}

/* istanbul ignore next */
function byteLengthTuple(rw, value) {
    return byteLengthResult(rw, value).toTuple();
}

/* istanbul ignore next */
function toBufferTuple(rw, value) {
    return toBufferResult(rw, value).toTuple();
}

/* istanbul ignore next */
function intoBufferTuple(rw, buffer, value) {
    return intoBufferResult(rw, buffer, value).toTuple();
}

function checkAllReadFrom(res, buffer) {
    if (!res.err && res.offset !== buffer.length) {
        res.err = errors.ShortRead({
            remaining: buffer.length - res.offset,
            buffer: buffer,
            offset: res.offset
        });
    }
    return res;
}

function genericResult(err, value, buffer, offset) {
    if (err) {
        if (err.offset === undefined) err.offset = offset;
        if (err.buffer === undefined) err.buffer = buffer;
    }
    return new Result(err, value);
}

function fromBufferResult(rw, buffer, offset) {
    var start = offset || 0;
    var res = rw.readFrom(buffer, start);
    res = checkAllReadFrom(res, buffer);
    if (res.err) {
        var annBuf = makeAnnotatedBuffer(buffer, start, false);
        var res2 = rw.readFrom(annBuf, 0);
        res2 = checkAllReadFrom(res2, buffer);
        annotateError(res, res2, start, annBuf);
    }
    return genericResult(res.err, res.value, buffer, res.offset);
}

function byteLengthResult(rw, value) {
    var lenRes = rw.byteLength(value);
    if (lenRes.err) return new Result(lenRes.err, 0);
    else return new Result(null, lenRes.length);
}

function toBufferResult(rw, value) {
    var lenRes = rw.byteLength(value);
    if (lenRes.err) return new Result(lenRes.err, emptyBuffer);
    var length = lenRes.length;
    var buffer = new Buffer(length);
    // buffer.fill(0); TODO option
    return intoBufferResult(rw, buffer, value);
}

function checkAllWroteOver(res, buffer) {
    if (!res.err && res.offset !== buffer.length) {
        res.err = errors.ShortWrite({
            remaining: buffer.length - res.offset,
            buffer: buffer,
            offset: res.offset
        });
    }
    return res;
}

function intoBufferResult(rw, buffer, value) {
    var res = rw.writeInto(value, buffer, 0);
    res = checkAllWroteOver(res, buffer);
    return genericResult(res.err, buffer, buffer, res.offset);
}

// istanbul ignore next TODO
function formatError(err, options) {
    options = options || {};
    var name = err.name || err.constructor.name;
    var str = util.format('%s: %s\n', name, err.message);
    if (err.buffer && err.buffer.hexdump) {
        str += err.buffer.hexdump({
            colored: options.color,
            boldStart: false,
            highlight: options.color ? errorHighlighter(err, options) : null
        });
    } else if (Buffer.isBuffer(err.buffer)) {
        if (options.color) {
            str += formatBufferColored(err, options);
        } else {
            str += formatBufferUncolored(err, options);
        }
    }
    return str;
}

// istanbul ignore next TODO
function formatBufferColored(err, options) {
    // istanbul ignore else
    if (!hex) {
        return err.buffer.toString('hex');
    }

    options = options || {};
    var opts = options.hexerOptions ? Object.create(options.hexerOptions) : {};
    if (opts.colored === undefined) {
        opts.colored = true;
    }
    var highlight = errorHighlighter(err, options);
    opts.decorateHexen = highlight;
    opts.decorateHuman = highlight;
    return hex(err.buffer, opts);
}

// istanbul ignore next TODO
function formatBufferUncolored(err, options) {
    // istanbul ignore else
    if (!hex) {
        return err.buffer.toString('hex');
    }

    options = options || {};

    var hasOffset = !(err.offset === undefined || err.offset === null);
    var hasEnd = !(err.endOffset === undefined || err.endOffset === null);
    var markStart = options.markStart || '>';
    var markEnd = options.markEnd || '<';
    var accum = 0;

    var opts = options.hexerOptions ? Object.create(options.hexerOptions) : {};
    if (hasOffset) {
        opts.groupSeparator = '';
        if (hasEnd) {
            opts.decorateHexen = decorateRangedError;
        } else {
            opts.decorateHexen = decorateError;
        }
    }
    return hex(err.buffer, opts);

    // TODO: suspected broken across lines, should either test and complete or
    // use some sort of alternate notation such as interstitial lines
    function decorateRangedError(totalOffset, screenOffset, hexen) {
        var s;
        if (totalOffset === err.offset) {
            accum = 1;
            s = markStart + hexen;
            if (totalOffset === err.endOffset-1) {
                s += markEnd;
                accum = 0;
            } else {
                s = ' ' + s;
            }
            return s;
        } else if (totalOffset === err.endOffset-1) {
            s = hexen + markEnd;
            while (accum-- > 0) s += ' ';
            accum = 0;
            return s;
        } else if (accum) {
            accum += 2;
            return hexen;
        } else {
            return ' ' + hexen + ' ';
        }
    }

    function decorateError(totalOffset, screenOffset, hexen) {
        if (totalOffset === err.offset) {
            return markStart + hexen + markEnd;
        } else {
            return ' ' + hexen + ' ';
        }
    }
}

module.exports.fromBuffer = fromBuffer;
module.exports.byteLength = byteLength;
module.exports.toBuffer = toBuffer;
module.exports.intoBuffer = intoBuffer;
module.exports.formatError = formatError;

module.exports.fromBufferTuple = fromBufferTuple;
module.exports.byteLengthTuple = byteLengthTuple;
module.exports.toBufferTuple = toBufferTuple;
module.exports.intoBufferTuple = intoBufferTuple;

module.exports.fromBufferResult = fromBufferResult;
module.exports.byteLengthResult = byteLengthResult;
module.exports.toBufferResult = toBufferResult;
module.exports.intoBufferResult = intoBufferResult;

module.exports.makeAnnotatedBuffer = makeAnnotatedBuffer;
module.exports.checkAllReadFrom = checkAllReadFrom;
module.exports.annotateError = annotateError;

}).call(this,_dereq_("buffer").Buffer)
},{"./annotated_buffer":32,"./error_highlighter":35,"./errors":36,"./result":45,"buffer":31,"hexer":59,"util":93}],40:[function(_dereq_,module,exports){
// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

module.exports = stripColor;

// istanbul ignore next
function stripColor(str) {
    while (true) {
        var i = str.indexOf('\x1b[');
        if (i < 0) return str;
        var j = str.indexOf('m', i);
        if (j < 0) return str;
        str = str.slice(0, i) + str.slice(j + 1);
    }
}

},{}],41:[function(_dereq_,module,exports){
'use strict';

var template = _dereq_('string-template');
var assert = _dereq_('assert');

var hasOwnProperty = Object.prototype.hasOwnProperty;
var isWordBoundary = /[_.-](\w|$)/g;

var FUNCTION_FIELD_WHITELIST = Object.getOwnPropertyNames(TypedError)

module.exports = TypedError;

function TypedError(args) {
    assert(args, 'TypedError: must specify options');
    assert(args.type, 'TypedError: must specify options.type');
    assert(args.message, 'TypedError: must specify options.message');

    assert(!has(args, 'fullType'),
        'TypedError: fullType field is reserved');

    var message = args.message;
    var funcName = args.name
    if (!funcName) {
        var errorName = camelCase(args.type) + 'Error';
        funcName = errorName[0].toUpperCase() + errorName.substr(1);
    }

    var copyArgs = {}
    extend(copyArgs, args)
    for (var i = 0; i < FUNCTION_FIELD_WHITELIST.length; i++) {
        delete copyArgs[FUNCTION_FIELD_WHITELIST[i]]
    }

    extend(createError, copyArgs);
    createError._name = funcName;

    return createError;

    function createError(opts) {
        var result = new Error();

        Object.defineProperty(result, 'type', {
            value: result.type,
            enumerable: true,
            writable: true,
            configurable: true
        });

        var options = {}
        extend(options, args)
        extend(options, opts)
        if (!options.fullType) {
            options.fullType = options.type;
        }

        result.name = funcName
        extend(result, options);
        if (opts && opts.message) {
            result.message = template(opts.message, options);
        } else if (message) {
            result.message = template(message, options);
        }

        return result;
    }
}

function extend(target, source) {
    for (var key in source) {
        if (hasOwnProperty.call(source, key)) {
            target[key] = source[key]
        }
    }
}

function camelCase(str) {
    return str.replace(isWordBoundary, upperCase);
}

function upperCase(_, x) {
    return x.toUpperCase();
}

function has(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

},{"assert":24,"string-template":86}],42:[function(_dereq_,module,exports){
'use strict';

var assert = _dereq_('assert');
var util = _dereq_('util');

var TypedError = _dereq_('./typed.js');

var objectToString = Object.prototype.toString;
var ERROR_TYPE = '[object Error]';
var causeMessageRegex = /\{causeMessage\}/g;
var origMessageRegex = /\{origMessage\}/g;
var hasOwnProperty = Object.prototype.hasOwnProperty;

var FUNCTION_FIELD_WHITELIST = Object.getOwnPropertyNames(WrappedError)

module.exports = WrappedError;

function WrappedError(options) {
    assert(options, 'WrappedError: must specify options');
    assert(options.type, 'WrappedError: must specify type');
    assert(options.message, 'WrappedError: must specify message');

    assert(!has(options, 'cause'),
        'WrappedError: cause field is reserved');
    assert(!has(options, 'fullType'),
        'WrappedError: fullType field is reserved');
    assert(!has(options, 'causeMessage'),
        'WrappedError: causeMessage field is reserved');
    assert(!has(options, 'origMessage'),
        'WrappedError: origMessage field is reserved');

    var copyArgs = {}
    extend(copyArgs, options)
    for (var i = 0; i < FUNCTION_FIELD_WHITELIST.length; i++) {
        delete copyArgs[FUNCTION_FIELD_WHITELIST[i]]
    }

    var createTypedError = TypedError(options);
    extend(createError, copyArgs);
    createError._name = options.name;

    return createError;

    function createError(cause, opts) {
        /*eslint max-statements: [2, 25]*/
        assert(cause, 'an error is required');
        assert(isError(cause),
            'WrappedError: first argument must be an error');

        var causeMessage = cause.message;
        if (causeMessage.indexOf('{causeMessage}') >= 0) {
            // recover
            causeMessage = causeMessage.replace(
                causeMessageRegex,
                '$INVALID_CAUSE_MESSAGE_LITERAL'
            );
        }
        if (causeMessage.indexOf('{origMessage}') >= 0) {
            causeMessage = causeMessage.replace(
                origMessageRegex,
                '$INVALID_ORIG_MESSAGE_LITERAL'
            );
        }

        var nodeCause = false;
        var errOptions = {}
        extend(errOptions, opts)
        extend(errOptions, {
            causeMessage: causeMessage,
            origMessage: causeMessage
        });

        if (has(cause, 'code') && !has(errOptions, 'code')) {
            errOptions.code = cause.code;
        }

        if (has(cause, 'errno') && !has(errOptions, 'errno')) {
            errOptions.errno = cause.errno;
            nodeCause = true;
        }

        if (has(cause, 'syscall') && !has(errOptions, 'syscall')) {
            errOptions.syscall = cause.syscall;
            nodeCause = true;
        }

        var causeType = cause.type;
        if (!causeType && nodeCause) {
            causeType = 'error.wrapped-io.' +
                (cause.syscall || 'unknown') + '.' +
                (cause.errno || 'unknown');
        } else {
            causeType = 'error.wrapped-unknown';
        }

        errOptions.fullType = options.type + '~!~' +
            (cause.fullType || cause.type || causeType);

        var err = createTypedError(errOptions);

        Object.defineProperty(err, 'cause', {
            value: cause,
            configurable: true,
            enumerable: false
        });
        return err;
    }
}

function has(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

function isError(err) {
    return util.isError(err) || objectToString.call(err) === ERROR_TYPE;
}

function extend(target, source) {
    for (var key in source) {
        if (hasOwnProperty.call(source, key)) {
            target[key] = source[key]
        }
    }
}

},{"./typed.js":41,"assert":24,"util":93}],43:[function(_dereq_,module,exports){
// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var AtomRW = _dereq_('./atoms').AtomRW;

function nullWriteInto(destResult, val, buffer, offset) {
    //return new WriteResult(null, offset);
    return destResult.reset(null, offset);
}

function nullReadFrom(destResult, buffer, offset) {
    //return new ReadResult(null, offset, null);
    return destResult.reset(null, offset, null);
}

var NullRW = AtomRW(0, nullReadFrom, nullWriteInto);

module.exports = NullRW;

},{"./atoms":33}],44:[function(_dereq_,module,exports){
// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

module.exports = RepeatRW;

var inherits = _dereq_('util').inherits;

var BufferRW = _dereq_('./base').BufferRW;
var errors = _dereq_('./errors');

function RepeatRW(countrw, repeatedrw) {
    if (!(this instanceof RepeatRW)) {
        return new RepeatRW(countrw, repeatedrw);
    }
    this.countrw = countrw;
    this.repeatedrw = repeatedrw;

    BufferRW.call(this);
}
inherits(RepeatRW, BufferRW);

RepeatRW.prototype.poolByteLength = function poolByteLength(destResult, values) {
    if (!Array.isArray(values)) {
        return destResult.reset(errors.expected(values, 'an array'));
    }
    var res = this.countrw.poolByteLength(destResult, values.length);
    if (res.err) return res;
    var length = res.length;
    for (var i = 0; i < values.length; i++) {
        var partres = this.repeatedrw.poolByteLength(destResult, values[i]);
        if (partres.err) return partres;
        length += res.length;
    }
    return destResult.reset(null, length);
};

RepeatRW.prototype.poolWriteInto = function poolWriteInto(destResult, values, buffer, offset) {
    if (!Array.isArray(values)) {
        return destResult.reset(errors.expected(values, 'an array'), offset);
    }
    var res = this.countrw.poolWriteInto(destResult, values.length, buffer, offset);
    if (res.err) return res;
    offset = res.offset;
    for (var i = 0; i < values.length; i++) {
        res = this.repeatedrw.poolWriteInto(destResult, values[i], buffer, offset);
        if (res.err) return res;
        offset = res.offset;
    }
    return res;
};

RepeatRW.prototype.poolReadFrom = function poolReadFrom(destResult, buffer, offset) {
    var res = this.countrw.poolReadFrom(destResult, buffer, offset);
    if (res.err) return res;
    offset = res.offset;
    var count = res.value;
    var values = new Array(count);
    for (var i = 0; i < count; i++) {
        res = this.repeatedrw.poolReadFrom(destResult, buffer, offset);
        if (res.err) return res;
        offset = res.offset;

        if (Array.isArray(res.value)) values[i] = res.value.slice(0);
        else if (typeof res.value === 'object') values[i] = shallowCopy(res.value);
        else values[i] = res.value;
    }
    return destResult.reset(null, offset, values);
};

function shallowCopy(obj) {
    var keys = Object.keys(obj);
    var i;
    var dest = {};
    for (i = 0; i < keys.length; i++) {
        dest[keys[i]] = obj[keys[i]];
    }
    return dest;
}

},{"./base":34,"./errors":36,"util":93}],45:[function(_dereq_,module,exports){
// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

module.exports = Result;

function Result(err, value) {
    this.err = err || null;
    this.value = value;
}

Result.prototype.toValue = function toValue() {
    if (this.err) {
        throw this.err;
    } else {
        return this.value;
    }
};

/* istanbul ignore next */
Result.prototype.toCallback = function toCallback(callback) {
    callback(this.err, this.value);
};

// XXX to be phased out of use in favor of using Result return values.
/* istanbul ignore next */
Result.prototype.toTuple = function toTuple() {
    return [this.err, this.value];
};

},{}],46:[function(_dereq_,module,exports){
// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

module.exports = SeriesRW;

var inherits = _dereq_('util').inherits;

var ReadResult = _dereq_('./base').ReadResult;
var BufferRW = _dereq_('./base').BufferRW;
var errors = _dereq_('./errors');

function SeriesRW(rws) {
    if (!Array.isArray(rws) || arguments.length > 1) {
        rws = Array.prototype.slice.call(arguments);
    }
    if (!(this instanceof SeriesRW)) {
        return new SeriesRW(rws);
    }
    this.rws = rws;
    BufferRW.call(this);
}
inherits(SeriesRW, BufferRW);

SeriesRW.prototype.poolByteLength = function poolByteLength(destResult, values) {
    if (!Array.isArray(values) && values !== null) {
        return destResult.reset(errors.expected(values, 'an array or null'));
    }
    var length = 0;
    for (var i = 0; i < this.rws.length; i++) {
        this.rws[i].poolByteLength(destResult, values && values[i]);
        if (destResult.err) return destResult;
        length += destResult.length;
    }
    return destResult.reset(null, length);
};

SeriesRW.prototype.poolWriteInto = function poolWriteInto(destResult, values, buffer, offset) {
    if (!Array.isArray(values) && values !== null) {
        return destResult.reset(errors.expected(values, 'an array or null'), offset);
    }
    for (var i = 0; i < this.rws.length; i++) {
        this.rws[i].poolWriteInto(destResult, values && values[i], buffer, offset);
        if (destResult.err) return destResult;
        offset = destResult.offset;
    }
    return destResult;
};

var readResult = new ReadResult();
SeriesRW.prototype.poolReadFrom = function poolReadFrom(destResult, buffer, offset) {
    // The prior value cannot be reused, even if it is already an array of the right size.
    // The array may have been captured by reference by the prior consumer.
    var values = new Array(this.rws.length);
    for (var i = 0; i < this.rws.length; i++) {
        this.rws[i].poolReadFrom(readResult, buffer, offset);
        if (readResult.err) return destResult.copyFrom(readResult);
        offset = readResult.offset;
        values[i] = readResult.value;
    }
    // The values must be assigned to the result last so reading a series is reentrant.
    destResult.value = values;
    return destResult.reset(null, offset, destResult.value);
};

},{"./base":34,"./errors":36,"util":93}],47:[function(_dereq_,module,exports){
// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

module.exports = SkipRW;

var inherits = _dereq_('util').inherits;

var ReadResult = _dereq_('./base').ReadResult;
var FixedWidthRW = _dereq_('./fixed_width_rw');

function SkipRW(length, fill) {
    if (!(this instanceof SkipRW)) {
        return new SkipRW(length, fill);
    }
    this.fill = fill || 0;
    FixedWidthRW.call(this, length);
}
inherits(SkipRW, FixedWidthRW);

SkipRW.prototype.poolByteLength = function poolByteLength(destResult) {
    return destResult.reset(null, this.length);
};

SkipRW.prototype.poolWriteInto = function poolWriteInto(destResult, val, buffer, offset) {
    var end = offset + this.length;
    buffer.fill(this.fill, offset, end);
    return destResult.reset(null, end);
};

SkipRW.prototype.poolReadFrom = function poolReadFrom(destResult, buffer, offset) {
    var end = offset + this.length;
    if (end > buffer.length) {
        return ReadResult.poolShortError(destResult, this.length, buffer.length - offset, offset);
    } else {
        return destResult.reset(null, end, null);
    }
};

},{"./base":34,"./fixed_width_rw":37,"util":93}],48:[function(_dereq_,module,exports){
(function (Buffer){
// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
'use strict';

module.exports = StringRW;

var inherits = _dereq_('util').inherits;

var ReadResult = _dereq_('./base').ReadResult;
var errors = _dereq_('./errors');
var BufferRW = _dereq_('./base').BufferRW;

function StringRW(sizerw, encoding) {
    if (!(this instanceof StringRW)) {
        return new StringRW(sizerw, encoding);
    }
    this.sizerw = sizerw;
    this.encoding = encoding || 'utf8';
    if (!this.sizerw.width) {
        this.poolWriteInto = this.poolWriteVariableWidthInto;
    } else {
        this.poolWriteInto = this.poolWriteFixedWidthInto;
    }

    BufferRW.call(this);
}
inherits(StringRW, BufferRW);

StringRW.prototype.poolByteLength = function poolByteLength(destResult, str) {
    var length = 0;
    if (typeof str === 'string') {
        length = Buffer.byteLength(str, this.encoding);
    } else if (str !== null && str !== undefined) {
        return destResult.reset(errors.expected(str, 'string, null, or undefined'), null);
    }
    this.sizerw.poolByteLength(destResult, length);
    if (destResult.err) return destResult;
    return destResult.reset(null, destResult.length + length);
};

StringRW.prototype.poolWriteFixedWidthInto = 
function poolWriteFixedWidthInto(destResult, str, buffer, offset) {
    var start = offset + this.sizerw.width;
    var length = 0;
    if (typeof str === 'string') {
        length = buffer.write(str, start, this.encoding);
    } else if (str !== null && str !== undefined) {
        return destResult.reset(errors.expected(str, 'string, null, or undefined'), offset);
    }
    this.sizerw.poolWriteInto(destResult, length, buffer, offset);
    // istanbul ignore if
    if (destResult.err) return destResult;
    return destResult.reset(null, start + length);
};

StringRW.prototype.poolWriteVariableWidthInto = 
function poolWriteVariableWidthInto(destResult, str, buffer, offset) {
    var size = 0;
    if (typeof str === 'string') {
        size = Buffer.byteLength(str, this.encoding);
    } else if (str !== null && str !== undefined) {
        return destResult.reset(errors.expected(str, 'string, null, or undefined'), offset);
    }
    var res = this.sizerw.poolWriteInto(destResult, size, buffer, offset);
    if (res.err) return res;
    offset = res.offset;
    if (typeof str === 'string') {
        res.offset += buffer.write(str, offset, this.encoding);
    }
    return res;
};

StringRW.prototype.poolReadFrom = function poolReadFrom(destResult, buffer, offset) {
    var res = this.sizerw.poolReadFrom(destResult, buffer, offset);
    if (res.err) return res;
    var length = res.value;
    var remain = buffer.length - res.offset;
    if (remain < length) {
        return ReadResult.poolShortError(destResult, length, remain, offset, res.offset);
    } else {
        offset = res.offset;
        var end = offset + length;
        var str = buffer.toString(this.encoding, offset, end);
        return destResult.reset(null, end, str);
    }
};

}).call(this,_dereq_("buffer").Buffer)
},{"./base":34,"./errors":36,"buffer":31,"util":93}],49:[function(_dereq_,module,exports){
// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

module.exports = StructRW;

var inherits = _dereq_('util').inherits;

var ReadResult = _dereq_('./base').ReadResult;
var BufferRW = _dereq_('./base').BufferRW;
var errors = _dereq_('./errors');

function StructRW(cons, fields, opts) {
    if (!(this instanceof StructRW)) {
        return new StructRW(cons, fields);
    }
    if (typeof cons === 'object') {
        fields = cons;
        cons = null;
    }
    var i;
    opts = opts || {};
    this.cons = cons || Object;
    this.fields = [];
    // TODO: useful to have a StructRWField prototype?
    if (Array.isArray(fields)) {
        this.fields.push.apply(this.fields, fields);
    } else {
        var fieldNames = Object.keys(fields);
        for (i = 0; i < fieldNames.length; ++i) {
            var field = {};
            field.name = fieldNames[i];
            field.rw = fields[field.name];
            this.fields.push(field);
        }
    }
    this.namedFields = {};
    for (i = 0; i < this.fields.length; ++i) {
        if (this.fields[i].name) {
            this.namedFields[this.fields[i].name] = this.fields[i];
        }
    }
}
inherits(StructRW, BufferRW);

StructRW.prototype.poolByteLength = function poolByteLength(destResult, obj) {
    var length = 0;
    for (var i = 0; i < this.fields.length; i++) {
        var field = this.fields[i];

        if (field.name && !obj.hasOwnProperty(field.name)) {
            return destResult.reset(errors.MissingStructField({
                field: field.name,
                struct: this.cons.name
            }), null);
        }

        var value = field.name && obj && obj[field.name];
        if (field.call) {
            if (field.call.poolByteLength) {
                field.call.poolByteLength(destResult, obj);
            } else if (field.call.byteLength) {
                var res = field.call.byteLength(obj);
                destResult.copyFrom(res);
            } else {
                continue;
            }
        } else {
            field.rw.poolByteLength(destResult, value);
        }
        if (destResult.err) return destResult;
        length += destResult.length;
    }
    return destResult.reset(null, length);
};

StructRW.prototype.poolWriteInto = function poolWriteInto(destResult, obj, buffer, offset) {
    destResult.reset(null, offset);
    for (var i = 0; i < this.fields.length; i++) {
        var field = this.fields[i];

        if (field.name && !obj.hasOwnProperty(field.name)) {
            return destResult.reset(errors.MissingStructField({
                field: field.name,
                struct: this.cons.name
            }), null);
        }

        var value = field.name && obj[field.name];
        if (field.call) {
            if (field.call.poolWriteInto) {
                field.call.poolWriteInto(destResult, obj, buffer, offset);
            } else if (field.call.writeInto) {
                var res = field.call.writeInto(obj, buffer, offset);
                destResult.copyFrom(res);
            } else {
                continue;
            }
        } else {
            field.rw.poolWriteInto(destResult, value, buffer, offset);
        }
        if (destResult.err) return destResult;
        offset = destResult.offset;
    }
    return destResult;
};

var readRes = new ReadResult();
StructRW.prototype.poolReadFrom = function poolReadFrom(destResult, buffer, offset) {
    if (typeof destResult.value === 'object' && destResult.value !== null) {
        if (destResult.value.constructor !== this.cons) {
            destResult.value = new this.cons();
        }
    } else {
        destResult.value = new this.cons();
    }
    for (var i = 0; i < this.fields.length; i++) {
        var field = this.fields[i];
        if (field.call) {
            if (field.call.poolReadFrom) {
                field.call.poolReadFrom(readRes, destResult.value, buffer, offset);
            } else if (field.call.readFrom) {
                var res = field.call.readFrom(destResult.value, buffer, offset);
                readRes.copyFrom(res);
            } else {
                continue;
            }
        } else {
            field.rw.poolReadFrom(readRes, buffer, offset);
        }
        if (readRes.err) return destResult.copyFrom(readRes);
        offset = readRes.offset;
        if (field.name) {
            destResult.value[field.name] = readRes.value;
        }
    }
    return destResult.reset(null, offset, destResult.value);
};

},{"./base":34,"./errors":36,"util":93}],50:[function(_dereq_,module,exports){
// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

module.exports = SwitchRW;

var inherits = _dereq_('util').inherits;

var BufferRW = _dereq_('./base').BufferRW;
var errors = _dereq_('./errors');

// TODO: cases should be an es6 map

function SwitchRW(valrw, cases, opts) {
    if (!(this instanceof SwitchRW)) {
        return new SwitchRW(valrw, cases, opts);
    }
    opts = opts || {};
    this.valrw = valrw;
    this.cases = cases;
    this.cons = opts.cons || Pair;
    this.valKey = opts.valKey || '0';
    this.dataKey = opts.dataKey || '1';
    // istanbul ignore if TODO
    if (opts.structMode) {
        this.poolReadFrom = this.structReadFrom;
    }

    BufferRW.call(this);
}
inherits(SwitchRW, BufferRW);

SwitchRW.prototype.poolByteLength = function poolByteLength(destResult, obj) {
    var val = obj[this.valKey];
    var data = obj[this.dataKey];
    var datarw = this.cases[val];
    if (datarw === undefined) {
        return destResult.reset(errors.WriteInvalidSwitchValue({
            value: val
        }));
    }
    this.valrw.poolByteLength(destResult, val);
    if (destResult.err) return destResult;
    var vallen = destResult.length;

    datarw.poolByteLength(destResult, data);
    if (destResult.err) return destResult;
    var caselen = destResult.length;

    return destResult.reset(null, caselen + vallen);
};

SwitchRW.prototype.poolWriteInto = function poolWriteInto(destResult, obj, buffer, offset) {
    var val = obj[this.valKey];
    var data = obj[this.dataKey];
    var datarw = this.cases[val];
    if (datarw === undefined) {
        return destResult.reset(errors.WriteInvalidSwitchValue({
            value: val
        }), offset);
    }
    var res = this.valrw.poolWriteInto(destResult, val, buffer, offset);
    if (res.err) return res;
    res = datarw.poolWriteInto(destResult, data, buffer, res.offset);
    return res;
};

SwitchRW.prototype.poolReadFrom = function poolReadFrom(destResult, buffer, offset) {
    var res = this.valrw.poolReadFrom(destResult, buffer, offset);
    if (res.err) return res;
    offset = res.offset;
    var val = res.value;
    var datarw = this.cases[val];
    if (datarw === undefined) {
        return destResult.reset(errors.ReadInvalidSwitchValue({
            value: val
        }), offset);
    }
    res = datarw.poolReadFrom(destResult, buffer, offset);
    if (res.err) return res;
    offset = res.offset;
    var data = res.value;
    var obj = new this.cons(val, data);
    return destResult.reset(null, offset, obj);
};

// istanbul ignore next TODO
SwitchRW.prototype.poolStructReadFrom = 
function poolStructReadFrom(destResult, obj, buffer, offset) {
    var res = this.valrw.poolReadFrom(destResult, buffer, offset);
    if (res.err) return res;
    offset = res.offset;
    var val = res.value;
    var datarw = this.cases[val];
    if (datarw === undefined) {
        return destResult.reset(errors.ReadInvalidSwitchValue({
            value: val
        }), offset);
    }
    obj[this.valKey] = val;
    res = datarw.poolReadFrom(destResult, buffer, offset);
    if (!res.err) {
        obj[this.dataKey] = res.value;
    }
    return res;
};

function Pair(a, b) {
    Array.call(this);
    this[0] = a;
    this[1] = b;
}
inherits(Pair, Array);

SwitchRW.Pair = Pair;

},{"./base":34,"./errors":36,"util":93}],51:[function(_dereq_,module,exports){
(function (Buffer){
// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

module.exports = VariableBufferRW;

var inherits = _dereq_('util').inherits;

var ReadResult = _dereq_('./base').ReadResult;
var BufferRW = _dereq_('./base').BufferRW;
var errors = _dereq_('./errors');

function VariableBufferRW(sizerw, lazy) {
    if (!(this instanceof VariableBufferRW)) {
        return new VariableBufferRW(sizerw, lazy);
    }
    this.sizerw = sizerw;
    if (lazy) {
        this.poolReadFrom = this.lazyPoolReadFrom;
    } else {
        this.poolReadFrom = this.eagerPoolReadFrom;
    }
    BufferRW.call(this);
}
inherits(VariableBufferRW, BufferRW);

VariableBufferRW.prototype.poolByteLength = function poolByteLength(destResult, buf) {
    var length = 0;
    if (Buffer.isBuffer(buf)) {
        length = buf.length;
    } else if (buf === null || buf === undefined) {
        length = 0;
    } else {
        return destResult.reset(errors.expected(buf, 'buffer, null, or undefined'), null);
    }
    this.sizerw.poolByteLength(destResult, length);
    if (destResult.err) return destResult;
    return destResult.reset(null, destResult.length + length);
};

VariableBufferRW.prototype.poolWriteInto = function poolWriteInto(destResult, buf, buffer, offset) {
    var start = offset + this.sizerw.width;
    var length = 0;
    if (Buffer.isBuffer(buf)) {
        length = buf.copy(buffer, start);
    } else if (buf === null || buf === undefined) {
        length = 0;
    } else {
        return destResult.reset(errors.expected(buf, 'buffer, null, or undefined'), offset);
    }
    this.sizerw.poolWriteInto(destResult, length, buffer, offset);
    if (destResult.err) return destResult;
    return destResult.reset(null, start + length);
};

VariableBufferRW.prototype.eagerPoolReadFrom = function eagerPoolReadFrom(destResult, buffer, offset) {
    this.sizerw.poolReadFrom(destResult, buffer, offset);
    if (destResult.err) return destResult;
    var length = destResult.value;
    var remain = buffer.length - destResult.offset;
    if (remain < length) {
        return ReadResult.poolShortError(destResult, length, remain, offset, destResult.offset);
    } else {
        offset = destResult.offset;
        var buf = Buffer(length);
        buffer.copy(buf, 0, offset);
        return destResult.reset(null, offset + length, buf);
    }
};

VariableBufferRW.prototype.lazyPoolReadFrom = function lazyPoolReadFrom(destResult, buffer, offset) {
    this.sizerw.poolReadFrom(destResult, buffer, offset);
    if (destResult.err) return destResult;
    var length = destResult.value;
    var remain = buffer.length - destResult.offset;
    if (remain < length) {
        return ReadResult.poolShortError(destResult, length, remain, offset, destResult.offset);
    } else {
        offset = destResult.offset;
        var end = offset + length;
        var buf = buffer.slice(offset, end);
        return destResult.reset(null, end, buf);
    }
};

}).call(this,_dereq_("buffer").Buffer)
},{"./base":34,"./errors":36,"buffer":31,"util":93}],52:[function(_dereq_,module,exports){
// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var WriteResult = _dereq_('./base').WriteResult;
var ReadResult = _dereq_('./base').ReadResult;
var BufferRW = _dereq_('./base').BufferRW;
var errors = _dereq_('./errors');

// TODO: zigzag support for signed-s

module.exports.unsigned = BufferRW(
    unsignedVarIntByteLength,
    readUnsignedVarIntFrom,
    writeUnsignedVarIntInto,
    true);

function unsignedVarIntByteLength(destResult, n) {
    if (typeof n !== 'number' || n < 0) {
        // TODO: integer check
        return destResult.reset(errors.expected(n, 'unsigned integer'));
    }
    if (n === 0) return destResult.reset(null, 1);

    var needed = Math.ceil(countBits(n) / 7);
    return destResult.reset(null, needed);
}

function writeUnsignedVarIntInto(destResult, n, buffer, offset) {
    if (typeof n !== 'number' || n < 0) {
        // TODO: integer check
        return destResult.reset(errors.expected(n, 'unsigned integer'), null);
    }

    var needed = Math.ceil(countBits(n) / 7);
    var start = offset;
    var end = offset + needed;

    if (end > buffer.length) {
        var remain = buffer.length - offset;
        return WriteResult.poolShortError(destResult, needed, remain, offset);
    }

    offset = end;
    while (offset > start) {
        var b = n & 0x7f;
        n >>= 7;
        if (offset !== end) b |= 0x80;
        buffer.writeUInt8(b, --offset, true);
        if (n <= 0) break;
    }

    return destResult.reset(null, end);
}

function readUnsignedVarIntFrom(destResult, buffer, offset) {
    var start = offset;
    var n = 0;
    while (offset < buffer.length) {
        var b = buffer.readUInt8(offset++, true);
        if (n !== 0) n <<= 7;
        n += b & 0x7f;
        if (!(b & 0x80)) {
            return destResult.reset(null, offset, n);
        }
    }
    var got = offset - start;
    return ReadResult.poolShortError(destResult, got + 1, got, start, offset);
}

function countBits(n) {
    var res = 1;
    while (n >>= 1) res++;
    return res;
}

},{"./base":34,"./errors":36}],53:[function(_dereq_,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

}).call(this,{"isBuffer":_dereq_("../../is-buffer/index.js")})
},{"../../is-buffer/index.js":64}],54:[function(_dereq_,module,exports){
'use strict';

var template = _dereq_('string-template');
var extend = _dereq_('xtend/mutable');
var assert = _dereq_('assert');

var isWordBoundary = /[_.-](\w|$)/g;

module.exports = TypedError;

function TypedError(args) {
    assert(args, 'TypedError: must specify options');
    assert(args.type, 'TypedError: must specify options.type');
    assert(args.message, 'TypedError: must specify options.message');

    assert(!has(args, 'fullType'),
        'TypedError: fullType field is reserved');

    var message = args.message;
    if (args.type && !args.name) {
        var errorName = camelCase(args.type) + 'Error';
        args.name = errorName[0].toUpperCase() + errorName.substr(1);
    }

    extend(createError, args);
    createError._name = args.name;

    return createError;

    function createError(opts) {
        var result = new Error();

        Object.defineProperty(result, 'type', {
            value: result.type,
            enumerable: true,
            writable: true,
            configurable: true
        });

        var options = extend({}, args, opts);
        if (!options.fullType) {
            options.fullType = options.type;
        }

        extend(result, options);
        if (opts && opts.message) {
            result.message = template(opts.message, options);
        } else if (message) {
            result.message = template(message, options);
        }

        return result;
    }
}

function camelCase(str) {
    return str.replace(isWordBoundary, upperCase);
}

function upperCase(_, x) {
    return x.toUpperCase();
}

function has(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

},{"assert":24,"string-template":86,"xtend/mutable":95}],55:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],56:[function(_dereq_,module,exports){
'use strict';

var util = _dereq_('util');
var HexTransform = _dereq_('./hex_transform');

function ChunkedHexTransform(options) {
    if (!(this instanceof ChunkedHexTransform)) {
        return new ChunkedHexTransform(options);
    }
    // istanbul ignore next
    if (!options) options = {};
    HexTransform.call(this, options);
    var self = this;
    if (typeof options.header === 'function') {
        self.header = options.header;
    } else if (typeof options.header === 'object') {
        self.header = simpleHeader(options.header);
    } else if (typeof options.header === 'string') {
        self.header = simpleHeader({
            label: options.header
        });
    } else {
        self.header = simpleHeader();
    }
    self.chunkNum = 0;
}
util.inherits(ChunkedHexTransform, HexTransform);

ChunkedHexTransform.prototype._transform = function transform(chunk, encoding, done) {
    var self = this;
    // istanbul ignore next
    if (self.totalOffset) {
        self.reset();
    }

    ++self.chunkNum;
    var header = self.header(self.chunkNum, chunk);
    if (header.length) {
        self.push(header);
    }

    HexTransform.prototype._transform.call(self, chunk, encoding, function subDone(err) {
        self.reset();
        done(err);
    });
};

function simpleHeader(opts) {
    opts = opts || {};
    var fmt = '-- ';
    if (opts.label) fmt += opts.label + ' ';
    fmt += 'chunk[%s] length: %s (0x%s)\n';
    return function header(chunkNum, chunk) {
        var len = chunk.length;
        var hexlen = len.toString(16);
        return util.format(fmt, chunkNum, len, hexlen);
    };
}

module.exports = ChunkedHexTransform;

},{"./hex_transform":58,"util":93}],57:[function(_dereq_,module,exports){
var util = _dereq_('util');
var Transform = _dereq_('stream').Transform;
var ChunkedHexTransform = _dereq_('./chunked_hex_transform');

module.exports = HexSpy;

function HexSpy(sink, options) {
    if (!(this instanceof HexSpy)) {
        return new HexSpy(sink, options);
    }
    // istanbul ignore next
    if (!options) options = {};
    // istanbul ignore else
    if (options.highWaterMark === undefined) {
        options.highWaterMark = 1;
    }
    var self = this;
    Transform.call(self, options);
    self.hex = ChunkedHexTransform(options);
    self.hex.pipe(sink);
}
util.inherits(HexSpy, Transform);

HexSpy.prototype._transform = function _transform(chunk, encoding, callback) {
    var self = this;
    self.hex.write(chunk, encoding, function writeDone() {
        self.push(chunk);
        callback();
    });
};

HexSpy.prototype._flush = function _flush(callback) {
    var self = this;
    self.hex.end(null, null, callback);
};

},{"./chunked_hex_transform":56,"stream":85,"util":93}],58:[function(_dereq_,module,exports){
"use strict";

var extend = _dereq_('xtend');
var util = _dereq_('util');
var Transform = _dereq_('stream').Transform;
var render = _dereq_('./render');

function HexTransform(options) {
    if (!(this instanceof HexTransform)) {
        return new HexTransform(options);
    }
    // istanbul ignore next
    if (!options) options = {};
    if (options.colored) options = extend(render.coloredOptions, options);
    Transform.call(this, options);
    var self = this;
    self.options = options;
    self.prefix = self.options.prefix || '';
    self.cols = self.options.cols || 16;
    self.group = self.options.group || 2;
    self.gutter = self.options.gutter || 0;
    // istanbul ignore if
    self.annotateLine = options.annotateLine || null;
    self.decorateHexen = self.options.decorateHexen || noopDecorate;
    self.decorateHuman = self.options.decorateHuman || noopDecorate;
    self.renderHexen = self.options.renderHexen || render.byte2hex;
    self.renderHuman = self.options.renderHuman || render.byte2char;
    // istanbul ignore next
    self.groupSeparator = self.options.groupSeparator === undefined ? ' ' : self.options.groupSeparator;
    self.headSep = self.options.headSep === undefined ? ': ' : self.options.headSep;
    // istanbul ignore next
    self.divide = self.options.divide === undefined ? '  ' : self.options.divide;
    // istanbul ignore next
    self.emptyHexen = self.options.emptyHexen === undefined ? '  ' : self.options.emptyHexen;
    self.emptyHuman = self.options.emptyHuman || '';
    self.nullHuman = self.options.nullHuman || '';
    self.offsetWidth = self.options.offsetWidth || 8;
    self.gutter = Math.max(self.offsetWidth, self.gutter);
    self.line = '';
    self.hexen = '';
    self.human = '';
    self.reset();
}
util.inherits(HexTransform, Transform);

HexTransform.prototype.reset = function reset() {
    var self = this;
    self._finishLine();
    self.screenOffset = 0;
    self.totalOffset = 0;
};

HexTransform.prototype._transform = function transform(chunk, encoding, done) {
    var self = this;
    for (var offset=0; offset<chunk.length; offset++) {
        if (self.screenOffset % self.cols === 0) {
            self._finishLine();
            self._startLine();
        }
        self._addByte(chunk[offset]);
    }
    done(null);
};

HexTransform.prototype._flush = function flush(done) {
    var self = this;
    if (self.totalOffset === 0 && self.nullHuman) {
        self._startLine();
        self.human += self.nullHuman;
    }
    self._finishLine();
    done(null);
};

HexTransform.prototype._startLine = function startLine() {
    var self = this;
    var head = render.pad('0', self.totalOffset.toString(16), self.offsetWidth);
    self.line = self.prefix + render.pad(' ', head, self.gutter) + self.headSep;
};

HexTransform.prototype._finishLine = function finishLine() {
    var self = this;
    if (self.line.length) {
        var rem = self.screenOffset % self.cols;
        if (rem !== 0 || (self.totalOffset === 0 && self.nullHuman)) {
            rem = self.cols - rem;
            for (var i=0; i<rem; i++) {
                self._addEmpty();
            }
        }
        self.line += self.hexen + self.divide + self.human;
        // istanbul ignore if
        if (self.annotateLine) {
            self.line += self.annotateLine(self.totalOffset - self.cols, self.totalOffset);
        }
        self.line += '\n';
        self.push(self.line);
        self.line = '';
        self.hexen = '';
        self.human = '';
    }
};

HexTransform.prototype._addEmpty = function addEmpty() {
    var self = this;
    self._addPart(self.emptyHexen, self.emptyHuman);
};

HexTransform.prototype._addByte = function addByte(b) {
    var self = this;
    var hexen = self.renderHexen(b);
    var human = self.renderHuman(b);
    self._addPart(hexen, human, b);
};

HexTransform.prototype._addPart = function addByte(hexen, human, b) {
    var self = this;
    hexen = self.decorateHexen(self.totalOffset, self.screenOffset, hexen, b);
    human = self.decorateHuman(self.totalOffset, self.screenOffset, human, b);
    var isStartOfRow = self.screenOffset % self.cols === 0;
    var isStartOfGroup = self.screenOffset % self.group === 0;
    if (!isStartOfRow && isStartOfGroup) {
        self.hexen += self.groupSeparator;
    }
    self.hexen += hexen;
    self.human += human;
    self.totalOffset++;
    self.screenOffset++;
};

function noopDecorate(offset, screenOffset, s) {
    return s;
}

module.exports = HexTransform;

},{"./render":60,"stream":85,"util":93,"xtend":94}],59:[function(_dereq_,module,exports){
(function (Buffer){
"use strict";

hex.Transform = _dereq_('./hex_transform');
hex.ChunkedTransform = _dereq_('./chunked_hex_transform');
hex.Spy = _dereq_('./hex_spy');

module.exports = hex;

function hex(buffer, options) {
    if (typeof buffer === 'string') {
        return hex(Buffer(buffer), options);
    }
    if (!Buffer.isBuffer(buffer)) {
        throw new Error('invalid argument to hex, expected a buffer or string');
    }
    options = options || {};
    if (!options.offsetWidth) {
        options.offsetWidth = 2 * Math.ceil(buffer.length.toString(16).length / 2);
    }
    var stream = hex.Transform(options);
    stream.write(buffer);
    stream.end();
    var out = stream.read();
    if (out === null) {
        return '';
    }
    out = String(out);
    out = out.replace(/\n+$/, '');
    return out;
}

}).call(this,_dereq_("buffer").Buffer)
},{"./chunked_hex_transform":56,"./hex_spy":57,"./hex_transform":58,"buffer":31}],60:[function(_dereq_,module,exports){
'use strict';

var color = _dereq_('ansi-color').set;

function pad(c, s, width) {
    while (s.length < width) s = c + s;
    return s;
}

function byte2hex(b) {
    return pad('0', b.toString(16), 2);
}

function byte2char(c) {
    if (c > 0x1f && c < 0x7f) {
        return String.fromCharCode(c);
    } else {
        return '.';
    }
    // TODO: could provide perhaps some unicode renderings for certain control chars
}

function renderColoredHuman(c) {
    if (c > 0x1f && c < 0x7f) {
        return String.fromCharCode(c);
    } else {
        return color('.', 'black+bold');
    }
}

// istanbul ignore next
function stripColor(str) {
    while (true) {
        var i = str.indexOf('\x1b[');
        if (i < 0) return str;
        var j = str.indexOf('m', i);
        if (j < 0) return str;
        str = str.slice(0, i) + str.slice(j + 1);
    }
}

module.exports.coloredHeadSep = color(':', 'cyan') + ' ';

module.exports.coloredOptions = {
    headSep: module.exports.coloredHeadSep,
    renderHuman: renderColoredHuman
};

module.exports.pad = pad;
module.exports.byte2hex = byte2hex;
module.exports.byte2char = byte2char;
module.exports.renderHuman = renderColoredHuman;
module.exports.stripColor = stripColor;

},{"ansi-color":23}],61:[function(_dereq_,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],62:[function(_dereq_,module,exports){
try {
  var util = _dereq_('util');
  /* istanbul ignore next */
  if (typeof util.inherits !== 'function') throw '';
  module.exports = util.inherits;
} catch (e) {
  /* istanbul ignore next */
  module.exports = _dereq_('./inherits_browser.js');
}

},{"./inherits_browser.js":63,"util":93}],63:[function(_dereq_,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}

},{}],64:[function(_dereq_,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],65:[function(_dereq_,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],66:[function(_dereq_,module,exports){
/*
 Copyright 2013 Daniel Wirtz <dcode@dcode.io>
 Copyright 2009 The Closure Library Authors. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS-IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * @license Long.js (c) 2013 Daniel Wirtz <dcode@dcode.io>
 * Released under the Apache License, Version 2.0
 * see: https://github.com/dcodeIO/Long.js for details
 */
(function(global, factory) {

    /* AMD */ if (typeof define === 'function' && define["amd"])
        define([], factory);
    /* CommonJS */ else if (typeof _dereq_ === 'function' && typeof module === "object" && module && module["exports"])
        module["exports"] = factory();
    /* Global */ else
        (global["dcodeIO"] = global["dcodeIO"] || {})["Long"] = factory();

})(this, function() {
    "use strict";

    /**
     * Constructs a 64 bit two's-complement integer, given its low and high 32 bit values as *signed* integers.
     *  See the from* functions below for more convenient ways of constructing Longs.
     * @exports Long
     * @class A Long class for representing a 64 bit two's-complement integer value.
     * @param {number} low The low (signed) 32 bits of the long
     * @param {number} high The high (signed) 32 bits of the long
     * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @constructor
     */
    function Long(low, high, unsigned) {

        /**
         * The low 32 bits as a signed value.
         * @type {number}
         * @expose
         */
        this.low = low|0;

        /**
         * The high 32 bits as a signed value.
         * @type {number}
         * @expose
         */
        this.high = high|0;

        /**
         * Whether unsigned or not.
         * @type {boolean}
         * @expose
         */
        this.unsigned = !!unsigned;
    }

    // The internal representation of a long is the two given signed, 32-bit values.
    // We use 32-bit pieces because these are the size of integers on which
    // Javascript performs bit-operations.  For operations like addition and
    // multiplication, we split each number into 16 bit pieces, which can easily be
    // multiplied within Javascript's floating-point representation without overflow
    // or change in sign.
    //
    // In the algorithms below, we frequently reduce the negative case to the
    // positive case by negating the input(s) and then post-processing the result.
    // Note that we must ALWAYS check specially whether those values are MIN_VALUE
    // (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
    // a positive number, it overflows back into a negative).  Not handling this
    // case would often result in infinite recursion.
    //
    // Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the from*
    // methods on which they depend.

    /**
     * An indicator used to reliably determine if an object is a Long or not.
     * @type {boolean}
     * @const
     * @expose
     * @private
     */
    Long.__isLong__;

    Object.defineProperty(Long.prototype, "__isLong__", {
        value: true,
        enumerable: false,
        configurable: false
    });

    /**
     * Tests if the specified object is a Long.
     * @param {*} obj Object
     * @returns {boolean}
     * @expose
     */
    Long.isLong = function isLong(obj) {
        return (obj && obj["__isLong__"]) === true;
    };

    /**
     * A cache of the Long representations of small integer values.
     * @type {!Object}
     * @inner
     */
    var INT_CACHE = {};

    /**
     * A cache of the Long representations of small unsigned integer values.
     * @type {!Object}
     * @inner
     */
    var UINT_CACHE = {};

    /**
     * Returns a Long representing the given 32 bit integer value.
     * @param {number} value The 32 bit integer in question
     * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @returns {!Long} The corresponding Long value
     * @expose
     */
    Long.fromInt = function fromInt(value, unsigned) {
        var obj, cachedObj;
        if (!unsigned) {
            value = value | 0;
            if (-128 <= value && value < 128) {
                cachedObj = INT_CACHE[value];
                if (cachedObj)
                    return cachedObj;
            }
            obj = new Long(value, value < 0 ? -1 : 0, false);
            if (-128 <= value && value < 128)
                INT_CACHE[value] = obj;
            return obj;
        } else {
            value = value >>> 0;
            if (0 <= value && value < 256) {
                cachedObj = UINT_CACHE[value];
                if (cachedObj)
                    return cachedObj;
            }
            obj = new Long(value, (value | 0) < 0 ? -1 : 0, true);
            if (0 <= value && value < 256)
                UINT_CACHE[value] = obj;
            return obj;
        }
    };

    /**
     * Returns a Long representing the given value, provided that it is a finite number. Otherwise, zero is returned.
     * @param {number} value The number in question
     * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @returns {!Long} The corresponding Long value
     * @expose
     */
    Long.fromNumber = function fromNumber(value, unsigned) {
        unsigned = !!unsigned;
        if (isNaN(value) || !isFinite(value))
            return Long.ZERO;
        if (!unsigned && value <= -TWO_PWR_63_DBL)
            return Long.MIN_VALUE;
        if (!unsigned && value + 1 >= TWO_PWR_63_DBL)
            return Long.MAX_VALUE;
        if (unsigned && value >= TWO_PWR_64_DBL)
            return Long.MAX_UNSIGNED_VALUE;
        if (value < 0)
            return Long.fromNumber(-value, unsigned).negate();
        return new Long((value % TWO_PWR_32_DBL) | 0, (value / TWO_PWR_32_DBL) | 0, unsigned);
    };

    /**
     * Returns a Long representing the 64 bit integer that comes by concatenating the given low and high bits. Each is
     *  assumed to use 32 bits.
     * @param {number} lowBits The low 32 bits
     * @param {number} highBits The high 32 bits
     * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @returns {!Long} The corresponding Long value
     * @expose
     */
    Long.fromBits = function fromBits(lowBits, highBits, unsigned) {
        return new Long(lowBits, highBits, unsigned);
    };

    /**
     * Returns a Long representation of the given string, written using the specified radix.
     * @param {string} str The textual representation of the Long
     * @param {(boolean|number)=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @param {number=} radix The radix in which the text is written (2-36), defaults to 10
     * @returns {!Long} The corresponding Long value
     * @expose
     */
    Long.fromString = function fromString(str, unsigned, radix) {
        if (str.length === 0)
            throw Error('number format error: empty string');
        if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity")
            return Long.ZERO;
        if (typeof unsigned === 'number') // For goog.math.long compatibility
            radix = unsigned,
            unsigned = false;
        radix = radix || 10;
        if (radix < 2 || 36 < radix)
            throw Error('radix out of range: ' + radix);

        var p;
        if ((p = str.indexOf('-')) > 0)
            throw Error('number format error: interior "-" character: ' + str);
        else if (p === 0)
            return Long.fromString(str.substring(1), unsigned, radix).negate();

        // Do several (8) digits each time through the loop, so as to
        // minimize the calls to the very expensive emulated div.
        var radixToPower = Long.fromNumber(Math.pow(radix, 8));

        var result = Long.ZERO;
        for (var i = 0; i < str.length; i += 8) {
            var size = Math.min(8, str.length - i);
            var value = parseInt(str.substring(i, i + size), radix);
            if (size < 8) {
                var power = Long.fromNumber(Math.pow(radix, size));
                result = result.multiply(power).add(Long.fromNumber(value));
            } else {
                result = result.multiply(radixToPower);
                result = result.add(Long.fromNumber(value));
            }
        }
        result.unsigned = unsigned;
        return result;
    };

    /**
     * Converts the specified value to a Long.
     * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val Value
     * @returns {!Long}
     * @expose
     */
    Long.fromValue = function fromValue(val) {
        if (val /* is compatible */ instanceof Long)
            return val;
        if (typeof val === 'number')
            return Long.fromNumber(val);
        if (typeof val === 'string')
            return Long.fromString(val);
        // Throws for non-objects, converts non-instanceof Long:
        return new Long(val.low, val.high, val.unsigned);
    };

    // NOTE: the compiler should inline these constant values below and then remove these variables, so there should be
    // no runtime penalty for these.

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_16_DBL = 1 << 16;

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_24_DBL = 1 << 24;

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;

    /**
     * @type {!Long}
     * @const
     * @inner
     */
    var TWO_PWR_24 = Long.fromInt(TWO_PWR_24_DBL);

    /**
     * Signed zero.
     * @type {!Long}
     * @expose
     */
    Long.ZERO = Long.fromInt(0);

    /**
     * Unsigned zero.
     * @type {!Long}
     * @expose
     */
    Long.UZERO = Long.fromInt(0, true);

    /**
     * Signed one.
     * @type {!Long}
     * @expose
     */
    Long.ONE = Long.fromInt(1);

    /**
     * Unsigned one.
     * @type {!Long}
     * @expose
     */
    Long.UONE = Long.fromInt(1, true);

    /**
     * Signed negative one.
     * @type {!Long}
     * @expose
     */
    Long.NEG_ONE = Long.fromInt(-1);

    /**
     * Maximum signed value.
     * @type {!Long}
     * @expose
     */
    Long.MAX_VALUE = Long.fromBits(0xFFFFFFFF|0, 0x7FFFFFFF|0, false);

    /**
     * Maximum unsigned value.
     * @type {!Long}
     * @expose
     */
    Long.MAX_UNSIGNED_VALUE = Long.fromBits(0xFFFFFFFF|0, 0xFFFFFFFF|0, true);

    /**
     * Minimum signed value.
     * @type {!Long}
     * @expose
     */
    Long.MIN_VALUE = Long.fromBits(0, 0x80000000|0, false);

    /**
     * Converts the Long to a 32 bit integer, assuming it is a 32 bit integer.
     * @returns {number}
     * @expose
     */
    Long.prototype.toInt = function toInt() {
        return this.unsigned ? this.low >>> 0 : this.low;
    };

    /**
     * Converts the Long to a the nearest floating-point representation of this value (double, 53 bit mantissa).
     * @returns {number}
     * @expose
     */
    Long.prototype.toNumber = function toNumber() {
        if (this.unsigned) {
            return ((this.high >>> 0) * TWO_PWR_32_DBL) + (this.low >>> 0);
        }
        return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
    };

    /**
     * Converts the Long to a string written in the specified radix.
     * @param {number=} radix Radix (2-36), defaults to 10
     * @returns {string}
     * @override
     * @throws {RangeError} If `radix` is out of range
     * @expose
     */
    Long.prototype.toString = function toString(radix) {
        radix = radix || 10;
        if (radix < 2 || 36 < radix)
            throw RangeError('radix out of range: ' + radix);
        if (this.isZero())
            return '0';
        var rem;
        if (this.isNegative()) { // Unsigned Longs are never negative
            if (this.equals(Long.MIN_VALUE)) {
                // We need to change the Long value before it can be negated, so we remove
                // the bottom-most digit in this base and then recurse to do the rest.
                var radixLong = Long.fromNumber(radix);
                var div = this.divide(radixLong);
                rem = div.multiply(radixLong).subtract(this);
                return div.toString(radix) + rem.toInt().toString(radix);
            } else
                return '-' + this.negate().toString(radix);
        }

        // Do several (6) digits each time through the loop, so as to
        // minimize the calls to the very expensive emulated div.
        var radixToPower = Long.fromNumber(Math.pow(radix, 6), this.unsigned);
        rem = this;
        var result = '';
        while (true) {
            var remDiv = rem.divide(radixToPower),
                intval = rem.subtract(remDiv.multiply(radixToPower)).toInt() >>> 0,
                digits = intval.toString(radix);
            rem = remDiv;
            if (rem.isZero())
                return digits + result;
            else {
                while (digits.length < 6)
                    digits = '0' + digits;
                result = '' + digits + result;
            }
        }
    };

    /**
     * Gets the high 32 bits as a signed integer.
     * @returns {number} Signed high bits
     * @expose
     */
    Long.prototype.getHighBits = function getHighBits() {
        return this.high;
    };

    /**
     * Gets the high 32 bits as an unsigned integer.
     * @returns {number} Unsigned high bits
     * @expose
     */
    Long.prototype.getHighBitsUnsigned = function getHighBitsUnsigned() {
        return this.high >>> 0;
    };

    /**
     * Gets the low 32 bits as a signed integer.
     * @returns {number} Signed low bits
     * @expose
     */
    Long.prototype.getLowBits = function getLowBits() {
        return this.low;
    };

    /**
     * Gets the low 32 bits as an unsigned integer.
     * @returns {number} Unsigned low bits
     * @expose
     */
    Long.prototype.getLowBitsUnsigned = function getLowBitsUnsigned() {
        return this.low >>> 0;
    };

    /**
     * Gets the number of bits needed to represent the absolute value of this Long.
     * @returns {number}
     * @expose
     */
    Long.prototype.getNumBitsAbs = function getNumBitsAbs() {
        if (this.isNegative()) // Unsigned Longs are never negative
            return this.equals(Long.MIN_VALUE) ? 64 : this.negate().getNumBitsAbs();
        var val = this.high != 0 ? this.high : this.low;
        for (var bit = 31; bit > 0; bit--)
            if ((val & (1 << bit)) != 0)
                break;
        return this.high != 0 ? bit + 33 : bit + 1;
    };

    /**
     * Tests if this Long's value equals zero.
     * @returns {boolean}
     * @expose
     */
    Long.prototype.isZero = function isZero() {
        return this.high === 0 && this.low === 0;
    };

    /**
     * Tests if this Long's value is negative.
     * @returns {boolean}
     * @expose
     */
    Long.prototype.isNegative = function isNegative() {
        return !this.unsigned && this.high < 0;
    };

    /**
     * Tests if this Long's value is positive.
     * @returns {boolean}
     * @expose
     */
    Long.prototype.isPositive = function isPositive() {
        return this.unsigned || this.high >= 0;
    };

    /**
     * Tests if this Long's value is odd.
     * @returns {boolean}
     * @expose
     */
    Long.prototype.isOdd = function isOdd() {
        return (this.low & 1) === 1;
    };

    /**
     * Tests if this Long's value is even.
     * @returns {boolean}
     * @expose
     */
    Long.prototype.isEven = function isEven() {
        return (this.low & 1) === 0;
    };

    /**
     * Tests if this Long's value equals the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    Long.prototype.equals = function equals(other) {
        if (!Long.isLong(other))
            other = Long.fromValue(other);
        if (this.unsigned !== other.unsigned && (this.high >>> 31) === 1 && (other.high >>> 31) === 1)
            return false;
        return this.high === other.high && this.low === other.low;
    };

    /**
     * Tests if this Long's value equals the specified's. This is an alias of {@link Long#equals}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    Long.eq = Long.prototype.equals;

    /**
     * Tests if this Long's value differs from the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    Long.prototype.notEquals = function notEquals(other) {
        return !this.equals(/* validates */ other);
    };

    /**
     * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    Long.neq = Long.prototype.notEquals;

    /**
     * Tests if this Long's value is less than the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    Long.prototype.lessThan = function lessThan(other) {
        return this.compare(/* validates */ other) < 0;
    };

    /**
     * Tests if this Long's value is less than the specified's. This is an alias of {@link Long#lessThan}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    Long.prototype.lt = Long.prototype.lessThan;

    /**
     * Tests if this Long's value is less than or equal the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    Long.prototype.lessThanOrEqual = function lessThanOrEqual(other) {
        return this.compare(/* validates */ other) <= 0;
    };

    /**
     * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    Long.prototype.lte = Long.prototype.lessThanOrEqual;

    /**
     * Tests if this Long's value is greater than the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    Long.prototype.greaterThan = function greaterThan(other) {
        return this.compare(/* validates */ other) > 0;
    };

    /**
     * Tests if this Long's value is greater than the specified's. This is an alias of {@link Long#greaterThan}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    Long.prototype.gt = Long.prototype.greaterThan;

    /**
     * Tests if this Long's value is greater than or equal the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    Long.prototype.greaterThanOrEqual = function greaterThanOrEqual(other) {
        return this.compare(/* validates */ other) >= 0;
    };

    /**
     * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     * @expose
     */
    Long.prototype.gte = Long.prototype.greaterThanOrEqual;

    /**
     * Compares this Long's value with the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {number} 0 if they are the same, 1 if the this is greater and -1
     *  if the given one is greater
     * @expose
     */
    Long.prototype.compare = function compare(other) {
        if (!Long.isLong(other))
            other = Long.fromValue(other);
        if (this.equals(other))
            return 0;
        var thisNeg = this.isNegative(),
            otherNeg = other.isNegative();
        if (thisNeg && !otherNeg)
            return -1;
        if (!thisNeg && otherNeg)
            return 1;
        // At this point the sign bits are the same
        if (!this.unsigned)
            return this.subtract(other).isNegative() ? -1 : 1;
        // Both are positive if at least one is unsigned
        return (other.high >>> 0) > (this.high >>> 0) || (other.high === this.high && (other.low >>> 0) > (this.low >>> 0)) ? -1 : 1;
    };

    /**
     * Negates this Long's value.
     * @returns {!Long} Negated Long
     * @expose
     */
    Long.prototype.negate = function negate() {
        if (!this.unsigned && this.equals(Long.MIN_VALUE))
            return Long.MIN_VALUE;
        return this.not().add(Long.ONE);
    };

    /**
     * Negates this Long's value. This is an alias of {@link Long#negate}.
     * @function
     * @returns {!Long} Negated Long
     * @expose
     */
    Long.prototype.neg = Long.prototype.negate;

    /**
     * Returns the sum of this and the specified Long.
     * @param {!Long|number|string} addend Addend
     * @returns {!Long} Sum
     * @expose
     */
    Long.prototype.add = function add(addend) {
        if (!Long.isLong(addend))
            addend = Long.fromValue(addend);

        // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

        var a48 = this.high >>> 16;
        var a32 = this.high & 0xFFFF;
        var a16 = this.low >>> 16;
        var a00 = this.low & 0xFFFF;

        var b48 = addend.high >>> 16;
        var b32 = addend.high & 0xFFFF;
        var b16 = addend.low >>> 16;
        var b00 = addend.low & 0xFFFF;

        var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 + b00;
        c16 += c00 >>> 16;
        c00 &= 0xFFFF;
        c16 += a16 + b16;
        c32 += c16 >>> 16;
        c16 &= 0xFFFF;
        c32 += a32 + b32;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c48 += a48 + b48;
        c48 &= 0xFFFF;
        return Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
    };

    /**
     * Returns the difference of this and the specified Long.
     * @param {!Long|number|string} subtrahend Subtrahend
     * @returns {!Long} Difference
     * @expose
     */
    Long.prototype.subtract = function subtract(subtrahend) {
        if (!Long.isLong(subtrahend))
            subtrahend = Long.fromValue(subtrahend);
        return this.add(subtrahend.negate());
    };

    /**
     * Returns the difference of this and the specified Long. This is an alias of {@link Long#subtract}.
     * @function
     * @param {!Long|number|string} subtrahend Subtrahend
     * @returns {!Long} Difference
     * @expose
     */
    Long.prototype.sub = Long.prototype.subtract;

    /**
     * Returns the product of this and the specified Long.
     * @param {!Long|number|string} multiplier Multiplier
     * @returns {!Long} Product
     * @expose
     */
    Long.prototype.multiply = function multiply(multiplier) {
        if (this.isZero())
            return Long.ZERO;
        if (!Long.isLong(multiplier))
            multiplier = Long.fromValue(multiplier);
        if (multiplier.isZero())
            return Long.ZERO;
        if (this.equals(Long.MIN_VALUE))
            return multiplier.isOdd() ? Long.MIN_VALUE : Long.ZERO;
        if (multiplier.equals(Long.MIN_VALUE))
            return this.isOdd() ? Long.MIN_VALUE : Long.ZERO;

        if (this.isNegative()) {
            if (multiplier.isNegative())
                return this.negate().multiply(multiplier.negate());
            else
                return this.negate().multiply(multiplier).negate();
        } else if (multiplier.isNegative())
            return this.multiply(multiplier.negate()).negate();

        // If both longs are small, use float multiplication
        if (this.lessThan(TWO_PWR_24) && multiplier.lessThan(TWO_PWR_24))
            return Long.fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned);

        // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
        // We can skip products that would overflow.

        var a48 = this.high >>> 16;
        var a32 = this.high & 0xFFFF;
        var a16 = this.low >>> 16;
        var a00 = this.low & 0xFFFF;

        var b48 = multiplier.high >>> 16;
        var b32 = multiplier.high & 0xFFFF;
        var b16 = multiplier.low >>> 16;
        var b00 = multiplier.low & 0xFFFF;

        var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 * b00;
        c16 += c00 >>> 16;
        c00 &= 0xFFFF;
        c16 += a16 * b00;
        c32 += c16 >>> 16;
        c16 &= 0xFFFF;
        c16 += a00 * b16;
        c32 += c16 >>> 16;
        c16 &= 0xFFFF;
        c32 += a32 * b00;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c32 += a16 * b16;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c32 += a00 * b32;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
        c48 &= 0xFFFF;
        return Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
    };

    /**
     * Returns the product of this and the specified Long. This is an alias of {@link Long#multiply}.
     * @function
     * @param {!Long|number|string} multiplier Multiplier
     * @returns {!Long} Product
     * @expose
     */
    Long.prototype.mul = Long.prototype.multiply;

    /**
     * Returns this Long divided by the specified.
     * @param {!Long|number|string} divisor Divisor
     * @returns {!Long} Quotient
     * @expose
     */
    Long.prototype.divide = function divide(divisor) {
        if (!Long.isLong(divisor))
            divisor = Long.fromValue(divisor);
        if (divisor.isZero())
            throw(new Error('division by zero'));
        if (this.isZero())
            return this.unsigned ? Long.UZERO : Long.ZERO;
        var approx, rem, res;
        if (this.equals(Long.MIN_VALUE)) {
            if (divisor.equals(Long.ONE) || divisor.equals(Long.NEG_ONE))
                return Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
            else if (divisor.equals(Long.MIN_VALUE))
                return Long.ONE;
            else {
                // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
                var halfThis = this.shiftRight(1);
                approx = halfThis.divide(divisor).shiftLeft(1);
                if (approx.equals(Long.ZERO)) {
                    return divisor.isNegative() ? Long.ONE : Long.NEG_ONE;
                } else {
                    rem = this.subtract(divisor.multiply(approx));
                    res = approx.add(rem.divide(divisor));
                    return res;
                }
            }
        } else if (divisor.equals(Long.MIN_VALUE))
            return this.unsigned ? Long.UZERO : Long.ZERO;
        if (this.isNegative()) {
            if (divisor.isNegative())
                return this.negate().divide(divisor.negate());
            return this.negate().divide(divisor).negate();
        } else if (divisor.isNegative())
            return this.divide(divisor.negate()).negate();

        // Repeat the following until the remainder is less than other:  find a
        // floating-point that approximates remainder / other *from below*, add this
        // into the result, and subtract it from the remainder.  It is critical that
        // the approximate value is less than or equal to the real value so that the
        // remainder never becomes negative.
        res = Long.ZERO;
        rem = this;
        while (rem.greaterThanOrEqual(divisor)) {
            // Approximate the result of division. This may be a little greater or
            // smaller than the actual value.
            approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));

            // We will tweak the approximate result by changing it in the 48-th digit or
            // the smallest non-fractional digit, whichever is larger.
            var log2 = Math.ceil(Math.log(approx) / Math.LN2),
                delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48),

            // Decrease the approximation until it is smaller than the remainder.  Note
            // that if it is too large, the product overflows and is negative.
                approxRes = Long.fromNumber(approx),
                approxRem = approxRes.multiply(divisor);
            while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
                approx -= delta;
                approxRes = Long.fromNumber(approx, this.unsigned);
                approxRem = approxRes.multiply(divisor);
            }

            // We know the answer can't be zero... and actually, zero would cause
            // infinite recursion since we would make no progress.
            if (approxRes.isZero())
                approxRes = Long.ONE;

            res = res.add(approxRes);
            rem = rem.subtract(approxRem);
        }
        return res;
    };

    /**
     * Returns this Long divided by the specified. This is an alias of {@link Long#divide}.
     * @function
     * @param {!Long|number|string} divisor Divisor
     * @returns {!Long} Quotient
     * @expose
     */
    Long.prototype.div = Long.prototype.divide;

    /**
     * Returns this Long modulo the specified.
     * @param {!Long|number|string} divisor Divisor
     * @returns {!Long} Remainder
     * @expose
     */
    Long.prototype.modulo = function modulo(divisor) {
        if (!Long.isLong(divisor))
            divisor = Long.fromValue(divisor);
        return this.subtract(this.divide(divisor).multiply(divisor));
    };

    /**
     * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
     * @function
     * @param {!Long|number|string} divisor Divisor
     * @returns {!Long} Remainder
     * @expose
     */
    Long.prototype.mod = Long.prototype.modulo;

    /**
     * Returns the bitwise NOT of this Long.
     * @returns {!Long}
     * @expose
     */
    Long.prototype.not = function not() {
        return Long.fromBits(~this.low, ~this.high, this.unsigned);
    };

    /**
     * Returns the bitwise AND of this Long and the specified.
     * @param {!Long|number|string} other Other Long
     * @returns {!Long}
     * @expose
     */
    Long.prototype.and = function and(other) {
        if (!Long.isLong(other))
            other = Long.fromValue(other);
        return Long.fromBits(this.low & other.low, this.high & other.high, this.unsigned);
    };

    /**
     * Returns the bitwise OR of this Long and the specified.
     * @param {!Long|number|string} other Other Long
     * @returns {!Long}
     * @expose
     */
    Long.prototype.or = function or(other) {
        if (!Long.isLong(other))
            other = Long.fromValue(other);
        return Long.fromBits(this.low | other.low, this.high | other.high, this.unsigned);
    };

    /**
     * Returns the bitwise XOR of this Long and the given one.
     * @param {!Long|number|string} other Other Long
     * @returns {!Long}
     * @expose
     */
    Long.prototype.xor = function xor(other) {
        if (!Long.isLong(other))
            other = Long.fromValue(other);
        return Long.fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
    };

    /**
     * Returns this Long with bits shifted to the left by the given amount.
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     * @expose
     */
    Long.prototype.shiftLeft = function shiftLeft(numBits) {
        if (Long.isLong(numBits))
            numBits = numBits.toInt();
        if ((numBits &= 63) === 0)
            return this;
        else if (numBits < 32)
            return Long.fromBits(this.low << numBits, (this.high << numBits) | (this.low >>> (32 - numBits)), this.unsigned);
        else
            return Long.fromBits(0, this.low << (numBits - 32), this.unsigned);
    };

    /**
     * Returns this Long with bits shifted to the left by the given amount. This is an alias of {@link Long#shiftLeft}.
     * @function
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     * @expose
     */
    Long.prototype.shl = Long.prototype.shiftLeft;

    /**
     * Returns this Long with bits arithmetically shifted to the right by the given amount.
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     * @expose
     */
    Long.prototype.shiftRight = function shiftRight(numBits) {
        if (Long.isLong(numBits))
            numBits = numBits.toInt();
        if ((numBits &= 63) === 0)
            return this;
        else if (numBits < 32)
            return Long.fromBits((this.low >>> numBits) | (this.high << (32 - numBits)), this.high >> numBits, this.unsigned);
        else
            return Long.fromBits(this.high >> (numBits - 32), this.high >= 0 ? 0 : -1, this.unsigned);
    };

    /**
     * Returns this Long with bits arithmetically shifted to the right by the given amount. This is an alias of {@link Long#shiftRight}.
     * @function
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     * @expose
     */
    Long.prototype.shr = Long.prototype.shiftRight;

    /**
     * Returns this Long with bits logically shifted to the right by the given amount.
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     * @expose
     */
    Long.prototype.shiftRightUnsigned = function shiftRightUnsigned(numBits) {
        if (Long.isLong(numBits))
            numBits = numBits.toInt();
        numBits &= 63;
        if (numBits === 0)
            return this;
        else {
            var high = this.high;
            if (numBits < 32) {
                var low = this.low;
                return Long.fromBits((low >>> numBits) | (high << (32 - numBits)), high >>> numBits, this.unsigned);
            } else if (numBits === 32)
                return Long.fromBits(high, 0, this.unsigned);
            else
                return Long.fromBits(high >>> (numBits - 32), 0, this.unsigned);
        }
    };

    /**
     * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
     * @function
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     * @expose
     */
    Long.prototype.shru = Long.prototype.shiftRightUnsigned;

    /**
     * Converts this Long to signed.
     * @returns {!Long} Signed long
     * @expose
     */
    Long.prototype.toSigned = function toSigned() {
        if (!this.unsigned)
            return this;
        return new Long(this.low, this.high, false);
    };

    /**
     * Converts this Long to unsigned.
     * @returns {!Long} Unsigned long
     * @expose
     */
    Long.prototype.toUnsigned = function toUnsigned() {
        if (this.unsigned)
            return this;
        return new Long(this.low, this.high, true);
    };

    return Long;
});

},{}],67:[function(_dereq_,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],68:[function(_dereq_,module,exports){
(function (process){
// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
exports.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

exports.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,_dereq_('_process'))
},{"_process":30}],69:[function(_dereq_,module,exports){
(function (process){
'use strict';

if (typeof process === 'undefined' ||
    !process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = { nextTick: nextTick };
} else {
  module.exports = process
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}


}).call(this,_dereq_('_process'))
},{"_process":30}],70:[function(_dereq_,module,exports){
module.exports = _dereq_('./readable').Duplex

},{"./readable":82}],71:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var pna = _dereq_('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var util = Object.create(_dereq_('core-util-is'));
util.inherits = _dereq_('inherits');
/*</replacement>*/

var Readable = _dereq_('./_stream_readable');
var Writable = _dereq_('./_stream_writable');

util.inherits(Duplex, Readable);

{
  // avoid scope creep, the keys array can then be collected
  var keys = objectKeys(Writable.prototype);
  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._writableState.highWaterMark;
  }
});

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  pna.nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

Duplex.prototype._destroy = function (err, cb) {
  this.push(null);
  this.end();

  pna.nextTick(cb, err);
};
},{"./_stream_readable":73,"./_stream_writable":75,"core-util-is":53,"inherits":62,"process-nextick-args":69}],72:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = _dereq_('./_stream_transform');

/*<replacement>*/
var util = Object.create(_dereq_('core-util-is'));
util.inherits = _dereq_('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":74,"core-util-is":53,"inherits":62}],73:[function(_dereq_,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var pna = _dereq_('process-nextick-args');
/*</replacement>*/

module.exports = Readable;

/*<replacement>*/
var isArray = _dereq_('isarray');
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = _dereq_('events').EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = _dereq_('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/

var Buffer = _dereq_('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

/*<replacement>*/
var util = Object.create(_dereq_('core-util-is'));
util.inherits = _dereq_('inherits');
/*</replacement>*/

/*<replacement>*/
var debugUtil = _dereq_('util');
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = _dereq_('./internal/streams/BufferList');
var destroyImpl = _dereq_('./internal/streams/destroy');
var StringDecoder;

util.inherits(Readable, Stream);

var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

  // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.
  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}

function ReadableState(options, stream) {
  Duplex = Duplex || _dereq_('./_stream_duplex');

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var readableHwm = options.readableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = _dereq_('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || _dereq_('./_stream_duplex');

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});

Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  this.push(null);
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      stream.emit('error', er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        stream.emit('error', new Error('stream.push() after EOF'));
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
    }
  }

  return needMoreData(state);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    stream.emit('data', chunk);
    stream.read(0);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = _dereq_('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) pna.nextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    pna.nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) pna.nextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = { hasUnpiped: false };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, unpipeInfo);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this, unpipeInfo);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        pna.nextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    pna.nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var _this = this;

  var state = this._readableState;
  var paused = false;

  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }

    _this.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = _this.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  this._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return this;
};

Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._readableState.highWaterMark;
  }
});

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = Buffer.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    pna.nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
}).call(this,_dereq_('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./_stream_duplex":71,"./internal/streams/BufferList":76,"./internal/streams/destroy":77,"./internal/streams/stream":78,"_process":30,"core-util-is":53,"events":55,"inherits":62,"isarray":65,"process-nextick-args":69,"safe-buffer":79,"string_decoder/":80,"util":93}],74:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = _dereq_('./_stream_duplex');

/*<replacement>*/
var util = Object.create(_dereq_('core-util-is'));
util.inherits = _dereq_('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);

function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) {
    return this.emit('error', new Error('write callback called multiple times'));
  }

  ts.writechunk = null;
  ts.writecb = null;

  if (data != null) // single equals check for both `null` and `undefined`
    this.push(data);

  cb(er);

  var rs = this._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  };

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.on('prefinish', prefinish);
}

function prefinish() {
  var _this = this;

  if (typeof this._flush === 'function') {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  var _this2 = this;

  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
    _this2.emit('close');
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data != null) // single equals check for both `null` and `undefined`
    stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  if (stream._writableState.length) throw new Error('Calling transform done when ws.length != 0');

  if (stream._transformState.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}
},{"./_stream_duplex":71,"core-util-is":53,"inherits":62}],75:[function(_dereq_,module,exports){
(function (process,global,setImmediate){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

/*<replacement>*/

var pna = _dereq_('process-nextick-args');
/*</replacement>*/

module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = Object.create(_dereq_('core-util-is'));
util.inherits = _dereq_('inherits');
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: _dereq_('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream = _dereq_('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/

var Buffer = _dereq_('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

var destroyImpl = _dereq_('./internal/streams/destroy');

util.inherits(Writable, Stream);

function nop() {}

function WritableState(options, stream) {
  Duplex = Duplex || _dereq_('./_stream_duplex');

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var writableHwm = options.writableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || _dereq_('./_stream_duplex');

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;

    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  pna.nextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    pna.nextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = !state.objectMode && _isUint8Array(chunk);

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}

Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._writableState.highWaterMark;
  }
});

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    pna.nextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    pna.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      stream.emit('error', err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function') {
      state.pendingcb++;
      state.finalCalled = true;
      pna.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) pna.nextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }
  if (state.corkedRequestsFree) {
    state.corkedRequestsFree.next = corkReq;
  } else {
    state.corkedRequestsFree = corkReq;
  }
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  get: function () {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});

Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  this.end();
  cb(err);
};
}).call(this,_dereq_('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},_dereq_("timers").setImmediate)
},{"./_stream_duplex":71,"./internal/streams/destroy":77,"./internal/streams/stream":78,"_process":30,"core-util-is":53,"inherits":62,"process-nextick-args":69,"safe-buffer":79,"timers":87,"util-deprecate":89}],76:[function(_dereq_,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Buffer = _dereq_('safe-buffer').Buffer;
var util = _dereq_('util');

function copyBuffer(src, target, offset) {
  src.copy(target, offset);
}

module.exports = function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  BufferList.prototype.push = function push(v) {
    var entry = { data: v, next: null };
    if (this.length > 0) this.tail.next = entry;else this.head = entry;
    this.tail = entry;
    ++this.length;
  };

  BufferList.prototype.unshift = function unshift(v) {
    var entry = { data: v, next: this.head };
    if (this.length === 0) this.tail = entry;
    this.head = entry;
    ++this.length;
  };

  BufferList.prototype.shift = function shift() {
    if (this.length === 0) return;
    var ret = this.head.data;
    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
    --this.length;
    return ret;
  };

  BufferList.prototype.clear = function clear() {
    this.head = this.tail = null;
    this.length = 0;
  };

  BufferList.prototype.join = function join(s) {
    if (this.length === 0) return '';
    var p = this.head;
    var ret = '' + p.data;
    while (p = p.next) {
      ret += s + p.data;
    }return ret;
  };

  BufferList.prototype.concat = function concat(n) {
    if (this.length === 0) return Buffer.alloc(0);
    if (this.length === 1) return this.head.data;
    var ret = Buffer.allocUnsafe(n >>> 0);
    var p = this.head;
    var i = 0;
    while (p) {
      copyBuffer(p.data, ret, i);
      i += p.data.length;
      p = p.next;
    }
    return ret;
  };

  return BufferList;
}();

if (util && util.inspect && util.inspect.custom) {
  module.exports.prototype[util.inspect.custom] = function () {
    var obj = util.inspect({ length: this.length });
    return this.constructor.name + ' ' + obj;
  };
}
},{"safe-buffer":79,"util":93}],77:[function(_dereq_,module,exports){
'use strict';

/*<replacement>*/

var pna = _dereq_('process-nextick-args');
/*</replacement>*/

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
      pna.nextTick(emitErrorNT, this, err);
    }
    return this;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      pna.nextTick(emitErrorNT, _this, err);
      if (_this._writableState) {
        _this._writableState.errorEmitted = true;
      }
    } else if (cb) {
      cb(err);
    }
  });

  return this;
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy
};
},{"process-nextick-args":69}],78:[function(_dereq_,module,exports){
module.exports = _dereq_('stream');

},{"stream":85}],79:[function(_dereq_,module,exports){
/* eslint-disable node/no-deprecated-api */
var buffer = _dereq_('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":31}],80:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var Buffer = _dereq_('safe-buffer').Buffer;
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":79}],81:[function(_dereq_,module,exports){
module.exports = _dereq_('./readable').PassThrough

},{"./readable":82}],82:[function(_dereq_,module,exports){
(function (process){
var Stream = _dereq_('stream');
if (process.env.READABLE_STREAM === 'disable' && Stream) {
  module.exports = Stream;
  exports = module.exports = Stream.Readable;
  exports.Readable = Stream.Readable;
  exports.Writable = Stream.Writable;
  exports.Duplex = Stream.Duplex;
  exports.Transform = Stream.Transform;
  exports.PassThrough = Stream.PassThrough;
  exports.Stream = Stream;
} else {
  exports = module.exports = _dereq_('./lib/_stream_readable.js');
  exports.Stream = Stream || exports;
  exports.Readable = exports;
  exports.Writable = _dereq_('./lib/_stream_writable.js');
  exports.Duplex = _dereq_('./lib/_stream_duplex.js');
  exports.Transform = _dereq_('./lib/_stream_transform.js');
  exports.PassThrough = _dereq_('./lib/_stream_passthrough.js');
}

}).call(this,_dereq_('_process'))
},{"./lib/_stream_duplex.js":71,"./lib/_stream_passthrough.js":72,"./lib/_stream_readable.js":73,"./lib/_stream_transform.js":74,"./lib/_stream_writable.js":75,"_process":30,"stream":85}],83:[function(_dereq_,module,exports){
module.exports = _dereq_('./readable').Transform

},{"./readable":82}],84:[function(_dereq_,module,exports){
(function (process){
var Stream = _dereq_("stream")
var Writable = _dereq_("./lib/_stream_writable.js")

if (process.env.READABLE_STREAM === 'disable') {
  module.exports = Stream && Stream.Writable || Writable
} else {
  module.exports = Writable
}

}).call(this,_dereq_('_process'))
},{"./lib/_stream_writable.js":75,"_process":30,"stream":85}],85:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = _dereq_('events').EventEmitter;
var inherits = _dereq_('inherits');

inherits(Stream, EE);
Stream.Readable = _dereq_('readable-stream/readable.js');
Stream.Writable = _dereq_('readable-stream/writable.js');
Stream.Duplex = _dereq_('readable-stream/duplex.js');
Stream.Transform = _dereq_('readable-stream/transform.js');
Stream.PassThrough = _dereq_('readable-stream/passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":55,"inherits":62,"readable-stream/duplex.js":70,"readable-stream/passthrough.js":81,"readable-stream/readable.js":82,"readable-stream/transform.js":83,"readable-stream/writable.js":84}],86:[function(_dereq_,module,exports){
var nargs = /\{([0-9a-zA-Z]+)\}/g
var slice = Array.prototype.slice

module.exports = template

function template(string) {
    var args

    if (arguments.length === 2 && typeof arguments[1] === "object") {
        args = arguments[1]
    } else {
        args = slice.call(arguments, 1)
    }

    if (!args || !args.hasOwnProperty) {
        args = {}
    }

    return string.replace(nargs, function replaceArg(match, i, index) {
        var result

        if (string[index - 1] === "{" &&
            string[index + match.length] === "}") {
            return i
        } else {
            result = args.hasOwnProperty(i) ? args[i] : null
            if (result === null || result === undefined) {
                return ""
            }

            return result
        }
    })
}

},{}],87:[function(_dereq_,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = _dereq_('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,_dereq_("timers").setImmediate,_dereq_("timers").clearImmediate)
},{"process/browser.js":88,"timers":87}],88:[function(_dereq_,module,exports){
arguments[4][30][0].apply(exports,arguments)
},{"dup":30}],89:[function(_dereq_,module,exports){

/**
 * For Node.js, simply re-export the core `util.deprecate` function.
 */

module.exports = _dereq_('util').deprecate;

},{"util":93}],90:[function(_dereq_,module,exports){
try {
  var util = _dereq_('util');
  if (typeof util.inherits !== 'function') throw '';
  module.exports = util.inherits;
} catch (e) {
  module.exports = _dereq_('./inherits_browser.js');
}

},{"./inherits_browser.js":91,"util":93}],91:[function(_dereq_,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],92:[function(_dereq_,module,exports){
arguments[4][26][0].apply(exports,arguments)
},{"buffer":31,"dup":26}],93:[function(_dereq_,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"./support/isBuffer":92,"_process":30,"dup":27,"inherits":90}],94:[function(_dereq_,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],95:[function(_dereq_,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],96:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint max-statements:[0, 99] */
'use strict';

var TYPE = _dereq_('./TYPE');
var bufrwErrors = _dereq_('bufrw/errors');
var bufrw = _dereq_('bufrw');
var errors = _dereq_('./errors');
var TMapHeaderRW = _dereq_('./tmap').TMapRW.prototype.headerRW;
var TListHeaderRW = _dereq_('./tlist').TListRW.prototype.headerRW;
var StringRW = _dereq_('./string').StringRW;
var BooleanRW = _dereq_('./boolean').BooleanRW;

var widths = Object.create(null);
widths[TYPE.VOID] = 0;

var readVar = Object.create(null);
readVar[TYPE.BOOL] = readBool;
readVar[TYPE.BYTE] = readI8;
readVar[TYPE.DOUBLE] = readDouble;
readVar[TYPE.I8] = readI8;
readVar[TYPE.I16] = readI16;
readVar[TYPE.I32] = readI32;
readVar[TYPE.I64] = readI64;
readVar[TYPE.STRING] = readString;
readVar[TYPE.STRUCT] = readStruct;
readVar[TYPE.MAP] = readMap;
readVar[TYPE.SET] = readList;
readVar[TYPE.LIST] = readList;

function readType(destResult, buffer, offset, typeid) {
    var result;

    // istanbul ignore else
    if (readVar[typeid] !== undefined) {
        result = readVar[typeid](destResult, buffer, offset);
        // istanbul ignore if
        if (result.err) {
            return result;
        }
        offset = result.offset;

    } else if (widths[typeid] !== undefined) {
        var length = widths[typeid];
        if (offset + length > buffer.length) {
            return destResult.reset(bufrwErrors.ShortBuffer({
                expected: offset + length,
                actual: buffer.length,
                buffer: buffer,
                offset: offset
            }), offset);
        }
        offset += length;

    } else {
        return destResult.reset(errors.InvalidTypeidError({
            typeid: typeid,
            what: 'field::type'
        }), offset);
    }

    return destResult.reset(null, offset, result && result.value);
}

function readBool(destResult, buffer, offset) {
    return BooleanRW.poolReadFrom(destResult, buffer, offset);
}

function readDouble(destResult, buffer, offset) {
    return bufrw.DoubleBE.poolReadFrom(destResult, buffer, offset);
}

function readI8(destResult, buffer, offset) {
    return bufrw.Int8.poolReadFrom(destResult, buffer, offset);
}

function readI16(destResult, buffer, offset) {
    return bufrw.Int16BE.poolReadFrom(destResult, buffer, offset);
}

function readI32(destResult, buffer, offset) {
    return bufrw.Int32BE.poolReadFrom(destResult, buffer, offset);
}

var fix8 = bufrw.FixedWidth(8);
function readI64(destResult, buffer, offset) {
    return fix8.poolReadFrom(destResult, buffer, offset);
}

function readString(destResult, buffer, offset) {
    return StringRW.poolReadFrom(destResult, buffer, offset);
}

function readStruct(destResult, buffer, offset) {
    var result;
    var struct = {};
    for (;;) {
        result = bufrw.Int8.poolReadFrom(destResult, buffer, offset);
        // istanbul ignore if
        if (result.err) {
            return result;
        }
        offset = result.offset;
        var typeid = result.value;

        if (typeid === TYPE.STOP) {
            return destResult.reset(null, offset, struct);
        }

        result = bufrw.Int16BE.poolReadFrom(destResult, buffer, offset);
        // istanbul ignore if
        if (result.err) {
            return result;
        }
        offset = result.offset;
        var id = result.value;

        result = readType(destResult, buffer, offset, typeid);
        struct[id] = result.value;
        // istanbul ignore if
        if (result.err) {
            return result;
        }
        offset = result.offset;
    }
}

function readMap(destResult, buffer, offset) {
    var result;
    var map = {};
    var key;

    // map headers
    result = TMapHeaderRW.poolReadFrom(destResult, buffer, offset);
    // istanbul ignore if
    if (result.err) {
        return result;
    }
    offset = result.offset;

    var header = result.value;
    var ktypeid = header[0];
    var vtypeid = header[1];
    var length = header[2];

    // each entry
    for (var index = 0; index < length; index++) {
        result = readType(destResult, buffer, offset, ktypeid);
        // istanbul ignore if
        if (result.err) {
            return result;
        }
        offset = result.offset;
        key = result.value;

        result = readType(destResult, buffer, offset, vtypeid);
        // istanbul ignore if
        if (result.err) {
            return result;
        }
        offset = result.offset;
        map[key] = result.value;
    }

    return destResult.reset(null, offset, map);
}

function readList(destResult, buffer, offset) {
    var result;
    var list = [];
    // list/set headers
    result = TListHeaderRW.poolReadFrom(destResult, buffer, offset);
    // istanbul ignore if
    if (result.err) {
        return result;
    }
    offset = result.offset;

    var header = result.value;
    var vtypeid = header[0];
    var length = header[1];

    // each value
    for (var index = 0; index < length; index++) {
        result = readType(destResult, buffer, offset, vtypeid);
        // istanbul ignore if
        if (result.err) {
            return result;
        }
        offset = result.offset;
        list.push(result.value);
    }

    return destResult.reset(null, offset, list);
}

module.exports.readType = readType;

},{"./TYPE":1,"./boolean":4,"./errors":9,"./string":101,"./tlist":105,"./tmap":106,"bufrw":38,"bufrw/errors":36}],97:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var bufrw = _dereq_('bufrw');
var util = _dereq_('util');

// TODO roll this up into bufrw.Base

function RW() {
    bufrw.Base.call(this);
}
util.inherits(RW, bufrw.Base);

RW.prototype.toBuffer = function toBuffer(value) {
    return bufrw.toBufferResult(this, value);
};

RW.prototype.fromBuffer = function fromBuffer(buffer, offset) {
    return bufrw.fromBufferResult(this, buffer, offset);
};

module.exports = RW;

},{"bufrw":38,"util":93}],98:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var ast = _dereq_('./ast');
var Message = _dereq_('./message').Message;
var MessageRW = _dereq_('./message').MessageRW;

function ThriftFunction(args) {
    this.name = args.name;
    this.service = args.service;
    this.fullName = this.service.name + '::' + this.name;
    this.model = args.model;
    this.args = null;
    this.result = null;
    this.strict = args.strict;
    this.linked = false;
}

ThriftFunction.prototype.compile = function process(def, model) {
    this.def = def;
    this.name = def.id.name;

    var argsId = new ast.Identifier(this.name + '_args');
    argsId.as = this.fullName + '_args';
    var argsStruct = new ast.Struct(argsId, def.fields);
    argsStruct.isArgument = true;
    this.args = model.compileStruct(argsStruct);

    var returnType = def.returns;
    var resultFields = def.throws || [];
    if (returnType.type !== 'BaseType' || returnType.baseType !== 'void') {
        var successFieldId = new ast.FieldIdentifier(0);
        var successField = new ast.Field(successFieldId, def.returns, 'success');
        successField.required = false;
        successField.optional = true;
        successField.isResult = true;
        resultFields.unshift(successField);
    }

    var resultId = new ast.Identifier(this.name + '_result');
    resultId.as = this.fullName + '_result';
    var resultStruct = new ast.Struct(resultId, resultFields);
    resultStruct.isResult = true;
    this.result = model.compileStruct(resultStruct);

    this.oneway = def.oneway;
    this.annotations = def.annotations;
};

ThriftFunction.prototype.link = function link(model) {
    this.args.link(model);
    this.result.link(model);

    this.Arguments = this.args.Constructor;
    this.Result = this.result.Constructor;

    // TODO cover oneway, if we ever have use for it
    // istanbul ignore next
    var type = this.oneway ? 'ONEWAY' : 'CALL';
    this.ArgumentsMessage = this.makeMessageConstructor(this.name, type);
    this.ResultMessage = this.makeMessageConstructor(this.name, 'REPLY');

    this.argumentsMessageRW = new MessageRW(this.args.rw, model.exception.rw);
    this.resultMessageRW = new MessageRW(this.result.rw, model.exception.rw);
};

ThriftFunction.prototype.makeMessageConstructor = function makeMessageConstructor(name, type) {
    function FunctionMessage(message) {
        Message.call(this, message);
        this.name = message.name || name;
        this.type = message.type || type;
    }
    return FunctionMessage;
};

function ThriftService(args) {
    this.name = null;
    this.functions = [];
    this.functionsByName = Object.create(null);
    this.surface = this.functionsByName;
    this.strict = args.strict;
    this.baseService = null;
    this.linked = false;
    this.annotations = null;
}

ThriftService.prototype.models = 'service';

ThriftService.prototype.compile = function process(def, model) {
    this.name = def.id.name;
    for (var index = 0; index < def.functions.length; index++) {
        this.compileFunction(def.functions[index], model);
    }
    this.baseService = def.baseService;
    this.annotations = def.annotations;
};

ThriftService.prototype.compileFunction = function processFunction(def, model) {
    var thriftFunction = new ThriftFunction({
        name: def.id.name,
        service: this,
        strict: this.strict
    });
    thriftFunction.compile(def, model);
    this.addFunction(thriftFunction);
};

ThriftService.prototype.addFunction = function addFunction(thriftFunction, thrift) {
    this.functions.push(thriftFunction);
    if (!this.functionsByName[thriftFunction.name]) {
        this.functionsByName[thriftFunction.name] = thriftFunction;
        if (thrift) {
            thrift.define(
                this.name + '::' + thriftFunction.args.name,
                thriftFunction.def,
                thriftFunction.args
            );

            thrift.define(
                this.name + '::' + thriftFunction.result.name,
                thriftFunction.def,
                thriftFunction.result
            );
        }
    } else {
        throw new Error(this.name + '.' + thriftFunction.name + ' already inherited from baseService');
    }
};

ThriftService.prototype.link = function link(model) {
    var index = 0;

    if (this.linked) {
        return this;
    }
    this.linked = true;

    if (this.baseService) {
        var baseService = model.resolveIdentifier(this.baseService, this.baseService.name, 'service');
        baseService.link(model);
        for (index = 0; index < baseService.functions.length; index++) {
            var thriftFunction = baseService.functions[index];
            this.addFunction(thriftFunction, model);
        }
    }

    for (index = 0; index < this.functions.length; index++) {
        this.functions[index].link(model);
    }

    model.services[this.name] = this.surface;

    // istanbul ignore else
    if (!/^[a-z]/.test(this.name)) {
        model[this.name] = this.surface;
    }

    return this;
};

module.exports.ThriftFunction = ThriftFunction;
module.exports.ThriftService = ThriftService;

},{"./ast":2,"./message":21}],99:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var util = _dereq_('util');
var assert = _dereq_('assert');
var ThriftList = _dereq_('./list').ThriftList;
var TYPE = _dereq_('./TYPE');

function ThriftSet(valueType, annotations) {
    ThriftList.call(this, valueType, annotations);
    this.mode = annotations && annotations['js.type'] || 'array';
    this.form = null;
    this.surface = null;
    if (this.mode === 'object') {
        if (valueType.name === 'string') {
            this.rw.form = this.objectStringForm;
        // istanbul ignore else
        } else if (
            valueType.name === 'byte' ||
            valueType.name === 'i16' ||
            valueType.name === 'i32'
        ) {
            this.rw.form = this.objectNumberForm;
        } else {
            assert.fail('sets with js.type of \'object\' must have a value type ' +
                'of \'string\', \'byte\', \'i16\', or \'i32\'');
        }
        this.surface = Object;
    // istanbul ignore else
    } else if (this.mode === 'array') {
        this.rw.form = this.arrayForm;
        this.surface = Array;
    } else {
        assert.fail('set must have js.type of object or array (default)');
    }
    this.annotations = annotations;
}

util.inherits(ThriftSet, ThriftList);

ThriftSet.prototype.name = 'set';
ThriftSet.prototype.typeid = TYPE.SET;
// Lists are indistinguishable on the wire apart from the typeid.
// A prior version of thriftrw was writing sets with the list typeid.
// Allowing an alternate typeid eases migration temporarily.
ThriftSet.prototype.altTypeid = TYPE.LIST;
ThriftSet.prototype.models = 'type';

ThriftSet.prototype.arrayForm = {
    create: function create() {
        return [];
    },
    add: function add(values, value) {
        values.push(value);
    },
    toArray: function toArray(values) {
        assert(Array.isArray(values), 'set must be expressed as an array');
        return values;
    }
};

ThriftSet.prototype.objectNumberForm = {
    create: function create() {
        return {};
    },
    add: function add(values, value) {
        values[value] = true;
    },
    toArray: function toArray(object) {
        assert(object && typeof object === 'object', 'set must be expressed as an object');
        var keys = Object.keys(object);
        var values = [];
        for (var index = 0; index < keys.length; index++) {
            // istanbul ignore else
            if (object[keys[index]]) {
                values.push(+keys[index]);
            }
        }
        return values;
    }
};

ThriftSet.prototype.objectStringForm = {
    create: function create() {
        return {};
    },
    add: function add(values, value) {
        values[value] = true;
    },
    toArray: function toArray(object) {
        assert(object && typeof object === 'object', 'set must be expressed as an object');
        var keys = Object.keys(object);
        var values = [];
        for (var index = 0; index < keys.length; index++) {
            // istanbul ignore else
            if (object[keys[index]]) {
                values.push(keys[index]);
            }
        }
        return values;
    }
};

module.exports.ThriftSet = ThriftSet;

},{"./TYPE":1,"./list":17,"assert":24,"util":93}],100:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint max-statements:[0, 99] */
'use strict';

var TYPE = _dereq_('./TYPE');
var bufrwErrors = _dereq_('bufrw/errors');
var errors = _dereq_('./errors');
var TMapHeaderRW = _dereq_('./tmap').TMapRW.prototype.headerRW;
var TListHeaderRW = _dereq_('./tlist').TListRW.prototype.headerRW;

var widths = Object.create(null);
widths[TYPE.VOID] = 0;
widths[TYPE.BOOL] = 1;
widths[TYPE.BYTE] = 1;
widths[TYPE.I8] = 1;
widths[TYPE.DOUBLE] = 8;
widths[TYPE.I16] = 2;
widths[TYPE.I32] = 4;
widths[TYPE.I64] = 8;

var skipVar = Object.create(null);
skipVar[TYPE.STRUCT] = skipStruct;
skipVar[TYPE.STRING] = skipString;
skipVar[TYPE.MAP] = skipMap;
skipVar[TYPE.SET] = skipList;
skipVar[TYPE.LIST] = skipList;

function skipField(destResult, buffer, offset) {
    if (offset + 1 > buffer.length) {
        return destResult.reset(bufrwErrors.ShortBuffer({
            expected: offset + 1,
            actual: buffer.length,
            buffer: buffer,
            offset: offset
        }), offset);
    }

    var typeid = buffer.readInt8(offset);
    offset += 1;

    return skipType(destResult, buffer, offset, typeid);
}

function skipType(destResult, buffer, offset, typeid) {
    var result;

    // istanbul ignore else
    if (skipVar[typeid] !== undefined) {
        result = skipVar[typeid](destResult, buffer, offset);
        // istanbul ignore if
        if (result.err) {
            return result;
        }
        offset = result.offset;

    } else if (widths[typeid] !== undefined) {
        var length = widths[typeid];
        if (offset + length > buffer.length) {
            return destResult.reset(bufrwErrors.ShortBuffer({
                expected: offset + length,
                actual: buffer.length,
                buffer: buffer,
                offset: offset
            }), offset);
        }
        offset += length;

    } else {
        return destResult.reset(errors.InvalidTypeidError({
            typeid: typeid,
            what: 'field::type'
        }), offset);
    }

    return destResult.reset(null, offset);
}

function skipStruct(destResult, buffer, offset) {
    var result;
    for (;;) {
        // typeid
        // istanbul ignore if
        if (offset + 1 > buffer.length) {
            return destResult.reset(bufrwErrors.ShortBuffer({
                expected: offset + 1,
                actual: buffer.length,
                buffer: buffer,
                offset: offset
            }), offset);
        }
        var typeid = buffer.readInt8(offset);
        offset += 1;

        if (typeid === TYPE.STOP) {
            return destResult.reset(null, offset);
        }

        // id
        // istanbul ignore if
        if (offset + 2 > buffer.length) {
            return destResult.reset(bufrwErrors.ShortBuffer({
                expected: offset + 2,
                actual: buffer.length,
                buffer: buffer,
                offset: offset
            }), offset);
        }
        offset += 2;

        result = skipType(destResult, buffer, offset, typeid);
        // istanbul ignore if
        if (result.err) {
            return result;
        }
        offset = result.offset;
    }
}

function skipString(destResult, buffer, offset) {

    // istanbul ignore if
    if (offset + 4 > buffer.length) {
        return destResult.reset(bufrwErrors.ShortBuffer({
            expected: offset + 4,
            actual: buffer.length,
            buffer: buffer,
            offset: offset
        }), offset);
    }

    var length = buffer.readInt32BE(offset);
    offset += 4;

    // istanbul ignore if
    if (offset + length > buffer.length) {
        return destResult.reset(bufrwErrors.ShortBuffer({
            expected: offset + length,
            actual: buffer.length,
            buffer: buffer,
            offset: offset
        }), offset);
    }
    offset += length;

    return destResult.reset(null, offset);
}

function skipMap(destResult, buffer, offset) {
    var result;

    // map headers
    result = TMapHeaderRW.poolReadFrom(destResult, buffer, offset);
    // istanbul ignore if
    if (result.err) {
        return result;
    }
    offset = result.offset;

    var header = result.value;
    var ktypeid = header[0];
    var vtypeid = header[1];
    var length = header[2];

    // each entry
    for (var index = 0; index < length; index++) {
        result = skipType(destResult, buffer, offset, ktypeid);
        // istanbul ignore if
        if (result.err) {
            return result;
        }
        offset = result.offset;

        result = skipType(destResult, buffer, offset, vtypeid);
        // istanbul ignore if
        if (result.err) {
            return result;
        }
        offset = result.offset;
    }

    return destResult.reset(null, offset);
}

function skipList(destResult, buffer, offset) {
    var result;

    // list/set headers
    result = TListHeaderRW.poolReadFrom(destResult, buffer, offset);
    // istanbul ignore if
    if (result.err) {
        return result;
    }
    offset = result.offset;

    var header = result.value;
    var vtypeid = header[0];
    var length = header[1];

    // each value
    for (var index = 0; index < length; index++) {
        result = skipType(destResult, buffer, offset, vtypeid);
        // istanbul ignore if
        if (result.err) {
            return result;
        }
        offset = result.offset;
    }

    return destResult.reset(null, offset);
}

module.exports.skipField = skipField;
module.exports.skipType = skipType;

},{"./TYPE":1,"./errors":9,"./tlist":105,"./tmap":106,"bufrw/errors":36}],101:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var bufrw = _dereq_('bufrw');
var TYPE = _dereq_('./TYPE');

var StringRW = new bufrw.String(bufrw.Int32BE, 'utf-8');

function ThriftString(annotations) {
    // This is where we would decide which RW to use if there is an annotation
    // for an alternative to utf-8.
    this.annotations = annotations;
}

ThriftString.prototype.rw = StringRW;
ThriftString.prototype.name = 'string';
ThriftString.prototype.typeid = TYPE.STRING;
ThriftString.prototype.surface = String;
ThriftString.prototype.models = 'type';

module.exports.StringRW = StringRW;
module.exports.ThriftString = ThriftString;

},{"./TYPE":1,"bufrw":38}],102:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint max-len:[0, 120] */
/* eslint max-statements:[0, 99] */
/* eslint complexity:[0, 16] */
'use strict';

var assert = _dereq_('assert');
var bufrw = _dereq_('bufrw');
var RW = _dereq_('./rw');
var TYPE = _dereq_('./TYPE');
var NAMES = _dereq_('./names');
var errors = _dereq_('./errors');
var skipType = _dereq_('./skip').skipType;
var util = _dereq_('util');
var ThriftUnrecognizedException = _dereq_('./unrecognized-exception')
    .ThriftUnrecognizedException;

var readType = _dereq_('./read').readType;

function ThriftField(def, struct) {
    assert(def.isResult || def.id.value > 0,
        'field identifier must be greater than 0' +
        ' for ' + JSON.stringify(def.name) +
        ' on ' + JSON.stringify(struct.name) +
        ' at ' + def.id.line + ':' + def.id.column
    );
    this.id = def.id.value;
    this.name = def.name;
    this.required = def.required;
    this.optional = def.optional;
    this.valueDefinition = def.valueType;
    this.valueType = null;
    this.defaultValueDefinition = def.defaultValue || struct.defaultValueDefinition;
    this.defaultValue = null;
    this.annotations = def.annotations;
}

ThriftField.prototype.link = function link(model) {
    this.valueType = model.resolve(this.valueDefinition);
    assert(this.valueType, 'value type was defined, as returned by resolve');
};

ThriftField.prototype.linkValue = function linkValue(model) {
    this.defaultValue = model.resolveValue(this.defaultValueDefinition);
};

function ThriftStruct(options) {
    options = options || {};

    this.name = null;
    // Strict mode is on by default. Because we have strict opinions about Thrift.
    this.strict = options.strict !== undefined ? options.strict : true;
    this.defaultValueDefinition = options.defaultValueDefinition;
    // TODO bring in serviceName
    this.fields = [];
    this.fieldNames = [];
    this.fieldsById = {};
    this.fieldsByName = {};
    this.isArgument = null;
    this.isResult = null;
    this.isException = options.isException || false;
    this.Constructor = null;
    this.surface = null;
    this.rw = new this.RW(this);
    this.thrift = null;
    this.linked = false;
    this.annotations = null;
}

ThriftStruct.prototype.name = 'struct';
ThriftStruct.prototype.typeid = TYPE.STRUCT;
ThriftStruct.prototype.RW = StructRW;
ThriftStruct.prototype.isUnion = false;
ThriftStruct.prototype.models = 'type';

ThriftStruct.prototype.toBuffer = function toBuffer(struct) {
    return bufrw.toBuffer(this.rw, struct);
};

ThriftStruct.prototype.toBufferResult = function toBufferResult(struct) {
    return bufrw.toBufferResult(this.rw, struct);
};

ThriftStruct.prototype.fromBuffer = function fromBuffer(buffer, offset) {
    return bufrw.fromBuffer(this.rw, buffer, offset);
};

ThriftStruct.prototype.fromBufferResult = function fromBufferResult(buffer) {
    return bufrw.fromBufferResult(this.rw, buffer);
};

ThriftStruct.prototype.compile = function compile(def, thrift) {
    // Struct names must be valid JavaScript. If the Thrift name is not valid
    // in JavaScript, it can be overridden with the js.name annotation.
    this.name = def.annotations && def.annotations['js.name'] || def.id.name;
    this.fullName = def.id.as || this.name;
    this.isArgument = def.isArgument || false;
    this.isResult = def.isResult || false;
    this.thrift = thrift;
    var fields = def.fields;
    for (var index = 0; index < fields.length; index++) {
        var fieldDef = fields[index];
        var field = new ThriftField(fieldDef, this);

        // Field names must be valid JavaScript. If the Thrift name is not
        // valid in JavaScript, it can be overridden with the js.name
        // annotation.
        field.name = field.annotations && field.annotations['js.name'] || field.name;
        this.fieldsById[field.id] = field;
        this.fieldsByName[field.name] = field;
        this.fieldNames[index] = field.name;
        this.fields.push(field);
    }
    this.annotations = def.annotations;
};

ThriftStruct.prototype.link = function link(model) {
    if (this.linked) {
        return this;
    }
    this.linked = true;

    var index;

    // Link default values first since they're used by the constructor
    for (index = 0; index < this.fields.length; index++) {
        var field = this.fields[index];
        field.linkValue(model);

        // Evidently with Apache Thrift, arguments are always optional,
        // regardless of how they are marked.
        // They are optional in Go by virtue of defaulting to the zero value
        // for their type, and it is not possible to distinguish a missing
        // field from the zero value.
        if (this.isArgument) {
            if (this.thrift.allowOptionalArguments) {
                // Once this flag is enabled, all ThriftRW language
                // implementations agree that fields are optional unless marked
                // required.  If they are marked required, that contract is
                // respected for both inbound and outbound messages.
                if (!field.required && !field.optional && field.defaultValue === undefined) {
                    field.optional = true;
                }
            } else if (field.optional) {
                // Until version 3.4.3, when we introduced the
                // allowOptionalArguments opt-in, all arguments were always
                // required.  RPC handlers were written to depend on all
                // argument fields being implicitly required.
                assert.ok(false, 'no field of an argument struct may be marked ' +
                    'optional including ' + field.name + ' of ' + this.name + '; ' +
                    'consider new Thrift({allowOptionalArguments: true}).');
            } else {
                field.required = true;
            }
        }

        // Validate field
        if (this.strict) {
            assert(
                field.required || field.optional ||
                field.defaultValue !== null && field.defaultValue !== undefined ||
                this.isArgument || this.isResult || this.isUnion,
                'every field must be marked optional, required, or have a default value on ' +
                    this.name + ' including "' + field.name + '" in strict mode'
            );
        }
    }

    this.Constructor = this.createConstructor(this.name, this.fields);
    this.Constructor.rw = this.rw;

    this.Constructor.fromBuffer = this.fromBuffer;
    this.Constructor.fromBufferResult = this.fromBufferResult;

    this.Constructor.toBuffer = this.toBuffer;
    this.Constructor.toBufferResult = this.toBufferResult;

    this.surface = this.Constructor;

    // Link field types later since they may depend on the constructor existing
    // first.
    for (index = 0; index < this.fields.length; index++) {
        this.fields[index].link(model);
    }

    if (this.isUnion) {
        model.unions[this.name] = this.Constructor;
    } else if (this.isException) {
        model.exceptions[this.name] = this.Constructor;
    } else {
        model.structs[this.name] = this.Constructor;
    }

    // Alias if first character is not lower-case
    if (!/^[a-z]/.test(this.name)) {
        model[this.name] = this.Constructor;
    }

    return this;
};

ThriftStruct.prototype.validateStruct = function validateStruct(struct) {
    // Validate required fields
    for (var index = 0; index < this.fields.length; index++) {
        var field = this.fields[index];
        if (!field.required || field.defaultValue != null) {
            continue;
        }
        var value = struct && struct[field.name];
        var available = value !== null && value !== undefined;
        if (!available) {
            return errors.FieldRequiredError({
                name: field.name,
                id: field.id,
                structName: this.name
            });
        }
    }

    return null;
};

// The following methods have alternate implementations for Exception and Union.

ThriftStruct.prototype.createConstructor = function createConstructor(name, fields) {
    var source;
    source = '(function thriftrw_' + name + '(options) {\n';
    for (var index = 0; index < fields.length; index++) {
        var field = fields[index];
        source += '    if (options && typeof options.' + field.name + ' !== "undefined") ' +
            '{ this.' + field.name + ' = options.' + field.name + '; }\n';
        source += '    else { this.' + field.name +
            ' = ' + JSON.stringify(field.defaultValue) + '; }\n';
    }
    source += '})\n';
    // eval is an operator that captures the lexical scope of the calling
    // function and deoptimizes the lexical scope.
    // By using eval in an expression context, it loses this second-class
    // capability and becomes a first-class function.
    // (0, eval) is one way to use eval in an expression context.
    return (0, eval)(source);
};

ThriftStruct.prototype.create = function create() {
    return new this.Constructor();
};

ThriftStruct.prototype.set = function set(struct, key, value) {
    struct[key] = value;
};

ThriftStruct.prototype.finalize = function finalize(struct) {
    return struct;
};

function StructRW(model) {
    assert(model, 'model required');
    this.model = model;

    RW.call(this);
}

util.inherits(StructRW, RW);

StructRW.prototype.poolByteLength = function poolByteLength(destResult, struct) {
    var length = 1; // stop:1
    var result;
    for (var index = 0; index < this.model.fields.length; index++) {
        var field = this.model.fields[index];
        var value = struct && struct[field.name];

        var available = value !== null && value !== undefined;

        if (!available && field.required) {
            return destResult.reset(errors.FieldRequiredError({
                name: field.name,
                id: field.id,
                structName: this.model.name,
                what: struct
            }));
        }
        if (!available) {
            continue;
        }

        // TODO maybe suppress defaultValue on the wire

        // typeid:1
        // field.id:2
        length += 3;

        result = field.valueType.rw.poolByteLength(destResult, value);
        // istanbul ignore if
        if (result.err) {
            return result;
        }
        length += result.length;
    }
    return destResult.reset(null, length);
};

StructRW.prototype.poolWriteInto = function poolWriteInto(destResult, struct, buffer, offset) {
    var result;
    for (var index = 0; index < this.model.fields.length; index++) {
        var field = this.model.fields[index];
        var value = struct && struct[field.name];
        var available = value !== null && value !== undefined;

        if (!available && field.required) {
            return destResult.reset(errors.FieldRequiredError({
                name: field.name,
                id: field.id,
                structName: this.model.name,
                what: struct
            }));
        }
        if (!available) {
            continue;
        }

        // TODO maybe suppress defaultValue on the wire

        result = bufrw.Int8.poolWriteInto(destResult, field.valueType.typeid, buffer, offset);
        // istanbul ignore if
        if (result.err) {
            return result;
        }
        offset = result.offset;

        result = bufrw.Int16BE.poolWriteInto(destResult, field.id, buffer, offset);
        // istanbul ignore if
        if (result.err) {
            return result;
        }
        offset = result.offset;

        result = field.valueType.rw.poolWriteInto(destResult, value, buffer, offset);
        // istanbul ignore if
        if (result.err) {
            return result;
        }
        offset = result.offset;
    }

    result = bufrw.Int8.poolWriteInto(destResult, TYPE.STOP, buffer, offset);
    // istanbul ignore if
    if (result.err) {
        return result;
    }
    offset = result.offset;
    return destResult.reset(null, offset);
};

StructRW.prototype.poolReadFrom = function poolReadFrom(destResult, buffer, offset) {
    var struct = this.model.create();
    var result;

    for (;;) {
        result = bufrw.Int8.poolReadFrom(destResult, buffer, offset);
        // istanbul ignore if
        if (result.err) {
            return result;
        }
        offset = result.offset;
        var typeid = result.value;

        if (typeid === TYPE.STOP) {
            break;
        }

        result = bufrw.Int16BE.poolReadFrom(destResult, buffer, offset);
        // istanbul ignore if
        if (result.err) {
            return result;
        }
        offset = result.offset;
        var id = result.value;

        // keep unrecognized files from the future if it could be an
        // unrecognized exception.
        if (!this.model.fieldsById[id] && this.model.isResult) {
            result = readType(destResult, buffer, offset, typeid);
            // result = skipType(buffer, offset, typeid);
            // istanbul ignore if
            if (result.err) {
                return result;
            }
            offset = result.offset;
            this.model.set(
                struct,
                'failure',
                new ThriftUnrecognizedException(result.value)
            );
            continue;
        }

        // skip unrecognized fields from THE FUTURE
        if (!this.model.fieldsById[id]) {
            result = skipType(destResult, buffer, offset, typeid);
            // istanbul ignore if
            if (result.err) {
                return result;
            }
            offset = result.offset;
            continue;
        }

        var field = this.model.fieldsById[id];
        if (
            field.valueType.typeid !== typeid &&
            field.valueType.altTypeid !== typeid // deprecated, see set.js
        ) {
            return destResult.reset(errors.UnexpectedFieldValueTypeidError({
                fieldId: id,
                fieldName: field.name,
                structName: this.model.name,
                typeid: typeid,
                typeName: NAMES[typeid],
                expectedTypeid: field.valueType.typeid,
                expectedTypeName: NAMES[field.valueType.typeid]
            }), offset);
        }

        result = field.valueType.rw.poolReadFrom(destResult, buffer, offset);
        // istanbul ignore if
        if (result.err) {
            return destResult.reset(result.err, offset);
        }
        offset = result.offset;
        // TODO promote return error of set to a ReadResult error
        this.model.set(struct, field.name, result.value);
    }

    // Validate required fields
    var err = this.model.validateStruct(struct);
    if (err) {
        return destResult.reset(err, offset);
    }

    return destResult.reset(null, offset, this.model.finalize(struct));
};

module.exports.ThriftField = ThriftField;
module.exports.ThriftStruct = ThriftStruct;
module.exports.StructRW = StructRW;

},{"./TYPE":1,"./errors":9,"./names":22,"./read":96,"./rw":97,"./skip":100,"./unrecognized-exception":110,"assert":24,"bufrw":38,"util":93}],103:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

module.exports = (function() {
  /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleFunctions = { Program: peg$parseProgram },
        peg$startRuleFunction  = peg$parseProgram,

        peg$c0 = peg$FAILED,
        peg$c1 = [],
        peg$c2 = function(hs, ds) {
            return new ast.Program(hs.filter(Boolean), ds);
          },
        peg$c3 = "cpp_namespace",
        peg$c4 = { type: "literal", value: "cpp_namespace", description: "\"cpp_namespace\"" },
        peg$c5 = "php_namespace",
        peg$c6 = { type: "literal", value: "php_namespace", description: "\"php_namespace\"" },
        peg$c7 = "py_module",
        peg$c8 = { type: "literal", value: "py_module", description: "\"py_module\"" },
        peg$c9 = "perl_package",
        peg$c10 = { type: "literal", value: "perl_package", description: "\"perl_package\"" },
        peg$c11 = "ruby_namespace",
        peg$c12 = { type: "literal", value: "ruby_namespace", description: "\"ruby_namespace\"" },
        peg$c13 = "smalltalk_category",
        peg$c14 = { type: "literal", value: "smalltalk_category", description: "\"smalltalk_category\"" },
        peg$c15 = "smalltalk_prefix",
        peg$c16 = { type: "literal", value: "smalltalk_prefix", description: "\"smalltalk_prefix\"" },
        peg$c17 = "java_package",
        peg$c18 = { type: "literal", value: "java_package", description: "\"java_package\"" },
        peg$c19 = "cocoa_package",
        peg$c20 = { type: "literal", value: "cocoa_package", description: "\"cocoa_package\"" },
        peg$c21 = "xsd_namespace",
        peg$c22 = { type: "literal", value: "xsd_namespace", description: "\"xsd_namespace\"" },
        peg$c23 = "csharp_namespace",
        peg$c24 = { type: "literal", value: "csharp_namespace", description: "\"csharp_namespace\"" },
        peg$c25 = null,
        peg$c26 = function(namespace, id) {
            return new ast.Include(id, namespace, line(), column());
          },
        peg$c27 = function(scope, id) { return new ast.Namespace(id, scope); },
        peg$c28 = "smalltalk.category",
        peg$c29 = { type: "literal", value: "smalltalk.category", description: "\"smalltalk.category\"" },
        peg$c30 = "smalltalk.prefix",
        peg$c31 = { type: "literal", value: "smalltalk.prefix", description: "\"smalltalk.prefix\"" },
        peg$c32 = "*",
        peg$c33 = { type: "literal", value: "*", description: "\"*\"" },
        peg$c34 = function(scope) { return; },
        peg$c35 = function(scope, id) { return; },
        peg$c36 = "cpp",
        peg$c37 = { type: "literal", value: "cpp", description: "\"cpp\"" },
        peg$c38 = "java",
        peg$c39 = { type: "literal", value: "java", description: "\"java\"" },
        peg$c40 = "py.twisted",
        peg$c41 = { type: "literal", value: "py.twisted", description: "\"py.twisted\"" },
        peg$c42 = "py",
        peg$c43 = { type: "literal", value: "py", description: "\"py\"" },
        peg$c44 = "perl",
        peg$c45 = { type: "literal", value: "perl", description: "\"perl\"" },
        peg$c46 = "rb",
        peg$c47 = { type: "literal", value: "rb", description: "\"rb\"" },
        peg$c48 = "cocoa",
        peg$c49 = { type: "literal", value: "cocoa", description: "\"cocoa\"" },
        peg$c50 = "csharp",
        peg$c51 = { type: "literal", value: "csharp", description: "\"csharp\"" },
        peg$c52 = "php",
        peg$c53 = { type: "literal", value: "php", description: "\"php\"" },
        peg$c54 = "as3",
        peg$c55 = { type: "literal", value: "as3", description: "\"as3\"" },
        peg$c56 = "c_glib",
        peg$c57 = { type: "literal", value: "c_glib", description: "\"c_glib\"" },
        peg$c58 = "js",
        peg$c59 = { type: "literal", value: "js", description: "\"js\"" },
        peg$c60 = "st",
        peg$c61 = { type: "literal", value: "st", description: "\"st\"" },
        peg$c62 = "go",
        peg$c63 = { type: "literal", value: "go", description: "\"go\"" },
        peg$c64 = "delphi",
        peg$c65 = { type: "literal", value: "delphi", description: "\"delphi\"" },
        peg$c66 = "lua",
        peg$c67 = { type: "literal", value: "lua", description: "\"lua\"" },
        peg$c68 = function(dt, id, ta) {
            return new ast.Typedef(dt, id, ta);
          },
        peg$c69 = function(ft) { return ft; },
        peg$c70 = ",",
        peg$c71 = { type: "literal", value: ",", description: "\",\"" },
        peg$c72 = ";",
        peg$c73 = { type: "literal", value: ";", description: "\";\"" },
        peg$c74 = { type: "other", description: "list separator" },
        peg$c75 = "{",
        peg$c76 = { type: "literal", value: "{", description: "\"{\"" },
        peg$c77 = "}",
        peg$c78 = { type: "literal", value: "}", description: "\"}\"" },
        peg$c79 = function(id, ed, ta) {
            return new ast.Enum(id, ed, ta);
          },
        peg$c80 = "=",
        peg$c81 = { type: "literal", value: "=", description: "\"=\"" },
        peg$c82 = function(v) { return v },
        peg$c83 = function(id, value, ta) {
            return new ast.EnumDefinition(id, value, ta);
          },
        peg$c84 = function(id, ss, ta) {
            return new ast.Senum(id, ss, ta);
          },
        peg$c85 = function(s) { return s; },
        peg$c86 = function(ft, id, cv) {
            return new ast.Const(id, ft, cv);
          },
        peg$c87 = "[",
        peg$c88 = { type: "literal", value: "[", description: "\"[\"" },
        peg$c89 = function(v) { return v},
        peg$c90 = "]",
        peg$c91 = { type: "literal", value: "]", description: "\"]\"" },
        peg$c92 = function(values) {
            return new ast.ConstList(values);
          },
        peg$c93 = function(entries) {
            return new ast.ConstMap(entries);
          },
        peg$c94 = ":",
        peg$c95 = { type: "literal", value: ":", description: "\":\"" },
        peg$c96 = function(k, v) {
            return new ast.ConstEntry(k, v);
          },
        peg$c97 = "struct",
        peg$c98 = { type: "literal", value: "struct", description: "\"struct\"" },
        peg$c99 = function(id, fs, ta) {
            return new ast.Struct(id, fs, ta);
          },
        peg$c100 = function(id, fs, ta) {
            return new ast.Union(id, fs, ta);
          },
        peg$c101 = "xsd_all",
        peg$c102 = { type: "literal", value: "xsd_all", description: "\"xsd_all\"" },
        peg$c103 = "xsd_optional",
        peg$c104 = { type: "literal", value: "xsd_optional", description: "\"xsd_optional\"" },
        peg$c105 = "xsd_nillable",
        peg$c106 = { type: "literal", value: "xsd_nillable", description: "\"xsd_nillable\"" },
        peg$c107 = "xsd_attributes",
        peg$c108 = { type: "literal", value: "xsd_attributes", description: "\"xsd_attributes\"" },
        peg$c109 = "exception",
        peg$c110 = { type: "literal", value: "exception", description: "\"exception\"" },
        peg$c111 = function(id, fs, ta) {
            return new ast.Exception(id, fs, ta);
          },
        peg$c112 = "service",
        peg$c113 = { type: "literal", value: "service", description: "\"service\"" },
        peg$c114 = function(id, bs, fns, ta) {
            return new ast.Service(id, fns, ta, bs);
          },
        peg$c115 = "extends",
        peg$c116 = { type: "literal", value: "extends", description: "\"extends\"" },
        peg$c117 = function(baseService) {
            return baseService;
          },
        peg$c118 = "(",
        peg$c119 = { type: "literal", value: "(", description: "\"(\"" },
        peg$c120 = ")",
        peg$c121 = { type: "literal", value: ")", description: "\")\"" },
        peg$c122 = function(oneway, ft, id, fs, ts, ta) {
            return new ast.FunctionDefinition(id, fs, ft, ts, ta, oneway);
          },
        peg$c123 = "oneway",
        peg$c124 = { type: "literal", value: "oneway", description: "\"oneway\"" },
        peg$c125 = function() { return true },
        peg$c126 = function() { return false; },
        peg$c127 = "throws",
        peg$c128 = { type: "literal", value: "throws", description: "\"throws\"" },
        peg$c129 = function(fs) {
            return fs;
          },
        peg$c130 = function(id, req, ft, rec, name, fv, ta) {
              return new ast.Field(id, ft, name, req, fv, ta);
            },
        peg$c131 = "&",
        peg$c132 = { type: "literal", value: "&", description: "\"&\"" },
        peg$c133 = function() {
            return true;
          },
        peg$c134 = function() {
            return false;
          },
        peg$c135 = function(id) {
            return new ast.FieldIdentifier(id.value, line(), column());
          },
        peg$c136 = "required",
        peg$c137 = { type: "literal", value: "required", description: "\"required\"" },
        peg$c138 = function() { return 'required'; },
        peg$c139 = "optional",
        peg$c140 = { type: "literal", value: "optional", description: "\"optional\"" },
        peg$c141 = function() { return 'optional'; },
        peg$c142 = function(cv) { return cv; },
        peg$c143 = "void",
        peg$c144 = { type: "literal", value: "void", description: "\"void\"" },
        peg$c145 = function() { return new ast.BaseType('void'); },
        peg$c146 = function(t, ta) {
            return new ast.BaseType(t, ta);
          },
        peg$c147 = "bool",
        peg$c148 = { type: "literal", value: "bool", description: "\"bool\"" },
        peg$c149 = "byte",
        peg$c150 = { type: "literal", value: "byte", description: "\"byte\"" },
        peg$c151 = "i8",
        peg$c152 = { type: "literal", value: "i8", description: "\"i8\"" },
        peg$c153 = "i16",
        peg$c154 = { type: "literal", value: "i16", description: "\"i16\"" },
        peg$c155 = "i32",
        peg$c156 = { type: "literal", value: "i32", description: "\"i32\"" },
        peg$c157 = "i64",
        peg$c158 = { type: "literal", value: "i64", description: "\"i64\"" },
        peg$c159 = "double",
        peg$c160 = { type: "literal", value: "double", description: "\"double\"" },
        peg$c161 = "string",
        peg$c162 = { type: "literal", value: "string", description: "\"string\"" },
        peg$c163 = "binary",
        peg$c164 = { type: "literal", value: "binary", description: "\"binary\"" },
        peg$c165 = "slist",
        peg$c166 = { type: "literal", value: "slist", description: "\"slist\"" },
        peg$c167 = "map",
        peg$c168 = { type: "literal", value: "map", description: "\"map\"" },
        peg$c169 = "<",
        peg$c170 = { type: "literal", value: "<", description: "\"<\"" },
        peg$c171 = ">",
        peg$c172 = { type: "literal", value: ">", description: "\">\"" },
        peg$c173 = function(ft1, ft2, ta) {
            return new ast.MapType(ft1, ft2, ta);
          },
        peg$c174 = "set",
        peg$c175 = { type: "literal", value: "set", description: "\"set\"" },
        peg$c176 = function(ft, ta) {
            return new ast.SetType(ft, ta);
          },
        peg$c177 = "list",
        peg$c178 = { type: "literal", value: "list", description: "\"list\"" },
        peg$c179 = function(ft, ta) {
            return new ast.ListType(ft, ta);
          },
        peg$c180 = "cpp_type",
        peg$c181 = { type: "literal", value: "cpp_type", description: "\"cpp_type\"" },
        peg$c182 = function(entries) {
            var annotations = {};
            for (var index = 0; index < entries.length; index++) {
              annotations[entries[index].name] = entries[index].value;
            }
            return annotations;
          },
        peg$c183 = function(l) { return l },
        peg$c184 = function(name, v) {
            return new ast.TypeAnnotation(name, v);
          },
        peg$c185 = /^[a-zA-Z0-9_.]/,
        peg$c186 = { type: "class", value: "[a-zA-Z0-9_.]", description: "[a-zA-Z0-9_.]" },
        peg$c187 = function(name) {
            return new ast.Identifier(name, line(), column());
          },
        peg$c188 = { type: "other", description: "identifier" },
        peg$c189 = void 0,
        peg$c190 = function(first, rest) {
            return first + rest.join('');
          },
        peg$c191 = "_",
        peg$c192 = { type: "literal", value: "_", description: "\"_\"" },
        peg$c193 = "\u200C",
        peg$c194 = { type: "literal", value: "\u200C", description: "\"\\u200C\"" },
        peg$c195 = "\u200D",
        peg$c196 = { type: "literal", value: "\u200D", description: "\"\\u200D\"" },
        peg$c197 = ".",
        peg$c198 = { type: "literal", value: ".", description: "\".\"" },
        peg$c199 = /^[a-zA-Z]/,
        peg$c200 = { type: "class", value: "[a-zA-Z]", description: "[a-zA-Z]" },
        peg$c201 = function(name) { return new ast.Identifier(name, line(), column()); },
        peg$c202 = /^[A-Za-z_]/,
        peg$c203 = { type: "class", value: "[A-Za-z_]", description: "[A-Za-z_]" },
        peg$c204 = { type: "any", description: "any character" },
        peg$c205 = { type: "other", description: "whitespace" },
        peg$c206 = "\t",
        peg$c207 = { type: "literal", value: "\t", description: "\"\\t\"" },
        peg$c208 = "\x0B",
        peg$c209 = { type: "literal", value: "\x0B", description: "\"\\x0B\"" },
        peg$c210 = "\f",
        peg$c211 = { type: "literal", value: "\f", description: "\"\\f\"" },
        peg$c212 = " ",
        peg$c213 = { type: "literal", value: " ", description: "\" \"" },
        peg$c214 = "\xA0",
        peg$c215 = { type: "literal", value: "\xA0", description: "\"\\xA0\"" },
        peg$c216 = "\uFEFF",
        peg$c217 = { type: "literal", value: "\uFEFF", description: "\"\\uFEFF\"" },
        peg$c218 = /^[\n\r\u2028\u2029]/,
        peg$c219 = { type: "class", value: "[\\n\\r\\u2028\\u2029]", description: "[\\n\\r\\u2028\\u2029]" },
        peg$c220 = { type: "other", description: "end of line" },
        peg$c221 = "\n",
        peg$c222 = { type: "literal", value: "\n", description: "\"\\n\"" },
        peg$c223 = "\r\n",
        peg$c224 = { type: "literal", value: "\r\n", description: "\"\\r\\n\"" },
        peg$c225 = "\r",
        peg$c226 = { type: "literal", value: "\r", description: "\"\\r\"" },
        peg$c227 = "\u2028",
        peg$c228 = { type: "literal", value: "\u2028", description: "\"\\u2028\"" },
        peg$c229 = "\u2029",
        peg$c230 = { type: "literal", value: "\u2029", description: "\"\\u2029\"" },
        peg$c231 = { type: "other", description: "comment" },
        peg$c232 = "/*",
        peg$c233 = { type: "literal", value: "/*", description: "\"/*\"" },
        peg$c234 = "*/",
        peg$c235 = { type: "literal", value: "*/", description: "\"*/\"" },
        peg$c236 = function(c) { return c; },
        peg$c237 = function(comment) {
            return new ast.Comment(comment);
          },
        peg$c238 = "//",
        peg$c239 = { type: "literal", value: "//", description: "\"//\"" },
        peg$c240 = function(sc) { return sc; },
        peg$c241 = "#",
        peg$c242 = { type: "literal", value: "#", description: "\"#\"" },
        peg$c243 = { type: "other", description: "string" },
        peg$c244 = function(str) {
                return new ast.Literal(str)
            },
        peg$c245 = "\"",
        peg$c246 = { type: "literal", value: "\"", description: "\"\\\"\"" },
        peg$c247 = function(chars) {
              return chars.join('');
            },
        peg$c248 = "'",
        peg$c249 = { type: "literal", value: "'", description: "\"'\"" },
        peg$c250 = "\\",
        peg$c251 = { type: "literal", value: "\\", description: "\"\\\\\"" },
        peg$c252 = function() { return text(); },
        peg$c253 = function(sequence) { return sequence; },
        peg$c254 = function() { return ''; },
        peg$c255 = "0",
        peg$c256 = { type: "literal", value: "0", description: "\"0\"" },
        peg$c257 = function() { return '\0'; },
        peg$c258 = "b",
        peg$c259 = { type: "literal", value: "b", description: "\"b\"" },
        peg$c260 = function() { return '\b';   },
        peg$c261 = "f",
        peg$c262 = { type: "literal", value: "f", description: "\"f\"" },
        peg$c263 = function() { return '\f';   },
        peg$c264 = "n",
        peg$c265 = { type: "literal", value: "n", description: "\"n\"" },
        peg$c266 = function() { return '\n';   },
        peg$c267 = "r",
        peg$c268 = { type: "literal", value: "r", description: "\"r\"" },
        peg$c269 = function() { return '\r';   },
        peg$c270 = "t",
        peg$c271 = { type: "literal", value: "t", description: "\"t\"" },
        peg$c272 = function() { return '\t';   },
        peg$c273 = "v",
        peg$c274 = { type: "literal", value: "v", description: "\"v\"" },
        peg$c275 = function() { return '\x0B'; },
        peg$c276 = "x",
        peg$c277 = { type: "literal", value: "x", description: "\"x\"" },
        peg$c278 = "u",
        peg$c279 = { type: "literal", value: "u", description: "\"u\"" },
        peg$c280 = function(digits) {
              return String.fromCharCode(parseInt(digits, 16));
            },
        peg$c281 = { type: "other", description: "hex literal" },
        peg$c282 = "0x",
        peg$c283 = { type: "literal", value: "0x", description: "\"0x\"" },
        peg$c284 = function(digits) {
              return new ast.Literal(parseInt(digits, 16));
            },
        peg$c285 = /^[0-9a-f]/i,
        peg$c286 = { type: "class", value: "[0-9a-f]i", description: "[0-9a-f]i" },
        peg$c287 = { type: "other", description: "number" },
        peg$c288 = /^[+\-]/,
        peg$c289 = { type: "class", value: "[+\\-]", description: "[+\\-]" },
        peg$c290 = function(i) {
            return i;
          },
        peg$c291 = { type: "other", description: "decimal literal" },
        peg$c292 = function() {
            return new ast.Literal(parseFloat(text()));
          },
        peg$c293 = "e",
        peg$c294 = { type: "literal", value: "e", description: "\"e\"" },
        peg$c295 = /^[0-9]/,
        peg$c296 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c297 = /^[1-9]/,
        peg$c298 = { type: "class", value: "[1-9]", description: "[1-9]" },
        peg$c299 = function() {
            return new ast.Literal(parseFloat(text(), 10));
          },
        peg$c300 = "include",
        peg$c301 = { type: "literal", value: "include", description: "\"include\"" },
        peg$c302 = "cpp_include",
        peg$c303 = { type: "literal", value: "cpp_include", description: "\"cpp_include\"" },
        peg$c304 = "namespace",
        peg$c305 = { type: "literal", value: "namespace", description: "\"namespace\"" },
        peg$c306 = "typedef",
        peg$c307 = { type: "literal", value: "typedef", description: "\"typedef\"" },
        peg$c308 = "enum",
        peg$c309 = { type: "literal", value: "enum", description: "\"enum\"" },
        peg$c310 = "senum",
        peg$c311 = { type: "literal", value: "senum", description: "\"senum\"" },
        peg$c312 = "const",
        peg$c313 = { type: "literal", value: "const", description: "\"const\"" },
        peg$c314 = "union",
        peg$c315 = { type: "literal", value: "union", description: "\"union\"" },
        peg$c316 = /^[a-z\xB5\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137-\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148-\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C-\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA-\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9-\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC-\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF-\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F-\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0-\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB-\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE-\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0561-\u0587\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6-\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FC7\u1FD0-\u1FD3\u1FD6-\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6-\u1FF7\u210A\u210E-\u210F\u2113\u212F\u2134\u2139\u213C-\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65-\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73-\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3-\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7FA\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A]/,
        peg$c317 = { type: "class", value: "[a-z\\xB5\\xDF-\\xF6\\xF8-\\xFF\\u0101\\u0103\\u0105\\u0107\\u0109\\u010B\\u010D\\u010F\\u0111\\u0113\\u0115\\u0117\\u0119\\u011B\\u011D\\u011F\\u0121\\u0123\\u0125\\u0127\\u0129\\u012B\\u012D\\u012F\\u0131\\u0133\\u0135\\u0137-\\u0138\\u013A\\u013C\\u013E\\u0140\\u0142\\u0144\\u0146\\u0148-\\u0149\\u014B\\u014D\\u014F\\u0151\\u0153\\u0155\\u0157\\u0159\\u015B\\u015D\\u015F\\u0161\\u0163\\u0165\\u0167\\u0169\\u016B\\u016D\\u016F\\u0171\\u0173\\u0175\\u0177\\u017A\\u017C\\u017E-\\u0180\\u0183\\u0185\\u0188\\u018C-\\u018D\\u0192\\u0195\\u0199-\\u019B\\u019E\\u01A1\\u01A3\\u01A5\\u01A8\\u01AA-\\u01AB\\u01AD\\u01B0\\u01B4\\u01B6\\u01B9-\\u01BA\\u01BD-\\u01BF\\u01C6\\u01C9\\u01CC\\u01CE\\u01D0\\u01D2\\u01D4\\u01D6\\u01D8\\u01DA\\u01DC-\\u01DD\\u01DF\\u01E1\\u01E3\\u01E5\\u01E7\\u01E9\\u01EB\\u01ED\\u01EF-\\u01F0\\u01F3\\u01F5\\u01F9\\u01FB\\u01FD\\u01FF\\u0201\\u0203\\u0205\\u0207\\u0209\\u020B\\u020D\\u020F\\u0211\\u0213\\u0215\\u0217\\u0219\\u021B\\u021D\\u021F\\u0221\\u0223\\u0225\\u0227\\u0229\\u022B\\u022D\\u022F\\u0231\\u0233-\\u0239\\u023C\\u023F-\\u0240\\u0242\\u0247\\u0249\\u024B\\u024D\\u024F-\\u0293\\u0295-\\u02AF\\u0371\\u0373\\u0377\\u037B-\\u037D\\u0390\\u03AC-\\u03CE\\u03D0-\\u03D1\\u03D5-\\u03D7\\u03D9\\u03DB\\u03DD\\u03DF\\u03E1\\u03E3\\u03E5\\u03E7\\u03E9\\u03EB\\u03ED\\u03EF-\\u03F3\\u03F5\\u03F8\\u03FB-\\u03FC\\u0430-\\u045F\\u0461\\u0463\\u0465\\u0467\\u0469\\u046B\\u046D\\u046F\\u0471\\u0473\\u0475\\u0477\\u0479\\u047B\\u047D\\u047F\\u0481\\u048B\\u048D\\u048F\\u0491\\u0493\\u0495\\u0497\\u0499\\u049B\\u049D\\u049F\\u04A1\\u04A3\\u04A5\\u04A7\\u04A9\\u04AB\\u04AD\\u04AF\\u04B1\\u04B3\\u04B5\\u04B7\\u04B9\\u04BB\\u04BD\\u04BF\\u04C2\\u04C4\\u04C6\\u04C8\\u04CA\\u04CC\\u04CE-\\u04CF\\u04D1\\u04D3\\u04D5\\u04D7\\u04D9\\u04DB\\u04DD\\u04DF\\u04E1\\u04E3\\u04E5\\u04E7\\u04E9\\u04EB\\u04ED\\u04EF\\u04F1\\u04F3\\u04F5\\u04F7\\u04F9\\u04FB\\u04FD\\u04FF\\u0501\\u0503\\u0505\\u0507\\u0509\\u050B\\u050D\\u050F\\u0511\\u0513\\u0515\\u0517\\u0519\\u051B\\u051D\\u051F\\u0521\\u0523\\u0525\\u0527\\u0561-\\u0587\\u1D00-\\u1D2B\\u1D6B-\\u1D77\\u1D79-\\u1D9A\\u1E01\\u1E03\\u1E05\\u1E07\\u1E09\\u1E0B\\u1E0D\\u1E0F\\u1E11\\u1E13\\u1E15\\u1E17\\u1E19\\u1E1B\\u1E1D\\u1E1F\\u1E21\\u1E23\\u1E25\\u1E27\\u1E29\\u1E2B\\u1E2D\\u1E2F\\u1E31\\u1E33\\u1E35\\u1E37\\u1E39\\u1E3B\\u1E3D\\u1E3F\\u1E41\\u1E43\\u1E45\\u1E47\\u1E49\\u1E4B\\u1E4D\\u1E4F\\u1E51\\u1E53\\u1E55\\u1E57\\u1E59\\u1E5B\\u1E5D\\u1E5F\\u1E61\\u1E63\\u1E65\\u1E67\\u1E69\\u1E6B\\u1E6D\\u1E6F\\u1E71\\u1E73\\u1E75\\u1E77\\u1E79\\u1E7B\\u1E7D\\u1E7F\\u1E81\\u1E83\\u1E85\\u1E87\\u1E89\\u1E8B\\u1E8D\\u1E8F\\u1E91\\u1E93\\u1E95-\\u1E9D\\u1E9F\\u1EA1\\u1EA3\\u1EA5\\u1EA7\\u1EA9\\u1EAB\\u1EAD\\u1EAF\\u1EB1\\u1EB3\\u1EB5\\u1EB7\\u1EB9\\u1EBB\\u1EBD\\u1EBF\\u1EC1\\u1EC3\\u1EC5\\u1EC7\\u1EC9\\u1ECB\\u1ECD\\u1ECF\\u1ED1\\u1ED3\\u1ED5\\u1ED7\\u1ED9\\u1EDB\\u1EDD\\u1EDF\\u1EE1\\u1EE3\\u1EE5\\u1EE7\\u1EE9\\u1EEB\\u1EED\\u1EEF\\u1EF1\\u1EF3\\u1EF5\\u1EF7\\u1EF9\\u1EFB\\u1EFD\\u1EFF-\\u1F07\\u1F10-\\u1F15\\u1F20-\\u1F27\\u1F30-\\u1F37\\u1F40-\\u1F45\\u1F50-\\u1F57\\u1F60-\\u1F67\\u1F70-\\u1F7D\\u1F80-\\u1F87\\u1F90-\\u1F97\\u1FA0-\\u1FA7\\u1FB0-\\u1FB4\\u1FB6-\\u1FB7\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FC7\\u1FD0-\\u1FD3\\u1FD6-\\u1FD7\\u1FE0-\\u1FE7\\u1FF2-\\u1FF4\\u1FF6-\\u1FF7\\u210A\\u210E-\\u210F\\u2113\\u212F\\u2134\\u2139\\u213C-\\u213D\\u2146-\\u2149\\u214E\\u2184\\u2C30-\\u2C5E\\u2C61\\u2C65-\\u2C66\\u2C68\\u2C6A\\u2C6C\\u2C71\\u2C73-\\u2C74\\u2C76-\\u2C7B\\u2C81\\u2C83\\u2C85\\u2C87\\u2C89\\u2C8B\\u2C8D\\u2C8F\\u2C91\\u2C93\\u2C95\\u2C97\\u2C99\\u2C9B\\u2C9D\\u2C9F\\u2CA1\\u2CA3\\u2CA5\\u2CA7\\u2CA9\\u2CAB\\u2CAD\\u2CAF\\u2CB1\\u2CB3\\u2CB5\\u2CB7\\u2CB9\\u2CBB\\u2CBD\\u2CBF\\u2CC1\\u2CC3\\u2CC5\\u2CC7\\u2CC9\\u2CCB\\u2CCD\\u2CCF\\u2CD1\\u2CD3\\u2CD5\\u2CD7\\u2CD9\\u2CDB\\u2CDD\\u2CDF\\u2CE1\\u2CE3-\\u2CE4\\u2CEC\\u2CEE\\u2CF3\\u2D00-\\u2D25\\u2D27\\u2D2D\\uA641\\uA643\\uA645\\uA647\\uA649\\uA64B\\uA64D\\uA64F\\uA651\\uA653\\uA655\\uA657\\uA659\\uA65B\\uA65D\\uA65F\\uA661\\uA663\\uA665\\uA667\\uA669\\uA66B\\uA66D\\uA681\\uA683\\uA685\\uA687\\uA689\\uA68B\\uA68D\\uA68F\\uA691\\uA693\\uA695\\uA697\\uA723\\uA725\\uA727\\uA729\\uA72B\\uA72D\\uA72F-\\uA731\\uA733\\uA735\\uA737\\uA739\\uA73B\\uA73D\\uA73F\\uA741\\uA743\\uA745\\uA747\\uA749\\uA74B\\uA74D\\uA74F\\uA751\\uA753\\uA755\\uA757\\uA759\\uA75B\\uA75D\\uA75F\\uA761\\uA763\\uA765\\uA767\\uA769\\uA76B\\uA76D\\uA76F\\uA771-\\uA778\\uA77A\\uA77C\\uA77F\\uA781\\uA783\\uA785\\uA787\\uA78C\\uA78E\\uA791\\uA793\\uA7A1\\uA7A3\\uA7A5\\uA7A7\\uA7A9\\uA7FA\\uFB00-\\uFB06\\uFB13-\\uFB17\\uFF41-\\uFF5A]", description: "[a-z\\xB5\\xDF-\\xF6\\xF8-\\xFF\\u0101\\u0103\\u0105\\u0107\\u0109\\u010B\\u010D\\u010F\\u0111\\u0113\\u0115\\u0117\\u0119\\u011B\\u011D\\u011F\\u0121\\u0123\\u0125\\u0127\\u0129\\u012B\\u012D\\u012F\\u0131\\u0133\\u0135\\u0137-\\u0138\\u013A\\u013C\\u013E\\u0140\\u0142\\u0144\\u0146\\u0148-\\u0149\\u014B\\u014D\\u014F\\u0151\\u0153\\u0155\\u0157\\u0159\\u015B\\u015D\\u015F\\u0161\\u0163\\u0165\\u0167\\u0169\\u016B\\u016D\\u016F\\u0171\\u0173\\u0175\\u0177\\u017A\\u017C\\u017E-\\u0180\\u0183\\u0185\\u0188\\u018C-\\u018D\\u0192\\u0195\\u0199-\\u019B\\u019E\\u01A1\\u01A3\\u01A5\\u01A8\\u01AA-\\u01AB\\u01AD\\u01B0\\u01B4\\u01B6\\u01B9-\\u01BA\\u01BD-\\u01BF\\u01C6\\u01C9\\u01CC\\u01CE\\u01D0\\u01D2\\u01D4\\u01D6\\u01D8\\u01DA\\u01DC-\\u01DD\\u01DF\\u01E1\\u01E3\\u01E5\\u01E7\\u01E9\\u01EB\\u01ED\\u01EF-\\u01F0\\u01F3\\u01F5\\u01F9\\u01FB\\u01FD\\u01FF\\u0201\\u0203\\u0205\\u0207\\u0209\\u020B\\u020D\\u020F\\u0211\\u0213\\u0215\\u0217\\u0219\\u021B\\u021D\\u021F\\u0221\\u0223\\u0225\\u0227\\u0229\\u022B\\u022D\\u022F\\u0231\\u0233-\\u0239\\u023C\\u023F-\\u0240\\u0242\\u0247\\u0249\\u024B\\u024D\\u024F-\\u0293\\u0295-\\u02AF\\u0371\\u0373\\u0377\\u037B-\\u037D\\u0390\\u03AC-\\u03CE\\u03D0-\\u03D1\\u03D5-\\u03D7\\u03D9\\u03DB\\u03DD\\u03DF\\u03E1\\u03E3\\u03E5\\u03E7\\u03E9\\u03EB\\u03ED\\u03EF-\\u03F3\\u03F5\\u03F8\\u03FB-\\u03FC\\u0430-\\u045F\\u0461\\u0463\\u0465\\u0467\\u0469\\u046B\\u046D\\u046F\\u0471\\u0473\\u0475\\u0477\\u0479\\u047B\\u047D\\u047F\\u0481\\u048B\\u048D\\u048F\\u0491\\u0493\\u0495\\u0497\\u0499\\u049B\\u049D\\u049F\\u04A1\\u04A3\\u04A5\\u04A7\\u04A9\\u04AB\\u04AD\\u04AF\\u04B1\\u04B3\\u04B5\\u04B7\\u04B9\\u04BB\\u04BD\\u04BF\\u04C2\\u04C4\\u04C6\\u04C8\\u04CA\\u04CC\\u04CE-\\u04CF\\u04D1\\u04D3\\u04D5\\u04D7\\u04D9\\u04DB\\u04DD\\u04DF\\u04E1\\u04E3\\u04E5\\u04E7\\u04E9\\u04EB\\u04ED\\u04EF\\u04F1\\u04F3\\u04F5\\u04F7\\u04F9\\u04FB\\u04FD\\u04FF\\u0501\\u0503\\u0505\\u0507\\u0509\\u050B\\u050D\\u050F\\u0511\\u0513\\u0515\\u0517\\u0519\\u051B\\u051D\\u051F\\u0521\\u0523\\u0525\\u0527\\u0561-\\u0587\\u1D00-\\u1D2B\\u1D6B-\\u1D77\\u1D79-\\u1D9A\\u1E01\\u1E03\\u1E05\\u1E07\\u1E09\\u1E0B\\u1E0D\\u1E0F\\u1E11\\u1E13\\u1E15\\u1E17\\u1E19\\u1E1B\\u1E1D\\u1E1F\\u1E21\\u1E23\\u1E25\\u1E27\\u1E29\\u1E2B\\u1E2D\\u1E2F\\u1E31\\u1E33\\u1E35\\u1E37\\u1E39\\u1E3B\\u1E3D\\u1E3F\\u1E41\\u1E43\\u1E45\\u1E47\\u1E49\\u1E4B\\u1E4D\\u1E4F\\u1E51\\u1E53\\u1E55\\u1E57\\u1E59\\u1E5B\\u1E5D\\u1E5F\\u1E61\\u1E63\\u1E65\\u1E67\\u1E69\\u1E6B\\u1E6D\\u1E6F\\u1E71\\u1E73\\u1E75\\u1E77\\u1E79\\u1E7B\\u1E7D\\u1E7F\\u1E81\\u1E83\\u1E85\\u1E87\\u1E89\\u1E8B\\u1E8D\\u1E8F\\u1E91\\u1E93\\u1E95-\\u1E9D\\u1E9F\\u1EA1\\u1EA3\\u1EA5\\u1EA7\\u1EA9\\u1EAB\\u1EAD\\u1EAF\\u1EB1\\u1EB3\\u1EB5\\u1EB7\\u1EB9\\u1EBB\\u1EBD\\u1EBF\\u1EC1\\u1EC3\\u1EC5\\u1EC7\\u1EC9\\u1ECB\\u1ECD\\u1ECF\\u1ED1\\u1ED3\\u1ED5\\u1ED7\\u1ED9\\u1EDB\\u1EDD\\u1EDF\\u1EE1\\u1EE3\\u1EE5\\u1EE7\\u1EE9\\u1EEB\\u1EED\\u1EEF\\u1EF1\\u1EF3\\u1EF5\\u1EF7\\u1EF9\\u1EFB\\u1EFD\\u1EFF-\\u1F07\\u1F10-\\u1F15\\u1F20-\\u1F27\\u1F30-\\u1F37\\u1F40-\\u1F45\\u1F50-\\u1F57\\u1F60-\\u1F67\\u1F70-\\u1F7D\\u1F80-\\u1F87\\u1F90-\\u1F97\\u1FA0-\\u1FA7\\u1FB0-\\u1FB4\\u1FB6-\\u1FB7\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FC7\\u1FD0-\\u1FD3\\u1FD6-\\u1FD7\\u1FE0-\\u1FE7\\u1FF2-\\u1FF4\\u1FF6-\\u1FF7\\u210A\\u210E-\\u210F\\u2113\\u212F\\u2134\\u2139\\u213C-\\u213D\\u2146-\\u2149\\u214E\\u2184\\u2C30-\\u2C5E\\u2C61\\u2C65-\\u2C66\\u2C68\\u2C6A\\u2C6C\\u2C71\\u2C73-\\u2C74\\u2C76-\\u2C7B\\u2C81\\u2C83\\u2C85\\u2C87\\u2C89\\u2C8B\\u2C8D\\u2C8F\\u2C91\\u2C93\\u2C95\\u2C97\\u2C99\\u2C9B\\u2C9D\\u2C9F\\u2CA1\\u2CA3\\u2CA5\\u2CA7\\u2CA9\\u2CAB\\u2CAD\\u2CAF\\u2CB1\\u2CB3\\u2CB5\\u2CB7\\u2CB9\\u2CBB\\u2CBD\\u2CBF\\u2CC1\\u2CC3\\u2CC5\\u2CC7\\u2CC9\\u2CCB\\u2CCD\\u2CCF\\u2CD1\\u2CD3\\u2CD5\\u2CD7\\u2CD9\\u2CDB\\u2CDD\\u2CDF\\u2CE1\\u2CE3-\\u2CE4\\u2CEC\\u2CEE\\u2CF3\\u2D00-\\u2D25\\u2D27\\u2D2D\\uA641\\uA643\\uA645\\uA647\\uA649\\uA64B\\uA64D\\uA64F\\uA651\\uA653\\uA655\\uA657\\uA659\\uA65B\\uA65D\\uA65F\\uA661\\uA663\\uA665\\uA667\\uA669\\uA66B\\uA66D\\uA681\\uA683\\uA685\\uA687\\uA689\\uA68B\\uA68D\\uA68F\\uA691\\uA693\\uA695\\uA697\\uA723\\uA725\\uA727\\uA729\\uA72B\\uA72D\\uA72F-\\uA731\\uA733\\uA735\\uA737\\uA739\\uA73B\\uA73D\\uA73F\\uA741\\uA743\\uA745\\uA747\\uA749\\uA74B\\uA74D\\uA74F\\uA751\\uA753\\uA755\\uA757\\uA759\\uA75B\\uA75D\\uA75F\\uA761\\uA763\\uA765\\uA767\\uA769\\uA76B\\uA76D\\uA76F\\uA771-\\uA778\\uA77A\\uA77C\\uA77F\\uA781\\uA783\\uA785\\uA787\\uA78C\\uA78E\\uA791\\uA793\\uA7A1\\uA7A3\\uA7A5\\uA7A7\\uA7A9\\uA7FA\\uFB00-\\uFB06\\uFB13-\\uFB17\\uFF41-\\uFF5A]" },
        peg$c318 = /^[\u02B0-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0374\u037A\u0559\u0640\u06E5-\u06E6\u07F4-\u07F5\u07FA\u081A\u0824\u0828\u0971\u0E46\u0EC6\u10FC\u17D7\u1843\u1AA7\u1C78-\u1C7D\u1D2C-\u1D6A\u1D78\u1D9B-\u1DBF\u2071\u207F\u2090-\u209C\u2C7C-\u2C7D\u2D6F\u2E2F\u3005\u3031-\u3035\u303B\u309D-\u309E\u30FC-\u30FE\uA015\uA4F8-\uA4FD\uA60C\uA67F\uA717-\uA71F\uA770\uA788\uA7F8-\uA7F9\uA9CF\uAA70\uAADD\uAAF3-\uAAF4\uFF70\uFF9E-\uFF9F]/,
        peg$c319 = { type: "class", value: "[\\u02B0-\\u02C1\\u02C6-\\u02D1\\u02E0-\\u02E4\\u02EC\\u02EE\\u0374\\u037A\\u0559\\u0640\\u06E5-\\u06E6\\u07F4-\\u07F5\\u07FA\\u081A\\u0824\\u0828\\u0971\\u0E46\\u0EC6\\u10FC\\u17D7\\u1843\\u1AA7\\u1C78-\\u1C7D\\u1D2C-\\u1D6A\\u1D78\\u1D9B-\\u1DBF\\u2071\\u207F\\u2090-\\u209C\\u2C7C-\\u2C7D\\u2D6F\\u2E2F\\u3005\\u3031-\\u3035\\u303B\\u309D-\\u309E\\u30FC-\\u30FE\\uA015\\uA4F8-\\uA4FD\\uA60C\\uA67F\\uA717-\\uA71F\\uA770\\uA788\\uA7F8-\\uA7F9\\uA9CF\\uAA70\\uAADD\\uAAF3-\\uAAF4\\uFF70\\uFF9E-\\uFF9F]", description: "[\\u02B0-\\u02C1\\u02C6-\\u02D1\\u02E0-\\u02E4\\u02EC\\u02EE\\u0374\\u037A\\u0559\\u0640\\u06E5-\\u06E6\\u07F4-\\u07F5\\u07FA\\u081A\\u0824\\u0828\\u0971\\u0E46\\u0EC6\\u10FC\\u17D7\\u1843\\u1AA7\\u1C78-\\u1C7D\\u1D2C-\\u1D6A\\u1D78\\u1D9B-\\u1DBF\\u2071\\u207F\\u2090-\\u209C\\u2C7C-\\u2C7D\\u2D6F\\u2E2F\\u3005\\u3031-\\u3035\\u303B\\u309D-\\u309E\\u30FC-\\u30FE\\uA015\\uA4F8-\\uA4FD\\uA60C\\uA67F\\uA717-\\uA71F\\uA770\\uA788\\uA7F8-\\uA7F9\\uA9CF\\uAA70\\uAADD\\uAAF3-\\uAAF4\\uFF70\\uFF9E-\\uFF9F]" },
        peg$c320 = /^[\xAA\xBA\u01BB\u01C0-\u01C3\u0294\u05D0-\u05EA\u05F0-\u05F2\u0620-\u063F\u0641-\u064A\u066E-\u066F\u0671-\u06D3\u06D5\u06EE-\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u0800-\u0815\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0972-\u0977\u0979-\u097F\u0985-\u098C\u098F-\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC-\u09DD\u09DF-\u09E1\u09F0-\u09F1\u0A05-\u0A0A\u0A0F-\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32-\u0A33\u0A35-\u0A36\u0A38-\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2-\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0-\u0AE1\u0B05-\u0B0C\u0B0F-\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32-\u0B33\u0B35-\u0B39\u0B3D\u0B5C-\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99-\u0B9A\u0B9C\u0B9E-\u0B9F\u0BA3-\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58-\u0C59\u0C60-\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0-\u0CE1\u0CF1-\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32-\u0E33\u0E40-\u0E45\u0E81-\u0E82\u0E84\u0E87-\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA-\u0EAB\u0EAD-\u0EB0\u0EB2-\u0EB3\u0EBD\u0EC0-\u0EC4\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065-\u1066\u106E-\u1070\u1075-\u1081\u108E\u10D0-\u10FA\u10FD-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17DC\u1820-\u1842\u1844-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE-\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C77\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5-\u1CF6\u2135-\u2138\u2D30-\u2D67\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3006\u303C\u3041-\u3096\u309F\u30A1-\u30FA\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA014\uA016-\uA48C\uA4D0-\uA4F7\uA500-\uA60B\uA610-\uA61F\uA62A-\uA62B\uA66E\uA6A0-\uA6E5\uA7FB-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA6F\uAA71-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5-\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADC\uAAE0-\uAAEA\uAAF2\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40-\uFB41\uFB43-\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF66-\uFF6F\uFF71-\uFF9D\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
        peg$c321 = { type: "class", value: "[\\xAA\\xBA\\u01BB\\u01C0-\\u01C3\\u0294\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0620-\\u063F\\u0641-\\u064A\\u066E-\\u066F\\u0671-\\u06D3\\u06D5\\u06EE-\\u06EF\\u06FA-\\u06FC\\u06FF\\u0710\\u0712-\\u072F\\u074D-\\u07A5\\u07B1\\u07CA-\\u07EA\\u0800-\\u0815\\u0840-\\u0858\\u08A0\\u08A2-\\u08AC\\u0904-\\u0939\\u093D\\u0950\\u0958-\\u0961\\u0972-\\u0977\\u0979-\\u097F\\u0985-\\u098C\\u098F-\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BD\\u09CE\\u09DC-\\u09DD\\u09DF-\\u09E1\\u09F0-\\u09F1\\u0A05-\\u0A0A\\u0A0F-\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32-\\u0A33\\u0A35-\\u0A36\\u0A38-\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2-\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AD0\\u0AE0-\\u0AE1\\u0B05-\\u0B0C\\u0B0F-\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32-\\u0B33\\u0B35-\\u0B39\\u0B3D\\u0B5C-\\u0B5D\\u0B5F-\\u0B61\\u0B71\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99-\\u0B9A\\u0B9C\\u0B9E-\\u0B9F\\u0BA3-\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB9\\u0BD0\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3D\\u0C58-\\u0C59\\u0C60-\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBD\\u0CDE\\u0CE0-\\u0CE1\\u0CF1-\\u0CF2\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D3A\\u0D3D\\u0D4E\\u0D60-\\u0D61\\u0D7A-\\u0D7F\\u0D85-\\u0D96\\u0D9A-\\u0DB1\\u0DB3-\\u0DBB\\u0DBD\\u0DC0-\\u0DC6\\u0E01-\\u0E30\\u0E32-\\u0E33\\u0E40-\\u0E45\\u0E81-\\u0E82\\u0E84\\u0E87-\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA-\\u0EAB\\u0EAD-\\u0EB0\\u0EB2-\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0EDC-\\u0EDF\\u0F00\\u0F40-\\u0F47\\u0F49-\\u0F6C\\u0F88-\\u0F8C\\u1000-\\u102A\\u103F\\u1050-\\u1055\\u105A-\\u105D\\u1061\\u1065-\\u1066\\u106E-\\u1070\\u1075-\\u1081\\u108E\\u10D0-\\u10FA\\u10FD-\\u1248\\u124A-\\u124D\\u1250-\\u1256\\u1258\\u125A-\\u125D\\u1260-\\u1288\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5\\u12B8-\\u12BE\\u12C0\\u12C2-\\u12C5\\u12C8-\\u12D6\\u12D8-\\u1310\\u1312-\\u1315\\u1318-\\u135A\\u1380-\\u138F\\u13A0-\\u13F4\\u1401-\\u166C\\u166F-\\u167F\\u1681-\\u169A\\u16A0-\\u16EA\\u1700-\\u170C\\u170E-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176C\\u176E-\\u1770\\u1780-\\u17B3\\u17DC\\u1820-\\u1842\\u1844-\\u1877\\u1880-\\u18A8\\u18AA\\u18B0-\\u18F5\\u1900-\\u191C\\u1950-\\u196D\\u1970-\\u1974\\u1980-\\u19AB\\u19C1-\\u19C7\\u1A00-\\u1A16\\u1A20-\\u1A54\\u1B05-\\u1B33\\u1B45-\\u1B4B\\u1B83-\\u1BA0\\u1BAE-\\u1BAF\\u1BBA-\\u1BE5\\u1C00-\\u1C23\\u1C4D-\\u1C4F\\u1C5A-\\u1C77\\u1CE9-\\u1CEC\\u1CEE-\\u1CF1\\u1CF5-\\u1CF6\\u2135-\\u2138\\u2D30-\\u2D67\\u2D80-\\u2D96\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE\\u2DB0-\\u2DB6\\u2DB8-\\u2DBE\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE\\u2DD0-\\u2DD6\\u2DD8-\\u2DDE\\u3006\\u303C\\u3041-\\u3096\\u309F\\u30A1-\\u30FA\\u30FF\\u3105-\\u312D\\u3131-\\u318E\\u31A0-\\u31BA\\u31F0-\\u31FF\\u3400-\\u4DB5\\u4E00-\\u9FCC\\uA000-\\uA014\\uA016-\\uA48C\\uA4D0-\\uA4F7\\uA500-\\uA60B\\uA610-\\uA61F\\uA62A-\\uA62B\\uA66E\\uA6A0-\\uA6E5\\uA7FB-\\uA801\\uA803-\\uA805\\uA807-\\uA80A\\uA80C-\\uA822\\uA840-\\uA873\\uA882-\\uA8B3\\uA8F2-\\uA8F7\\uA8FB\\uA90A-\\uA925\\uA930-\\uA946\\uA960-\\uA97C\\uA984-\\uA9B2\\uAA00-\\uAA28\\uAA40-\\uAA42\\uAA44-\\uAA4B\\uAA60-\\uAA6F\\uAA71-\\uAA76\\uAA7A\\uAA80-\\uAAAF\\uAAB1\\uAAB5-\\uAAB6\\uAAB9-\\uAABD\\uAAC0\\uAAC2\\uAADB-\\uAADC\\uAAE0-\\uAAEA\\uAAF2\\uAB01-\\uAB06\\uAB09-\\uAB0E\\uAB11-\\uAB16\\uAB20-\\uAB26\\uAB28-\\uAB2E\\uABC0-\\uABE2\\uAC00-\\uD7A3\\uD7B0-\\uD7C6\\uD7CB-\\uD7FB\\uF900-\\uFA6D\\uFA70-\\uFAD9\\uFB1D\\uFB1F-\\uFB28\\uFB2A-\\uFB36\\uFB38-\\uFB3C\\uFB3E\\uFB40-\\uFB41\\uFB43-\\uFB44\\uFB46-\\uFBB1\\uFBD3-\\uFD3D\\uFD50-\\uFD8F\\uFD92-\\uFDC7\\uFDF0-\\uFDFB\\uFE70-\\uFE74\\uFE76-\\uFEFC\\uFF66-\\uFF6F\\uFF71-\\uFF9D\\uFFA0-\\uFFBE\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC]", description: "[\\xAA\\xBA\\u01BB\\u01C0-\\u01C3\\u0294\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0620-\\u063F\\u0641-\\u064A\\u066E-\\u066F\\u0671-\\u06D3\\u06D5\\u06EE-\\u06EF\\u06FA-\\u06FC\\u06FF\\u0710\\u0712-\\u072F\\u074D-\\u07A5\\u07B1\\u07CA-\\u07EA\\u0800-\\u0815\\u0840-\\u0858\\u08A0\\u08A2-\\u08AC\\u0904-\\u0939\\u093D\\u0950\\u0958-\\u0961\\u0972-\\u0977\\u0979-\\u097F\\u0985-\\u098C\\u098F-\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BD\\u09CE\\u09DC-\\u09DD\\u09DF-\\u09E1\\u09F0-\\u09F1\\u0A05-\\u0A0A\\u0A0F-\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32-\\u0A33\\u0A35-\\u0A36\\u0A38-\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2-\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AD0\\u0AE0-\\u0AE1\\u0B05-\\u0B0C\\u0B0F-\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32-\\u0B33\\u0B35-\\u0B39\\u0B3D\\u0B5C-\\u0B5D\\u0B5F-\\u0B61\\u0B71\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99-\\u0B9A\\u0B9C\\u0B9E-\\u0B9F\\u0BA3-\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB9\\u0BD0\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3D\\u0C58-\\u0C59\\u0C60-\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBD\\u0CDE\\u0CE0-\\u0CE1\\u0CF1-\\u0CF2\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D3A\\u0D3D\\u0D4E\\u0D60-\\u0D61\\u0D7A-\\u0D7F\\u0D85-\\u0D96\\u0D9A-\\u0DB1\\u0DB3-\\u0DBB\\u0DBD\\u0DC0-\\u0DC6\\u0E01-\\u0E30\\u0E32-\\u0E33\\u0E40-\\u0E45\\u0E81-\\u0E82\\u0E84\\u0E87-\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA-\\u0EAB\\u0EAD-\\u0EB0\\u0EB2-\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0EDC-\\u0EDF\\u0F00\\u0F40-\\u0F47\\u0F49-\\u0F6C\\u0F88-\\u0F8C\\u1000-\\u102A\\u103F\\u1050-\\u1055\\u105A-\\u105D\\u1061\\u1065-\\u1066\\u106E-\\u1070\\u1075-\\u1081\\u108E\\u10D0-\\u10FA\\u10FD-\\u1248\\u124A-\\u124D\\u1250-\\u1256\\u1258\\u125A-\\u125D\\u1260-\\u1288\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5\\u12B8-\\u12BE\\u12C0\\u12C2-\\u12C5\\u12C8-\\u12D6\\u12D8-\\u1310\\u1312-\\u1315\\u1318-\\u135A\\u1380-\\u138F\\u13A0-\\u13F4\\u1401-\\u166C\\u166F-\\u167F\\u1681-\\u169A\\u16A0-\\u16EA\\u1700-\\u170C\\u170E-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176C\\u176E-\\u1770\\u1780-\\u17B3\\u17DC\\u1820-\\u1842\\u1844-\\u1877\\u1880-\\u18A8\\u18AA\\u18B0-\\u18F5\\u1900-\\u191C\\u1950-\\u196D\\u1970-\\u1974\\u1980-\\u19AB\\u19C1-\\u19C7\\u1A00-\\u1A16\\u1A20-\\u1A54\\u1B05-\\u1B33\\u1B45-\\u1B4B\\u1B83-\\u1BA0\\u1BAE-\\u1BAF\\u1BBA-\\u1BE5\\u1C00-\\u1C23\\u1C4D-\\u1C4F\\u1C5A-\\u1C77\\u1CE9-\\u1CEC\\u1CEE-\\u1CF1\\u1CF5-\\u1CF6\\u2135-\\u2138\\u2D30-\\u2D67\\u2D80-\\u2D96\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE\\u2DB0-\\u2DB6\\u2DB8-\\u2DBE\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE\\u2DD0-\\u2DD6\\u2DD8-\\u2DDE\\u3006\\u303C\\u3041-\\u3096\\u309F\\u30A1-\\u30FA\\u30FF\\u3105-\\u312D\\u3131-\\u318E\\u31A0-\\u31BA\\u31F0-\\u31FF\\u3400-\\u4DB5\\u4E00-\\u9FCC\\uA000-\\uA014\\uA016-\\uA48C\\uA4D0-\\uA4F7\\uA500-\\uA60B\\uA610-\\uA61F\\uA62A-\\uA62B\\uA66E\\uA6A0-\\uA6E5\\uA7FB-\\uA801\\uA803-\\uA805\\uA807-\\uA80A\\uA80C-\\uA822\\uA840-\\uA873\\uA882-\\uA8B3\\uA8F2-\\uA8F7\\uA8FB\\uA90A-\\uA925\\uA930-\\uA946\\uA960-\\uA97C\\uA984-\\uA9B2\\uAA00-\\uAA28\\uAA40-\\uAA42\\uAA44-\\uAA4B\\uAA60-\\uAA6F\\uAA71-\\uAA76\\uAA7A\\uAA80-\\uAAAF\\uAAB1\\uAAB5-\\uAAB6\\uAAB9-\\uAABD\\uAAC0\\uAAC2\\uAADB-\\uAADC\\uAAE0-\\uAAEA\\uAAF2\\uAB01-\\uAB06\\uAB09-\\uAB0E\\uAB11-\\uAB16\\uAB20-\\uAB26\\uAB28-\\uAB2E\\uABC0-\\uABE2\\uAC00-\\uD7A3\\uD7B0-\\uD7C6\\uD7CB-\\uD7FB\\uF900-\\uFA6D\\uFA70-\\uFAD9\\uFB1D\\uFB1F-\\uFB28\\uFB2A-\\uFB36\\uFB38-\\uFB3C\\uFB3E\\uFB40-\\uFB41\\uFB43-\\uFB44\\uFB46-\\uFBB1\\uFBD3-\\uFD3D\\uFD50-\\uFD8F\\uFD92-\\uFDC7\\uFDF0-\\uFDFB\\uFE70-\\uFE74\\uFE76-\\uFEFC\\uFF66-\\uFF6F\\uFF71-\\uFF9D\\uFFA0-\\uFFBE\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC]" },
        peg$c322 = /^[\u01C5\u01C8\u01CB\u01F2\u1F88-\u1F8F\u1F98-\u1F9F\u1FA8-\u1FAF\u1FBC\u1FCC\u1FFC]/,
        peg$c323 = { type: "class", value: "[\\u01C5\\u01C8\\u01CB\\u01F2\\u1F88-\\u1F8F\\u1F98-\\u1F9F\\u1FA8-\\u1FAF\\u1FBC\\u1FCC\\u1FFC]", description: "[\\u01C5\\u01C8\\u01CB\\u01F2\\u1F88-\\u1F8F\\u1F98-\\u1F9F\\u1FA8-\\u1FAF\\u1FBC\\u1FCC\\u1FFC]" },
        peg$c324 = /^[A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178-\u0179\u017B\u017D\u0181-\u0182\u0184\u0186-\u0187\u0189-\u018B\u018E-\u0191\u0193-\u0194\u0196-\u0198\u019C-\u019D\u019F-\u01A0\u01A2\u01A4\u01A6-\u01A7\u01A9\u01AC\u01AE-\u01AF\u01B1-\u01B3\u01B5\u01B7-\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A-\u023B\u023D-\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u0386\u0388-\u038A\u038C\u038E-\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9-\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0-\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E-\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D-\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA\uFF21-\uFF3A]/,
        peg$c325 = { type: "class", value: "[A-Z\\xC0-\\xD6\\xD8-\\xDE\\u0100\\u0102\\u0104\\u0106\\u0108\\u010A\\u010C\\u010E\\u0110\\u0112\\u0114\\u0116\\u0118\\u011A\\u011C\\u011E\\u0120\\u0122\\u0124\\u0126\\u0128\\u012A\\u012C\\u012E\\u0130\\u0132\\u0134\\u0136\\u0139\\u013B\\u013D\\u013F\\u0141\\u0143\\u0145\\u0147\\u014A\\u014C\\u014E\\u0150\\u0152\\u0154\\u0156\\u0158\\u015A\\u015C\\u015E\\u0160\\u0162\\u0164\\u0166\\u0168\\u016A\\u016C\\u016E\\u0170\\u0172\\u0174\\u0176\\u0178-\\u0179\\u017B\\u017D\\u0181-\\u0182\\u0184\\u0186-\\u0187\\u0189-\\u018B\\u018E-\\u0191\\u0193-\\u0194\\u0196-\\u0198\\u019C-\\u019D\\u019F-\\u01A0\\u01A2\\u01A4\\u01A6-\\u01A7\\u01A9\\u01AC\\u01AE-\\u01AF\\u01B1-\\u01B3\\u01B5\\u01B7-\\u01B8\\u01BC\\u01C4\\u01C7\\u01CA\\u01CD\\u01CF\\u01D1\\u01D3\\u01D5\\u01D7\\u01D9\\u01DB\\u01DE\\u01E0\\u01E2\\u01E4\\u01E6\\u01E8\\u01EA\\u01EC\\u01EE\\u01F1\\u01F4\\u01F6-\\u01F8\\u01FA\\u01FC\\u01FE\\u0200\\u0202\\u0204\\u0206\\u0208\\u020A\\u020C\\u020E\\u0210\\u0212\\u0214\\u0216\\u0218\\u021A\\u021C\\u021E\\u0220\\u0222\\u0224\\u0226\\u0228\\u022A\\u022C\\u022E\\u0230\\u0232\\u023A-\\u023B\\u023D-\\u023E\\u0241\\u0243-\\u0246\\u0248\\u024A\\u024C\\u024E\\u0370\\u0372\\u0376\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u038F\\u0391-\\u03A1\\u03A3-\\u03AB\\u03CF\\u03D2-\\u03D4\\u03D8\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2\\u03E4\\u03E6\\u03E8\\u03EA\\u03EC\\u03EE\\u03F4\\u03F7\\u03F9-\\u03FA\\u03FD-\\u042F\\u0460\\u0462\\u0464\\u0466\\u0468\\u046A\\u046C\\u046E\\u0470\\u0472\\u0474\\u0476\\u0478\\u047A\\u047C\\u047E\\u0480\\u048A\\u048C\\u048E\\u0490\\u0492\\u0494\\u0496\\u0498\\u049A\\u049C\\u049E\\u04A0\\u04A2\\u04A4\\u04A6\\u04A8\\u04AA\\u04AC\\u04AE\\u04B0\\u04B2\\u04B4\\u04B6\\u04B8\\u04BA\\u04BC\\u04BE\\u04C0-\\u04C1\\u04C3\\u04C5\\u04C7\\u04C9\\u04CB\\u04CD\\u04D0\\u04D2\\u04D4\\u04D6\\u04D8\\u04DA\\u04DC\\u04DE\\u04E0\\u04E2\\u04E4\\u04E6\\u04E8\\u04EA\\u04EC\\u04EE\\u04F0\\u04F2\\u04F4\\u04F6\\u04F8\\u04FA\\u04FC\\u04FE\\u0500\\u0502\\u0504\\u0506\\u0508\\u050A\\u050C\\u050E\\u0510\\u0512\\u0514\\u0516\\u0518\\u051A\\u051C\\u051E\\u0520\\u0522\\u0524\\u0526\\u0531-\\u0556\\u10A0-\\u10C5\\u10C7\\u10CD\\u1E00\\u1E02\\u1E04\\u1E06\\u1E08\\u1E0A\\u1E0C\\u1E0E\\u1E10\\u1E12\\u1E14\\u1E16\\u1E18\\u1E1A\\u1E1C\\u1E1E\\u1E20\\u1E22\\u1E24\\u1E26\\u1E28\\u1E2A\\u1E2C\\u1E2E\\u1E30\\u1E32\\u1E34\\u1E36\\u1E38\\u1E3A\\u1E3C\\u1E3E\\u1E40\\u1E42\\u1E44\\u1E46\\u1E48\\u1E4A\\u1E4C\\u1E4E\\u1E50\\u1E52\\u1E54\\u1E56\\u1E58\\u1E5A\\u1E5C\\u1E5E\\u1E60\\u1E62\\u1E64\\u1E66\\u1E68\\u1E6A\\u1E6C\\u1E6E\\u1E70\\u1E72\\u1E74\\u1E76\\u1E78\\u1E7A\\u1E7C\\u1E7E\\u1E80\\u1E82\\u1E84\\u1E86\\u1E88\\u1E8A\\u1E8C\\u1E8E\\u1E90\\u1E92\\u1E94\\u1E9E\\u1EA0\\u1EA2\\u1EA4\\u1EA6\\u1EA8\\u1EAA\\u1EAC\\u1EAE\\u1EB0\\u1EB2\\u1EB4\\u1EB6\\u1EB8\\u1EBA\\u1EBC\\u1EBE\\u1EC0\\u1EC2\\u1EC4\\u1EC6\\u1EC8\\u1ECA\\u1ECC\\u1ECE\\u1ED0\\u1ED2\\u1ED4\\u1ED6\\u1ED8\\u1EDA\\u1EDC\\u1EDE\\u1EE0\\u1EE2\\u1EE4\\u1EE6\\u1EE8\\u1EEA\\u1EEC\\u1EEE\\u1EF0\\u1EF2\\u1EF4\\u1EF6\\u1EF8\\u1EFA\\u1EFC\\u1EFE\\u1F08-\\u1F0F\\u1F18-\\u1F1D\\u1F28-\\u1F2F\\u1F38-\\u1F3F\\u1F48-\\u1F4D\\u1F59\\u1F5B\\u1F5D\\u1F5F\\u1F68-\\u1F6F\\u1FB8-\\u1FBB\\u1FC8-\\u1FCB\\u1FD8-\\u1FDB\\u1FE8-\\u1FEC\\u1FF8-\\u1FFB\\u2102\\u2107\\u210B-\\u210D\\u2110-\\u2112\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128\\u212A-\\u212D\\u2130-\\u2133\\u213E-\\u213F\\u2145\\u2183\\u2C00-\\u2C2E\\u2C60\\u2C62-\\u2C64\\u2C67\\u2C69\\u2C6B\\u2C6D-\\u2C70\\u2C72\\u2C75\\u2C7E-\\u2C80\\u2C82\\u2C84\\u2C86\\u2C88\\u2C8A\\u2C8C\\u2C8E\\u2C90\\u2C92\\u2C94\\u2C96\\u2C98\\u2C9A\\u2C9C\\u2C9E\\u2CA0\\u2CA2\\u2CA4\\u2CA6\\u2CA8\\u2CAA\\u2CAC\\u2CAE\\u2CB0\\u2CB2\\u2CB4\\u2CB6\\u2CB8\\u2CBA\\u2CBC\\u2CBE\\u2CC0\\u2CC2\\u2CC4\\u2CC6\\u2CC8\\u2CCA\\u2CCC\\u2CCE\\u2CD0\\u2CD2\\u2CD4\\u2CD6\\u2CD8\\u2CDA\\u2CDC\\u2CDE\\u2CE0\\u2CE2\\u2CEB\\u2CED\\u2CF2\\uA640\\uA642\\uA644\\uA646\\uA648\\uA64A\\uA64C\\uA64E\\uA650\\uA652\\uA654\\uA656\\uA658\\uA65A\\uA65C\\uA65E\\uA660\\uA662\\uA664\\uA666\\uA668\\uA66A\\uA66C\\uA680\\uA682\\uA684\\uA686\\uA688\\uA68A\\uA68C\\uA68E\\uA690\\uA692\\uA694\\uA696\\uA722\\uA724\\uA726\\uA728\\uA72A\\uA72C\\uA72E\\uA732\\uA734\\uA736\\uA738\\uA73A\\uA73C\\uA73E\\uA740\\uA742\\uA744\\uA746\\uA748\\uA74A\\uA74C\\uA74E\\uA750\\uA752\\uA754\\uA756\\uA758\\uA75A\\uA75C\\uA75E\\uA760\\uA762\\uA764\\uA766\\uA768\\uA76A\\uA76C\\uA76E\\uA779\\uA77B\\uA77D-\\uA77E\\uA780\\uA782\\uA784\\uA786\\uA78B\\uA78D\\uA790\\uA792\\uA7A0\\uA7A2\\uA7A4\\uA7A6\\uA7A8\\uA7AA\\uFF21-\\uFF3A]", description: "[A-Z\\xC0-\\xD6\\xD8-\\xDE\\u0100\\u0102\\u0104\\u0106\\u0108\\u010A\\u010C\\u010E\\u0110\\u0112\\u0114\\u0116\\u0118\\u011A\\u011C\\u011E\\u0120\\u0122\\u0124\\u0126\\u0128\\u012A\\u012C\\u012E\\u0130\\u0132\\u0134\\u0136\\u0139\\u013B\\u013D\\u013F\\u0141\\u0143\\u0145\\u0147\\u014A\\u014C\\u014E\\u0150\\u0152\\u0154\\u0156\\u0158\\u015A\\u015C\\u015E\\u0160\\u0162\\u0164\\u0166\\u0168\\u016A\\u016C\\u016E\\u0170\\u0172\\u0174\\u0176\\u0178-\\u0179\\u017B\\u017D\\u0181-\\u0182\\u0184\\u0186-\\u0187\\u0189-\\u018B\\u018E-\\u0191\\u0193-\\u0194\\u0196-\\u0198\\u019C-\\u019D\\u019F-\\u01A0\\u01A2\\u01A4\\u01A6-\\u01A7\\u01A9\\u01AC\\u01AE-\\u01AF\\u01B1-\\u01B3\\u01B5\\u01B7-\\u01B8\\u01BC\\u01C4\\u01C7\\u01CA\\u01CD\\u01CF\\u01D1\\u01D3\\u01D5\\u01D7\\u01D9\\u01DB\\u01DE\\u01E0\\u01E2\\u01E4\\u01E6\\u01E8\\u01EA\\u01EC\\u01EE\\u01F1\\u01F4\\u01F6-\\u01F8\\u01FA\\u01FC\\u01FE\\u0200\\u0202\\u0204\\u0206\\u0208\\u020A\\u020C\\u020E\\u0210\\u0212\\u0214\\u0216\\u0218\\u021A\\u021C\\u021E\\u0220\\u0222\\u0224\\u0226\\u0228\\u022A\\u022C\\u022E\\u0230\\u0232\\u023A-\\u023B\\u023D-\\u023E\\u0241\\u0243-\\u0246\\u0248\\u024A\\u024C\\u024E\\u0370\\u0372\\u0376\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u038F\\u0391-\\u03A1\\u03A3-\\u03AB\\u03CF\\u03D2-\\u03D4\\u03D8\\u03DA\\u03DC\\u03DE\\u03E0\\u03E2\\u03E4\\u03E6\\u03E8\\u03EA\\u03EC\\u03EE\\u03F4\\u03F7\\u03F9-\\u03FA\\u03FD-\\u042F\\u0460\\u0462\\u0464\\u0466\\u0468\\u046A\\u046C\\u046E\\u0470\\u0472\\u0474\\u0476\\u0478\\u047A\\u047C\\u047E\\u0480\\u048A\\u048C\\u048E\\u0490\\u0492\\u0494\\u0496\\u0498\\u049A\\u049C\\u049E\\u04A0\\u04A2\\u04A4\\u04A6\\u04A8\\u04AA\\u04AC\\u04AE\\u04B0\\u04B2\\u04B4\\u04B6\\u04B8\\u04BA\\u04BC\\u04BE\\u04C0-\\u04C1\\u04C3\\u04C5\\u04C7\\u04C9\\u04CB\\u04CD\\u04D0\\u04D2\\u04D4\\u04D6\\u04D8\\u04DA\\u04DC\\u04DE\\u04E0\\u04E2\\u04E4\\u04E6\\u04E8\\u04EA\\u04EC\\u04EE\\u04F0\\u04F2\\u04F4\\u04F6\\u04F8\\u04FA\\u04FC\\u04FE\\u0500\\u0502\\u0504\\u0506\\u0508\\u050A\\u050C\\u050E\\u0510\\u0512\\u0514\\u0516\\u0518\\u051A\\u051C\\u051E\\u0520\\u0522\\u0524\\u0526\\u0531-\\u0556\\u10A0-\\u10C5\\u10C7\\u10CD\\u1E00\\u1E02\\u1E04\\u1E06\\u1E08\\u1E0A\\u1E0C\\u1E0E\\u1E10\\u1E12\\u1E14\\u1E16\\u1E18\\u1E1A\\u1E1C\\u1E1E\\u1E20\\u1E22\\u1E24\\u1E26\\u1E28\\u1E2A\\u1E2C\\u1E2E\\u1E30\\u1E32\\u1E34\\u1E36\\u1E38\\u1E3A\\u1E3C\\u1E3E\\u1E40\\u1E42\\u1E44\\u1E46\\u1E48\\u1E4A\\u1E4C\\u1E4E\\u1E50\\u1E52\\u1E54\\u1E56\\u1E58\\u1E5A\\u1E5C\\u1E5E\\u1E60\\u1E62\\u1E64\\u1E66\\u1E68\\u1E6A\\u1E6C\\u1E6E\\u1E70\\u1E72\\u1E74\\u1E76\\u1E78\\u1E7A\\u1E7C\\u1E7E\\u1E80\\u1E82\\u1E84\\u1E86\\u1E88\\u1E8A\\u1E8C\\u1E8E\\u1E90\\u1E92\\u1E94\\u1E9E\\u1EA0\\u1EA2\\u1EA4\\u1EA6\\u1EA8\\u1EAA\\u1EAC\\u1EAE\\u1EB0\\u1EB2\\u1EB4\\u1EB6\\u1EB8\\u1EBA\\u1EBC\\u1EBE\\u1EC0\\u1EC2\\u1EC4\\u1EC6\\u1EC8\\u1ECA\\u1ECC\\u1ECE\\u1ED0\\u1ED2\\u1ED4\\u1ED6\\u1ED8\\u1EDA\\u1EDC\\u1EDE\\u1EE0\\u1EE2\\u1EE4\\u1EE6\\u1EE8\\u1EEA\\u1EEC\\u1EEE\\u1EF0\\u1EF2\\u1EF4\\u1EF6\\u1EF8\\u1EFA\\u1EFC\\u1EFE\\u1F08-\\u1F0F\\u1F18-\\u1F1D\\u1F28-\\u1F2F\\u1F38-\\u1F3F\\u1F48-\\u1F4D\\u1F59\\u1F5B\\u1F5D\\u1F5F\\u1F68-\\u1F6F\\u1FB8-\\u1FBB\\u1FC8-\\u1FCB\\u1FD8-\\u1FDB\\u1FE8-\\u1FEC\\u1FF8-\\u1FFB\\u2102\\u2107\\u210B-\\u210D\\u2110-\\u2112\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128\\u212A-\\u212D\\u2130-\\u2133\\u213E-\\u213F\\u2145\\u2183\\u2C00-\\u2C2E\\u2C60\\u2C62-\\u2C64\\u2C67\\u2C69\\u2C6B\\u2C6D-\\u2C70\\u2C72\\u2C75\\u2C7E-\\u2C80\\u2C82\\u2C84\\u2C86\\u2C88\\u2C8A\\u2C8C\\u2C8E\\u2C90\\u2C92\\u2C94\\u2C96\\u2C98\\u2C9A\\u2C9C\\u2C9E\\u2CA0\\u2CA2\\u2CA4\\u2CA6\\u2CA8\\u2CAA\\u2CAC\\u2CAE\\u2CB0\\u2CB2\\u2CB4\\u2CB6\\u2CB8\\u2CBA\\u2CBC\\u2CBE\\u2CC0\\u2CC2\\u2CC4\\u2CC6\\u2CC8\\u2CCA\\u2CCC\\u2CCE\\u2CD0\\u2CD2\\u2CD4\\u2CD6\\u2CD8\\u2CDA\\u2CDC\\u2CDE\\u2CE0\\u2CE2\\u2CEB\\u2CED\\u2CF2\\uA640\\uA642\\uA644\\uA646\\uA648\\uA64A\\uA64C\\uA64E\\uA650\\uA652\\uA654\\uA656\\uA658\\uA65A\\uA65C\\uA65E\\uA660\\uA662\\uA664\\uA666\\uA668\\uA66A\\uA66C\\uA680\\uA682\\uA684\\uA686\\uA688\\uA68A\\uA68C\\uA68E\\uA690\\uA692\\uA694\\uA696\\uA722\\uA724\\uA726\\uA728\\uA72A\\uA72C\\uA72E\\uA732\\uA734\\uA736\\uA738\\uA73A\\uA73C\\uA73E\\uA740\\uA742\\uA744\\uA746\\uA748\\uA74A\\uA74C\\uA74E\\uA750\\uA752\\uA754\\uA756\\uA758\\uA75A\\uA75C\\uA75E\\uA760\\uA762\\uA764\\uA766\\uA768\\uA76A\\uA76C\\uA76E\\uA779\\uA77B\\uA77D-\\uA77E\\uA780\\uA782\\uA784\\uA786\\uA78B\\uA78D\\uA790\\uA792\\uA7A0\\uA7A2\\uA7A4\\uA7A6\\uA7A8\\uA7AA\\uFF21-\\uFF3A]" },
        peg$c326 = /^[\u0903\u093B\u093E-\u0940\u0949-\u094C\u094E-\u094F\u0982-\u0983\u09BE-\u09C0\u09C7-\u09C8\u09CB-\u09CC\u09D7\u0A03\u0A3E-\u0A40\u0A83\u0ABE-\u0AC0\u0AC9\u0ACB-\u0ACC\u0B02-\u0B03\u0B3E\u0B40\u0B47-\u0B48\u0B4B-\u0B4C\u0B57\u0BBE-\u0BBF\u0BC1-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCC\u0BD7\u0C01-\u0C03\u0C41-\u0C44\u0C82-\u0C83\u0CBE\u0CC0-\u0CC4\u0CC7-\u0CC8\u0CCA-\u0CCB\u0CD5-\u0CD6\u0D02-\u0D03\u0D3E-\u0D40\u0D46-\u0D48\u0D4A-\u0D4C\u0D57\u0D82-\u0D83\u0DCF-\u0DD1\u0DD8-\u0DDF\u0DF2-\u0DF3\u0F3E-\u0F3F\u0F7F\u102B-\u102C\u1031\u1038\u103B-\u103C\u1056-\u1057\u1062-\u1064\u1067-\u106D\u1083-\u1084\u1087-\u108C\u108F\u109A-\u109C\u17B6\u17BE-\u17C5\u17C7-\u17C8\u1923-\u1926\u1929-\u192B\u1930-\u1931\u1933-\u1938\u19B0-\u19C0\u19C8-\u19C9\u1A19-\u1A1A\u1A55\u1A57\u1A61\u1A63-\u1A64\u1A6D-\u1A72\u1B04\u1B35\u1B3B\u1B3D-\u1B41\u1B43-\u1B44\u1B82\u1BA1\u1BA6-\u1BA7\u1BAA\u1BAC-\u1BAD\u1BE7\u1BEA-\u1BEC\u1BEE\u1BF2-\u1BF3\u1C24-\u1C2B\u1C34-\u1C35\u1CE1\u1CF2-\u1CF3\u302E-\u302F\uA823-\uA824\uA827\uA880-\uA881\uA8B4-\uA8C3\uA952-\uA953\uA983\uA9B4-\uA9B5\uA9BA-\uA9BB\uA9BD-\uA9C0\uAA2F-\uAA30\uAA33-\uAA34\uAA4D\uAA7B\uAAEB\uAAEE-\uAAEF\uAAF5\uABE3-\uABE4\uABE6-\uABE7\uABE9-\uABEA\uABEC]/,
        peg$c327 = { type: "class", value: "[\\u0903\\u093B\\u093E-\\u0940\\u0949-\\u094C\\u094E-\\u094F\\u0982-\\u0983\\u09BE-\\u09C0\\u09C7-\\u09C8\\u09CB-\\u09CC\\u09D7\\u0A03\\u0A3E-\\u0A40\\u0A83\\u0ABE-\\u0AC0\\u0AC9\\u0ACB-\\u0ACC\\u0B02-\\u0B03\\u0B3E\\u0B40\\u0B47-\\u0B48\\u0B4B-\\u0B4C\\u0B57\\u0BBE-\\u0BBF\\u0BC1-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCC\\u0BD7\\u0C01-\\u0C03\\u0C41-\\u0C44\\u0C82-\\u0C83\\u0CBE\\u0CC0-\\u0CC4\\u0CC7-\\u0CC8\\u0CCA-\\u0CCB\\u0CD5-\\u0CD6\\u0D02-\\u0D03\\u0D3E-\\u0D40\\u0D46-\\u0D48\\u0D4A-\\u0D4C\\u0D57\\u0D82-\\u0D83\\u0DCF-\\u0DD1\\u0DD8-\\u0DDF\\u0DF2-\\u0DF3\\u0F3E-\\u0F3F\\u0F7F\\u102B-\\u102C\\u1031\\u1038\\u103B-\\u103C\\u1056-\\u1057\\u1062-\\u1064\\u1067-\\u106D\\u1083-\\u1084\\u1087-\\u108C\\u108F\\u109A-\\u109C\\u17B6\\u17BE-\\u17C5\\u17C7-\\u17C8\\u1923-\\u1926\\u1929-\\u192B\\u1930-\\u1931\\u1933-\\u1938\\u19B0-\\u19C0\\u19C8-\\u19C9\\u1A19-\\u1A1A\\u1A55\\u1A57\\u1A61\\u1A63-\\u1A64\\u1A6D-\\u1A72\\u1B04\\u1B35\\u1B3B\\u1B3D-\\u1B41\\u1B43-\\u1B44\\u1B82\\u1BA1\\u1BA6-\\u1BA7\\u1BAA\\u1BAC-\\u1BAD\\u1BE7\\u1BEA-\\u1BEC\\u1BEE\\u1BF2-\\u1BF3\\u1C24-\\u1C2B\\u1C34-\\u1C35\\u1CE1\\u1CF2-\\u1CF3\\u302E-\\u302F\\uA823-\\uA824\\uA827\\uA880-\\uA881\\uA8B4-\\uA8C3\\uA952-\\uA953\\uA983\\uA9B4-\\uA9B5\\uA9BA-\\uA9BB\\uA9BD-\\uA9C0\\uAA2F-\\uAA30\\uAA33-\\uAA34\\uAA4D\\uAA7B\\uAAEB\\uAAEE-\\uAAEF\\uAAF5\\uABE3-\\uABE4\\uABE6-\\uABE7\\uABE9-\\uABEA\\uABEC]", description: "[\\u0903\\u093B\\u093E-\\u0940\\u0949-\\u094C\\u094E-\\u094F\\u0982-\\u0983\\u09BE-\\u09C0\\u09C7-\\u09C8\\u09CB-\\u09CC\\u09D7\\u0A03\\u0A3E-\\u0A40\\u0A83\\u0ABE-\\u0AC0\\u0AC9\\u0ACB-\\u0ACC\\u0B02-\\u0B03\\u0B3E\\u0B40\\u0B47-\\u0B48\\u0B4B-\\u0B4C\\u0B57\\u0BBE-\\u0BBF\\u0BC1-\\u0BC2\\u0BC6-\\u0BC8\\u0BCA-\\u0BCC\\u0BD7\\u0C01-\\u0C03\\u0C41-\\u0C44\\u0C82-\\u0C83\\u0CBE\\u0CC0-\\u0CC4\\u0CC7-\\u0CC8\\u0CCA-\\u0CCB\\u0CD5-\\u0CD6\\u0D02-\\u0D03\\u0D3E-\\u0D40\\u0D46-\\u0D48\\u0D4A-\\u0D4C\\u0D57\\u0D82-\\u0D83\\u0DCF-\\u0DD1\\u0DD8-\\u0DDF\\u0DF2-\\u0DF3\\u0F3E-\\u0F3F\\u0F7F\\u102B-\\u102C\\u1031\\u1038\\u103B-\\u103C\\u1056-\\u1057\\u1062-\\u1064\\u1067-\\u106D\\u1083-\\u1084\\u1087-\\u108C\\u108F\\u109A-\\u109C\\u17B6\\u17BE-\\u17C5\\u17C7-\\u17C8\\u1923-\\u1926\\u1929-\\u192B\\u1930-\\u1931\\u1933-\\u1938\\u19B0-\\u19C0\\u19C8-\\u19C9\\u1A19-\\u1A1A\\u1A55\\u1A57\\u1A61\\u1A63-\\u1A64\\u1A6D-\\u1A72\\u1B04\\u1B35\\u1B3B\\u1B3D-\\u1B41\\u1B43-\\u1B44\\u1B82\\u1BA1\\u1BA6-\\u1BA7\\u1BAA\\u1BAC-\\u1BAD\\u1BE7\\u1BEA-\\u1BEC\\u1BEE\\u1BF2-\\u1BF3\\u1C24-\\u1C2B\\u1C34-\\u1C35\\u1CE1\\u1CF2-\\u1CF3\\u302E-\\u302F\\uA823-\\uA824\\uA827\\uA880-\\uA881\\uA8B4-\\uA8C3\\uA952-\\uA953\\uA983\\uA9B4-\\uA9B5\\uA9BA-\\uA9BB\\uA9BD-\\uA9C0\\uAA2F-\\uAA30\\uAA33-\\uAA34\\uAA4D\\uAA7B\\uAAEB\\uAAEE-\\uAAEF\\uAAF5\\uABE3-\\uABE4\\uABE6-\\uABE7\\uABE9-\\uABEA\\uABEC]" },
        peg$c328 = /^[\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E4-\u08FE\u0900-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962-\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2-\u09E3\u0A01-\u0A02\u0A3C\u0A41-\u0A42\u0A47-\u0A48\u0A4B-\u0A4D\u0A51\u0A70-\u0A71\u0A75\u0A81-\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7-\u0AC8\u0ACD\u0AE2-\u0AE3\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62-\u0B63\u0B82\u0BC0\u0BCD\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55-\u0C56\u0C62-\u0C63\u0CBC\u0CBF\u0CC6\u0CCC-\u0CCD\u0CE2-\u0CE3\u0D41-\u0D44\u0D4D\u0D62-\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB-\u0EBC\u0EC8-\u0ECD\u0F18-\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86-\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039-\u103A\u103D-\u103E\u1058-\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085-\u1086\u108D\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752-\u1753\u1772-\u1773\u17B4-\u17B5\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927-\u1928\u1932\u1939-\u193B\u1A17-\u1A18\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80-\u1B81\u1BA2-\u1BA5\u1BA8-\u1BA9\u1BAB\u1BE6\u1BE8-\u1BE9\u1BED\u1BEF-\u1BF1\u1C2C-\u1C33\u1C36-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1DC0-\u1DE6\u1DFC-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099-\u309A\uA66F\uA674-\uA67D\uA69F\uA6F0-\uA6F1\uA802\uA806\uA80B\uA825-\uA826\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uAA29-\uAA2E\uAA31-\uAA32\uAA35-\uAA36\uAA43\uAA4C\uAAB0\uAAB2-\uAAB4\uAAB7-\uAAB8\uAABE-\uAABF\uAAC1\uAAEC-\uAAED\uAAF6\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE26]/,
        peg$c329 = { type: "class", value: "[\\u0300-\\u036F\\u0483-\\u0487\\u0591-\\u05BD\\u05BF\\u05C1-\\u05C2\\u05C4-\\u05C5\\u05C7\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06DC\\u06DF-\\u06E4\\u06E7-\\u06E8\\u06EA-\\u06ED\\u0711\\u0730-\\u074A\\u07A6-\\u07B0\\u07EB-\\u07F3\\u0816-\\u0819\\u081B-\\u0823\\u0825-\\u0827\\u0829-\\u082D\\u0859-\\u085B\\u08E4-\\u08FE\\u0900-\\u0902\\u093A\\u093C\\u0941-\\u0948\\u094D\\u0951-\\u0957\\u0962-\\u0963\\u0981\\u09BC\\u09C1-\\u09C4\\u09CD\\u09E2-\\u09E3\\u0A01-\\u0A02\\u0A3C\\u0A41-\\u0A42\\u0A47-\\u0A48\\u0A4B-\\u0A4D\\u0A51\\u0A70-\\u0A71\\u0A75\\u0A81-\\u0A82\\u0ABC\\u0AC1-\\u0AC5\\u0AC7-\\u0AC8\\u0ACD\\u0AE2-\\u0AE3\\u0B01\\u0B3C\\u0B3F\\u0B41-\\u0B44\\u0B4D\\u0B56\\u0B62-\\u0B63\\u0B82\\u0BC0\\u0BCD\\u0C3E-\\u0C40\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55-\\u0C56\\u0C62-\\u0C63\\u0CBC\\u0CBF\\u0CC6\\u0CCC-\\u0CCD\\u0CE2-\\u0CE3\\u0D41-\\u0D44\\u0D4D\\u0D62-\\u0D63\\u0DCA\\u0DD2-\\u0DD4\\u0DD6\\u0E31\\u0E34-\\u0E3A\\u0E47-\\u0E4E\\u0EB1\\u0EB4-\\u0EB9\\u0EBB-\\u0EBC\\u0EC8-\\u0ECD\\u0F18-\\u0F19\\u0F35\\u0F37\\u0F39\\u0F71-\\u0F7E\\u0F80-\\u0F84\\u0F86-\\u0F87\\u0F8D-\\u0F97\\u0F99-\\u0FBC\\u0FC6\\u102D-\\u1030\\u1032-\\u1037\\u1039-\\u103A\\u103D-\\u103E\\u1058-\\u1059\\u105E-\\u1060\\u1071-\\u1074\\u1082\\u1085-\\u1086\\u108D\\u109D\\u135D-\\u135F\\u1712-\\u1714\\u1732-\\u1734\\u1752-\\u1753\\u1772-\\u1773\\u17B4-\\u17B5\\u17B7-\\u17BD\\u17C6\\u17C9-\\u17D3\\u17DD\\u180B-\\u180D\\u18A9\\u1920-\\u1922\\u1927-\\u1928\\u1932\\u1939-\\u193B\\u1A17-\\u1A18\\u1A1B\\u1A56\\u1A58-\\u1A5E\\u1A60\\u1A62\\u1A65-\\u1A6C\\u1A73-\\u1A7C\\u1A7F\\u1B00-\\u1B03\\u1B34\\u1B36-\\u1B3A\\u1B3C\\u1B42\\u1B6B-\\u1B73\\u1B80-\\u1B81\\u1BA2-\\u1BA5\\u1BA8-\\u1BA9\\u1BAB\\u1BE6\\u1BE8-\\u1BE9\\u1BED\\u1BEF-\\u1BF1\\u1C2C-\\u1C33\\u1C36-\\u1C37\\u1CD0-\\u1CD2\\u1CD4-\\u1CE0\\u1CE2-\\u1CE8\\u1CED\\u1CF4\\u1DC0-\\u1DE6\\u1DFC-\\u1DFF\\u20D0-\\u20DC\\u20E1\\u20E5-\\u20F0\\u2CEF-\\u2CF1\\u2D7F\\u2DE0-\\u2DFF\\u302A-\\u302D\\u3099-\\u309A\\uA66F\\uA674-\\uA67D\\uA69F\\uA6F0-\\uA6F1\\uA802\\uA806\\uA80B\\uA825-\\uA826\\uA8C4\\uA8E0-\\uA8F1\\uA926-\\uA92D\\uA947-\\uA951\\uA980-\\uA982\\uA9B3\\uA9B6-\\uA9B9\\uA9BC\\uAA29-\\uAA2E\\uAA31-\\uAA32\\uAA35-\\uAA36\\uAA43\\uAA4C\\uAAB0\\uAAB2-\\uAAB4\\uAAB7-\\uAAB8\\uAABE-\\uAABF\\uAAC1\\uAAEC-\\uAAED\\uAAF6\\uABE5\\uABE8\\uABED\\uFB1E\\uFE00-\\uFE0F\\uFE20-\\uFE26]", description: "[\\u0300-\\u036F\\u0483-\\u0487\\u0591-\\u05BD\\u05BF\\u05C1-\\u05C2\\u05C4-\\u05C5\\u05C7\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06DC\\u06DF-\\u06E4\\u06E7-\\u06E8\\u06EA-\\u06ED\\u0711\\u0730-\\u074A\\u07A6-\\u07B0\\u07EB-\\u07F3\\u0816-\\u0819\\u081B-\\u0823\\u0825-\\u0827\\u0829-\\u082D\\u0859-\\u085B\\u08E4-\\u08FE\\u0900-\\u0902\\u093A\\u093C\\u0941-\\u0948\\u094D\\u0951-\\u0957\\u0962-\\u0963\\u0981\\u09BC\\u09C1-\\u09C4\\u09CD\\u09E2-\\u09E3\\u0A01-\\u0A02\\u0A3C\\u0A41-\\u0A42\\u0A47-\\u0A48\\u0A4B-\\u0A4D\\u0A51\\u0A70-\\u0A71\\u0A75\\u0A81-\\u0A82\\u0ABC\\u0AC1-\\u0AC5\\u0AC7-\\u0AC8\\u0ACD\\u0AE2-\\u0AE3\\u0B01\\u0B3C\\u0B3F\\u0B41-\\u0B44\\u0B4D\\u0B56\\u0B62-\\u0B63\\u0B82\\u0BC0\\u0BCD\\u0C3E-\\u0C40\\u0C46-\\u0C48\\u0C4A-\\u0C4D\\u0C55-\\u0C56\\u0C62-\\u0C63\\u0CBC\\u0CBF\\u0CC6\\u0CCC-\\u0CCD\\u0CE2-\\u0CE3\\u0D41-\\u0D44\\u0D4D\\u0D62-\\u0D63\\u0DCA\\u0DD2-\\u0DD4\\u0DD6\\u0E31\\u0E34-\\u0E3A\\u0E47-\\u0E4E\\u0EB1\\u0EB4-\\u0EB9\\u0EBB-\\u0EBC\\u0EC8-\\u0ECD\\u0F18-\\u0F19\\u0F35\\u0F37\\u0F39\\u0F71-\\u0F7E\\u0F80-\\u0F84\\u0F86-\\u0F87\\u0F8D-\\u0F97\\u0F99-\\u0FBC\\u0FC6\\u102D-\\u1030\\u1032-\\u1037\\u1039-\\u103A\\u103D-\\u103E\\u1058-\\u1059\\u105E-\\u1060\\u1071-\\u1074\\u1082\\u1085-\\u1086\\u108D\\u109D\\u135D-\\u135F\\u1712-\\u1714\\u1732-\\u1734\\u1752-\\u1753\\u1772-\\u1773\\u17B4-\\u17B5\\u17B7-\\u17BD\\u17C6\\u17C9-\\u17D3\\u17DD\\u180B-\\u180D\\u18A9\\u1920-\\u1922\\u1927-\\u1928\\u1932\\u1939-\\u193B\\u1A17-\\u1A18\\u1A1B\\u1A56\\u1A58-\\u1A5E\\u1A60\\u1A62\\u1A65-\\u1A6C\\u1A73-\\u1A7C\\u1A7F\\u1B00-\\u1B03\\u1B34\\u1B36-\\u1B3A\\u1B3C\\u1B42\\u1B6B-\\u1B73\\u1B80-\\u1B81\\u1BA2-\\u1BA5\\u1BA8-\\u1BA9\\u1BAB\\u1BE6\\u1BE8-\\u1BE9\\u1BED\\u1BEF-\\u1BF1\\u1C2C-\\u1C33\\u1C36-\\u1C37\\u1CD0-\\u1CD2\\u1CD4-\\u1CE0\\u1CE2-\\u1CE8\\u1CED\\u1CF4\\u1DC0-\\u1DE6\\u1DFC-\\u1DFF\\u20D0-\\u20DC\\u20E1\\u20E5-\\u20F0\\u2CEF-\\u2CF1\\u2D7F\\u2DE0-\\u2DFF\\u302A-\\u302D\\u3099-\\u309A\\uA66F\\uA674-\\uA67D\\uA69F\\uA6F0-\\uA6F1\\uA802\\uA806\\uA80B\\uA825-\\uA826\\uA8C4\\uA8E0-\\uA8F1\\uA926-\\uA92D\\uA947-\\uA951\\uA980-\\uA982\\uA9B3\\uA9B6-\\uA9B9\\uA9BC\\uAA29-\\uAA2E\\uAA31-\\uAA32\\uAA35-\\uAA36\\uAA43\\uAA4C\\uAAB0\\uAAB2-\\uAAB4\\uAAB7-\\uAAB8\\uAABE-\\uAABF\\uAAC1\\uAAEC-\\uAAED\\uAAF6\\uABE5\\uABE8\\uABED\\uFB1E\\uFE00-\\uFE0F\\uFE20-\\uFE26]" },
        peg$c330 = /^[0-9\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]/,
        peg$c331 = { type: "class", value: "[0-9\\u0660-\\u0669\\u06F0-\\u06F9\\u07C0-\\u07C9\\u0966-\\u096F\\u09E6-\\u09EF\\u0A66-\\u0A6F\\u0AE6-\\u0AEF\\u0B66-\\u0B6F\\u0BE6-\\u0BEF\\u0C66-\\u0C6F\\u0CE6-\\u0CEF\\u0D66-\\u0D6F\\u0E50-\\u0E59\\u0ED0-\\u0ED9\\u0F20-\\u0F29\\u1040-\\u1049\\u1090-\\u1099\\u17E0-\\u17E9\\u1810-\\u1819\\u1946-\\u194F\\u19D0-\\u19D9\\u1A80-\\u1A89\\u1A90-\\u1A99\\u1B50-\\u1B59\\u1BB0-\\u1BB9\\u1C40-\\u1C49\\u1C50-\\u1C59\\uA620-\\uA629\\uA8D0-\\uA8D9\\uA900-\\uA909\\uA9D0-\\uA9D9\\uAA50-\\uAA59\\uABF0-\\uABF9\\uFF10-\\uFF19]", description: "[0-9\\u0660-\\u0669\\u06F0-\\u06F9\\u07C0-\\u07C9\\u0966-\\u096F\\u09E6-\\u09EF\\u0A66-\\u0A6F\\u0AE6-\\u0AEF\\u0B66-\\u0B6F\\u0BE6-\\u0BEF\\u0C66-\\u0C6F\\u0CE6-\\u0CEF\\u0D66-\\u0D6F\\u0E50-\\u0E59\\u0ED0-\\u0ED9\\u0F20-\\u0F29\\u1040-\\u1049\\u1090-\\u1099\\u17E0-\\u17E9\\u1810-\\u1819\\u1946-\\u194F\\u19D0-\\u19D9\\u1A80-\\u1A89\\u1A90-\\u1A99\\u1B50-\\u1B59\\u1BB0-\\u1BB9\\u1C40-\\u1C49\\u1C50-\\u1C59\\uA620-\\uA629\\uA8D0-\\uA8D9\\uA900-\\uA909\\uA9D0-\\uA9D9\\uAA50-\\uAA59\\uABF0-\\uABF9\\uFF10-\\uFF19]" },
        peg$c332 = /^[\u16EE-\u16F0\u2160-\u2182\u2185-\u2188\u3007\u3021-\u3029\u3038-\u303A\uA6E6-\uA6EF]/,
        peg$c333 = { type: "class", value: "[\\u16EE-\\u16F0\\u2160-\\u2182\\u2185-\\u2188\\u3007\\u3021-\\u3029\\u3038-\\u303A\\uA6E6-\\uA6EF]", description: "[\\u16EE-\\u16F0\\u2160-\\u2182\\u2185-\\u2188\\u3007\\u3021-\\u3029\\u3038-\\u303A\\uA6E6-\\uA6EF]" },
        peg$c334 = /^[_\u203F-\u2040\u2054\uFE33-\uFE34\uFE4D-\uFE4F\uFF3F]/,
        peg$c335 = { type: "class", value: "[_\\u203F-\\u2040\\u2054\\uFE33-\\uFE34\\uFE4D-\\uFE4F\\uFF3F]", description: "[_\\u203F-\\u2040\\u2054\\uFE33-\\uFE34\\uFE4D-\\uFE4F\\uFF3F]" },
        peg$c336 = /^[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/,
        peg$c337 = { type: "class", value: "[ \\xA0\\u1680\\u2000-\\u200A\\u202F\\u205F\\u3000]", description: "[ \\xA0\\u1680\\u2000-\\u200A\\u202F\\u205F\\u3000]" },

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        peg$reportedPos
      );
    }

    function error(message) {
      throw peg$buildException(message, null, peg$reportedPos);
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, pos) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var posDetails = peg$computePosDetails(pos),
          found      = pos < input.length ? input.charAt(pos) : null;

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
    }

    function peg$parseProgram() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parse__();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseHeader();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseHeader();
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseDefinition();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseDefinition();
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c2(s2, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseHeader() {
      var s0, s1, s2;

      s0 = peg$parseInclude();
      if (s0 === peg$FAILED) {
        s0 = peg$parseCppInclude();
        if (s0 === peg$FAILED) {
          s0 = peg$parseNamespace();
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 13) === peg$c3) {
              s1 = peg$c3;
              peg$currPos += 13;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c4); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parseIdentifier();
              if (s2 !== peg$FAILED) {
                s1 = [s1, s2];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 13) === peg$c5) {
                s1 = peg$c5;
                peg$currPos += 13;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c6); }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parseIdentifier();
                if (s2 !== peg$FAILED) {
                  s1 = [s1, s2];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 9) === peg$c7) {
                  s1 = peg$c7;
                  peg$currPos += 9;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c8); }
                }
                if (s1 !== peg$FAILED) {
                  s2 = peg$parseIdentifier();
                  if (s2 !== peg$FAILED) {
                    s1 = [s1, s2];
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.substr(peg$currPos, 12) === peg$c9) {
                    s1 = peg$c9;
                    peg$currPos += 12;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c10); }
                  }
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parseIdentifier();
                    if (s2 !== peg$FAILED) {
                      s1 = [s1, s2];
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.substr(peg$currPos, 14) === peg$c11) {
                      s1 = peg$c11;
                      peg$currPos += 14;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c12); }
                    }
                    if (s1 !== peg$FAILED) {
                      s2 = peg$parseIdentifier();
                      if (s2 !== peg$FAILED) {
                        s1 = [s1, s2];
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      if (input.substr(peg$currPos, 18) === peg$c13) {
                        s1 = peg$c13;
                        peg$currPos += 18;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c14); }
                      }
                      if (s1 !== peg$FAILED) {
                        s2 = peg$parseSTIdentifier();
                        if (s2 !== peg$FAILED) {
                          s1 = [s1, s2];
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.substr(peg$currPos, 16) === peg$c15) {
                          s1 = peg$c15;
                          peg$currPos += 16;
                        } else {
                          s1 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c16); }
                        }
                        if (s1 !== peg$FAILED) {
                          s2 = peg$parseIdentifier();
                          if (s2 !== peg$FAILED) {
                            s1 = [s1, s2];
                            s0 = s1;
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                        if (s0 === peg$FAILED) {
                          s0 = peg$currPos;
                          if (input.substr(peg$currPos, 12) === peg$c17) {
                            s1 = peg$c17;
                            peg$currPos += 12;
                          } else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c18); }
                          }
                          if (s1 !== peg$FAILED) {
                            s2 = peg$parseIdentifier();
                            if (s2 !== peg$FAILED) {
                              s1 = [s1, s2];
                              s0 = s1;
                            } else {
                              peg$currPos = s0;
                              s0 = peg$c0;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                          if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            if (input.substr(peg$currPos, 13) === peg$c19) {
                              s1 = peg$c19;
                              peg$currPos += 13;
                            } else {
                              s1 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c20); }
                            }
                            if (s1 !== peg$FAILED) {
                              s2 = peg$parseIdentifier();
                              if (s2 !== peg$FAILED) {
                                s1 = [s1, s2];
                                s0 = s1;
                              } else {
                                peg$currPos = s0;
                                s0 = peg$c0;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$c0;
                            }
                            if (s0 === peg$FAILED) {
                              s0 = peg$currPos;
                              if (input.substr(peg$currPos, 13) === peg$c21) {
                                s1 = peg$c21;
                                peg$currPos += 13;
                              } else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$c22); }
                              }
                              if (s1 !== peg$FAILED) {
                                s2 = peg$parseString();
                                if (s2 !== peg$FAILED) {
                                  s1 = [s1, s2];
                                  s0 = s1;
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$c0;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$c0;
                              }
                              if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                if (input.substr(peg$currPos, 16) === peg$c23) {
                                  s1 = peg$c23;
                                  peg$currPos += 16;
                                } else {
                                  s1 = peg$FAILED;
                                  if (peg$silentFails === 0) { peg$fail(peg$c24); }
                                }
                                if (s1 !== peg$FAILED) {
                                  s2 = peg$parseIdentifier();
                                  if (s2 !== peg$FAILED) {
                                    s1 = [s1, s2];
                                    s0 = s1;
                                  } else {
                                    peg$currPos = s0;
                                    s0 = peg$c0;
                                  }
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$c0;
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parseInclude() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parseIncludeToken();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseIdentifier();
        if (s2 === peg$FAILED) {
          s2 = peg$c25;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse__();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseString();
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c26(s2, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseCppInclude() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseCppIncludeToken();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseString();
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseNamespace() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parseNamespaceToken();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseNamespaceScope();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse__();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseIdentifier();
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c27(s2, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseNamespaceToken();
        if (s1 !== peg$FAILED) {
          if (input.substr(peg$currPos, 18) === peg$c28) {
            s2 = peg$c28;
            peg$currPos += 18;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c29); }
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parse__();
            if (s3 !== peg$FAILED) {
              s4 = peg$parseSTIdentifier();
              if (s4 !== peg$FAILED) {
                s1 = [s1, s2, s3, s4];
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parseNamespaceToken();
          if (s1 !== peg$FAILED) {
            if (input.substr(peg$currPos, 16) === peg$c30) {
              s2 = peg$c30;
              peg$currPos += 16;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c31); }
            }
            if (s2 !== peg$FAILED) {
              s3 = peg$parse__();
              if (s3 !== peg$FAILED) {
                s4 = peg$parseIdentifier();
                if (s4 !== peg$FAILED) {
                  s1 = [s1, s2, s3, s4];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 13) === peg$c5) {
              s1 = peg$c5;
              peg$currPos += 13;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c6); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parse__();
              if (s2 !== peg$FAILED) {
                s3 = peg$parseString();
                if (s3 !== peg$FAILED) {
                  s1 = [s1, s2, s3];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 13) === peg$c21) {
                s1 = peg$c21;
                peg$currPos += 13;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c22); }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parse__();
                if (s2 !== peg$FAILED) {
                  s3 = peg$parseString();
                  if (s3 !== peg$FAILED) {
                    s1 = [s1, s2, s3];
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                s1 = peg$parseNamespaceToken();
                if (s1 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 42) {
                    s2 = peg$c32;
                    peg$currPos++;
                  } else {
                    s2 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c33); }
                  }
                  if (s2 !== peg$FAILED) {
                    s3 = peg$parse__();
                    if (s3 !== peg$FAILED) {
                      s4 = peg$parseIdentifier();
                      if (s4 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c34(s2);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  s1 = peg$parseNamespaceToken();
                  if (s1 !== peg$FAILED) {
                    s2 = peg$parseIdentifier();
                    if (s2 !== peg$FAILED) {
                      s3 = peg$parseIdentifier();
                      if (s3 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c35(s2, s3);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parseNamespaceScope() {
      var s0;

      if (input.substr(peg$currPos, 3) === peg$c36) {
        s0 = peg$c36;
        peg$currPos += 3;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c37); }
      }
      if (s0 === peg$FAILED) {
        if (input.substr(peg$currPos, 4) === peg$c38) {
          s0 = peg$c38;
          peg$currPos += 4;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c39); }
        }
        if (s0 === peg$FAILED) {
          if (input.substr(peg$currPos, 10) === peg$c40) {
            s0 = peg$c40;
            peg$currPos += 10;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c41); }
          }
          if (s0 === peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c42) {
              s0 = peg$c42;
              peg$currPos += 2;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c43); }
            }
            if (s0 === peg$FAILED) {
              if (input.substr(peg$currPos, 4) === peg$c44) {
                s0 = peg$c44;
                peg$currPos += 4;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c45); }
              }
              if (s0 === peg$FAILED) {
                if (input.substr(peg$currPos, 2) === peg$c46) {
                  s0 = peg$c46;
                  peg$currPos += 2;
                } else {
                  s0 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c47); }
                }
                if (s0 === peg$FAILED) {
                  if (input.substr(peg$currPos, 5) === peg$c48) {
                    s0 = peg$c48;
                    peg$currPos += 5;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c49); }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 6) === peg$c50) {
                      s0 = peg$c50;
                      peg$currPos += 6;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c51); }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 3) === peg$c52) {
                        s0 = peg$c52;
                        peg$currPos += 3;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c53); }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 3) === peg$c54) {
                          s0 = peg$c54;
                          peg$currPos += 3;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c55); }
                        }
                        if (s0 === peg$FAILED) {
                          if (input.substr(peg$currPos, 6) === peg$c56) {
                            s0 = peg$c56;
                            peg$currPos += 6;
                          } else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) { peg$fail(peg$c57); }
                          }
                          if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 2) === peg$c58) {
                              s0 = peg$c58;
                              peg$currPos += 2;
                            } else {
                              s0 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c59); }
                            }
                            if (s0 === peg$FAILED) {
                              if (input.substr(peg$currPos, 2) === peg$c60) {
                                s0 = peg$c60;
                                peg$currPos += 2;
                              } else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) { peg$fail(peg$c61); }
                              }
                              if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 2) === peg$c62) {
                                  s0 = peg$c62;
                                  peg$currPos += 2;
                                } else {
                                  s0 = peg$FAILED;
                                  if (peg$silentFails === 0) { peg$fail(peg$c63); }
                                }
                                if (s0 === peg$FAILED) {
                                  if (input.substr(peg$currPos, 6) === peg$c64) {
                                    s0 = peg$c64;
                                    peg$currPos += 6;
                                  } else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) { peg$fail(peg$c65); }
                                  }
                                  if (s0 === peg$FAILED) {
                                    if (input.substr(peg$currPos, 3) === peg$c66) {
                                      s0 = peg$c66;
                                      peg$currPos += 3;
                                    } else {
                                      s0 = peg$FAILED;
                                      if (peg$silentFails === 0) { peg$fail(peg$c67); }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parseDefinition() {
      var s0;

      s0 = peg$parseConst();
      if (s0 === peg$FAILED) {
        s0 = peg$parseTypedef();
        if (s0 === peg$FAILED) {
          s0 = peg$parseEnum();
          if (s0 === peg$FAILED) {
            s0 = peg$parseSenum();
            if (s0 === peg$FAILED) {
              s0 = peg$parseStruct();
              if (s0 === peg$FAILED) {
                s0 = peg$parseUnion();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseException();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parseService();
                  }
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parseTypedef() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$parseTypedefToken();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseDefinitionType();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseIdentifier();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseTypeAnnotations();
              if (s5 === peg$FAILED) {
                s5 = peg$c25;
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parseListSeparator();
                if (s6 === peg$FAILED) {
                  s6 = peg$c25;
                }
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c68(s3, s4, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseDefinitionType() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseFieldType();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c69(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseCommaOrSemicolon() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 44) {
        s1 = peg$c70;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c71); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 59) {
          s1 = peg$c72;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c73); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          if (s2 !== peg$FAILED) {
            s1 = [s1, s2];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }

      return s0;
    }

    function peg$parseListSeparator() {
      var s0, s1;

      peg$silentFails++;
      s0 = peg$parseCommaOrSemicolon();
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c74); }
      }

      return s0;
    }

    function peg$parseEnum() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

      s0 = peg$currPos;
      s1 = peg$parseEnumToken();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseIdentifier();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 123) {
                s5 = peg$c75;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c76); }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                if (s6 !== peg$FAILED) {
                  s7 = [];
                  s8 = peg$parseEnumDefinition();
                  while (s8 !== peg$FAILED) {
                    s7.push(s8);
                    s8 = peg$parseEnumDefinition();
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parse__();
                    if (s8 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 125) {
                        s9 = peg$c77;
                        peg$currPos++;
                      } else {
                        s9 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c78); }
                      }
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parse__();
                        if (s10 !== peg$FAILED) {
                          s11 = peg$parseTypeAnnotations();
                          if (s11 === peg$FAILED) {
                            s11 = peg$c25;
                          }
                          if (s11 !== peg$FAILED) {
                            peg$reportedPos = s0;
                            s1 = peg$c79(s3, s7, s11);
                            s0 = s1;
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseEnumDefinition() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      s1 = peg$parseIdentifier();
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 61) {
          s3 = peg$c80;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c81); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseIntConstant();
            if (s5 !== peg$FAILED) {
              peg$reportedPos = s2;
              s3 = peg$c82(s5);
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$c0;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c0;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 === peg$FAILED) {
          s2 = peg$c25;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse__();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseTypeAnnotations();
            if (s4 === peg$FAILED) {
              s4 = peg$c25;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parseListSeparator();
              if (s5 === peg$FAILED) {
                s5 = peg$c25;
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c83(s1, s2, s4);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseSenum() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      s1 = peg$parseSenumToken();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseIdentifier();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 123) {
            s3 = peg$c75;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c76); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            if (s4 !== peg$FAILED) {
              s5 = [];
              s6 = peg$parseSenumDefinition();
              while (s6 !== peg$FAILED) {
                s5.push(s6);
                s6 = peg$parseSenumDefinition();
              }
              if (s5 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 125) {
                  s6 = peg$c77;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c78); }
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse__();
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parseTypeAnnotations();
                    if (s8 === peg$FAILED) {
                      s8 = peg$c25;
                    }
                    if (s8 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c84(s2, s5, s8);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseSenumDefinition() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseString();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseListSeparator();
        if (s2 === peg$FAILED) {
          s2 = peg$c25;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c85(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseConst() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      s1 = peg$parseConstToken();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseFieldType();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseIdentifier();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 61) {
              s4 = peg$c80;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c81); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse__();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseConstValue();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseListSeparator();
                  if (s7 === peg$FAILED) {
                    s7 = peg$c25;
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parse__();
                    if (s8 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c86(s2, s3, s6);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseConstValue() {
      var s0;

      s0 = peg$parseConstList();
      if (s0 === peg$FAILED) {
        s0 = peg$parseConstMap();
        if (s0 === peg$FAILED) {
          s0 = peg$parseStringLiteral();
          if (s0 === peg$FAILED) {
            s0 = peg$parseNumberLiteral();
            if (s0 === peg$FAILED) {
              s0 = peg$parseIdentifier();
            }
          }
        }
      }

      return s0;
    }

    function peg$parseConstList() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 91) {
        s1 = peg$c87;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c88); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$currPos;
          s5 = peg$parseConstValue();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseListSeparator();
              if (s7 === peg$FAILED) {
                s7 = peg$c25;
              }
              if (s7 !== peg$FAILED) {
                s8 = peg$parse__();
                if (s8 !== peg$FAILED) {
                  peg$reportedPos = s4;
                  s5 = peg$c89(s5);
                  s4 = s5;
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$currPos;
            s5 = peg$parseConstValue();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseListSeparator();
                if (s7 === peg$FAILED) {
                  s7 = peg$c25;
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse__();
                  if (s8 !== peg$FAILED) {
                    peg$reportedPos = s4;
                    s5 = peg$c89(s5);
                    s4 = s5;
                  } else {
                    peg$currPos = s4;
                    s4 = peg$c0;
                  }
                } else {
                  peg$currPos = s4;
                  s4 = peg$c0;
                }
              } else {
                peg$currPos = s4;
                s4 = peg$c0;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$c0;
            }
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 93) {
              s4 = peg$c90;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c91); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse__();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c92(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseConstMap() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s1 = peg$c75;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c76); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseConstValueEntry();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseConstValueEntry();
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 125) {
              s4 = peg$c77;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c78); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse__();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c93(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseConstValueEntry() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      s1 = peg$parseConstValue();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 58) {
            s3 = peg$c94;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c95); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseConstValue();
              if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseListSeparator();
                  if (s7 === peg$FAILED) {
                    s7 = peg$c25;
                  }
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c96(s1, s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseStruct() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c97) {
        s1 = peg$c97;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c98); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseIdentifier();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsexsdAll();
            if (s4 === peg$FAILED) {
              s4 = peg$c25;
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse__();
              if (s5 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 123) {
                  s6 = peg$c75;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c76); }
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse__();
                  if (s7 !== peg$FAILED) {
                    s8 = [];
                    s9 = peg$parseField();
                    while (s9 !== peg$FAILED) {
                      s8.push(s9);
                      s9 = peg$parseField();
                    }
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parse__();
                      if (s9 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 125) {
                          s10 = peg$c77;
                          peg$currPos++;
                        } else {
                          s10 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c78); }
                        }
                        if (s10 !== peg$FAILED) {
                          s11 = peg$parse__();
                          if (s11 !== peg$FAILED) {
                            s12 = peg$parseTypeAnnotations();
                            if (s12 === peg$FAILED) {
                              s12 = peg$c25;
                            }
                            if (s12 !== peg$FAILED) {
                              peg$reportedPos = s0;
                              s1 = peg$c99(s3, s8, s12);
                              s0 = s1;
                            } else {
                              peg$currPos = s0;
                              s0 = peg$c0;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseUnion() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

      s0 = peg$currPos;
      s1 = peg$parseUnionToken();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseIdentifier();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsexsdAll();
          if (s3 === peg$FAILED) {
            s3 = peg$c25;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 123) {
                s5 = peg$c75;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c76); }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                if (s6 !== peg$FAILED) {
                  s7 = [];
                  s8 = peg$parseField();
                  while (s8 !== peg$FAILED) {
                    s7.push(s8);
                    s8 = peg$parseField();
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parse__();
                    if (s8 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 125) {
                        s9 = peg$c77;
                        peg$currPos++;
                      } else {
                        s9 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c78); }
                      }
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parse__();
                        if (s10 !== peg$FAILED) {
                          s11 = peg$parseTypeAnnotations();
                          if (s11 === peg$FAILED) {
                            s11 = peg$c25;
                          }
                          if (s11 !== peg$FAILED) {
                            peg$reportedPos = s0;
                            s1 = peg$c100(s2, s7, s11);
                            s0 = s1;
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsexsdAll() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 7) === peg$c101) {
        s1 = peg$c101;
        peg$currPos += 7;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c102); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsexsdOptional() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 12) === peg$c103) {
        s1 = peg$c103;
        peg$currPos += 12;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c104); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsexsdNillable() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 12) === peg$c105) {
        s1 = peg$c105;
        peg$currPos += 12;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c106); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsexsdAttributes() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 14) === peg$c107) {
        s1 = peg$c107;
        peg$currPos += 14;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c108); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 123) {
            s3 = peg$c75;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c76); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            if (s4 !== peg$FAILED) {
              s5 = [];
              s6 = peg$parseField();
              while (s6 !== peg$FAILED) {
                s5.push(s6);
                s6 = peg$parseField();
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                if (s6 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 125) {
                    s7 = peg$c77;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c78); }
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parse__();
                    if (s8 !== peg$FAILED) {
                      s1 = [s1, s2, s3, s4, s5, s6, s7, s8];
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseException() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 9) === peg$c109) {
        s1 = peg$c109;
        peg$currPos += 9;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c110); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseIdentifier();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 123) {
              s4 = peg$c75;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c76); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse__();
              if (s5 !== peg$FAILED) {
                s6 = [];
                s7 = peg$parseField();
                while (s7 !== peg$FAILED) {
                  s6.push(s7);
                  s7 = peg$parseField();
                }
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse__();
                  if (s7 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 125) {
                      s8 = peg$c77;
                      peg$currPos++;
                    } else {
                      s8 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c78); }
                    }
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parse__();
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parseTypeAnnotations();
                        if (s10 === peg$FAILED) {
                          s10 = peg$c25;
                        }
                        if (s10 !== peg$FAILED) {
                          s11 = peg$parse__();
                          if (s11 !== peg$FAILED) {
                            peg$reportedPos = s0;
                            s1 = peg$c111(s3, s6, s10);
                            s0 = s1;
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseService() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 7) === peg$c112) {
        s1 = peg$c112;
        peg$currPos += 7;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c113); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseIdentifier();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseextends();
            if (s4 === peg$FAILED) {
              s4 = peg$c25;
            }
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 123) {
                s5 = peg$c75;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c76); }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                if (s6 !== peg$FAILED) {
                  s7 = [];
                  s8 = peg$parsefunction();
                  while (s8 !== peg$FAILED) {
                    s7.push(s8);
                    s8 = peg$parsefunction();
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parse__();
                    if (s8 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 125) {
                        s9 = peg$c77;
                        peg$currPos++;
                      } else {
                        s9 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c78); }
                      }
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parse__();
                        if (s10 !== peg$FAILED) {
                          s11 = peg$parseTypeAnnotations();
                          if (s11 === peg$FAILED) {
                            s11 = peg$c25;
                          }
                          if (s11 !== peg$FAILED) {
                            peg$reportedPos = s0;
                            s1 = peg$c114(s3, s4, s7, s11);
                            s0 = s1;
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseextends() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 7) === peg$c115) {
        s1 = peg$c115;
        peg$currPos += 7;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c116); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseIdentifier();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c117(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsefunction() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14;

      s0 = peg$currPos;
      s1 = peg$parse__();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseoneway();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseFunctionType();
          if (s3 !== peg$FAILED) {
            s4 = peg$parseIdentifier();
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 40) {
                s5 = peg$c118;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c119); }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                if (s6 !== peg$FAILED) {
                  s7 = [];
                  s8 = peg$parseField();
                  while (s8 !== peg$FAILED) {
                    s7.push(s8);
                    s8 = peg$parseField();
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parse__();
                    if (s8 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 41) {
                        s9 = peg$c120;
                        peg$currPos++;
                      } else {
                        s9 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c121); }
                      }
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parse__();
                        if (s10 !== peg$FAILED) {
                          s11 = peg$parsethrowz();
                          if (s11 === peg$FAILED) {
                            s11 = peg$c25;
                          }
                          if (s11 !== peg$FAILED) {
                            s12 = peg$parseTypeAnnotations();
                            if (s12 === peg$FAILED) {
                              s12 = peg$c25;
                            }
                            if (s12 !== peg$FAILED) {
                              s13 = peg$parseListSeparator();
                              if (s13 === peg$FAILED) {
                                s13 = peg$c25;
                              }
                              if (s13 !== peg$FAILED) {
                                s14 = peg$parse_();
                                if (s14 !== peg$FAILED) {
                                  peg$reportedPos = s0;
                                  s1 = peg$c122(s2, s3, s4, s7, s11, s12);
                                  s0 = s1;
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$c0;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$c0;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$c0;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseoneway() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c123) {
        s1 = peg$c123;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c124); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c125();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = [];
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c126();
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parsethrowz() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c127) {
        s1 = peg$c127;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c128); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 40) {
            s3 = peg$c118;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c119); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            if (s4 !== peg$FAILED) {
              s5 = [];
              s6 = peg$parseField();
              while (s6 !== peg$FAILED) {
                s5.push(s6);
                s6 = peg$parseField();
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                if (s6 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 41) {
                    s7 = peg$c120;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c121); }
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parse__();
                    if (s8 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c129(s5);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseField() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseFieldIdentifier();
        if (s2 === peg$FAILED) {
          s2 = peg$c25;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseFieldRequiredness();
          if (s3 === peg$FAILED) {
            s3 = peg$c25;
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parseFieldType();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseRecursive();
              if (s5 === peg$FAILED) {
                s5 = peg$c25;
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parseIdentifierName();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parseFieldValue();
                  if (s7 === peg$FAILED) {
                    s7 = peg$c25;
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parseXsdFieldOptions();
                    if (s8 === peg$FAILED) {
                      s8 = peg$c25;
                    }
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parseTypeAnnotations();
                      if (s9 === peg$FAILED) {
                        s9 = peg$c25;
                      }
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parseListSeparator();
                        if (s10 === peg$FAILED) {
                          s10 = peg$c25;
                        }
                        if (s10 !== peg$FAILED) {
                          peg$reportedPos = s0;
                          s1 = peg$c130(s2, s3, s4, s5, s6, s7, s9);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseRecursive() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 38) {
        s1 = peg$c131;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c132); }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$c25;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c133();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = [];
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c134();
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parseFieldIdentifier() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseIntConstant();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 58) {
          s2 = peg$c94;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c95); }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c135(s1);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseFieldRequiredness() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 8) === peg$c136) {
        s1 = peg$c136;
        peg$currPos += 8;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c137); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c138();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 8) === peg$c139) {
          s1 = peg$c139;
          peg$currPos += 8;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c140); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse__();
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c141();
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }

      return s0;
    }

    function peg$parseFieldValue() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 61) {
        s1 = peg$c80;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c81); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseConstValue();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c142(s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseFunctionType() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c143) {
        s1 = peg$c143;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c144); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c145();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseFieldType();
      }

      return s0;
    }

    function peg$parseFieldType() {
      var s0;

      s0 = peg$parseBaseType();
      if (s0 === peg$FAILED) {
        s0 = peg$parseContainerType();
        if (s0 === peg$FAILED) {
          s0 = peg$parseIdentifier();
        }
      }

      return s0;
    }

    function peg$parseXsdFieldOptions() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parsexsdOptional();
      if (s1 === peg$FAILED) {
        s1 = peg$c25;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parsexsdNillable();
        if (s2 === peg$FAILED) {
          s2 = peg$c25;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parsexsdAttributes();
          if (s3 === peg$FAILED) {
            s3 = peg$c25;
          }
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseBaseType() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$parseBaseTypeName();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseTypeAnnotations();
          if (s3 === peg$FAILED) {
            s3 = peg$c25;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c146(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseBaseTypeName() {
      var s0;

      if (input.substr(peg$currPos, 4) === peg$c147) {
        s0 = peg$c147;
        peg$currPos += 4;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c148); }
      }
      if (s0 === peg$FAILED) {
        if (input.substr(peg$currPos, 4) === peg$c149) {
          s0 = peg$c149;
          peg$currPos += 4;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c150); }
        }
        if (s0 === peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c151) {
            s0 = peg$c151;
            peg$currPos += 2;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c152); }
          }
          if (s0 === peg$FAILED) {
            if (input.substr(peg$currPos, 3) === peg$c153) {
              s0 = peg$c153;
              peg$currPos += 3;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c154); }
            }
            if (s0 === peg$FAILED) {
              if (input.substr(peg$currPos, 3) === peg$c155) {
                s0 = peg$c155;
                peg$currPos += 3;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c156); }
              }
              if (s0 === peg$FAILED) {
                if (input.substr(peg$currPos, 3) === peg$c157) {
                  s0 = peg$c157;
                  peg$currPos += 3;
                } else {
                  s0 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c158); }
                }
                if (s0 === peg$FAILED) {
                  if (input.substr(peg$currPos, 6) === peg$c159) {
                    s0 = peg$c159;
                    peg$currPos += 6;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c160); }
                  }
                  if (s0 === peg$FAILED) {
                    if (input.substr(peg$currPos, 6) === peg$c161) {
                      s0 = peg$c161;
                      peg$currPos += 6;
                    } else {
                      s0 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c162); }
                    }
                    if (s0 === peg$FAILED) {
                      if (input.substr(peg$currPos, 6) === peg$c163) {
                        s0 = peg$c163;
                        peg$currPos += 6;
                      } else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c164); }
                      }
                      if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 5) === peg$c165) {
                          s0 = peg$c165;
                          peg$currPos += 5;
                        } else {
                          s0 = peg$FAILED;
                          if (peg$silentFails === 0) { peg$fail(peg$c166); }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parseContainerType() {
      var s0;

      s0 = peg$parseMapType();
      if (s0 === peg$FAILED) {
        s0 = peg$parseSetType();
        if (s0 === peg$FAILED) {
          s0 = peg$parseListType();
        }
      }

      return s0;
    }

    function peg$parseMapType() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c167) {
        s1 = peg$c167;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c168); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsecppType();
          if (s3 === peg$FAILED) {
            s3 = peg$c25;
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 60) {
              s4 = peg$c169;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c170); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse__();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseFieldType();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse__();
                  if (s7 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 44) {
                      s8 = peg$c70;
                      peg$currPos++;
                    } else {
                      s8 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c71); }
                    }
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parse__();
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parseFieldType();
                        if (s10 !== peg$FAILED) {
                          s11 = peg$parse__();
                          if (s11 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 62) {
                              s12 = peg$c171;
                              peg$currPos++;
                            } else {
                              s12 = peg$FAILED;
                              if (peg$silentFails === 0) { peg$fail(peg$c172); }
                            }
                            if (s12 !== peg$FAILED) {
                              s13 = peg$parse__();
                              if (s13 !== peg$FAILED) {
                                s14 = peg$parseTypeAnnotations();
                                if (s14 === peg$FAILED) {
                                  s14 = peg$c25;
                                }
                                if (s14 !== peg$FAILED) {
                                  peg$reportedPos = s0;
                                  s1 = peg$c173(s6, s10, s14);
                                  s0 = s1;
                                } else {
                                  peg$currPos = s0;
                                  s0 = peg$c0;
                                }
                              } else {
                                peg$currPos = s0;
                                s0 = peg$c0;
                              }
                            } else {
                              peg$currPos = s0;
                              s0 = peg$c0;
                            }
                          } else {
                            peg$currPos = s0;
                            s0 = peg$c0;
                          }
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseSetType() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c174) {
        s1 = peg$c174;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c175); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsecppType();
          if (s3 === peg$FAILED) {
            s3 = peg$c25;
          }
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 60) {
              s4 = peg$c169;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c170); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse__();
              if (s5 !== peg$FAILED) {
                s6 = peg$parseFieldType();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse__();
                  if (s7 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 62) {
                      s8 = peg$c171;
                      peg$currPos++;
                    } else {
                      s8 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c172); }
                    }
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parse__();
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parseTypeAnnotations();
                        if (s10 === peg$FAILED) {
                          s10 = peg$c25;
                        }
                        if (s10 !== peg$FAILED) {
                          peg$reportedPos = s0;
                          s1 = peg$c176(s6, s10);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseListType() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c177) {
        s1 = peg$c177;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c178); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 60) {
            s3 = peg$c169;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c170); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            if (s4 !== peg$FAILED) {
              s5 = peg$parseFieldType();
              if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                if (s6 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 62) {
                    s7 = peg$c171;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c172); }
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parse__();
                    if (s8 !== peg$FAILED) {
                      s9 = peg$parseTypeAnnotations();
                      if (s9 === peg$FAILED) {
                        s9 = peg$c25;
                      }
                      if (s9 !== peg$FAILED) {
                        s10 = peg$parsecppType();
                        if (s10 === peg$FAILED) {
                          s10 = peg$c25;
                        }
                        if (s10 !== peg$FAILED) {
                          peg$reportedPos = s0;
                          s1 = peg$c179(s5, s9);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c0;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c0;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c0;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c0;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parsecppType() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 8) === peg$c180) {
        s1 = peg$c180;
        peg$currPos += 8;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c181); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseString();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseTypeAnnotations() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c118;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c119); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseTypeAnnotation();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseTypeAnnotation();
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            if (s4 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 41) {
                s5 = peg$c120;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c121); }
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parse__();
                if (s6 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c182(s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c0;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseTypeAnnotation() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = peg$parseIdentifierName();
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 61) {
          s3 = peg$c80;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c81); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parseString();
            if (s5 !== peg$FAILED) {
              peg$reportedPos = s2;
              s3 = peg$c183(s5);
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$c0;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c0;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 === peg$FAILED) {
          s2 = peg$c25;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseListSeparator();
          if (s3 === peg$FAILED) {
            s3 = peg$c25;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c184(s1, s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseIntConstant() {
      var s0;

      s0 = peg$parseHexIntegerLiteral();
      if (s0 === peg$FAILED) {
        s0 = peg$parseSignedInteger();
      }

      return s0;
    }

    function peg$parseword() {
      var s0, s1;

      s0 = [];
      if (peg$c185.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c186); }
      }
      if (s1 !== peg$FAILED) {
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          if (peg$c185.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c186); }
          }
        }
      } else {
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseIdentifier() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseIdentifierName();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse__();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c187(s1);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseIdentifierName() {
      var s0, s1, s2, s3, s4;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      s2 = peg$parseReservedWord();
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = peg$c189;
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseIdentifierStart();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseIdentifierPart();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseIdentifierPart();
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c190(s2, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c188); }
      }

      return s0;
    }

    function peg$parseIdentifierStart() {
      var s0;

      s0 = peg$parseUnicodeLetter();
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 95) {
          s0 = peg$c191;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c192); }
        }
      }

      return s0;
    }

    function peg$parseIdentifierPart() {
      var s0;

      s0 = peg$parseIdentifierStart();
      if (s0 === peg$FAILED) {
        s0 = peg$parseUnicodeCombiningMark();
        if (s0 === peg$FAILED) {
          s0 = peg$parseNd();
          if (s0 === peg$FAILED) {
            s0 = peg$parsePc();
            if (s0 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 8204) {
                s0 = peg$c193;
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c194); }
              }
              if (s0 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 8205) {
                  s0 = peg$c195;
                  peg$currPos++;
                } else {
                  s0 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c196); }
                }
                if (s0 === peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 46) {
                    s0 = peg$c197;
                    peg$currPos++;
                  } else {
                    s0 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c198); }
                  }
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parseUnicodeLetter() {
      var s0;

      s0 = peg$parseLu();
      if (s0 === peg$FAILED) {
        s0 = peg$parseLl();
        if (s0 === peg$FAILED) {
          s0 = peg$parseLt();
          if (s0 === peg$FAILED) {
            s0 = peg$parseLm();
            if (s0 === peg$FAILED) {
              s0 = peg$parseLo();
              if (s0 === peg$FAILED) {
                s0 = peg$parseNl();
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parseUnicodeCombiningMark() {
      var s0;

      s0 = peg$parseMn();
      if (s0 === peg$FAILED) {
        s0 = peg$parseMc();
      }

      return s0;
    }

    function peg$parseLetter() {
      var s0;

      if (peg$c199.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c200); }
      }

      return s0;
    }

    function peg$parseSTIdentifier() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parseSTIdentifierName();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c201(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseSTIdentifierName() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      s2 = peg$parsecontainer_type_tokens();
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = peg$c189;
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseword();
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parse__() {
      var s0, s1;

      s0 = [];
      s1 = peg$parseWhiteSpace();
      if (s1 === peg$FAILED) {
        s1 = peg$parseLineTerminatorSequence();
        if (s1 === peg$FAILED) {
          s1 = peg$parseComment();
        }
      }
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        s1 = peg$parseWhiteSpace();
        if (s1 === peg$FAILED) {
          s1 = peg$parseLineTerminatorSequence();
          if (s1 === peg$FAILED) {
            s1 = peg$parseComment();
          }
        }
      }

      return s0;
    }

    function peg$parse_() {
      var s0, s1;

      s0 = [];
      s1 = peg$parseWhiteSpace();
      if (s1 === peg$FAILED) {
        s1 = peg$parseMultiLineCommentNoLineTerminator();
      }
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        s1 = peg$parseWhiteSpace();
        if (s1 === peg$FAILED) {
          s1 = peg$parseMultiLineCommentNoLineTerminator();
        }
      }

      return s0;
    }

    function peg$parsecontainer_type_tokens() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c167) {
        s1 = peg$c167;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c168); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 3) === peg$c174) {
          s1 = peg$c174;
          peg$currPos += 3;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c175); }
        }
        if (s1 === peg$FAILED) {
          if (input.substr(peg$currPos, 4) === peg$c177) {
            s1 = peg$c177;
            peg$currPos += 4;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c178); }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        if (peg$c202.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c203); }
        }
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c189;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseSourceCharacter() {
      var s0;

      if (input.length > peg$currPos) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c204); }
      }

      return s0;
    }

    function peg$parseWhiteSpace() {
      var s0, s1;

      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 9) {
        s0 = peg$c206;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c207); }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 11) {
          s0 = peg$c208;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c209); }
        }
        if (s0 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 12) {
            s0 = peg$c210;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c211); }
          }
          if (s0 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 32) {
              s0 = peg$c212;
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c213); }
            }
            if (s0 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 160) {
                s0 = peg$c214;
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c215); }
              }
              if (s0 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 65279) {
                  s0 = peg$c216;
                  peg$currPos++;
                } else {
                  s0 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c217); }
                }
                if (s0 === peg$FAILED) {
                  s0 = peg$parseZs();
                }
              }
            }
          }
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c205); }
      }

      return s0;
    }

    function peg$parseLineTerminator() {
      var s0;

      if (peg$c218.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c219); }
      }

      return s0;
    }

    function peg$parseLineTerminatorSequence() {
      var s0, s1;

      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 10) {
        s0 = peg$c221;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c222); }
      }
      if (s0 === peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c223) {
          s0 = peg$c223;
          peg$currPos += 2;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c224); }
        }
        if (s0 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 13) {
            s0 = peg$c225;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c226); }
          }
          if (s0 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 8232) {
              s0 = peg$c227;
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c228); }
            }
            if (s0 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 8233) {
                s0 = peg$c229;
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c230); }
              }
            }
          }
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c220); }
      }

      return s0;
    }

    function peg$parseComment() {
      var s0, s1;

      peg$silentFails++;
      s0 = peg$parseMultiLineComment();
      if (s0 === peg$FAILED) {
        s0 = peg$parseSingleLineComment();
        if (s0 === peg$FAILED) {
          s0 = peg$parseUnixComment();
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c231); }
      }

      return s0;
    }

    function peg$parseMultiLineComment() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c232) {
        s1 = peg$c232;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c233); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        if (input.substr(peg$currPos, 2) === peg$c234) {
          s5 = peg$c234;
          peg$currPos += 2;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c235); }
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = peg$c189;
        } else {
          peg$currPos = s4;
          s4 = peg$c0;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseSourceCharacter();
          if (s5 !== peg$FAILED) {
            peg$reportedPos = s3;
            s4 = peg$c236(s5);
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$currPos;
          peg$silentFails++;
          if (input.substr(peg$currPos, 2) === peg$c234) {
            s5 = peg$c234;
            peg$currPos += 2;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c235); }
          }
          peg$silentFails--;
          if (s5 === peg$FAILED) {
            s4 = peg$c189;
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseSourceCharacter();
            if (s5 !== peg$FAILED) {
              peg$reportedPos = s3;
              s4 = peg$c236(s5);
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c234) {
            s3 = peg$c234;
            peg$currPos += 2;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c235); }
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c237(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseMultiLineCommentNoLineTerminator() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c232) {
        s1 = peg$c232;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c233); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        if (input.substr(peg$currPos, 2) === peg$c234) {
          s5 = peg$c234;
          peg$currPos += 2;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c235); }
        }
        if (s5 === peg$FAILED) {
          s5 = peg$parseLineTerminator();
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = peg$c189;
        } else {
          peg$currPos = s4;
          s4 = peg$c0;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseSourceCharacter();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$currPos;
          peg$silentFails++;
          if (input.substr(peg$currPos, 2) === peg$c234) {
            s5 = peg$c234;
            peg$currPos += 2;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c235); }
          }
          if (s5 === peg$FAILED) {
            s5 = peg$parseLineTerminator();
          }
          peg$silentFails--;
          if (s5 === peg$FAILED) {
            s4 = peg$c189;
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseSourceCharacter();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c234) {
            s3 = peg$c234;
            peg$currPos += 2;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c235); }
          }
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseSingleLineComment() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2) === peg$c238) {
        s1 = peg$c238;
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c239); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = peg$parseLineTerminator();
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = peg$c189;
        } else {
          peg$currPos = s4;
          s4 = peg$c0;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseSourceCharacter();
          if (s5 !== peg$FAILED) {
            peg$reportedPos = s3;
            s4 = peg$c240(s5);
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$currPos;
          peg$silentFails++;
          s5 = peg$parseLineTerminator();
          peg$silentFails--;
          if (s5 === peg$FAILED) {
            s4 = peg$c189;
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseSourceCharacter();
            if (s5 !== peg$FAILED) {
              peg$reportedPos = s3;
              s4 = peg$c240(s5);
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c237(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseUnixComment() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 35) {
        s1 = peg$c241;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c242); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = peg$parseLineTerminator();
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = peg$c189;
        } else {
          peg$currPos = s4;
          s4 = peg$c0;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseSourceCharacter();
          if (s5 !== peg$FAILED) {
            peg$reportedPos = s3;
            s4 = peg$c240(s5);
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$currPos;
          peg$silentFails++;
          s5 = peg$parseLineTerminator();
          peg$silentFails--;
          if (s5 === peg$FAILED) {
            s4 = peg$c189;
          } else {
            peg$currPos = s4;
            s4 = peg$c0;
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseSourceCharacter();
            if (s5 !== peg$FAILED) {
              peg$reportedPos = s3;
              s4 = peg$c240(s5);
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c237(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseStringLiteral() {
      var s0, s1;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = peg$parseString();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c244(s1);
      }
      s0 = s1;
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c243); }
      }

      return s0;
    }

    function peg$parseString() {
      var s0, s1, s2, s3, s4;

      peg$silentFails++;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 34) {
        s1 = peg$c245;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c246); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseDoubleStringCharacter();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseDoubleStringCharacter();
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 34) {
            s3 = peg$c245;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c246); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse__();
            if (s4 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c247(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 39) {
          s1 = peg$c248;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c249); }
        }
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parseSingleStringCharacter();
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseSingleStringCharacter();
          }
          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 39) {
              s3 = peg$c248;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c249); }
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parse__();
              if (s4 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c247(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c0;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c243); }
      }

      return s0;
    }

    function peg$parseDoubleStringCharacter() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 34) {
        s2 = peg$c245;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c246); }
      }
      if (s2 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 92) {
          s2 = peg$c250;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c251); }
        }
        if (s2 === peg$FAILED) {
          s2 = peg$parseLineTerminator();
        }
      }
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = peg$c189;
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseSourceCharacter();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c252();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 92) {
          s1 = peg$c250;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c251); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parseEscapeSequence();
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c253(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$parseLineContinuation();
        }
      }

      return s0;
    }

    function peg$parseSingleStringCharacter() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 39) {
        s2 = peg$c248;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c249); }
      }
      if (s2 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 92) {
          s2 = peg$c250;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c251); }
        }
        if (s2 === peg$FAILED) {
          s2 = peg$parseLineTerminator();
        }
      }
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = peg$c189;
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseSourceCharacter();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c252();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 92) {
          s1 = peg$c250;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c251); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parseEscapeSequence();
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c253(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$parseLineContinuation();
        }
      }

      return s0;
    }

    function peg$parseLineContinuation() {
      var s0, s1, s2;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 92) {
        s1 = peg$c250;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c251); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseLineTerminatorSequence();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c254();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseEscapeSequence() {
      var s0, s1, s2, s3;

      s0 = peg$parseCharacterEscapeSequence();
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 48) {
          s1 = peg$c255;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c256); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$currPos;
          peg$silentFails++;
          s3 = peg$parseDecimalDigit();
          peg$silentFails--;
          if (s3 === peg$FAILED) {
            s2 = peg$c189;
          } else {
            peg$currPos = s2;
            s2 = peg$c0;
          }
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c257();
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$parseHexEscapeSequence();
          if (s0 === peg$FAILED) {
            s0 = peg$parseUnicodeEscapeSequence();
          }
        }
      }

      return s0;
    }

    function peg$parseCharacterEscapeSequence() {
      var s0;

      s0 = peg$parseSingleEscapeCharacter();
      if (s0 === peg$FAILED) {
        s0 = peg$parseNonEscapeCharacter();
      }

      return s0;
    }

    function peg$parseSingleEscapeCharacter() {
      var s0, s1;

      if (input.charCodeAt(peg$currPos) === 39) {
        s0 = peg$c248;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c249); }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 34) {
          s0 = peg$c245;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c246); }
        }
        if (s0 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 92) {
            s0 = peg$c250;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c251); }
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 98) {
              s1 = peg$c258;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c259); }
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c260();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 102) {
                s1 = peg$c261;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c262); }
              }
              if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c263();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 110) {
                  s1 = peg$c264;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c265); }
                }
                if (s1 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c266();
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 114) {
                    s1 = peg$c267;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c268); }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c269();
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 116) {
                      s1 = peg$c270;
                      peg$currPos++;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c271); }
                    }
                    if (s1 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c272();
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      if (input.charCodeAt(peg$currPos) === 118) {
                        s1 = peg$c273;
                        peg$currPos++;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c274); }
                      }
                      if (s1 !== peg$FAILED) {
                        peg$reportedPos = s0;
                        s1 = peg$c275();
                      }
                      s0 = s1;
                    }
                  }
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parseNonEscapeCharacter() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      s2 = peg$parseEscapeCharacter();
      if (s2 === peg$FAILED) {
        s2 = peg$parseLineTerminator();
      }
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = peg$c189;
      } else {
        peg$currPos = s1;
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseSourceCharacter();
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c252();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseEscapeCharacter() {
      var s0;

      s0 = peg$parseSingleEscapeCharacter();
      if (s0 === peg$FAILED) {
        s0 = peg$parseDecimalDigit();
        if (s0 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 120) {
            s0 = peg$c276;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c277); }
          }
          if (s0 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 117) {
              s0 = peg$c278;
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c279); }
            }
          }
        }
      }

      return s0;
    }

    function peg$parseHexEscapeSequence() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 120) {
        s1 = peg$c276;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c277); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = peg$currPos;
        s4 = peg$parseHexDigit();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseHexDigit();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        if (s3 !== peg$FAILED) {
          s3 = input.substring(s2, peg$currPos);
        }
        s2 = s3;
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c280(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseUnicodeEscapeSequence() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 117) {
        s1 = peg$c278;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c279); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = peg$currPos;
        s4 = peg$parseHexDigit();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseHexDigit();
          if (s5 !== peg$FAILED) {
            s6 = peg$parseHexDigit();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseHexDigit();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c0;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c0;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c0;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$c0;
        }
        if (s3 !== peg$FAILED) {
          s3 = input.substring(s2, peg$currPos);
        }
        s2 = s3;
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c280(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseHexIntegerLiteral() {
      var s0, s1, s2, s3, s4;

      peg$silentFails++;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2).toLowerCase() === peg$c282) {
        s1 = input.substr(peg$currPos, 2);
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c283); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        s3 = [];
        s4 = peg$parseHexDigit();
        if (s4 !== peg$FAILED) {
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseHexDigit();
          }
        } else {
          s3 = peg$c0;
        }
        if (s3 !== peg$FAILED) {
          s3 = input.substring(s2, peg$currPos);
        }
        s2 = s3;
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c284(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c281); }
      }

      return s0;
    }

    function peg$parseHexDigit() {
      var s0;

      if (peg$c285.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c286); }
      }

      return s0;
    }

    function peg$parseNumberLiteral() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$parseHexIntegerLiteral();
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (peg$c288.test(input.charAt(peg$currPos))) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c289); }
        }
        if (s1 === peg$FAILED) {
          s1 = peg$c25;
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parseDecimalLiteral();
          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c290(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$parseSignedInteger();
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c287); }
      }

      return s0;
    }

    function peg$parseDecimalLiteral() {
      var s0, s1, s2, s3, s4, s5;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseDecimalDigit();
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseDecimalDigit();
        }
      } else {
        s1 = peg$c0;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 46) {
          s3 = peg$c197;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c198); }
        }
        if (s3 !== peg$FAILED) {
          s4 = [];
          s5 = peg$parseDecimalDigit();
          if (s5 !== peg$FAILED) {
            while (s5 !== peg$FAILED) {
              s4.push(s5);
              s5 = peg$parseDecimalDigit();
            }
          } else {
            s4 = peg$c0;
          }
          if (s4 !== peg$FAILED) {
            s3 = [s3, s4];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$c0;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 === peg$FAILED) {
          s2 = peg$c25;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseExponentPart();
          if (s3 === peg$FAILED) {
            s3 = peg$c25;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c292();
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 46) {
          s1 = peg$c197;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c198); }
        }
        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parseDecimalDigit();
          if (s3 !== peg$FAILED) {
            while (s3 !== peg$FAILED) {
              s2.push(s3);
              s3 = peg$parseDecimalDigit();
            }
          } else {
            s2 = peg$c0;
          }
          if (s2 !== peg$FAILED) {
            s3 = peg$parseExponentPart();
            if (s3 === peg$FAILED) {
              s3 = peg$c25;
            }
            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c292();
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = [];
          s2 = peg$parseDecimalDigit();
          if (s2 !== peg$FAILED) {
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              s2 = peg$parseDecimalDigit();
            }
          } else {
            s1 = peg$c0;
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parseExponentPart();
            if (s2 === peg$FAILED) {
              s2 = peg$c25;
            }
            if (s2 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c292();
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c0;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        }
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c291); }
      }

      return s0;
    }

    function peg$parseExponentPart() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseExponentIndicator();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseSignedInteger();
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseExponentIndicator() {
      var s0;

      if (input.substr(peg$currPos, 1).toLowerCase() === peg$c293) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c294); }
      }

      return s0;
    }

    function peg$parseDecimalIntegerLiteral() {
      var s0, s1;

      s0 = [];
      s1 = peg$parseDecimalDigit();
      if (s1 !== peg$FAILED) {
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          s1 = peg$parseDecimalDigit();
        }
      } else {
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseDecimalDigit() {
      var s0;

      if (peg$c295.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c296); }
      }

      return s0;
    }

    function peg$parseNonZeroDigit() {
      var s0;

      if (peg$c297.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c298); }
      }

      return s0;
    }

    function peg$parseSignedInteger() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (peg$c288.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c289); }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$c25;
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseDecimalDigit();
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseDecimalDigit();
          }
        } else {
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c299();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseIncludeToken() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 7) === peg$c300) {
        s1 = peg$c300;
        peg$currPos += 7;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c301); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseIdentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c189;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse__();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseCppIncludeToken() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 11) === peg$c302) {
        s1 = peg$c302;
        peg$currPos += 11;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c303); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseIdentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c189;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse__();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseNamespaceToken() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 9) === peg$c304) {
        s1 = peg$c304;
        peg$currPos += 9;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c305); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseIdentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c189;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse__();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseTypedefToken() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 7) === peg$c306) {
        s1 = peg$c306;
        peg$currPos += 7;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c307); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseIdentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c189;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse__();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseEnumToken() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c308) {
        s1 = peg$c308;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c309); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseIdentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c189;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse__();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseSenumToken() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5) === peg$c310) {
        s1 = peg$c310;
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c311); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseIdentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c189;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse__();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseConstToken() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5) === peg$c312) {
        s1 = peg$c312;
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c313); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseIdentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c189;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse__();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseVoidToken() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c143) {
        s1 = peg$c143;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c144); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseIdentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c189;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse__();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseSetToken() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c174) {
        s1 = peg$c174;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c175); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseIdentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c189;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse__();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseMapToken() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3) === peg$c167) {
        s1 = peg$c167;
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c168); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseIdentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c189;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse__();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseListToken() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c177) {
        s1 = peg$c177;
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c178); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseIdentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c189;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse__();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseUnionToken() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5) === peg$c314) {
        s1 = peg$c314;
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c315); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseIdentifierPart();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = peg$c189;
        } else {
          peg$currPos = s2;
          s2 = peg$c0;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parse__();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c0;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c0;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c0;
      }

      return s0;
    }

    function peg$parseReservedWord() {
      var s0;

      s0 = peg$parseVoidToken();
      if (s0 === peg$FAILED) {
        s0 = peg$parseSetToken();
        if (s0 === peg$FAILED) {
          s0 = peg$parseMapToken();
          if (s0 === peg$FAILED) {
            s0 = peg$parseListToken();
          }
        }
      }

      return s0;
    }

    function peg$parseLl() {
      var s0;

      if (peg$c316.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c317); }
      }

      return s0;
    }

    function peg$parseLm() {
      var s0;

      if (peg$c318.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c319); }
      }

      return s0;
    }

    function peg$parseLo() {
      var s0;

      if (peg$c320.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c321); }
      }

      return s0;
    }

    function peg$parseLt() {
      var s0;

      if (peg$c322.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c323); }
      }

      return s0;
    }

    function peg$parseLu() {
      var s0;

      if (peg$c324.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c325); }
      }

      return s0;
    }

    function peg$parseMc() {
      var s0;

      if (peg$c326.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c327); }
      }

      return s0;
    }

    function peg$parseMn() {
      var s0;

      if (peg$c328.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c329); }
      }

      return s0;
    }

    function peg$parseNd() {
      var s0;

      if (peg$c330.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c331); }
      }

      return s0;
    }

    function peg$parseNl() {
      var s0;

      if (peg$c332.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c333); }
      }

      return s0;
    }

    function peg$parsePc() {
      var s0;

      if (peg$c334.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c335); }
      }

      return s0;
    }

    function peg$parseZs() {
      var s0;

      if (peg$c336.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c337); }
      }

      return s0;
    }


        var ast = _dereq_('./ast');


    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse:       parse
  };
})();

},{"./ast":2}],104:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint max-statements:[1, 45] */
'use strict';

var assert = _dereq_('assert');
var util = _dereq_('util');
var fs = _dereq_('fs');
var path = _dereq_('path');
var idl = _dereq_('./thrift-idl');
var Result = _dereq_('bufrw/result');
var lcp = _dereq_('./lib/lcp');
var asyncEach = _dereq_('./lib/async-each.js');

var ThriftService = _dereq_('./service').ThriftService;
var ThriftStruct = _dereq_('./struct').ThriftStruct;
var ThriftUnion = _dereq_('./union').ThriftUnion;
var ThriftEnum = _dereq_('./enum').ThriftEnum;

var ThriftVoid = _dereq_('./void').ThriftVoid;
var ThriftBoolean = _dereq_('./boolean').ThriftBoolean;
var ThriftString = _dereq_('./string').ThriftString;
var ThriftBinary = _dereq_('./binary').ThriftBinary;
var ThriftI8 = _dereq_('./i8').ThriftI8;
var ThriftI16 = _dereq_('./i16').ThriftI16;
var ThriftI32 = _dereq_('./i32').ThriftI32;
var ThriftI64 = _dereq_('./i64').ThriftI64;
var ThriftDouble = _dereq_('./double').ThriftDouble;
var ThriftList = _dereq_('./list').ThriftList;
var ThriftSet = _dereq_('./set').ThriftSet;
var ThriftMap = _dereq_('./map').ThriftMap;
var ThriftConst = _dereq_('./const').ThriftConst;
var ThriftTypedef = _dereq_('./typedef').ThriftTypedef;

var Literal = _dereq_('./ast').Literal;

var Message = _dereq_('./message').Message;
var messageExceptionDef = _dereq_('./message').exceptionDef;
var messageExceptionTypesDef = _dereq_('./message').exceptionTypesDef;

var validThriftIdentifierRE = /^[a-zA-Z_][a-zA-Z0-9_\.]+$/;

function Thrift(options) {
    assert(options, 'options required');
    assert(typeof options === 'object', 'options must be object');
    assert(options.source || options.entryPoint, 'opts.entryPoint required');

    // Coerce weakly-deprecated single include usage
    if (options.source) {
        assert(typeof options.source === 'string', 'source must be string');
        options.entryPoint = 'service.thrift';
        options.idls = {'service.thrift': options.source};
    }

    // filename to parse status
    this.parsed = options.parsed || Object.create(null);
    // filename to source
    this.idls = options.idls || Object.create(null);
    // filename to ast
    this.asts = options.asts || Object.create(null);
    // filename to Thrift instance
    this.memo = options.memo || Object.create(null);

    // Grant file system access for resolving includes, as opposed to lifting
    // includes from provided options.idls alone.
    this.fs = options.fs;
    if (options.allowFilesystemAccess) {
        this.fs = fs;
    }

    this.strict = options.strict !== undefined ? options.strict : true;
    this.defaultValueDefinition = new Literal(options.defaultAsUndefined ? undefined : null);
    this.defaultAsUndefined = options.defaultAsUndefined;

    // [name] :Thrift* implementing {compile, link, &c}
    // Heterogenous Thrift model objects by name in a consolidated name-space
    // to prevent duplicate references with the same and different types, like
    // a service and a struct with the same name in the scope of a Thrift IDL
    // module:
    this.models = Object.create(null);
    // [serviceName][functionName] :{rw, Arguments, Result}
    this.services = Object.create(null);
    // [constName] :Value
    this.consts = Object.create(null);
    // [enumName][name] :String
    this.enums = Object.create(null);
    // [structName] :Constructor
    this.structs = Object.create(null);
    // [exceptionName] :Constructor
    this.exceptions = Object.create(null);
    // [unionName] :Constructor
    this.unions = Object.create(null);
    // [typedefName] :Constructor (might be Array, Object, or Number)
    this.typedefs = Object.create(null);
    // [moduleName] :Thrift
    // Child modules indexed by their local alias.
    this.modules = Object.create(null);

    this.surface = this;

    this.linked = false;
    this.noLink = options.noLink;
    this.allowIncludeAlias = options.allowIncludeAlias || false;
    this.allowOptionalArguments = options.allowOptionalArguments || false;

    this.filename = options.entryPoint;
    this.dirname = path.dirname(this.filename);
    this.memo[this.filename] = this;

    this.exception = null;

    var cb = options.callback;
    if (cb) {
        var thrift = this;
        thrift.load(thrift.filename, function (err) {
            if (err) {
                return cb(err, undefined);
            }
            try {
                thrift.compileAndLink();
            } catch (err) {
                return cb(err, undefined);
            }
            cb(undefined, thrift);
        });
    } else {
        this.loadSync(this.filename);
        this.compileAndLink();
    }
}

// Alternative constructor allowing for asynchronous source loading.
Thrift.load = function load(options, cb) {
    assert(options != null, 'options required');
    assert(typeof options === 'object', 'options must be object');
    assert(options.fs != null && typeof options.fs.readFile === 'function',
        'options.fs.readFile is required for async loading');
    options.callback = cb;
    new Thrift(options);
}

Thrift.prototype.models = 'module';

Thrift.prototype.Message = Message;

Thrift.prototype.load = function load(filename, cb) {
    var model = this;
    if (model.parsed[filename]) {
        return cb(undefined);
    }
    model.parsed[filename] = true;

    if (model.idls[filename] || model.asts[filename]) {
        return model.loadIncludedModules(filename, cb);
    }

    model.fs.readFile(filename, 'utf-8', function (err, source) {
        if (err) {
            return cb(err);
        }
        model.idls[filename] = source;
        model.loadIncludedModules(filename, cb);
    });
}

Thrift.prototype.loadIncludedModules = function loadIncludedModules(filename, cb) {
    var model = this;
    var dirname = path.dirname(filename);
    var defs;
    try {
        if (!model.asts[filename]) {
            model.asts[filename] = idl.parse(model.idls[filename]);
        }
        defs = model.asts[filename].headers.concat(model.asts[filename].definitions);
        model.validateIncludedModules(dirname, defs);
    } catch (err) {
        return cb(err);
    }
    asyncEach(defs, function (def, handleCb) {
        if (def.type !== 'Include') {
            return handleCb(undefined);
        }
        var includeFilename = path.join(dirname, def.id);
        model.load(includeFilename, function (err) {
            handleCb(err);
        });
    }, cb);
}

Thrift.prototype.loadSync = function _parse(filename) {
    if (this.parsed[filename]) {
        return;
    }
    this.parsed[filename] = true;

    if (!this.idls[filename] && !this.asts[filename]) {
        /* eslint-disable max-len */
        assert.ok(this.fs, filename + ': Thrift must be constructed with either a complete set of options.idls, options.asts, or options.fs access');
        /* eslint-enable max-len */
        this.idls[filename] = this.fs.readFileSync(path.resolve(filename), 'utf-8');
    }

    if (!this.asts[filename]) {
        this.asts[filename] = idl.parse(this.idls[filename]);
    }

    var dirname = path.dirname(filename);
    var defs = this.asts[filename].headers.concat(this.asts[filename].definitions);
    this.validateIncludedModules(dirname, defs);
    for (var index = 0; index < defs.length; index++) {
        var def = defs[index];
        if (def.type !== 'Include') {
            continue;
        }
        var includeFilename = path.join(dirname, def.id);
        this.loadSync(includeFilename, true);
    }
}

Thrift.prototype.validateIncludedModules = function validateIncludedModules(dirname, defs) {
    for (var index = 0; index < defs.length; index++) {
        var def = defs[index];
        if (def.type !== 'Include') {
            continue;
        }
        if (def.id.lastIndexOf('/', 0) === 0) {
            throw Error('Include path string must not be an absolute path');
        }
        this.getNamespace(def);
    }
}

Thrift.prototype.getNamespace = function getNamespace(def) {
    var ns = def.namespace && def.namespace.name;
    // If include isn't name, get filename sans *.thrift file extension.
    if (!this.allowIncludeAlias || !ns) {
        var basename = path.basename(def.id);
        ns = basename.slice(0, basename.length - 7);
        if (!validThriftIdentifierRE.test(ns)) {
            throw Error('Thrift include filename is not valid thrift identifier');
        }
    }
    return ns;
}

Thrift.prototype.compileAndLink = function compileAndLink() {
    // Separate compile/link passes permits forward references and cyclic
    // references.
    this.compile();
    // We only link from the root Thrift object.
    if (!this.noLink) {
        this.link();
    }
}

Thrift.prototype.getType = function getType(name) {
    return this.getTypeResult(name).toValue();
};

Thrift.prototype.getTypeResult = function getTypeResult(name) {
    var model = this.models[name];
    if (!model || model.models !== 'type') {
        /* eslint-disable max-len */
        return new Result(new Error(util.format('type %s not found. Make sure that the service name matches a service in the thrift file and that the method name is nested under that service.', name)));
        /* eslint-enable max-len */
    }
    return new Result(null, model.link(this));
};

Thrift.prototype.getSources = function getSources() {
    var filenames = Object.keys(this.idls);
    var common = lcp.longestCommonPath(filenames);
    var idls = {};
    for (var index = 0; index < filenames.length; index++) {
        var filename = filenames[index];
        idls[filename.slice(common.length)] = this.idls[filename];
    }
    var entryPoint = this.filename.slice(common.length);
    return {entryPoint: entryPoint, idls: idls};
};

Thrift.prototype.toJSON = function toJSON() {
    var filenames = Object.keys(this.idls);
    var common = lcp.longestCommonPath(filenames);
    var asts = {};
    for (var index = 0; index < filenames.length; index++) {
        var filename = filenames[index];
        asts[filename.slice(common.length)] = this.asts[filename];
    }
    var entryPoint = this.filename.slice(common.length);
    return {entryPoint: entryPoint, asts: asts};
};

Thrift.prototype.getServiceEndpoints = function getServiceEndpoints(target) {
    target = target || null;
    var services = Object.keys(this.services);
    var endpoints = [];
    for (var i = 0; i < services.length; i++) {
        var service = this.models[services[i]];
        if (!target || target === service.name) {
            for (var j = 0; j < service.functions.length; j++) {
                endpoints.push(service.name + '::' + service.functions[j].name);
            }
        }
    }
    return endpoints;
};

Thrift.prototype.baseTypes = {
    void: ThriftVoid,
    bool: ThriftBoolean,
    byte: ThriftI8,
    i8: ThriftI8,
    i16: ThriftI16,
    i32: ThriftI32,
    i64: ThriftI64,
    double: ThriftDouble,
    string: ThriftString,
    binary: ThriftBinary
};

Thrift.prototype.compile = function compile() {
    var syntax = this.asts[this.filename];
    assert.equal(syntax.type, 'Program', 'expected a program');
    this._compile(syntax.headers);
    this._compile(syntax.definitions);
    this.compileEnum(messageExceptionTypesDef);
    this.exception = this.compileStruct(messageExceptionDef);
};

Thrift.prototype.define = function define(name, def, model) {
    assert(!this.models[name], 'duplicate reference to ' + name + ' at ' + def.line + ':' + def.column);
    this.models[name] = model;
};

Thrift.prototype.compilers = {
    // sorted
    Const: 'compileConst',
    Enum: 'compileEnum',
    Exception: 'compileException',
    Include: 'compileInclude',
    Service: 'compileService',
    Struct: 'compileStruct',
    Typedef: 'compileTypedef',
    Union: 'compileUnion'
};

Thrift.prototype._compile = function _compile(defs) {
    for (var index = 0; index < defs.length; index++) {
        var def = defs[index];
        var compilerName = this.compilers[def.type];
        // istanbul ignore else
        if (compilerName) {
            this[compilerName](def);
        }
    }
};

Thrift.prototype.compileInclude = function compileInclude(def) {
    var filename = path.join(this.dirname, def.id);
    var ns = this.getNamespace(def);

    var model;

    if (this.memo[filename]) {
        model = this.memo[filename];
    } else {
        model = new Thrift({
            entryPoint: filename,
            parsed: this.parsed,
            idls: this.idls,
            asts: this.asts,
            memo: this.memo,
            strict: this.strict,
            allowIncludeAlias: this.allowIncludeAlias,
            allowOptionalArguments: this.allowOptionalArguments,
            noLink: true,
            defaultAsUndefined: this.defaultAsUndefined
        });
    }

    this.define(ns, def, model);

    // Alias if first character is not lower-case
    this.modules[ns] = model;

    if (!/^[a-z]/.test(ns)) {
        this[ns] = model;
    }
};

Thrift.prototype.compileStruct = function compileStruct(def) {
    var model = new ThriftStruct({strict: this.strict, defaultValueDefinition: this.defaultValueDefinition});
    model.compile(def, this);
    this.define(model.fullName, def, model);
    return model;
};

Thrift.prototype.compileException = function compileException(def) {
    var model = new ThriftStruct({strict: this.strict, isException: true});
    model.compile(def, this);
    this.define(model.fullName, def, model);
    return model;
};

Thrift.prototype.compileUnion = function compileUnion(def) {
    var model = new ThriftUnion({strict: this.strict});
    model.compile(def, this);
    this.define(model.fullName, def, model);
    return model;
};

Thrift.prototype.compileTypedef = function compileTypedef(def) {
    var model = new ThriftTypedef({strict: this.strict});
    model.compile(def, this);
    this.define(model.name, def, model);
    return model;
};

Thrift.prototype.compileService = function compileService(def) {
    var service = new ThriftService({strict: this.strict});
    service.compile(def, this);
    this.define(service.name, def.id, service);
};

Thrift.prototype.compileConst = function compileConst(def, model) {
    var thriftConst = new ThriftConst(def);
    this.define(def.id.name, def.id, thriftConst);
};

Thrift.prototype.compileEnum = function compileEnum(def) {
    var model = new ThriftEnum();
    model.compile(def, this);
    this.define(model.name, def.id, model);
};

Thrift.prototype.link = function link() {
    if (this.linked) {
        return this;
    }
    this.linked = true;

    var names = Object.keys(this.models);
    for (var index = 0; index < names.length; index++) {
        this.models[names[index]].link(this);
    }

    this.exception.link(this);

    return this;
};

Thrift.prototype.resolve = function resolve(def) {
    // istanbul ignore else
    if (def.type === 'BaseType') {
        return new this.baseTypes[def.baseType](def.annotations);
    } else if (def.type === 'Identifier') {
        return this.resolveIdentifier(def, def.name, 'type');
    } else if (def.type === 'List') {
        return new ThriftList(this.resolve(def.valueType), def.annotations);
    } else if (def.type === 'Set') {
        return new ThriftSet(this.resolve(def.valueType), def.annotations);
    } else if (def.type === 'Map') {
        return new ThriftMap(this.resolve(def.keyType), this.resolve(def.valueType), def.annotations);
    } else {
        assert.fail(util.format(
            'Can\'t get reader/writer for definition with unknown type %s at %s:%s',
            def.type, def.line, def.column
        ));
    }
};

// TODO thread type model and validate / coerce
Thrift.prototype.resolveValue = function resolveValue(def) {
    // istanbul ignore else
    if (!def) {
        return null;
    } else if (def.type === 'Literal') {
        return def.value;
    } else if (def.type === 'ConstList') {
        return this.resolveListConst(def);
    } else if (def.type === 'ConstMap') {
        return this.resolveMapConst(def);
    } else if (def.type === 'Identifier') {
        if (def.name === 'true') {
            return true;
        } else if (def.name === 'false') {
            return false;
        }
        return this.resolveIdentifier(def, def.name, 'value').value;
    } else {
        assert.fail('unrecognized const type ' + def.type);
    }
};

Thrift.prototype.resolveListConst = function resolveListConst(def) {
    var list = [];
    for (var index = 0; index < def.values.length; index++) {
        list.push(this.resolveValue(def.values[index]));
    }
    return list;
};

Thrift.prototype.resolveMapConst = function resolveMapConst(def) {
    var map = {};
    for (var index = 0; index < def.entries.length; index++) {
        map[this.resolveValue(def.entries[index].key)] =
            this.resolveValue(def.entries[index].value);
    }
    return map;
};

Thrift.prototype.resolveIdentifier = function resolveIdentifier(def, name, models) {
    var model;

    // short circuit if in global namespace of this thrift.
    if (this.models[name]) {
        model = this.models[name].link(this);
        if (model.models !== models) {
            err = new Error(
                'type mismatch for ' + def.name + ' at ' + def.line + ':' + def.column +
                ', expects ' + models + ', got ' + model.models
            );
            err.line = def.line;
            err.column = def.column;
            throw err;
        }
        return model;
    }

    var parts = name.split('.');
    var err;

    var module = this.modules[parts.shift()];
    if (module) {
        return module.resolveIdentifier(def, parts.join('.'), models);
    } else {
        err = new Error('cannot resolve reference to ' + def.name + ' at ' + def.line + ':' + def.column);
        err.line = def.line;
        err.column = def.column;
        throw err;
    }
};

module.exports.Thrift = Thrift;

},{"./ast":2,"./binary":3,"./boolean":4,"./const":6,"./double":7,"./enum":8,"./i16":10,"./i32":11,"./i64":12,"./i8":13,"./lib/async-each.js":15,"./lib/lcp":16,"./list":17,"./map":20,"./message":21,"./service":98,"./set":99,"./string":101,"./struct":102,"./thrift-idl":103,"./typedef":108,"./union":109,"./void":111,"assert":24,"bufrw/result":45,"fs":29,"path":68,"util":93}],105:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint max-statements:[0, 99] */
'use strict';

var bufrw = _dereq_('bufrw');
var inherits = _dereq_('util').inherits;
var errors = _dereq_('./errors');

function TList(etypeid, elements) {
    if (!(this instanceof TList)) {
        return new TList(etypeid, elements);
    }
    this.etypeid = etypeid;
    this.elements = elements || [];
}

function TListRW(opts) {
    if (!(this instanceof TListRW)) {
        return new TListRW(opts);
    }
    this.ttypes = opts.ttypes;
}
inherits(TListRW, bufrw.Base);

TListRW.prototype.headerRW = bufrw.Series([bufrw.Int8, bufrw.Int32BE]);

TListRW.prototype.poolByteLength = function poolByteLength(destResult, list) {
    var etype = this.ttypes[list.etypeid];
    if (!etype) {
        return destResult.reset(errors.InvalidTypeidError({
            typeid: list.etypeid,
            what: 'list::etype'
        }));
    }

    var length = 5; // header length
    var t;
    for (var i = 0; i < list.elements.length; i++) {
        t = etype.poolByteLength(destResult, list.elements[i]);
        // istanbul ignore if
        if (t.err) {
            return t;
        }
        length += t.length;
    }
    return destResult.reset(null, length);
};

TListRW.prototype.poolWriteInto = function poolWriteInto(destResult, list, buffer, offset) {
    var etype = this.ttypes[list.etypeid];
    if (!etype) {
        return destResult.reset(errors.InvalidTypeidError({
            typeid: list.etypeid,
            what: 'list::etype'
        }));
    }

    var t = this.headerRW.poolWriteInto(destResult, [list.etypeid, list.elements.length],
        buffer, offset);
    // istanbul ignore if
    if (t.err) {
        return t;
    }
    offset = t.offset;

    for (var i = 0; i < list.elements.length; i++) {
        t = etype.poolWriteInto(destResult, list.elements[i], buffer, offset);
        // istanbul ignore if
        if (t.err) {
            return t;
        }
        offset = t.offset;
    }
    return destResult.reset(null, offset);
};

TListRW.prototype.poolReadFrom = function poolReadFrom(destResult, buffer, offset) {
    var t = this.headerRW.poolReadFrom(destResult, buffer, offset);
    // istanbul ignore if
    if (t.err) {
        return t;
    }
    offset = t.offset;
    var etypeid = t.value[0];
    var size = t.value[1];
    if (size < 0) {
        return destResult.reset(errors.InvalidSizeError({
            size: size,
            what: 'list::size'
        }), offset);
    }

    var list = new TList(etypeid);
    var etype = this.ttypes[list.etypeid];
    if (!etype) {
        return destResult.reset(errors.InvalidTypeidError({
            typeid: list.etypeid,
            what: 'list::etype'
        }), offset);
    }

    for (var i = 0; i < size; i++) {
        t = etype.poolReadFrom(destResult, buffer, offset);
        // istanbul ignore if
        if (t.err) {
            return t;
        }
        offset = t.offset;
        list.elements.push(t.value);
    }
    return destResult.reset(null, offset, list);
};

module.exports.TList = TList;
module.exports.TListRW = TListRW;

},{"./errors":9,"bufrw":38,"util":93}],106:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint max-len:[0, 120] */
/* eslint max-statements:[0, 99] */
'use strict';

var bufrw = _dereq_('bufrw');
var inherits = _dereq_('util').inherits;
var errors = _dereq_('./errors');

function TPair(key, val) {
    if (!(this instanceof TPair)) {
        return new TPair(key, val);
    }
    this.key = key;
    this.val = val;
}

function TMap(ktypeid, vtypeid, pairs) {
    if (!(this instanceof TMap)) {
        return new TMap(ktypeid, vtypeid, pairs);
    }
    this.ktypeid = ktypeid;
    this.vtypeid = vtypeid;
    this.pairs = pairs || [];
}

function TMapRW(opts) {
    if (!(this instanceof TMapRW)) {
        return new TMapRW(opts);
    }
    this.ttypes = opts.ttypes;

    bufrw.Base.call(this);
}
inherits(TMapRW, bufrw.Base);

TMapRW.prototype.headerRW = bufrw.Series([bufrw.Int8, bufrw.Int8, bufrw.Int32BE]);

TMapRW.prototype.poolByteLength = function poolByteLength(destResult, map) {
    var ktype = this.ttypes[map.ktypeid];
    if (!ktype) {
        return destResult.reset(errors.InvalidTypeidError({
            what: 'map::ktype',
            typeid: map.ktypeid
        }));
    }
    var vtype = this.ttypes[map.vtypeid];
    if (!vtype) {
        return destResult.reset(errors.InvalidTypeidError({
            what: 'map::vtype',
            typeid: map.vtypeid
        }));
    }

    var length = 6; // header length
    var t;
    for (var i = 0; i < map.pairs.length; i++) {
        var pair = map.pairs[i];

        t = ktype.poolByteLength(destResult, pair.key);
        // istanbul ignore if
        if (t.err) {
            return t;
        }
        length += t.length;

        t = vtype.poolByteLength(destResult, pair.val);
        // istanbul ignore if
        if (t.err) {
            return t;
        }
        length += t.length;
    }
    return destResult.reset(null, length);
};

TMapRW.prototype.poolWriteInto = function poolWriteInto(destResult, map, buffer, offset) {
    var ktype = this.ttypes[map.ktypeid];
    if (!ktype) {
        return destResult.reset(errors.InvalidTypeidError({
            what: 'map::ktype',
            typeid: map.ktypeid
        }));
    }
    var vtype = this.ttypes[map.vtypeid];
    if (!vtype) {
        return destResult.reset(errors.InvalidTypeidError({
            what: 'map::vtype',
            typeid: map.vtypeid
        }));
    }

    var t = this.headerRW.poolWriteInto(destResult,
        [map.ktypeid, map.vtypeid, map.pairs.length], buffer, offset);
    // istanbul ignore if
    if (t.err) {
        return t;
    }
    offset = t.offset;

    for (var i = 0; i < map.pairs.length; i++) {
        var pair = map.pairs[i];

        t = ktype.poolWriteInto(destResult, pair.key, buffer, offset);
        // istanbul ignore if
        if (t.err) {
            return t;
        }
        offset = t.offset;

        t = vtype.poolWriteInto(destResult, pair.val, buffer, offset);
        // istanbul ignore if
        if (t.err) {
            return t;
        }
        offset = t.offset;
    }
    return destResult.reset(null, offset);
};

TMapRW.prototype.poolReadFrom = function poolReadFrom(destResult, buffer, offset) {
    var t = this.headerRW.poolReadFrom(destResult, buffer, offset);
    // istanbul ignore if
    if (t.err) {
        return t;
    }
    offset = t.offset;
    var ktypeid = t.value[0];
    var vtypeid = t.value[1];
    var size = t.value[2];
    if (size < 0) {
        return destResult.reset(errors.InvalidSizeError({
            size: size,
            what: 'map::size'
        }), offset);
    }

    var map = new TMap(ktypeid, vtypeid);
    var ktype = this.ttypes[map.ktypeid];
    if (!ktype) {
        return destResult.reset(errors.InvalidTypeidError({
            what: 'map::ktype',
            typeid: map.ktypeid
        }), offset);
    }
    var vtype = this.ttypes[map.vtypeid];
    if (!vtype) {
        return destResult.reset(errors.InvalidTypeidError({
            what: 'map::vtype',
            typeid: map.vtypeid
        }), offset);
    }

    for (var i = 0; i < size; i++) {
        t = ktype.poolReadFrom(destResult, buffer, offset);
        // istanbul ignore if
        if (t.err) {
            return t;
        }
        offset = t.offset;
        var key = t.value;

        t = vtype.poolReadFrom(destResult, buffer, offset);
        // istanbul ignore if
        if (t.err) {
            return t;
        }
        offset = t.offset;
        var val = t.value;

        map.pairs.push(TPair(key, val));
    }
    return destResult.reset(null, offset, map);
};

module.exports.TPair = TPair;
module.exports.TMap = TMap;
module.exports.TMapRW = TMapRW;

},{"./errors":9,"bufrw":38,"util":93}],107:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* eslint max-statements:[0, 99] */
'use strict';

var bufrw = _dereq_('bufrw');
var TYPE = _dereq_('./TYPE');
var inherits = _dereq_('util').inherits;
var errors = _dereq_('./errors');

function TField(typeid, id, val) {
    if (!(this instanceof TField)) {
        return new TField(typeid, id, val);
    }
    this.typeid = typeid;
    this.id = id;
    this.val = val;
}

function TStruct(fields) {
    if (!(this instanceof TStruct)) {
        return new TStruct(fields);
    }
    this.fields = fields || [];
}

function TStructRW(opts) {
    if (!(this instanceof TStructRW)) {
        return new TStructRW(opts);
    }
    this.ttypes = opts.ttypes;
}
inherits(TStructRW, bufrw.Base);

TStructRW.prototype.poolByteLength = function poolByteLength(destResult, struct) {
    var length = 1; // STOP byte
    var t;
    for (var i = 0; i < struct.fields.length; i++) {
        var field = struct.fields[i];
        var type = this.ttypes[field.typeid];
        if (!type) {
            return destResult.reset(errors.InvalidTypeidError({
                typeid: field.typeid, what: 'field::type'
            }));
        }

        length += 3; // field header length

        t = type.poolByteLength(destResult, field.val);
        // istanbul ignore if
        if (t.err) {
            return t;
        }
        length += t.length;
    }
    return destResult.reset(null, length);
};

TStructRW.prototype.poolWriteInto = function poolWriteInto(destResult, struct, buffer, offset) {
    var t;
    for (var i = 0; i < struct.fields.length; i++) {
        var field = struct.fields[i];
        var type = this.ttypes[field.typeid];
        if (!type) {
            return destResult.reset(errors.InvalidTypeidError({
                typeid: field.typeid, what: 'field::type'
            }));
        }

        t = bufrw.Int8.poolWriteInto(destResult, field.typeid, buffer, offset);
        // istanbul ignore if
        if (t.err) {
            return t;
        }
        offset = t.offset;

        t = bufrw.Int16BE.poolWriteInto(destResult, field.id, buffer, offset);
        // istanbul ignore if
        if (t.err) {
            return t;
        }
        offset = t.offset;

        t = type.poolWriteInto(destResult, field.val, buffer, offset);
        // istanbul ignore if
        if (t.err) {
            return t;
        }
        offset = t.offset;
    }
    t = bufrw.Int8.poolWriteInto(destResult, TYPE.STOP, buffer, offset);
    // istanbul ignore if
    if (t.err) {
        return t;
    }
    offset = t.offset;
    return destResult.reset(null, offset);
};

TStructRW.prototype.poolReadFrom = function poolReadFrom(destResult, buffer, offset) {
    /* eslint no-constant-condition:[0] */
    var struct = new TStruct();
    var t;
    while (true) {
        t = bufrw.Int8.poolReadFrom(destResult, buffer, offset);
        // istanbul ignore if
        if (t.err) {
            return t;
        }
        offset = t.offset;
        var typeid = t.value;
        if (typeid === TYPE.STOP) {
            break;
        }
        var type = this.ttypes[typeid];
        if (!type) {
            return destResult.reset(errors.InvalidTypeidError({
                typeid: typeid,
                what: 'field::type'
            }), offset);
        }

        t = bufrw.Int16BE.readFrom(buffer, offset);
        // istanbul ignore if
        if (t.err) {
            return t;
        }
        offset = t.offset;
        var id = t.value;

        t = type.poolReadFrom(destResult, buffer, offset);
        // istanbul ignore if
        if (t.err) {
            return t;
        }
        offset = t.offset;
        var val = t.value;
        struct.fields.push(TField(typeid, id, val));
    }
    return destResult.reset(null, offset, struct);
};

module.exports.TStruct = TStruct;
module.exports.TField = TField;
module.exports.TStructRW = TStructRW;

},{"./TYPE":1,"./errors":9,"bufrw":38,"util":93}],108:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

function ThriftTypedef() {
    this.name = null;
    this.valueDefinition = null;
    this.to = null;
    this.rw = null;
    this.annotations = null;
}

ThriftTypedef.prototype.models = 'type';

ThriftTypedef.prototype.compile = function compile(def, model) {
    this.name = def.id.name;
    this.valueDefinition = def.valueType;
    this.annotations = def.annotations;
};

ThriftTypedef.prototype.link = function link(model) {
    if (!this.to) {
        this.to = model.resolve(this.valueDefinition);
    }
    this.rw = this.to.rw;
    model.typedefs[this.name] = this.to.surface;
    return this.to;
};

module.exports.ThriftTypedef = ThriftTypedef;

},{}],109:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var util = _dereq_('util');
var ThriftStruct = _dereq_('./struct').ThriftStruct;

function ThriftUnion(options) {
    ThriftStruct.call(this, options);
}

util.inherits(ThriftUnion, ThriftStruct);

ThriftUnion.prototype.isUnion = true;
ThriftUnion.prototype.models = 'type';

ThriftUnion.prototype.createConstructor = function createConstructor(name, fields) {
    function Union(options) {
        this.type = null;
        if (typeof options !== 'object') {
            return;
        }
        for (var type in options) {
            // istanbul ignore else
            if (
                hasOwnProperty.call(options, type) &&
                options[type] !== null
            ) {
                this.type = type;
                this[type] = options[type];
            }
            // TODO assert no further names
        }
    }

    return Union;
};

ThriftUnion.prototype.set = function set(union, key, value) {
    // TODO return error if multiple values
    union.type = key;
    union[key] = value;
};

module.exports.ThriftUnion = ThriftUnion;

},{"./struct":102,"util":93}],110:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

function ThriftUnrecognizedException(value) {
    this.thrift = value;
}

module.exports.ThriftUnrecognizedException = ThriftUnrecognizedException;

},{}],111:[function(_dereq_,module,exports){
// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var bufrw = _dereq_('bufrw');
var TYPE = _dereq_('./TYPE');

var VoidRW = bufrw.Null;

function ThriftVoid(annotations) {
    this.annotations = annotations;
}

ThriftVoid.prototype.rw = VoidRW;
ThriftVoid.prototype.name = 'void';
ThriftVoid.prototype.typeid = TYPE.VOID;
ThriftVoid.prototype.models = 'type';

// istanbul ignore next
ThriftVoid.prototype.surface = function Void() {
    return null;
};

module.exports.VoidRW = VoidRW;
module.exports.ThriftVoid = ThriftVoid;

},{"./TYPE":1,"bufrw":38}]},{},[14])(14)
});
