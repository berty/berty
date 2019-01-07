import {
  Clipboard,
  TouchableOpacity,
  FlatList,
  Switch,
  TextInput,
  View,
  ActivityIndicator,
  Linking,
} from 'react-native'
import React, { PureComponent } from 'react'

import { Menu, Header, Text, Flex } from '../../../Library'
import { borderBottom } from '../../../../styles'
import { colors } from '../../../../constants'
import { createSubStackNavigator } from '../../../../helpers/react-navigation'

const listRenderInterval = 500
var maxDisplaySize = 300
var maxBufferSize = 10000

var antispamModalOpen = false
var antispamModalSave = false

class FilterModal extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='Log settings'
        titleIcon='settings'
        rightBtnIcon={'save'}
        onPressRightBtn={
          navigation.state.params && navigation.state.params.updateCallback
        }
        backBtn
      />
    ),
  })

  currentConfig = undefined
  newConfig = undefined
  newMaxDisplaySize = undefined
  newMaxBufferSize = undefined

  antispamTimer = undefined

  componentWillMount () {
    this.currentConfig = this.props.navigation.state.params.currentConfig
    this.newConfig = {
      compact: this.currentConfig.compact,
      filters: { ...this.currentConfig.filters },
    }
    this.newMaxDisplaySize = maxDisplaySize
    this.newMaxBufferSize = maxBufferSize
  }

  componentDidMount () {
    this.antispamTimer = setTimeout(() => {
      antispamModalOpen = false
    }, 2000)
  }

  componentWillUnmount () {
    clearTimeout(this.antispamTimer)
    antispamModalOpen = false
  }

  updateCallback = () => {
    if (!antispamModalSave) {
      antispamModalSave = true
      this.props.navigation.goBack(null)
      maxDisplaySize = parseInt(this.newMaxDisplaySize, 10)
      maxBufferSize = parseInt(this.newMaxBufferSize, 10)
      this.props.navigation.state.params.updateConfig(this.newConfig)
    }
  }

  hasConfigChanged = () => {
    if (
      this.newConfig.compact !== this.currentConfig.compact ||
      this.newConfig.filters.debug !== this.currentConfig.filters.debug ||
      this.newConfig.filters.info !== this.currentConfig.filters.info ||
      this.newConfig.filters.warn !== this.currentConfig.filters.warn ||
      this.newConfig.filters.error !== this.currentConfig.filters.error ||
      this.newConfig.filters.namespace !==
        this.currentConfig.filters.namespace ||
      this.newConfig.filters.message !== this.currentConfig.filters.message ||
      parseInt(this.newMaxDisplaySize, 10) !== maxDisplaySize ||
      parseInt(this.newMaxBufferSize, 10) !== maxBufferSize
    ) {
      this.props.navigation.setParams({
        updateCallback: this.updateCallback,
      })
    } else {
      this.props.navigation.setParams({
        updateCallback: undefined,
      })
    }
  }

  render () {
    return (
      <Menu>
        <Menu.Section title='Display & history' customMarginTop={24}>
          <Menu.Item
            title='Compact logs'
            customRight={
              <Switch
                justify='end'
                value={this.newConfig.compact}
                onValueChange={value => {
                  this.newConfig.compact = value
                  this.hasConfigChanged()
                }}
              />
            }
          />
          <Menu.Item
            title='Display max size'
            customRight={
              <TextInput
                justify='end'
                size={12}
                style={{
                  borderBottomWidth: 0.5,
                  borderBottomColor: '#d6d7da',
                  paddingLeft: 8,
                  paddingRight: 8,
                  paddingBottom: 2,
                }}
                value={this.newMaxDisplaySize.toString()}
                onChangeText={text => {
                  let num = parseInt(text, 10) || 0
                  num = num >= 0 ? num : num * -1
                  this.newMaxDisplaySize = num.toString()
                  this.hasConfigChanged()
                }}
              />
            }
          />
          <Menu.Item
            title='History max size'
            customRight={
              <TextInput
                justify='end'
                size={12}
                style={{
                  borderBottomWidth: 0.5,
                  borderBottomColor: '#d6d7da',
                  paddingLeft: 8,
                  paddingRight: 8,
                  paddingBottom: 2,
                }}
                value={this.newMaxBufferSize.toString()}
                onChangeText={text => {
                  let num = parseInt(text, 10) || 0
                  num = num >= 0 ? num : num * -1
                  num =
                    num < this.newMaxDisplaySize ? this.newMaxDisplaySize : num
                  this.newMaxBufferSize = num.toString()
                  this.hasConfigChanged()
                }}
              />
            }
          />
        </Menu.Section>
        <Menu.Section title='Level filtering'>
          <Menu.Item
            title='Debug'
            customRight={
              <Switch
                justify='end'
                value={this.newConfig.filters.debug}
                onValueChange={value => {
                  this.newConfig.filters.debug = value
                  this.hasConfigChanged()
                }}
              />
            }
          />
          <Menu.Item
            title='Info'
            customRight={
              <Switch
                justify='end'
                value={this.newConfig.filters.info}
                onValueChange={value => {
                  this.newConfig.filters.info = value
                  this.hasConfigChanged()
                }}
              />
            }
          />
          <Menu.Item
            title='Warn'
            customRight={
              <Switch
                justify='end'
                value={this.newConfig.filters.warn}
                onValueChange={value => {
                  this.newConfig.filters.warn = value
                  this.hasConfigChanged()
                }}
              />
            }
          />
          <Menu.Item
            title='Error'
            customRight={
              <Switch
                justify='end'
                value={this.newConfig.filters.error}
                onValueChange={value => {
                  this.newConfig.filters.error = value
                  this.hasConfigChanged()
                }}
              />
            }
          />
        </Menu.Section>
        <Menu.Section title='Regex filtering'>
          <Menu.Item
            title='Namespace'
            customRight={
              <TextInput
                justify='end'
                size={30}
                placeholder='ex: core\.*'
                style={{
                  borderBottomWidth: 0.5,
                  borderBottomColor: '#d6d7da',
                  paddingLeft: 8,
                  paddingRight: 8,
                  paddingBottom: 2,
                }}
                value={this.newConfig.filters.namespace}
                onChangeText={text => {
                  this.newConfig.filters.namespace = text
                  this.hasConfigChanged()
                }}
              />
            }
          />
          <Menu.Item
            title='Message'
            customRight={
              <TextInput
                justify='end'
                size={30}
                placeholder='ex: \&quot;dial backoff\&quot;'
                style={{
                  borderBottomWidth: 0.5,
                  borderBottomColor: '#d6d7da',
                  paddingLeft: 8,
                  paddingRight: 8,
                  paddingBottom: 2,
                }}
                value={this.newConfig.filters.message}
                onChangeText={text => {
                  this.newConfig.filters.message = text
                  this.hasConfigChanged()
                }}
              />
            }
          />
          <Menu.Item
            title='Online JS regex tester'
            color={colors.blue}
            onPress={() => Linking.openURL('https://regexr.com/')}
          />
        </Menu.Section>
      </Menu>
    )
  }
}

