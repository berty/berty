import * as React from 'react';

import { BertyBridgeExpoViewProps } from './BertyBridgeExpo.types';

export default function BertyBridgeExpoView(props: BertyBridgeExpoViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
