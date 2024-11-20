import * as React from 'react';

import { BertyPushExpoViewProps } from './BertyPushExpo.types';

export default function BertyPushExpoView(props: BertyPushExpoViewProps) {
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
