import React from 'react'
import { Text, Platform, View, ScrollView } from 'react-native'
import { Flex } from '../../../Library'
import { withNavigation } from 'react-navigation'
import * as onboardingStyle from './style'
import { NextButton, SkipButton } from './Button'
import { enableNativeNotifications } from '../../../../helpers/notifications'
import { withNamespaces } from 'react-i18next'
import { RelayContext } from '../../../../relay'
import colors from '../../../../constants/colors'

const Notifications = ({ navigation, t }) =>
  <View style={{ backgroundColor: colors.white, flex: 1 }}>
    <RelayContext.Consumer>{context =>
      <ScrollView alwaysBounceVertical={false}>
        <Flex.Rows style={onboardingStyle.view}>
          <Text style={onboardingStyle.title}>{t('onboarding.notifications.title')}</Text>
          <Text style={onboardingStyle.help}>{t('onboarding.notifications.help')}</Text>
          <Text style={onboardingStyle.disclaimer}>
            {Platform.OS === 'ios' && t('onboarding.notifications.disclaimer-apple')}
            {Platform.OS === 'android' && t('onboarding.notifications.disclaimer-google')}
          </Text>
          <View style={{ height: 60, flexDirection: 'row' }}>
            <SkipButton
              onPress={() => navigation.navigate('onboarding/contacts')}>{t('skip')}</SkipButton>
            <NextButton onPress={async () => {
              await enableNativeNotifications({ context })
              navigation.navigate('onboarding/contacts')
            }}>{t('onboarding.notifications.enable')}</NextButton>
          </View>
        </Flex.Rows>
      </ScrollView>
    }</RelayContext.Consumer>
  </View>

export default withNamespaces()(withNavigation(Notifications))
