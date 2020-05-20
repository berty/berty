/*!
 * Copyright 2020, OpenTelemetry Authors
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

import { SDK_INFO } from '../../opentelemetry-core/src/index'
import { TELEMETRY_SDK_RESOURCE } from './constants'
import { ResourceLabels } from './types'

/**
 * A Resource describes the entity for which a signals (metrics or trace) are
 * collected.
 */
export class Resource {
	static readonly EMPTY = new Resource({})

	/**
	 * Returns an empty Resource
	 */
	static empty(): Resource {
		return Resource.EMPTY
	}

	/**
	 * Returns a Resource that indentifies the SDK in use.
	 */
	static createTelemetrySDKResource(): Resource {
		return new Resource({
			[TELEMETRY_SDK_RESOURCE.LANGUAGE]: SDK_INFO.LANGUAGE,
			[TELEMETRY_SDK_RESOURCE.NAME]: SDK_INFO.NAME,
			[TELEMETRY_SDK_RESOURCE.VERSION]: SDK_INFO.VERSION,
		})
	}

	constructor(
		/**
		 * A dictionary of labels with string keys and values that provide information
		 * about the entity as numbers, strings or booleans
		 * TODO: Consider to add check/validation on labels.
		 */
		readonly labels: ResourceLabels,
	) {}

	/**
	 * Returns a new, merged {@link Resource} by merging the current Resource
	 * with the other Resource. In case of a collision, current Resource takes
	 * precedence.
	 *
	 * @param other the Resource that will be merged with this.
	 * @returns the newly merged Resource.
	 */
	merge(other: Resource | null): Resource {
		if (!other || !Object.keys(other.labels).length) {
			return this
		}

		// Labels from resource overwrite labels from other resource.
		const mergedLabels = Object.assign({}, other.labels, this.labels)
		return new Resource(mergedLabels)
	}
}
