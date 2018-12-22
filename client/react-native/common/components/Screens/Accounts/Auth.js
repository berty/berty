import { NativeModules, TextInput, View, Text, TouchableOpacity } from 'react-native'
import React, { PureComponent } from 'react'

import { Flex, Loader, Screen } from '../../Library'
import { colors } from '../../../constants'
import { defaultUsername } from '../../../helpers/contacts'
import { withNamespaces } from 'react-i18next'

const { CoreModule } = NativeModules

class Auth extends PureComponent {
  state = {
    list: [],
    current: null,
    loading: true,
    message: null,
    nickname: null,
  }

  init = async () => {
    const { t } = this.props

    this.setState({ loading: true, message: t('core.initializing') })
    try {
      await CoreModule.initialize()
    } catch (error) {
      throw error
    }
  }

  list = async () => {
    const { t } = this.props

    this.setState({ loading: true, message: t('core.account-listing') })
    try {
      let list = await CoreModule.listAccounts()
      if (list === '') {
        list = []
      } else {
        list = list.split(':')
      }
      this.setState({ list })
      return list
    } catch (error) {
      throw error
    }
  }

  start = async nickname => {
    const { t } = this.props

    this.setState({ loading: true, message: t('daemon.initializing') })
    try {
      await CoreModule.start(nickname)
    } catch (error) {
      throw error
    }
  }

  open = async nickname => {
    if (nickname == null) {
      await this.init()
      const list = await this.list()
      if (list.length <= 0) {
        const deviceName = defaultUsername()

        this.setState({ loading: false, message: null, nickname: deviceName })
        this.nicknameInput.blur()

        return
      }
      nickname = list[0]
    }
    await this.start(nickname)
    this.props.navigation.navigate('accounts/current')
  }

  async componentDidMount () {
    this.open()
  }

  async componentDidUpdate (nextProps) {
    if (nextProps.screenProps.deepLink !== this.props.screenProps.deepLink) {
      this.open(this.state.list[0])
    }
  }

  render () {
    const { t } = this.props
    const { loading, message, current } = this.state

    if (loading === true) {
      return <Loader message={message} />
    }
    if (current === null) {
      return (
        <Screen style={{ backgroundColor: colors.background, flex: 1 }}>
          <Flex.Cols align='center'>
            <View style={{ height: 320, padding: 20, backgroundColor: colors.background, width: '100%' }} >
              <Text style={{ color: colors.blue, textAlign: 'center', alignSelf: 'stretch', fontSize: 24 }} >{t('auth.welcome-to-berty')}</Text>
              <Text style={{ color: colors.blue, textAlign: 'center', alignSelf: 'stretch', marginTop: 5 }} >{t('auth.get-started')}</Text>
              <TextInput
                style={{ color: colors.fakeBlack, borderColor: colors.borderGrey, borderWidth: 1, marginTop: 10, padding: 10 }}
                placeholder={t('auth.nickname-placeholder')}
                ref={nicknameInput => {
                  this.nicknameInput = nicknameInput
                }}
                textContentType={'name'}
                onChangeText={nickname => this.setState({ nickname })}
                value={this.state.nickname}
              />
              <TouchableOpacity onPress={() => this.open(this.state.nickname)}>
                <Text style={{
                  color: colors.white,
                  backgroundColor: colors.blue,
                  textAlign: 'center',
                  fontSize: 18,
                  marginTop: 10,
                  padding: 8,
                }} >
                  {t('auth.lets-chat')}
                </Text>
              </TouchableOpacity>
            </View>
          </Flex.Cols>
        </Screen>
      )
    }
    return null
  }
}

export default withNamespaces()(Auth)
