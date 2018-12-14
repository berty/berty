import React from 'react'
import { withNavigation } from 'react-navigation'
import { Screen } from '../../../Library'
import { colors } from '../../../../constants'
import { Pagination } from '../../../../relay'
import { merge } from '../../../../helpers'
import { fragments } from '../../../../graphql'
import Item from './Item'
import RelayContext from '../../../../relay/RelayContext'

const GenericList = ({ navigation, screenProps, filter }) =>
  <RelayContext.Consumer>{context => {
    const { queries, subscriptions } = context

    return <Screen style={[{ backgroundColor: colors.white }]}>
      <Pagination
        direction='forward'
        query={queries.ContactList.graphql}
        variables={merge([
          queries.ContactList.defaultVariables,
          filter,
        ])}
        fragment={fragments.ContactList}
        alias='ContactList'
        subscriptions={[
          subscriptions.contactRequestAccepted,
          subscriptions.contactRequest,
        ]}
        renderItem={props => (
          <Item
            {...props}
            navigation={navigation}
            screenProps={screenProps}
            context={context}
          />
        )}
      />
    </Screen>
  }}</RelayContext.Consumer>

export default withNavigation(GenericList)
