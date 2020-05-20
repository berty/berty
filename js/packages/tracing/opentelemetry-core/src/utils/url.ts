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
 * Check if {@param url} matches {@param urlToMatch}
 * @param url
 * @param urlToMatch
 */
export function urlMatches(url: string, urlToMatch: string | RegExp): boolean {
  if (typeof urlToMatch === 'string') {
    return url === urlToMatch;
  } else {
    return !!url.match(urlToMatch);
  }
}
/**
 * Check if {@param url} should be ignored when comparing against {@param ignoredUrls}
 * @param url
 * @param ignoredUrls
 */
export function isUrlIgnored(
  url: string,
  ignoredUrls?: Array<string | RegExp>
): boolean {
  if (!ignoredUrls) {
    return false;
  }

  for (const ignoreUrl of ignoredUrls) {
    if (urlMatches(url, ignoreUrl)) {
      return true;
    }
  }
  return false;
}
