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

/**
 * Performance metrics
 */
import { PerformanceTimingNames } from './enums/PerformanceTimingNames';

export type PerformanceEntries = {
  [PerformanceTimingNames.CONNECT_END]?: number;
  [PerformanceTimingNames.CONNECT_START]?: number;
  [PerformanceTimingNames.DOM_COMPLETE]?: number;
  [PerformanceTimingNames.DOM_CONTENT_LOADED_EVENT_END]?: number;
  [PerformanceTimingNames.DOM_CONTENT_LOADED_EVENT_START]?: number;
  [PerformanceTimingNames.DOM_INTERACTIVE]?: number;
  [PerformanceTimingNames.DOMAIN_LOOKUP_END]?: number;
  [PerformanceTimingNames.DOMAIN_LOOKUP_START]?: number;
  [PerformanceTimingNames.FETCH_START]?: number;
  [PerformanceTimingNames.LOAD_EVENT_END]?: number;
  [PerformanceTimingNames.LOAD_EVENT_START]?: number;
  [PerformanceTimingNames.REDIRECT_END]?: number;
  [PerformanceTimingNames.REDIRECT_START]?: number;
  [PerformanceTimingNames.REQUEST_START]?: number;
  [PerformanceTimingNames.RESPONSE_END]?: number;
  [PerformanceTimingNames.RESPONSE_START]?: number;
  [PerformanceTimingNames.SECURE_CONNECTION_START]?: number;
  [PerformanceTimingNames.UNLOAD_EVENT_END]?: number;
  [PerformanceTimingNames.UNLOAD_EVENT_START]?: number;
};

/**
 * This interface defines a fallback to read performance metrics,
 * this happens for example on Safari Mac
 */
export interface PerformanceLegacy {
  timing?: PerformanceEntries;
}

/**
 * This interface is used in {@link getResource} function to return
 *     main request and it's corresponding PreFlight request
 */
export interface PerformanceResourceTimingInfo {
  corsPreFlightRequest?: PerformanceResourceTiming;
  mainRequest?: PerformanceResourceTiming;
}
