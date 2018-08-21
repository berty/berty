import { Environment, Network, RecordSource, Store } from 'relay-runtime'
import fetch from 'isomorphic-fetch'

// Define a function that fetches the results of an operation (query/mutation/etc)
// and returns its results as a Promise:
const fetchQuery = async (operation, variables) => {
  try {
    const response = await fetch('http://localhost:8700/graphql', {
      method: 'POST',
      headers: {
        // Add authentication and other headers here
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        query: operation.text, // GraphQL text from input
        variables
      })
    })
    return response.json()
  } catch (err) {
    console.error(err)
  }
}

// Create a network layer from the fetch function
const network = Network.create(fetchQuery)
const store = new Store(new RecordSource())

const environment = new Environment({
  network,
  store
  // ... other options
})

export default environment
