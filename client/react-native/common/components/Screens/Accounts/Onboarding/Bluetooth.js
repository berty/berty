import React from 'react'
import { Text, View, ScrollView, NativeModules } from 'react-native'
import { Flex } from '../../../Library'
import { withNavigation } from 'react-navigation'
import * as onboardingStyle from './style'
import { NextButton, SkipButton } from './Button'
import { withNamespaces } from 'react-i18next'
import { RelayContext } from '../../../../relay'
import colors from '../../../../constants/colors'

const Bluetooth = ({ navigation, t }) =>
  <View style={{ backgroundColor: colors.white, flex: 1 }}>
    <RelayContext.Consumer>{context =>
      <ScrollView alwaysBounceVertical={false}>
        <Flex.Rows style={onboardingStyle.view}>
          <Text style={onboardingStyle.title}>{t('onboarding.bluetooth.title')}</Text>
          <Text style={onboardingStyle.help}>{t('onboarding.bluetooth.help')}</Text>
          <Text style={onboardingStyle.disclaimer}>
            {t('onboarding.bluetooth.disclaimer')}
          </Text>
          <View style={{ height: 60, flexDirection: 'row' }}>
            <SkipButton
              onPress={() => navigation.navigate('onboarding/contacts')}>{t('skip')}</SkipButton>
            <NextButton onPress={async () => {
              let json = await NativeModules.CoreModule.getNetworkConfig()
              let currentConfig = JSON.parse(json)
              currentConfig.BluetoothTransport = true
              await NativeModules.CoreModule.updateNetworkConfig(JSON.stringify(currentConfig))
              navigation.navigate('onboarding/contacts')
            }}>{t('onboarding.bluetooth.enable')}</NextButton>
          </View>
        </Flex.Rows>
      </ScrollView>
    }</RelayContext.Consumer>
  </View>

export default withNamespaces()(withNavigation(Bluetooth))
