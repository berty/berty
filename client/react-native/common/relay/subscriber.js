import { requestSubscription } from 'react-relay'

export default ({ environment, subscription, updaters = [], variables }) => {
  let _updaters = updaters
  let _subscriber = null

  return {
    subscribe: ({ updater }) => {
      if (_updaters.length === 0 && updater) {
        _subscriber = requestSubscription(environment, {
          subscription,
          variables,
          onNext: () => {},
          onCompleted: () => {},
          onError: error => console.error(error),
          updater: (store, data) =>
            _updaters.forEach(updater => updater(store, data)),
        })
      }
      updater && _updaters.push(updater)
      return {
        unsubscribe: () => {
          _updaters = updater ? _updaters.filter(_ => _ !== updater) : _updaters
          if (_updaters.length === 0) {
            _subscriber.dispose()
          }
        },
      }
    },
  }
}
