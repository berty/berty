import React from 'react'
import Relay from 'react-relay'
import environment from './environment'

const handleChildren = (children, state, retry) => {
  if (typeof children === 'function') {
    return children(state, retry)
  }
  return React.Children.map(children, child =>
    React.cloneElement(child, { relay: { state, retry } })
  )
}

const QueryReducer = ({ children, variables, ...props }) => (
  <Relay.QueryRenderer
    environment={environment}
    variables={variables || {}}
    {...props}
    render={({ error, props, retry }) => {
      if (!error && !props) {
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
      if (!error) {
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
      if (!props) {
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
)

export default QueryReducer
