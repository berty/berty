import React from 'react'
import { Screen, EmptyList } from '../../../Library'
import { colors } from '../../../../constants'
import { Pagination } from '../../../../relay'
import { merge } from '../../../../helpers'
import { fragments } from '../../../../graphql'
import Item from './Item'
import RelayContext from '../../../../relay/RelayContext'
import I18n from 'i18next'

const GenericList = ({ filter, ignoreMyself, onPress }) => (
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
            emptyItem={() => <EmptyList
              source={require('../../../../static/img/emptyContact.png')}
              text={I18n.t('contacts.empty')}
              icon={'user-plus'}
              btnText={I18n.t('contacts.add.title')}
              onPress={() => onPress()}
            />}
          />
        </Screen>
      )
    }}
  </RelayContext.Consumer>
)

export default GenericList
