import React, { PureComponent, Fragment } from 'react'
import createTabNavigator from 'react-navigation-deprecated-tab-navigator/src/createTabNavigator'
import { colors } from '../../../../constants'
import { Flex, Screen, Button } from '../../../Library'
import {
  padding,
  paddingVertical,
  borderBottom,
} from '../../../../styles'
import { commit } from '../../../../relay'
import { mutations } from '../../../../graphql'
import QRCode from 'qrcode-react'
import QRReader from './QRReader'

class ByQRCode extends PureComponent {
  state = {
    contactID: '',
    myID:
      'MEkwEwYHKoZIzj0CAQYIKoZIzj0DAQMDMgAE+Y+qPqI3geo2hQH8eK7Rn+YWG09TejZ5QFoj9fmxFrUyYhFap6XmTdJtEi8myBmW',
    logo: require('../../../../static/img/logo-border.png'),
  }

  render () {
    const { navigation } = this.props
    const {
      state: { routeName },
    } = navigation
    const { contactID, myID, logo } = this.state

    return (
      <Screen style={[{ backgroundColor: colors.white }, paddingVertical]}>
        <Flex.Rows style={[padding]} align='center'>
          {routeName === 'Scan a QR code' && (
            <Fragment>
              <QRReader />
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
                    console.log(
                      await commit(mutations.ContactRequest, { contactID })
                    )
                    navigation.goBack(null)
                  } catch (err) {
                    this.setState({ err })
                    console.error(err)
                  }
                }}
              >
                ADD THIS KEY
              </Button>
            </Fragment>
          )}
          {routeName === 'View my QR code' && (
            <Fragment>
              <QRCode
                value={myID}
                logo={logo}
                size={256}
                logoWidth={100}
              />
              <Button
                icon='share'
                background={colors.blue}
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
            </Fragment>
          )}
        </Flex.Rows>
      </Screen>
    )
  }
}

export default createTabNavigator(
  {
    'Scan a QR code': ByQRCode,
    'View my QR code': ByQRCode,
  },
  {
    initialRouteName: 'Scan a QR code',
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
