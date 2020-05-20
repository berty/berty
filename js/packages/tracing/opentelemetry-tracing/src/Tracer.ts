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
	ConsoleLogger,
	getActiveSpan,
	getParentSpanContext,
	isValid,
	NoRecordingSpan,
	randomSpanId,
	randomTraceId,
	setActiveSpan,
} from '../../opentelemetry-core/src/index'
import { Resource } from '../../opentelemetry-resources/src/index'
import { BasicTracerProvider } from './BasicTracerProvider'
import { Span } from './Span'
import { TraceParams, TracerConfig } from './types'
import { mergeConfig } from './utility'

/**
 * This class represents a basic tracer.
 */
export class Tracer implements api.Tracer {
	private readonly _defaultAttributes: api.Attributes
	private readonly _sampler: api.Sampler
	private readonly _traceParams: TraceParams
	readonly resource: Resource
	readonly logger: api.Logger

	/**
	 * Constructs a new Tracer instance.
	 */
	constructor(config: TracerConfig, private _tracerProvider: BasicTracerProvider) {
		const localConfig = mergeConfig(config)
		this._defaultAttributes = localConfig.defaultAttributes
		this._sampler = localConfig.sampler
		this._traceParams = localConfig.traceParams
		this.resource = _tracerProvider.resource
		this.logger = config.logger || new ConsoleLogger(config.logLevel)
	}

	/**
	 * Starts a new Span or returns the default NoopSpan based on the sampling
	 * decision.
	 */
	startSpan(name: string, options: api.SpanOptions = {}, context = api.context.active()): api.Span {
		const parentContext = getParent(options, context)
		// make sampling decision
		const samplingDecision = this._sampler.shouldSample(parentContext)
		const spanId = randomSpanId()
		let traceId
		let traceState
		if (!parentContext || !isValid(parentContext)) {
			// New root span.
			traceId = randomTraceId()
		} else {
			// New child span.
			traceId = parentContext.traceId
			traceState = parentContext.traceState
		}
		const traceFlags = samplingDecision ? api.TraceFlags.SAMPLED : api.TraceFlags.NONE
		const spanContext = { traceId, spanId, traceFlags, traceState }
		if (!samplingDecision) {
			this.logger.debug('Sampling is off, starting no recording span')
			return new NoRecordingSpan(spanContext)
		}

		const span = new Span(
			this,
			name,
			spanContext,
			options.kind || api.SpanKind.INTERNAL,
			parentContext ? parentContext.spanId : undefined,
			options.links || [],
			options.startTime,
		)
		// Set default attributes
		span.setAttributes(Object.assign({}, this._defaultAttributes, options.attributes))
		return span
	}

	/**
	 * Returns the current Span from the current context.
	 *
	 * If there is no Span associated with the current context, undefined is returned.
	 */
	getCurrentSpan(): api.Span | undefined {
		const ctx = api.context.active()
		// Get the current Span from the context or null if none found.
		return getActiveSpan(ctx)
	}

	/**
	 * Enters the context of code where the given Span is in the current context.
	 */
	withSpan<T extends (...args: unknown[]) => ReturnType<T>>(span: api.Span, fn: T): ReturnType<T> {
		// Set given span to context.
		return api.context.with(setActiveSpan(api.context.active(), span), fn)
	}

	/**
	 * Bind a span (or the current one) to the target's context
	 */
	bind<T>(target: T, span?: api.Span): T {
		return api.context.bind(
			target,
			span ? setActiveSpan(api.context.active(), span) : api.context.active(),
		)
	}

	/** Returns the active {@link TraceParams}. */
	getActiveTraceParams(): TraceParams {
		return this._traceParams
	}

	getActiveSpanProcessor() {
		return this._tracerProvider.getActiveSpanProcessor()
	}
}

/**
 * Get the parent to assign to a started span. If options.parent is null,
 * do not assign a parent.
 *
 * @param options span options
 * @param context context to check for parent
 */
function getParent(options: api.SpanOptions, context: api.Context): api.SpanContext | undefined {
	if (options.parent === null) {
		return undefined
	}
	if (options.parent) {
		return getContext(options.parent)
	}
	return getParentSpanContext(context)
}

function getContext(span: api.Span | api.SpanContext): api.SpanContext {
	return isSpan(span) ? span.context() : span
}

function isSpan(span: api.Span | api.SpanContext): span is api.Span {
	return typeof (span as api.Span).context === 'function'
}
