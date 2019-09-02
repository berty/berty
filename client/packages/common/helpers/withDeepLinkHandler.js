import { Linking } from 'react-native'
import React from 'react'

import { BASE_WEBSITE_URL } from '../constants'
import { parse as parseUrl } from './url'

import { withHOC } from './views'
import { withNavigation } from 'react-navigation'

export const withDeepLinkHandler = Component =>
  withHOC(
    withNavigation(
      class WithDeepLinkHandler extends React.PureComponent {
        handleOpenURL = event => {
          let url = parseUrl(
            event.url.replace('berty://berty.chat/', `${BASE_WEBSITE_URL}/`)
          )
          switch (url.pathname) {
            case '/chats/detail':
              this.props.navigation.navigate('chats/detail', url.hashParts)
              break
            case '/id':
              this.props.navigation.navigate('modal/contacts/card', {
                id: url.hashParts.key,
                displayName: url.hashParts.name,
              })
              break
            default:
              console.warn(`Unhandled deep link, URL: ${event.url}`)
              break
          }
        }

        componentDidMount() {
          Linking.addEventListener('url', this.handleOpenURL)

          Linking.getInitialURL()
            .then(url => url != null && this.handleOpenURL({ url }))
            .catch(console.error)
        }

        componentWillUnmount() {
          Linking.removeEventListener('url', this.handleOpenURL)
        }

        render() {
          return <Component {...this.props} />
        }
      }
    )
  )(Component)

export default withDeepLinkHandler
