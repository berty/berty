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
	SpanKind,
	Status,
	Attributes,
	HrTime,
	Link,
	SpanContext,
	TimedEvent,
} from '@opentelemetry/api'
import { Resource } from '../../../opentelemetry-resources/src/index'

export interface ReadableSpan {
	readonly name: string
	readonly kind: SpanKind
	readonly spanContext: SpanContext
	readonly parentSpanId?: string
	readonly startTime: HrTime
	readonly endTime: HrTime
	readonly status: Status
	readonly attributes: Attributes
	readonly links: Link[]
	readonly events: TimedEvent[]
	readonly duration: HrTime
	readonly ended: boolean
	readonly resource: Resource
}
