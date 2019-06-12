import React from 'react'
import { Text, View, ScrollView } from 'react-native'
import { Flex } from '@berty/component'
import { withNavigation } from 'react-navigation'
import * as onboardingStyle from './style'
import { NextButton, SkipButton } from './Button'
import { withNamespaces } from 'react-i18next'
import { withCurrentUser } from '@berty/relay/utils/contact'
import { shareLinkSelf } from '@berty/common/helpers/contacts'
import colors from '@berty/common/constants/colors'

const Contacts = ({ navigation, currentUser, t }) => (
  <View style={{ backgroundColor: colors.white, flex: 1 }}>
    <ScrollView alwaysBounceVertical={false}>
      <Flex.Rows style={onboardingStyle.view}>
        <Text style={onboardingStyle.title}>
          {t('onboarding.contacts.title')}
        </Text>
        <Text style={onboardingStyle.help}>
          {t('onboarding.contacts.link-help')}
        </Text>
        <Text style={onboardingStyle.disclaimer}>
          {t('onboarding.contacts.link-disclaimer')}
        </Text>
        <View style={{ height: 60, flexDirection: 'row' }}>
          <NextButton
            onPress={() =>
              shareLinkSelf({
                id: currentUser.id,
                displayName: currentUser.displayName,
              })
            }
          >
            {t('onboarding.contacts.link-share')}
          </NextButton>
        </View>
        <View style={{ height: 60, flexDirection: 'row' }}>
          <SkipButton />
          <NextButton onPress={() => navigation.navigate('onboarding/ready')}>
            {t('next')}
          </NextButton>
        </View>
      </Flex.Rows>
    </ScrollView>
  </View>
)

export default withCurrentUser(withNamespaces()(withNavigation(Contacts)), {
  showOnlyLoaded: true,
})
