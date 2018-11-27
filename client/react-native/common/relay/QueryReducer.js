import React from 'react'
import Relay from 'react-relay'
import RelayContext from './RelayContext'

const handleChildren = (children, state, retry) => {
  if (typeof children === 'function') {
    return children(state, retry)
  }
  return React.Children.map(children, child =>
    React.cloneElement(child, { relay: { state, retry } })
  )
}

const QueryReducer = ({ children, variables, ...props }) => (
  <RelayContext.Consumer>
    {({ environment }) => (
      <Relay.QueryRenderer
        environment={environment}
        variables={variables || {}}
        {...props}
        render={({ error, props, retry }) => {
          if (error == null && props == null) {
            return handleChildren(
              children,
              {
                type: 'loading',
                loading: 'loading',
                data: {},
              },
              retry
            )
          }
          if (error == null) {
            return handleChildren(
              children,
              {
                type: 'success',
                success: 'success',
                data: props,
              },
              retry
            )
          }
          if (props == null) {
            return handleChildren(
              children,
              {
                type: 'error',
                error: 'error',
                data: error,
              },
              retry
            )
          }
        }}
      />
    )}
  </RelayContext.Consumer>
)

export default QueryReducer
