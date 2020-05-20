// Copyright (c) 2018 Uber Technologies, Inc.
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

import { Thrift } from './thriftrw'

import NullLogger from './logger'
import SenderUtils from './sender_utils'
import { SenderCallback } from './types'

const DEFAULT_PATH = '/api/traces'
const DEFAULT_PORT = 14268
const DEFAULT_TIMEOUT_MS = 5000
const DEFAULT_MAX_SPAN_BATCH_SIZE = 100

import jaegerThrift from './jaeger_thrift_source'

export default class HTTPSender {
	_url: string
	_username: string
	_password: string
	_emitSpanBatchOverhead?: number
	_timeoutMS: number
	_logger: any
	_jaegerThrift: any
	_process: any
	_batch: any
	_thriftProcessMessage: any
	_maxSpanBatchSize: number

	constructor(options: any = {}) {
		this._url = 'http://' + options.host + ':' + (options.port || DEFAULT_PORT) + DEFAULT_PATH
		this._username = options.username
		this._password = options.password
		this._timeoutMS = options.timeoutMS || DEFAULT_TIMEOUT_MS

		this._maxSpanBatchSize = options.maxSpanBatchSize || DEFAULT_MAX_SPAN_BATCH_SIZE

		this._logger = options.logger || new NullLogger()
		this._jaegerThrift = new Thrift({
			source: jaegerThrift,
			allowOptionalArguments: true,
		})
	}

	setProcess(process: any): void {
		// Go ahead and initialize the Thrift batch that we will reuse for each
		// flush.
		this._batch = new this._jaegerThrift.Batch({
			process: SenderUtils.convertProcessToThrift(this._jaegerThrift, process),
			spans: [],
		})
	}

	append(span: any, callback?: SenderCallback): void {
		console.log('tracing append called')

		this._batch.spans.push(new this._jaegerThrift.Span(span))

		if (this._batch.spans.length >= this._maxSpanBatchSize) {
			this.flush(callback)
			return
		}
		SenderUtils.invokeCallback(callback, 0)
	}

	flush(callback?: SenderCallback): void {
		console.log('tracing flush called')

		const numSpans = this._batch.spans.length
		if (!numSpans) {
			console.log('flush no numSpan')
			SenderUtils.invokeCallback(callback, 0)
			return
		}

		console.log('is buffer instance', this._batch.spans[0].duration instanceof Buffer)
		console.log('batch', this._batch)

		const result = this._jaegerThrift.Batch.rw.toBuffer(this._batch)
		this._reset() // clear buffer for new spans, even if Thrift conversion fails

		if (result.err) {
			console.log('flush error')
			console.error(result.err)
			SenderUtils.invokeCallback(callback, numSpans, `Error encoding Thrift batch: ${result.err}`)
			return
		}

		console.log('calling fetch in tracing')

		fetch(this._url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-thrift',
				Connection: 'keep-alive',
			},
			body: result.value,
		})
			.then(() => {
				SenderUtils.invokeCallback(callback, numSpans)
			})
			.catch((err: Error) => {
				const error = `error sending spans over HTTP: ${err}`
				this._logger.error(error)
				SenderUtils.invokeCallback(callback, numSpans, error)
			})
	}

	_reset() {
		this._batch.spans = []
	}

	close(): void {}
}
