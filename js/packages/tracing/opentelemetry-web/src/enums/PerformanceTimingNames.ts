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

export enum PerformanceTimingNames {
  CONNECT_END = 'connectEnd',
  CONNECT_START = 'connectStart',
  DOM_COMPLETE = 'domComplete',
  DOM_CONTENT_LOADED_EVENT_END = 'domContentLoadedEventEnd',
  DOM_CONTENT_LOADED_EVENT_START = 'domContentLoadedEventStart',
  DOM_INTERACTIVE = 'domInteractive',
  DOMAIN_LOOKUP_END = 'domainLookupEnd',
  DOMAIN_LOOKUP_START = 'domainLookupStart',
  FETCH_START = 'fetchStart',
  LOAD_EVENT_END = 'loadEventEnd',
  LOAD_EVENT_START = 'loadEventStart',
  REDIRECT_END = 'redirectEnd',
  REDIRECT_START = 'redirectStart',
  REQUEST_START = 'requestStart',
  RESPONSE_END = 'responseEnd',
  RESPONSE_START = 'responseStart',
  SECURE_CONNECTION_START = 'secureConnectionStart',
  UNLOAD_EVENT_END = 'unloadEventEnd',
  UNLOAD_EVENT_START = 'unloadEventStart',
}
