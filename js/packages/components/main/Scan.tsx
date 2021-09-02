import React, { useState } from 'react'
import { View, TextInput, Button, Vibration, Text as TextNative, StatusBar } from 'react-native'
import { Layout } from '@ui-kitten/components'
import QRCodeScanner from 'react-native-qrcode-scanner'
import { useNavigation } from '@react-navigation/native'

import { useThemeColor } from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'

import ScanTarget from './scan_target.svg'

//
// Scan => Scan QrCode of an other contact
//

// Types
type ScanInfosTextProps = {
	textProps: string
}

// Styles

const useStylesScan = () => {
	const [{ border, height, width }, { fontScale, scaleSize }] = useStyles()
	return {
		titleSize: 26 * fontScale,
		styles: {
			infosPoint: [
				width(10 * scaleSize),
				height(10 * scaleSize),
				border.radius.scale(5 * scaleSize),
			],
		},
	}
}

const ScanBody: React.FC<{}> = () => {
	const navigation = useNavigation()
	const [
		{ background, margin, flex, column, border },
		{ windowHeight, windowWidth, isGteIpadSize },
	] = useStyles()

	const { titleSize } = useStylesScan()
	const qrScanSize = isGteIpadSize
		? Math.min(windowHeight, windowWidth) * 0.5
		: Math.min(windowHeight * 0.8, windowWidth * 0.8) - 1.25 * titleSize
	const borderRadius = border.radius.scale(30)

	return (
		<View
			style={[
				// not use colors
				background.black,
				margin.horizontal.small,
				column.item.center,
				flex.align.center,
				flex.justify.center,
				borderRadius,
				{
					height: qrScanSize,
					aspectRatio: 1,
				},
			]}
		>
			<QRCodeScanner
				onRead={({ data, type }) => {
					if ((type as string) === 'QR_CODE' || (type as string) === 'org.iso.QRCode') {
						// I would like to use binary mode in QR but this scanner seems to not support it, extended tests were done
						navigation.navigate('ManageDeepLink', { type: 'qr', value: data })
						Vibration.vibrate(1000)
					}
				}}
				cameraProps={{ captureAudio: false }}
				containerStyle={[borderRadius, { width: '100%', height: '100%', overflow: 'hidden' }]}
				cameraStyle={{ width: '100%', height: '100%', aspectRatio: 1 }}
			/>
			<ScanTarget height='75%' width='75%' style={{ position: 'absolute' }} />
		</View>
	)
}

const ScanInfosText: React.FC<ScanInfosTextProps> = ({ textProps }) => {
	const _styles = useStylesScan()
	const [{ row, padding, margin, text }] = useStyles()
	const colors = useThemeColor()

	return (
		<View style={[row.left, padding.horizontal.medium, padding.bottom.medium]}>
			<View
				style={[
					margin.right.medium,
					row.item.justify,
					_styles.styles.infosPoint,
					{ backgroundColor: colors['reverted-main-text'] },
				]}
			/>
			<TextNative
				style={[
					text.bold.small,
					text.size.medium,
					row.item.justify,
					{ fontFamily: 'Open Sans', color: colors['reverted-main-text'] },
				]}
			>
				{textProps}
			</TextNative>
		</View>
	)
}

const DevReferenceInput = () => {
	const [ref, setRef] = useState('')
	const colors = useThemeColor()
	const navigation = useNavigation()
	return (
		<>
			<ScanInfosText textProps='Alternatively, enter the reference below' />
			<TextInput
				value={ref}
				onChangeText={setRef}
				style={{ backgroundColor: colors['input-background'], padding: 8 }}
			/>
			<Button
				title='Submit'
				onPress={() => {
					navigation.navigate('ManageDeepLink', { type: 'link', value: ref })
					Vibration.vibrate(1000)
				}}
			/>
		</>
	)
}

export const Scan: React.FC = () => {
	const [{ flex, padding, margin }, { scaleSize }] = useStyles()
	const colors = useThemeColor()

	return (
		<Layout style={[flex.tiny, { backgroundColor: 'transparent' }]}>
			<StatusBar backgroundColor={colors['secondary-background-header']} barStyle='light-content' />
			<View
				style={[
					padding.medium,
					{
						paddingTop: 16 * scaleSize,
						flexGrow: 2,
						flexBasis: '100%',
						backgroundColor: colors['secondary-background-header'],
					},
				]}
			>
				<ScanBody />
				<View style={[margin.top.medium, padding.medium]}>
					<ScanInfosText textProps='Scanning a QR code sends a contact request' />
					<ScanInfosText textProps='You need to wait for the request to be accepted in order to chat with the contact' />
					{__DEV__ && <DevReferenceInput />}
				</View>
			</View>
		</Layout>
	)
}
