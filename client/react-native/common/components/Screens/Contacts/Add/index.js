import { createSubStackNavigator } from '../../../../helpers/react-navigation'
import Choice from './Choice'
import ByBump from './ByBump'
import ByPublicKey from './ByPublicKey'
import ByQRCode from './ByQRCode'

import React from 'react'
import { Text, Button } from '../../../Library'

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
      headerTitle: (
        <Text icon='user-plus' color='black' padding medium>
          Add a contact
        </Text>
      ),
      headerLeft: (
        <Button
          padding
          large
          color='black'
          icon='arrow-left'
          onPress={() => params.navigation.goBack(null)}
        />
      ),
    }),
  }
)
