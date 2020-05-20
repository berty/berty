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

import { SDK_INFO } from '@opentelemetry/core';
import { Resource } from '../src/Resource';
import {
  CLOUD_RESOURCE,
  CONTAINER_RESOURCE,
  HOST_RESOURCE,
  K8S_RESOURCE,
  TELEMETRY_SDK_RESOURCE,
  SERVICE_RESOURCE,
} from '../src/constants';
import {
  assertCloudResource,
  assertContainerResource,
  assertHostResource,
  assertK8sResource,
  assertTelemetrySDKResource,
  assertServiceResource,
} from './util/resource-assertions';

describe('assertCloudResource', () => {
  it('requires one cloud label', () => {
    const resource = new Resource({ [CLOUD_RESOURCE.PROVIDER]: 'gcp' });
    assertCloudResource(resource, {});
  });

  it('validates optional labels', () => {
    const resource = new Resource({
      [CLOUD_RESOURCE.PROVIDER]: 'gcp',
      [CLOUD_RESOURCE.ACCOUNT_ID]: 'opentelemetry',
      [CLOUD_RESOURCE.REGION]: 'us-central1',
      [CLOUD_RESOURCE.ZONE]: 'us-central1-a',
    });
    assertCloudResource(resource, {
      provider: 'gcp',
      accountId: 'opentelemetry',
      region: 'us-central1',
      zone: 'us-central1-a',
    });
  });
});

describe('assertContainerResource', () => {
  it('requires one container label', () => {
    const resource = new Resource({
      [CONTAINER_RESOURCE.NAME]: 'opentelemetry-autoconf',
    });
    assertContainerResource(resource, {});
  });

  it('validates optional labels', () => {
    const resource = new Resource({
      [CONTAINER_RESOURCE.NAME]: 'opentelemetry-autoconf',
      [CONTAINER_RESOURCE.IMAGE_NAME]: 'gcr.io/opentelemetry/operator',
      [CONTAINER_RESOURCE.IMAGE_TAG]: '0.1',
    });
    assertContainerResource(resource, {
      name: 'opentelemetry-autoconf',
      imageName: 'gcr.io/opentelemetry/operator',
      imageTag: '0.1',
    });
  });
});

describe('assertHostResource', () => {
  it('requires one host label', () => {
    const resource = new Resource({
      [HOST_RESOURCE.ID]: 'opentelemetry-test-id',
    });
    assertHostResource(resource, {});
  });

  it('validates optional labels', () => {
    const resource = new Resource({
      [HOST_RESOURCE.HOSTNAME]: 'opentelemetry-test-hostname',
      [HOST_RESOURCE.ID]: 'opentelemetry-test-id',
      [HOST_RESOURCE.NAME]: 'opentelemetry-test-name',
      [HOST_RESOURCE.TYPE]: 'n1-standard-1',
      [HOST_RESOURCE.IMAGE_NAME]:
        'infra-ami-eks-worker-node-7d4ec78312, CentOS-8-x86_64-1905',
      [HOST_RESOURCE.IMAGE_ID]: 'ami-07b06b442921831e5',
      [HOST_RESOURCE.IMAGE_VERSION]: '0.1',
    });
    assertHostResource(resource, {
      hostName: 'opentelemetry-test-hostname',
      id: 'opentelemetry-test-id',
      name: 'opentelemetry-test-name',
      hostType: 'n1-standard-1',
      imageName: 'infra-ami-eks-worker-node-7d4ec78312, CentOS-8-x86_64-1905',
      imageId: 'ami-07b06b442921831e5',
      imageVersion: '0.1',
    });
  });
});

describe('assertK8sResource', () => {
  it('requires one k8s label', () => {
    const resource = new Resource({
      [K8S_RESOURCE.CLUSTER_NAME]: 'opentelemetry-cluster',
    });
    assertK8sResource(resource, {});
  });

  it('validates optional labels', () => {
    const resource = new Resource({
      [K8S_RESOURCE.CLUSTER_NAME]: 'opentelemetry-cluster',
      [K8S_RESOURCE.NAMESPACE_NAME]: 'default',
      [K8S_RESOURCE.POD_NAME]: 'opentelemetry-pod-autoconf',
      [K8S_RESOURCE.DEPLOYMENT_NAME]: 'opentelemetry',
    });
    assertK8sResource(resource, {
      clusterName: 'opentelemetry-cluster',
      namespaceName: 'default',
      podName: 'opentelemetry-pod-autoconf',
      deploymentName: 'opentelemetry',
    });
  });
});

describe('assertTelemetrySDKResource', () => {
  it('uses default validations', () => {
    const resource = new Resource({
      [TELEMETRY_SDK_RESOURCE.NAME]: SDK_INFO.NAME,
      [TELEMETRY_SDK_RESOURCE.LANGUAGE]: SDK_INFO.LANGUAGE,
      [TELEMETRY_SDK_RESOURCE.VERSION]: SDK_INFO.VERSION,
    });
    assertTelemetrySDKResource(resource, {});
  });

  it('validates optional labels', () => {
    const resource = new Resource({
      [TELEMETRY_SDK_RESOURCE.NAME]: 'opentelemetry',
      [TELEMETRY_SDK_RESOURCE.LANGUAGE]: 'nodejs',
      [TELEMETRY_SDK_RESOURCE.VERSION]: '0.1.0',
    });
    assertTelemetrySDKResource(resource, {
      name: 'opentelemetry',
      language: 'nodejs',
      version: '0.1.0',
    });
  });
});

describe('assertServiceResource', () => {
  it('validates required labels', () => {
    const resource = new Resource({
      [SERVICE_RESOURCE.NAME]: 'shoppingcart',
      [SERVICE_RESOURCE.INSTANCE_ID]: '627cc493-f310-47de-96bd-71410b7dec09',
    });
    assertServiceResource(resource, {
      name: 'shoppingcart',
      instanceId: '627cc493-f310-47de-96bd-71410b7dec09',
    });
  });

  it('validates optional labels', () => {
    const resource = new Resource({
      [SERVICE_RESOURCE.NAME]: 'shoppingcart',
      [SERVICE_RESOURCE.INSTANCE_ID]: '627cc493-f310-47de-96bd-71410b7dec09',
      [SERVICE_RESOURCE.NAMESPACE]: 'shop',
      [SERVICE_RESOURCE.VERSION]: '0.1.0',
    });
    assertServiceResource(resource, {
      name: 'shoppingcart',
      instanceId: '627cc493-f310-47de-96bd-71410b7dec09',
      namespace: 'shop',
      version: '0.1.0',
    });
  });
});
