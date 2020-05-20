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

// This file is the webpack entry point for the browser Karma tests. It requires
// all modules ending in "test" from the current folder and all its subfolders.
const testsContextCommon = require.context('.', true, /test$/);
testsContextCommon.keys().forEach(key => {
  if (key.indexOf('./platform/BasePlugin.test') >= 0) {
    return function() {};
  }
  return testsContextCommon(key);
});

const srcContext = require.context('.', true, /src$/);
srcContext.keys().forEach(srcContext);
