import { createSubStackNavigator } from '../../../../helpers/react-navigation'
import Choice from './Choice'
import ByBump from './ByBump'
import ByPublicKey from './ByPublicKey'
import ByQRCode from './ByQRCode'
import Request from './Request'
import RequestValidation from './RequestValidation'

import React from 'react'
import { Text, Button } from '../../../Library'

export default createSubStackNavigator(
  {
    ByBump,
    ByPublicKey,
    ByQRCode,
    Request,
    RequestValidation,
    Choice,
  },
  {
    initialRouteName: 'Choice',
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
