import { createSubStackNavigator } from '../../../../helpers/react-navigation'
import Choice from './Choice'
import ByBump from './ByBump'
import ByPublicKey from './ByPublicKey'
import ByQRCode from './ByQRCode'

import React from 'react'
import { Text, Button } from '../../../Library'
import { padding, borderBottom, marginRight } from '../../../../styles'
import { colors } from '../../../../constants'

export default createSubStackNavigator(
  {
    ByBump,
    ByPublicKey,
    ByQRCode,
    Choice,
  },
  {
    initialRouteName: 'ByPublicKey',
    navigationOptions: params => ({
      headerStyle: [
        {
          height: 54,
        },
        borderBottom,
        padding,
      ],
      headerLeft: (
        <Text icon='user-plus' medium>
          Add a contact
        </Text>
      ),
      headerRight: (
        <Button
          backgroundColor={colors.grey6}
          color={colors.white}
          icon='x'
          style={[marginRight]}
          onPress={() => params.screenProps.parent.navigation.goBack()}
        >
          Cancel
        </Button>
      ),
    }),
  }
)
