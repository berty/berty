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

import { CorrelationContext } from '@opentelemetry/api';
import { Context } from '@opentelemetry/context-base';

const CORRELATION_CONTEXT = Context.createKey(
  'OpenTelemetry Distributed Contexts Key'
);

/**
 * @param {Context} Context that manage all context values
 * @returns {CorrelationContext} Extracted correlation context from the context
 */
export function getCorrelationContext(
  context: Context
): CorrelationContext | undefined {
  return (
    (context.getValue(CORRELATION_CONTEXT) as CorrelationContext) || undefined
  );
}

/**
 * @param {Context} Context that manage all context values
 * @param {CorrelationContext} correlation context that will be set in the actual context
 */
export function setCorrelationContext(
  context: Context,
  correlationContext: CorrelationContext
): Context {
  return context.setValue(CORRELATION_CONTEXT, correlationContext);
}
