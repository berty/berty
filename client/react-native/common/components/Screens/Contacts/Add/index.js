import { createSubStackNavigator } from '../../../../helpers/react-navigation'
import Choice from './Choice'
import Request from './Request'
import ByQRCode from './ByQRCode'
import ByPublicKey from './ByPublicKey'
import ByBump from './ByBump'
import Invite from './Invite'
import React from 'react'
import { Header } from '../../../Library'

export default createSubStackNavigator(
  {
    'contacts/add/request': Request,
    'contacts/add/by-qr-code': ByQRCode,
    'contacts/add/by-public-key': ByPublicKey,
    'contacts/add/by-bump': ByBump,
    'contacts/add/invite': Invite,
    'contacts/add/choice': Choice,
  },
  {
    initialRouteName: 'contacts/add/choice',
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
