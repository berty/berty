import { NativeModule, requireNativeModule } from 'expo';

import { BertyPushExpoModuleEvents } from './BertyPushExpo.types';

declare class BertyPushExpoModule extends NativeModule<BertyPushExpoModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<BertyPushExpoModule>('BertyPushExpo');
