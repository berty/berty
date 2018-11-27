import { ActivityIndicator } from 'react-native'
import React, { PureComponent } from 'react'

import createTabNavigator from 'react-navigation-deprecated-tab-navigator/src/createTabNavigator'

import { QueryReducer, RelayContext } from '../../../../relay'
import {
  Screen,
  Text,
  ModalScreen,
  PublicKeyWithActions,
} from '../../../Library'
import { borderBottom, paddingVertical } from '../../../../styles'
import { colors } from '../../../../constants'
import { fragments } from '../../../../graphql'
import { merge } from '../../../../helpers'

const ByPublicKey = fragments.Contact(PublicKeyWithActions)

const AddByPublicKeyScreen = props => (
  <Screen style={[{ backgroundColor: colors.white }, paddingVertical]}>
    <PublicKeyWithActions {...props} initialKey={''} addButton />
  </Screen>
)

class SharePublicKeyScreen extends PureComponent {
  static contextType = RelayContext
  render () {
    const { navigation } = this.props
    const { queries } = this.context
    return (
      <Screen style={[{ backgroundColor: colors.white }, paddingVertical]}>
        <QueryReducer
          query={queries.Contact.graphql}
          variables={merge([
            queries.Contact.defaultVariables,
            { filter: { status: 42 } },
          ])}
        >
          {(state, retry) => {
            switch (state.type) {
              default:
              case state.loading:
                return <ActivityIndicator />
              case state.success: {
                return (
                  <ByPublicKey
                    navigation={navigation}
                    readOnly
                    shareButton
                    copyButton
                    self
                    data={state.data.ContactList.edges[0].node}
                  />
                )
              }
              case state.error:
                return (
                  <Text
                    background={colors.error}
                    color={colors.white}
                    medium
                    middle
                    center
                    self='center'
                  >
                    An unexpected error occurred, please restart the application
                  </Text>
                )
            }
          }}
        </QueryReducer>
      </Screen>
    )
  }
}

export default createTabNavigator(
  {
    'Enter a public key': AddByPublicKeyScreen,
    'View my public key': SharePublicKeyScreen,
  },
  {
    initialRouteName: 'Enter a public key',
    swipeEnabled: true,
    animationEnabled: true,
    tabBarPosition: 'top',

    tabBarOptions: {
      labelStyle: {
        color: colors.black,
      },
      indicatorStyle: {
        backgroundColor: colors.black,
      },
      style: [
        {
          backgroundColor: colors.white,
          borderTopWidth: 0,
        },
        borderBottom,
      ],
    },
  }
)

export const ByPublicKeyModal = props => (
  <ModalScreen navigation={props.navigation}>
    <PublicKeyWithActions
      addButton
      initialKey={props.navigation.getParam('initialKey', '')}
      initialName={props.navigation.getParam('initialName', '')}
      {...props}
    />
  </ModalScreen>
)
