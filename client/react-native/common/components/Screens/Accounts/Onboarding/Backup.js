import React from 'react'
import { ScrollView, Text, View } from 'react-native'
import { Flex } from '../../../Library'
import { withNavigation } from 'react-navigation'
import * as onboardingStyle from './style'
import { NextButton, SkipButton } from './Button'
import { withNamespaces } from 'react-i18next'

const Backup = ({ navigation, t }) => <ScrollView alwaysBounceVertical={false}>
  <Flex.Rows style={onboardingStyle.view}>
    <Text style={onboardingStyle.title}>{t('onboarding.backup.title')}</Text>
    <Text style={onboardingStyle.help}>{t('onboarding.backup.help-backup')}</Text>
    <Text style={onboardingStyle.disclaimer}>{t('onboarding.backup.disclaimer-backup')}</Text>
    <View style={{ height: 60, flexDirection: 'row' }}>
      <SkipButton>{' '}</SkipButton>
      <NextButton>{t('onboarding.backup.action-backup')}</NextButton>
    </View>
    <Text style={onboardingStyle.help}>{t('onboarding.backup.help-device')}</Text>
    <Text style={onboardingStyle.disclaimer}>{t('onboarding.backup.disclaimer-device')}</Text>
    <View style={{ height: 60, flexDirection: 'row' }}>
      <SkipButton
        onPress={() => navigation.navigate('onboarding/ready')}>{t('skip')}</SkipButton>
      <NextButton>{t('onboarding.backup.action-device')}</NextButton>
    </View>

  </Flex.Rows>
</ScrollView>

export default withNamespaces()(withNavigation(Backup))
