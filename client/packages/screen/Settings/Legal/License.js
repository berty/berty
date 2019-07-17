import React, { PureComponent } from 'react'
import { Header, Text, Flex } from '@berty/component'
import { withNamespaces } from 'react-i18next'
import I18n from 'i18next'

class License extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title={I18n.t('settings.software-license')}
        backBtn
      />
    ),
  })

  render() {
    const { t } = this.props

    return (
      <Flex.Cols size={1} align="center" justify="between">
        <Flex.Rows size={1} align="center" justify="between">
          <Text big>{t('settings.software-license')}</Text>
        </Flex.Rows>
      </Flex.Cols>
    )
  }
}

export default withNamespaces()(License)
