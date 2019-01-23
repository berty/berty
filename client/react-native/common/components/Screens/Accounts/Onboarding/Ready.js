import React from 'react'
import { ScrollView, Text, View } from 'react-native'
import { Flex } from '../../../Library'
import { withNavigation } from 'react-navigation'
import * as onboardingStyle from './style'
import { NextButton } from './Button'
import { withNamespaces } from 'react-i18next'

const Ready = ({ navigation, t }) =>
  <ScrollView alwaysBounceVertical={false}>
    <Flex.Rows style={onboardingStyle.view}>
      <Text style={onboardingStyle.title}>{t('onboarding.ready.title')}</Text>
      <Text style={onboardingStyle.help}>{t('onboarding.ready.help')}</Text>
      <View style={{ height: 60, flexDirection: 'row' }}>
        <NextButton
          onPress={() => navigation.navigate('switch/main')}>{t('close')}</NextButton>
      </View>
    </Flex.Rows>
  </ScrollView>

export default withNamespaces()(withNavigation(Ready))
