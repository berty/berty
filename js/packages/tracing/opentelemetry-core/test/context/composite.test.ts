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

import {
  defaultGetter,
  defaultSetter,
  HttpTextPropagator,
  SpanContext,
} from '@opentelemetry/api';
import { Context } from '@opentelemetry/context-base';
import * as assert from 'assert';
import {
  CompositePropagator,
  HttpTraceContext,
  randomSpanId,
  randomTraceId,
} from '../../src';
import {
  getExtractedSpanContext,
  setExtractedSpanContext,
} from '../../src/context/context';
import {
  B3Propagator,
  X_B3_SAMPLED,
  X_B3_SPAN_ID,
  X_B3_TRACE_ID,
} from '../../src/context/propagation/B3Propagator';
import {
  TRACE_PARENT_HEADER,
  TRACE_STATE_HEADER,
} from '../../src/context/propagation/HttpTraceContext';
import { TraceState } from '../../src/trace/TraceState';

describe('Composite Propagator', () => {
  let traceId: string;
  let spanId: string;

  beforeEach(() => {
    traceId = randomTraceId();
    spanId = randomSpanId();
  });

  describe('inject', () => {
    let carrier: { [key: string]: unknown };
    let spanContext: SpanContext;
    let ctxWithSpanContext: Context;

    beforeEach(() => {
      carrier = {};
      spanContext = {
        spanId,
        traceId,
        traceFlags: 1,
        traceState: new TraceState('foo=bar'),
      };
      ctxWithSpanContext = setExtractedSpanContext(
        Context.ROOT_CONTEXT,
        spanContext
      );
    });

    it('should inject context using all configured propagators', () => {
      const composite = new CompositePropagator({
        propagators: [new B3Propagator(), new HttpTraceContext()],
      });
      composite.inject(ctxWithSpanContext, carrier, defaultSetter);

      assert.strictEqual(carrier[X_B3_TRACE_ID], traceId);
      assert.strictEqual(carrier[X_B3_SPAN_ID], spanId);
      assert.strictEqual(carrier[X_B3_SAMPLED], '1');
      assert.strictEqual(
        carrier[TRACE_PARENT_HEADER],
        `00-${traceId}-${spanId}-01`
      );
      assert.strictEqual(carrier[TRACE_STATE_HEADER], 'foo=bar');
    });

    it('should not throw', () => {
      const composite = new CompositePropagator({
        propagators: [new ThrowingPropagator(), new HttpTraceContext()],
      });
      composite.inject(ctxWithSpanContext, carrier, defaultSetter);

      assert.strictEqual(
        carrier[TRACE_PARENT_HEADER],
        `00-${traceId}-${spanId}-01`
      );
    });
  });

  describe('extract', () => {
    let carrier: { [key: string]: unknown };

    beforeEach(() => {
      carrier = {
        [X_B3_TRACE_ID]: traceId,
        [X_B3_SPAN_ID]: spanId,
        [X_B3_SAMPLED]: 1,
        [TRACE_PARENT_HEADER]: `00-${traceId}-${spanId}-01`,
        [TRACE_STATE_HEADER]: 'foo=bar',
      };
    });

    it('should extract context using all configured propagators', () => {
      const composite = new CompositePropagator({
        propagators: [new B3Propagator(), new HttpTraceContext()],
      });
      const spanContext = getExtractedSpanContext(
        composite.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
      );

      if (!spanContext) {
        throw new Error('no extracted context');
      }

      assert.strictEqual(spanContext.traceId, traceId);
      assert.strictEqual(spanContext.spanId, spanId);
      assert.strictEqual(spanContext.traceFlags, 1);
      assert.strictEqual(spanContext.isRemote, true);
      assert.strictEqual(spanContext.traceState!.get('foo'), 'bar');
    });

    it('should not throw', () => {
      const composite = new CompositePropagator({
        propagators: [new ThrowingPropagator(), new HttpTraceContext()],
      });
      const spanContext = getExtractedSpanContext(
        composite.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
      );

      if (!spanContext) {
        throw new Error('no extracted context');
      }

      assert.strictEqual(spanContext.traceId, traceId);
      assert.strictEqual(spanContext.spanId, spanId);
      assert.strictEqual(spanContext.traceFlags, 1);
      assert.strictEqual(spanContext.isRemote, true);
      assert.strictEqual(spanContext.traceState!.get('foo'), 'bar');
    });
  });
});

class ThrowingPropagator implements HttpTextPropagator {
  inject(context: Context, carrier: unknown) {
    throw new Error('this propagator throws');
  }

  extract(context: Context, carrier: unknown): Context {
    throw new Error('This propagator throws');
  }
}
