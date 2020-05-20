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

import { ALWAYS_SAMPLER, LogLevel } from '../../opentelemetry-core/src/index'

/** Default limit for Message events per span */
export const DEFAULT_MAX_EVENTS_PER_SPAN = 128
/** Default limit for Attributes per span */
export const DEFAULT_MAX_ATTRIBUTES_PER_SPAN = 32
/** Default limit for Links per span */
export const DEFAULT_MAX_LINKS_PER_SPAN = 32

/**
 * Default configuration. For fields with primitive values, any user-provided
 * value will override the corresponding default value. For fields with
 * non-primitive values (like `traceParams`), the user-provided value will be
 * used to extend the default value.
 */
export const DEFAULT_CONFIG = {
	defaultAttributes: {},
	logLevel: LogLevel.INFO,
	sampler: ALWAYS_SAMPLER,
	traceParams: {
		numberOfAttributesPerSpan: DEFAULT_MAX_ATTRIBUTES_PER_SPAN,
		numberOfLinksPerSpan: DEFAULT_MAX_LINKS_PER_SPAN,
		numberOfEventsPerSpan: DEFAULT_MAX_EVENTS_PER_SPAN,
	},
}
