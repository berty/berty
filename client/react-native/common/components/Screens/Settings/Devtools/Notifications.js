import { btoa } from 'b64-lite'
import React, { PureComponent } from 'react'
import { Header, Menu } from '../../../Library'
import { withConfig } from '../../../../helpers/config'
import colors from '../../../../constants/colors'
import { withNavigation } from 'react-navigation'
import { showMessage } from 'react-native-flash-message'
import { RelayContext } from '../../../../relay'

class NotificationsBase extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      config: {
        pushRelayIdApns: btoa(String.fromCharCode(...new Uint8Array(props.config.pushRelayIdApns))),
        pushRelayIdFcm: btoa(String.fromCharCode(...new Uint8Array(props.config.pushRelayIdFcm))),
      },
    }
  }

  render () {
    return <Menu>
      <Menu.Section title={'APNS'}>
        <Menu.Item title={'APNS relay id'} boldLeft />
        <Menu.Item value={this.state.config.pushRelayIdApns} onChangeText={pushRelayIdApns => this.setState({ config: { ...this.state.config, pushRelayIdApns } })} input />
      </Menu.Section>
      <Menu.Section title={'FCM'}>
        <Menu.Item title={'FCM relay id'} boldLeft />
        <Menu.Item value={this.state.config.pushRelayIdFcm} onChangeText={pushRelayIdFcm => this.setState({ config: { ...this.state.config, pushRelayIdFcm } })} input />
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
        pushRelayIdApns: [...Uint8Array.from(atob(this.state.config.pushRelayIdApns), c => c.charCodeAt(0))],
        pushRelayIdFcm: [...Uint8Array.from(atob(this.state.config.pushRelayIdFcm), c => c.charCodeAt(0))],
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
