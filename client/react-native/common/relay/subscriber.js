import environment from './environment'
import { requestSubscription } from 'react-relay'

export default ({ subscription, iterators = [], updaters = [] }) => {
  let _generators = iterators
  let _updaters = updaters

  let dispose = () => {}

  const start = () => {
    dispose = requestSubscription(environment, {
      subscription,
      onNext: response =>
        _generators.forEach(generator => generator.next(response)),
      onError: error =>
        _generators.forEach(generator => generator.throw(error)),
      onCompleted: () => _generators.forEach(generator => generator.return()),
      updater: (store, data) => _updaters.forEach(updater => updater(store, data)),
    }).dispose
    return { dispose }
  }

  const subscribe = ({ updater, iterator }) => {
    const generator = iterator && iterator()
    iterator && _generators.push(generator)
    updater && _updaters.push(updater)
    generator && generator.next()
    return {
      unsubscribe: () => {
        _generators = iterator
          ? _generators.filter(_ => _ !== iterator)
          : _generators
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
