import React, { PureComponent } from 'react'
import {
  Clipboard,
  TouchableOpacity,
  FlatList,
  Switch,
  TextInput,
} from 'react-native'
import { createSubStackNavigator } from '../../../../helpers/react-navigation'
import { Menu, Header, Text, Flex } from '../../../Library'
import { subscriptions } from '../../../../graphql'
import { colors } from '../../../../constants'
import { borderBottom, padding } from '../../../../styles'

const listRenderInterval = 500

class FilterModal extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='Log filters'
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
  updateConfig = undefined

  componentWillMount () {
    this.currentConfig = this.props.navigation.state.params.currentConfig
    this.newConfig = {
      compact: this.currentConfig.compact,
      filters: { ...this.currentConfig.filters },
    }
    this.updateConfig = this.props.navigation.state.params.updateConfig
  }

  updateCallback = () => {
    this.updateConfig(this.newConfig)
    this.props.navigation.goBack(null)
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
      this.newConfig.filters.message !== this.currentConfig.filters.message
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
        <Menu.Section title='Display mode' customMarginTop={24}>
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
          },
          padding,
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
              style={{ marginTop: 0.5 }}
            >
              <Text color={colors.black} left>
                {log.namespace}
              </Text>
              <Text color={colors.black} right>
                {log.topic}
              </Text>
            </Flex.Cols>
            <Flex.Cols style={{ marginTop: 2 }}>
              <Text multiline={!compact}>{log.message}</Text>
            </Flex.Cols>
            {compact === false && (
              <Flex.Cols style={{ marginTop: 2 }}>
                <Text right bold tiny>
                  {log.location}
                </Text>
              </Flex.Cols>
            )}
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
        rightBtnIcon={'filter'}
        onPressRightBtn={() =>
          navigation.push('devtools/logs/filter', {
            updateConfig: navigation.state.params.updateConfig,
            currentConfig: navigation.state.params.currentConfig,
          })
        }
        backBtn
      />
    ),
  })

  componentWillMount () {
    this.logStream = subscriptions.logStream({
      continues: true,
      logLevel: '',
      namespaces: '',
      last: 0,
    })
    this.logStream.start()
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
  }

  timer = undefined
  updateCounter = 0

  addToList = line => {
    let parsed = this.parseLog(line)

    this.logs.unshift(parsed)
    if (this.filterLog(parsed)) {
      this.state.filtered.unshift(parsed)
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
    this.currentConfig = config
    this.props.navigation.setParams({
      currentConfig: this.currentConfig,
    })

    let filtered = this.logs.filter(log => this.filterLog(log))
    this.setState({ filtered: filtered })
    this.updateList()
  }

  filterLog = line => {
    let filters = this.currentConfig.filters

    if (
      (filters.debug && line.level === 'DEBUG') ||
      (filters.info && line.level === 'INFO') ||
      (filters.warn && line.level === 'WARN') ||
      (filters.error && line.level === 'ERROR')
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
    let fields = line.split('\t')
    let level = this.parseLevel(fields[1])

    return {
      date: this.datePrettier(fields[0]),
      level: level,
      color: this.setLevelColor(level),
      namespace: fields[2],
      location: fields[3],
      topic: fields[4],
      message: fields.slice(5, fields.length).toString(),
    }
  }

  parseLevel = level => {
    return level.replace(
      // eslint-disable-next-line
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
      ''
    )
  }

  setLevelColor = level => {
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

  datePrettier = rawDate => {
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

  render () {
    return (
      <FlatList
        initialNumToRender={20}
        maxToRenderPerBatch={5}
        data={this.state.filtered}
        extraData={this.updateCounter}
        renderItem={log => (
          <Line log={log.item} compact={this.currentConfig.compact} />
        )}
      />
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
