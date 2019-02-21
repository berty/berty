import { View } from 'react-native'
import { withNavigation } from 'react-navigation'
import React from 'react'

import {
  ContactIdentity,
  ContactIdentityActions,
  ModalScreen,
} from '../../Library'
import { QueryReducer, RelayContext } from '../../../relay'
import { merge } from '../../../helpers'

const modalWidth = 320

const ContactCardModal = ({ navigation }) => {
  const id = navigation.getParam('id')
  return (
    <RelayContext.Consumer>
      {context => (
        <QueryReducer
          query={context.queries.Contact.graphql}
          variables={merge([
            context.queries.Contact.defaultVariables,
            { filter: { id } },
          ])}
        >
          {state => (
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
                loading={state.type !== state.success}
                footer={
                  <ContactIdentityActions
                    data={state && state.data && state.data.Contact}
                    modalWidth={modalWidth}
                  />
                }
              >
                <ContactIdentity
                  data={
                    (state && state.data && state.data.Contact) || undefined
                  }
                />
              </ModalScreen>
            </View>
          )}
        </QueryReducer>
      )}
    </RelayContext.Consumer>
  )
}

export default withNavigation(ContactCardModal)
