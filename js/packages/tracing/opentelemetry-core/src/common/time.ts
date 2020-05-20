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
import { otperformance as performance } from '../platform';
import { TimeOriginLegacy } from './types';

const NANOSECOND_DIGITS = 9;
const SECOND_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS);

/**
 * Converts a number to HrTime
 * @param epochMillis
 */
function numberToHrtime(epochMillis: number): api.HrTime {
  const epochSeconds = epochMillis / 1000;
  // Decimals only.
  const seconds = Math.trunc(epochSeconds);
  // Round sub-nanosecond accuracy to nanosecond.
  const nanos =
    Number((epochSeconds - seconds).toFixed(NANOSECOND_DIGITS)) *
    SECOND_TO_NANOSECONDS;
  return [seconds, nanos];
}

function getTimeOrigin(): number {
  let timeOrigin = performance.timeOrigin;
  if (typeof timeOrigin !== 'number') {
    const perf: TimeOriginLegacy = (performance as unknown) as TimeOriginLegacy;
    timeOrigin = perf.timing && perf.timing.fetchStart;
  }
  return timeOrigin;
}

/**
 * Returns an hrtime calculated via performance component.
 * @param performanceNow
 */
export function hrTime(performanceNow?: number): api.HrTime {
  const timeOrigin = numberToHrtime(getTimeOrigin());
  const now = numberToHrtime(
    typeof performanceNow === 'number' ? performanceNow : performance.now()
  );

  let seconds = timeOrigin[0] + now[0];
  let nanos = timeOrigin[1] + now[1];

  // Nanoseconds
  if (nanos > SECOND_TO_NANOSECONDS) {
    nanos -= SECOND_TO_NANOSECONDS;
    seconds += 1;
  }

  return [seconds, nanos];
}

/**
 *
 * Converts a TimeInput to an HrTime, defaults to _hrtime().
 * @param time
 */
export function timeInputToHrTime(time: api.TimeInput): api.HrTime {
  // process.hrtime
  if (isTimeInputHrTime(time)) {
    return time as api.HrTime;
  } else if (typeof time === 'number') {
    // Must be a performance.now() if it's smaller than process start time.
    if (time < getTimeOrigin()) {
      return hrTime(time);
    } else {
      // epoch milliseconds or performance.timeOrigin
      return numberToHrtime(time);
    }
  } else if (time instanceof Date) {
    return [time.getTime(), 0];
  } else {
    throw TypeError('Invalid input type');
  }
}

/**
 * Returns a duration of two hrTime.
 * @param startTime
 * @param endTime
 */
export function hrTimeDuration(
  startTime: api.HrTime,
  endTime: api.HrTime
): api.HrTime {
  let seconds = endTime[0] - startTime[0];
  let nanos = endTime[1] - startTime[1];

  // overflow
  if (nanos < 0) {
    seconds -= 1;
    // negate
    nanos += SECOND_TO_NANOSECONDS;
  }

  return [seconds, nanos];
}

/**
 * Convert hrTime to timestamp, for example "2019-05-14T17:00:00.000123456Z"
 * @param hrTime
 */
export function hrTimeToTimeStamp(hrTime: api.HrTime): string {
  const precision = NANOSECOND_DIGITS;
  const tmp = `${'0'.repeat(precision)}${hrTime[1]}Z`;
  const nanoString = tmp.substr(tmp.length - precision - 1);
  const date = new Date(hrTime[0] * 1000).toISOString();
  return date.replace('000Z', nanoString);
}

/**
 * Convert hrTime to nanoseconds.
 * @param hrTime
 */
export function hrTimeToNanoseconds(hrTime: api.HrTime): number {
  return hrTime[0] * SECOND_TO_NANOSECONDS + hrTime[1];
}

/**
 * Convert hrTime to milliseconds.
 * @param hrTime
 */
export function hrTimeToMilliseconds(hrTime: api.HrTime): number {
  return Math.round(hrTime[0] * 1e3 + hrTime[1] / 1e6);
}

/**
 * Convert hrTime to microseconds.
 * @param hrTime
 */
export function hrTimeToMicroseconds(hrTime: api.HrTime): number {
  return Math.round(hrTime[0] * 1e6 + hrTime[1] / 1e3);
}

/**
 * check if time is HrTime
 * @param value
 */
export function isTimeInputHrTime(value: unknown) {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  );
}

/**
 * check if input value is a correct types.TimeInput
 * @param value
 */
export function isTimeInput(value: unknown) {
  return (
    isTimeInputHrTime(value) ||
    typeof value === 'number' ||
    value instanceof Date
  );
}
