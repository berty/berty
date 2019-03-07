import { View } from 'react-native'
import { withNavigation } from 'react-navigation'
import React from 'react'

import {
  ContactIdentity,
  ContactIdentityActions,
  ModalScreen,
} from '../../Library'
import { QueryReducer } from '../../../relay'
import { merge } from '../../../helpers'
import { contact } from '../../../utils'
import withRelayContext from '../../../helpers/withRelayContext'

const modalWidth = 320

class ContactCardModal extends React.Component {
  static router = ContactIdentity.router

  render () {
    const { navigation, context } = this.props
    const data = {
      id: navigation.getParam('id'),
      displayName: navigation.getParam('displayName'),
    }

    return (
      <QueryReducer
        query={context.queries.Contact.graphql}
        variables={merge([
          context.queries.Contact.defaultVariables,
          { filter: { id: contact.getRelayID(data.id) } },
        ])}
      >
        {state =>
          console.log(state) || (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ModalScreen
                showDismiss
                width={modalWidth}
                loading={state.type === state.loading}
                footer={
                  <ContactIdentityActions
                    data={(state && state.data && state.data.Contact) || {
                      ...data,
                      id: contact.getRelayID(data.id),
                    }}
                    modalWidth={modalWidth}
                  />
                }
              >
                <ContactIdentity
                  data={(state && state.data && state.data.Contact && {
                    ...state.data.Contact,
                    id: contact.getCoreID(state.data.Contact.id),
                  }) || data}
                />
              </ModalScreen>
            </View>
          )
        }
      </QueryReducer>
    )
  }
}

export default withRelayContext(withNavigation(ContactCardModal))
