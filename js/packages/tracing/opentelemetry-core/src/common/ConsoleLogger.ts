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

import { Logger } from '@opentelemetry/api';
import { LogLevel } from './types';

export class ConsoleLogger implements Logger {
  constructor(level: LogLevel = LogLevel.INFO) {
    if (level >= LogLevel.DEBUG) {
      this.debug = (...args) => {
        console.debug(...args);
      };
    }
    if (level >= LogLevel.INFO) {
      this.info = (...args) => {
        console.info(...args);
      };
    }
    if (level >= LogLevel.WARN) {
      this.warn = (...args) => {
        console.warn(...args);
      };
    }
    if (level >= LogLevel.ERROR) {
      this.error = (...args) => {
        console.error(...args);
      };
    }
  }

  debug(message: string, ...args: unknown[]) {}

  error(message: string, ...args: unknown[]) {}

  warn(message: string, ...args: unknown[]) {}

  info(message: string, ...args: unknown[]) {}
}
