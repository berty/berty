import React, { PureComponent } from 'react'
import { RelayContext, QueryReducer } from './context'
import { View } from 'react-native'
import { withHOC, withContext } from '@berty/common/helpers/views'

export const withConfig = (Component, opts = {}) =>
  withHOC(
    withContext(RelayContext)(
      class WithConfig extends PureComponent {
        render () {
          const { queries } = this.props.context
          return (
            <QueryReducer
              query={queries.ConfigPublic.graphql}
              variables={queries.ConfigPublic.defaultVariables}
            >
              {(state, retry) => {
                return state.type === state.success || !opts.showOnlyLoaded ? (
                  <Component
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
          )
        }
      }
    )
  )(Component)
