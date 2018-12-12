import React from 'react'
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

export const WithContact = ({ id, children }) => <RelayContext.Consumer>{({ queries }) =>
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
        if (state.type === state.error && state.data.res.json.errors[0].extensions.code === 7000) {
          return children(null, { ...state, type: state.success }, retry)
        }
      } catch (e) {
        // skip
      }

      return children(state.type === state.success ? state.data.Contact : null, state, retry)
    }}
  </QueryReducer>}
</RelayContext.Consumer>

export const CurrentUser = ({ children }) => <RelayContext.Consumer>{({ queries }) =>
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
    {(state, retry) => children(state.type === state.success ? state.data.Contact : null, state, retry)}
  </QueryReducer>}
</RelayContext.Consumer>

export default defaultValuesContact
