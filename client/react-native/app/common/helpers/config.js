import React from 'react'
import { RelayContext, QueryReducer } from '@berty/relay'
import { View } from 'react-native'

export const withConfig = (WrappedComponent, opts) => {
  const { showOnlyLoaded } = opts || {}

  class WithConfig extends React.Component {
    render = () => (
      <RelayContext.Consumer>
        {({ queries }) => (
          <QueryReducer
            query={queries.ConfigPublic.graphql}
            variables={queries.ConfigPublic.defaultVariables}
          >
            {(state, retry) => {
              return state.type === state.success || !showOnlyLoaded ? (
                <WrappedComponent
                  {...this.props}
                  config={
                    state.type === state.success
                      ? state.data.ConfigPublic
                      : null
                  }
                  configState={state}
                  configReload={retry}
                />
              ) : (
                <View />
              )
            }}
          </QueryReducer>
        )}
      </RelayContext.Consumer>
    )
  }

  WithConfig.displayName = `WithConfig(${getDisplayName(WrappedComponent)})`
  return WithConfig
}

const getDisplayName = WrappedComponent =>
  WrappedComponent.displayName || WrappedComponent.name || 'Component'
