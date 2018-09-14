import { createSubStackNavigator } from '../../../../helpers/react-navigation'
import Choice from './Choice'
import Request from './Request'
import ByQRCode from './ByQRCode'
import ByPublicKey from './ByPublicKey'
import ByBump from './ByBump'
import Invite from './Invite'
import RequestValidation from './RequestValidation'
import React from 'react'
import { Header } from '../../../Library'

export default createSubStackNavigator(
  {
    Request,
    ByQRCode,
    ByPublicKey,
    ByBump,
    Invite,
    RequestValidation,
    Choice,
  },
  {
    initialRouteName: 'Choice',
    navigationOptions: ({ navigation }) => ({
      header: (
        <Header
          navigation={navigation}
          title='Add a contact'
          titleIcon='user-plus'
          backBtn
        />
      ),
    }),
  }
)
