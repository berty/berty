import { View } from 'react-native'
import { withNavigation } from 'react-navigation'
import React from 'react'

import {
  ContactIdentity,
  ContactIdentityActions,
  Loader,
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
          {state => {
            switch (state.type) {
              case state.loading:
                return <Loader />
              case state.success:
                return (
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
                      footer={
                        <ContactIdentityActions
                          data={state.data.Contact}
                          modalWidth={modalWidth}
                        />
                      }
                    >
                      <ContactIdentity data={state.data.Contact} />
                    </ModalScreen>
                  </View>
                )
              case state.error:
                return <Loader />
            }
          }}
        </QueryReducer>
      )}
    </RelayContext.Consumer>
  )
}

export default withNavigation(ContactCardModal)
