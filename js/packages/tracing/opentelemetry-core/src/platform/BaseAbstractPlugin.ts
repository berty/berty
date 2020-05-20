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
  Tracer,
  Plugin,
  Logger,
  PluginConfig,
  TracerProvider,
  PluginInternalFiles,
} from '@opentelemetry/api';

/** This class represent the base to patch plugin. */
export abstract class BaseAbstractPlugin<T> implements Plugin<T> {
  abstract readonly moduleName: string; // required for internalFilesExports
  supportedVersions?: string[];
  readonly version?: string; // required for internalFilesExports

  protected readonly _basedir?: string; // required for internalFilesExports
  protected _config!: PluginConfig;
  protected _internalFilesExports!: { [module: string]: unknown }; // output for internalFilesExports
  protected readonly _internalFilesList?: PluginInternalFiles; // required for internalFilesExports
  protected _logger!: Logger;
  protected _moduleExports!: T;
  protected _tracer!: Tracer;

  constructor(
    protected readonly _tracerName: string,
    protected readonly _tracerVersion?: string
  ) {}

  disable(): void {
    this.unpatch();
  }

  abstract enable(
    moduleExports: T,
    tracerProvider: TracerProvider,
    logger: Logger,
    config?: PluginConfig
  ): T;

  protected abstract patch(): T;
  protected abstract unpatch(): void;
}
