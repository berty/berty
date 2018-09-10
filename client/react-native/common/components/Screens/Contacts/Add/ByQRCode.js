import { PureComponent } from 'react'
import createTabNavigator from 'react-navigation-deprecated-tab-navigator/src/createTabNavigator'
import { colors } from '../../../../constants'
import {
  borderBottom,
} from '../../../../styles'

class ByQRCode extends PureComponent {
  render () {
    return null
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
