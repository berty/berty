import React, { PureComponent } from 'react'
import { View, Text, Button, NativeModules, Platform } from 'react-native'
import { withNamespaces } from 'react-i18next'
import QRCodeScanner from 'react-native-qrcode-scanner'
import Permissions from 'react-native-permissions'

import colors from '../../constants/colors'

export const permissionsStatus = {
  notDetermined: 'undetermined',
  denied: 'denied',
  authorized: 'authorized',
  restricted: 'restricted',
}

const { CoreModule } = NativeModules
class QRReader extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      permStatus: permissionsStatus.notDetermined,
      onPress: () => {},
    }
  }

  componentWillMount () {
    Permissions.check('camera').then(this.setStatus)
  }

  setStatus = (permStatus) => {
    const onPress = Platform.OS === 'ios' && permStatus === permissionsStatus.denied
      ? () => CoreModule.openSettings()
      : () => Permissions.request('camera').then(this.setStatus)

    this.setState({ permStatus, onPress })
  }

  reactivate () {
    this.scanner.reactivate()
  }

  render () {
    const { t, onFound, style, cameraStyle } = this.props
    const { permStatus, onPress } = this.state

    return permStatus === permissionsStatus.authorized ? (
      <QRCodeScanner
        onRead={event => onFound(event.data)}
        onError={error => {
          console.error(error)
        }}
        cameraProps={{ captureAudio: false }}
        ref={(scanner) => { this.scanner = scanner }}
        containerStyle={style}
        topViewStyle={{
          width: 0,
          height: 0,
        }}
        bottomViewStyle={{
          width: 0,
          height: 0,
        }}
        cameraStyle={cameraStyle || {}}
        fadeIn={false}
        showMarker
      />
    ) : (
      <View style={{ flexDirection: 'column' }}>
        <View style={{ flexGrow: 1, flexDirection: 'row', alignSelf: 'center', marginBottom: 10, alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 24, color: colors.white }}>
            {t('contacts.add.qrcode-camera-ask-title')}
          </Text>
        </View>
        <Text style={{ flexGrow: 0, fontSize: 18, textAlign: 'center', marginRight: 10, marginLeft: 10, color: colors.lightGrey }}>
          {t('contacts.add.qrcode-camera-ask-text')}
        </Text>
        <View style={{ flexGrow: 1 }}>
          <Button onPress={onPress} title={t('contacts.add.qrcode-camera-ask-button')} />
        </View>
      </View>
    )
  }
}

export default withNamespaces()(QRReader)
