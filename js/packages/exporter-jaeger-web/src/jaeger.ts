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

import * as api from '@opentelemetry/api'
import { ExportResult, NoopLogger } from '@berty-tech/tracing/opentelemetry-core/src/index'
import { ReadableSpan, SpanExporter } from '@berty-tech/tracing/opentelemetry-tracing/src/index'
import { spanToThrift } from './transform'
import * as jaegerTypes from './types'

/**
 * Format and sends span information to Jaeger Exporter.
 */
export class JaegerExporter implements SpanExporter {
	private readonly _logger: api.Logger
	private readonly _process: jaegerTypes.ThriftProcess
	private readonly _sender: typeof jaegerTypes.HTTPSender
	private readonly _onShutdownFlushTimeout: number

	constructor(config: jaegerTypes.ExporterConfig) {
		this._logger = config.logger || new NoopLogger()
		const tags: jaegerTypes.Tag[] = config.tags || []
		this._onShutdownFlushTimeout =
			typeof config.flushTimeout === 'number' ? config.flushTimeout : 2000

		config.host = config.host || process.env.JAEGER_AGENT_HOST

		this._sender = new jaegerTypes.HTTPSender(config)

		this._process = {
			serviceName: config.serviceName,
			tags: jaegerTypes.ThriftUtils.getThriftTags(tags),
		}
		this._sender.setProcess(this._process)
	}

	/** Exports a list of spans to Jaeger. */
	export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): void {
		if (spans.length === 0) {
			return resultCallback(ExportResult.SUCCESS)
		}
		this._logger.debug('Jaeger exporter export')
		this._sendSpans(spans, resultCallback).catch((err) => {
			this._logger.error(`JaegerExporter failed to export: ${err}`)
		})
	}

	/** Shutdown exporter. */
	shutdown(): void {
		// Make an optimistic flush.
		this._flush()
		// Sleeping x seconds before closing the sender's connection to ensure
		// all spans are flushed.
		setTimeout(() => {
			this._sender.close()
		}, this._onShutdownFlushTimeout)
	}

	/** Transform spans and sends to Jaeger service. */
	private async _sendSpans(spans: ReadableSpan[], done?: (result: ExportResult) => void) {
		const thriftSpan = spans.map((span) => spanToThrift(span))
		for (const span of thriftSpan) {
			try {
				await this._append(span)
			} catch (err) {
				this._logger.error(`failed to append span: ${err}`)
				// TODO right now we break out on first error, is that desirable?
				if (done) {
					return done(ExportResult.FAILED_NOT_RETRYABLE)
				}
			}
		}
		this._logger.debug('successful append for : %s', thriftSpan.length)

		// Flush all spans on each export. No-op if span buffer is empty
		await this._flush()

		if (done) {
			return done(ExportResult.SUCCESS)
		}
	}

	private async _append(span: jaegerTypes.ThriftSpan): Promise<number> {
		return new Promise((resolve, reject) => {
			this._sender.append(span, (count: number, err?: string) => {
				if (err) {
					return reject(new Error(err))
				}
				resolve(count)
			})
		})
	}

	private async _flush(): Promise<void> {
		await new Promise((resolve, reject) => {
			this._sender.flush((_count: number, err?: string) => {
				if (err) {
					return reject(new Error(err))
				}
				this._logger.debug('successful flush for %s spans', _count)
				resolve()
			})
		})
	}
}
