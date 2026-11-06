import { requireNativeView } from 'expo';
import * as React from 'react';

import type { BertyBridgeExpoViewProps } from './BertyBridgeExpo.types';

const NativeView: React.ComponentType<BertyBridgeExpoViewProps> =
  requireNativeView('BertyBridgeExpo');

export default function BertyBridgeExpoView(props: BertyBridgeExpoViewProps) {
  return <NativeView {...props} />;
}
