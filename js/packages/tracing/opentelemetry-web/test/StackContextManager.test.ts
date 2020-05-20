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
import { StackContextManager } from '../src';
import { Context } from '@opentelemetry/api';

describe('StackContextManager', () => {
  let contextManager: StackContextManager;
  const key1 = Context.createKey('test key 1');

  beforeEach(() => {
    contextManager = new StackContextManager();
    contextManager.enable();
  });

  afterEach(() => {
    contextManager.disable();
  });

  describe('.enable()', () => {
    it('should work', () => {
      assert.doesNotThrow(() => {
        assert(
          contextManager.enable() === contextManager,
          'should return this'
        );
        assert(
          contextManager.active() === Context.ROOT_CONTEXT,
          'should have root context'
        );
      });
    });
  });

  describe('.disable()', () => {
    it('should work', () => {
      assert.doesNotThrow(() => {
        assert(
          contextManager.disable() === contextManager,
          'should return this'
        );
        assert(
          contextManager.active() === Context.ROOT_CONTEXT,
          'should have no context'
        );
      });
    });
  });

  describe('.with()', () => {
    it('should run the callback (null as target)', done => {
      contextManager.with(null, done);
    });

    it('should run the callback (object as target)', done => {
      const test = Context.ROOT_CONTEXT.setValue(key1, 1);
      contextManager.with(test, () => {
        assert.strictEqual(
          contextManager.active(),
          test,
          'should have context'
        );
        return done();
      });
    });

    it('should run the callback (when disabled)', done => {
      contextManager.disable();
      contextManager.with(null, () => {
        contextManager.enable();
        return done();
      });
    });

    it('should rethrow errors', done => {
      assert.throws(() => {
        contextManager.with(null, () => {
          throw new Error('This should be rethrown');
        });
      });
      return done();
    });

    it('should finally restore an old context', done => {
      const ctx1 = Context.ROOT_CONTEXT.setValue(key1, 'ctx1');
      const ctx2 = Context.ROOT_CONTEXT.setValue(key1, 'ctx2');
      const ctx3 = Context.ROOT_CONTEXT.setValue(key1, 'ctx3');
      contextManager.with(ctx1, () => {
        assert.strictEqual(contextManager.active(), ctx1);
        contextManager.with(ctx2, () => {
          assert.strictEqual(contextManager.active(), ctx2);
          contextManager.with(ctx3, () => {
            assert.strictEqual(contextManager.active(), ctx3);
          });
          assert.strictEqual(contextManager.active(), ctx2);
        });
        assert.strictEqual(contextManager.active(), ctx1);
        return done();
      });
      assert.strictEqual(contextManager.active(), window);
    });

    it('should finally restore an old context when context is an object', done => {
      const ctx1 = Context.ROOT_CONTEXT.setValue(key1, 1);
      const ctx2 = Context.ROOT_CONTEXT.setValue(key1, 2);
      const ctx3 = Context.ROOT_CONTEXT.setValue(key1, 3);
      contextManager.with(ctx1, () => {
        assert.strictEqual(contextManager.active(), ctx1);
        contextManager.with(ctx2, () => {
          assert.strictEqual(contextManager.active(), ctx2);
          contextManager.with(ctx3, () => {
            assert.strictEqual(contextManager.active(), ctx3);
          });
          assert.strictEqual(contextManager.active(), ctx2);
        });
        assert.strictEqual(contextManager.active(), ctx1);
        return done();
      });
      assert.strictEqual(contextManager.active(), window);
    });
  });

  describe('.bind(function)', () => {
    it('should call the function with previously assigned context', () => {
      class Obj {
        title: string;

        constructor(title: string) {
          this.title = title;
        }

        getTitle() {
          return (contextManager.active().getValue(key1) as Obj).title;
        }
      }

      const obj1 = new Obj('a1');
      const ctx = Context.ROOT_CONTEXT.setValue(key1, obj1);
      obj1.title = 'a2';
      const obj2 = new Obj('b1');
      const wrapper: any = contextManager.bind(obj2.getTitle, ctx);
      assert.ok(wrapper(), 'a2');
    });

    it('should return the same target (when enabled)', () => {
      const test = Context.ROOT_CONTEXT.setValue(key1, 1);
      assert.deepStrictEqual(contextManager.bind(test), test);
    });

    it('should return the same target (when disabled)', () => {
      contextManager.disable();
      const test = Context.ROOT_CONTEXT.setValue(key1, 1);
      assert.deepStrictEqual(contextManager.bind(test), test);
      contextManager.enable();
    });

    it('should return current context (when enabled)', done => {
      const context = Context.ROOT_CONTEXT.setValue(key1, 1);
      const fn: any = contextManager.bind(() => {
        assert.strictEqual(
          contextManager.active(),
          context,
          'should have context'
        );
        return done();
      }, context);
      fn();
    });

    it('should return current context (when disabled)', done => {
      contextManager.disable();
      const context = Context.ROOT_CONTEXT.setValue(key1, 1);
      const fn: any = contextManager.bind(() => {
        assert.strictEqual(
          contextManager.active(),
          context,
          'should have context'
        );
        return done();
      }, context);
      fn();
    });
  });
});
