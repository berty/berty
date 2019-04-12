import { observable, action } from 'mobx'

export class EntityStore {
  store = null
  type = ''
  @observable map = {}

  constructor (store, type) {
    if (store) {
      this.store = store
    } else {
      throw new Error('store must be defined')
    }
    if (type) {
      this.type = type
    } else {
      throw new Error('type must be defined')
    }
  }

  @action create (entity) {
    this.map[entity.id] = entity
  }

  @action update (entity) {
    const update = this.map[entity.id]
    Object.keys(entity).forEach(key => (update[key] = entity[key]))
  }

  @action delete (entity) {
    delete this.map[entity.id]
  }
}
