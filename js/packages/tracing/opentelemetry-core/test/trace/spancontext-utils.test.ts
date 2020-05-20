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

import * as assert from 'assert';
import * as context from '../../src/trace/spancontext-utils';
import { TraceFlags } from '@opentelemetry/api';

describe('spancontext-utils', () => {
  it('should return true for valid spancontext', () => {
    const spanContext = {
      traceId: 'd4cda95b652f4a1592b449d5929fda1b',
      spanId: '6e0c63257de34c92',
      traceFlags: TraceFlags.NONE,
    };
    assert.ok(context.isValid(spanContext));
  });

  it('should return false when traceId is invalid', () => {
    const spanContext = {
      traceId: context.INVALID_TRACEID,
      spanId: '6e0c63257de34c92',
      traceFlags: TraceFlags.NONE,
    };
    assert.ok(!context.isValid(spanContext));
  });

  it('should return false when spanId is invalid', () => {
    const spanContext = {
      traceId: 'd4cda95b652f4a1592b449d5929fda1b',
      spanId: context.INVALID_SPANID,
      traceFlags: TraceFlags.NONE,
    };
    assert.ok(!context.isValid(spanContext));
  });

  it('should return false when traceId & spanId is invalid', () => {
    const spanContext = {
      traceId: context.INVALID_TRACEID,
      spanId: context.INVALID_SPANID,
      traceFlags: TraceFlags.NONE,
    };
    assert.ok(!context.isValid(spanContext));
  });
});
