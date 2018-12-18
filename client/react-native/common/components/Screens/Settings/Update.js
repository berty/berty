import React, { PureComponent } from 'react'
import { ScrollView } from 'react-native'
import RelayContext from '../../../relay/RelayContext'
import { getInstalledVersion, getLatestVersion, installUpdate, shouldUpdate } from '../../../helpers/update'
import { Screen, Flex, Text, Button, Header } from '../../Library'
import colors from '../../../constants/colors'
import { borderBottom, padding } from '../../../styles'

const VersionInfo = ({ version }) => [
  ['Build date', 'buildDate'],
  ['Branch', 'branch'],
  ['Version hash', 'hash'],
].map(([label, key]) => <Flex.Cols style={[{ height: 52 }, padding, borderBottom]} key={key}>
  <Flex.Rows size={2} align='left'>
    <Text small left>{label}</Text>
  </Flex.Rows>
  <Flex.Rows size={5} align='left'>
    <Text tiny left>{version ? String(version[key]) : '...'}</Text>
  </Flex.Rows>
</Flex.Cols>)

class Update extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      installed: null,
      latest: null,
    }
  }

  componentDidMount () {
    getInstalledVersion(this.props.context).then(installed => this.setState({ installed }))
    getLatestVersion().then(latest => this.setState({ latest }))
  }

  render = () => <Screen>
    <ScrollView>
      <Text big padding>Installed version {this.state.installed ? `(${this.state.installed.channel})` : ''}</Text>
      <VersionInfo version={this.state.installed} />

      <Text big padding>Latest version</Text>
      <VersionInfo version={this.state.latest} />

      <Flex.Cols style={[{ height: 52 }, padding, borderBottom]}>
        <Flex.Rows size={2} align='left' />
        <Flex.Rows size={5} align='left'>
          {shouldUpdate(this.state.installed, this.state.latest)
            ? <Button onPress={() => installUpdate(this.state.latest.installUrl)} color={colors.blue}>
              Install update
            </Button>
            : <Text left>No update available</Text>}
        </Flex.Rows>
      </Flex.Cols>
    </ScrollView>
  </Screen>
}

export default class WrappedUpdate extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: <Header
      navigation={navigation}
      title='Update'
      backBtn
    />,
    tabBarVisible: false,
  })

  render () {
    return <RelayContext.Consumer>{context =>
      <Update context={context} navigator={navigator} />
    }</RelayContext.Consumer>
  }
}
