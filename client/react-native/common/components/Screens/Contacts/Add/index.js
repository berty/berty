import React from 'react'
import { createMaterialTopTabNavigator } from 'react-navigation'
import ByQRCode from './ByQRCode'
import ByPublicKey from './ByPublicKey'
import Invite from './Invite'
import { tabIcon, withScreenProps } from '../../../../helpers/views'
import { tabNavigatorOptions } from '../../../../constants/styling'
import { View } from 'react-native'

const AddContactTabbedContent = createMaterialTopTabNavigator(
  {
    'qrcode': {
      screen: withScreenProps(ByQRCode),
      navigationOptions: {
        title: 'QR Code',
        tabBarIcon: tabIcon('material-qrcode'),
      },
    },
    'public-key': {
      screen: withScreenProps(ByPublicKey),
      navigationOptions: {
        title: 'Public key',
        tabBarIcon: tabIcon('material-key-variant'),
      },
    },
    'nearby': {
      screen: withScreenProps(Invite),
      navigationOptions: {
        title: 'Nearby',
        tabBarIcon: tabIcon('radio'),
      },
    },
    'invite': {
      screen: withScreenProps(Invite),
      navigationOptions: {
        title: 'Invite',
        tabBarIcon: tabIcon('material-email'),
      },
    },
  },
  {
    initialRouteName: 'qrcode',
    ...tabNavigatorOptions,
  },
)

const AddScreen = () => <View style={{ flex: 1 }}>
  <AddContactTabbedContent />
</View>

export default AddScreen
