import React from 'react'

export const contextValue = ({
  environment,
  mutations,
  subscriptions,
  queries,
  updaters,
}) => ({
  environment,
  mutations: Object.keys(mutations).reduce((a, k) => {
    a[k] = mutations[k]({ environment })
    return a
  }, {}),
  subscriptions: Object.keys(subscriptions).reduce((a, k) => {
    a[k] = subscriptions[k]({ environment })
    return a
  }, {}),
  queries: Object.keys(queries).reduce((a, k) => {
    a[k] = queries[k]({ environment })
    return a
  }, {}),
  updaters: Object.keys(updaters).reduce((a, k) => {
    a[k] = updaters[k]
    return a
  }, {}),
})

export default React.createContext()
