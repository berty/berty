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
  BASE_PATH,
  HEADER_NAME,
  HEADER_VALUE,
  HOST_ADDRESS,
  SECONDARY_HOST_ADDRESS,
  resetIsAvailableCache,
} from 'gcp-metadata';
import * as nock from 'nock';
import { Resource } from '../../src';
import { gcpDetector } from '../../src/platform/node/detectors';
import {
  assertCloudResource,
  assertHostResource,
  assertK8sResource,
  assertContainerResource,
  assertEmptyResource,
} from '../util/resource-assertions';

const HEADERS = {
  [HEADER_NAME.toLowerCase()]: HEADER_VALUE,
};
const INSTANCE_PATH = BASE_PATH + '/instance';
const INSTANCE_ID_PATH = BASE_PATH + '/instance/id';
const PROJECT_ID_PATH = BASE_PATH + '/project/project-id';
const ZONE_PATH = BASE_PATH + '/instance/zone';
const CLUSTER_NAME_PATH = BASE_PATH + '/instance/attributes/cluster-name';

describe('gcpDetector', () => {
  describe('.detect', () => {
    before(() => {
      nock.disableNetConnect();
    });

    after(() => {
      nock.enableNetConnect();
      delete process.env.KUBERNETES_SERVICE_HOST;
      delete process.env.NAMESPACE;
      delete process.env.CONTAINER_NAME;
      delete process.env.HOSTNAME;
    });

    beforeEach(() => {
      resetIsAvailableCache();
      nock.cleanAll();
      delete process.env.KUBERNETES_SERVICE_HOST;
      delete process.env.NAMESPACE;
      delete process.env.CONTAINER_NAME;
      delete process.env.HOSTNAME;
    });

    it('should return resource with GCP metadata', async () => {
      const scope = nock(HOST_ADDRESS)
        .get(INSTANCE_PATH)
        .reply(200, {}, HEADERS)
        .get(INSTANCE_ID_PATH)
        .reply(200, () => 4520031799277581759, HEADERS)
        .get(PROJECT_ID_PATH)
        .reply(200, () => 'my-project-id', HEADERS)
        .get(ZONE_PATH)
        .reply(200, () => 'project/zone/my-zone', HEADERS)
        .get(CLUSTER_NAME_PATH)
        .reply(404);
      const secondaryScope = nock(SECONDARY_HOST_ADDRESS)
        .get(INSTANCE_PATH)
        .reply(200, {}, HEADERS);
      const resource: Resource = await gcpDetector.detect();
      secondaryScope.done();
      scope.done();

      assertCloudResource(resource, {
        provider: 'gcp',
        accountId: 'my-project-id',
        zone: 'my-zone',
      });
      assertHostResource(resource, { id: '4520031799277582000' });
    });

    it('should populate K8s labels resource when KUBERNETES_SERVICE_HOST is set', async () => {
      process.env.KUBERNETES_SERVICE_HOST = 'my-host';
      process.env.NAMESPACE = 'my-namespace';
      process.env.HOSTNAME = 'my-hostname';
      process.env.CONTAINER_NAME = 'my-container-name';
      const scope = nock(HOST_ADDRESS)
        .get(INSTANCE_PATH)
        .reply(200, {}, HEADERS)
        .get(INSTANCE_ID_PATH)
        .reply(200, () => 4520031799277581759, HEADERS)
        .get(CLUSTER_NAME_PATH)
        .reply(200, () => 'my-cluster', HEADERS)
        .get(PROJECT_ID_PATH)
        .reply(200, () => 'my-project-id', HEADERS)
        .get(ZONE_PATH)
        .reply(200, () => 'project/zone/my-zone', HEADERS);
      const secondaryScope = nock(SECONDARY_HOST_ADDRESS)
        .get(INSTANCE_PATH)
        .reply(200, {}, HEADERS);
      const resource = await gcpDetector.detect();
      secondaryScope.done();
      scope.done();

      assertCloudResource(resource, {
        provider: 'gcp',
        accountId: 'my-project-id',
        zone: 'my-zone',
      });
      assertK8sResource(resource, {
        clusterName: 'my-cluster',
        podName: 'my-hostname',
        namespaceName: 'my-namespace',
      });
      assertContainerResource(resource, { name: 'my-container-name' });
    });

    it('should return resource and empty data for non-available metadata attributes', async () => {
      const scope = nock(HOST_ADDRESS)
        .get(INSTANCE_PATH)
        .reply(200, {}, HEADERS)
        .get(PROJECT_ID_PATH)
        .reply(200, () => 'my-project-id', HEADERS)
        .get(ZONE_PATH)
        .reply(413)
        .get(INSTANCE_ID_PATH)
        .reply(400, undefined, HEADERS)
        .get(CLUSTER_NAME_PATH)
        .reply(413);
      const secondaryScope = nock(SECONDARY_HOST_ADDRESS)
        .get(INSTANCE_PATH)
        .reply(200, {}, HEADERS);
      const resource = await gcpDetector.detect();
      secondaryScope.done();
      scope.done();

      assertCloudResource(resource, {
        provider: 'gcp',
        accountId: 'my-project-id',
        zone: '',
      });
    });

    it('returns empty resource if not detected', async () => {
      const resource = await gcpDetector.detect();
      assertEmptyResource(resource);
    });
  });
});
