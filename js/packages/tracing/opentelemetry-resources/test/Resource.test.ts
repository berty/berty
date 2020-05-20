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

import * as assert from 'assert';
import { SDK_INFO } from '@opentelemetry/core';
import { Resource } from '../src';
import { assertTelemetrySDKResource } from './util/resource-assertions';

describe('Resource', () => {
  const resource1 = new Resource({
    'k8s.io/container/name': 'c1',
    'k8s.io/namespace/name': 'default',
    'k8s.io/pod/name': 'pod-xyz-123',
  });
  const resource2 = new Resource({
    'k8s.io/zone': 'zone1',
    'k8s.io/location': 'location',
  });
  const resource3 = new Resource({
    'k8s.io/container/name': 'c2',
    'k8s.io/location': 'location1',
  });
  const emptyResource = new Resource({});

  it('should return merged resource', () => {
    const expectedResource = new Resource({
      'k8s.io/container/name': 'c1',
      'k8s.io/namespace/name': 'default',
      'k8s.io/pod/name': 'pod-xyz-123',
      'k8s.io/zone': 'zone1',
      'k8s.io/location': 'location',
    });
    const actualResource = resource1.merge(resource2);
    assert.strictEqual(Object.keys(actualResource.labels).length, 5);
    assert.deepStrictEqual(actualResource, expectedResource);
  });

  it('should return merged resource when collision in labels', () => {
    const expectedResource = new Resource({
      'k8s.io/container/name': 'c1',
      'k8s.io/namespace/name': 'default',
      'k8s.io/pod/name': 'pod-xyz-123',
      'k8s.io/location': 'location1',
    });
    const actualResource = resource1.merge(resource3);
    assert.strictEqual(Object.keys(actualResource.labels).length, 4);
    assert.deepStrictEqual(actualResource, expectedResource);
  });

  it('should return merged resource when first resource is empty', () => {
    const actualResource = emptyResource.merge(resource2);
    assert.strictEqual(Object.keys(actualResource.labels).length, 2);
    assert.deepStrictEqual(actualResource, resource2);
  });

  it('should return merged resource when other resource is empty', () => {
    const actualResource = resource1.merge(emptyResource);
    assert.strictEqual(Object.keys(actualResource.labels).length, 3);
    assert.deepStrictEqual(actualResource, resource1);
  });

  it('should return merged resource when other resource is null', () => {
    const actualResource = resource1.merge(null);
    assert.strictEqual(Object.keys(actualResource.labels).length, 3);
    assert.deepStrictEqual(actualResource, resource1);
  });

  it('should accept string, number, and boolean values', () => {
    const resource = new Resource({
      'custom.string': 'strvalue',
      'custom.number': 42,
      'custom.boolean': true,
    });
    assert.equal(resource.labels['custom.string'], 'strvalue');
    assert.equal(resource.labels['custom.number'], 42);
    assert.equal(resource.labels['custom.boolean'], true);
  });

  describe('.empty()', () => {
    it('should return an empty resource', () => {
      const resource = Resource.empty();
      assert.equal(Object.entries(resource.labels), 0);
    });

    it('should return the same empty resource', () => {
      assert.strictEqual(Resource.empty(), Resource.empty());
    });
  });

  describe('.createTelemetrySDKResource()', () => {
    it('should return a telemetry SDK resource', () => {
      const resource = Resource.createTelemetrySDKResource();
      assertTelemetrySDKResource(resource, {
        language: SDK_INFO.LANGUAGE,
        name: SDK_INFO.NAME,
        version: SDK_INFO.VERSION,
      });
    });
  });
});
