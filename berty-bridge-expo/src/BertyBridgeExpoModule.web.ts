import { registerWebModule, NativeModule } from 'expo';

import type { BertyBridgeExpoModuleEvents } from './BertyBridgeExpo.types';

class BertyBridgeExpoModule extends NativeModule<BertyBridgeExpoModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(BertyBridgeExpoModule, 'BertyBridgeExpo');
