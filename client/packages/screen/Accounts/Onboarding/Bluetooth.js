import React from 'react'
import { Text, View, ScrollView, Platform } from 'react-native'
import { Flex } from '@berty/component'
import { withNavigation } from 'react-navigation'
import * as onboardingStyle from './style'
import { NextButton, SkipButton } from './Button'
import { withNamespaces } from 'react-i18next'
import colors from '@berty/common/constants/colors'
import { withBridgeContext } from '@berty/bridge/Context'
import { requestBLEAndroidPermission } from '@berty/common/helpers/permissions'

const Bluetooth = ({ bridge, navigation, t }) => (
  <View style={{ backgroundColor: colors.white, flex: 1 }}>
    <ScrollView alwaysBounceVertical={false}>
      <Flex.Rows style={onboardingStyle.view}>
        <Text style={onboardingStyle.title}>
          {t('onboarding.bluetooth.title')}
        </Text>
        <Text style={onboardingStyle.help}>
          {t('onboarding.bluetooth.help')}
        </Text>
        <Text style={onboardingStyle.disclaimer}>
          {t('onboarding.bluetooth.disclaimer')}
        </Text>
        <View style={{ height: 60, flexDirection: 'row' }}>
          <SkipButton
            onPress={() => navigation.navigate('onboarding/contacts')}
          >
            {t('skip')}
          </SkipButton>
          <NextButton
            onPress={async () => {
              if (
                Platform.OS === 'ios' ||
                (await requestBLEAndroidPermission())
              ) {
                const config = await bridge.daemon.getNetworkConfig({})

                let currentConfig = JSON.parse(config.json)
                currentConfig.BLE = true
                await bridge.daemon.updateNetworkConfig({
                  json: JSON.stringify(currentConfig),
                })
              }
              navigation.navigate('onboarding/contacts')
            }}
          >
            {t('onboarding.bluetooth.enable')}
          </NextButton>
        </View>
      </Flex.Rows>
    </ScrollView>
  </View>
)

export default withNamespaces()(withBridgeContext(withNavigation(Bluetooth)))
