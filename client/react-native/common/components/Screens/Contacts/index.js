import React from 'react'
import { createSubStackNavigator } from '../../../helpers/react-navigation'
import { ActivityIndicator } from 'react-native'
import { QueryReducer } from '../../../relay'
import { queries } from '../../../graphql'
import Add from './Add'
import Detail from './Detail'
import Edit from './Edit'
import List from './List'

const Stack = createSubStackNavigator(
  {
    'contacts/list': List,
    'contacts/add': Add,
    'contacts/detail': Detail,
    'contacts/edit': Edit,
  },
  {
    initialRouteName: 'contacts/list',
    hedaer: null,
  }
)

const Contacts = () => {
  return (
    <QueryReducer
      query={queries.ContactList}
      variables={{ filter: null, count: 21, cursor: '' }}
    >
      {(state, retry) => {
        switch (state.type) {
          default:
          case state.loading:
            return <ActivityIndicator size='large' />
          case state.success:
            return <Stack screenProps={{ state, retry }} />
          case state.error:
            return null
        }
      }}
    </QueryReducer>
  )
}

export default Contacts
