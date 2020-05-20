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

import * as assert from 'assert';
import { ConsoleLogger } from '../../src/common/ConsoleLogger';
import { LogLevel } from '../../src/common/types';

describe('ConsoleLogger', () => {
  const origDebug = console.debug;
  const origInfo = console.info;
  const origWarn = console.warn;
  const origError = console.error;
  let debugCalledArgs: unknown;
  let infoCalledArgs: unknown;
  let warnCalledArgs: unknown;
  let errorCalledArgs: unknown;

  beforeEach(() => {
    // mock
    console.debug = (...args: unknown[]) => {
      debugCalledArgs = args;
    };
    console.info = (...args: unknown[]) => {
      infoCalledArgs = args;
    };
    console.warn = (...args: unknown[]) => {
      warnCalledArgs = args;
    };
    console.error = (...args: unknown[]) => {
      errorCalledArgs = args;
    };
  });

  afterEach(() => {
    // restore
    debugCalledArgs = null;
    infoCalledArgs = null;
    warnCalledArgs = null;
    errorCalledArgs = null;
    console.debug = origDebug;
    console.info = origInfo;
    console.warn = origWarn;
    console.error = origError;
  });

  describe('constructor', () => {
    it('should log with default level', () => {
      const consoleLogger = new ConsoleLogger();
      consoleLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      consoleLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, ['warn called %s', 'param1']);
      consoleLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, ['info called %s', 'param1']);
    });

    it('should log with debug', () => {
      const consoleLogger = new ConsoleLogger(LogLevel.DEBUG);
      consoleLogger.error('error called');
      assert.deepStrictEqual(errorCalledArgs, ['error called']);
      consoleLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, ['warn called %s', 'param1']);
      consoleLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, ['info called %s', 'param1']);
      consoleLogger.debug('debug called %s', 'param1');
      assert.deepStrictEqual(debugCalledArgs, ['debug called %s', 'param1']);
    });

    it('should log with info', () => {
      const consoleLogger = new ConsoleLogger(LogLevel.INFO);
      consoleLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      consoleLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, ['warn called %s', 'param1']);
      consoleLogger.info('info called %s', 'param1');
      assert.deepStrictEqual(infoCalledArgs, ['info called %s', 'param1']);
      consoleLogger.debug('debug called %s', 'param1');
      assert.strictEqual(debugCalledArgs, null);
    });

    it('should log with warn', () => {
      const consoleLogger = new ConsoleLogger(LogLevel.WARN);
      consoleLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      consoleLogger.warn('warn called %s', 'param1');
      assert.deepStrictEqual(warnCalledArgs, ['warn called %s', 'param1']);
      consoleLogger.info('info called %s', 'param1');
      assert.strictEqual(infoCalledArgs, null);
      consoleLogger.debug('debug called %s', 'param1');
      assert.strictEqual(debugCalledArgs, null);
    });

    it('should log with error', () => {
      const consoleLogger = new ConsoleLogger(LogLevel.ERROR);
      consoleLogger.error('error called %s', 'param1');
      assert.deepStrictEqual(errorCalledArgs, ['error called %s', 'param1']);
      consoleLogger.warn('warn called %s', 'param1');
      assert.strictEqual(warnCalledArgs, null);
      consoleLogger.info('info called %s', 'param1');
      assert.strictEqual(infoCalledArgs, null);
      consoleLogger.debug('debug called %s', 'param1');
      assert.strictEqual(debugCalledArgs, null);
    });
  });
});
