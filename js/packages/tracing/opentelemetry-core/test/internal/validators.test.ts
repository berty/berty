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
import { validateKey, validateValue } from '../../src/internal/validators';

describe('validators', () => {
  describe('validateKey', () => {
    const validKeysTestCases = [
      'abcdefghijklmnopqrstuvwxyz0123456789-_*/',
      'baz-',
      'baz_',
      'baz*',
      'baz*bar',
      'baz/',
      'tracestate',
      'fw529a3039@dt',
      '6cab5bb-29a@dt',
    ];
    validKeysTestCases.forEach(testCase =>
      it(`returns true when key contains valid chars ${testCase}`, () => {
        assert.ok(validateKey(testCase), `${testCase} should be valid`);
      })
    );

    const invalidKeysTestCases = [
      '1_key',
      'kEy_1',
      'k'.repeat(257),
      'key,',
      'TrAcEsTaTE',
      'TRACESTATE',
      '',
      '6num',
    ];
    invalidKeysTestCases.forEach(testCase =>
      it(`returns true when key contains invalid chars ${testCase}`, () => {
        assert.ok(!validateKey(testCase), `${testCase} should be invalid`);
      })
    );
  });

  describe('validateValue', () => {
    const validValuesTestCases = [
      'first second',
      'baz*',
      'baz$',
      'baz@',
      'first-second',
      'baz~bar',
      'test-v1:120',
      '-second',
      'first.second',
      'TrAcEsTaTE',
      'TRACESTATE',
    ];
    validValuesTestCases.forEach(testCase =>
      it(`returns true when value contains valid chars ${testCase}`, () => {
        assert.ok(validateValue(testCase));
      })
    );

    const invalidValuesTestCases = [
      'my_value=5',
      'first,second',
      'first ',
      'k'.repeat(257),
      ',baz',
      'baz,',
      'baz=',
      '',
    ];
    invalidValuesTestCases.forEach(testCase =>
      it(`returns true when value contains invalid chars ${testCase}`, () => {
        assert.ok(!validateValue(testCase));
      })
    );
  });
});
