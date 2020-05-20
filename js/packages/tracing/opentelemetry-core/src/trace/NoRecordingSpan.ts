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

import { SpanContext, NoopSpan } from '@opentelemetry/api';
import { INVALID_SPAN_CONTEXT } from '../trace/spancontext-utils';

/**
 * The NoRecordingSpan extends the {@link NoopSpan}, making all operations no-op
 * except context propagation.
 */
export class NoRecordingSpan extends NoopSpan {
  private readonly _context: SpanContext;

  constructor(spanContext: SpanContext) {
    super(spanContext);
    this._context = spanContext || INVALID_SPAN_CONTEXT;
  }

  // Returns a SpanContext.
  context(): SpanContext {
    return this._context;
  }
}
