import { NativeModules, Platform } from 'react-native'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { installRelayDevTools } from 'relay-devtools'

import { Environment, Network, RecordSource, Store } from 'relay-runtime'

// eslint-disable-next-line
if (__DEV__) {
  installRelayDevTools()
}

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

getIP().then(console.log)

export const fetchQuery = async (operation, variables) => {
  try {
    const response = await fetch(
      `http://${await getIP()}:${await CoreModule.getPort()}/query`,
      {
        method: 'POST',
        headers: {
          // Add authentication and other headers here
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: operation.text, // GraphQL text from input
          variables,
        }),
      }
    )
    return await response.json()
  } catch (err) {
    console.error(err)
  }
}

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

// Create a network layer from the fetch function
const network = Network.create(fetchQuery, setupSubscription)
const store = new Store(new RecordSource())

const environment = new Environment({
  network,
  store,
  // ... other options
})

export default environment
