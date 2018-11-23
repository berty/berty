import { requestSubscription } from 'react-relay'

export default ({ environment, subscription, updaters = [] }) => {
  let _updaters = updaters

  let dispose = () => {}

  const start = () => {
    dispose = requestSubscription(environment, {
      subscription,
      // onNext: response => _generators.forEach(generator => generator.next(response)),
      onError: error => console.error(error),
      // onCompleted: () => _generators.forEach(generator => generator.return()),
      updater: (store, data) =>
        _updaters.forEach(updater => updater(store, data)),
    }).dispose
  }

  const subscribe = ({ updater }) => {
    if (_updaters.length === 0 && updater) {
      start()
    }
    updater && _updaters.push(updater)
    return {
      unsubscribe: () => {
        _updaters = updater ? _updaters.filter(_ => _ !== updater) : _updaters
        if (_updaters.length === 0) {
          dispose()
        }
      },
    }
  }

  return {
    subscribe,
  }
}
