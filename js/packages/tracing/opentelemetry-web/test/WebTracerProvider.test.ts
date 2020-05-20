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

import { context } from '@opentelemetry/api'
import { ContextManager } from '@opentelemetry/context-base'
import { ZoneContextManager } from '@opentelemetry/context-zone'
import { B3Propagator, BasePlugin, NoopLogger } from '../../opentelemetry-core/src/index'
import { Resource, TELEMETRY_SDK_RESOURCE } from '../../opentelemetry-resources/src/index'
import { Span, Tracer } from '@opentelemetry/tracing'
import * as assert from 'assert'
import * as sinon from 'sinon'
import { WebTracerConfig } from '../src'
import { WebTracerProvider } from '../src/WebTracerProvider'

class DummyPlugin extends BasePlugin<unknown> {
	constructor() {
		super('dummy')
	}
	moduleName = 'dummy'

	patch() {}
	unpatch() {}
}

describe('WebTracerProvider', () => {
	describe('constructor', () => {
		let defaultOptions: WebTracerConfig
		let contextManager: ContextManager

		beforeEach(() => {
			defaultOptions = {}
			contextManager = new ZoneContextManager().enable()
			context.setGlobalContextManager(contextManager)
		})

		afterEach(() => {
			contextManager.disable()
			context.disable()
		})

		it('should construct an instance with required only options', () => {
			const tracer = new WebTracerProvider(Object.assign({}, defaultOptions)).getTracer('default')
			assert.ok(tracer instanceof Tracer)
		})

		it('should enable all plugins', () => {
			let options: WebTracerConfig
			const dummyPlugin1 = new DummyPlugin()
			const dummyPlugin2 = new DummyPlugin()
			const spyEnable1 = sinon.spy(dummyPlugin1, 'enable')
			const spyEnable2 = sinon.spy(dummyPlugin2, 'enable')

			const plugins = [dummyPlugin1, dummyPlugin2]

			options = { plugins }
			new WebTracerProvider(options)

			assert.ok(spyEnable1.calledOnce === true)
			assert.ok(spyEnable2.calledOnce === true)
		})

		it('should work without default context manager', () => {
			assert.doesNotThrow(() => {
				new WebTracerProvider({})
			})
		})

		it('should throw error when context manager is passed in constructor', () => {
			let error = ''
			try {
				new WebTracerProvider({
					contextManager: new ZoneContextManager(),
				} as any)
			} catch (e) {
				error = e
			}
			assert.strictEqual(
				error,
				'contextManager should be defined in' + ' register method not in constructor',
			)
		})

		it('should throw error when propagator is passed in constructor', () => {
			let error = ''
			try {
				new WebTracerProvider({
					propagator: new B3Propagator(),
				} as any)
			} catch (e) {
				error = e
			}
			assert.strictEqual(
				error,
				'propagator should be defined in register' + ' method not in constructor',
			)
		})

		describe('when contextManager is "ZoneContextManager"', () => {
			it('should correctly return the contexts for 2 parallel actions', (done) => {
				const webTracerWithZone = new WebTracerProvider().getTracer('default')

				const rootSpan = webTracerWithZone.startSpan('rootSpan')

				webTracerWithZone.withSpan(rootSpan, () => {
					assert.ok(webTracerWithZone.getCurrentSpan() === rootSpan, 'Current span is rootSpan')
					const concurrentSpan1 = webTracerWithZone.startSpan('concurrentSpan1')
					const concurrentSpan2 = webTracerWithZone.startSpan('concurrentSpan2')

					webTracerWithZone.withSpan(concurrentSpan1, () => {
						setTimeout(() => {
							assert.ok(
								webTracerWithZone.getCurrentSpan() === concurrentSpan1,
								'Current span is concurrentSpan1',
							)
						}, 10)
					})

					webTracerWithZone.withSpan(concurrentSpan2, () => {
						setTimeout(() => {
							assert.ok(
								webTracerWithZone.getCurrentSpan() === concurrentSpan2,
								'Current span is concurrentSpan2',
							)
							done()
						}, 20)
					})
				})
			})
		})

		describe('.startSpan()', () => {
			it('should assign resource to span', () => {
				const provider = new WebTracerProvider({
					logger: new NoopLogger(),
				})
				const span = provider.getTracer('default').startSpan('my-span') as Span
				assert.ok(span)
				assert.ok(span.resource instanceof Resource)
				assert.equal(span.resource.labels[TELEMETRY_SDK_RESOURCE.LANGUAGE], 'webjs')
			})
		})
	})
})
