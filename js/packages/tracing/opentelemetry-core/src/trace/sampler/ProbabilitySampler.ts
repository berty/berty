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

import { Sampler, SpanContext, TraceFlags } from '@opentelemetry/api';

/** Sampler that samples a given fraction of traces. */
export class ProbabilitySampler implements Sampler {
  constructor(private readonly _probability: number = 0) {
    this._probability = this._normalize(_probability);
  }

  shouldSample(parentContext?: SpanContext) {
    // Respect the parent sampling decision if there is one
    if (parentContext && typeof parentContext.traceFlags !== 'undefined') {
      return (
        (TraceFlags.SAMPLED & parentContext.traceFlags) === TraceFlags.SAMPLED
      );
    }
    if (this._probability >= 1.0) return true;
    else if (this._probability <= 0) return false;
    return Math.random() < this._probability;
  }

  toString(): string {
    // TODO: Consider to use `AlwaysSampleSampler` and `NeverSampleSampler`
    // based on the specs.
    return `ProbabilitySampler{${this._probability}}`;
  }

  private _normalize(probability: number): number {
    if (typeof probability !== 'number' || isNaN(probability)) return 0;
    return probability >= 1 ? 1 : probability <= 0 ? 0 : probability;
  }
}

export const ALWAYS_SAMPLER = new ProbabilitySampler(1);
export const NEVER_SAMPLER = new ProbabilitySampler(0);
