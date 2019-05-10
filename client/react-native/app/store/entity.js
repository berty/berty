import { observable, action, computed } from 'mobx'

export class EntityStore {
  store = null
  Type = null
  @observable map = {}

  @computed get keys () {
    return Object.keys(this.map)
  }

  @computed get values () {
    return Object.values(this.map)
  }

  set values (values) {
    values.forEach(_ => {
      if (this.map[_.id]) {
        this.update(_)
      } else {
        this.create(_)
      }
    })
  }

  constructor (store, type) {
    if (store) {
      this.store = store
    } else {
      throw new Error('store must be defined')
    }
    if (type) {
      this.Type = type
    } else {
      throw new Error('type must be defined')
    }
  }

  @action.bound create (entity) {
    this.map[entity.id] = observable(new this.Type(this.store, entity))
    return this.map[entity.id]
  }

  @action.bound update (entity) {
    return this.create(entity)
  }

  @action.bound delete (entity) {
    delete this.map[entity.id]
  }
}

export default EntityStore
