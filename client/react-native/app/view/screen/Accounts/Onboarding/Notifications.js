import React from 'react'
import { Text, Platform, View, ScrollView } from 'react-native'
import { Flex } from '@berty/component'
import { withNavigation } from 'react-navigation'
import * as onboardingStyle from './style'
import { NextButton, SkipButton } from './Button'
// import { enableNativeNotifications } from '@berty/common/helpers/notifications'
import { withNamespaces } from 'react-i18next'
import colors from '@berty/common/constants/colors'
import { withStoreContext } from '@berty/store/context'

const Notifications = ({ context, navigation, t, config }) => (
  <View style={{ backgroundColor: colors.white, flex: 1 }}>
    <ScrollView alwaysBounceVertical={false}>
      <Flex.Rows style={onboardingStyle.view}>
        <Text style={onboardingStyle.title}>
          {t('onboarding.notifications.title')}
        </Text>
        <Text style={onboardingStyle.help}>
          {t('onboarding.notifications.help')}
        </Text>
        <Text style={onboardingStyle.disclaimer}>
          {Platform.OS === 'ios' &&
            t('onboarding.notifications.disclaimer-apple')}
          {Platform.OS === 'android' &&
            t('onboarding.notifications.disclaimer-google')}
        </Text>
        <View style={{ height: 60, flexDirection: 'row' }}>
          <SkipButton
            onPress={() => navigation.navigate('onboarding/contacts')}
          >
            {t('skip')}
          </SkipButton>
          <NextButton
            onPress={async () => {
              // @FIXME: destroyed by refactor
              // await enableNativeNotifications({ context })
              await context.node.service.configUpdate({
                ...config,
                notificationsEnabled: true,
              })
              navigation.navigate('onboarding/bluetooth')
            }}
          >
            {t('onboarding.notifications.enable')}
          </NextButton>
        </View>
      </Flex.Rows>
    </ScrollView>
  </View>
)

export default withNamespaces()(withStoreContext(withNavigation(Notifications)))
