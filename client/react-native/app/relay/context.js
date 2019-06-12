import React from 'react'
import { withContext } from '@berty/common/helpers/views'

export const RelayContext = React.createContext()
RelayContext.displayName = 'RelayContext'

export const contextValue = ({
  environment,
  mutations,
  subscriptions,
  queries,
  fragments,
  updaters,
}) => {
  let ctx = {}
  ctx.environment = environment
  ctx.fragments = fragments
  ctx.queries = Object.keys(queries).reduce((a, k) => {
    a[k] = queries[k](ctx)
    return a
  }, {})
  ctx.subscriptions = Object.keys(subscriptions).reduce((a, k) => {
    a[k] = subscriptions[k](ctx)
    return a
  }, {})
  ctx.mutations = Object.keys(mutations).reduce((a, k) => {
    a[k] = mutations[k](ctx)
    return a
  }, {})
  ctx.updaters = Object.keys(updaters).reduce((a, k) => {
    a[k] = updaters[k](ctx)
    return a
  }, {})
  return ctx
}

export const withRelayContext = withContext(RelayContext)

export default RelayContext
