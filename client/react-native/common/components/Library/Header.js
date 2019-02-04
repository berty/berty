import { View } from 'react-native'
import React, { PureComponent } from 'react'
import { Button, Flex, Text, SearchBar } from '.'
import { colors } from '../../constants'
import { padding, borderBottom, paddingBottom } from '../../styles'
import { isRTL } from '../../i18n'
import RelayContext from '../../relay/RelayContext'
import { promiseWithTimeout } from 'react-relay-network-modern/es/middlewares/retry'

const [defaultTextColor, defaultBackColor] = [colors.black, colors.white]

const HeaderButton = ({ icon, color, style, ...otherProps }) => {
  return <Button icon={icon} large color={color} {...otherProps} />
}

class StateBadge extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      watchTime: 10000,
      listenAddrs: [],
      listenInterfaceAddrs: [],
      timeouted: false,
      requestTimeout: 3000,
      listenAddrTimer: null,
      InterfaceAddrTimer: null,
      bertyColor: colors.lightGrey,
      bleColor: colors.lightGrey,
      bgBertyColor: colors.inputGrey,
      bgBleColor: colors.inputGrey,
      bleText: 'off',
      bertyText: 'no daemon',
      peers: [],
    }
  }

  componentDidMount () {
    this.fetchListenAddrs()
    this.fetchListenInterfaceAddrs()

    this.fetchPeers()
    this.subscriber = this.props.context.subscriptions.monitorPeers.subscribe(
      {
        iterator: undefined,
        updater: (store, data) => {
          const peer = data.MonitorPeers
          this.addPeer(peer)
        },
      }
    )
  }

  componentWillUnmount () {
    const { listenAddrTimer, InterfaceAddrTimer } = this.state

    if (listenAddrTimer !== null) {
      clearTimeout(listenAddrTimer)
    }

    if (InterfaceAddrTimer !== null) {
      clearTimeout(InterfaceAddrTimer)
    }

    this.subscriber.unsubscribe()
  }

  timeoutPromise = () => {
    return new Promise((resolve, reject) => {
      this.setState({ timeouted: true }, this.setColor)
      reject(new Error('Request timed out'))
    })
  }

  addPeer = (peer) => {
    this.setState(prevState => ({
      peers: [...prevState.peers.filter(p => p.id !== peer.id), peer],
    }))
  }

  fetchPeers = () => {
    this.props.context.queries.Peers.fetch().then(data =>
      this.setState({ peers: data.list })
    )
  }

  fetchListenAddrs = () => {
    const { context } = this.props
    const { watchTime, requestTimeout, timeouted } = this.state

    promiseWithTimeout(context.queries.GetListenAddrs.fetch(), requestTimeout, this.timeoutPromise).then(e => {
      const timer = setTimeout(this.fetchListenAddrs, watchTime)

      // if we previously timeouted we need to refetch peers
      if (timeouted === true) {
        this.fetchPeers()
      }

      this.setState({ listenAddrs: e.addrs, timeouted: false, listenAddrTimer: timer }, this.setColor)
    }).catch(err => {
      const timer = setTimeout(this.fetchListenAddrs, watchTime)
      this.setState({ listenAddrTimer: timer, peers: [], timeouted: true, listenAddrs: [] })
      console.log('err listen address', err)
    })
  }

  fetchListenInterfaceAddrs = () => {
    const { context } = this.props
    const { watchTime, requestTimeout, timeouted } = this.state

    promiseWithTimeout(context.queries.GetListenInterfaceAddrs.fetch(), requestTimeout, this.timeoutPromise).then(e => {
      const timer = setTimeout(this.fetchListenInterfaceAddrs, watchTime)

      // if we previously timeouted we need to refetch peers
      if (timeouted === true) {
        this.fetchPeers()
      }

      this.setState({ listenInterfaceAddrs: e.addrs, timeouted: false, InterfaceAddrTimer: timer }, this.setColor)
    }).catch(err => {
      const timer = setTimeout(this.fetchListenInterfaceAddrs, watchTime)
      this.setState({ InterfaceAddrTimer: timer, peers: [], timeouted: true, listenInterfaceAddrs: [] }, this.setColor)
      console.log('err Listen address', err)
    })
  }

  setColor = () => {
    const { listenAddrs, listenInterfaceAddrs, timeouted } = this.state
    let bertyColor = colors.orange
    let bgBertyColor = colors.orange25
    let bertyText = 'connecting'
    let bleColor = colors.lightGrey
    let bgBleColor = colors.inputGrey
    let bleText = 'off'

    if (listenAddrs.length > 0 && listenInterfaceAddrs.length > 0) {
      listenInterfaceAddrs.forEach((v, i, arr) => {
        try {
          const splited = v.split('/')
          if (splited[1] === 'ip4' && splited[2] !== '127.0.0.1') {
            bertyColor = colors.green
            bgBertyColor = colors.green25
            bertyText = 'connected'
          }
          if (splited[1] === 'ble' && splited[2] !== '00000000-0000-0000-0000-000000000000') {
            bleColor = colors.green
            bgBleColor = colors.green25
            bleText = 'on'
          }
        } catch (e) {
          // Silence error since /p2p-circuit isn't valid
          // console.log(e)
        }
      })
    }

    if (timeouted) {
      bertyColor = colors.pink
      bgBertyColor = colors.pink25
      bertyText = 'no daemon'
    }
    this.setState({ bertyColor, bgBertyColor, bertyText, bleText, bleColor, bgBleColor })
  }

  getPeersColor = (peers) => {
    if (peers.length > 0) {
      return {
        bgPeerColor: colors.blue25,
        peerColor: colors.blue,
      }
    }
    return {
      bgPeerColor: colors.inputGrey,
      peerColor: colors.lightGrey,
    }
  }

  render () {
    const { bertyColor, bleColor, bleText, bertyText, peers, bgBertyColor, bgBleColor } = this.state
    const { bgPeerColor, peerColor } = this.getPeersColor(peers)
    const count = peers.reduce((acc, cur) => cur.connection === 1 ? acc + 1 : acc, 0)

    return (
      <Flex.Cols size={1} style={{ top: 0, right: 40 }} >
        <View style={{ marginRight: 2 }} >
          <Text icon='berty-berty_picto' size={5} padding={5} rounded small background={bgBertyColor} color={bertyColor}>{bertyText.toLocaleUpperCase()}</Text>
        </View>
        <View style={{ marginRight: 2 }} >
          <Text icon='berty-chart-network-solid' size={5} padding={5} rounded small background={bgPeerColor} color={peerColor}>{count.toString()}</Text>
        </View>
        <View style={{ marginRight: 2 }} >
          <Text icon='bluetooth' size={5} padding={5} rounded small background={bgBleColor} color={bleColor}>{bleText.toLocaleUpperCase()}</Text>
        </View>
      </Flex.Cols>
    )
  }
}

