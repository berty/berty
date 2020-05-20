/**
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

import { NoopTracerProvider } from '@opentelemetry/api';
import * as assert from 'assert';
import * as path from 'path';
import { BasePlugin, NoopLogger } from '../../src';
import * as types from '../trace/fixtures/test-package/foo/bar/internal';

const provider = new NoopTracerProvider();
const logger = new NoopLogger();
describe('BasePlugin', () => {
  describe('internalFilesLoader', () => {
    it('should load internally exported files', () => {
      const testPackage = require('../trace/fixtures/test-package');
      const plugin = new TestPlugin();
      assert.doesNotThrow(() => {
        plugin.enable(testPackage, provider, logger);
      });

      // @TODO: https://github.com/open-telemetry/opentelemetry-js/issues/285
      if (typeof process !== 'undefined' && process.release.name === 'node') {
        assert.ok(plugin['_internalFilesExports']);
        assert.strictEqual(
          (plugin['_internalFilesExports']
            .internal as typeof types).internallyExportedFunction(),
          true
        );
        assert.strictEqual(
          plugin['_internalFilesExports'].expectUndefined,
          undefined
        );
        assert.strictEqual(
          (plugin['_moduleExports']![
            'externallyExportedFunction'
          ] as Function)(),
          true
        );
      } else {
        assert.ok(true, 'Internal file loading is not tested in the browser');
      }
    });
  });
});

class TestPlugin extends BasePlugin<{ [key: string]: Function }> {
  readonly moduleName = 'test-package';
  readonly version = '0.1.0';
  readonly _basedir = basedir;

  constructor() {
    super('test-package.opentelemetry');
  }

  protected readonly _internalFilesList = {
    '0.1.0': {
      internal: 'foo/bar/internal.js',
    },
    '^1.0.0': {
      expectUndefined: 'foo/bar/internal.js',
    },
  };

  protected patch(): { [key: string]: Function } {
    return this._moduleExports;
  }
  protected unpatch(): void {}
}

const basedir = path.dirname(require.resolve('../trace/fixtures/test-package'));
