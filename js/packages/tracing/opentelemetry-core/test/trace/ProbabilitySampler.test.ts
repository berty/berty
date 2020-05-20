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
import {
  ProbabilitySampler,
  ALWAYS_SAMPLER,
  NEVER_SAMPLER,
} from '../../src/trace/sampler/ProbabilitySampler';

describe('ProbabilitySampler', () => {
  it('should return a always sampler for 1', () => {
    const sampler = new ProbabilitySampler(1);
    assert.strictEqual(sampler.shouldSample(), true);
  });

  it('should return a always sampler for >1', () => {
    const sampler = new ProbabilitySampler(100);
    assert.strictEqual(sampler.shouldSample(), true);
    assert.strictEqual(sampler.toString(), 'ProbabilitySampler{1}');
  });

  it('should return a never sampler for 0', () => {
    const sampler = new ProbabilitySampler(0);
    assert.strictEqual(sampler.shouldSample(), false);
  });

  it('should return a never sampler for <0', () => {
    const sampler = new ProbabilitySampler(-1);
    assert.strictEqual(sampler.shouldSample(), false);
  });

  it('should sample according to the probability', () => {
    Math.random = () => 1 / 10;
    const sampler = new ProbabilitySampler(0.2);
    assert.strictEqual(sampler.shouldSample(), true);
    assert.strictEqual(sampler.toString(), 'ProbabilitySampler{0.2}');

    Math.random = () => 5 / 10;
    assert.strictEqual(sampler.shouldSample(), false);
  });

  it('should return true for ALWAYS_SAMPLER', () => {
    assert.strictEqual(ALWAYS_SAMPLER.shouldSample(), true);
    assert.strictEqual(ALWAYS_SAMPLER.toString(), 'ProbabilitySampler{1}');
  });

  it('should return false for NEVER_SAMPLER', () => {
    assert.strictEqual(NEVER_SAMPLER.shouldSample(), false);
    assert.strictEqual(NEVER_SAMPLER.toString(), 'ProbabilitySampler{0}');
  });

  it('should handle NaN', () => {
    const sampler = new ProbabilitySampler(NaN);
    assert.strictEqual(sampler.shouldSample(), false);
    assert.strictEqual(sampler.toString(), 'ProbabilitySampler{0}');
  });

  it('should handle -NaN', () => {
    const sampler = new ProbabilitySampler(-NaN);
    assert.strictEqual(sampler.shouldSample(), false);
    assert.strictEqual(sampler.toString(), 'ProbabilitySampler{0}');
  });

  it('should handle undefined', () => {
    const sampler = new ProbabilitySampler(undefined);
    assert.strictEqual(sampler.shouldSample(), false);
    assert.strictEqual(sampler.toString(), 'ProbabilitySampler{0}');
  });
});
