/*!
 * Copyright 2020, OpenTelemetry Authors
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

import {
  context,
  NoopHttpTextPropagator,
  propagation,
  trace,
} from '@opentelemetry/api';
import { NoopContextManager } from '@opentelemetry/context-base';
import { HttpTraceContext } from '@opentelemetry/core';
import * as assert from 'assert';
import { StackContextManager, WebTracerProvider } from '../src';

describe('API registration', () => {
  beforeEach(() => {
    context.disable();
    trace.disable();
    propagation.disable();
  });

  it('should register default implementations', () => {
    const tracerProvider = new WebTracerProvider();
    tracerProvider.register();

    assert.ok(context['_getContextManager']() instanceof StackContextManager);
    assert.ok(
      propagation['_getGlobalPropagator']() instanceof HttpTraceContext
    );
    assert.ok(trace.getTracerProvider() === tracerProvider);
  });

  it('should register configured implementations', () => {
    const tracerProvider = new WebTracerProvider();

    const contextManager = new NoopContextManager();
    const propagator = new NoopHttpTextPropagator();

    tracerProvider.register({
      contextManager,
      propagator,
    });

    assert.ok(context['_getContextManager']() === contextManager);
    assert.ok(propagation['_getGlobalPropagator']() === propagator);

    assert.ok(trace.getTracerProvider() === tracerProvider);
  });

  it('should skip null context manager', () => {
    const tracerProvider = new WebTracerProvider();
    tracerProvider.register({
      contextManager: null,
    });

    assert.ok(context['_getContextManager']() instanceof NoopContextManager);

    assert.ok(
      propagation['_getGlobalPropagator']() instanceof HttpTraceContext
    );
    assert.ok(trace.getTracerProvider() === tracerProvider);
  });

  it('should skip null propagator', () => {
    const tracerProvider = new WebTracerProvider();
    tracerProvider.register({
      propagator: null,
    });

    assert.ok(
      propagation['_getGlobalPropagator']() instanceof NoopHttpTextPropagator
    );

    assert.ok(context['_getContextManager']() instanceof StackContextManager);
    assert.ok(trace.getTracerProvider() === tracerProvider);
  });
});
