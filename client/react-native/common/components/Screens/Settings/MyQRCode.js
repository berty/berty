import React, { PureComponent } from 'react'
import { Platform } from 'react-native'
import { colors } from '../../../constants'
import { Flex, Screen, Button, Header } from '../../Library'
import { padding, paddingVertical } from '../../../styles'
import QRCode from 'qrcode-react'
import { atob } from 'b64-lite'

export default class MyQRCode extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    tabBarVisible: false,
    header: <Header navigation={navigation} title='My QR code' backBtn />,
  })

  state = {
    myID:
      'MEkwEwYHKoZIzj0CAQYIKoZIzj0DAQMDMgAE+Y+qPqI3geo2hQH8eK7Rn+YWG09TejZ5QFoj9fmxFrUyYhFap6XmTdJtEi8myBmW',
    logo: require('../../../static/img/logo-border.png'),
  }

  share = () => {
    console.error('share: not implemented')
  }

  render () {
    const { logo } = this.state
    const { id } = this.props.navigation.getParam('data')
    const myID = atob(id).split('CONTACT:')[1]

    return (
      <Screen style={[{ backgroundColor: colors.white }, paddingVertical]}>
        <Flex.Rows style={[padding]} align='center'>
          {Platform.OS === 'web' && (
            <QRCode value={myID} logo={logo} size={256} logoWidth={100} />
          )}
          <Flex.Cols justify='center'>
            <Button
              icon={'share'}
              background={colors.blue}
              margin
              padding
              rounded={23}
              height={24}
              medium
              middle
              center
              onPress={this.share}
            >
              SHARE THE KEY
            </Button>
          </Flex.Cols>
        </Flex.Rows>
      </Screen>
    )
  }
}
