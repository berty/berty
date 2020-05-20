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
import { randomSpanId, randomTraceId } from '../../src/platform';

describe('randomTraceId', () => {
  it('returns 32 character hex strings', () => {
    const traceId = randomTraceId();
    assert.ok(traceId.match(/[a-f0-9]{32}/));
    assert.ok(!traceId.match(/^0+$/));
  });

  it('returns different ids on each call', () => {
    const traceId1 = randomTraceId();
    const traceId2 = randomTraceId();

    assert.notDeepStrictEqual(traceId1, traceId2);
  });
});

describe('randomSpanId', () => {
  it('returns 16 character hex strings', () => {
    const spanId = randomSpanId();
    assert.ok(spanId.match(/[a-f0-9]{16}/));
    assert.ok(!spanId.match(/^0+$/));
  });

  it('returns different ids on each call', () => {
    const spanId1 = randomSpanId();
    const spanId2 = randomSpanId();

    assert.notDeepStrictEqual(spanId1, spanId2);
  });
});
