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

import { Resource } from '../../src/Resource';
import { envDetector } from '../../src/platform/node/detectors/EnvDetector';
import {
  assertK8sResource,
  assertEmptyResource,
} from '../util/resource-assertions';
import { K8S_RESOURCE } from '../../src';

describe('envDetector()', () => {
  describe('with valid env', () => {
    before(() => {
      process.env.OTEL_RESOURCE_LABELS =
        'k8s.pod.name="pod-xyz-123",k8s.cluster.name="c1",k8s.namespace.name="default"';
    });

    after(() => {
      delete process.env.OTEL_RESOURCE_LABELS;
    });

    it('should return resource information from environment variable', async () => {
      const resource: Resource = await envDetector.detect();
      assertK8sResource(resource, {
        [K8S_RESOURCE.POD_NAME]: 'pod-xyz-123',
        [K8S_RESOURCE.CLUSTER_NAME]: 'c1',
        [K8S_RESOURCE.NAMESPACE_NAME]: 'default',
      });
    });
  });

  describe('with empty env', () => {
    it('should return empty resource', async () => {
      const resource: Resource = await envDetector.detect();
      assertEmptyResource(resource);
    });
  });
});
