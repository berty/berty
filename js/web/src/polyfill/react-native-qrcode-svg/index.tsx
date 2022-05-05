import React, { FC } from 'react'
import ImportedQRCode, { QRCodeProps } from '../../../../node_modules/react-native-qrcode-svg' // import from original react-native-qrcode-svg

const QRCode: FC<QRCodeProps> = ({ logo, mode, ...props }) => <ImportedQRCode {...props} />

export default QRCode
