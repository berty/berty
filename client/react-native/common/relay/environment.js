import { Environment, Network, RecordSource, Store } from 'relay-runtime'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import fetch from 'isomorphic-fetch'

// Define a function that fetches the results of an operation (query/mutation/etc)
// and returns its results as a Promise:
const fetchQuery = async (operation, variables) => {
  try {
    const response = await fetch('http://localhost:8700', {
      method: 'POST',
      headers: {
        // Add authentication and other headers here
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        query: operation.text, // GraphQL text from input
        data: variables,
      }),
    })
    return response.json()
  } catch (err) {
    console.error(err)
  }
}

// eslint-disable-next-line
const setupSubscription = (config, variables, cacheConfig, observer) => {
  const query = config.text

  const subscriptionClient = new SubscriptionClient('ws://localhost:8700', {
    reconnect: true,
  })
  subscriptionClient.subscribe({ query, variables }, (error, result) => {
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
