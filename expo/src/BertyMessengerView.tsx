import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { BertyMessengerViewProps } from './BertyMessenger.types';

const NativeView: React.ComponentType<BertyMessengerViewProps> =
  requireNativeViewManager('BertyMessenger');

export default function BertyMessengerView(props: BertyMessengerViewProps) {
  return <NativeView {...props} />;
}
