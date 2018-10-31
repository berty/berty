import { NativeModules, Platform } from 'react-native'
import { Environment, RecordSource, Store } from 'relay-runtime'
import { SubscriptionClient } from 'subscriptions-transport-ws'
// import { installRelayDevTools } from 'relay-devtools'
import {
  RelayNetworkLayer,
  retryMiddleware,
  urlMiddleware,
  perfMiddleware,
} from 'react-relay-network-modern/node8'
import 'regenerator-runtime/runtime'

const logStyle = {
  relayOK: 'font-weight:bold;color:#FFFFFF;background-color:#F26B02;letter-spacing:1pt;word-spacing:2pt;font-size:12px;text-align:left;font-family:arial, helvetica, sans-serif;line-height:1;',
  relayERROR: 'font-weight:bold;color:#FFFFFF;background-color:#880606;letter-spacing:1pt;word-spacing:2pt;font-size:12px;text-align:left;font-family:arial, helvetica, sans-serif;line-height:1;',
  title: 'font-weight:normal;font-style:italic;color:#FFFFFF;background-color:#000000;',
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
    getPort: async () => {
      const url = new URL(window.location.href)
      return url.searchParams.get('gql-port') || '8700'
    },
  }
  NativeModules.CoreModule = CoreModule
}

const { CoreModule } = NativeModules

// Define a function that fetches the results of an operation (query/mutation/etc)
// and returns its results as a Promise:

// const fetchXHR = (url, { method, headers, body } = {}) =>
//  new Promise((resolve, reject) => {
//    const xhr = new XMLHttpRequest()
//    xhr.open(method, url, true)
//    Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]))
//    xhr.onload = () => {
//      const data = JSON.parse(xhr.responseText)
//      if (
//        xhr.readyState === 4 &&
//        (xhr.status === '201' || xhr.status === '200')
//      ) {
//        resolve(data)
//      } else {
//        reject(data)
//      }
//    }
//    xhr.send(body)
//  })

let getIP = () =>
  new Promise(resolve => {
    if (Platform.OS === 'web') {
      return resolve(window.location.hostname)
    }

    // eslint-disable-next-line
    if (__DEV__) {
      return require('react-native-network-info').NetworkInfo.getIPV4Address(
        ip => resolve(ip)
      )
    }

    if (Platform.OS === 'ios') {
      return resolve('127.0.0.1')
    }

    if (Platform.OS === 'android') {
      return resolve('10.0.2.2')
    }
  })

const getPort = () => CoreModule.getPort()

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
      console.groupCollapsed('%c RELAY %c %s', logStyle.relayOK, logStyle.title, msg)
    } else {
      const errorReason = res.text ? res.text : `Server return empty response with Status Code: ${res.status}.`

      console.group('%c RELAY %c %s', logStyle.relayERROR, logStyle.title, msg)
      console.error(errorReason)
    }

    console.dir(req)
    console.dir(res)
    console.groupEnd()
  } catch (_) {
    console.log('[RELAY_NETWORK]', msg, req, res)
  }
}

const _fetchQuery = async (req) => {
  const query = `http://${await getIP()}:${await getPort()}/query`

  // eslint-disable-next-line
  if (__DEV__) {
    console.log('%c RELAY %c relay query: %s', logStyle.relayOK, logStyle.title, query)
  }

  return query
}

// @TODO: Do something better to cache this
let queryLock = false
export const fetchQuery = async (req) => {
  if (queryLock) {
    return queryLock
  }

  return (queryLock = _fetchQuery(req))
}

let middlewares = [
  // eslint-disable-next-line
  __DEV__ ? perfMiddleware({logger: perfLogger}) : null,
  urlMiddleware({
    url: fetchQuery,
  }),
  retryMiddleware({
    fetchTimeout: 15000,
    retryDelays: attempt => Math.pow(2, attempt + 4) * 100, // or simple array [3200, 6400, 12800, 25600, 51200, 102400, 204800, 409600],
    beforeRetry: ({ forceRetry, abort, delay, attempt, lastError, req }) => {
      // Unlock query
      queryLock = false
      if (attempt > 10) abort()

      // eslint-disable-next-line
      if (__DEV__) {
        window.forceRelayRetry = forceRetry
        console.warn('call `forceRelayRetry()` for immediately retry! Or wait ' + delay + ' ms.')
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
