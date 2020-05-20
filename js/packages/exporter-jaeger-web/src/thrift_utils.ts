// @flow
// Copyright (c) 2016 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
// in compliance with the License. You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software distributed under the License
// is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
// or implied. See the License for the specific language governing permissions and limitations under
// the License.

import * as opentracing from 'opentracing'
import { Thrift } from './thriftrw'
import Utils from './util'
import jaegerThrift from './jaeger_thrift_source'

export default class ThriftUtils {
	static _thrift = new Thrift({
		source: jaegerThrift,
		allowOptionalArguments: true,
	})
	static emptyBuffer: Buffer = Utils.newBuffer(8)

	static getThriftTags(initialTags: any[]): Array<any> {
		const thriftTags = []
		for (let i = 0; i < initialTags.length; i++) {
			const tag = initialTags[i]

			const key: string = tag.key

			const vLong: Buffer = ThriftUtils.emptyBuffer
			let vBinary: Buffer = ThriftUtils.emptyBuffer
			let vBool = false
			let vDouble = 0
			let vStr = ''

			let vType = ''
			const valueType = typeof tag.value
			if (valueType === 'number') {
				vType = ThriftUtils._thrift.TagType.DOUBLE
				vDouble = tag.value
			} else if (valueType === 'boolean') {
				vType = ThriftUtils._thrift.TagType.BOOL
				vBool = tag.value
			} else if (tag.value instanceof Buffer) {
				vType = ThriftUtils._thrift.TagType.BINARY
				vBinary = tag.value
			} else if (valueType === 'object') {
				vType = ThriftUtils._thrift.TagType.STRING
				vStr = JSON.stringify(tag.value)
			} else {
				vType = ThriftUtils._thrift.TagType.STRING
				if (valueType === 'string') {
					vStr = tag.value
				} else {
					vStr = String(tag.value)
				}
			}

			thriftTags.push({
				key: key,
				vType: vType,
				vStr: vStr,
				vDouble: vDouble,
				vBool: vBool,
				vLong: vLong,
				vBinary: vBinary,
			})
		}

		return thriftTags
	}

	static getThriftLogs(logs: any[]): Array<any> {
		const thriftLogs = []
		for (let i = 0; i < logs.length; i++) {
			const log = logs[i]
			thriftLogs.push({
				timestamp: Utils.encodeInt64(log.timestamp * 1000), // to microseconds
				fields: ThriftUtils.getThriftTags(log.fields),
			})
		}

		return thriftLogs
	}

	static spanRefsToThriftRefs(refs: any[]): Array<any> {
		const thriftRefs = []
		for (let i = 0; i < refs.length; i++) {
			let refEnum
			const ref = refs[i]
			const context = refs[i].referencedContext()

			if (ref.type() === opentracing.REFERENCE_CHILD_OF) {
				refEnum = ThriftUtils._thrift.SpanRefType.CHILD_OF
			} else if (ref.type() === opentracing.REFERENCE_FOLLOWS_FROM) {
				refEnum = ThriftUtils._thrift.SpanRefType.FOLLOWS_FROM
			} else {
				continue
			}

			thriftRefs.push({
				refType: refEnum,
				traceIdLow: ThriftUtils.getTraceIdLow(context.traceId),
				traceIdHigh: ThriftUtils.getTraceIdHigh(context.traceId),
				spanId: context.spanId,
			})
		}

		return thriftRefs
	}

	static getTraceIdLow(traceId: Buffer) {
		if (traceId != null) {
			return traceId.slice(-8)
		}

		return ThriftUtils.emptyBuffer
	}

	static getTraceIdHigh(traceId: Buffer) {
		if (traceId != null && traceId.length > 8) {
			return traceId.slice(-16, -8)
		}

		return ThriftUtils.emptyBuffer
	}

	static spanToThrift(span: any): any {
		const tags = ThriftUtils.getThriftTags(span._tags)
		const logs = ThriftUtils.getThriftLogs(span._logs)
		const unsigned = true

		return {
			traceIdLow: ThriftUtils.getTraceIdLow(span._spanContext.traceId),
			traceIdHigh: ThriftUtils.getTraceIdHigh(span._spanContext.traceId),
			spanId: span._spanContext.spanId,
			parentSpanId: span._spanContext.parentId || ThriftUtils.emptyBuffer,
			operationName: span._operationName,
			references: ThriftUtils.spanRefsToThriftRefs(span._references),
			flags: span._spanContext.flags,
			startTime: Utils.encodeInt64(span._startTime * 1000), // to microseconds
			duration: Utils.encodeInt64(span._duration * 1000), // to microseconds
			tags: tags,
			logs: logs,
		}
	}
}
