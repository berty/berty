/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as api from '@opentelemetry/api'

/**
 * Options for Jaeger configuration
 */
export interface ExporterConfig {
	logger?: api.Logger
	serviceName: string
	tags?: Tag[]
	host?: string // default: 'localhost'
	port?: number // default: 6832
	maxPacketSize?: number // default: 65000
	/** Time to wait for an onShutdown flush to finish before closing the sender */
	flushTimeout?: number // default: 2000
}

// Below require is needed as jaeger-client types does not expose the thrift,
// udp_sender, util etc. modules.

// tslint:disable-next-line:variable-name
export { default as HTTPSender } from './http_sender'
// tslint:disable-next-line:variable-name
export { default as Utils } from './util'
// tslint:disable-next-line:variable-name
export { default as ThriftUtils } from './thrift_utils'

export type TagValue = string | number | boolean

export interface Tag {
	key: string
	value: TagValue
}

export interface Log {
	timestamp: number
	fields: Tag[]
}

export type SenderCallback = (numSpans: number, err?: string) => void

export interface ThriftProcess {
	serviceName: string
	tags: ThriftTag[]
}

export interface ThriftTag {
	key: string
	vType: string
	vStr: string
	vDouble: number
	vBool: boolean
}

export interface ThriftLog {
	timestamp: number
	fields: ThriftTag[]
}

export enum ThriftReferenceType {
	CHILD_OF = 'CHILD_OF',
	FOLLOWS_FROM = 'FOLLOWS_FROM',
}

export interface ThriftReference {
	traceIdLow: Buffer
	traceIdHigh: Buffer
	spanId: Buffer
	refType: ThriftReferenceType
}

export interface ThriftSpan {
	traceIdLow: Buffer
	traceIdHigh: Buffer
	spanId: Buffer
	parentSpanId: string | Buffer
	operationName: string
	references: ThriftReference[]
	flags: number
	startTime: number // milliseconds
	duration: number // milliseconds
	tags: ThriftTag[]
	logs: ThriftLog[]
}
