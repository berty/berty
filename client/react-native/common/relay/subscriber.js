import environment from './environment'
import { requestSubscription } from 'react-relay'

export default ({ subscription, iterators = [], updaters = [] }) => {
  let _iterators = iterators
  let _updaters = updaters

  let dispose = () => {}

  const start = () => {
    dispose = requestSubscription(environment, {
      subscription,
      onNext: response =>
        _iterators.forEach(iterator => iterator.next(response)),
      onError: error => _iterators.forEach(iterator => iterator.throw(error)),
      onCompleted: () => _iterators.forEach(iterator => iterator.return()),
      updater: (store, data) =>
        _updaters.forEach(updater => updater(store, data)),
    }).dispose
    return { dispose }
  }

  const subscribe = (iterator = function * () {}, updater = () => {}) => {
    _iterators.push(iterator)
    _updaters.push(updater)

    return {
      unsubscribe: () => {
        _iterators = _iterators.filter(_ => _ !== iterator)
        _updaters = _updaters.filter(_ => _ !== updater)
      },
    }
  }

  return {
    start,
    dispose,
    subscribe,
  }
}
