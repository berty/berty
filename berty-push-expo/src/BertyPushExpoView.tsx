import { requireNativeView } from 'expo';
import * as React from 'react';

import { BertyPushExpoViewProps } from './BertyPushExpo.types';

const NativeView: React.ComponentType<BertyPushExpoViewProps> =
  requireNativeView('BertyPushExpo');

export default function BertyPushExpoView(props: BertyPushExpoViewProps) {
  return <NativeView {...props} />;
}
