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
import * as sinon from 'sinon';
import {
  BasicTracerProvider,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '../../src';

describe('ConsoleSpanExporter', () => {
  let consoleExporter: ConsoleSpanExporter;
  let previousConsoleLog: any;

  beforeEach(() => {
    previousConsoleLog = console.log;
    console.log = () => {};
    consoleExporter = new ConsoleSpanExporter();
  });

  afterEach(() => {
    console.log = previousConsoleLog;
  });

  describe('.export()', () => {
    it('should export information about span', () => {
      assert.doesNotThrow(() => {
        const basicTracerProvider = new BasicTracerProvider();
        consoleExporter = new ConsoleSpanExporter();

        const spyConsole = sinon.spy(console, 'log');
        const spyExport = sinon.spy(consoleExporter, 'export');

        basicTracerProvider.addSpanProcessor(
          new SimpleSpanProcessor(consoleExporter)
        );

        const span = basicTracerProvider.getTracer('default').startSpan('foo');
        span.addEvent('foobar');
        span.end();

        const spans = spyExport.args[0];
        const firstSpan = spans[0][0];
        const firstEvent = firstSpan.events[0];
        const consoleArgs = spyConsole.args[0];
        const consoleSpan = consoleArgs[0];
        const keys = Object.keys(consoleSpan)
          .sort()
          .join(',');

        const expectedKeys = [
          'attributes',
          'duration',
          'events',
          'id',
          'kind',
          'name',
          'parentId',
          'status',
          'timestamp',
          'traceId',
        ].join(',');

        assert.ok(firstSpan.name === 'foo');
        assert.ok(firstEvent.name === 'foobar');
        assert.ok(consoleSpan.id === firstSpan.spanContext.spanId);
        assert.ok(keys === expectedKeys);

        assert.ok(spyExport.calledOnce);
      });
    });
  });
});
