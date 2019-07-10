import React from 'react'
import { ScrollView, Text, View } from 'react-native'
import { Flex } from '@berty/component'
import { withNavigation } from 'react-navigation'
import * as onboardingStyle from './style'
import { NextButton } from './Button'
import { withNamespaces } from 'react-i18next'
import colors from '@berty/common/constants/colors'

const Ready = ({ navigation, t }) => (
  <View style={{ backgroundColor: colors.white, flex: 1 }}>
    <ScrollView alwaysBounceVertical={false}>
      <Flex.Rows style={onboardingStyle.view}>
        <Text style={onboardingStyle.title}>{t('onboarding.ready.title')}</Text>
        <Text style={onboardingStyle.help}>{t('onboarding.ready.help')}</Text>
        <View style={{ height: 60, flexDirection: 'row' }}>
          <NextButton onPress={() => navigation.navigate('switch/main')}>
            {t('close')}
          </NextButton>
        </View>
      </Flex.Rows>
    </ScrollView>
  </View>
)

export default withNamespaces()(withNavigation(Ready))
