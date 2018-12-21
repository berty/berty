import React from 'react'
import { Screen } from '../../../Library'
import { colors } from '../../../../constants'
import { Pagination } from '../../../../relay'
import { merge } from '../../../../helpers'
import { fragments } from '../../../../graphql'
import Item from './Item'
import RelayContext from '../../../../relay/RelayContext'

const GenericList = ({ filter, ignoreMyself }) => (
  <RelayContext.Consumer>
    {context => {
      const { queries, subscriptions } = context

      return (
        <Screen style={[{ backgroundColor: colors.white }]}>
          <Pagination
            direction='forward'
            query={queries.ContactList.graphql}
            variables={merge([queries.ContactList.defaultVariables, filter])}
            fragment={fragments.ContactList}
            alias='ContactList'
            subscriptions={[subscriptions.contact]}
            renderItem={props => (
              <Item {...props} context={context} ignoreMyself={ignoreMyself} />
            )}
          />
        </Screen>
      )
    }}
  </RelayContext.Consumer>
)

export default GenericList
