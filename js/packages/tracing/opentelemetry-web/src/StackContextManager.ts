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

import { Context } from '@opentelemetry/api';
import { ContextManager } from '@opentelemetry/context-base';

/**
 * Stack Context Manager for managing the state in web
 * it doesn't fully support the async calls though
 */
export class StackContextManager implements ContextManager {
  /**
   * whether the context manager is enabled or not
   */
  private _enabled = false;

  /**
   * Keeps the reference to current context
   */
  public _currentContext = Context.ROOT_CONTEXT;

  /**
   *
   * @param target Function to be executed within the context
   * @param context
   */
  private _bindFunction<T extends Function>(
    target: T,
    context = Context.ROOT_CONTEXT
  ): T {
    const manager = this;
    const contextWrapper = function(this: any, ...args: any[]) {
      return manager.with(context, () => target.apply(this, args));
    };
    Object.defineProperty(contextWrapper, 'length', {
      enumerable: false,
      configurable: true,
      writable: false,
      value: target.length,
    });
    return (contextWrapper as unknown) as T;
  }

  /**
   * Returns the active context
   */
  active(): Context {
    return this._currentContext;
  }

  /**
   * Binds a the certain context or the active one to the target function and then returns the target
   * @param target
   * @param context
   */
  bind<T>(target: T, context = Context.ROOT_CONTEXT): T {
    // if no specific context to propagate is given, we use the current one
    if (context === undefined) {
      context = this.active();
    }
    if (typeof target === 'function') {
      return this._bindFunction(target, context);
    }
    return target;
  }

  /**
   * Disable the context manager (clears the current context)
   */
  disable(): this {
    this._currentContext = Context.ROOT_CONTEXT;
    this._enabled = false;
    return this;
  }

  /**
   * Enables the context manager and creates a default(root) context
   */
  enable(): this {
    if (this._enabled) {
      return this;
    }
    this._enabled = true;
    this._currentContext = Context.ROOT_CONTEXT;
    return this;
  }

  /**
   * Calls the callback function [fn] with the provided [context]. If [context] is undefined then it will use the window.
   * The context will be set as active
   * @param context
   * @param fn Callback function
   */
  with<T extends (...args: unknown[]) => ReturnType<T>>(
    context: Context | null,
    fn: () => ReturnType<T>
  ): ReturnType<T> {
    const previousContext = this._currentContext;
    this._currentContext = context || Context.ROOT_CONTEXT;

    try {
      return fn();
    } catch (err) {
      throw err;
    } finally {
      this._currentContext = previousContext;
    }
  }
}