export default class Header extends PureComponent {
  render () {
    const {
      navigation,
      title,
      titleIcon,
      backBtn,
      rightBtn,
      rightBtnIcon,
      onPressRightBtn,
      searchBar,
      searchHandler,
    } = this.props

    const colorText =
      this.props.colorText == null ? defaultTextColor : this.props.colorText
    const colorBack =
      this.props.colorBack == null ? defaultBackColor : this.props.colorBack
    const colorBtnLeft =
      this.props.colorBtnLeft == null
        ? defaultTextColor
        : this.props.colorBtnLeft
    const colorBtnRight =
      this.props.colorBtnRight == null
        ? defaultTextColor
        : this.props.colorBtnRight

    let searchBarComponent = null
    if (searchBar === true) {
      searchBarComponent = (
        <SearchBar onChangeText={text => searchHandler(text)} />
      )
    } else if (searchBar !== undefined && searchBar !== false) {
      searchBarComponent = searchBar
    }

    // todo calc height in function of dev status bar and search bar
    // let height

    return (
      <View
        style={[
          {
            backgroundColor: colorBack,
            height: searchBar && true ? 110 : 70,
          },
          borderBottom,
          padding,
        ]}
      >
        <Flex.Rows>
          <Flex.Cols
            size={1}
            justify='between'
            align='center'
            style={[ searchBar ? paddingBottom : {} ]}
          >
            {backBtn && (
              <HeaderButton
                icon='arrow-left'
                color={colorBtnLeft}
                onPress={() => {
                  if (typeof backBtn === 'function') {
                    backBtn()
                  }
                  navigation.goBack(null)
                }}
                flip={isRTL()}
                justify='start'
                middle
              />
            )}
            <Text
              icon={titleIcon}
              left
              large
              color={colorText}
              justify={backBtn ? 'center' : 'start'}
              middle
              size={5}
            >
              {title}
            </Text>
            <View style={[ !searchBar ? paddingBottom : {} ]} >
              <RelayContext.Consumer>
                {context => <StateBadge context={context} />}
              </RelayContext.Consumer>
            </View>
            {rightBtn ? <View>{rightBtn}</View> : null}
            {!rightBtn &&
              rightBtnIcon !== null && (
              <HeaderButton
                icon={rightBtnIcon}
                color={colorBtnRight}
                onPress={onPressRightBtn}
                justify='end'
                middle
              />
            )}
          </Flex.Cols>
          {searchBarComponent}
        </Flex.Rows>
      </View>
    )
  }
}

Header.HeaderButton = HeaderButton
