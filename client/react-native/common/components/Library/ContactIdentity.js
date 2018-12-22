import React from 'react'
import { View, Platform, Text as RNText } from 'react-native'
import { Avatar, Text } from '.'
import { createMaterialTopTabNavigator } from 'react-navigation'
import QRGenerator from './QRGenerator'
import { makeShareableUrl } from '../../helpers/contacts'
import colors from '../../constants/colors'
import { formattedFingerprint } from '../../helpers/fingerprint'
import { padding } from '../../styles'
import { tabIcon, withScreenProps } from '../../helpers/views'
import { monospaceFont, tabNavigatorOptions } from '../../constants/styling'
import I18n from 'i18next'

const PublicKey = ({ data: { id } }) => <View
  style={[{ flexDirection: 'row', justifyContent: 'center' }, padding]}>
  <RNText style={{
    textAlign: 'left',
    width: 248,
    height: 248,
    backgroundColor: colors.inputGrey,
    color: colors.fakeBlack,
    borderRadius: 8,
    flexWrap: 'wrap',
    fontFamily: monospaceFont,
    padding: 8,
  }}>{id}</RNText>
</View>

const QrCode = ({ data: { id, displayName } }) => <View
  style={[{ flexDirection: 'row', justifyContent: 'center' }]}>
  <QRGenerator
    value={makeShareableUrl({ id, displayName })}
    size={248}
    style={[{ marginTop: 16, marginBottom: 16 }]}
  />
</View>

const Fingerprint = ({ data: { id } }) => <View
  style={[{ flexDirection: 'row', justifyContent: 'center' }, padding]}>
  <RNText style={{
    textAlign: 'center',
    width: 248,
    backgroundColor: colors.blue25,
    color: colors.blue,
    borderRadius: 8,
    flexWrap: 'wrap',
    fontSize: 18,
    fontFamily: monospaceFont,
    padding: 8,
  }}>
    {formattedFingerprint(id)}
  </RNText>
</View>

const ContactIdentityTabbedContent = createMaterialTopTabNavigator(
  {
    'qrcode': {
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
    'fingerprint': {
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
  },
)

const ContactIdentity = ({ data }) => <>
  <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
    <Avatar data={data} size={78} style={{ marginTop: 0 }} />
  </View>
  <Text large color={colors.fakeBlack} center padding>{data.displayName}</Text>
  <View
    style={{ marginLeft: 15, marginRight: 15, marginBottom: 8, height: Platform.OS === 'android' ? 330 : undefined }}>
    {<ContactIdentityTabbedContent screenProps={{ data }} />}
  </View>
</>

export default ContactIdentity
ContactIdentity.QrCode = QrCode
