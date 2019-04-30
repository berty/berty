import { View } from 'react-native'
import { withNavigation } from 'react-navigation'
import React from 'react'

import {
  ContactIdentity,
  ContactIdentityActions,
  ModalScreen,
} from '@berty/view/component'
import { QueryReducer } from '@berty/relay'
import { merge } from '@berty/common/helpers'
import { contact } from '@berty/common/utils'
import withRelayContext from '@berty/common/helpers/withRelayContext'

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
                    data={
                      (state && state.data && state.data.Contact) || {
                        ...data,
                        id: contact.getRelayID(data.id),
                      }
                    }
                    modalWidth={modalWidth}
                  />
                }
              >
                <ContactIdentity
                  data={
                    (state &&
                      state.data &&
                      state.data.Contact && {
                      ...state.data.Contact,
                      id: contact.getCoreID(state.data.Contact.id),
                    }) ||
                    data
                  }
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
