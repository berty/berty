import { Linking } from 'react-native'
import React from 'react'
import hoistNonReactStatics from 'hoist-non-react-statics'

import { BASE_WEBSITE_URL } from '../constants'
import { parse as parseUrl } from './url'

export const withDeepLinkHandler = Component => {
  class DeepLinkHandler extends Component {
    initialState = {
      routeName: 'switch/main',
      params: {},
    }

    state = this.initialState

    handleOpenURL = event => {
      let url = parseUrl(
        event.url.replace('berty://berty.chat/', `${BASE_WEBSITE_URL}/`)
      )
      switch (url.pathname) {
        case '/chats/detail':
          if (url.hashParts['id']) {
            // TODO: remove that part when we'll have get rid of graphql/relay
            url.hashParts['id'] = btoa(`conversation:${url.hashParts['id']}`)
          }
          this.setState({
            routeName: 'chats/detail',
            params: url.hashParts,
          })
          break
        case '/id':
          this.setState({
            routeName: 'modal/contacts/card',
            params: url.hashParts,
          })
          break
        default:
          console.warn(`Unhandled deep link, URL: ${event.url}`)
          break
      }
    }

    clearDeepLink = () => {
      this.setState(this.initialState)
    }

    setDeepLink = deepLink => this.setState(deepLink)

    componentDidMount() {
      Linking.addEventListener('url', this.handleOpenURL)

      Linking.getInitialURL()
        .then(url => {
          if (url !== null) {
            this.handleOpenURL({ url })
          }
        })
        .catch(() => {})
    }

    componentWillUnmount() {
      Linking.removeEventListener('url', this.handleOpenURL)
    }

    render() {
      return (
        <Component
          {...this.props}
          deepLinkHandler={{
            deepLink: this.state,
            setDeepLink: deepLink => this.setDeepLink(deepLink),
            clearDeepLink: () => this.clearDeepLink(),
          }}
        />
      )
    }
  }

  return hoistNonReactStatics(DeepLinkHandler, Component)
}

export default withDeepLinkHandler
