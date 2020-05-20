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
  SpanContext,
  TraceFlags,
} from '@opentelemetry/api';
import { Context } from '@opentelemetry/context-base';
import * as assert from 'assert';
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
import { TraceState } from '../../src/trace/TraceState';

describe('B3Propagator', () => {
  const b3Propagator = new B3Propagator();
  let carrier: { [key: string]: unknown };

  beforeEach(() => {
    carrier = {};
  });

  describe('.inject()', () => {
    it('should set b3 traceId and spanId headers', () => {
      const spanContext: SpanContext = {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
      };

      b3Propagator.inject(
        setExtractedSpanContext(Context.ROOT_CONTEXT, spanContext),
        carrier,
        defaultSetter
      );
      assert.deepStrictEqual(
        carrier[X_B3_TRACE_ID],
        'd4cda95b652f4a1592b449d5929fda1b'
      );
      assert.deepStrictEqual(carrier[X_B3_SPAN_ID], '6e0c63257de34c92');
      assert.deepStrictEqual(carrier[X_B3_SAMPLED], '1');
    });

    it('should set b3 traceId and spanId headers - ignore tracestate', () => {
      const spanContext: SpanContext = {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.NONE,
        traceState: new TraceState('foo=bar,baz=qux'),
        isRemote: false,
      };

      b3Propagator.inject(
        setExtractedSpanContext(Context.ROOT_CONTEXT, spanContext),
        carrier,
        defaultSetter
      );
      assert.deepStrictEqual(
        carrier[X_B3_TRACE_ID],
        'd4cda95b652f4a1592b449d5929fda1b'
      );
      assert.deepStrictEqual(carrier[X_B3_SPAN_ID], '6e0c63257de34c92');
      assert.deepStrictEqual(carrier[X_B3_SAMPLED], '0');
    });

    it('should not inject empty spancontext', () => {
      const emptySpanContext = {
        traceId: '',
        spanId: '',
        traceFlags: TraceFlags.NONE,
      };
      b3Propagator.inject(
        setExtractedSpanContext(Context.ROOT_CONTEXT, emptySpanContext),
        carrier,
        defaultSetter
      );
      assert.deepStrictEqual(carrier[X_B3_TRACE_ID], undefined);
      assert.deepStrictEqual(carrier[X_B3_SPAN_ID], undefined);
    });
  });

  describe('.extract()', () => {
    it('should extract context of a unsampled span from carrier', () => {
      carrier[X_B3_TRACE_ID] = '0af7651916cd43dd8448eb211c80319c';
      carrier[X_B3_SPAN_ID] = 'b7ad6b7169203331';
      const extractedSpanContext = getExtractedSpanContext(
        b3Propagator.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'b7ad6b7169203331',
        traceId: '0af7651916cd43dd8448eb211c80319c',
        isRemote: true,
        traceFlags: TraceFlags.NONE,
      });
    });

    it('should extract context of a sampled span from carrier', () => {
      carrier[X_B3_TRACE_ID] = '0af7651916cd43dd8448eb211c80319c';
      carrier[X_B3_SPAN_ID] = 'b7ad6b7169203331';
      carrier[X_B3_SAMPLED] = '1';
      const extractedSpanContext = getExtractedSpanContext(
        b3Propagator.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'b7ad6b7169203331',
        traceId: '0af7651916cd43dd8448eb211c80319c',
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should extract context of a sampled span from carrier when sampled is mentioned as boolean true flag', () => {
      carrier[X_B3_TRACE_ID] = '0af7651916cd43dd8448eb211c80319c';
      carrier[X_B3_SPAN_ID] = 'b7ad6b7169203331';
      carrier[X_B3_SAMPLED] = true;
      const extractedSpanContext = getExtractedSpanContext(
        b3Propagator.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'b7ad6b7169203331',
        traceId: '0af7651916cd43dd8448eb211c80319c',
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should extract context of a sampled span from carrier when sampled is mentioned as boolean false flag', () => {
      carrier[X_B3_TRACE_ID] = '0af7651916cd43dd8448eb211c80319c';
      carrier[X_B3_SPAN_ID] = 'b7ad6b7169203331';
      carrier[X_B3_SAMPLED] = false;
      const extractedSpanContext = getExtractedSpanContext(
        b3Propagator.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'b7ad6b7169203331',
        traceId: '0af7651916cd43dd8448eb211c80319c',
        isRemote: true,
        traceFlags: TraceFlags.NONE,
      });
    });

    it('should return undefined when traceId is undefined', () => {
      carrier[X_B3_TRACE_ID] = undefined;
      carrier[X_B3_SPAN_ID] = undefined;
      assert.deepStrictEqual(
        getExtractedSpanContext(
          b3Propagator.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
        ),
        undefined
      );
    });

    it('should return undefined when options and spanId are undefined', () => {
      carrier[X_B3_TRACE_ID] = '0af7651916cd43dd8448eb211c80319c';
      carrier[X_B3_SPAN_ID] = undefined;
      assert.deepStrictEqual(
        getExtractedSpanContext(
          b3Propagator.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
        ),
        undefined
      );
    });

    it('returns undefined if b3 header is missing', () => {
      assert.deepStrictEqual(
        getExtractedSpanContext(
          b3Propagator.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
        ),
        undefined
      );
    });

    it('returns undefined if b3 header is invalid', () => {
      carrier[X_B3_TRACE_ID] = 'invalid!';
      assert.deepStrictEqual(
        getExtractedSpanContext(
          b3Propagator.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
        ),
        undefined
      );
    });

    it('extracts b3 from list of header', () => {
      carrier[X_B3_TRACE_ID] = ['0af7651916cd43dd8448eb211c80319c'];
      carrier[X_B3_SPAN_ID] = 'b7ad6b7169203331';
      carrier[X_B3_SAMPLED] = '01';
      const extractedSpanContext = getExtractedSpanContext(
        b3Propagator.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
      );
      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'b7ad6b7169203331',
        traceId: '0af7651916cd43dd8448eb211c80319c',
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should gracefully handle an invalid b3 header', () => {
      // A set of test cases with different invalid combinations of a
      // b3 header. These should all result in a `undefined` SpanContext
      // value being extracted.

      const testCases: Record<string, string> = {
        invalidParts_tooShort: '00-ffffffffffffffffffffffffffffffff',
        invalidParts_tooLong:
          '00-ffffffffffffffffffffffffffffffff-ffffffffffffffff-00-01',

        invalidVersion_notHex:
          '0x-ffffffffffffffffffffffffffffffff-ffffffffffffffff-00',
        invalidVersion_tooShort:
          '0-ffffffffffffffffffffffffffffffff-ffffffffffffffff-00',
        invalidVersion_tooLong:
          '000-ffffffffffffffffffffffffffffffff-ffffffffffffffff-00',

        invalidTraceId_empty: '00--ffffffffffffffff-01',
        invalidTraceId_notHex:
          '00-fffffffffffffffffffffffffffffffx-ffffffffffffffff-01',
        invalidTraceId_allZeros:
          '00-00000000000000000000000000000000-ffffffffffffffff-01',
        invalidTraceId_tooShort: '00-ffffffff-ffffffffffffffff-01',
        invalidTraceId_tooLong:
          '00-ffffffffffffffffffffffffffffffff00-ffffffffffffffff-01',

        invalidSpanId_empty: '00-ffffffffffffffffffffffffffffffff--01',
        invalidSpanId_notHex:
          '00-ffffffffffffffffffffffffffffffff-fffffffffffffffx-01',
        invalidSpanId_allZeros:
          '00-ffffffffffffffffffffffffffffffff-0000000000000000-01',
        invalidSpanId_tooShort:
          '00-ffffffffffffffffffffffffffffffff-ffffffff-01',
        invalidSpanId_tooLong:
          '00-ffffffffffffffffffffffffffffffff-ffffffffffffffff0000-01',
      };

      Object.getOwnPropertyNames(testCases).forEach(testCase => {
        carrier[X_B3_TRACE_ID] = testCases[testCase];

        const extractedSpanContext = getExtractedSpanContext(
          b3Propagator.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
        );
        assert.deepStrictEqual(extractedSpanContext, undefined, testCase);
      });
    });

    it('should fail gracefully on bad responses from getter', () => {
      const ctx1 = b3Propagator.extract(
        Context.ROOT_CONTEXT,
        carrier,
        (c, k) => 1 // not a number
      );
      const ctx2 = b3Propagator.extract(
        Context.ROOT_CONTEXT,
        carrier,
        (c, k) => [] // empty array
      );
      const ctx3 = b3Propagator.extract(
        Context.ROOT_CONTEXT,
        carrier,
        (c, k) => undefined // missing value
      );

      assert.ok(ctx1 === Context.ROOT_CONTEXT);
      assert.ok(ctx2 === Context.ROOT_CONTEXT);
      assert.ok(ctx3 === Context.ROOT_CONTEXT);
    });

    it('should left-pad 64 bit trace ids with 0', () => {
      carrier[X_B3_TRACE_ID] = '8448eb211c80319c';
      carrier[X_B3_SPAN_ID] = 'b7ad6b7169203331';
      carrier[X_B3_SAMPLED] = '1';
      const extractedSpanContext = getExtractedSpanContext(
        b3Propagator.extract(Context.ROOT_CONTEXT, carrier, defaultGetter)
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'b7ad6b7169203331',
        traceId: '00000000000000008448eb211c80319c',
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });
  });
});