class Line extends PureComponent {
  render () {
    const { log, compact } = this.props
    return (
      <TouchableOpacity
        onPress={() => {
          Clipboard.setString(log.message)
        }}
        style={[
          {
            backgroundColor: colors.white,
            paddingHorizontal: compact ? 8 : 16,
            paddingVertical: compact ? 4 : 12,
          },
          borderBottom,
        ]}
      >
        <Flex.Cols align='center'>
          <Flex.Rows align='stretch' justify='center'>
            <Flex.Cols>
              <Text left bold color={colors.black}>
                {log.date}
              </Text>
              <Text right bold color={log.color}>
                {log.level}
              </Text>
            </Flex.Cols>
            <Flex.Cols
              justify='space-between'
              align='stretch'
              style={{ marginTop: compact ? 0 : 0.5 }}
            >
              <Text
                multiline={compact ? 1 : true}
                color={colors.grey3}
                tiny
                bold
                left
              >
                {log.namespace}
              </Text>
              <Text
                multiline={compact ? 1 : true}
                color={colors.grey3}
                tiny
                bold
                right
              >
                {log.caller}
              </Text>
            </Flex.Cols>
            <Flex.Cols style={{ marginTop: compact ? 0 : 2 }}>
              <Text left multiline={compact ? 1 : true}>
                {log.message}
              </Text>
            </Flex.Cols>
          </Flex.Rows>
        </Flex.Cols>
      </TouchableOpacity>
    )
  }
}

