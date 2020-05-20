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

import { SpanProcessor } from '../SpanProcessor';
import { SpanExporter } from './SpanExporter';
import { ReadableSpan } from './ReadableSpan';

/**
 * An implementation of the {@link SpanProcessor} that converts the {@link Span}
 * to {@link ReadableSpan} and passes it to the configured exporter.
 *
 * Only spans that are sampled are converted.
 */
export class SimpleSpanProcessor implements SpanProcessor {
  constructor(private readonly _exporter: SpanExporter) {}
  private _isShutdown = false;

  forceFlush(): void {
    // do nothing as all spans are being exported without waiting
  }

  // does nothing.
  onStart(span: ReadableSpan): void {}

  onEnd(span: ReadableSpan): void {
    if (this._isShutdown) {
      return;
    }
    this._exporter.export([span], () => {});
  }

  shutdown(): void {
    if (this._isShutdown) {
      return;
    }
    this._isShutdown = true;

    this._exporter.shutdown();
  }
}
