import React, { PureComponent } from 'react'
import QRCode from 'qrcode-react'

export default class QRGenerator extends PureComponent {
  render () {
    const { value, logo, size, logoWidth } = this.props
    return (
      <QRCode value={value} logo={logo} size={size} logoWidth={logoWidth} />
    )
  }
}
