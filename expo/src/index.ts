import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to BertyMessenger.web.ts
// and on native platforms to BertyMessenger.ts
import BertyMessengerModule from './BertyMessengerModule';
import BertyMessengerView from './BertyMessengerView';
import { ChangeEventPayload, BertyMessengerViewProps } from './BertyMessenger.types';

// Get the native constant value.
export const PI = BertyMessengerModule.PI;

export function hello(): string {
  return BertyMessengerModule.hello();
}

export async function setValueAsync(value: string) {
  return await BertyMessengerModule.setValueAsync(value);
}

const emitter = new EventEmitter(BertyMessengerModule ?? NativeModulesProxy.BertyMessenger);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export { BertyMessengerView, BertyMessengerViewProps, ChangeEventPayload };
