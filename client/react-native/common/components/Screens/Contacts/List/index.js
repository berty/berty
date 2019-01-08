import React, { PureComponent } from 'react'
import { colors } from '../../../../constants'
import { borderBottom } from '../../../../styles'
import { createMaterialTopTabNavigator } from 'react-navigation'
import Received from './Received'
import Sent from './Sent'
import Mutuals from './Mutuals'
import { Header, Screen } from '../../../Library'
import { withScreenProps } from '../../../../helpers/views'
import I18n from 'i18next'

const ContactsHome = createMaterialTopTabNavigator(
  {
    'mutuals': {
      screen: withScreenProps(Mutuals),
      navigationOptions: () => ({
        title: I18n.t('contacts.all'),
      }),
    },
    'received': {
      screen: withScreenProps(Received),
      navigationOptions: () => ({
        title: I18n.t('contacts.received'),
      }),
    },
    'sent': {
      screen: withScreenProps(Sent),
      navigationOptions: () => ({
        title: I18n.t('contacts.sent'),
      }),
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
        title={I18n.t('contacts.title')}
        titleIcon='feather-users'
        rightBtnIcon='user-plus'
        onPressRightBtn={() => ContactList.onPress(navigation)}
      />
    ),
    tabBarVisible: true,
  })

  static onPress = (navigation) => navigation.navigate('contacts/add')

  render = () => {
    const { navigation } = this.props

    return (
      <Screen style={{ backgroundColor: colors.white }}>
        <ContactsHome screenProps={{ onPress: () => ContactList.onPress(navigation), topNavigator: navigation }} />
      </Screen>
    )
  }
}
