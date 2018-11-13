import 'regenerator-runtime/runtime'

import { NativeModules, Platform } from 'react-native'
import {
  RelayNetworkLayer,
  retryMiddleware,
  urlMiddleware,
  perfMiddleware,
} from 'react-relay-network-modern/node8'
import { SubscriptionClient } from 'subscriptions-transport-ws'

import { Environment, RecordSource, Store } from 'relay-runtime'

const logStyle = {
  relayOK:
    'font-weight:bold;color:#FFFFFF;background-color:#F26B02;letter-spacing:1pt;word-spacing:2pt;font-size:12px;text-align:left;font-family:arial, helvetica, sans-serif;line-height:1;',
  relayERROR:
    'font-weight:bold;color:#FFFFFF;background-color:#880606;letter-spacing:1pt;word-spacing:2pt;font-size:12px;text-align:left;font-family:arial, helvetica, sans-serif;line-height:1;',
  title:
    'font-weight:normal;font-style:italic;color:#FFFFFF;background-color:#000000;',
}

// eslint-disable-next-line
// if (__DEV__) {
//   installRelayDevTools()
// }

// @TODO: patch web CoreModule
if (Platform.OS === 'web') {
  const CoreModule = {
    start: async () => {},
    restart: async () => console.warn('not implemented in web'),
    dropDatabase: async () => console.warn('not implemented in web'),
    // TODO: remove circle dependencies with containers to implem directly panic here
    panic: async () => console.warn('not implemented in web'),
    throwException: () => {
      throw new Error('thrown exception')
    },
    getPort: async () => {
      const url = new URL(window.location.href)
      return url.searchParams.get('gql-port') || '8700'
    },
    isBotRunning: async () => console.warn('not implemented in web'),
    startBot: async () => console.warn('not implemented in web'),
    stopBot: async () => console.warn('not implemented in web'),
    getNetworkConfig: async () => console.warn('not implemented in web'),
    updateNetworkConfig: async () => console.warn('not implemented in web'),
  }
  NativeModules.CoreModule = CoreModule
}

const { CoreModule } = NativeModules

let getIP = () =>
  new Promise(resolve => {
    if (Platform.OS === 'web') {
      return resolve(window.location.hostname)
    }
    return resolve('127.0.0.1')
  })

const setupSubscription = async (config, variables, cacheConfig, observer) => {
  try {
    const query = config.text
    const subscriptionClient = new SubscriptionClient(
      `ws://${await getIP()}:${await CoreModule.getPort()}/query`,
      {
        reconnect: true,
      }
    )

    const onNext = result => {
      observer.onNext(result)
    }

    const onError = error => {
      observer.onError(error)
    }

    const onComplete = () => {
      observer.onCompleted()
    }

    subscriptionClient
      .request({ query, variables })
      .subscribe(onNext, onError, onComplete)
  } catch (err) {
    console.error(err)
  }
  // client.unsubscribe()
}

const perfLogger = (msg, req, res) => {
  try {
    if (res.ok) {
      console.groupCollapsed(
        '%c RELAY %c %s',
        logStyle.relayOK,
        logStyle.title,
        msg
      )
    } else {
      const errorReason = res.text
        ? res.text
        : `Server return empty response with Status Code: ${res.status}.`

      console.group('%c RELAY %c %s', logStyle.relayERROR, logStyle.title, msg)
      console.error(errorReason)
    }

    if (typeof req !== 'undefined') {
      console.dir(req)
    }

    if (typeof res !== 'undefined') {
      console.dir(res)
    }

    console.groupEnd()
  } catch (_) {
    console.log('[RELAY_NETWORK]', msg, req, res)
  }
}

const _fetchQuery = async req => {
  try {
    const query = `http://${await getIP()}:${await CoreModule.getPort()}/query`

    // eslint-disable-next-line
    if (__DEV__) {
      console.log(
        '%c RELAY %c relay query: %s',
        logStyle.relayOK,
        logStyle.title,
        query
      )
    }
    return query
  } catch (err) {
    console.warn(err)
  }
}

// @TODO: Do something better to cache this
let queryLock = false
export const fetchQuery = async req => {
  if (queryLock) {
    return queryLock
  }

  return (queryLock = _fetchQuery(req))
}

let middlewares = [
  // eslint-disable-next-line
  __DEV__ ? perfMiddleware({ logger: perfLogger }) : null,
  urlMiddleware({
    url: fetchQuery,
  }),
  retryMiddleware({
    fetchTimeout: 15000,
    retryDelays: attempt => 1000, // or simple array [3200, 6400, 12800, 25600, 51200, 102400, 204800, 409600],
    beforeRetry: ({ forceRetry, abort, delay, attempt, lastError, req }) => {
      // Unlock query
      queryLock = false
      if (attempt > 10) abort()

      // eslint-disable-next-line
      if (__DEV__) {
        window.forceRelayRetry = forceRetry
        console.warn(
          'call `forceRelayRetry()` for immediately retry! Or wait ' +
            delay +
            ' ms.'
        )
      }
    },
    statusCodes: [500, 503, 504],
  }),
]

const opts = {
  subscribeFn: setupSubscription,
}

// Create a network layer from the fetch function
const network = new RelayNetworkLayer(middlewares, opts)
const store = new Store(new RecordSource())

const environment = new Environment({
  network,
  store,
  // ... other options
})

export default environment
