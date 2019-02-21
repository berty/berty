import React from 'react'
import { View } from 'react-native'
import { QueryReducer } from '../relay'
import { merge } from '../helpers'
import RelayContext from '../relay/RelayContext'
import { btoa } from 'b64-lite'

const defaultValuesContact = {
  id: '',
  displayName: '',
  displayStatus: '',
  overrideDisplayName: '',
  overrideDisplayStatus: '',
}

export const WithContact = ({ id, children }) => (
  <RelayContext.Consumer>
    {({ queries }) => (
      <QueryReducer
        query={queries.Contact.graphql}
        variables={merge([
          queries.Contact.defaultVariables,
          {
            filter: {
              id: btoa('contact:' + id),
            },
          },
        ])}
      >
        {(state, retry) => {
          try {
            if (
              state.type === state.error &&
              state.data.res.json.errors[0].extensions.code === 7000
            ) {
              return children(null, { ...state, type: state.success }, retry)
            }
          } catch (e) {
            // skip
          }

          return children(
            state.type === state.success ? state.data.Contact : null,
            state,
            retry
          )
        }}
      </QueryReducer>
    )}
  </RelayContext.Consumer>
)

export const withCurrentUser = (WrappedComponent, opts) => {
  const { showOnlyLoaded } = opts || {}

  class WithCurrentUser extends React.Component {
    render = () => (
      <RelayContext.Consumer>
        {({ queries }) => (
          <QueryReducer
            query={queries.Contact.graphql}
            variables={merge([
              queries.Contact.defaultVariables,
              {
                filter: {
                  status: 42,
                },
              },
            ])}
          >
            {(state, retry) =>
              state.type === state.success || !showOnlyLoaded ? (
                <WrappedComponent
                  {...this.props}
                  {...this.props.screenProps}
                  currentUser={
                    state.type === state.success ? state.data.Contact : null
                  }
                  currentUserState={state}
                  currentUserRetry={retry}
                />
              ) : (
                <View />
              )
            }
          </QueryReducer>
        )}
      </RelayContext.Consumer>
    )
  }

  WithCurrentUser.displayName = `WithCurrentUser(${getDisplayName(
    WrappedComponent
  )})`
  return WithCurrentUser
}

const getDisplayName = WrappedComponent =>
  WrappedComponent.displayName || WrappedComponent.name || 'Component'

export const getRelayID = id => btoa(`contact:${id}`)

export const getCoreID = id => atob(id).match(/:(.*)$/)[1]

export default defaultValuesContact
