import React, { PureComponent } from 'react'
import createTabNavigator from 'react-navigation-deprecated-tab-navigator/src/createTabNavigator'
import { colors } from '../../../../constants'
import { Flex, Screen, Button } from '../../../Library'
import { padding, paddingVertical, borderBottom } from '../../../../styles'
import { commit } from '../../../../relay'
import { mutations } from '../../../../graphql'
import QRGenerator from '../../../Library/QRGenerator/QRGenerator'
import QRReader from '../../../Library/QRReader/QRReader'

// TODO: get contact with status == 'myself' to get real id

class ByQRCode extends PureComponent {
  state = {
    contactID: '',
    myID:
      'MEkwEwYHKoZIzj0CAQYIKoZIzj0DAQMDMgAE+Y+qPqI3geo2hQH8eK7Rn+YWG09TejZ5QFoj9fmxFrUyYhFap6XmTdJtEi8myBmW',
    logo: require('../../../../static/img/logo-border.png'),
  }

  scan = async () => {
    const { navigation } = this.props
    const { contactID } = this.state
    try {
      console.log(await commit(mutations.ContactRequest, { contactID }))
      navigation.goBack(null)
    } catch (err) {
      this.setState({ err })
      console.error(err)
    }
  }

  share = () => {
    const { myID } = this.state
    console.log('Share: ', myID)
  }

  render () {
    const { navigation } = this.props
    const {
      state: { routeName },
    } = navigation
    const { myID, logo } = this.state
    const [scan, share] = [
      routeName.search('Scan') > -1,
      routeName.search('View') > -1,
    ]
    return (
      <Screen style={[{ backgroundColor: colors.white }, paddingVertical]}>
        <Flex.Rows style={[padding]} align='center'>
          {scan && <QRReader />}
          {share && (
            <QRGenerator value={myID} logo={logo} size={256} logoWidth={100} />
          )}
          <Flex.Cols justify='center'>
            <Button
              icon={scan ? 'plus' : 'share'}
              background={colors.blue}
              margin
              padding
              rounded={23}
              height={24}
              medium
              middle
              center
              onPress={scan ? this.scan : this.share}
            >
              {scan ? 'ADD THIS KEY' : 'SHARE THE KEY'}
            </Button>
          </Flex.Cols>
        </Flex.Rows>
      </Screen>
    )
  }
}

export default createTabNavigator(
  {
    'Scan a QR Code': ByQRCode,
    'View my QR Code': ByQRCode,
  },
  {
    initialRouteName: 'Scan a QR Code',
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
