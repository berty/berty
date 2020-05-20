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

import * as assert from 'assert';

import { isWrapped, ShimWrapped } from '../../src';

function makeWrapped(
  wrapped: unknown,
  unwrap: any,
  original: any
): ShimWrapped {
  const wrapper = function() {};
  defineProperty(wrapper, '__wrapped', wrapped);
  defineProperty(wrapper, '__unwrap', unwrap);
  defineProperty(wrapper, '__original', original);
  return (wrapper as unknown) as ShimWrapped;
}

function defineProperty(obj: any, name: string, value: unknown) {
  var enumerable = !!obj[name] && obj.propertyIsEnumerable(name);
  Object.defineProperty(obj, name, {
    configurable: true,
    enumerable: enumerable,
    writable: true,
    value: value,
  });
}

const notWrappedFunctions: any[] = [];
notWrappedFunctions.push(
  makeWrapped(
    false,
    function() {},
    function() {}
  )
);
notWrappedFunctions.push(makeWrapped(false, 'foo', function() {}));
notWrappedFunctions.push(makeWrapped(false, function() {}, 'foo'));
notWrappedFunctions.push({
  __wrapped: true,
  __unwrap: function() {},
  __original: function() {},
});

describe('utils-wrap', () => {
  describe('isWrapped', () => {
    it('should return true when function was wrapped', () => {
      const wrapped: ShimWrapped = makeWrapped(
        true,
        function() {},
        function() {}
      );
      assert.strictEqual(isWrapped(wrapped), true, 'function is not wrapped');
    });

    it('should return false when function is not wrapped', () => {
      notWrappedFunctions.forEach((wrapped: unknown, index: number) => {
        const result = isWrapped(wrapped as ShimWrapped);
        assert.strictEqual(
          result,
          false,
          `function number #${index} is wrapped`
        );
      });
    });
  });
});
