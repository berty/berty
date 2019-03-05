import { View, Dimensions } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { withNamespaces } from 'react-i18next'
import { withOrientation } from 'react-navigation'
import React, { PureComponent } from 'react'

import { parse as parseUrl } from '../../../../helpers/url'
import { showContactModal } from '../../../../helpers/contacts'
import QRReader from '../../../Library/QRReader'
import RelayContext from '../../../../relay/RelayContext'
import colors from '../../../../constants/colors'

class ByQRCode extends PureComponent {
  reactivate () {
    this.scanner.reactivate()
  }

  render () {
    const { t } = this.props

    const size = Math.min(
      Dimensions.get('window').width,
      Dimensions.get('window').height
    )

    return (
      <RelayContext.Consumer>
        {relayContext => (
          <View
            style={{
              backgroundColor: colors.constantBlack,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <QRReader
              style={{
                height: size,
                width: size,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              ref={scanner => {
                this.scanner = scanner
              }}
              cameraStyle={{ height: size, width: size }}
              onFound={async data => {
                const url = parseUrl(data)

                if (!url || url.pathname !== '/contacts/add') {
                  showMessage({
                    message: t('contacts.add.qrcode-not-from-berty'),
                    type: 'danger',
                    position: 'top',
                    icon: 'danger',
                  })
                  setTimeout(() => this.reactivate(), 2000)

                  return
                }

                await showContactModal({
                  relayContext,
                  beforeDismiss: () => this.reactivate(),
                  data: {
                    id: url.hashParts['id'],
                    displayName: url.hashParts['display-name'] || '',
                  },
                })
              }}
            />
          </View>
        )}
      </RelayContext.Consumer>
    )
  }
}

export default withNamespaces()(withOrientation(ByQRCode))
