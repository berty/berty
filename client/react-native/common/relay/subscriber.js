import { requestSubscription } from 'react-relay'

export default ({ environment, subscription, updaters = [], variables }) => {
  let _updaters = updaters

  requestSubscription(environment, {
    subscription,
    variables,
    onNext: () => {},
    onCompleted: () => {},
    onError: error => console.error(error),
    updater: (store, data) =>
      _updaters.forEach(updater => updater(store, data)),
  })

  return {
    subscribe: ({ updater }) => {
      updater && _updaters.push(updater)
      return {
        unsubscribe: () => {
          _updaters = updater ? _updaters.filter(_ => _ !== updater) : _updaters
        },
      }
    },
  }
}
