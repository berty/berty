import React, { PureComponent } from 'react'
import { Header, Menu } from '../../../Library'
import { withConfig } from '../../../../helpers/config'
import colors from '../../../../constants/colors'
import { withNavigation } from 'react-navigation'
import { showMessage } from 'react-native-flash-message'
import { RelayContext } from '../../../../relay'
import { enums } from '../../../../graphql'

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
    return <Menu>
      <Menu.Section title={'APNS'}>
        <Menu.Item title={'APNS relay id'} boldLeft />
        <Menu.Item value={this.state.config.pushRelayPubkeyApns} onChangeText={pushRelayPubkeyApns => this.setState({ config: { ...this.state.config, pushRelayPubkeyApns } })} input />
      </Menu.Section>
      <Menu.Section title={'FCM'}>
        <Menu.Item title={'FCM relay id'} boldLeft />
        <Menu.Item value={this.state.config.pushRelayPubkeyFcm} onChangeText={pushRelayPubkeyFcm  => this.setState({ config: { ...this.state.config, pushRelayPubkeyFcm } })} input />
      </Menu.Section>
      <Menu.Section title={'Debug'}>
        <Menu.Item title={'Debug verbosity'} boldLeft />
        {Object.entries(enums.BertyEntityDebugVerbosityInputDebugVerbosity).map(([k, v]) => <Menu.Item
          icon={this.state.config.debugNotificationVerbosity === v ? 'check-circle' : 'circle'}
          title={k}
          key={k}
          onPress={()  => this.setState({ config: { ...this.state.config, debugNotificationVerbosity: v } })}
        />
        )}
      </Menu.Section>
      <Menu.Section>
        <Menu.Item title={'Save'} boldLeft color={colors.blue} onPress={() => this.updateConfig()} />
      </Menu.Section>
    </Menu>
  }

  async updateConfig () {
    try {
      const config = {
        ...this.props.config,
        pushRelayPubkeyApns: this.state.config.pushRelayPubkeyApns,
        pushRelayPubkeyFcm: this.state.config.pushRelayPubkeyFcm,
        debugNotificationVerbosity: this.state.config.debugNotificationVerbosity,
      }

      await this.props.relayContext.mutations.configUpdate(config)
    } catch (e) {
      showMessage({
        message: String(e),
        type: 'danger',
        icon: 'danger',
        position: 'top',
      })

      return
    }

    this.props.navigation.goBack(null)
  }
}

const Notifications = withNavigation(withConfig(NotificationsBase, { showOnlyLoaded: true }))

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
    return <RelayContext.Consumer>{context =>
      <Notifications relayContext={context} />
    }</RelayContext.Consumer>
  }
}
