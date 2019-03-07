import React from 'react'
import { View, Platform, Text as RNText } from 'react-native'
import { createMaterialTopTabNavigator, withNavigation } from 'react-navigation'
import I18n from 'i18next'

import Text from './Text'
import Avatar from './Avatar'
import { contact } from '../../utils'
import { formattedFingerprint } from '../../helpers/fingerprint'
import { monospaceFont, tabNavigatorOptions } from '../../constants/styling'
import { padding } from '../../styles'
import { tabIcon, withScreenProps } from '../../helpers/views'
import { makeShareableUrl } from '../../helpers/contacts'
import QRGenerator from './QRGenerator'
import colors from '../../constants/colors'

const PublicKey = ({ data: { id } }) => (
  <View style={[{ flexDirection: 'row', justifyContent: 'center' }, padding]}>
    <RNText
      style={{
        textAlign: 'left',
        width: 248,
        height: 248,
        backgroundColor: colors.inputGrey,
        color: colors.fakeBlack,
        borderRadius: 8,
        flexWrap: 'wrap',
        fontFamily: monospaceFont,
        padding: 8,
      }}
    >
      {id}
    </RNText>
  </View>
)

export const QrCode = ({ data: { id, displayName } }) => (
  <View style={[{ flexDirection: 'row', justifyContent: 'center' }]}>
    <QRGenerator
      value={makeShareableUrl({ id, displayName })}
      size={248}
      style={[{ marginTop: 16, marginBottom: 16 }]}
    />
  </View>
)

const Fingerprint = ({ data: { id } }) => (
  <View style={[{ flexDirection: 'row', justifyContent: 'center' }, padding]}>
    <RNText
      style={{
        textAlign: 'center',
        width: 248,
        backgroundColor: colors.blue25,
        color: colors.blue,
        borderRadius: 8,
        flexWrap: 'wrap',
        fontSize: 18,
        fontFamily: monospaceFont,
        padding: 8,
      }}
    >
      {formattedFingerprint(id)}
    </RNText>
  </View>
)

const ContactIdentityTabbedContent = createMaterialTopTabNavigator(
  {
    qrcode: {
      screen: withScreenProps(QrCode),
      navigationOptions: () => ({
        title: I18n.t('qrcode'),
        tabBarIcon: tabIcon('material-qrcode'),
      }),
    },
    'public-key': {
      screen: withScreenProps(PublicKey),
      navigationOptions: () => ({
        title: I18n.t('public-key'),
        tabBarIcon: tabIcon('material-key-variant'),
      }),
    },
    fingerprint: {
      screen: withScreenProps(Fingerprint),
      navigationOptions: () => ({
        title: I18n.t('fingerprint'),
        tabBarIcon: tabIcon('material-fingerprint'),
      }),
    },
  },
  {
    initialRouteName: 'qrcode',
    ...tabNavigatorOptions,
  }
)

class ContactIdentityBase extends React.Component {
  static router = ContactIdentityTabbedContent.router

  render () {
    const { data = contact.default, navigation } = this.props

    return (
      <>
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <Avatar data={data} size={78} style={{ marginTop: 0 }} />
      </View>
      <Text large color={colors.fakeBlack} center padding>{data.overrideDisplayName || data.displayName}</Text>
      <View
        style={{ marginLeft: 15, marginRight: 15, marginBottom: 8, height: Platform.OS === 'android' ? 350 : undefined }}>
        <ContactIdentityTabbedContent navigation={navigation} screenProps={{ data }} />
      </View>
      </>
    )
  }
}

export default withNavigation(ContactIdentityBase)
