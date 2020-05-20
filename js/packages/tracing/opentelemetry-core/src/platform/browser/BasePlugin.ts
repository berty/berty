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

import {
  Logger,
  Plugin,
  PluginConfig,
  TracerProvider,
} from '@opentelemetry/api';
import { BaseAbstractPlugin } from '../BaseAbstractPlugin';

/** This class represent the base to patch plugin. */
export abstract class BasePlugin<T> extends BaseAbstractPlugin<T>
  implements Plugin<T> {
  enable(
    moduleExports: T,
    tracerProvider: TracerProvider,
    logger: Logger,
    config?: PluginConfig
  ): T {
    this._moduleExports = moduleExports;
    this._tracer = tracerProvider.getTracer(
      this._tracerName,
      this._tracerVersion
    );
    this._logger = logger;
    if (config) this._config = config;
    return this.patch();
  }
}
