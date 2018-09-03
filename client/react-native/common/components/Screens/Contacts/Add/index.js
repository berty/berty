import { createSubStackNavigator } from '../../../../helpers/react-navigation'
import Choice from './Choice'
import ByBump from './ByBump'
import ByPublicKey from './ByPublicKey'
import ByQRCode from './ByQRCode'

import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Text } from '../../../Library'
import { padding } from '../../../../styles'

export default createSubStackNavigator(
  {
    ByBump,
    ByPublicKey,
    ByQRCode,
    Choice,
  },
  {
    initialRouteName: 'Choice',
    navigationOptions: params =>
      console.log(params) || {
        headerStyle: [
          {
            height: 54,
          },
          padding,
        ],
        headerLeft: (
          <TouchableOpacity
            onPress={() => params.screenProps.parent.navigation.goBack()}
          >
            <Text>Back</Text>
          </TouchableOpacity>
        ),
        headerTitle: (
          <Text icon='user-plus' large>
            Add a contact
          </Text>
        ),
      },
  }
)
