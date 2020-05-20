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

import * as api from '@opentelemetry/api';
import { validateKey, validateValue } from '../internal/validators';

const MAX_TRACE_STATE_ITEMS = 32;
const MAX_TRACE_STATE_LEN = 512;
const LIST_MEMBERS_SEPARATOR = ',';
const LIST_MEMBER_KEY_VALUE_SPLITTER = '=';

/**
 * TraceState must be a class and not a simple object type because of the spec
 * requirement (https://www.w3.org/TR/trace-context/#tracestate-field).
 *
 * Here is the list of allowed mutations:
 * - New key-value pair should be added into the beginning of the list
 * - The value of any key can be updated. Modified keys MUST be moved to the
 * beginning of the list.
 */
export class TraceState implements api.TraceState {
  private _internalState: Map<string, string> = new Map();

  constructor(rawTraceState?: string) {
    if (rawTraceState) this._parse(rawTraceState);
  }

  set(key: string, value: string): void {
    // TODO: Benchmark the different approaches(map vs list) and
    // use the faster one.
    if (this._internalState.has(key)) this._internalState.delete(key);
    this._internalState.set(key, value);
  }

  unset(key: string): void {
    this._internalState.delete(key);
  }

  get(key: string): string | undefined {
    return this._internalState.get(key);
  }

  serialize(): string {
    return this._keys()
      .reduce((agg: string[], key) => {
        agg.push(key + LIST_MEMBER_KEY_VALUE_SPLITTER + this.get(key));
        return agg;
      }, [])
      .join(LIST_MEMBERS_SEPARATOR);
  }

  private _parse(rawTraceState: string) {
    if (rawTraceState.length > MAX_TRACE_STATE_LEN) return;
    this._internalState = rawTraceState
      .split(LIST_MEMBERS_SEPARATOR)
      .reverse() // Store in reverse so new keys (.set(...)) will be placed at the beginning
      .reduce((agg: Map<string, string>, part: string) => {
        const i = part.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
        if (i !== -1) {
          const key = part.slice(0, i);
          const value = part.slice(i + 1, part.length);
          if (validateKey(key) && validateValue(value)) {
            agg.set(key, value);
          } else {
            // TODO: Consider to add warning log
          }
        }
        return agg;
      }, new Map());

    // Because of the reverse() requirement, trunc must be done after map is created
    if (this._internalState.size > MAX_TRACE_STATE_ITEMS) {
      this._internalState = new Map(
        Array.from(this._internalState.entries())
          .reverse() // Use reverse same as original tracestate parse chain
          .slice(0, MAX_TRACE_STATE_ITEMS)
      );
    }
  }

  private _keys(): string[] {
    return Array.from(this._internalState.keys()).reverse();
  }
}
