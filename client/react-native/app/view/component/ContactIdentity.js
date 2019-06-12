import { Platform, View, Text as RNText } from 'react-native'
import { createMaterialTopTabNavigator, withNavigation } from 'react-navigation'
import I18n from 'i18next'
import React from 'react'

import { contact } from '@berty/relay/utils'
import { formattedFingerprint } from '@berty/common/helpers/fingerprint'
import { makeShareableUrl } from '@berty/common/helpers/contacts'
import {
  monospaceFont,
  tabNavigatorOptions,
} from '@berty/common/constants/styling'
import { padding } from '@berty/common/styles'
import {
  withProps,
  asFunctional,
  withScreenProps,
} from '@berty/common/helpers/views'
import Avatar from './Avatar'
import QRGenerator from './QRGenerator'
import TabIcon from './TabIcon'
import Text from './Text'
import colors from '@berty/common/constants/colors'

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
        tabBarIcon: asFunctional(
          withProps({ name: 'material-qrcode' })(TabIcon)
        ),
      }),
    },
    'public-key': {
      screen: withScreenProps(PublicKey),
      navigationOptions: () => ({
        title: I18n.t('public-key'),
        tabBarIcon: asFunctional(
          withProps({ name: 'material-key-variant' })(TabIcon)
        ),
      }),
    },
    fingerprint: {
      screen: withScreenProps(Fingerprint),
      navigationOptions: () => ({
        title: I18n.t('fingerprint'),
        tabBarIcon: asFunctional(
          withProps({ name: 'material-fingerprint' })(TabIcon)
        ),
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
        <Text large color={colors.fakeBlack} center padding>
          {data.overrideDisplayName || data.displayName}
        </Text>
        <View
          style={{
            marginLeft: 15,
            marginRight: 15,
            marginBottom: 8,
            height: Platform.OS === 'android' ? 350 : undefined,
          }}
        >
          <ContactIdentityTabbedContent
            navigation={navigation}
            screenProps={{ data }}
          />
        </View>
      </>
    )
  }
}

export default withNavigation(ContactIdentityBase)
