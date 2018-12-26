import React, { PureComponent } from 'react'
import { Switch } from 'react-native'
import { Header, Menu } from '../../Library'
import I18n from 'i18next'
import { withNamespaces } from 'react-i18next'

class Notifications extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: <Header navigation={navigation} title={I18n.t('chats.notifications')} backBtn />,
  })

  state = {
    alert: true,
    preview: false,
  }

  render () {
    const { t } = this.props

    return (
      <Menu>
        <Menu.Section customMarginTop={1}>
          <Menu.Item
            title={t('chats.notifications-enabled')}
            boldLeft
            customRight={
              <Switch
                justify='end'
                disabled={false}
                value={this.state.alert}
                onValueChange={value => {
                  this.setState({ alert: value })
                  console.log('Alert:', value)
                }}
              />
            }
          />
          <Menu.Item
            title={t('chats.notifications-preview')}
            boldLeft
            customRight={
              <Switch
                justify='end'
                disabled={false}
                value={this.state.preview}
                onValueChange={value => {
                  this.setState({ preview: value })
                  console.log('Preview:', value)
                }}
              />
            }
          />
          <Menu.Item title={t('chats.notifications-sound')} textRight='Paulette' boldLeft />
        </Menu.Section>
      </Menu>
    )
  }
}

export default withNamespaces()(Notifications)
