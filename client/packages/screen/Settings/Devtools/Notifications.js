import React, { PureComponent } from 'react'
import { Loader, Header, Menu } from '@berty/component'
import colors from '@berty/common/constants/colors'
import { withNavigation } from 'react-navigation'
import { showMessage } from 'react-native-flash-message'
import * as enums from '@berty/common/enums.gen'
import { Store } from '@berty/container'
import { withStoreContext } from '@berty/store/context'

@withStoreContext
@withNavigation
class Notifications extends PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      config: {
        pushRelayPubkeyApns: props.config.pushRelayPubkeyApns,
        pushRelayPubkeyFcm: props.config.pushRelayPubkeyFcm,
        debugNotificationVerbosity: props.config.debugNotificationVerbosity,
      },
    }
  }

  render() {
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

  async updateConfig(field) {
    try {
      const config = {
        ...this.props.config,
        [field]: this.state.config[field],
      }

      await this.props.context.node.service.configUpdate(config)
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

export default class NotificationsWrapper extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title={'Notifications'}
        titleIcon="bell"
        backBtn
      />
    ),
  })

  render() {
    return (
      <Store.Entity.Config>
        {data => (data ? <Notifications config={data} /> : <Loader />)}
      </Store.Entity.Config>
    )
  }
}
