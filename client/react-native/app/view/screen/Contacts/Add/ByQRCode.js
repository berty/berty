import { View, Dimensions } from 'react-native'
import { showMessage } from 'react-native-flash-message'
import { withNamespaces } from 'react-i18next'
import { withOrientation, withNavigation } from 'react-navigation'
import React, { PureComponent } from 'react'

import { withStoreContext } from '@berty/store/context'
import { parse as parseUrl } from '@berty/common/helpers/url'
import QRReader from '@berty/component/QRReader'
import colors from '@berty/common/constants/colors'

@withNavigation
@withStoreContext
class ByQRCode extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      scanner: null,
    }
  }

  setScanner = scanner => {
    this.setState({ scanner })
  }

  reactivate() {
    const { scanner } = this.state
    if (scanner !== null) {
      scanner.reactivate()
    }
  }

  render() {
    const { t, navigation } = this.props

    const size = Math.min(Dimensions.get('window').height)

    return (
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
          setScanner={this.setScanner}
          cameraStyle={{ height: size, width: size }}
          onFound={async data => {
            const url = parseUrl(data)

            if (!url || url.pathname !== '/id') {
              showMessage({
                message: t('contacts.add.qrcode-not-from-berty'),
                type: 'danger',
                position: 'top',
                icon: 'danger',
              })
              setTimeout(() => this.reactivate(), 2000)

              return
            }
            navigation.navigate('modal/contacts/card', {
              id: url.hashParts['key'],
              displayName: url.hashParts['name'] || '',
            })
          }}
        />
      </View>
    )
  }
}

export default withNamespaces()(withOrientation(ByQRCode))
