import { Environment, Network, RecordSource, Store } from 'relay-runtime'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { Platform, NativeModules } from 'react-native'
import { installRelayDevTools } from 'relay-devtools'

// eslint-disable-next-line
if (__DEV__ && (Platform.OS === 'ios' || Platform.OS === 'android')) {
  installRelayDevTools()
}

// @TODO: patch web CoreModule
if (Platform.OS === 'web') {
  NativeModules.CoreModule = {
    start: async () => {},
    getPort: async () => {
      const url = new URL(window.location.href)
      return url.searchParams.get('gql-port') || '8700'
    },
  }
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
      resolve(window.location.hostname)
    } else {
      return __DEV__ // eslint-disable-line
        ? require('react-native-network-info').NetworkInfo.getIPV4Address(ip =>
          resolve(ip)
        )
        : resolve('0.0.0.0')
    }
  })

const getPort = () =>
  new Promise(resolve => {
    let port = 0
    const interval = setInterval(async () => {
      try {
        port = await CoreModule.getPort()

        resolve(port)
        clearInterval(interval)
      } catch (error) {
        console.warn(error)
      }
    }, 1000)
  })

getPort().then(console.log)

export const fetchQuery = async (operation, variables) => {
  try {
    const response = await fetch(
      `http://${await getIP()}:${await getPort()}/query`,
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
      `ws://${await getIP()}:${await getPort()}/query`,
      {
        reconnect: true,
      }
    )

    const onNext = result => {
      console.log(result)
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
