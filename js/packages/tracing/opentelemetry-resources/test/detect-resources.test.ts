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

import * as nock from 'nock';
import * as sinon from 'sinon';
import { URL } from 'url';
import { Resource, detectResources } from '../src';
import { awsEc2Detector } from '../src/platform/node/detectors';
import {
  assertServiceResource,
  assertCloudResource,
  assertHostResource,
} from './util/resource-assertions';
import {
  BASE_PATH,
  HEADER_NAME,
  HEADER_VALUE,
  HOST_ADDRESS,
  SECONDARY_HOST_ADDRESS,
  resetIsAvailableCache,
} from 'gcp-metadata';

const HEADERS = {
  [HEADER_NAME.toLowerCase()]: HEADER_VALUE,
};
const INSTANCE_PATH = BASE_PATH + '/instance';
const INSTANCE_ID_PATH = BASE_PATH + '/instance/id';
const PROJECT_ID_PATH = BASE_PATH + '/project/project-id';
const ZONE_PATH = BASE_PATH + '/instance/zone';
const CLUSTER_NAME_PATH = BASE_PATH + '/instance/attributes/cluster-name';

const { origin: AWS_HOST, pathname: AWS_PATH } = new URL(
  awsEc2Detector.AWS_INSTANCE_IDENTITY_DOCUMENT_URI
);

const mockedAwsResponse = {
  instanceId: 'my-instance-id',
  instanceType: 'my-instance-type',
  accountId: 'my-account-id',
  region: 'my-region',
  availabilityZone: 'my-zone',
};

describe('detectResources', async () => {
  beforeEach(() => {
    nock.disableNetConnect();
    process.env.OTEL_RESOURCE_LABELS =
      'service.instance.id=627cc493,service.name=my-service,service.namespace=default,service.version=0.0.1';
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
    delete process.env.OTEL_RESOURCE_LABELS;
  });

  describe('in GCP environment', () => {
    after(() => {
      resetIsAvailableCache();
    });

    it('returns a merged resource', async () => {
      const gcpScope = nock(HOST_ADDRESS)
        .get(INSTANCE_PATH)
        .reply(200, {}, HEADERS)
        .get(INSTANCE_ID_PATH)
        .reply(200, () => 452003179927758, HEADERS)
        .get(PROJECT_ID_PATH)
        .reply(200, () => 'my-project-id', HEADERS)
        .get(ZONE_PATH)
        .reply(200, () => 'project/zone/my-zone', HEADERS)
        .get(CLUSTER_NAME_PATH)
        .reply(404);
      const gcpSecondaryScope = nock(SECONDARY_HOST_ADDRESS)
        .get(INSTANCE_PATH)
        .reply(200, {}, HEADERS);
      const awsScope = nock(AWS_HOST)
        .get(AWS_PATH)
        .replyWithError({ code: 'ENOTFOUND' });
      const resource: Resource = await detectResources();
      awsScope.done();
      gcpSecondaryScope.done();
      gcpScope.done();

      assertCloudResource(resource, {
        provider: 'gcp',
        accountId: 'my-project-id',
        zone: 'my-zone',
      });
      assertHostResource(resource, { id: '452003179927758' });
      assertServiceResource(resource, {
        instanceId: '627cc493',
        name: 'my-service',
        namespace: 'default',
        version: '0.0.1',
      });
    });
  });

  describe('in AWS environment', () => {
    it('returns a merged resource', async () => {
      const gcpScope = nock(HOST_ADDRESS)
        .get(INSTANCE_PATH)
        .replyWithError({
          code: 'ENOTFOUND',
        });
      const gcpSecondaryScope = nock(SECONDARY_HOST_ADDRESS)
        .get(INSTANCE_PATH)
        .replyWithError({
          code: 'ENOTFOUND',
        });
      const awsScope = nock(AWS_HOST)
        .get(AWS_PATH)
        .reply(200, () => mockedAwsResponse);
      const resource: Resource = await detectResources();
      gcpSecondaryScope.done();
      gcpScope.done();
      awsScope.done();

      assertCloudResource(resource, {
        provider: 'aws',
        accountId: 'my-account-id',
        region: 'my-region',
        zone: 'my-zone',
      });
      assertHostResource(resource, {
        id: 'my-instance-id',
        hostType: 'my-instance-type',
      });
      assertServiceResource(resource, {
        instanceId: '627cc493',
        name: 'my-service',
        namespace: 'default',
        version: '0.0.1',
      });
    });
  });

  describe('with a buggy detector', () => {
    it('returns a merged resource', async () => {
      const stub = sinon.stub(awsEc2Detector, 'detect').throws();
      const resource: Resource = await detectResources();

      assertServiceResource(resource, {
        instanceId: '627cc493',
        name: 'my-service',
        namespace: 'default',
        version: '0.0.1',
      });

      stub.restore();
    });
  });
});
