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

import { HttpTextPropagator, Logger } from '@opentelemetry/api';

/** Configuration object for composite propagator */
export interface CompositePropagatorConfig {
  /**
   * List of propagators to run. Propagators run in the
   * list order. If a propagator later in the list writes the same context
   * key as a propagator earlier in the list, the later on will "win".
   */
  propagators?: HttpTextPropagator[];

  /** Instance of logger */
  logger?: Logger;
}
