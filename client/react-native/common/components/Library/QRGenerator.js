import React  from 'react'
import QRCode from 'react-native-qrcode-svg'
import { View } from 'react-native'

export default ({ value, ecl = 'L', size, style }) => <>
  <View style={[{ width: size, height: size }, ...(style || [])]}>
    <QRCode size={size} value={value} ecl={ecl} />
  </View>
</>
