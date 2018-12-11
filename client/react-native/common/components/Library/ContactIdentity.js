import React from 'react'
import { View, Image, Platform, Text as RNText } from 'react-native'
import Text from './Text'
import { createMaterialTopTabNavigator } from 'react-navigation'
import QRGenerator from './QRGenerator'
import { extractPublicKeyFromId, makeShareableUrl } from '../../helpers/contacts'
import colors from '../../constants/colors'
import Icon from './Icon'
import { formattedFingerprint } from '../../helpers/fingerprint'
import { padding } from '../../styles'
import { withScreenProps } from '../../helpers/views'

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
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    padding: 8,
  }}>
    {extractPublicKeyFromId(id)}
  </RNText>
</View>

export const QrCode = ({ data: { id, displayName } }) => <View
  style={[{ flexDirection: 'row', justifyContent: 'center' }]}>
  <QRGenerator
    value={makeShareableUrl({ id: extractPublicKeyFromId(id), displayName })}
    size={248}
    style={[{ marginTop: 16, marginBottom: 16 }]}
  />
</View>

const tabIcon = (iconName) => {
  const NamedTabIcon = ({ focused }) => <Icon name={iconName} color={focused ? colors.blue : colors.darkGrey}
    size={20} />

  return NamedTabIcon
}

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
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    padding: 8,
  }}>
    {formattedFingerprint(id)}
  </RNText>
</View>

const ContactIdentityTabbedContent = createMaterialTopTabNavigator(
  {
    'qrcode': {
      screen: withScreenProps(QrCode),
      navigationOptions: {
        title: 'QR Code',
        tabBarIcon: tabIcon('material-qrcode'),
      },
    },
    'public-key': {
      screen: withScreenProps(PublicKey),
      navigationOptions: {
        title: 'Public key',
        tabBarIcon: tabIcon('material-key-variant'),
      },
    },
    'fingerprint': {
      screen: withScreenProps(Fingerprint),
      navigationOptions: {
        title: 'Fingerprint',
        tabBarIcon: tabIcon('material-fingerprint'),
      },
    },
  },
  {
    initialRouteName: 'qrcode',
    swipeEnabled: Platform.OS !== 'android',
    animationEnabled: true,
    backBehavior: 'none',
    tabBarOptions: {
      activeTintColor: colors.fakeBlack,
      inactiveTintColor: colors.fakeBlack,
      showIcon: true,
      showLabel: true,
      upperCaseLabel: false,
      style: {
        backgroundColor: colors.white,
        marginBottom: 0,
        marginTop: 0,
      },
      tabStyle: {
        marginBottom: 0,
        marginTop: 0,
      },
      indicatorStyle: {
        backgroundColor: colors.blue,
        marginBottom: 0,
        marginTop: 0,
      },
      labelStyle: {
        fontSize: 12,
        marginBottom: 0,
        marginTop: 0,
      },
    },
  },
)

const ContactIdentity = ({ data }) => <>
  <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
    <Image
      style={{
        width: 78,
        height: 78,
        borderRadius: 39,
        marginBottom: 4,
        marginTop: 0,
      }}
      source={{
        uri: 'https://api.adorable.io/avatars/120/' + data.id + '.png',
      }}
    />
  </View>
  <Text large color={colors.fakeBlack} center padding>{data.displayName}</Text>
  <View style={{ marginLeft: 15, marginRight: 15, marginBottom: 8, height: Platform.OS === 'android' ? 330 : undefined }}>
    {<ContactIdentityTabbedContent screenProps={{ data }} />}
  </View>
</>

export default ContactIdentity
