import React from 'react'
import { Text, View, ScrollView } from 'react-native'
import { Flex } from '../../../Library'
import { withNavigation } from 'react-navigation'
import * as onboardingStyle from './style'
import { NextButton, SkipButton } from './Button'
import { withNamespaces } from 'react-i18next'
import { withCurrentUser } from '../../../../utils/contact'
import { extractPublicKeyFromId, shareLinkSelf } from '../../../../helpers/contacts'
import colors from '../../../../constants/colors'

const Contacts = ({ navigation, currentUser, t }) =>
  <View style={{ backgroundColor: colors.white, flex: 1 }}>
    <ScrollView alwaysBounceVertical={false}>
      <Flex.Rows style={onboardingStyle.view}>
        <Text style={onboardingStyle.title}>{t('onboarding.contacts.title')}</Text>
        <Text style={onboardingStyle.help}>{t('onboarding.contacts.link-help')}</Text>
        <Text style={onboardingStyle.disclaimer}>{t('onboarding.contacts.link-disclaimer')}</Text>
        <View style={{ height: 60, flexDirection: 'row' }}>
          <SkipButton>{' '}</SkipButton>
          <NextButton onPress={() => shareLinkSelf({
            id: extractPublicKeyFromId(currentUser.id),
            displayName: currentUser.displayName,
          })}>{t('onboarding.contacts.link-share')}</NextButton>
        </View>
        <Text style={onboardingStyle.help}>{t('onboarding.contacts.phone-help')}</Text>
        <Text style={onboardingStyle.disclaimer}>{t('onboarding.contacts.phone-disclaimer')}</Text>
        <View style={{ height: 60, flexDirection: 'row' }}>
          <SkipButton onPress={() => navigation.navigate('onboarding/backup')}>{t('skip')}</SkipButton>
          <NextButton>{t('onboarding.contacts.phone-link')}</NextButton>
        </View>
      </Flex.Rows>
    </ScrollView>
  </View>

export default withCurrentUser(withNamespaces()(withNavigation(Contacts)), { showOnlyLoaded: true })
