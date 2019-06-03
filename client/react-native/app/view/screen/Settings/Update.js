import React, { PureComponent } from 'react'
import { ScrollView } from 'react-native'
import { Screen, Flex, Text, Button, Header, Loader } from '@berty/component'
import RelayContext from '@berty/relay/context'
import {
  getInstalledVersion,
  getLatestVersion,
  installUpdate,
  shouldUpdate,
} from '@berty/update'
import colors from '@berty/common/constants/colors'
import { borderBottom, padding } from '@berty/common/styles'
import { withNamespaces } from 'react-i18next'
import I18n from 'i18next'

const VersionInfoBase = ({ version, t }) =>
  [
    [t('settings.update-build-date'), 'buildDate'],
    [t('settings.update-branch'), 'branch'],
    [t('settings.update-version-hash'), 'hash'],
  ].map(([label, key]) => (
    <Flex.Cols style={[{ height: 52 }, padding, borderBottom]} key={key}>
      <Flex.Rows size={2} align='left'>
        <Text small left>
          {label}
        </Text>
      </Flex.Rows>
      <Flex.Rows size={5} align='left'>
        <Text tiny left>
          {version ? String(version[key]) : '...'}
        </Text>
      </Flex.Rows>
    </Flex.Cols>
  ))

const VersionInfo = withNamespaces()(VersionInfoBase)

class UpdateBase extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      installing: false,
      installed: null,
      latest: null,
    }
  }

  componentDidMount () {
    getInstalledVersion(this.props.context).then(installed =>
      this.setState({ installed })
    )
    getLatestVersion().then(latest => this.setState({ latest }))
  }

  render = () => {
    const { t } = this.props
    const { installing } = this.state

    return !installing ? (
      <Screen>
        <ScrollView>
          <Text big padding>
            {t('settings.update-installed-version-label', {
              channel: this.state.installed ? this.state.installed.channel : '',
            })}
          </Text>
          <VersionInfo version={this.state.installed} />

          <Text big padding>
            {t('settings.update-latest-version-label')}
          </Text>
          <VersionInfo version={this.state.latest} />

          <Flex.Cols style={[{ height: 52 }, padding, borderBottom]}>
            <Flex.Rows size={2} align='left' />
            <Flex.Rows size={5} align='left'>
              {shouldUpdate(this.state.installed, this.state.latest) ? (
                <Button
                  onPress={() => {
                    this.setState({ installing: true })
                    installUpdate(this.state.latest.installUrl)
                  }}
                  color={colors.blue}
                >
                  {t('settings.update-install')}
                </Button>
              ) : (
                <Text left>{t('settings.updates-no-available')}</Text>
              )}
            </Flex.Rows>
          </Flex.Cols>
        </ScrollView>
      </Screen>
    ) : (
      <Loader />
    )
  }
}

const Update = withNamespaces()(UpdateBase)

export default class WrappedUpdate extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title={I18n.t('settings.updates-check')}
        backBtn
      />
    ),
    tabBarVisible: false,
  })

  render () {
    return (
      <RelayContext.Consumer>
        {context => <Update context={context} navigator={navigator} />}
      </RelayContext.Consumer>
    )
  }
}
