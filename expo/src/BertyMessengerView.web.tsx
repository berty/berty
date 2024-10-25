import * as React from 'react';

import { BertyMessengerViewProps } from './BertyMessenger.types';

export default function BertyMessengerView(props: BertyMessengerViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
