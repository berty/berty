import React from 'react'
import QRCodeScanner from 'react-native-qrcode-scanner'

const QRReader = ({ onFound, style }) => <QRCodeScanner
  onRead={event => onFound(event.data)}
  onError={error => {
    console.error(error)
  }}
  containerStyle={style}
  topViewStyle={{
    flex: 0,
    width: 0,
    height: 0,
  }}
  bottomViewStyle={{
    flex: 0,
    width: 0,
    height: 0,
  }}
  cameraStyle={{ flex: 1, width: undefined, height: undefined, overflow: 'hidden' }}
  fadeIn={false}
/>

export default QRReader
