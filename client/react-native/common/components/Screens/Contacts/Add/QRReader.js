import React, { PureComponent } from 'react'
import QrReader from 'react-qr-reader'

export default class QRReader extends PureComponent {
  render () {
    return (
      <QrReader
        delay={300}
        onScan={(data) => { console.log(data) }}
        onError={(error) => { console.error(error) }}
        style={{ width: '90%', backgroundColor: 'black' }}
        showViewFinder={false}
      />
    )
  }
}
