import React, { PureComponent } from 'react'
import { Header, Text, Flex } from '@berty/view/component'
import I18n from 'i18next'

export default class More extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title={I18n.t('settings.learn-more')}
        backBtn
      />
    ),
  })
  render () {
    return (
      <Flex.Cols size={1} align='center' justify='between'>
        <Flex.Rows size={1} align='center' justify='between'>
          <Text big>Display Berty whitepaper?</Text>
        </Flex.Rows>
      </Flex.Cols>
    )
  }
}
