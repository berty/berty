import React, { PureComponent } from 'react'
import { Platform, TextInput as TextInputNative } from 'react-native'
import { Flex, Screen, Button } from '../../../Library'
import { colors } from '../../../../constants'
import {
  padding,
  paddingVertical,
  marginTop,
  rounded,
  textTiny,
  borderBottom,
} from '../../../../styles'
import { mutations, queries } from '../../../../graphql'
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

class ByPublicKey extends PureComponent {
  state = {
    contactID: '',
  }
  render () {
    const { navigation } = this.props
    const {
      state: { routeName },
    } = navigation
    const { contactID } = this.state
    return (
      <Screen style={[{ backgroundColor: colors.white }, paddingVertical]}>
        <QueryReducer query={queries.ContactList}>
          {(state, retry) => {
            const myself = (state.data.ContactList || []).find(
              c => c.status === 'Myself'
            )
            const myID = myself ? atob(myself.id).split('CONTACT:')[1] : ''
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
                  value={routeName === 'Enter a public key' ? contactID : myID}
                  onChangeText={
                    routeName === 'Enter a public key'
                      ? contactID => this.setState({ contactID })
                      : undefined
                  }
                  selectTextOnFocus
                />
                {routeName === 'Enter a public key' && (
                  <Button
                    icon='plus'
                    background={colors.blue}
                    margin
                    padding
                    rounded={23}
                    height={24}
                    medium
                    middle
                    onPress={async () => {
                      try {
                        await mutations.contactRequest.commit({
                          contactID: btoa(`CONTACT:${contactID}`),
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
                )}
              </Flex.Rows>
            )
          }}
        </QueryReducer>
      </Screen>
    )
  }
}

export default createTabNavigator(
  {
    'Enter a public key': ByPublicKey,
    'View my public key': ByPublicKey,
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
