import { Environment, Network, RecordSource, Store } from 'relay-runtime'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { Platform, NativeModules } from 'react-native'
import { NetworkInfo } from 'react-native-network-info'

// @TODO: patch web CoreModule
if (Platform.OS === 'web') {
  NativeModules.CoreModule = {
    start: async () => {},
    getPort: async () => '8700',
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
//  })i

let getIP = () =>
  new Promise(
    resolve =>
      __DEV__ // eslint-disable-line
        ? NetworkInfo.getIPV4Address(ip => resolve(ip))
        : resolve('0.0.0.0')
  )

const fetchQuery = async (operation, variables) => {
  try {
    const port = await CoreModule.getPort()
    const response = await fetch(`http://${await getIP()}:${port}/query`, {
      method: 'POST',
      headers: {
        // Add authentication and other headers here
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: operation.text, // GraphQL text from input
        variables,
      }),
    })
    return await response.json()
  } catch (err) {
    console.error(err)
  }
}

const setupSubscription = async (
  config,
  constiables,
  cacheConfig,
  observer
) => {
  const query = config.text
  const port = await CoreModule.getPort()
  const subscriptionClient = new SubscriptionClient(
    `ws://${await getIP()}:${port}/query`,
    {
      reconnect: true,
    }
  )
  subscriptionClient.subscribe({ query, constiables }, (error, result) => {
    if (error != null) {
      console.error(error)
    }
    observer.onNext({ data: result })
  })
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
