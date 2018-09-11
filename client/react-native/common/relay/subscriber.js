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

  const subscribe = ({ updater, iterator }) => {
    iterator && _iterators.push(iterator)
    updater && _updaters.push(updater)

    return {
      unsubscribe: () => {
        _iterators = iterator
          ? _iterators.filter(_ => _ !== iterator)
          : _iterators
        _updaters = updater ? _updaters.filter(_ => _ !== updater) : _updaters
      },
    }
  }

  return {
    start,
    dispose,
    subscribe,
  }
}
