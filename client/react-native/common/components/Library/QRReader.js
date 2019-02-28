import React, { PureComponent } from 'react'
import QRCodeScanner from 'react-native-qrcode-scanner'

class QRReader extends PureComponent {
  reactivate () {
    this.scanner.reactivate()
  }

  render () {
    const { onFound, style, cameraStyle } = this.props

    return <QRCodeScanner
      onRead={event => onFound(event.data)}
      onError={error => {
        console.error(error)
      }}
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
  }
}

export default QRReader
