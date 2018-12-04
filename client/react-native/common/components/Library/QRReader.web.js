import React from 'react'
import QrReader from 'react-qr-reader'

const QRReader = ({ onFound, style }) => <QrReader
  onScan={onFound}
  onError={error => {
    console.error(error)
  }}
  style={style}
  showViewFinder={false}
/>

export default QRReader
