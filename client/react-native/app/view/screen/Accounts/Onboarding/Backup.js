import React from 'react'
import { ScrollView, Text, View } from 'react-native'
import { Flex } from '@berty/component'
import { withNavigation } from 'react-navigation'
import * as onboardingStyle from './style'
import { NextButton, SkipButton } from './Button'
import { withNamespaces } from 'react-i18next'
import colors from '@berty/common/constants/colors'

const Backup = ({ navigation, t }) => (
  <View style={{ backgroundColor: colors.white, flex: 1 }}>
    <ScrollView alwaysBounceVertical={false}>
      <Flex.Rows style={onboardingStyle.view}>
        <Text style={onboardingStyle.title}>
          {t('onboarding.backup.title')}
        </Text>
        <Text style={onboardingStyle.help}>
          {t('onboarding.backup.help-backup')}
        </Text>
        <Text style={onboardingStyle.disclaimer}>
          {t('onboarding.backup.disclaimer-backup')}
        </Text>
        <View style={{ height: 60, flexDirection: 'row' }}>
          <SkipButton />
          <NextButton>{t('onboarding.backup.action-backup')}</NextButton>
        </View>
        <Text style={onboardingStyle.help}>
          {t('onboarding.backup.help-device')}
        </Text>
        <Text style={onboardingStyle.disclaimer}>
          {t('onboarding.backup.disclaimer-device')}
        </Text>
        <View style={{ height: 60, flexDirection: 'row' }}>
          <SkipButton onPress={() => navigation.navigate('onboarding/ready')}>
            {t('skip')}
          </SkipButton>
          <NextButton>{t('onboarding.backup.action-device')}</NextButton>
        </View>
      </Flex.Rows>
    </ScrollView>
  </View>
)

export default withNamespaces()(withNavigation(Backup))
