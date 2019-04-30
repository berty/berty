import React, { PureComponent } from 'react'
import { Switch, Text } from 'react-native'
import { Header, Menu } from '@berty/view/component'
import { colors } from '@berty/common/constants'
import { withNamespaces } from 'react-i18next'
import I18n from 'i18next'

class Notifications extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title={I18n.t('chats.notifications')}
        backBtn
      />
    ),
  })

  state = {
    mute: false,
    override: true,
    alert: true,
    preview: false,
  }

  render () {
    const { t } = this.props

    return (
      <Menu>
        <Menu.Section>
          <Menu.Item
            icon='bell-off'
            title={t('chats.notifications-mute')}
            boldLeft
            customRight={
              <Switch
                justify='end'
                disabled={false}
                value={this.state.mute}
                onValueChange={value => {
                  this.setState({ mute: value })
                  console.log('Mute:', value)
                }}
              />
            }
          />
        </Menu.Section>
        <Text
          align='center'
          style={{
            color: colors.textGrey,
            marginTop: 32,
          }}
        >
          You can set custom notifications for this group
        </Text>
        <Menu.Section customMarginTop={1}>
          <Menu.Item
            icon='bell'
            title={t('chats.notifications-override')}
            boldLeft
            customRight={
              <Switch
                justify='end'
                disabled={false}
                value={this.state.override}
                onValueChange={value => this.setState({ override: value })}
              />
            }
          />
        </Menu.Section>
        {this.state.override && (
          <Menu.Section>
            <Menu.Item
              title='Alert'
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
            <Menu.Item title='Sound' textRight='Paulette' boldLeft />
          </Menu.Section>
        )}
      </Menu>
    )
  }
}

export default withNamespaces()(Notifications)
