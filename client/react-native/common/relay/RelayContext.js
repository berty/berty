import React from 'react'

export const contextValue = ({ environment, mutations }) => ({
  environment,
  mutations: Object.keys(mutations).reduce((a, k) => {
    a[k] = mutations[k]({ environment })
    return a
  }, {}),
  // subscriptions: subscriptions({ environment }),
})

export default React.createContext()
