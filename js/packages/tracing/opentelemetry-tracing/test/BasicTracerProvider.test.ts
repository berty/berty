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

import { Context, context, SpanContext, TraceFlags } from '@opentelemetry/api'
import { ContextManager } from '@opentelemetry/context-base'
import {
	ALWAYS_SAMPLER,
	NEVER_SAMPLER,
	NoopLogger,
	NoRecordingSpan,
	setActiveSpan,
	setExtractedSpanContext,
	TraceState,
} from '../../opentelemetry-core/src/index'
import { Resource } from '../../opentelemetry-resources/src/index'
import * as assert from 'assert'
import { BasicTracerProvider, Span } from '../src'

describe('BasicTracerProvider', () => {
	beforeEach(() => {
		context.disable()
	})

	describe('constructor', () => {
		it('should construct an instance without any options', () => {
			const provider = new BasicTracerProvider()
			assert.ok(provider instanceof BasicTracerProvider)
		})

		it('should construct an instance with logger', () => {
			const provider = new BasicTracerProvider({
				logger: new NoopLogger(),
			})
			assert.ok(provider instanceof BasicTracerProvider)
		})

		it('should construct an instance with sampler', () => {
			const provider = new BasicTracerProvider({
				sampler: ALWAYS_SAMPLER,
			})
			assert.ok(provider instanceof BasicTracerProvider)
		})

		it('should construct an instance with default trace params', () => {
			const tracer = new BasicTracerProvider({}).getTracer('default')
			assert.deepStrictEqual(tracer.getActiveTraceParams(), {
				numberOfAttributesPerSpan: 32,
				numberOfEventsPerSpan: 128,
				numberOfLinksPerSpan: 32,
			})
		})

		it('should construct an instance with customized numberOfAttributesPerSpan trace params', () => {
			const tracer = new BasicTracerProvider({
				traceParams: {
					numberOfAttributesPerSpan: 100,
				},
			}).getTracer('default')
			assert.deepStrictEqual(tracer.getActiveTraceParams(), {
				numberOfAttributesPerSpan: 100,
				numberOfEventsPerSpan: 128,
				numberOfLinksPerSpan: 32,
			})
		})

		it('should construct an instance with customized numberOfEventsPerSpan trace params', () => {
			const tracer = new BasicTracerProvider({
				traceParams: {
					numberOfEventsPerSpan: 300,
				},
			}).getTracer('default')
			assert.deepStrictEqual(tracer.getActiveTraceParams(), {
				numberOfAttributesPerSpan: 32,
				numberOfEventsPerSpan: 300,
				numberOfLinksPerSpan: 32,
			})
		})

		it('should construct an instance with customized numberOfLinksPerSpan trace params', () => {
			const tracer = new BasicTracerProvider({
				traceParams: {
					numberOfLinksPerSpan: 10,
				},
			}).getTracer('default')
			assert.deepStrictEqual(tracer.getActiveTraceParams(), {
				numberOfAttributesPerSpan: 32,
				numberOfEventsPerSpan: 128,
				numberOfLinksPerSpan: 10,
			})
		})

		it('should construct an instance with default attributes', () => {
			const tracer = new BasicTracerProvider({
				defaultAttributes: {
					region: 'eu-west',
					asg: 'my-asg',
				},
			})
			assert.ok(tracer instanceof BasicTracerProvider)
		})
	})

	describe('.startSpan()', () => {
		it('should start a span with name only', () => {
			const tracer = new BasicTracerProvider().getTracer('default')
			const span = tracer.startSpan('my-span')
			assert.ok(span)
			assert.ok(span instanceof Span)
		})

		it('should propagate resources', () => {
			const tracerProvider = new BasicTracerProvider()
			const tracer = tracerProvider.getTracer('default')
			const span = tracer.startSpan('my-span') as Span
			assert.strictEqual(tracer.resource, tracerProvider.resource)
			assert.strictEqual(span.resource, tracerProvider.resource)
		})

		it('should start a span with name and options', () => {
			const tracer = new BasicTracerProvider().getTracer('default')
			const span = tracer.startSpan('my-span', {})
			assert.ok(span)
			assert.ok(span instanceof Span)
			const context = span.context()
			assert.ok(context.traceId.match(/[a-f0-9]{32}/))
			assert.ok(context.spanId.match(/[a-f0-9]{16}/))
			assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED)
			assert.deepStrictEqual(context.traceState, undefined)
			span.end()
		})

		it('should start a span with defaultAttributes and spanoptions->attributes', () => {
			const tracer = new BasicTracerProvider({
				defaultAttributes: { foo: 'bar' },
			}).getTracer('default')
			const span = tracer.startSpan('my-span', {
				attributes: { foo: 'foo', bar: 'bar' },
			}) as Span
			assert.deepStrictEqual(span.attributes, { bar: 'bar', foo: 'foo' })
			span.end()
		})

		it('should start a span with defaultAttributes and undefined spanoptions->attributes', () => {
			const tracer = new BasicTracerProvider({
				defaultAttributes: { foo: 'bar' },
			}).getTracer('default')
			const span = tracer.startSpan('my-span', {}) as Span
			assert.deepStrictEqual(span.attributes, { foo: 'bar' })
			span.end()
		})

		it('should start a span with spanoptions->attributes', () => {
			const tracer = new BasicTracerProvider().getTracer('default')
			const span = tracer.startSpan('my-span', {
				attributes: { foo: 'foo', bar: 'bar' },
			}) as Span
			assert.deepStrictEqual(span.attributes, { foo: 'foo', bar: 'bar' })
			span.end()
		})

		it('should start a span with name and parent spancontext', () => {
			const tracer = new BasicTracerProvider().getTracer('default')
			const state = new TraceState('a=1,b=2')

			const span = tracer.startSpan(
				'my-span',
				{},
				setExtractedSpanContext(Context.ROOT_CONTEXT, {
					traceId: 'd4cda95b652f4a1592b449d5929fda1b',
					spanId: '6e0c63257de34c92',
					traceFlags: TraceFlags.SAMPLED,
					traceState: state,
				}),
			)
			assert.ok(span instanceof Span)
			const context = span.context()
			assert.strictEqual(context.traceId, 'd4cda95b652f4a1592b449d5929fda1b')
			assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED)
			assert.deepStrictEqual(context.traceState, state)
			span.end()
		})

		it('should start a span with name and parent span', () => {
			const tracer = new BasicTracerProvider().getTracer('default')
			const span = tracer.startSpan('my-span')
			const childSpan = tracer.startSpan(
				'child-span',
				{},
				setActiveSpan(Context.ROOT_CONTEXT, span),
			)
			const context = childSpan.context()
			assert.strictEqual(context.traceId, span.context().traceId)
			assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED)
			span.end()
			childSpan.end()
		})

		it('should override context parent with option parent', () => {
			const tracer = new BasicTracerProvider().getTracer('default')
			const span = tracer.startSpan('my-span')
			const overrideParent = tracer.startSpan('my-parent-override-span')
			const childSpan = tracer.startSpan(
				'child-span',
				{
					parent: overrideParent,
				},
				setActiveSpan(Context.ROOT_CONTEXT, span),
			)
			const context = childSpan.context()
			assert.strictEqual(context.traceId, overrideParent.context().traceId)
			assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED)
			span.end()
			childSpan.end()
		})

		it('should override context parent with option parent context', () => {
			const tracer = new BasicTracerProvider().getTracer('default')
			const span = tracer.startSpan('my-span')
			const overrideParent = tracer.startSpan('my-parent-override-span')
			const childSpan = tracer.startSpan(
				'child-span',
				{
					parent: overrideParent.context(),
				},
				setActiveSpan(Context.ROOT_CONTEXT, span),
			)
			const context = childSpan.context()
			assert.strictEqual(context.traceId, overrideParent.context().traceId)
			assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED)
			span.end()
			childSpan.end()
		})

		it('should create a root span when parent is null', () => {
			const tracer = new BasicTracerProvider().getTracer('default')
			const span = tracer.startSpan('my-span')
			const overrideParent = tracer.startSpan('my-parent-override-span')
			const rootSpan = tracer.startSpan(
				'root-span',
				{ parent: null },
				setActiveSpan(Context.ROOT_CONTEXT, span),
			)
			const context = rootSpan.context()
			assert.notStrictEqual(context.traceId, overrideParent.context().traceId)
			span.end()
			rootSpan.end()
		})

		it('should start a span with name and with invalid parent span', () => {
			const tracer = new BasicTracerProvider().getTracer('default')
			const span = tracer.startSpan(
				'my-span',
				{},
				setExtractedSpanContext(Context.ROOT_CONTEXT, ('invalid-parent' as unknown) as SpanContext),
			)
			assert.ok(span instanceof Span)
			assert.deepStrictEqual((span as Span).parentSpanId, undefined)
		})

		it('should start a span with name and with invalid spancontext', () => {
			const tracer = new BasicTracerProvider().getTracer('default')
			const span = tracer.startSpan(
				'my-span',
				{},
				setExtractedSpanContext(Context.ROOT_CONTEXT, {
					traceId: '0',
					spanId: '0',
					traceFlags: TraceFlags.SAMPLED,
				}),
			)
			assert.ok(span instanceof Span)
			const context = span.context()
			assert.ok(context.traceId.match(/[a-f0-9]{32}/))
			assert.ok(context.spanId.match(/[a-f0-9]{16}/))
			assert.strictEqual(context.traceFlags, TraceFlags.SAMPLED)
			assert.deepStrictEqual(context.traceState, undefined)
		})

		it('should return a no recording span when never sampling', () => {
			const tracer = new BasicTracerProvider({
				sampler: NEVER_SAMPLER,
				logger: new NoopLogger(),
			}).getTracer('default')
			const span = tracer.startSpan('my-span')
			assert.ok(span instanceof NoRecordingSpan)
			const context = span.context()
			assert.ok(context.traceId.match(/[a-f0-9]{32}/))
			assert.ok(context.spanId.match(/[a-f0-9]{16}/))
			assert.strictEqual(context.traceFlags, TraceFlags.NONE)
			assert.deepStrictEqual(context.traceState, undefined)
			span.end()
		})

		it('should create real span when sampled', () => {
			const tracer = new BasicTracerProvider({
				sampler: ALWAYS_SAMPLER,
			}).getTracer('default')
			const span = tracer.startSpan('my-span')
			assert.ok(span instanceof Span)
			assert.strictEqual(span.context().traceFlags, TraceFlags.SAMPLED)
			assert.strictEqual(span.isRecording(), true)
		})

		it('should set default attributes on span', () => {
			const defaultAttributes = {
				foo: 'bar',
			}
			const tracer = new BasicTracerProvider({
				defaultAttributes,
			}).getTracer('default')

			const span = tracer.startSpan('my-span') as Span
			assert.ok(span instanceof Span)
			assert.deepStrictEqual(span.attributes, defaultAttributes)
		})

		it('should assign a resource', () => {
			const tracer = new BasicTracerProvider().getTracer('default')
			const span = tracer.startSpan('my-span') as Span
			assert.ok(span)
			assert.ok(span.resource instanceof Resource)
		})
	})

	describe('.getCurrentSpan()', () => {
		it('should return current span when it exists', () => {
			context.setGlobalContextManager({
				active: () => setActiveSpan(Context.ROOT_CONTEXT, ('foo' as any) as Span),
				disable: () => {},
			} as ContextManager)

			const tracer = new BasicTracerProvider().getTracer('default')
			assert.deepStrictEqual(tracer.getCurrentSpan(), 'foo')
		})
	})

	describe('.withSpan()', () => {
		it('should run context with NoopContextManager context manager', (done) => {
			const tracer = new BasicTracerProvider().getTracer('default')
			const span = tracer.startSpan('my-span')
			tracer.withSpan(span, () => {
				assert.deepStrictEqual(tracer.getCurrentSpan(), undefined)
				return done()
			})
		})
	})

	describe('.bind()', () => {
		it('should bind context with NoopContextManager context manager', (done) => {
			const tracer = new BasicTracerProvider().getTracer('default')
			const span = tracer.startSpan('my-span')
			const fn = () => {
				assert.deepStrictEqual(tracer.getCurrentSpan(), undefined)
				return done()
			}
			const patchedFn = tracer.bind(fn, span)
			return patchedFn()
		})
	})

	describe('.resource', () => {
		it('should return a Resource', () => {
			const tracerProvider = new BasicTracerProvider()
			assert.ok(tracerProvider.resource instanceof Resource)
		})
	})
})
