import React from 'react'
import { Text } from 'react-native'
import { QrCode } from './ContactIdentity'

const QRCodeExport = ({ data }) => <>
  <Text>{data.displayName} is on Berty</Text>
  <QrCode data={data} />
</>

export default QRCodeExport
