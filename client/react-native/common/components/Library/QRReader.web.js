import React, { PureComponent } from 'react'
import QrReader from 'react-qr-reader'

class QRReader extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      enabled: true,
    }
  }

  render () {
    const { onFound, style } = this.props

    return <QrReader
      delay={300}
      onScan={(data) => {
        if (this.state.enabled && data) {
          onFound(data)
          this.setState({ enabled: false })
        }
      }}
      onError={error => {
        console.error(error)
      }}
      style={style}
      showViewFinder={false}
    />
  }

  reactivate () {
    this.setState({ enabled: true })
  }
}

export default QRReader
