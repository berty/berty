import { NativeModule, requireNativeModule } from 'expo';

import { BertyBridgeExpoModuleEvents } from './BertyBridgeExpo.types';

declare class BertyBridgeExpoModule extends NativeModule<BertyBridgeExpoModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<BertyBridgeExpoModule>('BertyBridgeExpo');
