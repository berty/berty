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
import {
	hrTime,
	hrTimeDuration,
	isTimeInput,
	timeInputToHrTime,
} from '../../opentelemetry-core/src/index'
import { Resource } from '../../opentelemetry-resources/src/index'
import { ReadableSpan } from './export/ReadableSpan'
import { Tracer } from './Tracer'
import { SpanProcessor } from './SpanProcessor'
import { TraceParams } from './types'

/**
 * This class represents a span.
 */
export class Span implements api.Span, ReadableSpan {
	// Below properties are included to implement ReadableSpan for export
	// purposes but are not intended to be written-to directly.
	readonly spanContext: api.SpanContext
	readonly kind: api.SpanKind
	readonly parentSpanId?: string
	readonly attributes: api.Attributes = {}
	readonly links: api.Link[] = []
	readonly events: api.TimedEvent[] = []
	readonly startTime: api.HrTime
	readonly resource: Resource
	name: string
	status: api.Status = {
		code: api.CanonicalCode.OK,
	}
	endTime: api.HrTime = [0, 0]
	private _ended = false
	private _duration: api.HrTime = [-1, -1]
	private readonly _logger: api.Logger
	private readonly _spanProcessor: SpanProcessor
	private readonly _traceParams: TraceParams

	/** Constructs a new Span instance. */
	constructor(
		parentTracer: Tracer,
		spanName: string,
		spanContext: api.SpanContext,
		kind: api.SpanKind,
		parentSpanId?: string,
		links: api.Link[] = [],
		startTime: api.TimeInput = hrTime(),
	) {
		this.name = spanName
		this.spanContext = spanContext
		this.parentSpanId = parentSpanId
		this.kind = kind
		this.links = links
		this.startTime = timeInputToHrTime(startTime)
		this.resource = parentTracer.resource
		this._logger = parentTracer.logger
		this._traceParams = parentTracer.getActiveTraceParams()
		this._spanProcessor = parentTracer.getActiveSpanProcessor()
		this._spanProcessor.onStart(this)
	}

	context(): api.SpanContext {
		return this.spanContext
	}

	setAttribute(key: string, value: unknown): this {
		if (this._isSpanEnded()) {
			return this
		}

		if (Object.keys(this.attributes).length >= this._traceParams.numberOfAttributesPerSpan!) {
			const attributeKeyToDelete = Object.keys(this.attributes).shift()
			if (attributeKeyToDelete) {
				this._logger.warn(`Dropping extra attributes : ${attributeKeyToDelete}`)
				delete this.attributes[attributeKeyToDelete]
			}
		}
		this.attributes[key] = value
		return this
	}

	setAttributes(attributes: api.Attributes): this {
		Object.keys(attributes).forEach((key) => {
			this.setAttribute(key, attributes[key])
		})
		return this
	}

	/**
	 *
	 * @param name Span Name
	 * @param [attributesOrStartTime] Span attributes or start time
	 *     if type is {@type TimeInput} and 3rd param is undefined
	 * @param [startTime] Specified start time for the event
	 */
	addEvent(
		name: string,
		attributesOrStartTime?: api.Attributes | api.TimeInput,
		startTime?: api.TimeInput,
	): this {
		if (this._isSpanEnded()) {
			return this
		}
		if (this.events.length >= this._traceParams.numberOfEventsPerSpan!) {
			this._logger.warn('Dropping extra events.')
			this.events.shift()
		}
		if (isTimeInput(attributesOrStartTime)) {
			if (typeof startTime === 'undefined') {
				startTime = attributesOrStartTime as api.TimeInput
			}
			attributesOrStartTime = undefined
		}
		if (typeof startTime === 'undefined') {
			startTime = hrTime()
		}
		this.events.push({
			name,
			attributes: attributesOrStartTime as api.Attributes,
			time: timeInputToHrTime(startTime),
		})
		return this
	}

	setStatus(status: api.Status): this {
		if (this._isSpanEnded()) {
			return this
		}
		this.status = status
		return this
	}

	updateName(name: string): this {
		if (this._isSpanEnded()) {
			return this
		}
		this.name = name
		return this
	}

	end(endTime: api.TimeInput = hrTime()): void {
		if (this._isSpanEnded()) {
			this._logger.error('You can only call end() on a span once.')
			return
		}
		this._ended = true
		this.endTime = timeInputToHrTime(endTime)

		this._duration = hrTimeDuration(this.startTime, this.endTime)
		if (this._duration[0] < 0) {
			this._logger.warn(
				'Inconsistent start and end time, startTime > endTime',
				this.startTime,
				this.endTime,
			)
		}

		this._spanProcessor.onEnd(this)
	}

	isRecording(): boolean {
		return true
	}

	get duration(): api.HrTime {
		return this._duration
	}

	get ended(): boolean {
		return this._ended
	}

	private _isSpanEnded(): boolean {
		if (this._ended) {
			this._logger.warn(
				'Can not execute the operation on ended Span {traceId: %s, spanId: %s}',
				this.spanContext.traceId,
				this.spanContext.spanId,
			)
		}
		return this._ended
	}
}
