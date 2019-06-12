import React, { PureComponent } from 'react'
import { Header, Menu } from '@berty/component'
import { withConfig } from '@berty/relay/config'
import colors from '@berty/common/constants/colors'
import { withNavigation } from 'react-navigation'
import { showMessage } from 'react-native-flash-message'
import { RelayContext } from '@berty/relay'
import * as enums from '@berty/common/enums.gen'

class NotificationsBase extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      config: {
        pushRelayPubkeyApns: props.config.pushRelayPubkeyApns,
        pushRelayPubkeyFcm: props.config.pushRelayPubkeyFcm,
        debugNotificationVerbosity: props.config.debugNotificationVerbosity,
      },
    }
  }

  render () {
    return (
      <Menu>
        <Menu.Section title={'APNS'}>
          <Menu.Item title={'APNS relay id'} boldLeft />
          <Menu.Item
            value={this.state.config.pushRelayPubkeyApns}
            onChangeText={pushRelayPubkeyApns =>
              this.setState({
                config: { ...this.state.config, pushRelayPubkeyApns },
              })
            }
            input
          />
          <Menu.Item
            title={'Save'}
            boldLeft
            color={colors.blue}
            onPress={() => this.updateConfig('pushRelayPubkeyApns')}
          />
        </Menu.Section>
        <Menu.Section title={'FCM'}>
          <Menu.Item title={'FCM relay id'} boldLeft />
          <Menu.Item
            value={this.state.config.pushRelayPubkeyFcm}
            onChangeText={pushRelayPubkeyFcm =>
              this.setState({
                config: { ...this.state.config, pushRelayPubkeyFcm },
              })
            }
            input
          />
          <Menu.Item
            title={'Save'}
            boldLeft
            color={colors.blue}
            onPress={() => this.updateConfig('pushRelayPubkeyFcm')}
          />
        </Menu.Section>

        <Menu.Section title={'Debug'}>
          <Menu.Item title={'Debug verbosity'} boldLeft />
          {Object.entries(enums.BertyEntityDebugVerbosityInputDebugVerbosity)
            .filter(
              ([k, v]) =>
                [
                  enums.BertyEntityDebugVerbosityInputDebugVerbosity
                    .VERBOSITY_LEVEL_ERROR,
                  enums.BertyEntityDebugVerbosityInputDebugVerbosity
                    .VERBOSITY_LEVEL_DEBUG,
                ].indexOf(v) > -1
            )
            .map(([k, v]) => (
              <Menu.Item
                icon={
                  this.state.config.debugNotificationVerbosity === v
                    ? 'check-circle'
                    : 'circle'
                }
                title={k}
                key={k}
                onPress={async () => {
                  this.setState(
                    {
                      config: {
                        ...this.state.config,
                        debugNotificationVerbosity: v,
                      },
                    },
                    () => this.updateConfig('debugNotificationVerbosity')
                  )
                }}
              />
            ))}
        </Menu.Section>
      </Menu>
    )
  }

  async updateConfig (field) {
    try {
      const config = {
        ...this.props.config,
        [field]: this.state.config[field],
      }

      await this.props.relayContext.mutations.configUpdate(config)
    } catch (e) {
      showMessage({
        message: String(e),
        type: 'danger',
        icon: 'danger',
        position: 'top',
      })
    }
  }
}

const Notifications = withNavigation(
  withConfig(NotificationsBase, { showOnlyLoaded: true })
)

export default class NotificationsWrapper extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title={'Notifications'}
        titleIcon='bell'
        backBtn
      />
    ),
  })

  render () {
    return (
      <RelayContext.Consumer>
        {context => <Notifications relayContext={context} />}
      </RelayContext.Consumer>
    )
  }
}