class LogStream extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='Console logs'
        titleIcon='file-text'
        rightBtnIcon={'settings'}
        onPressRightBtn={() => {
          if (!antispamModalOpen) {
            antispamModalOpen = true
            navigation.navigate('devtools/logs/filter', {
              updateConfig: navigation.state.params.updateConfig,
              currentConfig: navigation.state.params.currentConfig,
            })
          }
        }}
        backBtn
      />
    ),
  })

  componentWillMount () {
    this.logStream = this.props.screenProps.context.subscriptions.logStream({
      continues: true,
      logLevel: '',
      namespaces: '',
      last: 0,
    })
  }

  componentDidMount () {
    this.subscriber = this.logStream.subscribe({
      updater: (store, data) => {
        this.addToList(data.LogStream.line)
      },
    })
    this.props.navigation.setParams({
      updateConfig: this.updateConfig,
      currentConfig: this.currentConfig,
    })
  }

  componentWillUnmount () {
    clearTimeout(this.timer)
    this.subscriber.unsubscribe()
  }

  logs = []
  state = {
    filtered: [],
    loading: true,
  }

  timer = undefined
  updateCounter = 0

  addToList = line => {
    let parsed = this.parseLog(line)

    this.logs.unshift(parsed)
    if (this.logs.length > maxBufferSize) {
      this.logs.pop()
    }

    if (this.filterLog(parsed)) {
      this.state.filtered.unshift(parsed)
      if (this.state.filtered.length > maxDisplaySize) {
        this.state.filtered.pop()
      }
    }

    if (this.timer === undefined) {
      this.timer = setTimeout(this.updateList, listRenderInterval)
    }
  }

  updateList = () => {
    clearTimeout(this.timer)
    this.timer = undefined
    this.forceUpdate()
    this.updateCounter++
    this.setState({ loading: false })
  }

  currentConfig = {
    compact: false,
    filters: {
      debug: true,
      info: true,
      warn: true,
      error: true,
      namespace: '',
      message: '',
    },
  }

  updateConfig = config => {
    this.setState({ loading: true })
    this.currentConfig = config
    this.props.navigation.setParams({
      currentConfig: this.currentConfig,
    })

    if (this.logs.length > maxBufferSize) {
      this.logs = this.logs.slice(0, maxBufferSize)
    }

    let filtered = this.logs.filter(log => this.filterLog(log))
    if (filtered.length > maxDisplaySize) {
      filtered = filtered.slice(0, maxDisplaySize)
    }

    this.setState({ filtered: filtered })
    this.updateList()
    antispamModalSave = false
  }

  filterLog = line => {
    let filters = this.currentConfig.filters

    if (
      (filters.debug && line.level === 'DEBUG') ||
      (filters.info && line.level === 'INFO') ||
      (filters.warn && line.level === 'WARN') ||
      (filters.error && line.level === 'ERROR') ||
      line.level === 'UNKNOWN'
    ) {
      if (
        (filters.namespace.trim() === '' ||
          line.namespace.match(filters.namespace) !== null) &&
        (filters.message.trim() === '' ||
          line.message.match(filters.message) !== null)
      ) {
        return true
      }
    }
    return false
  }

  parseLog = line => {
    function getValAndDeleteKey (key) {
      let value = lineObject[key]
      delete lineObject[key]
      return value
    }

    function setLevelColor (level) {
      switch (level) {
        case 'DEBUG':
          return colors.debug
        case 'INFO':
          return colors.info
        case 'WARN':
          return colors.warning
        case 'ERROR':
          return colors.error
        default:
          return colors.black
      }
    }

    function datePrettier (rawDate) {
      let date = new Date(rawDate)
      return (
        date.getMonth() +
        1 +
        '/' +
        date.getDate() +
        ' ' +
        date.getHours() +
        ':' +
        date.getMinutes() +
        ':' +
        date.getSeconds() +
        '.' +
        date.getMilliseconds()
      )
    }

    let lineObject = JSON.parse(line)

    let logObject = {
      date: datePrettier(getValAndDeleteKey('T')) || 'Unknown',
      level: lineObject.L || 'UNKNOWN',
      color: setLevelColor(getValAndDeleteKey('L')),
      namespace: getValAndDeleteKey('N') || 'Unknown',
      caller: getValAndDeleteKey('C') || 'Unknown',
      message: getValAndDeleteKey('M') || 'Empty message',
    }

    let trailingJson = JSON.stringify(lineObject)
    if (trailingJson !== JSON.stringify({})) {
      logObject.message += ' ' + trailingJson
    }

    return logObject
  }

  render () {
    return (
      <View style={{ flex: 1, backgroundColor: colors.white }}>
        {this.state.loading && (
          <Flex.Cols align='center'>
            <Flex.Rows>
              <ActivityIndicator size='large' />
            </Flex.Rows>
          </Flex.Cols>
        )}
        <FlatList
          initialNumToRender={20}
          maxToRenderPerBatch={5}
          data={this.state.filtered}
          extraData={this.updateCounter}
          keyExtractor={this.keyExtractor}
          renderItem={(log, index) => (
            <Line
              key={index}
              log={log.item}
              compact={this.currentConfig.compact}
            />
          )}
        />
      </View>
    )
  }
}

export default createSubStackNavigator(
  {
    'devtools/logs/list': LogStream,
    'devtools/logs/filter': FilterModal,
  },
  {
    mode: 'modal',
    initialRouteName: 'devtools/logs/list',
  }
)
