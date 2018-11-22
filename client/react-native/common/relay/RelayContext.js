import React from 'react'

export const contextValue = ({ environment, mutations, subscriptions }) => ({
  environment,
  mutations: Object.keys(mutations).reduce((a, k) => {
    a[k] = mutations[k]({ environment })
    return a
  }, {}),
  subscriptions: Object.keys(subscriptions).reduce((a, k) => {
    console.log(k)
    a[k] = subscriptions[k]({ environment })
    return a
  }, {}),
})

export default React.createContext()
