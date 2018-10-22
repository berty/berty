import React, { PureComponent } from 'react'
import {
  Platform,
  TextInput as TextInputNative,
  ActivityIndicator,
  Clipboard,
} from 'react-native'
import { Flex, Screen, Button, Text } from '../../../Library'
import { colors } from '../../../../constants'
import {
  padding,
  paddingVertical,
  marginTop,
  rounded,
  textTiny,
  borderBottom,
} from '../../../../styles'
import { fragments, mutations, queries } from '../../../../graphql'
import { QueryReducer } from '../../../../relay'
import createTabNavigator from 'react-navigation-deprecated-tab-navigator/src/createTabNavigator'
import { btoa, atob } from 'b64-lite'

class TextInputMultilineFix extends PureComponent {
  state = {
    multiline: false,
  }

  render () {
    return (
      <TextInputNative
        {...this.props}
        onFocus={() => {
          Platform.OS === 'android' &&
            this.props.multiline &&
            this.setState({ multiline: true })
          return this.props.onFocus && this.props.onFocus()
        }}
        onBlur={() => {
          Platform.OS === 'android' &&
            this.props.multiline &&
            this.setState({ multiline: true })
          return this.props.onBlur && this.props.onBlur()
        }}
        multiline={
          Platform.OS === 'android'
            ? this.state.multiline
            : this.props.multiline
        }
      />
    )
  }
}

const ByPublicKey = fragments.Contact(
  class ByPublicKey extends PureComponent {
    state = {
      contactId: '',
    }
    render () {
      const { data, navigation } = this.props
      const {
        state: { routeName },
      } = navigation
      const { contactId } = this.state
      const myself = data
      const myID = myself ? atob(myself.id).split('contact:')[1] : ''
      return (
        <Flex.Rows style={[padding]} align='center'>
          <TextInputMultilineFix
            style={[
              {
                width: 330,
                height: 330,
                backgroundColor: colors.grey7,
                color: colors.black,
                flexWrap: 'wrap',
              },
              textTiny,
              padding,
              marginTop,
              rounded,
            ]}
            multiline
            placeholder='Type or copy/paste a berty user public key here'
            value={routeName === 'Enter a public key' ? contactId : myID}
            onChangeText={
              routeName === 'Enter a public key'
                ? contactId => this.setState({ contactId })
                : undefined
            }
            selectTextOnFocus
          />
          {routeName === 'Enter a public key' ? (
            <Flex.Cols justify='center'>
              <Button
                icon='plus'
                background={colors.blue}
                margin
                padding
                rounded={23}
                height={24}
                medium
                middle
                center
                self='stretch'
                onPress={async () => {
                  try {
                    await mutations.contactRequest.commit({
                      contact: {
                        id: btoa(`contact:${contactId}`),
                        displayName: '',
                        displayStatus: '',
                        overrideDisplayName: '',
                        overrideDisplayStatus: '',
                      },
                      introText: '',
                    })
                    navigation.goBack(null)
                  } catch (err) {
                    this.setState({ err })
                    console.error(err)
                  }
                }}
              >
                ADD THIS KEY
              </Button>
            </Flex.Cols>
          ) : (
            <Flex.Cols justify='center'>
              <Button
                icon='copy'
                background={colors.blue}
                margin
                padding
                rounded={23}
                height={24}
                medium
                middle
                center
                self='stretch'
                onPress={() => Clipboard.setString(myID)}
              >
                COPY THE KEY
              </Button>
            </Flex.Cols>
          )}
        </Flex.Rows>
      )
    }
  }
)

class ByPublicKeyScreen extends PureComponent {
  render () {
    const { navigation } = this.props
    return (
      <Screen style={[{ backgroundColor: colors.white }, paddingVertical]}>
        <QueryReducer
          query={queries.Contact}
          variables={{
            filter: {
              id: '',
              status: 42,
              displayName: '',
              displayStatus: '',
              overrideDisplayName: '',
              overrideDisplayStatus: '',
            },
          }}
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
                    An unexpected error occured, please restart the application
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
    'Enter a public key': ByPublicKeyScreen,
    'View my public key': ByPublicKeyScreen,
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
