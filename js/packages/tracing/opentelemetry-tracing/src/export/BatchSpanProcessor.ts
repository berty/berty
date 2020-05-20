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

import { unrefTimer } from '../../../opentelemetry-core/src/index'
import { SpanProcessor } from '../SpanProcessor'
import { BufferConfig } from '../types'
import { ReadableSpan } from './ReadableSpan'
import { SpanExporter } from './SpanExporter'

const DEFAULT_BUFFER_SIZE = 100
const DEFAULT_BUFFER_TIMEOUT_MS = 20000

/**
 * Implementation of the {@link SpanProcessor} that batches spans exported by
 * the SDK then pushes them to the exporter pipeline.
 */
export class BatchSpanProcessor implements SpanProcessor {
	private readonly _bufferSize: number
	private readonly _bufferTimeout: number

	private _finishedSpans: ReadableSpan[] = []
	private _timer: NodeJS.Timeout | undefined
	private _isShutdown = false

	constructor(private readonly _exporter: SpanExporter, config?: BufferConfig) {
		this._bufferSize = config && config.bufferSize ? config.bufferSize : DEFAULT_BUFFER_SIZE
		this._bufferTimeout =
			config && typeof config.bufferTimeout === 'number'
				? config.bufferTimeout
				: DEFAULT_BUFFER_TIMEOUT_MS
	}

	forceFlush(): void {
		if (this._isShutdown) {
			return
		}
		this._flush()
	}

	// does nothing.
	onStart(span: ReadableSpan): void {}

	onEnd(span: ReadableSpan): void {
		if (this._isShutdown) {
			return
		}
		this._addToBuffer(span)
	}

	shutdown(): void {
		if (this._isShutdown) {
			return
		}
		this.forceFlush()
		this._isShutdown = true
		this._exporter.shutdown()
	}

	/** Add a span in the buffer. */
	private _addToBuffer(span: ReadableSpan) {
		this._finishedSpans.push(span)
		this._maybeStartTimer()
		if (this._finishedSpans.length > this._bufferSize) {
			this._flush()
		}
	}

	/** Send the span data list to exporter */
	private _flush() {
		this._clearTimer()
		if (this._finishedSpans.length === 0) {
			return
		}
		this._exporter.export(this._finishedSpans, () => {})
		this._finishedSpans = []
	}

	private _maybeStartTimer() {
		if (this._timer !== undefined) {
			return
		}

		this._timer = setTimeout(() => {
			this._flush()
		}, this._bufferTimeout)
		unrefTimer(this._timer)
	}

	private _clearTimer() {
		if (this._timer !== undefined) {
			clearTimeout(this._timer)
			this._timer = undefined
		}
	}
}
