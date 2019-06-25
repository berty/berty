import { action } from 'mobx'

export class ServiceStore {
  type = ''

  store = null

  bridge = null

  constructor(store, bridge) {
    if (store) {
      this.name = store
    } else {
      throw new Error('store must be defined')
    }
    if (bridge) {
      this.bridge = bridge
    } else {
      throw new Error('bridge must be defined')
    }
  }

  @action async invoke(methodName, input) {
    return this.bridge[methodName](input)
  }
}
