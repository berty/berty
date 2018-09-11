import React, { PureComponent, Fragment } from 'react'
import { TextInput, Clipboard } from 'react-native'
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
import { mutations } from '../../../../graphql'

import createTabNavigator from 'react-navigation-deprecated-tab-navigator/src/createTabNavigator'

class ByPublicKey extends PureComponent {
  state = {
    contactID: '',
    myID:
      'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCqGKukO1De7zhZj6+H0qtjTkVxwTCpvKe4eCZ0FPqri0cb2JZfXJDgYSF6vUpwmJG8wVQZKjeGcjDOL5UlsuusFncCzWBQ7RKNUSesmQRMSGkVb13j+skZ6UtW+5u09lHNsj6tQ51s1SPrCBkedbNf0Tp0GbMJDyR4e9T04ZZwIDAQABCZ0FPqri0cb2JZfXJDgYSF6vUpwmJG8wVQZKjeGcjDOL5UlsuusFncCzWBQ7RKNUSesmQRMSGkVb13j+skZ6UtW+5u09lHNsj6tQ51s1SPrCBkedbNf0Tp05u09lHNsj6tQ51s1SPrCBkedbNf0Tp0GbMJDyR4e9T04ZZwIDAQABCZ0FPqri0cb2JZfXJDgYSF6vUpwmJG8wVQZKjeGcjDOL5UlsuusFncCzWBQ7RKNUSesmQRMSGkVb13j5u09lHNsj6tQ51s1SPrCBkedbNf0Tp0GbMJDyR4e9T04ZZwIDAQABCZ0FPqri0cb2JZfXJDgYSF6vUpwmJG8wVQZKjeGcjDOL5UlsuusFncCzWBQ7RKN',
  }

  render () {
    const { navigation } = this.props
    const {
      state: { routeName },
    } = navigation
    const { contactID, myID } = this.state
    return (
      <Screen style={[{ backgroundColor: colors.white }, paddingVertical]}>
        <Flex.Rows style={[padding]} align='center'>
          <TextInput
            style={[
              {
                width: 330,
                height: 330,
                backgroundColor: colors.grey7,
                color: colors.black,
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
          {routeName === 'View my public key' && (
            <Fragment>
              <Button
                icon='share'
<<<<<<< HEAD
                background={colors.blue}
=======
                background='blue'
>>>>>>> improve(rn): added a 'Share the key' button (placeholder) and a functionnal 'Copy the key' button
                margin
                padding
                rounded={23}
                height={24}
                medium
                middle
                onPress={() => { console.log('Share: ', myID) }}
              >
                SHARE THE KEY
              </Button>
              <Button
                icon='copy'
<<<<<<< HEAD
                background={colors.blue}
=======
                background='blue'
>>>>>>> improve(rn): added a 'Share the key' button (placeholder) and a functionnal 'Copy the key' button
                margin
                padding
                rounded={23}
                height={24}
                medium
                middle
                onPress={() => { Clipboard.setString(myID) }}
              >
                COPY THE KEY
              </Button>
            </Fragment>
          )}
        </Flex.Rows>
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
