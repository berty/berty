import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { Flex } from '../../../Library'
import { withNavigation } from 'react-navigation'
import * as onboardingStyle from './style'
import { NextButton, SkipButton } from './Button'
import { withNamespaces } from 'react-i18next'

const Welcome = ({ navigation, t }) =>
  <ScrollView alwaysBounceVertical={false}>
    <Flex.Rows style={onboardingStyle.view}>
      <Text style={onboardingStyle.title}>{t('onboarding.welcome.title')}</Text>
      <Text style={onboardingStyle.help}>{t('onboarding.welcome.help-1')}</Text>
      <Text style={onboardingStyle.help}>{t('onboarding.welcome.help-2')}</Text>
      <Text style={onboardingStyle.disclaimer}>{t('onboarding.welcome.disclaimer')}</Text>
      <View style={{ height: 60, flexDirection: 'row' }}>
        <SkipButton
          onPress={() => navigation.navigate('onboarding/ready')}
          style={onboardingStyle.skipButton}>{t('onboarding.welcome.skip-everything')}</SkipButton>
        <NextButton
          onPress={() => navigation.navigate('onboarding/notifications')}
          style={onboardingStyle.nextButton}>{t('next')}</NextButton>
      </View>
    </Flex.Rows>
  </ScrollView>

export default withNamespaces()(withNavigation(Welcome))
