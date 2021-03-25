import React, { Suspense } from 'react'
import { ActivityIndicator } from 'react-native'
import QRCode, { QRCodeProps } from 'react-native-qrcode-svg'

const LazyQRCode: React.FC<QRCodeProps> = (props) => {
	return (
		<Suspense fallback={<ActivityIndicator />}>
			<QRCode {...props} />
		</Suspense>
	)
}

export default LazyQRCode
