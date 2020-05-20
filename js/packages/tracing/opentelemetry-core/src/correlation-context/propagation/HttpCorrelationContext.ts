/*!
 * Copyright 2020, OpenTelemetry Authors
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

import {
  Context,
  CorrelationContext,
  GetterFunction,
  HttpTextPropagator,
  SetterFunction,
} from '@opentelemetry/api';
import {
  getCorrelationContext,
  setCorrelationContext,
} from '../correlation-context';

const KEY_PAIR_SEPARATOR = '=';
const PROPERTIES_SEPARATOR = ';';
const ITEMS_SEPARATOR = ',';

// Name of the http header used to propagate the correlation context
export const CORRELATION_CONTEXT_HEADER = 'otcorrelations';
// Maximum number of name-value pairs allowed by w3c spec
export const MAX_NAME_VALUE_PAIRS = 180;
// Maximum number of bytes per a single name-value pair allowed by w3c spec
export const MAX_PER_NAME_VALUE_PAIRS = 4096;
// Maximum total length of all name-value pairs allowed by w3c spec
export const MAX_TOTAL_LENGTH = 8192;
type KeyPair = {
  key: string;
  value: string;
};

/**
 * Propagates {@link CorrelationContext} through Context format propagation.
 *
 * Based on the Correlation Context specification:
 * https://w3c.github.io/correlation-context/
 */
export class HttpCorrelationContext implements HttpTextPropagator {
  inject(context: Context, carrier: unknown, setter: SetterFunction) {
    const correlationContext = getCorrelationContext(context);
    if (!correlationContext) return;
    const keyPairs = this._getKeyPairs(correlationContext)
      .filter((pair: string) => {
        return pair.length <= MAX_PER_NAME_VALUE_PAIRS;
      })
      .slice(0, MAX_NAME_VALUE_PAIRS);
    const headerValue = this._serializeKeyPairs(keyPairs);
    if (headerValue.length > 0) {
      setter(carrier, CORRELATION_CONTEXT_HEADER, headerValue);
    }
  }

  private _serializeKeyPairs(keyPairs: string[]) {
    return keyPairs.reduce((hValue: String, current: String) => {
      const value = `${hValue}${hValue != '' ? ITEMS_SEPARATOR : ''}${current}`;
      return value.length > MAX_TOTAL_LENGTH ? hValue : value;
    }, '');
  }

  private _getKeyPairs(correlationContext: CorrelationContext): string[] {
    return Object.keys(correlationContext).map(
      (key: string) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(
          correlationContext[key].value
        )}`
    );
  }

  extract(context: Context, carrier: unknown, getter: GetterFunction): Context {
    const headerValue: string = getter(
      carrier,
      CORRELATION_CONTEXT_HEADER
    ) as string;
    if (!headerValue) return context;
    const correlationContext: CorrelationContext = {};
    if (headerValue.length == 0) {
      return context;
    }
    const pairs = headerValue.split(ITEMS_SEPARATOR);
    if (pairs.length == 1) return context;
    pairs.forEach(entry => {
      const keyPair = this._parsePairKeyValue(entry);
      if (keyPair) {
        correlationContext[keyPair.key] = { value: keyPair.value };
      }
    });
    return setCorrelationContext(context, correlationContext);
  }

  private _parsePairKeyValue(entry: string): KeyPair | undefined {
    const valueProps = entry.split(PROPERTIES_SEPARATOR);
    if (valueProps.length <= 0) return;
    const keyPairPart = valueProps.shift();
    if (!keyPairPart) return;
    const keyPair = keyPairPart.split(KEY_PAIR_SEPARATOR);
    if (keyPair.length <= 1) return;
    const key = decodeURIComponent(keyPair[0].trim());
    let value = decodeURIComponent(keyPair[1].trim());
    if (valueProps.length > 0) {
      value =
        value + PROPERTIES_SEPARATOR + valueProps.join(PROPERTIES_SEPARATOR);
    }
    return { key, value };
  }
}
