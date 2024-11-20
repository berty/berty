import { registerWebModule, NativeModule } from 'expo';

import { BertyPushExpoModuleEvents } from './BertyPushExpo.types';

class BertyPushExpoModule extends NativeModule<BertyPushExpoModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(BertyPushExpoModule);
