import { createSubStackNavigator } from '../../../../helpers/react-navigation'
import Choice from './Choice'
import ByBump from './ByBump'
import ByPublicKey from './ByPublicKey'
import ByQRCode from './ByQRCode'
import Request from './Request'
import RequestValidation from './RequestValidation'
import React from 'react'
import { Header } from '../../../Library'

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
    navigationOptions: ({ navigation }) => ({
      header: <Header
        navigation={navigation}
        title='Add a contact'
        titleIcon='user-plus'
        backBtn
      />,
    }),
  }
)
