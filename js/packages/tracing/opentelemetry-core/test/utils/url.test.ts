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

import { isUrlIgnored } from '../../src';

const urlIgnored = 'url should be ignored';
const urlNotIgnored = 'url should NOT be ignored';

const urlToTest = 'http://myaddress.com/somepath';

describe('BasePlugin - Utils', () => {
  describe('isUrlIgnored', () => {
    describe('when ignored urls are undefined', () => {
      it('should return false', () => {
        assert.strictEqual(isUrlIgnored(urlToTest), false, urlNotIgnored);
      });
    });
    describe('when ignored urls are empty', () => {
      it('should return false', () => {
        assert.strictEqual(isUrlIgnored(urlToTest, []), false, urlNotIgnored);
      });
    });
    describe('when ignored urls is the same as url', () => {
      it('should return true', () => {
        assert.strictEqual(
          isUrlIgnored(urlToTest, ['http://myaddress.com/somepath']),
          true,
          urlIgnored
        );
      });
    });
    describe('when url is part of ignored urls', () => {
      it('should return false', () => {
        assert.strictEqual(
          isUrlIgnored(urlToTest, ['http://myaddress.com/some']),
          false,
          urlNotIgnored
        );
      });
    });
    describe('when ignored urls is part of url - REGEXP', () => {
      it('should return true', () => {
        assert.strictEqual(
          isUrlIgnored(urlToTest, [/.+?myaddress\.com/]),
          true,
          urlIgnored
        );
      });
    });
    describe('when url is part of ignored urls - REGEXP', () => {
      it('should return false', () => {
        assert.strictEqual(
          isUrlIgnored(urlToTest, [/http:\/\/myaddress\.com\/somepath2/]),
          false,
          urlNotIgnored
        );
      });
    });
  });
});
