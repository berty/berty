/**
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

import { SDK_INFO } from '@opentelemetry/core';
import * as assert from 'assert';
import { Resource } from '../../src/Resource';
import {
  CLOUD_RESOURCE,
  CONTAINER_RESOURCE,
  HOST_RESOURCE,
  K8S_RESOURCE,
  TELEMETRY_SDK_RESOURCE,
  SERVICE_RESOURCE,
} from '../../src/constants';

/**
 * Test utility method to validate a cloud resource
 *
 * @param resource the Resource to validate
 * @param validations validations for the resource labels
 */
export const assertCloudResource = (
  resource: Resource,
  validations: {
    provider?: string;
    accountId?: string;
    region?: string;
    zone?: string;
  }
) => {
  assertHasOneLabel(CLOUD_RESOURCE, resource);
  if (validations.provider)
    assert.strictEqual(
      resource.labels[CLOUD_RESOURCE.PROVIDER],
      validations.provider
    );
  if (validations.accountId)
    assert.strictEqual(
      resource.labels[CLOUD_RESOURCE.ACCOUNT_ID],
      validations.accountId
    );
  if (validations.region)
    assert.strictEqual(
      resource.labels[CLOUD_RESOURCE.REGION],
      validations.region
    );
  if (validations.zone)
    assert.strictEqual(resource.labels[CLOUD_RESOURCE.ZONE], validations.zone);
};

/**
 * Test utility method to validate a container resource
 *
 * @param resource the Resource to validate
 * @param validations validations for the resource labels
 */
export const assertContainerResource = (
  resource: Resource,
  validations: {
    name?: string;
    imageName?: string;
    imageTag?: string;
  }
) => {
  assertHasOneLabel(CONTAINER_RESOURCE, resource);
  if (validations.name)
    assert.strictEqual(
      resource.labels[CONTAINER_RESOURCE.NAME],
      validations.name
    );
  if (validations.imageName)
    assert.strictEqual(
      resource.labels[CONTAINER_RESOURCE.IMAGE_NAME],
      validations.imageName
    );
  if (validations.imageTag)
    assert.strictEqual(
      resource.labels[CONTAINER_RESOURCE.IMAGE_TAG],
      validations.imageTag
    );
};

/**
 * Test utility method to validate a host resource
 *
 * @param resource the Resource to validate
 * @param validations validations for the resource labels
 */
export const assertHostResource = (
  resource: Resource,
  validations: {
    hostName?: string;
    id?: string;
    name?: string;
    hostType?: string;
    imageName?: string;
    imageId?: string;
    imageVersion?: string;
  }
) => {
  assertHasOneLabel(HOST_RESOURCE, resource);
  if (validations.hostName)
    assert.strictEqual(
      resource.labels[HOST_RESOURCE.HOSTNAME],
      validations.hostName
    );
  if (validations.id)
    assert.strictEqual(resource.labels[HOST_RESOURCE.ID], validations.id);
  if (validations.name)
    assert.strictEqual(resource.labels[HOST_RESOURCE.NAME], validations.name);
  if (validations.hostType)
    assert.strictEqual(
      resource.labels[HOST_RESOURCE.TYPE],
      validations.hostType
    );
  if (validations.imageName)
    assert.strictEqual(
      resource.labels[HOST_RESOURCE.IMAGE_NAME],
      validations.imageName
    );
  if (validations.imageId)
    assert.strictEqual(
      resource.labels[HOST_RESOURCE.IMAGE_ID],
      validations.imageId
    );
  if (validations.imageVersion)
    assert.strictEqual(
      resource.labels[HOST_RESOURCE.IMAGE_VERSION],
      validations.imageVersion
    );
};

/**
 * Test utility method to validate a K8s resource
 *
 * @param resource the Resource to validate
 * @param validations validations for the resource labels
 */
export const assertK8sResource = (
  resource: Resource,
  validations: {
    clusterName?: string;
    namespaceName?: string;
    podName?: string;
    deploymentName?: string;
  }
) => {
  assertHasOneLabel(K8S_RESOURCE, resource);
  if (validations.clusterName)
    assert.strictEqual(
      resource.labels[K8S_RESOURCE.CLUSTER_NAME],
      validations.clusterName
    );
  if (validations.namespaceName)
    assert.strictEqual(
      resource.labels[K8S_RESOURCE.NAMESPACE_NAME],
      validations.namespaceName
    );
  if (validations.podName)
    assert.strictEqual(
      resource.labels[K8S_RESOURCE.POD_NAME],
      validations.podName
    );
  if (validations.deploymentName)
    assert.strictEqual(
      resource.labels[K8S_RESOURCE.DEPLOYMENT_NAME],
      validations.deploymentName
    );
};

/**
 * Test utility method to validate a telemetry sdk resource
 *
 * @param resource the Resource to validate
 * @param validations validations for the resource labels
 */
export const assertTelemetrySDKResource = (
  resource: Resource,
  validations: {
    name?: string;
    language?: string;
    version?: string;
  }
) => {
  const defaults = {
    name: SDK_INFO.NAME,
    language: SDK_INFO.LANGUAGE,
    version: SDK_INFO.VERSION,
  };
  validations = { ...defaults, ...validations };

  if (validations.name)
    assert.strictEqual(
      resource.labels[TELEMETRY_SDK_RESOURCE.NAME],
      validations.name
    );
  if (validations.language)
    assert.strictEqual(
      resource.labels[TELEMETRY_SDK_RESOURCE.LANGUAGE],
      validations.language
    );
  if (validations.version)
    assert.strictEqual(
      resource.labels[TELEMETRY_SDK_RESOURCE.VERSION],
      validations.version
    );
};

/**
 * Test utility method to validate a service resource
 *
 * @param resource the Resource to validate
 * @param validations validations for the resource labels
 */
export const assertServiceResource = (
  resource: Resource,
  validations: {
    name: string;
    instanceId: string;
    namespace?: string;
    version?: string;
  }
) => {
  assert.strictEqual(resource.labels[SERVICE_RESOURCE.NAME], validations.name);
  assert.strictEqual(
    resource.labels[SERVICE_RESOURCE.INSTANCE_ID],
    validations.instanceId
  );
  if (validations.namespace)
    assert.strictEqual(
      resource.labels[SERVICE_RESOURCE.NAMESPACE],
      validations.namespace
    );
  if (validations.version)
    assert.strictEqual(
      resource.labels[SERVICE_RESOURCE.VERSION],
      validations.version
    );
};

/**
 * Test utility method to validate an empty resource
 *
 * @param resource the Resource to validate
 */
export const assertEmptyResource = (resource: Resource) => {
  assert.strictEqual(Object.keys(resource.labels).length, 0);
};

const assertHasOneLabel = (
  constants: { [key: string]: string },
  resource: Resource
): void => {
  const hasOne = Object.values(constants).reduce(
    (found, key) => found || resource.labels.hasOwnProperty(key),
    false
  );
  assert.ok(
    hasOne,
    'Resource must have one of the following labels: ' +
      Object.values(constants).join(', ')
  );
};
