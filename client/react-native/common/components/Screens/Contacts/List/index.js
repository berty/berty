import React, { PureComponent } from 'react'
import { colors } from '../../../../constants'
import { borderBottom } from '../../../../styles'
import { createMaterialTopTabNavigator } from 'react-navigation'
import Received from './Received'
import Sent from './Sent'
import Mutuals from './Mutuals'
import { Header, Screen } from '../../../Library'
import { withScreenProps } from '../../../../helpers/views'

const ContactsHome = createMaterialTopTabNavigator(
  {
    'mutuals': {
      screen: withScreenProps(Mutuals),
      navigationOptions: {
        title: 'All',
      },
    },
    'received': {
      screen: withScreenProps(Received),
      navigationOptions: {
        title: 'Received',
      },
    },
    'sent': {
      screen: withScreenProps(Sent),
      navigationOptions: {
        title: 'Sent',
      },
    },
  },
  {
    initialRouteName: 'mutuals',
    swipeEnabled: true,
    animationEnabled: true,
    tabBarOptions: {
      labelStyle: {
        color: colors.black,
      },
      indicatorStyle: {
        backgroundColor: colors.blue,
      },
      style: [
        {
          backgroundColor: colors.white,
          borderTopWidth: 0,
        },
        borderBottom,
      ],
    },
  },
)

export default class ContactList extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='Contacts'
        titleIcon='feather-users'
        rightBtnIcon='user-plus'
        onPressRightBtn={() => navigation.push('contacts/add')}
      />
    ),
    tabBarVisible: true,
  })

  render = () => <Screen style={{ backgroundColor: colors.white }}>
    <ContactsHome screenProps={{ topNavigator: this.props.navigation }} />
  </Screen>
}
